export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export function authenticatedUser(locals: unknown): AuthenticatedUser | null {
  if (!locals || typeof locals !== "object" || !("user" in locals)) return null;
  const user = (locals as { user?: unknown }).user;
  if (!user || typeof user !== "object" || !("id" in user)) return null;
  const id = (user as { id?: unknown }).id;
  if (typeof id !== "string" || id.length === 0) return null;
  const email = (user as { email?: unknown }).email;
  return { id, ...(typeof email === "string" ? { email } : {}) };
}

export function authenticatedOwner(locals: unknown): string | null {
  return authenticatedUser(locals)?.id ?? null;
}

export function jsonError(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: { "Cache-Control": "private, no-store" } });
}

export function sameOriginMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 256_000) return null;
  try {
    if (!request.body) return null;
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 256_000) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const value: unknown = JSON.parse(text);
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

export function privateJson(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}

export function validId(value: string): boolean {
  return /^[a-zA-Z0-9_-]{1,80}$/.test(value);
}

