import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, readJsonObject, sameOriginMutation, validId } from "../../../../../../../lib/api";
import type { Env } from "../../../../../../../env";

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  const { bookId = "", chapterId = "", revisionId = "" } = params;
  if (![bookId, chapterId, revisionId].every(validId)) return jsonError("revision_not_found", 404);
  const revision = await (env as Env).DB.prepare(
    `SELECT r.id, r.revision_number, r.content,
      CASE WHEN l.revision_id IS NOT NULL THEN 'restore' ELSE r.source END AS source,
      l.restored_from_revision_id, r.created_at
     FROM chapter_revisions r JOIN chapters c ON c.id = r.chapter_id AND c.owner_id = r.owner_id
     LEFT JOIN revision_restore_links l ON l.revision_id = r.id AND l.chapter_id = r.chapter_id AND l.owner_id = r.owner_id
     WHERE c.book_id = ? AND c.id = ? AND c.owner_id = ? AND r.id = ? LIMIT 1`,
  ).bind(bookId, chapterId, ownerId, revisionId).first<{
    id: string;
    revision_number: number;
    content: string;
    source: string;
    restored_from_revision_id: string | null;
    created_at: string;
  }>();
  if (!revision) return jsonError("revision_not_found", 404);
  return privateJson({
    id: revision.id,
    number: revision.revision_number,
    content: revision.content,
    source: revision.source,
    restoredFromRevisionId: revision.restored_from_revision_id,
    createdAt: revision.created_at,
  });
};

export const POST: APIRoute = async ({ locals, params, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const { bookId = "", chapterId = "", revisionId = "" } = params;
  if (![bookId, chapterId, revisionId].every(validId)) return jsonError("revision_not_found", 404);
  const body = await readJsonObject(request);
  if (!body || (body.expectedCurrentRevisionId !== null && typeof body.expectedCurrentRevisionId !== "string")) {
    return jsonError("invalid_request", 400);
  }

  const db = (env as Env).DB;
  const chapter = await db.prepare(
    "SELECT current_revision_id FROM chapters WHERE id = ? AND book_id = ? AND owner_id = ?",
  ).bind(chapterId, bookId, ownerId).first<{ current_revision_id: string | null }>();
  if (!chapter) return jsonError("chapter_not_found", 404);
  if (chapter.current_revision_id !== body.expectedCurrentRevisionId) return jsonError("stale_revision", 409);
  if (chapter.current_revision_id === revisionId) return jsonError("revision_already_current", 409);

  const source = await db.prepare(
    "SELECT content, revision_number FROM chapter_revisions WHERE id = ? AND chapter_id = ? AND owner_id = ?",
  ).bind(revisionId, chapterId, ownerId).first<{ content: string; revision_number: number }>();
  if (!source) return jsonError("revision_not_found", 404);
  const next = await db.prepare(
    "SELECT COALESCE(MAX(revision_number), 0) + 1 AS next FROM chapter_revisions WHERE chapter_id = ? AND owner_id = ?",
  ).bind(chapterId, ownerId).first<{ next: number }>();
  const newRevisionId = crypto.randomUUID();
  const revisionNumber = Number(next?.next ?? 1);
  const now = new Date().toISOString();

  try {
    const result = await db.batch([
      db.prepare("INSERT INTO chapter_revisions (id, owner_id, chapter_id, revision_number, content, source) VALUES (?, ?, ?, ?, ?, 'manual')")
        .bind(newRevisionId, ownerId, chapterId, revisionNumber, source.content),
      db.prepare("INSERT INTO revision_restore_links (revision_id, owner_id, chapter_id, restored_from_revision_id) VALUES (?, ?, ?, ?)")
        .bind(newRevisionId, ownerId, chapterId, revisionId),
      db.prepare("UPDATE chapters SET current_revision_id = ?, approved_revision_id = NULL, approval_status = 'draft', updated_at = ? WHERE id = ? AND book_id = ? AND owner_id = ? AND current_revision_id IS ?")
        .bind(newRevisionId, now, chapterId, bookId, ownerId, body.expectedCurrentRevisionId),
      db.prepare("UPDATE books SET updated_at = ? WHERE id = ? AND owner_id = ?")
        .bind(now, bookId, ownerId),
    ]);
    if (!result[2].meta.changes) {
      await db.prepare("DELETE FROM chapter_revisions WHERE id = ? AND chapter_id = ? AND owner_id = ?")
        .bind(newRevisionId, chapterId, ownerId).run();
      return jsonError("stale_revision", 409);
    }
  } catch {
    return jsonError("revision_restore_conflict", 409);
  }
  return privateJson({ revisionId: newRevisionId, revisionNumber, restoredFromRevisionId: revisionId }, 201);
};



