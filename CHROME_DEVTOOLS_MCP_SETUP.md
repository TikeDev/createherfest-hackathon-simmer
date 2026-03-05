# Chrome DevTools MCP + Figma MCP Setup — Onboarding Prompt for Claude Code

> **This file is a prompt.** Paste it (or its contents) into a new Claude Code session in the target project. Claude will read it and execute every step.

---

## What you are setting up

Two MCP plugins that give Claude Code the ability to see and interact with the browser and Figma designs:

| Plugin | What it gives Claude | Requires Chrome? |
|---|---|---|
| **Chrome DevTools MCP** | 29 browser tools + 4 skills (debugging, accessibility, LCP, troubleshooting) | Yes — Chrome running on port 9222 |
| **Figma MCP** | Figma design tools + 3 skills (implement-design, code-connect, design-system-rules) | No — cloud-hosted |

**Plugin installs are per-developer-machine (once per teammate).** The Chrome launch scripts are committed to the repo (one-time setup).

---

## Instructions for Claude Code

When a teammate opens this project and starts a new Claude Code session, they should paste this prompt:

---

```
Hi Claude. Please help me set up the Chrome DevTools MCP and Figma MCP plugins for this project. Follow these steps in order. Read each file before modifying it. Do not skip any step.

---

### Step 0 — Check prerequisites

1. Verify Node.js version:
   ```bash
   node --version
   ```
   Must be v20.19 or newer. If not, stop and notify the teammate — they'll need to upgrade Node first.

2. Confirm Chrome Beta or Chrome stable is installed.
   - macOS: check `/Applications/Google Chrome Beta.app` exists
   - If Chrome Beta is not found, note it — regular Chrome stable also works, but Beta is recommended (keeps debugging sessions isolated from personal browsing)

---

### Step 1 — Install Chrome DevTools MCP plugin (tools + skills)

Run these two commands inside a Claude Code session (or instruct Claude to run them):

```
/plugin marketplace add ChromeDevTools/chrome-devtools-mcp
/plugin install chrome-devtools-mcp
```

This installs:
- 29 browser tools (take_screenshot, list_pages, evaluate_script, list_console_messages, list_network_requests, etc.)
- 4 bundled skills: general debugging, accessibility debugging, LCP optimization, troubleshooting

After installing, run `/mcp` to confirm `chrome-devtools` appears in the connected servers list.

---

### Step 2 — Install Figma MCP plugin (tools + skills)

Run this command in the terminal:

```bash
claude plugin install figma@claude-plugins-official
```

This installs:
- Figma design tools (get_design_context, get_screenshot, get_variable_defs, etc.)
- 3 bundled skills: /figma:implement-design, /figma:code-connect-components, /figma:create-design-system-rules

Notes:
- Cloud-hosted at https://mcp.figma.com/mcp — no local server, no Chrome required
- Rate limits: starter plan = 6 calls/month; paid plan = Tier 1 per-minute

After installing, run `/mcp` to confirm `figma` appears in the connected servers list.

---

### Step 3 — Detect the Vite port

Read `vite.config.ts`. Find `server.port`. If not set, the default is 5173.
Use this port value in Steps 4 and 5 below (replace <PORT> with the actual number).

---

### Step 4 — Create the macOS Chrome launch script

Create `scripts/launch-chrome-beta.sh` with this content (replace <PROJECT_NAME> with the actual project folder name, and <PORT> with the port from Step 3):

```bash
#!/bin/bash
# Launch Chrome Beta with remote debugging for MCP server connection
# Usage: ./launch-chrome-beta.sh [--fresh] [URL]
#   --fresh: Use temporary profile (default: persistent profile)
#   URL: URL to open (default: http://localhost:<PORT>)

CHROME_BETA_PATH="/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta"
CHROME_STABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PERSISTENT_PROFILE="$HOME/.<PROJECT_NAME>-chrome-debug"
TEMP_PROFILE="/tmp/<PROJECT_NAME>-debug-profile-$$"
DEFAULT_URL="http://localhost:<PORT>"

# Pick whichever Chrome is available (Beta preferred)
if [ -f "$CHROME_BETA_PATH" ]; then
  CHROME_PATH="$CHROME_BETA_PATH"
elif [ -f "$CHROME_STABLE_PATH" ]; then
  CHROME_PATH="$CHROME_STABLE_PATH"
  echo "⚠️  Chrome Beta not found, falling back to Chrome stable"
  echo "   Install Chrome Beta for an isolated debug profile: https://www.google.com/chrome/beta/"
else
  echo "❌ No Chrome installation found"
  exit 1
fi

USE_FRESH=false
TARGET_URL="$DEFAULT_URL"

for arg in "$@"; do
  if [[ "$arg" == "--fresh" ]]; then
    USE_FRESH=true
  elif [[ "$arg" == http* ]]; then
    TARGET_URL="$arg"
  fi
done

if [ "$USE_FRESH" = true ]; then
  USER_DATA_DIR="$TEMP_PROFILE"
  echo "🧹 Using temporary profile (will be cleaned on close)"
else
  USER_DATA_DIR="$PERSISTENT_PROFILE"
  echo "💾 Using persistent profile at $PERSISTENT_PROFILE"
fi

echo "🚀 Launching Chrome with remote debugging on port 9222..."
echo "   Opening: $TARGET_URL"

"$CHROME_PATH" \
  --remote-debugging-port=9222 \
  --user-data-dir="$USER_DATA_DIR" \
  --no-first-run \
  --no-default-browser-check \
  --disable-default-apps \
  "$TARGET_URL"
```

Then make it executable:
```bash
chmod +x scripts/launch-chrome-beta.sh
```

---

### Step 5 — Create the Windows Chrome launch script

Create `scripts/launch-chrome-beta.bat` with this content (replace <PROJECT_NAME> and <PORT>):

```batch
@echo off
REM Launch Chrome with remote debugging for MCP server connection
REM Usage: launch-chrome-beta.bat [--fresh] [URL]

SET CHROME_BETA_PATH=C:\Program Files\Google\Chrome Beta\Application\chrome.exe
SET CHROME_STABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
SET PROFILE_DIR=%USERPROFILE%\.<PROJECT_NAME>-chrome-debug
SET DEFAULT_URL=http://localhost:<PORT>
SET TARGET_URL=%DEFAULT_URL%
SET USE_FRESH=false
SET CHROME_PATH=

REM Parse arguments
FOR %%A IN (%*) DO (
  IF "%%A"=="--fresh" SET USE_FRESH=true
  IF "%%A" NEQ "--fresh" IF NOT "%%A"=="" SET TARGET_URL=%%A
)

REM Pick whichever Chrome is available (Beta preferred)
IF EXIST "%CHROME_BETA_PATH%" (
  SET CHROME_PATH=%CHROME_BETA_PATH%
) ELSE IF EXIST "%CHROME_STABLE_PATH%" (
  SET CHROME_PATH=%CHROME_STABLE_PATH%
  echo Warning: Chrome Beta not found, using Chrome stable
) ELSE (
  echo No Chrome installation found. Install from: https://www.google.com/chrome/
  exit /b 1
)

IF "%USE_FRESH%"=="true" (
  SET PROFILE_DIR=%TEMP%\<PROJECT_NAME>-debug-profile
  echo Using temporary profile
) ELSE (
  echo Using persistent profile at %PROFILE_DIR%
)

echo Launching Chrome with remote debugging on port 9222...
echo Opening: %TARGET_URL%

"%CHROME_PATH%" ^
  --remote-debugging-port=9222 ^
  --user-data-dir="%PROFILE_DIR%" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-default-apps ^
  %TARGET_URL%
```

---

### Step 6 — Add dev:browser scripts to package.json

Read `package.json`. Add these entries to the `"scripts"` object (use the port from Step 3):

```json
"dev:browser": "vite & wait-on http://localhost:<PORT> && ./scripts/launch-chrome-beta.sh",
"dev:browser:fresh": "vite & wait-on http://localhost:<PORT> && ./scripts/launch-chrome-beta.sh --fresh"
```

If `wait-on` is not already in `devDependencies`, install it:
```bash
pnpm add -D wait-on
```

**Windows note:** The `&` operator and bash script won't work natively on Windows. Windows teammates run two terminals manually — see `CHROME_DEVTOOLS_MCP_GUIDE.md`.

---

### Step 7 — Update .gitignore

Read `.gitignore`. Ensure these lines are present (add if missing):

```
# Chrome debugging profiles — local only
.mcp.json
.claude/settings.local.json
```

---

### Step 8 — Add Chrome DevTools debugging flow to CLAUDE.md

Read `CLAUDE.md`. Add this section (or merge into an existing debugging section):

```markdown
## Chrome DevTools MCP Debugging Flow

When debugging with Claude Code + Chrome DevTools MCP:

1. Start dev server with Chrome: `pnpm dev:browser`
2. In Claude Code, verify MCP is connected: `/mcp` → should show `chrome-devtools`
3. Standard debugging sequence:
   - `list_pages` → find the right page ID
   - `select_page` → focus that page
   - `take_snapshot` → read DOM state (prefer over screenshot)
   - `evaluate_script` → run JS to check element positions, state, etc.
   - `list_console_messages` with `types: ["error"]` → catch runtime errors
   - `list_network_requests` → find stuck/failed requests

**Rule:** Never declare a UI element "correct" based on a screenshot alone.
Always verify with `evaluate_script` and `getBoundingClientRect()` first.
```

---

### Step 9 — Commit the repo files

Stage and commit only these files:

```
scripts/launch-chrome-beta.sh
scripts/launch-chrome-beta.bat
CHROME_DEVTOOLS_MCP_GUIDE.md
CLAUDE.md (if updated)
package.json (if updated)
.gitignore (if updated)
```

Show the teammate a draft commit message before running `git commit` — do not commit automatically.

---

### Step 10 — Verify

Once all steps are complete, confirm the setup by:
1. Running `pnpm dev:browser` and confirming Chrome opens at `http://localhost:<PORT>`
2. Typing `/mcp` in Claude Code and confirming both `chrome-devtools` and `figma` are listed
3. Running `list_pages` to confirm Chrome DevTools is connected
```

---

## Notes for teammates

- **Plugin installs (Steps 1–2) are per-machine** — each teammate runs them once in any Claude Code session
- **macOS:** Use `pnpm dev:browser` or `pnpm dev:browser:fresh` for the Chrome launch
- **Windows:** Run `pnpm dev` in Terminal 1, then `.\scripts\launch-chrome-beta.bat` in Terminal 2
- **Chrome Beta vs stable:** Beta is recommended (keeps debug profile separate from personal browsing), but stable works
- See `CHROME_DEVTOOLS_MCP_GUIDE.md` for full documentation and troubleshooting
