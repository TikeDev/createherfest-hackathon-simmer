# Simmer 🍲

**🔗 [Try the Live Demo!](https://createherfest-hackathon-recipe-app.vercel.app/)** (mobile friendly)

**A React PWA that helps people with physical, cognitive, or temporary limitations find and follow accessible recipes.**

<img src="simmer-demo-opt.gif" width="400" alt="Simmer Demo GIF"/>

## Table of Contents

- [Problem Frame](#problem-frame)
- [Key Features](#key-features)
- [Quick Start & Demo Path](#quick-start-demo-path)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Environment variables](#environment-variables)
  - [Dev server commands](#dev-server-commands)
  - [Other commands](#other-commands)
  - [Troubleshooting](#troubleshooting)
  - [60-Second Demo Path](#60-second-demo-path)
- [Technical Architecture](#️-technical-architecture)
  - [goose Integration (AI/ML Track)](#goose-integration-aiml-track)
- [Project Logs & Documentation](#project-logs-documentation)
- [Testing & Known Issues](#testing-known-issues)
- [Team & Acknowledgments](#team-acknowledgments)
- [License & Attributions](#license-attributions)

---

## 🧩 Problem Frame

| **User** | Individuals with executive functioning challenges who love to cook but want recipes that adapt to their brain's contradictory need for novelty while also providing a structure that simplifies cooking

| **Problem** | Choosing recipes according to their changing level of energy/focus and following recipes with complex asynchronous steps

| **Constraints** | Time and budget

| **Success Test** | Pick a recipe according to energy level and successfully go through all recipe's steps sequentially with the ability to navigate back and forth between steps, with the current step in view while all others are hidden

---

## ✨ Key Features

- **Soft scoring & explainability:** Remaining recipes are ranked by time fit, energy fit, appliance fit, sensory match, and cleanup burden. Every recommendation shows "Why this fits you."
- **AI extraction agent:** Imports any recipe URL or pasted text into a structured, offline-capable format using gpt-5-nano with function calling.
- **Playbook View:** Step-checkable cooking mode with large text and minimal distraction — designed for use while cooking with limited attention.
- **Source-faithful substitutions:** Ingredient alternatives are shown only when the original recipe source provides them, and only after passing all safety constraints.

---

## 🚀 Quick Start & Demo Path

**[Live Deployment](https://createherfest-hackathon-recipe-app.vercel.app/)** (mobile friendly)

### Requirements

| Tool | Version | Needed for |
|------|---------|-----------|
| Node | 18+ | App and the OpenAI proxy function |
| pnpm | 10+ | Package management |
| Python | 3.12 | The recipe URL scraper (`api/scrape-recipe.py`) |

You will also need an **OpenAI API key**. Importing recipes *by URL* additionally
needs HTTP proxy credentials. See [Environment variables](#environment-variables).

### Installation

```bash
# 1. Clone and install
git clone https://github.com/TikeDev/createherfest-hackathon-simmer simmer
cd simmer
pnpm install

# 2. Install the Python scraper dependencies
pnpm setup:python

# 3. Create your env file, then fill it in (see the table below)
cp .env.example .env

# 4. Start both dev servers
pnpm dev:full
```

Then open **http://localhost:5173**.

> Fill in `.env` **before** running `pnpm dev:full`. The API server reads it at
> startup, so changing `.env` later means restarting it.

### Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes | All AI features. Read **server-side only**, never exposed to the browser. |
| `PROXY_HTTP_URL` | For URL import | Recipe sites return 403 to datacenter IPs, so fetches go through a rotating residential proxy. |
| `PROXY_HTTPS_URL` | For URL import | Same proxy; both use an `http://` scheme. |
| `FIRECRAWL_API_KEY` | No | Optional last-resort fallback if the primary scraper fails. |
| `VITE_API_BASE` | No | Overrides the `/api` base URL. Leave unset for local dev. |

Without the proxy variables the app still runs. Pasting recipe *text* works, but
importing by *URL* returns a 500 explaining the proxy is missing.

### Dev server commands

| Command | What it starts | Use when |
|---------|----------------|----------|
| `pnpm dev:full` | Vite (5173) + API server (5174) | **Default.** Anything involving AI or recipe import. |
| `pnpm dev` | Vite only (5173) | UI-only work. All `/api` calls will 404. |
| `pnpm dev:browser` | `dev:full` + launches Chrome Beta | Debugging with DevTools. |

`pnpm dev` alone is not enough for the AI features: the OpenAI key lives server-side,
so the browser calls a same-origin `/api/openai-chat` function that only exists under
`dev:full`. Vite proxies `/api` to port 5174.

### Other commands

```bash
pnpm build      # Production build (tsc + vite)
pnpm preview    # Preview the production build
pnpm test       # Unit tests (vitest)
pnpm lint       # ESLint + stylelint
pnpm lint:py    # ruff, for the Python scraper
```

### Troubleshooting

| Symptom | Cause and fix |
|---------|---------------|
| `/api/*` returns 404 | You ran `pnpm dev` instead of `pnpm dev:full`. |
| `OPENAI_API_KEY is not set on the server.` | Missing or misnamed key in `.env`. It must **not** have a `VITE_` prefix. Restart the API server after editing. |
| `Server is missing PROXY_HTTP_URL / PROXY_HTTPS_URL` | URL import needs proxy credentials. Paste recipe text instead, or add them. |
| Port 5173 or 5174 already in use | A previous dev server is still running: `lsof -ti:5173,5174 \| xargs kill` |
| Scraper fails to import | Some sites bot-block aggressively. `bbcgoodfood.com` is reliable for testing. |

### 60-Second Demo Path

1. **Set up your profile** — Select allergens, mobility limits, and preferred appliances → Profile is saved locally.
2. **Describe today's state** — Pick chips ("low energy", "one hand") and/or type a note → App filters and scores in real time.
3. **Open a recipe in Playbook View** — Tap a recommendation → Step through the recipe with checkboxes, large text, and "Why this fits you" context.
4. **Import a recipe** — Paste a URL or recipe text → Extraction agent parses it into structured format, available offline.

**📹 Demo Video:** [https://www.youtube.com/watch?v=5SIi_76ZiN8](https://www.youtube.com/watch?v=5SIi_76ZiN8) | **🔗 Live Demo:** [createherfest-hackathon-recipe-app.vercel.app](https://createherfest-hackathon-recipe-app.vercel.app/)

---

## 🏗️ Technical Architecture

**Components:**

- **Frontend:** React 19 + TypeScript — PWA (via `vite-plugin-pwa`), Vite 6, Tailwind CSS 3. Handles profile setup, session input, recommendations, recipe detail, and Playbook View.
- **Backend:** Vercel serverless function (`api/scrape-recipe.py`) — fetches recipe pages through a rotating residential proxy and parses them with `recipe-scrapers`. No persistent server.
- **Database:** IndexedDB via `idb` — fully local storage for recipes, user profile, and offline extraction queue.
- **AI Integration:** OpenAI `gpt-5-nano` with function calling — powers the recipe extraction agent (parse ingredients, extract steps, convert units, validate output).

### 🤖 goose Integration (AI/ML Track)

- **Model:** gpt-5-nano via OpenAI SDK (run directly in-browser through a Vercel-proxied API call).
- **Implementation:** A multi-step agent loop in `src/agent/recipeAgent.ts` calls 6 structured tools — `extract_preamble`, `parse_ingredients`, `extract_steps`, `convert_volume_to_weight`, `convert_weight_to_volume`, `validate_output` — to transform unstructured recipe text into typed, validated JSON. The agent runs up to 10 iterations with a tool-call cap.
- **Impact:** Converts any recipe URL or raw text into an accessible, structured format in ~5–10 seconds — including both volume and weight unit variants for users who cook by feel or by scale.

---

## 📋 Project Logs & Documentation

| Log Type                  | Purpose                                                     | Link to Documentation                                                                    |
| :------------------------ | :---------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **Decision Log**          | Technical choices & tradeoffs                               | [docs/DECISION_LOG.md](docs/DECISION_LOG.md)                                             |
| **Risk Log**              | Issues identified & fixed                                   | [docs/RISK_LOG.md](docs/RISK_LOG.md)                                                     |
| **Evidence Log**          | Sources, assets & attributions                              | [docs/EVIDENCE_LOG.md](docs/EVIDENCE_LOG.md)                                             |
| **MVP Spec**              | Full feature spec, data types, APIs, 16 acceptance criteria | [docs/plans/Initial_MVP_Plan.md](docs/plans/Initial_MVP_Plan.md)                         |
| **Extraction Agent Plan** | Agent pipeline, tools, output format, offline queue         | [docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md](docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md) |
| **Architecture Diagrams** | Mermaid flow diagrams for the full system                   | [docs/plans/Plan_Overview_Diagram.md](docs/plans/Plan_Overview_Diagram.md)               |

---

## 🧪 Testing & Known Issues

**Test Results:** Manual testing — unit tests not yet written.

- **Known Issue:** Extraction agent reliability varies with heavily formatted recipe pages (infinite scroll sites, paywalled content). Workaround: paste recipe text directly.
- **Known Issue:** Offline queue drain (processing URL imports when connectivity returns) is not yet implemented — queued URLs remain pending until the user re-opens the app online.
- **Next Step:** Add PlaybookView, recommendation engine with hard filter + soft scoring, and the curated recipe dataset.

---

## 👥 Team & Acknowledgments

**Team Name:** Spice Studio

| Name              | Role                                  | GitHub           | LinkedIn                                          |
| :---------------- | :------------------------------------ | :--------------- | :------------------------------------------------ |
| Kerline Moncy     | Lead Developer and DevOps Engineer    | @TikeDev         | https://www.linkedin.com/in/kerline-moncy/        |
| Paula Bass Werner | Technical Product Manager             | @pbasswerner     | https://www.linkedin.com/in/paula-bass-werner/    |
| Rahul Basu        | System Architecture and AI Consultant | @EruditeStranger | https://www.linkedin.com/in/rahul-basu-238a18100/ |

**Special thanks to:** CreateHER Fest and the #75HER Challenge organizers.

---

## 📄 License & Attributions

**Project License:** MIT

- **React 19** — MIT License | https://react.dev
- **Vite 6** — MIT License | https://vitejs.dev
- **Tailwind CSS 3** — MIT License | https://tailwindcss.com
- **idb** — ISC License | https://github.com/jakearchibald/idb
- **OpenAI Node SDK** — Apache 2.0 | https://github.com/openai/openai-node
- **vite-plugin-pwa** — MIT License | https://github.com/vite-pwa/vite-plugin-pwa
- **Zod** — MIT License | https://github.com/colinhacks/zod
- **@mozilla/readability** — Apache 2.0 | https://github.com/mozilla/readability

---

Built with ❤️ for #75HER Challenge | CreateHER Fest 2026
