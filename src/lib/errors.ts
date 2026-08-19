import { redactSecrets } from "./redact";

/**
 * Turns any thrown value into something safe to put on screen.
 *
 * `friendly` is plain-language copy with a next step, the only part most users
 * should ever read. `technical` is the underlying message, always redacted,
 * shown behind a disclosure for bug reports. Redaction happens here rather
 * than at render time because the disclosure is user-visible and so is not a
 * security boundary.
 */
export interface FriendlyError {
  friendly: string;
  technical: string;
}

const AUTH =
  "Simmer can't reach its recipe helper right now. This one's on us, please try again later.";
const RATE_LIMIT = "Simmer is a bit busy right now. Wait about a minute, then try again.";
const SERVER = "Simmer's helper isn't responding. Please try again in a few minutes.";
const OFFLINE = "You seem to be offline. Check your connection, then try again.";
const TIMEOUT = "That took too long. Please try again.";
const BAD_URL = "That link doesn't look right. Check the address and paste it again.";
const SCRAPE_BLOCKED =
  "That site won't let Simmer read the recipe. Try copying the recipe text and pasting it instead.";
const SCRAPE_NOT_FOUND =
  "We couldn't find a page at that link. Check the address, or paste the recipe text instead.";
const SCRAPE_NO_RECIPE =
  "We couldn't find a recipe on that page. Try pasting the recipe text instead.";
const SCRAPE_GENERIC = "We couldn't read that page. Try again, or paste the recipe text instead.";
const MODEL_OUTPUT =
  "Simmer couldn't make sense of that recipe. Try again, or paste the ingredients and steps as plain text.";
const UNKNOWN = "Something went wrong on our end. Please try again in a moment.";

function classify(err: unknown): string {
  // fetch() rejects with a TypeError before there is ever a response.
  if (err instanceof TypeError) return OFFLINE;
  if (err instanceof DOMException && err.name === "AbortError") return TIMEOUT;

  const raw = err instanceof Error ? err.message : String(err);

  // Scrape failures are checked first: they carry status codes too, so the
  // generic status rules below would otherwise claim them.
  if (/Scraper endpoint returned invalid JSON/i.test(raw)) return SCRAPE_NO_RECIPE;
  if (/scraper|scrape-recipe/i.test(raw)) {
    if (/\b(404|410)\b/.test(raw)) return SCRAPE_NOT_FOUND;
    if (/\b(401|403|429)\b/.test(raw)) return SCRAPE_BLOCKED;
    return SCRAPE_GENERIC;
  }
  if (/Invalid URL/i.test(raw)) return BAD_URL;

  // recipeAgent's own throws when the model output is unusable.
  if (/No response from model|Unexpected finish_reason|did not complete within/i.test(raw))
    return MODEL_OUTPUT;

  if (/\b401\b/.test(raw) || /Incorrect API key|OPENAI_API_KEY is not set/i.test(raw)) return AUTH;
  if (/\b429\b/.test(raw) || /rate limit/i.test(raw)) return RATE_LIMIT;
  if (/\b(500|502|503|504)\b/.test(raw)) return SERVER;

  return UNKNOWN;
}

export function toFriendlyError(err: unknown): FriendlyError {
  const raw = err instanceof Error ? err.message : String(err);
  return { friendly: classify(err), technical: redactSecrets(raw) };
}
