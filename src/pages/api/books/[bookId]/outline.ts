import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, readJsonObject, sameOriginMutation, validId } from "../../../../lib/api";
import type { Env } from "../../../../env";

export const prerender = false;

type OutlineSection = { title: string; purpose: string };
type OutlineChapter = { id: string; title: string; purpose: string; sections: OutlineSection[] };

function parseOutline(value: unknown): OutlineChapter[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;
  const seen = new Set<string>();
  const chapters: OutlineChapter[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const chapter = item as Record<string, unknown>;
    if (typeof chapter.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(chapter.id)
      || seen.has(chapter.id) || typeof chapter.title !== "string" || !chapter.title.trim()
      || chapter.title.trim().length > 200 || typeof chapter.purpose !== "string" || chapter.purpose.length > 2_000
      || !Array.isArray(chapter.sections) || chapter.sections.length > 30) return null;
    seen.add(chapter.id);
    const sections: OutlineSection[] = [];
    for (const itemSection of chapter.sections) {
      if (!itemSection || typeof itemSection !== "object" || Array.isArray(itemSection)) return null;
      const section = itemSection as Record<string, unknown>;
      if (typeof section.title !== "string" || !section.title.trim() || section.title.trim().length > 200
        || typeof section.purpose !== "string" || section.purpose.length > 1_000) return null;
      sections.push({ title: section.title.trim(), purpose: section.purpose.trim() });
    }
    chapters.push({ id: chapter.id, title: chapter.title.trim(), purpose: chapter.purpose.trim(), sections });
  }
  return chapters;
}

export const GET: APIRoute = async ({ locals, params }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  const bookId = params.bookId ?? "";
  if (!validId(bookId)) return jsonError("book_not_found", 404);
  const db = (env as Env).DB;
  const book = await db.prepare("SELECT id FROM books WHERE id = ? AND owner_id = ? LIMIT 1")
    .bind(bookId, ownerId).first();
  if (!book) return jsonError("book_not_found", 404);
  const current = await db.prepare(
    "SELECT id, version, outline_json, created_at FROM book_outlines WHERE book_id = ? AND owner_id = ? ORDER BY version DESC LIMIT 1",
  ).bind(bookId, ownerId).first<{ id: string; version: number; outline_json: string; created_at: string }>();
  const history = await db.prepare(
    "SELECT id, version, created_at FROM book_outlines WHERE book_id = ? AND owner_id = ? ORDER BY version DESC LIMIT 20",
  ).bind(bookId, ownerId).all<{ id: string; version: number; created_at: string }>();
  return privateJson({
    outline: current ? JSON.parse(current.outline_json) as OutlineChapter[] : [],
    version: current?.version ?? 0,
    history: history.results.map((entry) => ({ id: entry.id, version: entry.version, createdAt: entry.created_at })),
  });
};

export const PUT: APIRoute = async ({ locals, params, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const bookId = params.bookId ?? "";
  if (!validId(bookId)) return jsonError("book_not_found", 404);
  const body = await readJsonObject(request);
  if (!body) return jsonError("invalid_json", 400);
  if (!Number.isInteger(body.expectedVersion) || Number(body.expectedVersion) < 0) return jsonError("invalid_outline_cursor", 400);
  const outline = parseOutline(body.outline);
  if (!outline || !outline.length) return jsonError("invalid_outline", 400);
  const db = (env as Env).DB;
  const book = await db.prepare("SELECT id FROM books WHERE id = ? AND owner_id = ? AND archived_at IS NULL LIMIT 1")
    .bind(bookId, ownerId).first();
  if (!book) return jsonError("book_not_found", 404);
  const latest = await db.prepare(
    "SELECT id, version FROM book_outlines WHERE book_id = ? AND owner_id = ? ORDER BY version DESC LIMIT 1",
  ).bind(bookId, ownerId).first<{ id: string; version: number }>();
  const actualVersion = Number(latest?.version ?? 0);
  if (actualVersion !== Number(body.expectedVersion)) return jsonError("stale_outline", 409);
  const version = actualVersion + 1;
  const id = crypto.randomUUID();
  try {
    const batch = await db.batch([
      db.prepare("INSERT INTO book_outlines (id, owner_id, book_id, version, outline_json) VALUES (?, ?, ?, ?, ?)")
        .bind(id, ownerId, bookId, version, JSON.stringify(outline)),
      db.prepare("UPDATE books SET stage = 'outline', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND owner_id = ?")
        .bind(bookId, ownerId),
    ]);
    if (!batch[0].meta.changes) return jsonError("outline_save_conflict", 409);
  } catch {
    return jsonError("outline_save_conflict", 409);
  }
  return privateJson({ id, version }, 201);
};

