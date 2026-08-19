import type OpenAI from "openai";
import { redactSecrets } from "@/lib/redact";

/**
 * The single seam where chat completions enter the app.
 *
 * Every OpenAI call goes through here and out to the same-origin
 * /api/openai-chat function, so the API key never reaches the browser.
 * This is also the intended swap point for a future browser-local model
 * backend — that work is planned separately, so there is deliberately no
 * abstraction over the single remote implementation yet.
 */

const CHAT_ENDPOINT = "/api/openai-chat";

type ChatParams = OpenAI.Chat.ChatCompletionCreateParamsNonStreaming;
type ChatCompletion = OpenAI.Chat.ChatCompletion;

export async function createChatCompletion(params: ChatParams): Promise<ChatCompletion> {
  const apiBase = import.meta.env.VITE_API_BASE ?? "";
  const endpoint = `${apiBase}${CHAT_ENDPOINT}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const text = await response.text();
    // The status prefix is always kept: lib/errors.ts classifies on it, and
    // upstream wording is not something we control.
    let message = `OpenAI proxy request failed (${response.status}) at ${endpoint}.`;
    try {
      const json = JSON.parse(text) as { error?: string; details?: unknown };
      const parts = [
        typeof json.error === "string" ? json.error : null,
        typeof json.details === "string" ? json.details : null,
      ].filter(Boolean);
      if (parts.length) message = `${message} ${parts.join(" ")}`;
    } catch {
      const snippet = text.trim().slice(0, 220);
      if (snippet) message = `${message} ${snippet}`;
    }
    // Redact here too, so a stale deployment of the API function or a non-JSON
    // upstream body still cannot put a key into the thrown error.
    throw new Error(redactSecrets(message));
  }

  return (await response.json()) as ChatCompletion;
}
