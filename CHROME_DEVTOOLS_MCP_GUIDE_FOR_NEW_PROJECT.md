# Chrome DevTools MCP + Figma MCP Guide

> **Note:** This file is a template for a new Vite/React PWA project. Replace `<PROJECT_NAME>` and `<PORT>` throughout with your actual project name and Vite dev port (check `vite.config.ts` — default is `5173`).

## Table of Contents

- [What are these plugins?](#what-are-these-plugins)
- [Prerequisites](#prerequisites)
- [Setup — Chrome DevTools MCP](#setup--chrome-devtools-mcp)
  - [Install the plugin](#1-install-the-chrome-devtools-plugin)
  - [Set up the Chrome launch scripts](#2-set-up-the-chrome-launch-scripts)
  - [Start debugging](#3-start-debugging)
- [Setup — Figma MCP](#setup--figma-mcp)
- [Setup — Windows](#setup--windows)
- [Available Commands](#available-commands)
- [What Claude can do with these plugins](#what-claude-can-do-with-these-plugins)
- [Troubleshooting](#troubleshooting)
- [How it works](#how-it-works)

---

## What are these plugins?

Two MCP plugins that give Claude Code superpowers:

| Plugin | What Claude can do | Requires Chrome? |
|---|---|---|
| **Chrome DevTools MCP** | See your running browser — console errors, network requests, DOM state, screenshots, JS execution | Yes |
| **Figma MCP** | Read Figma designs and generate code from them | No |

Both are installed once per developer machine. They work in all Claude Code sessions across all projects after that.

### What "skills" means here

Each plugin bundles **tools** (capabilities) and **skills** (instructions on when/how to use them):

| Plugin | Tools | Bundled skills |
|---|---|---|
| Chrome DevTools MCP | 29 tools (screenshot, console, network, JS eval, etc.) | General debugging, Accessibility debugging, LCP optimization, Troubleshooting |
| Figma MCP | Design context, screenshots, variable defs, Code Connect | `/figma:implement-design`, `/figma:code-connect-components`, `/figma:create-design-system-rules` |

---

## Prerequisites

- **Node.js v20.19 or newer** — check with `node --version`
- **Chrome Beta** (recommended) or Chrome stable

**Why Chrome Beta?**
Using a separate browser keeps debugging sessions isolated from your personal browsing — your bookmarks, extensions, and logins in regular Chrome stay untouched. Chrome Beta runs as a completely separate app with its own profile.

Chrome stable also works if Beta isn't installed; the launch scripts will auto-detect whichever is available.

---

## Setup — Chrome DevTools MCP

### 1. Install the Chrome DevTools plugin

Run these inside a Claude Code session (type them in the chat):

```
/plugin marketplace add ChromeDevTools/chrome-devtools-mcp
/plugin install chrome-devtools-mcp
```

This is a **one-time install per machine** — it works across all your projects.

After installing, type `/mcp` in Claude Code. You should see `chrome-devtools` in the list.

### 2. Set up the Chrome launch scripts

The repo includes scripts that launch Chrome with remote debugging enabled. These are already committed — you don't need to create them.

**macOS:** `scripts/launch-chrome-beta.sh`
**Windows:** `scripts/launch-chrome-beta.bat`

These scripts start Chrome with `--remote-debugging-port=9222`, which is the port the Chrome DevTools MCP plugin connects to.

### 3. Start debugging

```bash
pnpm dev:browser
```

This starts Vite and opens Chrome with remote debugging once the server is ready. Claude can now see your browser.

To verify: ask Claude to `list_pages` — it should return your app's page.

---

## Setup — Figma MCP

Run this in your terminal (one-time per machine):

```bash
claude plugin install figma@claude-plugins-official
```

After installing:
- Type `/mcp` in Claude Code — `figma` should appear
- Share a Figma URL and Claude can read the design and generate code
- Use `/figma:implement-design` to start a guided design-to-code workflow

**Rate limits:**
- Starter plan: 6 tool calls per month
- Paid plan (Dev/Full seat): Tier 1 per-minute limits

No Chrome or local server needed — Figma MCP is cloud-hosted.

---

## Setup — Windows

Plugin installs (Steps 1 and Figma setup) work the same on Windows.

For the Chrome launch, the `pnpm dev:browser` script won't work on Windows (it uses bash). Run two terminals instead:

**Terminal 1:**
```bash
pnpm dev
```

**Terminal 2** (once Vite is ready):
```batch
.\scripts\launch-chrome-beta.bat
```

For a fresh profile:
```batch
.\scripts\launch-chrome-beta.bat --fresh
```

> If Chrome Beta or stable isn't found at the default path, update `SET CHROME_BETA_PATH=` or `SET CHROME_STABLE_PATH=` in `scripts/launch-chrome-beta.bat`.

---

## Available Commands

| Command | OS | Description |
|---------|-----|-------------|
| `pnpm dev` | All | Normal Vite dev server (no browser launch) |
| `pnpm dev:browser` | macOS | Vite + Chrome with remote debugging (persistent profile) |
| `pnpm dev:browser:fresh` | macOS | Vite + Chrome with remote debugging (temporary profile) |
| `.\scripts\launch-chrome-beta.bat` | Windows | Chrome with remote debugging (run after `pnpm dev`) |

**Persistent vs. fresh profile:**
- **Persistent** — profile saved at `~/.<PROJECT_NAME>-chrome-debug`, keeps you logged in between sessions
- **Fresh** — temporary profile deleted on close, use when testing auth flows or cookie behavior

---

## What Claude can do with these plugins

### Chrome DevTools MCP — standard debugging sequence

```
list_pages        → find the right page
select_page       → focus it
take_snapshot     → read DOM state (prefer over screenshots — more accurate)
evaluate_script   → run JS to check element positions, render state, etc.
list_console_messages (types: ["error"]) → catch runtime errors
list_network_requests → find stuck or failed fetches
```

**Important rule:** Never declare a UI element "correct" based on a screenshot alone. Always verify element position and size with `evaluate_script` and `getBoundingClientRect()` first. Screenshots can look fine while an element is actually off-screen or overlapping something else.

### Figma MCP — design-to-code workflow

1. Share a Figma URL in the Claude Code chat
2. Use `/figma:implement-design` to start a guided workflow
3. Claude fetches design context, generates code adapted to your project's stack
4. Use `/figma:code-connect-components` to map Figma components to your actual code components

---

## Troubleshooting

**`chrome-devtools` not in `/mcp` list?**
- Re-run `/plugin install chrome-devtools-mcp` in a Claude Code session
- Restart Claude Code to reload plugins

**Chrome not connecting (list_pages returns nothing)?**
- Ensure Chrome is running via `pnpm dev:browser` (or manually via the `.bat` file)
- Check port 9222 is free:
  - macOS: `lsof -i :9222`
  - Windows: `netstat -ano | findstr :9222`
- Only one Chrome instance can use port 9222 at a time — close other Chrome debugging sessions

**Chrome opens before Vite is ready?**
- The `wait-on` package gates the browser launch — if it's missing: `pnpm add -D wait-on`

**Chrome Beta not found (macOS)?**
- Install from: https://www.google.com/chrome/beta/
- The script will fall back to Chrome stable if Beta isn't found

**Chrome not found (Windows)?**
- Update the path in `scripts/launch-chrome-beta.bat` to match your installation

**Figma not in `/mcp` list?**
- Re-run `claude plugin install figma@claude-plugins-official`
- Restart Claude Code

**Figma rate limit hit?**
- Starter plan is limited to 6 tool calls/month — upgrade to a paid plan for more

---

## How it works

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Claude Code   │────▶│  Chrome DevTools MCP │────▶│  Chrome Browser │
│                 │     │  (local process)     │     │  (port 9222)    │
│                 │     └──────────────────────┘     └─────────────────┘
│                 │
│                 │     ┌──────────────────────┐
│                 │────▶│  Figma MCP           │────▶  mcp.figma.com
│                 │     │  (cloud-hosted)      │       (internet)
└─────────────────┘     └──────────────────────┘
```

**Chrome DevTools MCP:**
1. `pnpm dev:browser` starts Vite and launches Chrome with `--remote-debugging-port=9222`
2. The MCP plugin (installed via `/plugin install`) connects to that port using the Chrome DevTools Protocol
3. Claude can now see and interact with the browser

**Figma MCP:**
1. Plugin installed via `claude plugin install figma@claude-plugins-official`
2. Connects directly to `mcp.figma.com` over the internet — nothing runs locally
3. Claude can read Figma designs from any URL you share

---

*See `docs/CHROME_DEVTOOLS_MCP_SETUP.md` for the full Claude onboarding prompt that sets all of this up automatically.*
