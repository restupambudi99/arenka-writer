import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requestModelCatalog } from "../../../ai";
import type { Env } from "../../../env";

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user?.id) {
    return Response.json({ error: "not_authenticated" }, { status: 401 });
  }

  try {
    const upstream = await requestModelCatalog(env as Env);
    if (!upstream.ok) {
      return Response.json({ error: "model_catalog_unavailable" }, { status: 502 });
    }
    const payload = (await upstream.json()) as { data?: Array<{ id?: unknown }> };
    const models = Array.isArray(payload.data)
      ? payload.data.flatMap((model) =>
          typeof model.id === "string" && model.id.trim() ? [model.id] : [],
        )
      : [];
    return Response.json({ models }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "model_catalog_unavailable" }, { status: 502 });
  }
};
