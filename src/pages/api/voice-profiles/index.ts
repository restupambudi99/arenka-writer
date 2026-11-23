import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError, privateJson, readJsonObject, sameOriginMutation } from "../../../lib/api";
import type { Env } from "../../../env";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  const result = await (env as Env).DB.prepare(
    `SELECT p.id, p.version, p.name FROM voice_profiles p
     WHERE p.owner_id = ? AND p.status = 'ready'
       AND p.version = (SELECT MAX(latest.version) FROM voice_profiles latest WHERE latest.id = p.id AND latest.owner_id = p.owner_id)
     ORDER BY p.created_at DESC LIMIT 100`,
  ).bind(ownerId).all<{ id: string; version: number; name: string }>();
  return privateJson({ items: result.results.map((profile) => ({
    id: profile.id, version: profile.version, name: profile.name,
  })) });
};

export const POST: APIRoute = async ({ locals, request }) => {
  const ownerId = authenticatedOwner(locals);
  if (!ownerId) return jsonError("not_authenticated", 401);
  if (!sameOriginMutation(request)) return jsonError("invalid_origin", 403);
  const body = await readJsonObject(request);
  if (!body) return jsonError("invalid_json", 400);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!name || name.length > 100 || !description || description.length > 5_000) {
    return jsonError("invalid_profile", 400);
  }
  const id = crypto.randomUUID();
  try {
    await (env as Env).DB.prepare(
      "INSERT INTO voice_profiles (id, owner_id, version, name, status, profile_json) VALUES (?, ?, 1, ?, 'ready', ?)",
    ).bind(id, ownerId, name, JSON.stringify({ description })).run();
  } catch {
    return jsonError("profile_create_failed", 500);
  }
  return privateJson({ profile: { id, version: 1, name } }, 201);
};

