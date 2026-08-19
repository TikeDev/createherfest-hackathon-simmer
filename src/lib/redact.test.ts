import { describe, it, expect } from "vitest";
import { redactSecrets } from "./redact";

// The exact string observed in the browser on /extract with a bad key.
// Pinned here so the regression cannot come back.
export const OBSERVED_401 =
  "OpenAI request failed: 401 Incorrect API key provided: sk-proj-" +
  "*".repeat(120) +
  ". You can find your API key at https://platform.openai.com/account/api-keys.";

describe("redactSecrets", () => {
  describe("removes credential-shaped text", () => {
    it.each([
      ["the observed OpenAI 401", OBSERVED_401],
      ["an Anthropic key", "Error: sk-ant-api03-" + "A1b2C3d4".repeat(11)],
      ["a bare OpenAI key", "auth failed for sk-" + "A".repeat(48)],
      ["a bullet-masked key", "provided: sk-proj-" + "•".repeat(40)],
      ["a middot-masked key", "provided: sk-proj-" + "·".repeat(40)],
      ["a bare 40-char hex token", "token " + "a1b2c3d4e5".repeat(4) + " rejected"],
    ])("%s", (_label, input) => {
      const result = redactSecrets(input);
      expect(result).toContain("[redacted]");
      expect(result).not.toMatch(/sk-(proj|ant)?-/);
      expect(result).not.toMatch(/[*•·]{8,}/);
    });

    it("redacts a Bearer token but keeps the scheme", () => {
      const result = redactSecrets("Authorization: Bearer " + "x".repeat(40));
      expect(result).toBe("Authorization: Bearer [redacted]");
    });
  });

  it("keeps the surrounding diagnostic intact", () => {
    const result = redactSecrets(OBSERVED_401);
    // The secret goes, the information that explains the failure stays.
    expect(result).toContain("401 Incorrect API key provided");
    expect(result).toContain("https://platform.openai.com/account/api-keys");
    expect(result).not.toContain("sk-proj-");
  });

  describe("leaves ordinary error text unchanged", () => {
    it.each([
      "Scraper request failed (404) at /api/scrape-recipe.",
      "Scraper endpoint returned invalid JSON.",
      "No response from model.",
      "Unexpected finish_reason: length",
      "OpenAI proxy request failed (429) at /api/openai-chat.",
      "Something went wrong on our end. Please try again in a moment.",
    ])("%s", (input) => {
      expect(redactSecrets(input)).toBe(input);
    });
  });

  it("is idempotent", () => {
    const once = redactSecrets(OBSERVED_401);
    expect(redactSecrets(once)).toBe(once);
  });
});
