import type { Env } from "./env";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function requestModelCatalog(env: Env): Promise<Response> {
  if (!env.AI_API_KEY?.trim()) throw new Error("AI_API_KEY belum diisi.");
  const baseUrl = (env.AI_BASE_URL || "https://9routers.vpsarenka.site/v1")
    .trim()
    .replace(/\/+$/, "");
  const endpoint = new URL(`${baseUrl}/models`);
  if (endpoint.protocol !== "https:" && endpoint.hostname !== "localhost") {
    throw new Error("AI_BASE_URL harus memakai HTTPS.");
  }
  return fetch(endpoint, {
    headers: { Authorization: `Bearer ${env.AI_API_KEY}` },
  });
}

export async function requestChatCompletion(
  env: Env,
  messages: ChatMessage[],
): Promise<Response> {
  if (!env.AI_API_KEY?.trim()) throw new Error("AI_API_KEY belum diisi.");
  if (!env.AI_MODEL?.trim()) throw new Error("AI_MODEL belum diisi.");
  if (messages.length === 0 || messages.length > 50) {
    throw new Error("Jumlah pesan harus antara 1 dan 50.");
  }

  const baseUrl = (env.AI_BASE_URL || "https://9routers.vpsarenka.site/v1")
    .trim()
    .replace(/\/+$/, "");
  const endpoint = new URL(`${baseUrl}/chat/completions`);
  if (endpoint.protocol !== "https:" && endpoint.hostname !== "localhost") {
    throw new Error("AI_BASE_URL harus memakai HTTPS.");
  }

  return fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.AI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: env.AI_MODEL, messages, stream: false }),
  });
}

