# AGENTS.MD - Street Hustle Project Guide for AI Agents

Welcome, Agent! This document provides guidelines and information to help you understand and effectively contribute to the "Street Hustle" game project.

## 1. Project Overview

"Street Hustle" is a narrative simulation game where the player navigates the challenges and opportunities of street-level dealing. The game focuses on resource management (cash, inventory, heat), relationship building (loyalty, street cred), and making choices that have consequences in a dynamic urban environment. Key features include customer interactions, an inventory system, a phone UI with apps (messaging, contacts, map, news, minigames), and world events that impact gameplay.

## 2. Core Architecture & Components

The project follows a modular architecture with a clear separation of concerns:

*   **`script.js` (Main Controller):**
    *   **Role:** Orchestrates the entire game. Initializes systems, manages the main game loop (`nextFiend`, `startGameFlow`, `endGame`), handles high-level event listening, and coordinates actions between various managers and the UI.
    *   **Agent Interaction:** Modify for changes to the overall game sequence, turn progression logic (`handleTurnProgressionAndEvents`), or how major game events (like starting a new game or processing player choices in `handleChoice`) are handled at a high level.

*   **`GameState.js` (Central State):**
    *   **Role:** The single source of truth for all dynamic game data. This includes player stats (cash, heat, inventory, skills), progression markers (day, fiends left), world state (active events, event modifiers), social states (street cred, loyalty, player contacts, map state), and player history (choices, systemic variables).
    *   **Agent Interaction:** When adding new state variables, ensure they are initialized in the constructor, reset in `resetToDefault` (and considered for NG+ carry-over if applicable), and included in `toJSON()` and `fromJSON()` for saving/loading. Use provided getters and setters for modification.

*   **`UIManager.js` (UI Controller):**
    *   **Role:** Solely responsible for all direct DOM manipulations. Updates HUD elements, manages screen transitions (splash, main menu, game, end screen), handles modal dialogs (inventory), and controls the phone UI states and rendering (chat, apps).
    *   **Agent Interaction:** If new UI elements are added to `index.html` or existing ones need new behaviors, `UIManager.js` is the place to implement the JavaScript logic for interacting with them. Avoid direct DOM manipulation in other files.

*   **`classes/CustomerManager.js` (Customer Interaction Logic):**
    *   **Role:** Manages customer generation, selection (including cooldowns and daily interaction limits), and the entire flow of an interaction (dialogue, item offerings, price calculations). Acts as a "Scene Director" using contextual information.
    *   **Agent Interaction:** This is the primary file for altering how customer encounters play out. Changes to dialogue selection logic (`_getDialogue`), item generation by customers (`_generateRandomItem`), price calculations (`_calculateItemValue`), or the overall structure of `generateInteraction` belong here. It heavily relies on `data/customer_templates.js`.

*   **Manager Modules (`managers/*.js`):** Each manager encapsulates logic for its specific domain.
    *   `StreetCredManager.js`: Manages the complex street cred system and processes etiquette rules.
    *   `LoyaltyManager.js`: Tracks and updates loyalty with NPCs.
    *   `WorldEventManager.js`: Triggers and manages world events, applies their effects, and checks for game consequences.
    *   `ItemEffectManager.js`: Processes item effects (e.g., `effectsOnSell`).
    *   `ContactsManager.js`: Manages player contacts, unlocking, and associated data.
    *   `MapManager.js`: Manages map districts and player's map state.
    *   `NewsManager.js`: Manages display of news articles.
    *   **Agent Interaction:** For logic changes specific to these domains (e.g., how street cred is calculated, how new events are triggered), modify the relevant manager.

*   **`utils.js`:** Contains shared utility functions (e.g., `getRandomElement`, `debugLogger`, `isLocalStorageAvailable`). Add new general-purpose helper functions here.
*   **`phone_ambient_ui.js`:** Handles the visual elements of the phone that are not app-specific (time, battery, wallpaper, generic notifications).

## 3. Data Organization & Structures

The game is heavily data-driven. Content and configurations are primarily stored in JavaScript files within the `data/` directory.

*   **`data/customer_templates.js`:**
    *   **Structure:** Defines customer archetypes as objects. Each archetype has `key`, `baseName`, `avatarUrl`, `baseStats` (initial mood, loyalty), `gameplayConfig` (buy/sell preferences, price tolerance, heat/cred impacts), and `dialogue`.
    *   **Dialogue System (V4 - Contextual):** The `dialogue` object is critical.
        *   `greeting`: A nested object: `greeting: { new_customer: { seeking_to_buy: [], seeking_to_sell: [] }, returning_customer: { seeking_to_buy_usual: [], seeking_to_buy_general: [], seeking_to_sell: [] } }`. Each path leads to an array of dialogue blocks.
        *   Dialogue Blocks: `{ "moods": ["mood1", "mood2"], "lines": ["line1", "line2"], "payload": { ... } }`. `moods` is optional.
        *   Other Contexts: `lowCashRikk`, `rikkDeclinesToBuy`, `usual_unavailable`, `interruption_sirens_nearby`, `sell_success_alternative`, etc., follow a similar array-of-blocks structure, where blocks can have `moods` and/or legacy `conditions`.
    *   **Agent Interaction:** Adding new customers or significantly altering existing ones requires careful updates to this file, adhering to the established nested structure. Pay close attention to providing dialogue for all relevant contexts and moods.

*   **`data/data_items.js`:**
    *   Defines `ITEM_QUALITY_LEVELS`, `ITEM_QUALITY_MODIFIERS`.
    *   `itemTypes` array: Each item has `id`, `name`, `baseValue`, `type`, `subType`, `heat`, `description`, `effects` (array of strings/objects), `addictionChance`, and optional `effectsOnSell`.
    *   **Agent Interaction:** For new items or item balance changes. Ensure all relevant properties are defined.

*   **`data/data_events.js`:**
    *   `possibleWorldEvents` array: Each event has `id`, `name`, `description`, `duration`, and `effects` (object impacting game state like `heatModifier`, `customerScareChance`).
    *   **Agent Interaction:** For new world events or modifying existing ones.

*   **`data/contacts_data.js`:** Defines contacts with `id`, `name`, `description`, `unlock_requirements`, `services`, `missions`.
*   **`data/map_data.js`:** Defines game districts, their properties, and default states.
*   **`data/etiquette_rules.js` & `data/feedback_messages.js`:** Define the street etiquette system triggers, impacts, and player feedback.
*   **`data/consequences.js`:** Defines long-term consequences based on player choices and game state.
*   **`data/news_articles.js`:** Static news articles for the in-game phone app.

## 4. Key Gameplay Loops & Mechanics

*   **Customer Interaction:**
    1.  `script.js` (`nextFiend` -> `generateAndStartCustomerInteraction`) requests an interaction from `CustomerManager`.
    2.  `CustomerManager.generateInteraction` uses contextual analysis (player history, customer mood, intent, environment, cooldowns, daily limits) to select/generate a customer and craft the interaction (greeting, item offers/requests, dialogue).
    3.  `UIManager` displays dialogue and choices.
    4.  Player choice is processed by `script.js:handleChoice`, which updates `GameState` and may trigger further dialogue or effects via `CustomerManager.getOutcomeDialogue` and `ItemEffectManager`.
*   **Turn Progression (`handleTurnProgressionAndEvents` in `script.js`):**
    1.  Clears `GameState.customersInteractedThisTurn`.
    2.  Advances day of the week.
    3.  Updates world events (duration, new triggers) via `WorldEventManager`.
    4.  Applies passive heat changes.
    5.  Checks for consequences via `WorldEventManager`.
*   **Save/Load:**
    *   Triggered by `saveGameState()` in `script.js` (usually after interactions).
    *   `GameState.toJSON()` and `CustomerManager.getSaveState()` gather data.
    *   `localStorage` key: `myNiggaRikkSaveDataV10`.
    *   Loading via `loadGameState()` in `script.js` uses `GameState.fromJSON()` and `CustomerManager.loadSaveState()`.
    *   NG+ ("Run it Back") selectively preserves state via `initializeNewGameState` and `GameState.resetToDefault`.

## 5. Agent Interaction Guidelines & Conventions

*   **Primary Logic Files:**
    *   High-level game flow: `script.js`
    *   State definition & persistence: `GameState.js`
    *   Customer behavior & dialogue logic: `CustomerManager.js`
    *   UI rendering & interaction: `UIManager.js`
    *   Domain-specific rules: Respective `managers/*.js` files.
*   **Content vs. Logic:**
    *   **Content** (dialogue text, item stats, customer archetypes, event details) should almost always be modified in the `data/` files.
    *   **Logic** (how content is used, rules, calculations, state changes) should be modified in the JS class/manager files.
*   **Dialogue:** When adding/modifying dialogue, ensure it fits the new contextual structure in `customer_templates.js`. Provide variations for moods and relevant contexts (new/returning, intent, etc.).
*   **Placeholders:** Use `[CUSTOMER_NAME]`, `[ITEM_NAME]`, `[USUAL_ITEM_NAME]` in dialogue strings where appropriate. `CustomerManager._getDialogue` handles their replacement.
*   **Adding New Game Elements:**
    *   **New Item:** Add to `data/data_items.js`. Consider its effects and if customers should trade it.
    *   **New Customer Archetype:** Add to `data/customer_templates.js` with full dialogue structure and `gameplayConfig`. Add avatar to `assets/images/contacts` (if applicable) and update `customerAvatars` in `script.js`.
    *   **New World Event:** Add to `data/data_events.js`. Ensure its effects are handled in `WorldEventManager` and potentially `getCombinedActiveEventEffects` in `script.js`.
    *   **New UI Element:** Define in `index.html`, add selectors and control logic in `UIManager.js`, and hook up events in `script.js` if needed.
*   **Debugging:**
    *   The `DEBUG_MODE` flag (controlled by `localStorage.getItem('rikkDebugMode') === 'true'`) enables verbose console logging via `debugLogger` from `utils.js`. Use this for tracing issues.
    *   `console.log` with `[MANAGER_NAME]` or `[COMPONENT_NAME]` prefix is encouraged for new logs.
*   **CSS:** Use variables from `assets/css/variables.css` for consistency. Modify component-specific CSS files.
*   **Commit Messages:** (No explicit convention observed, but standard practice is useful)
    *   `Feat: Brief description of new feature.`
    *   `Fix: Brief description of bug fixed.`
    *   `Refactor: Description of code improvement without behavior change.`
    *   `Docs: Changes to documentation.`
    *   `Chore: Maintenance, build tasks, etc.`
*   **Testing:** After making changes, conceptually walk through the affected game loops and contexts to ensure logical consistency and that no regressions were introduced. Pay special attention to how changes affect save/load and different game states.

This document should serve as a good starting point. It will evolve as the project does.
