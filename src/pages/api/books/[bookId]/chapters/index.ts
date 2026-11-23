import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, readJsonObject, sameOriginMutation, validId } from "../../../../../lib/api";
import type { Env } from "../../../../../env";

export const prerender = false;

export const POST: APIRoute = async ({ locals, params, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const bookId = params.bookId ?? "";
  if (!validId(bookId)) return jsonError("book_not_found", 404);
  const body = await readJsonObject(request);
  if (!body) return jsonError("invalid_json", 400);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const purpose = typeof body.purpose === "string" ? body.purpose.trim() : "";
  if (!title || title.length > 200 || purpose.length > 2_000) return jsonError("invalid_chapter_details", 400);
  const db = (env as Env).DB;
  const book = await db.prepare("SELECT id FROM books WHERE id = ? AND owner_id = ? AND archived_at IS NULL")
    .bind(bookId, ownerId).first();
  if (!book) return jsonError("book_not_found", 404);
  const positionRow = await db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS next FROM chapters WHERE book_id = ? AND owner_id = ?")
    .bind(bookId, ownerId).first<{ next: number }>();
  const position = Number(positionRow?.next ?? 0);
  if (position < 0 || position > 10_000) return jsonError("invalid_position", 400);
  const id = crypto.randomUUID();
  try {
    await db.prepare("INSERT INTO chapters (id, owner_id, book_id, position, title, purpose) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(id, ownerId, bookId, position, title, purpose).run();
  } catch {
    return jsonError("chapter_create_failed", 409);
  }
  return privateJson({ chapter: { id, bookId, position, title, purpose, approvalStatus: "draft", content: "" } }, 201);
};

