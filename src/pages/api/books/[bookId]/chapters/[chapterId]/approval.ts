import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, readJsonObject, sameOriginMutation, validId } from "../../../../../../lib/api";
import type { Env } from "../../../../../../env";

export const prerender = false;

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const { bookId = "", chapterId = "" } = params;
  if (!validId(bookId) || !validId(chapterId)) return jsonError("chapter_not_found", 404);
  const body = await readJsonObject(request);
  if (!body || (body.status !== "draft" && body.status !== "approved")) return jsonError("invalid_approval_status", 400);
  const db = (env as Env).DB;
  const chapter = await db.prepare(
    `SELECT c.current_revision_id FROM chapters c JOIN books b ON b.id = c.book_id AND b.owner_id = c.owner_id
     WHERE c.id = ? AND c.book_id = ? AND c.owner_id = ? AND b.archived_at IS NULL LIMIT 1`,
  ).bind(chapterId, bookId, ownerId).first<{ current_revision_id: string | null }>();
  if (!chapter) return jsonError("chapter_not_found", 404);
  if (body.status === "approved" && !chapter.current_revision_id) return jsonError("chapter_has_no_revision", 409);
  const revisionId = body.status === "approved" ? chapter.current_revision_id : null;
  const result = await db.prepare(
    `UPDATE chapters SET approval_status = ?, approved_revision_id = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND book_id = ? AND owner_id = ? AND current_revision_id IS ?`,
  ).bind(body.status, revisionId, chapterId, bookId, ownerId, chapter.current_revision_id).run();
  if (!result.meta.changes) return jsonError("approval_conflict", 409);
  return privateJson({ status: body.status, approvedRevisionId: revisionId });
};

