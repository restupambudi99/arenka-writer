import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, validId } from "../../../../../../../lib/api";
import type { Env } from "../../../../../../../env";

export const prerender = false;

export const GET: APIRoute = async ({ locals, params, url }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  const { bookId = "", chapterId = "" } = params;
  if (!validId(bookId) || !validId(chapterId)) return jsonError("chapter_not_found", 404);
  const db = (env as Env).DB;
  const chapter = await db.prepare(
    "SELECT current_revision_id FROM chapters WHERE id = ? AND book_id = ? AND owner_id = ?",
  ).bind(chapterId, bookId, ownerId).first<{ current_revision_id: string | null }>();
  if (!chapter) return jsonError("chapter_not_found", 404);

  const requestedLimit = Number(url.searchParams.get("limit") ?? 20);
  if (!Number.isInteger(requestedLimit)) return jsonError("invalid_limit", 400);
  const limit = Math.min(Math.max(requestedLimit, 1), 50);
  const rows = await db.prepare(
    `SELECT id, revision_number, source, restored_from_revision_id, created_at, length(content) AS content_length
     FROM chapter_revisions WHERE chapter_id = ? AND owner_id = ?
     ORDER BY revision_number DESC LIMIT ?`,
  ).bind(chapterId, ownerId, limit).all<{
    id: string;
    revision_number: number;
    source: string;
    restored_from_revision_id: string | null;
    created_at: string;
    content_length: number;
  }>();

  return privateJson({
    currentRevisionId: chapter.current_revision_id,
    items: rows.results.map((revision) => ({
      id: revision.id,
      number: revision.revision_number,
      source: revision.source,
      restoredFromRevisionId: revision.restored_from_revision_id,
      createdAt: revision.created_at,
      characterCount: revision.content_length,
    })),
  });
};


