import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, readJsonObject, sameOriginMutation, validId } from "../../../../../lib/api";
import type { Env } from "../../../../../env";

export const prerender = false;

export const PUT: APIRoute = async ({ locals, params, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const bookId = params.bookId ?? "";
  if (!validId(bookId)) return jsonError("book_not_found", 404);
  const body = await readJsonObject(request);
  if (!body || !Array.isArray(body.chapterIds) || body.chapterIds.length > 1_000) {
    return jsonError("invalid_order", 400);
  }
  const chapterIds = body.chapterIds;
  if (!chapterIds.every((id) => typeof id === "string" && validId(id))
    || new Set(chapterIds).size !== chapterIds.length) {
    return jsonError("invalid_order", 400);
  }

  const db = (env as Env).DB;
  const existing = await db.prepare(
    "SELECT id, position FROM chapters WHERE book_id = ? AND owner_id = ? ORDER BY position ASC",
  ).bind(bookId, ownerId).all<{ id: string; position: number }>();
  if (existing.results.length !== chapterIds.length
    || existing.results.some((chapter) => !chapterIds.includes(chapter.id))) {
    return jsonError("chapter_list_changed", 409);
  }
  if (chapterIds.length < 2) return privateJson({ ok: true, chapterIds });

  const highestPosition = existing.results.reduce((max, chapter) => Math.max(max, chapter.position), -1);
  const temporaryOffset = highestPosition + existing.results.length + 1;
  try {
    const statements = [
      db.prepare("UPDATE chapters SET position = position + ? WHERE book_id = ? AND owner_id = ?")
        .bind(temporaryOffset, bookId, ownerId),
      ...chapterIds.map((id, position) => db.prepare(
        "UPDATE chapters SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND book_id = ? AND owner_id = ?",
      ).bind(position, id, bookId, ownerId)),
      db.prepare("UPDATE books SET updated_at = CURRENT_TIMESTAMP WHERE id = ? AND owner_id = ?")
        .bind(bookId, ownerId),
    ];
    const results = await db.batch(statements);
    if (results.slice(1, -1).some((result) => result.meta.changes !== 1)) {
      return jsonError("chapter_list_changed", 409);
    }
  } catch {
    return jsonError("chapter_order_conflict", 409);
  }
  return privateJson({ ok: true, chapterIds });
};

