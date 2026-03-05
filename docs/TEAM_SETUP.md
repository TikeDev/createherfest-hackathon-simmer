# Team Setup Guide

## Table of Contents
- [🎨 Claude Code Figma Plugin (MCP + Skills)](#-claude-code-figma-plugin-mcp--skills)
- [🔍 Chrome DevTools MCP](#-chrome-devtools-mcp)

---

## 🎨 Claude Code Figma Plugin (MCP + Skills)

The Figma plugin for Claude Code lets you implement designs directly from Figma URLs, connect components via Code Connect, and generate design system rules.

### User-level install (global, recommended)

Available across all your projects:

```bash
claude plugin install figma@claude-plugins-official
```

### Project-level install

Scoped to this repo — no global install needed after cloning:

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp --scope project
```

---

## 🔍 Chrome DevTools MCP

Gives Claude Code the ability to inspect and interact with a Chrome browser — useful for debugging the PWA, checking network requests, and testing accessibility.

**Prerequisites:** Node.js v20.19+, Chrome (current stable or newer)

### User-level install (global, recommended)

```bash
claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest
```

### Project-level install

```bash
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest --scope project
```

### Slim mode (token-efficient, no advanced features)

Add `--slim --headless` flags — useful for CI or low-context sessions. Edit your MCP config manually:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--slim", "--headless"]
    }
  }
}
```

### Verify the install

Ask Claude: `"Check the performance of https://developers.chrome.com"` — Chrome will launch automatically.

