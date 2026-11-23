import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, readJsonObject, sameOriginMutation, validId } from "../../../../lib/api";
import type { Env } from "../../../../env";

export const prerender = false;

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const bookId = params.bookId ?? "";
  if (!validId(bookId)) return jsonError("book_not_found", 404);
  const body = await readJsonObject(request);
  if (!body || typeof body.archived !== "boolean") return jsonError("invalid_archived", 400);
  const result = await (env as Env).DB.prepare(
    "UPDATE books SET archived_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND owner_id = ?",
  ).bind(body.archived ? new Date().toISOString() : null, bookId, ownerId).run();
  if (!result.meta.changes) return jsonError("book_not_found", 404);
  return privateJson({ ok: true, archived: body.archived });
};

