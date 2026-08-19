# **\#75HER Challenge: Risk Log**

**Project Name:** Simmer

**Team Name:** Spice Studio

---

## **💡 Purpose & Instructions**

**Purpose:** Track issues you identified and fixed during development. This demonstrates proactive problem-solving and critical thinking to judges.

**Instructions:** Document risks as you find them during the hackathon.

* Categorize each by severity (Critical, Major, or Minor).  
* Clearly show how you resolved them with evidence.  
* **Target:** Document at least **3 risks** you found and fixed.

---

## **🔴 Severity Levels**

* **Critical (Red):** Blocks submission. Includes exposed API keys, fabricated claims, IP violations, or a broken demo.  
* **Major (Orange):** Must fix before final submission. Includes missing citations, accessibility violations, or broken links.  
* **Minor (Yellow):** Document and fix if time permits. Includes minor typos or UI polish.

---

## **🛡️ Risk Log Table**

| Area | Issue Description | Severity | Fix Applied | Evidence/Link | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| \[e.g., Privacy\] | \[e.g., API key visible in code\] | 🔴 Critical | \[e.g., Removed key; added .env.example\] | \[e.g., .env.example\] | ✅ Fixed |
| Accessibility | Sidebar logo image used empty alt text (`alt=""`) and was hidden from assistive tech (`aria-hidden="true"`), which does not meet the requirement that all images have meaningful alt text. | 🟠 Major | Updated image to meaningful alternative text: `alt="Simmer logo"` and removed `aria-hidden` from the image element. | `src/components/layout/SidePanel.tsx:120` | ✅ Fixed |
| Accessibility | Dark mode text invisible — `--color-cream` token remapped to dark background color, making body text unreadable in dark theme | 🔴 Critical | Changed text classes to use `dark:text-cream-text` (#FAF4EF) instead of `dark:text-cream` | [938fa80](https://github.com/TikeDev/createherfest-hackathon-simmer/commit/938fa80) | ✅ Fixed |
| Accessibility | 24 a11y violations found via accessibility-agents audit — missing keyboard nav on grocery checklist, unlabeled star ratings, non-focusable progress dots, missing ARIA on radio groups | 🟠 Major | Added checkbox roles, labeled radio groups, roving tabindex, `aria-current` on nav, `aria-live` regions for announcements | [00c6947](https://github.com/TikeDev/createherfest-hackathon-simmer/commit/00c6947) | ✅ Fixed |
| Accessibility | Relying solely on accessibility-agents for auditing without manual verification. No screen reader testing performed, keyboard navigation not manually verified, and color contrast not manually checked. Risk that automated tools may miss real-world usability issues that only human testing can catch. | 🟠 Major | **Mitigation in progress:** (1) Document reliance on automated tooling as a known limitation. (2) Before final submission, perform manual spot-checks: Tab through all interactive elements, use browser dev tools contrast checker, test at least one flow with VoiceOver/NVDA if available. (3) Add disclaimer in documentation noting accessibility was primarily verified via automated agents. | Risk Log entry; manual testing TBD before submission | 🟡 In Progress |
| Code Quality | Floating promises in suggestion hooks — unhandled async calls triggered ESLint `@typescript-eslint/no-floating-promises` errors, blocking CI | 🟠 Major | Wrapped async calls with `void` operator and proper error handling | [b5d90d1](https://github.com/TikeDev/createherfest-hackathon-simmer/commit/b5d90d1) | ✅ Fixed |
| Operational | **Misdiagnosed as CORS.** Recipe URL extraction failed because major sites (allrecipes, seriouseats, foodnetwork) return **HTTP 403** to datacenter/unknown IPs — measured 3 of 4 sites blocked. CORS was never involved: the fetch is server-side in the Vercel function, so the browser never contacts the recipe site. A second bug compounded it — `api/scrape_recipe.py` served `/api/scrape_recipe` while the frontend called `/api/scrape-recipe`, so the `recipe-scrapers` handler never ran. | 🟠 Major | Renamed handler to `api/scrape-recipe.py` to claim the correct route; removed the competing TypeScript handler; routed all fetches through a Webshare rotating residential proxy (`PROXY_HTTP_URL` / `PROXY_HTTPS_URL`); pinned `recipe-scrapers==15.12.0`. | `api/scrape-recipe.py` | ✅ Fixed |
| Operational | CI pipeline failing — GitHub Actions couldn't resolve pnpm version, causing `pnpm install` to fail on every push | 🟠 Major | Added `packageManager` field to `package.json` and upgraded to pnpm v10 | [e90bdab](https://github.com/TikeDev/createherfest-hackathon-simmer/commit/e90bdab) | ✅ Fixed |
| AI Integration | gpt-5-nano temperature locked at 1 — discovered OpenAI removed temperature control for this model; higher randomness than ideal for structured extraction | 🟡 Minor | Accepted as model constraint; mitigated by strict system prompt and Zod validation on output | [recipeAgent.ts](https://github.com/TikeDev/createherfest-hackathon-simmer/blob/main/src/agent/recipeAgent.ts) | ⚠️ Accepted |
| Feature Scope | URL-based recipe extraction unreliable. Root cause was **403 bot-blocking on IP reputation**, not CORS (see the Operational entry above). Paywalled content remains a genuine limitation. | 🟡 Minor | Fixed via residential proxy + `recipe-scrapers` route fix. Text paste remains available as a fallback for paywalled or unparseable pages. | `api/scrape-recipe.py` | ✅ Fixed |
| Operational | Cloudflare-protected sites (allrecipes, seriouseats, simplyrecipes, thespruceeats) returned 403 on **every** attempt even through a residential proxy with full browser headers. Cause is TLS/JA3 fingerprinting: Python `requests` has a non-browser handshake, so no header or IP change helps. Upstream `recipe-scrapers` declines to address this by policy (14 issues labelled `bots-protection`, 11 open, no documented workaround) — its only guidance is to fetch the HTML yourself and use `scrape_html()`, which we already do. | 🟠 Major | Replaced `requests` with `curl_cffi` (`impersonate="chrome146"`), which replays a real Chrome TLS handshake. Measured coverage rose from 5/10 to **8/10** sites, including allrecipes and seriouseats which were previously 0/5. Retries raised to 5 since blocks are probabilistic. | `api/scrape-recipe.py` | ✅ Fixed |
| Operational | Firecrawl evaluated as a fallback tier. It **refuses all Dotdash Meredith domains outright** ("we do not support this site") — an account-level blocklist applied before any fetch, identical across `scrape` and `interact`, unaffected by `proxy: stealth`. It does reach other blocked sites (cookieandkate, foodnetwork). | 🟡 Minor | Wired in as an optional last-resort tier behind `FIRECRAWL_API_KEY`; skipped entirely when the key is absent. Not relied upon, since `curl_cffi` already covers the sites Firecrawl refuses. | `api/scrape-recipe.py` | ✅ Fixed |
| Data Quality | A fetch could succeed (HTTP 200) yet yield an unusable recipe — either an anti-bot interstitial, or an upstream scraper bug (simplyrecipes raises `AttributeError` on `instructions_list`, which `_safe_call` silently converts to an empty list). | 🟠 Major | Guard now requires **both** ingredients and instructions before returning 200; otherwise 422 with the paste-text fallback. Prevents saving headless or ingredient-only recipes. | `api/scrape-recipe.py` | ✅ Fixed |
| Security | Scraper endpoint is an unauthenticated open proxy — `Access-Control-Allow-Origin: *`, no allowlist, no rate limit, and no SSRF guard (private/loopback IPs are not blocked). Now backed by a paid residential proxy, so abuse could consume bandwidth quota. | 🟠 Major | **Accepted for now.** Deliberately deferred to keep scope on restoring extraction. Mitigate before any public/production deployment: block private and loopback hosts, add rate limiting, and restrict CORS to the app origin. | `api/scrape-recipe.py` | ⚠️ Accepted |

---

## **🚩 Risk Categories to Monitor**

1. **Accuracy & Verifiability:** Are claims backed by credible sources?  
2. **Privacy & Security:** No exposed API keys or PII (Personally Identifiable Information).  
3. **Ethics & DEI:** Use of inclusive language and representative examples.  
4. **Legal/IP & Licensing:** Proper licenses for libraries and attribution for assets.  
5. **Accessibility:** Alt text on images and WCAG AA color contrast (4.5:1).  
6. **Operational:** The demo runs from a fresh clone and all links work.

---

## **✅ Self-Red-Team Checklist**

*Run this check 48 hours before submission\!*

### **Privacy & Security**

* \[x\] No API keys, passwords, or tokens in code.
* \[x\] .env.example file included with dummy values.
* \[x\] No real user data (emails/names) in screenshots or demos.

### **Accuracy & Sources**

* \[ \] All statistics have source citations in the Evidence Log.
* \[x\] Data visualizations show real or clearly labeled synthetic data.

### **Legal & IP**

* \[ \] LICENSE file present and all dependencies listed.
* \[x\] No unauthorized logos or trademarks used.

### **Accessibility**

* \[x\] All images have meaningful alt text.
* \[x\] Color contrast meets WCAG AA standards.
* \[x\] Keyboard navigation works for interactive elements.

### **Operational**

* \[ \] Project runs from a fresh clone.
* \[ \] All links in the README and documentation work.

---

## **🏆 Tips for a Strong Risk Log**

* **Be Honest:** Judges respect transparency regarding the issues you caught.  
* **Provide Evidence:** Document fixes with specific file names or line numbers.  
* **Update Regularly:** Check this list weekly during development (Days 51-70).  
* **Don't Claim Zero Risks:** It is not credible to have found no risks during a project.

---

Part of the \#75HER Challenge | CreateHER Fest 2026 
