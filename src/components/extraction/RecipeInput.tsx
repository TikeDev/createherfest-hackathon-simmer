import { useState } from "react";
import type { ExtractionStatus } from "@/types/agent";

type InputTab = "url" | "text";

interface RecipeInputProps {
  status: ExtractionStatus;
  onSubmit: (
    input: { type: "url"; value: string } | { type: "text"; value: string }
  ) => Promise<void> | void;
}

export function RecipeInput({ status, onSubmit }: RecipeInputProps) {
  const [tab, setTab] = useState<InputTab>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const isLoading = status === "fetching" || status === "extracting" || status === "saving";

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;

    if (tab === "url") {
      const trimmed = url.trim();
      if (!trimmed) return;
      void onSubmit({ type: "url", value: trimmed });
    } else {
      const trimmed = text.trim();
      if (!trimmed) return;
      void onSubmit({ type: "text", value: trimmed });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tab toggle */}
      <div
        role="tablist"
        aria-label="Recipe input method"
        className="flex rounded-lg border border-mist-pale p-1 gap-1"
      >
        <button
          type="button"
          role="tab"
          id="tab-url"
          aria-selected={tab === "url"}
          aria-controls="tabpanel-url"
          tabIndex={tab === "url" ? 0 : -1}
          onClick={() => setTab("url")}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              setTab(tab === "url" ? "text" : "url");
              const next = (e.target as HTMLElement)
                .closest('[role="tablist"]')
                ?.querySelector<HTMLElement>(`[role="tab"]:not([aria-selected="true"])`);
              next?.focus();
            }
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage ${
            tab === "url" ? "bg-sage text-white" : "text-forest/70 hover:text-forest"
          }`}
        >
          From URL
        </button>
        <button
          type="button"
          role="tab"
          id="tab-text"
          aria-selected={tab === "text"}
          aria-controls="tabpanel-text"
          tabIndex={tab === "text" ? 0 : -1}
          onClick={() => setTab("text")}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              setTab(tab === "url" ? "text" : "url");
              const next = (e.target as HTMLElement)
                .closest('[role="tablist"]')
                ?.querySelector<HTMLElement>(`[role="tab"]:not([aria-selected="true"])`);
              next?.focus();
            }
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage ${
            tab === "text" ? "bg-sage text-white" : "text-forest/70 hover:text-forest"
          }`}
        >
          Paste Text
        </button>
      </div>

      {tab === "url" ? (
        <div id="tabpanel-url" role="tabpanel" aria-labelledby="tab-url">
          <label htmlFor="recipe-url" className="block text-sm font-medium text-forest mb-1">
            Recipe URL
          </label>
          <input
            id="recipe-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.example.com/recipes/chocolate-cake"
            disabled={isLoading}
            className="w-full rounded-lg border border-mist-pale bg-cream text-forest px-4 py-3 text-sm placeholder:text-forest/40 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 disabled:opacity-50"
          />
        </div>
      ) : (
        <div id="tabpanel-text" role="tabpanel" aria-labelledby="tab-text">
          <label htmlFor="recipe-text" className="block text-sm font-medium text-forest mb-1">
            Recipe Text
          </label>
          <textarea
            id="recipe-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the full recipe here: ingredients, steps, and any intro notes."
            rows={10}
            disabled={isLoading}
            className="w-full rounded-lg border border-mist-pale bg-cream text-forest px-4 py-3 text-sm placeholder:text-forest/40 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 disabled:opacity-50 resize-y"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || (tab === "url" ? !url.trim() : !text.trim())}
        className="w-full rounded-lg bg-sage px-6 py-3 text-sm font-semibold text-white hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Simmer is thinking..." : "Extract Recipe"}
      </button>
    </form>
  );
}
