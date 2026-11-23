import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, readJsonObject, sameOriginMutation } from "../../../lib/api";
import type { BookLayout, BookKind } from "../../../domain";
import type { Env } from "../../../env";

export const prerender = false;

const defaultLayout: BookLayout = {
  pageSize: "A5",
  orientation: "portrait",
  bodyFont: "serif",
  bodyFontSizePt: 11,
  headingFont: "serif",
  pageNumberStyle: "arabic",
  tableOfContentsStyle: "dotted_leader",
};

export const GET: APIRoute = async ({ locals, url }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  const status = url.searchParams.get("status") ?? "active";
  if (status !== "active" && status !== "archived" && status !== "all") {
    return jsonError("invalid_status", 400);
  }
  const query = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const pageSize = 25;
  const cursor = url.searchParams.get("cursor");
  const db = (env as Env).DB;
  const clauses = ["owner_id = ?"];
  const bindings: (string | number)[] = [ownerId];
  if (status === "active") clauses.push("archived_at IS NULL");
  if (status === "archived") clauses.push("archived_at IS NOT NULL");
  if (query) {
    clauses.push("instr(lower(title), lower(?)) > 0");
    bindings.push(query);
  }
  if (cursor) {
    const [cursorTime, cursorId] = cursor.split("|", 2);
    if (!cursorTime || !cursorId || cursor.length > 160) return jsonError("invalid_cursor", 400);
    clauses.push("(updated_at < ? OR (updated_at = ? AND id < ?))");
    bindings.push(cursorTime, cursorTime, cursorId);
  }
  const rows = await db.prepare(
    `SELECT id, kind, title, summary, target_word_count, stage, archived_at, layout_json, created_at, updated_at
     FROM books WHERE ${clauses.join(" AND ")} ORDER BY updated_at DESC, id DESC LIMIT ?`,
  ).bind(...bindings, pageSize + 1).all<Record<string, unknown>>();
  const items = rows.results.slice(0, pageSize).map((row) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    summary: row.summary,
    targetWordCount: row.target_word_count,
    stage: row.stage,
    archivedAt: row.archived_at,
    layout: JSON.parse(String(row.layout_json)) as BookLayout,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
  const last = rows.results.length > pageSize ? rows.results[pageSize - 1] : null;
  return privateJson({
    items,
    nextCursor: last ? `${last.updated_at}|${last.id}` : null,
  });
};

export const POST: APIRoute = async ({ locals, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const body = await readJsonObject(request);
  if (!body) return jsonError("invalid_json", 400);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";
  const kind = body.kind;
  const voiceProfileId = body.voiceProfileId;
  const voiceProfileVersion = body.voiceProfileVersion;
  const targetWordCount = body.targetWordCount ?? 30_000;
  if (!title || title.length > 160 || summary.length > 4_000) return jsonError("invalid_book_details", 400);
  if (kind !== "fiction" && kind !== "nonfiction") return jsonError("invalid_kind", 400);
  if (typeof voiceProfileId !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(voiceProfileId)) {
    return jsonError("invalid_voice_profile", 400);
  }
  if (!Number.isInteger(voiceProfileVersion) || Number(voiceProfileVersion) < 1) {
    return jsonError("invalid_voice_profile_version", 400);
  }
  if (!Number.isInteger(targetWordCount) || Number(targetWordCount) < 500 || Number(targetWordCount) > 1_000_000) {
    return jsonError("invalid_target_word_count", 400);
  }
  const requestedLayout = body.layout;
  let layout = defaultLayout;
  if (requestedLayout !== undefined) {
    if (!requestedLayout || typeof requestedLayout !== "object" || Array.isArray(requestedLayout)) {
      return jsonError("invalid_layout", 400);
    }
    const candidate = requestedLayout as Record<string, unknown>;
    const validPageSize = ["A4", "A5", "B5", "B6", "custom"].includes(String(candidate.pageSize));
    const validOrientation = candidate.orientation === "portrait" || candidate.orientation === "landscape";
    const validBodySize = Number.isFinite(candidate.bodyFontSizePt) && Number(candidate.bodyFontSizePt) >= 8 && Number(candidate.bodyFontSizePt) <= 24;
    const validStyles = ["none", "arabic", "roman_front_matter"].includes(String(candidate.pageNumberStyle))
      && ["none", "labeled", "digits", "dotted_leader"].includes(String(candidate.tableOfContentsStyle));
    if (!validPageSize || !validOrientation || !validBodySize || !validStyles
      || typeof candidate.bodyFont !== "string" || candidate.bodyFont.length > 80
      || typeof candidate.headingFont !== "string" || candidate.headingFont.length > 80) {
      return jsonError("invalid_layout", 400);
    }
    if (candidate.pageSize === "custom"
      && (!Number.isFinite(candidate.customWidthMm) || Number(candidate.customWidthMm) < 80 || Number(candidate.customWidthMm) > 500
        || !Number.isFinite(candidate.customHeightMm) || Number(candidate.customHeightMm) < 100 || Number(candidate.customHeightMm) > 700)) {
      return jsonError("invalid_custom_page_size", 400);
    }
    layout = {
      pageSize: candidate.pageSize as BookLayout["pageSize"],
      orientation: candidate.orientation as BookLayout["orientation"],
      bodyFont: candidate.bodyFont,
      bodyFontSizePt: Number(candidate.bodyFontSizePt),
      headingFont: candidate.headingFont,
      pageNumberStyle: candidate.pageNumberStyle as BookLayout["pageNumberStyle"],
      tableOfContentsStyle: candidate.tableOfContentsStyle as BookLayout["tableOfContentsStyle"],
      ...(candidate.pageSize === "custom" ? {
        customWidthMm: Number(candidate.customWidthMm),
        customHeightMm: Number(candidate.customHeightMm),
      } : {}),
    };
  }

  const database = (env as Env).DB;
  const profile = await database.prepare(
    `SELECT 1 FROM voice_profiles p WHERE p.id = ? AND p.owner_id = ? AND p.version = ? AND p.status = 'ready'
     AND p.version = (SELECT MAX(latest.version) FROM voice_profiles latest WHERE latest.id = p.id AND latest.owner_id = p.owner_id)
     LIMIT 1`,
  ).bind(voiceProfileId, ownerId, voiceProfileVersion).first();
  if (!profile) return jsonError("voice_profile_not_found", 404);
  const id = crypto.randomUUID();
  try {
    await database.prepare(
      `INSERT INTO books (id, owner_id, voice_profile_id, voice_profile_version, kind, title, summary,
       target_word_count, stage, layout_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'blueprint', ?)`,
    ).bind(id, ownerId, voiceProfileId, voiceProfileVersion, kind as BookKind, title, summary,
      Number(targetWordCount), JSON.stringify(layout)).run();
  } catch {
    return jsonError("book_create_failed", 500);
  }
  return privateJson({
    book: { id, kind, title, summary, targetWordCount: Number(targetWordCount), stage: "blueprint", layout },
  }, 201);
};

