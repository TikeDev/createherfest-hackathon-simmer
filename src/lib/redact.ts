/**
 * Strips credential-shaped substrings from text before it is stored, logged,
 * or rendered.
 *
 * Upstream providers echo API keys back inside error messages (OpenAI's 401
 * body quotes the key that failed), so any text originating outside this app
 * must pass through here before it can reach the DOM, including text behind a
 * collapsed disclosure.
 *
 * NOTE: a copy of this function lives in api/openai-chat.ts. That file is a
 * Vercel function outside the Vite build and cannot import from src/. Keep the
 * two in sync.
 */

// Provider key prefixes (sk-, sk-proj-, sk-ant-, ...) followed by a run of key
// body characters, or by the asterisk/bullet mask providers print instead.
const API_KEY_RE = /\b(?:sk|pk|rk)-[A-Za-z0-9_-]*[A-Za-z0-9_*•·-]{8,}/g;

// Bearer tokens in echoed request headers.
const BEARER_RE = /\bBearer\s+[A-Za-z0-9._\-*•]{8,}/gi;

// Generic long high-entropy token: a backstop for provider prefixes not
// enumerated above. Word-boundary anchored so ordinary prose is untouched.
const LONG_TOKEN_RE = /\b[A-Za-z0-9_-]{32,}\b/g;

export function redactSecrets(input: string): string {
  return input
    .replace(API_KEY_RE, "[redacted]")
    .replace(BEARER_RE, "Bearer [redacted]")
    .replace(LONG_TOKEN_RE, "[redacted]");
}
