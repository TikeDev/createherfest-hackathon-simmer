---
description: Append a new entry to the AI Trace Log in docs/AI_TRACE_LOG.md. Use at the end of any AI-assisted coding session to document how Claude was used.
---

When this command is invoked:

1. Read `docs/AI_TRACE_LOG.md` to see existing entries and determine the next trace number (count existing `### **Trace #` headings and add 1).

2. Use the current conversation context to pre-fill all 6 fields. Write for a judge audience: someone evaluating whether the team augmented their work with AI rather than abdicated responsibility to it. Be specific and concrete. Avoid vague filler like "various improvements" or "some changes."

   Field inference rules:
   - **Category** — infer from context: Code Generation, Research, Accessibility Review, Documentation, Planning, Debugging, etc.
   - **Tool** — use "Claude Sonnet 4.6 (via Claude Code)" unless another model was explicitly used in the session
   - **Prompt** — write the actual request as a judge would read it: what problem was being solved and what was asked of the AI. 1-2 sentences.
   - **AI Response** — list the concrete outputs AI produced (files created, code written, architecture proposed, content drafted). Judges need to understand the scope of what AI generated.
   - **What You Kept** — describe which outputs the team accepted as-is and why they were sound. If unclear from context, mark "To fill in."
   - **What You Changed** — the most important field for judges. List as separate bullets, one per distinct decision: what was corrected, redirected, rejected, added, or improved beyond what AI suggested. If unclear from context, mark "To fill in."
   - **Verification** — explain how the team confirmed the output was correct (browser testing, TypeScript compilation, lint, manual review, cross-referencing docs). If unclear from context, mark "To fill in."

3. Present a **draft** of the 6 fields to the user in a readable format (not raw markdown). Ask the user to approve it or provide corrections. **Do NOT write to the file until the user explicitly approves ("looks good", "log it", "go ahead", or similar).**

   **Formatting rule:** Never use em dashes (--) in any drafted or written content. Use a comma, colon, semicolon, or rewrite the sentence instead.

4. Once the user approves, append the new trace entry to `docs/AI_TRACE_LOG.md` using the Edit tool, inserting it after the last `## **Trace #` block and before the `## **Usage Rules & Ethics**` section. If no traces exist yet, insert directly after the `## **AI Trace Entries**` section header (after its introductory line).

   Use this exact format (note: heading is `##`, no bold markers on the heading, field labels are plain text with no emoji prefix in the final output, and "What You Changed" uses a sub-bullet list):

   ```markdown
   ## **Trace #N: [Category]**

   * Tool: [e.g., Claude Sonnet 4.6 (via Claude Code)]
   * Prompt: "[exact or near-exact prompt the user typed]"
   * AI Response: [comma-separated list of concrete outputs: files created, code written, content drafted, etc.]
   * What You Kept: [which outputs were sound and accepted as-is]
   * What You Changed:
     * [specific change or decision #1]
     * [specific change or decision #2]
     * [add more bullets as needed]
   * Verification: [how the output was tested or confirmed to be correct]

   ---
   ```

   If "What You Changed" has only one point, it can be a single bullet. If "What You Kept" or "Verification" were marked "To fill in" by the user, write them as: `To fill in.`

5. Confirm to the user which trace number was added and that it was written to `docs/AI_TRACE_LOG.md`.
