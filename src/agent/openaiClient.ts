import type OpenAI from "openai";

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
    let message = `OpenAI proxy request failed (${response.status}) at ${endpoint}.`;
    try {
      const json = JSON.parse(text) as { error?: string };
      if (typeof json.error === "string") message = json.error;
    } catch {
      const snippet = text.trim().slice(0, 220);
      if (snippet) message = `${message} ${snippet}`;
    }
    throw new Error(message);
  }

  return (await response.json()) as ChatCompletion;
}
