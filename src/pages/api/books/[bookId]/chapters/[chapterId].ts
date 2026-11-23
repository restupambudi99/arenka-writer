import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, readJsonObject, sameOriginMutation, validId } from "../../../../../lib/api";
import type { Env } from "../../../../../env";

export const prerender = false;

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const bookId = params.bookId ?? "";
  const chapterId = params.chapterId ?? "";
  if (!validId(bookId) || !validId(chapterId)) return jsonError("chapter_not_found", 404);
  const body = await readJsonObject(request);
  if (!body) return jsonError("invalid_json", 400);
  const fields: string[] = [];
  const values: (string | number)[] = [];
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 200) return jsonError("invalid_title", 400);
    fields.push("title = ?"); values.push(body.title.trim());
  }
  if (body.purpose !== undefined) {
    if (typeof body.purpose !== "string" || body.purpose.trim().length > 2_000) return jsonError("invalid_purpose", 400);
    fields.push("purpose = ?"); values.push(body.purpose.trim());
  }
  if (body.position !== undefined) {
    if (!Number.isInteger(body.position) || Number(body.position) < 0 || Number(body.position) > 10_000) return jsonError("invalid_position", 400);
    fields.push("position = ?"); values.push(Number(body.position));
  }
  if (fields.length === 0) return jsonError("no_changes", 400);
  fields.push("updated_at = CURRENT_TIMESTAMP");
  try {
    const result = await (env as Env).DB.prepare(
      `UPDATE chapters SET ${fields.join(", ")} WHERE id = ? AND book_id = ? AND owner_id = ?`,
    ).bind(...values, chapterId, bookId, ownerId).run();
    if (!result.meta.changes) return jsonError("chapter_not_found", 404);
  } catch {
    return jsonError("chapter_update_conflict", 409);
  }
  return privateJson({ ok: true });
};

export const PUT: APIRoute = async ({ locals, params, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const bookId = params.bookId ?? "";
  const chapterId = params.chapterId ?? "";
  if (!validId(bookId) || !validId(chapterId)) return jsonError("chapter_not_found", 404);
  const body = await readJsonObject(request);
  if (!body) return jsonError("invalid_json", 400);
  if (typeof body.content !== "string" || body.content.length > 200_000) return jsonError("invalid_content", 400);
  if (body.expectedCurrentRevisionId !== null && typeof body.expectedCurrentRevisionId !== "string") {
    return jsonError("invalid_revision_cursor", 400);
  }
  const db = (env as Env).DB;
  const chapter = await db.prepare(
    "SELECT id, current_revision_id FROM chapters WHERE id = ? AND book_id = ? AND owner_id = ?",
  ).bind(chapterId, bookId, ownerId).first<{ id: string; current_revision_id: string | null }>();
  if (!chapter) return jsonError("chapter_not_found", 404);
  if (chapter.current_revision_id !== body.expectedCurrentRevisionId) return jsonError("stale_revision", 409);
  const revisionNumber = await db.prepare(
    "SELECT COALESCE(MAX(revision_number), 0) + 1 AS next FROM chapter_revisions WHERE chapter_id = ? AND owner_id = ?",
  ).bind(chapterId, ownerId).first<{ next: number }>();
  const revisionId = crypto.randomUUID();
  const now = new Date().toISOString();
  try {
    const batch = await db.batch([
      db.prepare("INSERT INTO chapter_revisions (id, owner_id, chapter_id, revision_number, content, source) VALUES (?, ?, ?, ?, ?, 'manual')")
        .bind(revisionId, ownerId, chapterId, Number(revisionNumber?.next ?? 1), body.content),
      db.prepare("UPDATE chapters SET current_revision_id = ?, approved_revision_id = NULL, approval_status = 'draft', updated_at = ? WHERE id = ? AND book_id = ? AND owner_id = ? AND current_revision_id IS ?")
        .bind(revisionId, now, chapterId, bookId, ownerId, body.expectedCurrentRevisionId),
      db.prepare("UPDATE books SET updated_at = ? WHERE id = ? AND owner_id = ?")
        .bind(now, bookId, ownerId),
    ]);
    if (!batch[1].meta.changes) {
      await db.prepare("DELETE FROM chapter_revisions WHERE id = ? AND chapter_id = ? AND owner_id = ?")
        .bind(revisionId, chapterId, ownerId).run();
      return jsonError("stale_revision", 409);
    }
  } catch {
    return jsonError("revision_save_conflict", 409);
  }
  return privateJson({ revisionId, revisionNumber: Number(revisionNumber?.next ?? 1) }, 201);
};

