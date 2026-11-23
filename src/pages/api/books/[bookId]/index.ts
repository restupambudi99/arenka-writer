import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, readJsonObject, sameOriginMutation, validId } from "../../../../lib/api";
import type { BookLayout, BookStage } from "../../../../domain";
import type { Env } from "../../../../env";

export const prerender = false;

const stages: BookStage[] = ["blueprint", "outline", "manuscript", "preview"];

export const GET: APIRoute = async ({ locals, params }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  const bookId = params.bookId ?? "";
  if (!validId(bookId)) return jsonError("book_not_found", 404);
  const db = (env as Env).DB;
  const book = await db.prepare(
    `SELECT id, kind, title, summary, target_word_count, stage, archived_at, layout_json, wizard_json, created_at, updated_at
     FROM books WHERE id = ? AND owner_id = ? LIMIT 1`,
  ).bind(bookId, ownerId).first<Record<string, unknown>>();
  if (!book) return jsonError("book_not_found", 404);
  const chapters = await db.prepare(
    `SELECT c.id, c.position, c.title, c.purpose, c.current_revision_id,
      c.approved_revision_id, c.approval_status, c.created_at, c.updated_at,
      r.revision_number, r.content AS current_content
     FROM chapters c LEFT JOIN chapter_revisions r
      ON r.id = c.current_revision_id AND r.chapter_id = c.id AND r.owner_id = c.owner_id
     WHERE c.book_id = ? AND c.owner_id = ? ORDER BY c.position ASC`,
  ).bind(bookId, ownerId).all<Record<string, unknown>>();
  return privateJson({
    book: {
      id: book.id, kind: book.kind, title: book.title, summary: book.summary,
      targetWordCount: book.target_word_count, stage: book.stage, archivedAt: book.archived_at,
      layout: JSON.parse(String(book.layout_json)) as BookLayout,
      wizard: JSON.parse(String(book.wizard_json)) as Record<string, unknown>,
      createdAt: book.created_at, updatedAt: book.updated_at,
    },
    chapters: chapters.results.map((chapter) => ({
      id: chapter.id, position: chapter.position, title: chapter.title, purpose: chapter.purpose,
      approvalStatus: chapter.approval_status, currentRevisionId: chapter.current_revision_id,
      approvedRevisionId: chapter.approved_revision_id,
      revisionNumber: chapter.revision_number ?? null,
      content: chapter.current_content ?? "",
    })),
  });
};

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const bookId = params.bookId ?? "";
  if (!validId(bookId)) return jsonError("book_not_found", 404);
  const body = await readJsonObject(request);
  if (!body) return jsonError("invalid_json", 400);
  const db = (env as Env).DB;
  const assignments: string[] = [];
  const values: (string | number | null)[] = [];

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 160) return jsonError("invalid_title", 400);
    assignments.push("title = ?"); values.push(body.title.trim());
  }
  if (body.summary !== undefined) {
    if (typeof body.summary !== "string" || body.summary.trim().length > 4_000) return jsonError("invalid_summary", 400);
    assignments.push("summary = ?"); values.push(body.summary.trim());
  }
  if (body.kind !== undefined) {
    if (body.kind !== "fiction" && body.kind !== "nonfiction") return jsonError("invalid_kind", 400);
    assignments.push("kind = ?"); values.push(body.kind);
  }
  if (body.voiceProfileId !== undefined || body.voiceProfileVersion !== undefined) {
    if (typeof body.voiceProfileId !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(body.voiceProfileId)
      || !Number.isInteger(body.voiceProfileVersion) || Number(body.voiceProfileVersion) < 1) {
      return jsonError("invalid_voice_profile", 400);
    }
    const profile = await db.prepare(
      `SELECT 1 FROM voice_profiles p WHERE p.id = ? AND p.owner_id = ? AND p.version = ? AND p.status = 'ready'
       AND p.version = (SELECT MAX(latest.version) FROM voice_profiles latest WHERE latest.id = p.id AND latest.owner_id = p.owner_id)
       LIMIT 1`,
    ).bind(body.voiceProfileId, ownerId, body.voiceProfileVersion).first();
    if (!profile) return jsonError("voice_profile_not_found", 404);
    assignments.push("voice_profile_id = ?"); values.push(body.voiceProfileId);
    assignments.push("voice_profile_version = ?"); values.push(Number(body.voiceProfileVersion));
  }
  if (body.targetWordCount !== undefined) {
    if (!Number.isInteger(body.targetWordCount) || Number(body.targetWordCount) < 500 || Number(body.targetWordCount) > 1_000_000) return jsonError("invalid_target_word_count", 400);
    assignments.push("target_word_count = ?"); values.push(Number(body.targetWordCount));
  }
  if (body.stage !== undefined) {
    if (!stages.includes(body.stage as BookStage)) return jsonError("invalid_stage", 400);
    assignments.push("stage = ?"); values.push(body.stage as string);
  }
  if (body.archived !== undefined) {
    if (typeof body.archived !== "boolean") return jsonError("invalid_archived", 400);
    assignments.push("archived_at = ?"); values.push(body.archived ? new Date().toISOString() : null);
  }
  if (body.layout !== undefined) {
    if (!body.layout || typeof body.layout !== "object" || Array.isArray(body.layout)) return jsonError("invalid_layout", 400);
    const layout = body.layout as Record<string, unknown>;
    const pageSizes = ["A4", "A5", "B5", "B6", "custom"];
    const valid = pageSizes.includes(String(layout.pageSize))
      && ["portrait", "landscape"].includes(String(layout.orientation))
      && typeof layout.bodyFont === "string" && layout.bodyFont.length <= 80
      && typeof layout.headingFont === "string" && layout.headingFont.length <= 80
      && Number.isFinite(layout.bodyFontSizePt) && Number(layout.bodyFontSizePt) >= 8 && Number(layout.bodyFontSizePt) <= 24
      && ["none", "arabic", "roman_front_matter"].includes(String(layout.pageNumberStyle))
      && ["none", "labeled", "digits", "dotted_leader"].includes(String(layout.tableOfContentsStyle));
    if (!valid) return jsonError("invalid_layout", 400);
    if (layout.pageSize === "custom" && (
      !Number.isFinite(layout.customWidthMm) || Number(layout.customWidthMm) < 80 || Number(layout.customWidthMm) > 500
      || !Number.isFinite(layout.customHeightMm) || Number(layout.customHeightMm) < 100 || Number(layout.customHeightMm) > 700
    )) return jsonError("invalid_custom_page_size", 400);
    assignments.push("layout_json = ?"); values.push(JSON.stringify(layout as unknown as BookLayout));
  }
  if (body.wizard !== undefined) {
    if (!body.wizard || typeof body.wizard !== "object" || Array.isArray(body.wizard)) return jsonError("invalid_wizard", 400);
    const wizard = body.wizard as Record<string, unknown>;
    const allowedSections = ["dna", "details", "cover"];
    if (Object.keys(wizard).some((section) => !allowedSections.includes(section))) return jsonError("invalid_wizard", 400);
    for (const section of Object.values(wizard)) {
      if (!section || typeof section !== "object" || Array.isArray(section)) return jsonError("invalid_wizard", 400);
      const fields = Object.values(section as Record<string, unknown>);
      if (fields.some((value) => typeof value !== "string" || value.length > 5_000)) return jsonError("invalid_wizard", 400);
    }
    const existing = await db.prepare(
      "SELECT wizard_json FROM books WHERE id = ? AND owner_id = ? LIMIT 1",
    ).bind(bookId, ownerId).first<{ wizard_json: string }>();
    if (!existing) return jsonError("book_not_found", 404);
    let storedWizard: Record<string, unknown> = {};
    try { storedWizard = JSON.parse(existing.wizard_json) as Record<string, unknown>; } catch { storedWizard = {}; }
    const serialized = JSON.stringify({ ...storedWizard, ...wizard });
    if (serialized.length > 20_000) return jsonError("invalid_wizard", 400);
    assignments.push("wizard_json = ?"); values.push(serialized);
  }
  if (assignments.length === 0) return jsonError("no_changes", 400);
  assignments.push("updated_at = CURRENT_TIMESTAMP");
  const result = await db.prepare(
    `UPDATE books SET ${assignments.join(", ")} WHERE id = ? AND owner_id = ?`,
  ).bind(...values, bookId, ownerId).run();
  if (!result.meta.changes) return jsonError("book_not_found", 404);
  return privateJson({ ok: true });
};


