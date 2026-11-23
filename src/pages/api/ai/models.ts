import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authenticatedOwner, jsonError } from "../../../lib/api";
import { requestModelCatalog } from "../../../ai";
import type { Env } from "../../../env";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!authenticatedOwner(locals)) return jsonError("not_authenticated", 401);

  try {
    const upstream = await requestModelCatalog(env as Env);
    if (!upstream.ok) {
      return jsonError("model_catalog_unavailable", 502);
    }
    const payload = (await upstream.json()) as { data?: Array<{ id?: unknown }> };
    const models = Array.isArray(payload.data)
      ? payload.data.flatMap((model) =>
          typeof model.id === "string" && model.id.trim() ? [model.id] : [],
        )
      : [];
    return Response.json({ models }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return jsonError("model_catalog_unavailable", 502);
  }
};

