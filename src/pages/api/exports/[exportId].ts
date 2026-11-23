import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, validId } from "../../../lib/api";
import type { Env } from "../../../env";
export const prerender = false;
export const GET: APIRoute = async ({ locals, params }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  const exportId = params.exportId ?? "";
  if (!validId(exportId)) return jsonError("export_not_found", 404);
  const db = (env as Env).DB;
  const item = await db.prepare("SELECT id,book_id,r2_object_key FROM exports WHERE id=? AND owner_id=? AND format='pdf' LIMIT 1")
    .bind(exportId, ownerId).first<{id:string;book_id:string;r2_object_key:string}>();
  if (!item) return jsonError("export_not_found", 404);
  const object = await (env as Env).MEDIA.get(item.r2_object_key);
  if (!object) return jsonError("export_not_found", 404);
  return new Response(object.body, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="arenka-${item.book_id}.pdf"`, "Content-Length": String(object.size), "Cache-Control": "private, no-store", "ETag": object.httpEtag } });
};


