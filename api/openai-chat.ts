import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

// Only this model may be proxied. Without the check the endpoint is an open
// relay: anyone could bill arbitrary models to our key.
const ALLOWED_MODEL = "gpt-5-nano";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function applyCors(res: VercelResponse): void {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(key, value);
  }
}

function jsonError(res: VercelResponse, status: number, error: string, details?: unknown): void {
  applyCors(res);
  res.status(status).json(details === undefined ? { error } : { error, details });
}

/**
 * NOTE: this is a copy of redactSecrets in src/lib/redact.ts. This file is a
 * Vercel function outside the Vite build and cannot import from src/, so the
 * two must be kept in sync. The tests live next to the original.
 */
const API_KEY_RE = /\b(?:sk|pk|rk)-[A-Za-z0-9_-]*[A-Za-z0-9_*•·-]{8,}/g;
const BEARER_RE = /\bBearer\s+[A-Za-z0-9._\-*•]{8,}/gi;
const LONG_TOKEN_RE = /\b[A-Za-z0-9_-]{32,}\b/g;

function redactSecrets(input: string): string {
  return input
    .replace(API_KEY_RE, "[redacted]")
    .replace(BEARER_RE, "Bearer [redacted]")
    .replace(LONG_TOKEN_RE, "[redacted]");
}

// This endpoint is public, so upstream prose never goes out verbatim. The
// client classifies on the HTTP status, not on this wording.
function upstreamMessage(status: number): string {
  if (status === 401 || status === 403) return "The recipe service rejected this request.";
  if (status === 429) return "The recipe service is rate limited.";
  if (status >= 500) return "The recipe service is unavailable.";
  return "The recipe request failed.";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    applyCors(res);
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    jsonError(res, 405, "Method not allowed. Use POST.");
    return;
  }

  // Validate the request before checking server config, so a malformed
  // request reports 400 rather than a misleading 500 about the key.
  const body = req.body as Record<string, unknown> | undefined;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    jsonError(res, 400, "Request body must be a JSON object.");
    return;
  }

  if (!Array.isArray(body.messages)) {
    jsonError(res, 400, "Request body must include a `messages` array.");
    return;
  }

  if (body.model !== ALLOWED_MODEL) {
    jsonError(res, 400, `Unsupported model. Only "${ALLOWED_MODEL}" is allowed.`);
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    jsonError(res, 500, "OPENAI_API_KEY is not set on the server.");
    return;
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create(
      body as unknown as Parameters<typeof client.chat.completions.create>[0]
    );
    applyCors(res);
    res.status(200).json(completion);
  } catch (e) {
    if (e instanceof OpenAI.APIError) {
      const status = typeof e.status === "number" ? e.status : 502;
      jsonError(res, status, upstreamMessage(status), redactSecrets(e.message));
      return;
    }
    const message = e instanceof Error ? e.message : String(e);
    jsonError(res, 502, upstreamMessage(502), redactSecrets(message));
  }
}
