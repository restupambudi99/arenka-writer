import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, sameOriginMutation, validId } from "../../../../lib/api";
import { createBookPdf } from "../../../../lib/pdf";
import type { BookLayout } from "../../../../domain";
import type { Env } from "../../../../env";

export const prerender = false;

export const POST: APIRoute = async ({ locals, params, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const bookId = params.bookId ?? "";
  if (!validId(bookId)) return jsonError("book_not_found", 404);
  const db = (env as Env).DB;
  const book = await db.prepare(
    "SELECT id,title,summary,kind,layout_json,wizard_json FROM books WHERE id=? AND owner_id=? AND archived_at IS NULL LIMIT 1",
  ).bind(bookId, ownerId).first<Record<string, unknown>>();
  if (!book) return jsonError("book_not_found", 404);
  const rows = await db.prepare(
    `SELECT c.id,c.position,c.title,c.approval_status,c.approved_revision_id,r.content,r.revision_number
     FROM chapters c LEFT JOIN chapter_revisions r ON r.id=c.approved_revision_id AND r.chapter_id=c.id AND r.owner_id=c.owner_id
     WHERE c.book_id=? AND c.owner_id=? ORDER BY c.position`,
  ).bind(bookId, ownerId).all<Record<string, unknown>>();
  if (!rows.results.length) return jsonError("no_chapters", 409);
  if (rows.results.length > 100) return jsonError("export_too_large", 413);
  const unapproved = rows.results.filter((row) => row.approval_status !== "approved" || !row.approved_revision_id);
  if (unapproved.length) return jsonError("chapters_require_approval", 409);
  const chapters = rows.results.map((row) => ({ title: String(row.title), content: String(row.content ?? "") }));
  if (chapters.reduce((total, chapter) => total + chapter.title.length + chapter.content.length, 0) > 2_000_000) {
    return jsonError("export_too_large", 413);
  }
  if (!chapters.some((chapter) => chapter.content.trim())) return jsonError("no_chapter_content", 409);
  let wizard: Record<string, Record<string, string>> = {};
  try { wizard = JSON.parse(String(book.wizard_json)) as Record<string, Record<string, string>>; } catch { wizard = {}; }
  const layout = JSON.parse(String(book.layout_json)) as BookLayout;
  const pdf = createBookPdf({ title: wizard.cover?.title || String(book.title), subtitle: wizard.cover?.subtitle || "",
    author: wizard.cover?.author || "", summary: String(book.summary ?? ""), chapters, pageSize: layout.pageSize,
    orientation: layout.orientation, fontSize: layout.bodyFontSizePt, pageNumbers: layout.pageNumberStyle,
    customWidthMm: layout.customWidthMm, customHeightMm: layout.customHeightMm });
  const exportId = crypto.randomUUID();
  const key = `exports/${ownerId}/${bookId}/${exportId}.pdf`;
  try {
    await (env as Env).MEDIA.put(key, pdf, { httpMetadata: { contentType: "application/pdf", cacheControl: "private, no-store" }, customMetadata: { ownerId, bookId, exportId } });
    await db.prepare("INSERT INTO exports (id,owner_id,book_id,format,source_revision_ids_json,r2_object_key) VALUES (?,?,?,'pdf',?,?)")
      .bind(exportId, ownerId, bookId, JSON.stringify(rows.results.map((row) => row.approved_revision_id)), key).run();
  } catch {
    await (env as Env).MEDIA.delete(key).catch(() => undefined);
    return jsonError("export_failed", 500);
  }
  const filename = `${String(book.title).replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-|-$/g, "") || "arenka-book"}.pdf`;
  return new Response(pdf as unknown as BodyInit, { status: 200, headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`, "Content-Length": String(pdf.byteLength), "Cache-Control": "private, no-store", "X-Export-Id": exportId } });
};

