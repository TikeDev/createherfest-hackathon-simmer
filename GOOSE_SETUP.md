# Goose Setup for This Project

This project includes a `goose.yaml` configuration file that automatically sets up useful extensions for development.

## Included Extensions

### Chrome DevTools MCP
Enables browser automation, debugging, and testing directly from Goose.

## Prerequisites

Before using the Chrome DevTools extension, you need to:

1. **Install Goose** - https://github.com/block/goose
2. **Install dependencies**:
   ```bash
   pnpm install
   ```

## Starting Development with Chrome DevTools

This project has convenient scripts that launch both the dev server AND Chrome with remote debugging enabled:

### macOS (Chrome Beta)
```bash
# Standard launch
pnpm dev:browser

# Fresh profile (clean session)
pnpm dev:browser:fresh
```

### Windows (Brave)
```bash
# Standard launch
pnpm dev:browser:brave

# Fresh profile (clean session)
pnpm dev:browser:brave:fresh
```

### Manual Launch (if needed)

If you prefer to launch the browser separately:

**macOS (Chrome):**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

**Linux (Chrome):**
```bash
google-chrome --remote-debugging-port=9222
```

**Windows (Chrome):**
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

Then start the dev server separately:
```bash
pnpm dev:full
```

## Using Goose

Once the browser is running with remote debugging:
1. **Start Goose** in this project directory
2. Extensions will be automatically available!

## What Can You Do?

With Chrome DevTools MCP, Goose can:
- 📸 Take screenshots of pages
- 🔍 Inspect DOM elements
- 🖱️ Click, type, and interact with the page
- 📊 Run Lighthouse audits (performance, accessibility, SEO)
- 🌐 Monitor network requests
- 💻 Execute JavaScript in the browser console
- 📱 Emulate mobile devices

## Example Commands

Ask Goose things like:
- "Take a screenshot of the current page"
- "Run a Lighthouse audit on the homepage"
- "Click the submit button and check for errors"
- "Navigate to /recipes and list all recipe cards"
