# Hackathon Project: Recipe Streamliner
**Deadline:** March 7th (Night of Submission)

## 📋 Project Overview
A web or mobile application designed to strip away the clutter of modern recipe sites, providing a "Playbook View" that is simplified, accessible, and deeply personalized to specific dietary restrictions and ingredient preferences.

---

## 🚀 Phase 1: Core Objectives (MVP)

### 1. Recipe Extraction Engine
* **Link-to-Text Functionality:** A simple interface where users paste a URL to fetch recipe data.
* **Basic Parser:** Implementing the initial logic to separate ingredients and instructions from ads, life stories, and SEO fluff.
* **Source Fidelity:** Ensuring the extraction process captures 100% of the original data before any transformation occurs.

### 2. "Playbook View" Transformation
* **LLM Integration:** Using an LLM (assisted by coding agents like Codex) to reformat extracted text into a clean, comprehensible structure.
* **Prompt Engineering:** Developing a specific system prompt to ensure the "Playbook View" version remains 100% faithful to the original cooking steps while improving readability.
* **Verification:** A basic manual or semi-automated check to ensure no ingredients or steps are lost in translation.

### 3. Granular User Profiles
* **Deep Restrictions:** Moving beyond standard options (ex. Vegetarian, Gluten Free, Pescatarian etc) to include more specific choices (e.g., *Only animals Chicken, Turkey*).
* **Allergy Management:** High-priority toggles for common and custom allergens.
* **View Preferences:** Settings for default views (Original vs. Playbook View) and font/accessibility adjustments.

---

## 🛠 Technical Implementation Details
* **Coding Strategy:** Utilize coding agents to accelerate the UI build and the extraction logic.
* **Agent Guidance:** Create a "Evaluation Suite" for the LLM to test the accuracy of the recipe conversions.
* **Interface:** A clean, minimalist UI focused on the recipe import and the streamlined reading view.

---

## 🌟 Stretch Goals & Nice-to-Haves

### Advanced Sharing Features
* **Smart Links:** The ability to share either the original source link or a generated "Playbook View" link with others outside the app.

### Robust Evaluation Framework
* **Automated Testing Suite:** A more sophisticated "faithfulness" test to programmatically compare the original recipe with the LLM-generated version to catch errors or omissions.

### Enhanced Accessibility
* **Adaptive UI:** Beyond simple font sizes, including high-contrast modes and screen-reader optimizations tailored for kitchen environments (e.g., hands-free navigation).

### Complex Extraction
* **Anti-Scraping Workarounds:** Developing methods to handle recipe sites that attempt to block automated fetching or "stave off" parsers.

