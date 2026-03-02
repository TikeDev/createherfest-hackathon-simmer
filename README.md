# Recipe Streamliner

A responsive web/PWA recipe app that supports people with temporary, chronic, or permanent physical and cognitive limitations. Built for the CreateHerFest Hackathon — submission deadline March 7, 2025.

## Table of Contents

- [What It Does](#what-it-does)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Docs](#docs)

---

## What It Does

Recipe Streamliner helps users find and follow recipes that actually work for their body and energy level — right now, not just in general. Users set up a persistent profile with their dietary needs, physical limitations, and tool restrictions. Then, when they want to cook, they can optionally describe how they're feeling (chips, free text, or both) and get personalized recommendations that respect hard safety constraints like allergens and restricted techniques.

Recommended recipes open in a simplified **Playbook View** designed for low-cognitive-load reading while cooking.

---

## Key Features

- **Persistent profile** — allergens, dietary patterns, dexterity/mobility limits, preferred appliances, cognitive load settings
- **Flexible session input** — state chips (low energy, pain flare, brain fog, etc.), free text, or both
- **Hard safety filtering** — allergens, excluded ingredients, restricted tools/techniques are never surfaced
- **Soft scoring** — time fit, energy fit, mood/comfort, sensory preferences, cleanup burden, appliance fit
- **Explainable recommendations** — every result shows why it was matched to the user
- **Playbook View** — simplified, step-checkable recipe format for cooking
- **Source-faithful substitutions** — ingredient alternatives are shown only when the original recipe provides them, and only if they pass safety constraints
- **Unknown intent handling** — if free text can't be interpreted, the user is offered a Clarify or Skip flow

---

## How It Works

```
User profile + optional session input (chips / text / both)
        ↓
Hard filter: block allergens, excluded ingredients, restricted tools
        ↓
Soft scoring: time, energy, appliance fit, cleanup, sensory match
        ↓
Ranked recommendations with "Why this fits you" reasons
        ↓
Recipe detail → Playbook View → step-by-step cooking mode
```

See [docs/PlanOverviewDiagram.md](docs/PlanOverviewDiagram.md) for full Mermaid flow diagrams.

---

## Tech Stack

- **Frontend** — React (PWA)
- **Storage** — IndexedDB (local recipe cache + offline support)
- **AI** — LLM agent (GPT-4o) for recipe extraction and text intent parsing
- **Recipe source** — Curated tagged dataset of 50–150 recipes (primary); optional URL import (secondary)

---

## Project Structure

```
recipe-streamliner/
├── docs/
│   ├── InitialMVPPlan.md           # Full MVP spec, data types, and two-week plan
│   ├── PLAN-RECIPE_EXTRACTION_AGENT.md  # Recipe extraction agent spec
│   └── PlanOverviewDiagram.md      # Mermaid flow diagrams
├── src/
├── tests/
└── README.md
```

---

## Docs

| File | Description | When to consult |
|------|-------------|-----------------|
| [docs/InitialMVPPlan.md](docs/InitialMVPPlan.md) | MVP scope, data types, APIs, test criteria | Planning features or writing code |
| [docs/PLAN-RECIPE_EXTRACTION_AGENT.md](docs/PLAN-RECIPE_EXTRACTION_AGENT.md) | Recipe extraction agent pipeline and tools | Building or modifying the AI extraction flow |
| [docs/PlanOverviewDiagram.md](docs/PlanOverviewDiagram.md) | Mermaid architecture diagrams | Understanding system flow at a glance |
