import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, readJsonObject, sameOriginMutation, validId } from "../../../lib/api";
import type { Env } from "../../../env";

export const prerender = false;

interface ProfileRow {
  id: string;
  version: number;
  name: string;
  status: string;
  profile_json: string;
  created_at: string;
}

function profileDescription(json: string): string {
  try {
    const data: unknown = JSON.parse(json);
    if (data && typeof data === "object" && "description" in data
      && typeof (data as { description?: unknown }).description === "string") {
      return (data as { description: string }).description;
    }
  } catch { /* malformed legacy data renders as empty */ }
  return "";
}

export const GET: APIRoute = async ({ locals, params, url }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  const profileId = params.profileId ?? "";
  if (!validId(profileId)) return jsonError("profile_not_found", 404);
  const db = (env as Env).DB;
  const latest = await db.prepare(
    "SELECT MAX(version) AS version FROM voice_profiles WHERE id = ? AND owner_id = ?",
  ).bind(profileId, ownerId).first<{ version: number | null }>();
  if (!latest?.version) return jsonError("profile_not_found", 404);
  const requestedVersion = url.searchParams.get("version");
  const version = requestedVersion === null ? latest.version : Number(requestedVersion);
  if (!Number.isInteger(version) || version < 1 || version > latest.version) return jsonError("invalid_version", 400);
  const row = await db.prepare(
    "SELECT id, version, name, status, profile_json, created_at FROM voice_profiles WHERE id = ? AND owner_id = ? AND version = ? LIMIT 1",
  ).bind(profileId, ownerId, version).first<ProfileRow>();
  if (!row) return jsonError("profile_not_found", 404);
  const versions = await db.prepare(
    `SELECT p.version, p.status, p.created_at,
      (SELECT COUNT(*) FROM books b WHERE b.voice_profile_id = p.id AND b.voice_profile_version = p.version AND b.owner_id = p.owner_id) AS book_count
     FROM voice_profiles p WHERE p.id = ? AND p.owner_id = ? ORDER BY p.version DESC LIMIT 100`,
  ).bind(profileId, ownerId).all<{ version: number; status: string; created_at: string; book_count: number }>();
  return privateJson({
    profile: { id: row.id, version: row.version, name: row.name, description: profileDescription(row.profile_json), status: row.status, createdAt: row.created_at },
    latestVersion: latest.version,
    versions: versions.results.map((item) => ({ version: item.version, status: item.status, createdAt: item.created_at, bookCount: item.book_count })),
  });
};

export const PUT: APIRoute = async ({ locals, params, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const profileId = params.profileId ?? "";
  if (!validId(profileId)) return jsonError("profile_not_found", 404);
  const body = await readJsonObject(request);
  if (!body) return jsonError("invalid_json", 400);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!name || name.length > 100 || !description || description.length > 5_000) return jsonError("invalid_profile", 400);
  if (!Number.isInteger(body.expectedVersion) || Number(body.expectedVersion) < 1) return jsonError("invalid_version", 400);

  const db = (env as Env).DB;
  const latest = await db.prepare(
    "SELECT version FROM voice_profiles WHERE id = ? AND owner_id = ? ORDER BY version DESC LIMIT 1",
  ).bind(profileId, ownerId).first<{ version: number }>();
  if (!latest) return jsonError("profile_not_found", 404);
  if (latest.version !== Number(body.expectedVersion)) return jsonError("stale_profile", 409);
  const active = await db.prepare(
    "SELECT status FROM voice_profiles WHERE id = ? AND owner_id = ? AND version = ?",
  ).bind(profileId, ownerId, latest.version).first<{ status: string }>();
  if (active?.status !== "ready") return jsonError("profile_not_editable", 409);
  try {
    await db.prepare(
      "INSERT INTO voice_profiles (id, owner_id, version, name, status, profile_json) VALUES (?, ?, ?, ?, 'ready', ?)",
    ).bind(profileId, ownerId, latest.version + 1, name, JSON.stringify({ description })).run();
  } catch {
    return jsonError("stale_profile", 409);
  }
  return privateJson({ profile: { id: profileId, version: latest.version + 1, name } }, 201);
};

