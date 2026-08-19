import { describe, it, expect } from "vitest";
import { toFriendlyError } from "./errors";
import { OBSERVED_401 } from "./redact.test";

describe("toFriendlyError", () => {
  describe("maps failures to plain-language copy", () => {
    it.each<[string, unknown, string]>([
      ["auth", new Error(OBSERVED_401), "this one's on us"],
      [
        "rate limit",
        new Error("OpenAI proxy request failed (429) at /api/openai-chat."),
        "a bit busy",
      ],
      [
        "server",
        new Error("OpenAI proxy request failed (502) at /api/openai-chat."),
        "isn't responding",
      ],
      ["offline", new TypeError("Failed to fetch"), "offline"],
      ["timeout", new DOMException("aborted", "AbortError"), "took too long"],
      ["bad url", new Error("Invalid URL"), "doesn't look right"],
      [
        "scrape blocked",
        new Error("Scraper request failed (403) at /api/scrape-recipe."),
        "won't let simmer read",
      ],
      [
        "scrape not found",
        new Error("Scraper request failed (404) at /api/scrape-recipe."),
        "couldn't find a page",
      ],
      [
        "scrape no recipe",
        new Error("Scraper endpoint returned invalid JSON."),
        "couldn't find a recipe",
      ],
      [
        "scrape generic",
        new Error("Scraper request failed (418) at /api/scrape-recipe."),
        "couldn't read that page",
      ],
      ["model: no response", new Error("No response from model."), "make sense of that recipe"],
      [
        "model: finish_reason",
        new Error("Unexpected finish_reason: length"),
        "make sense of that recipe",
      ],
      [
        "model: iterations",
        new Error("Agent did not complete within 8 iterations."),
        "make sense of that recipe",
      ],
      ["unknown error", new Error("kaboom"), "something went wrong"],
      ["a bare string", "a bare string", "something went wrong"],
      ["undefined", undefined, "something went wrong"],
    ])("%s", (_label, input, expected) => {
      expect(toFriendlyError(input).friendly.toLowerCase()).toContain(expected);
    });
  });

  // The security invariant. The disclosure is user-visible, so this is what
  // proves it can never render key material.
  it("never leaks key material into the technical detail", () => {
    const { technical } = toFriendlyError(new Error(OBSERVED_401));
    expect(technical).not.toContain("sk-proj-");
    expect(technical).toContain("[redacted]");
  });

  it("keeps upstream text out of the friendly message entirely", () => {
    const { friendly } = toFriendlyError(new Error(OBSERVED_401));
    expect(friendly).not.toContain("sk");
    expect(friendly).not.toContain("401");
  });
});
