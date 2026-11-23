import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, validId } from "../../../../lib/api";
import type { BookLayout } from "../../../../domain";
import type { Env } from "../../../../env";

export const prerender = false;

type Snapshot = { id: string; position: number; title: string; content: string; revisionId: string; revisionNumber: number };

export const GET: APIRoute = async ({ locals, params }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  const bookId = params.bookId ?? "";
  if (!validId(bookId)) return jsonError("book_not_found", 404);
  const db = (env as Env).DB;
  const book = await db.prepare("SELECT id,title,summary,kind,target_word_count,layout_json,wizard_json FROM books WHERE id=? AND owner_id=? LIMIT 1")
    .bind(bookId, ownerId).first<Record<string, unknown>>();
  if (!book) return jsonError("book_not_found", 404);
  const rows = await db.prepare(
    `SELECT c.id,c.position,c.title,c.approval_status,c.approved_revision_id,r.revision_number,r.content
     FROM chapters c LEFT JOIN chapter_revisions r ON r.id=c.approved_revision_id AND r.chapter_id=c.id AND r.owner_id=c.owner_id
     WHERE c.book_id=? AND c.owner_id=? ORDER BY c.position`,
  ).bind(bookId, ownerId).all<Record<string, unknown>>();
  let wizard: Record<string, Record<string, string>> = {};
  try { wizard = JSON.parse(String(book.wizard_json)) as Record<string, Record<string, string>>; } catch { wizard = {}; }
  const chapters: Snapshot[] = rows.results.filter((row) => row.approval_status === "approved" && typeof row.approved_revision_id === "string")
    .map((row) => ({ id: String(row.id), position: Number(row.position), title: String(row.title), content: String(row.content ?? ""), revisionId: String(row.approved_revision_id), revisionNumber: Number(row.revision_number) }));
  const layout = JSON.parse(String(book.layout_json)) as BookLayout;
  const unchecked = rows.results.filter((row) => row.approval_status !== "approved").length;
  return privateJson({
    book: { id: book.id, title: book.title, summary: book.summary, kind: book.kind, targetWordCount: book.target_word_count,
      layout, cover: { title: wizard.cover?.title || String(book.title), subtitle: wizard.cover?.subtitle || "", author: wizard.cover?.author || "" },
      audience: wizard.details?.audience || "" },
    chapters, checklist: { hasApprovedChapter: chapters.length > 0, hasUncheckedChapters: unchecked > 0, hasCoverAuthor: Boolean(wizard.cover?.author?.trim()), hasContent: chapters.some((chapter) => chapter.content.trim().length > 0) },
  });
};

