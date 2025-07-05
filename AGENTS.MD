# AGENTS.MD - Street Hustle Project Guide

## Introduction: The Soul of the Hustle

This document is the definitive guide to the "agents" of the "Street Hustle" codebase. These are not mere scripts; they are the living systems that give the game its soul. Each manager acts as a character in the grand play of the streets—the `CustomerManager` is the social puppet master, the `WorldEventManager` is the chaotic pulse of the city itself, and the `GameState` is Rikk's very memory and consciousness.

Understanding these agents is key to understanding the game's architecture. Their purpose is to translate the core themes of **the hustle, precariousness, and moral ambiguity** into tangible mechanics. This guide explains their roles, their motivations, and how they work together to create a reactive, living world. It is a map for any developer—human or AI—to navigate the complex web of Rikk's reality.

---

## 1. Project Overview

"Street Hustle" is a narrative simulation game where the player navigates the challenges and opportunities of street-level dealing. The game focuses on resource management (cash, inventory, heat), relationship building (loyalty, street cred), and making choices that have consequences in a dynamic urban environment. Key features include customer interactions, an inventory system, a phone UI with apps (messaging, contacts, map, news, minigames), and world events that impact gameplay.

---

## 2. Core Architecture & Components

The project follows a modular architecture with a clear separation of concerns:

*   **`script.js` (Main Controller):**
    *   **Role:** Orchestrates the entire game. Initializes systems, manages the main game loop (`nextFiend`, `startGameFlow`, `endGame`), handles high-level event listening, and coordinates actions between various managers and the UI.
    *   **Agent Interaction:** Modify for changes to the overall game sequence, turn progression logic (`handleTurnProgressionAndEvents`), or how major game events (like starting a new game or processing player choices in `handleChoice`) are handled at a high level.

*   **`GameState.js` (Central State):**
    *   **Role:** The single source of truth for all dynamic game data. This includes player stats (cash, heat, inventory, skills), progression markers (day, fiends left), world state (active events, event modifiers), social states (street cred, loyalty, player contacts, map state), player history (choices, systemic variables), and `customersInteractedThisTurn`.
    *   **Agent Interaction:** When adding new state variables, ensure they are initialized in the constructor, reset in `resetToDefault` (and considered for NG+ carry-over if applicable), and included in `toJSON()` and `fromJSON()` for saving/loading. Use provided getters and setters for modification.

*   **`UIManager.js` (UI Controller):**
    *   **Role:** Solely responsible for all direct DOM manipulations. Updates HUD elements, manages screen transitions (splash, main menu, game, end screen), handles modal dialogs (inventory), and controls the phone UI states and rendering (chat, apps).
    *   **Agent Interaction:** If new UI elements are added to `index.html` or existing ones need new behaviors, `UIManager.js` is the place to implement the JavaScript logic for interacting with them. Avoid direct DOM manipulation in other files.

*   **`classes/CustomerManager.js` (Customer Interaction Logic):**
    *   **Role:** Manages customer generation, selection (including cooldowns and daily interaction limits), and the entire flow of an interaction (dialogue, item offerings, price calculations). Acts as a "Scene Director" using contextual information.
    *   **Agent Interaction:** This is the primary file for altering how customer encounters play out. Changes to dialogue selection logic (`_getDialogue`), item generation by customers (`_generateRandomItem`), price calculations (`_calculateItemValue`), or the overall structure of `generateInteraction` belong here. It heavily relies on the customer blueprint defined in `data/customer_templates.js`.

*   **Manager Modules (`managers/*.js`):** Each manager encapsulates logic for its specific domain.
    *   `StreetCredManager.js`: Manages the complex street cred system (global, factional, district, community figures) and processes etiquette rules from `data/etiquette_rules.js`.
    *   `LoyaltyManager.js`: Tracks and updates loyalty with NPCs, stored in `GameState.loyalty`.
    *   `WorldEventManager.js`: Triggers and manages world events from `data/data_events.js`, applies their effects (including global modifiers stored in `GameState.activeEventModifiers`), and checks for game consequences defined in `data/consequences.js`.
    *   `ItemEffectManager.js`: Processes item effects (e.g., `effectsOnSell` defined in `data/data_items.js`), modifying `GameState`.
    *   `ContactsManager.js`: Manages player contacts based on `data/contacts_data.js`, handling unlocking based on street cred and storing unlocked contacts in `GameState.playerContacts`.
    *   `MapManager.js`: Manages map districts from `data/map_data.js` and player's map state (e.g., discovered districts) stored in `GameState.mapState`.
    *   `NewsManager.js`: Manages display of news articles from `data/news_articles.js` in the phone UI.
    *   **Agent Interaction (General for Managers):** For logic changes specific to these domains (e.g., how street cred is calculated, how new events are triggered, how loyalty changes), modify the relevant manager. Ensure interactions with `GameState` are consistent.

*   **Utility & UI-Specific Logic:**
    *   `utils.js`: Contains shared utility functions (e.g., `getRandomElement`, `debugLogger`, `isLocalStorageAvailable`). Add new general-purpose helper functions here.
    *   `phone_ambient_ui.js`: Handles the visual elements of the phone that are not app-specific (time, battery, wallpaper, generic notifications via `showNotification`).

---

## 3. Data Organization & Structures

The game is heavily data-driven. Content and configurations are primarily stored in JavaScript files within the `data/` directory.

### 3.1. The Customer Blueprint (`data/customer_templates.js`)

#### The Story & Symbolism

The `customer_templates.js` file is the project's casting office. It is where the soul of every character—from the desperate fiend to the arrogant high roller—is defined. Each template is not merely a data object; it is the DNA of a character, dictating their needs, their vices, their voice, and their role in Rikk's precarious world. A well-defined template, following this blueprint, allows the `CustomerManager` agent to direct a believable, dynamic scene rather than just serving a random encounter.

#### Top-Level Archetype Structure

Each customer archetype is an object within the main `customerTemplates` export. It must contain the following top-level keys:

*   `key` (String): The unique, machine-readable identifier for the archetype. Convention is `UPPERCASE_SNAKE_CASE`. (e.g., `"DESPERATE_FIEND"`)
*   `baseName` (String): The human-readable name used for generating instances. (e.g., `"Jittery Jerry"`)
*   `avatarUrl` (String): A URL pointing to the character's portrait image. (e.g., `"assets/images/contacts/desperate_fiend.png"`)
*   `baseStats` (Object): The character's default starting state. Contains `mood` (e.g., `"desperate"`), `loyalty` (number), `patience` (number), and `relationship` (number).
*   `gameplayConfig` (Object): Defines all mechanical and transactional behaviors.
*   `dialogue` (Object): Contains all dialogue for the character, structured by context.

#### The `gameplayConfig` Object

This object controls the character's transactional logic.

*   `buyPreference` / `sellPreference` (Object): Defines what items the character wants to buy from or sell to Rikk. Can use `type`, `subType`, `quality` (or `min/maxQuality`), `id`, `minBaseValue`, and `exclude` to filter items. Can use an `or: []` array for multiple preference sets.
*   `priceToleranceFactor` (Number): A multiplier for deal pricing. `< 1.0` means they are frugal; `> 1.0` means they are generous or careless with cash. This is a base, modified by mood in `CustomerManager`.
*   `negotiationResists` (Boolean): If `true`, the character will not engage in haggling.
*   `heatImpact` (Number): The base amount of `Heat` generated by a successful transaction with this character.
*   `credImpactSell` / `credImpactBuy` (Number): The base amount of `StreetCred` gained or lost when selling to or buying from this character.
*   `preferredDrugSubTypes` (Array of Strings): An array of drug `subType`s the character prefers, used by the addiction and "usual" item logic.
*   `sellsOnly` / `buysOnly` (Boolean, Optional): If `true`, restricts the character to only one type of transaction.

#### The Contextual Dialogue System & Requirements

The `dialogue` object is the character's brain. A "complete" character requires thoughtful dialogue for **all relevant contexts** to feel alive and prevent logical breaks. A full template requires authoring lines for approximately 15-20 unique contexts (including all greeting variations and new top-level contexts).

*   **The Greeting Structure:** The `greeting` context is the most complex. It is a nested object designed to select the perfect opening line based on history, intent, and mood.
    *   **Structure:** `greeting: { <history>: { <intent>: [ {dialogue_block} ] } }`
    *   **`<history>`:** `new_customer` or `returning_customer`.
    *   **`<intent>`:**
        *   For `new_customer`: `seeking_to_buy`, `seeking_to_sell`.
        *   For `returning_customer`: `seeking_to_buy_usual` (if preferred item in stock), `seeking_to_buy_general` (if preferred item not in stock, or general buy), `seeking_to_sell`.
    *   **Example (`REGULAR_JOE`):**
        ```javascript
        "greeting": {
            "new_customer": {
                "seeking_to_buy": [
                    { "moods": ["chill", "happy"], "lines": ["Yo, you Rikk? Heard good things. Just looking for a chill hookup."] }
                ]
            },
            "returning_customer": {
                "seeking_to_buy_usual": [
                    { "moods": ["chill"], "lines": ["Rikk, my man! Good to see you. Got my usual?"] }
                ],
                "seeking_to_sell": [
                    { "moods": ["desperate"], "lines": ["Yo Rikk... had to come up with some cash quick. See if this is worth anything to you."] }
                ]
            }
        }
        ```

*   **Dialogue Blocks:** Each array within a context (e.g., `new_customer.seeking_to_buy`) contains dialogue blocks.
    *   `moods` (Array of Strings, Optional): This block will only be considered if the customer's current `mood` matches one of the moods in the array. If omitted, it's a default line for that specific context path.
    *   `lines` (Array of Strings): The potential lines of dialogue for this block. The system will pick one at random.
    *   `payload` (Object, Optional): Can be used to trigger game effects when this dialogue is spoken (processed by `script.js:processPayload`).
    *   `conditions` (Array of Objects, Optional): Legacy condition system (e.g., `{"stat": "addictionStatus.isAddicted", "op": "is", "value": true}`). Checked by `CustomerManager._checkCondition`. New dialogue should primarily rely on the nested structure and mood.

*   **New Top-Level Dialogue Contexts (examples):**
    *   `usual_unavailable`: Triggered for a returning buyer when their preferred item is out of stock (e.g., `"Damn, Rikk, no [USUAL_ITEM_NAME]? What else you got?"`).
    *   `interruption_sirens_nearby`: Panicked dialogue for high-Heat event interruptions (e.g., `"(Sounds of sirens getting closer) Yo, what was that?! Forget this, I'm out!"`).
    *   `sell_success_alternative`: Acknowledges Rikk sold a substitute (e.g., `"This [ITEM_NAME] will have to do for now, I guess. Let me know when you get the [USUAL_ITEM_NAME]."`).
    *   Other existing contexts: `lowCashRikk`, `rikkDeclinesToBuy`, `rikkSellsSuccess`, etc.

#### Dialogue Content & Tone Requirements

This is the creative mandate. All dialogue must adhere to these principles to maintain the game's tone and realism.

*   **The Empathy Requirement: Understanding the Headspace**
    *   Writing for this game requires more than just clever phrasing; it requires an understanding of the character's state of mind, informed by the project's research documents (`docs/Drug_Game.md`, `docs/Drug_Humor_and_Culture.md`). The writer must be able to channel the specific energy of each archetype.
    *   **Example (`STIMULANT_USER`):** To write for "Motor-Mouth Marty," one must understand the fast-paced, fragmented, and often paranoid thought process associated with stimulant use. Dialogue should be filled with non-sequiturs, half-finished "brilliant" ideas, and an undercurrent of jittery energy.
    *   **Example (`DESPERATE_FIEND`):** To write for "Jittery Jerry," one must tap into the singular focus of withdrawal. Every line should be colored by their overwhelming need.

*   **Reflect the Archetype:** A `HIGH_ROLLER` must sound condescending. A `SNITCH` should sound overly curious.
*   **Mood is Paramount:** An `angry` character's greeting must be aggressive. A `paranoid` character's should be hushed.
*   **Be Contextually Flawless:**
    *   A character greeting Rikk to buy must *not* offer to sell in that same initial greeting phase. Intent is determined first by `CustomerManager`.
    *   A returning character asking for "the usual" implies a known preference.
    *   A returning character must *not* re-introduce themselves.
*   **Reveal the World:** Dialogue can hint at city events, police presence, new drug batches, etc.

### 3.2. Other Core Data Files

*   **`data/data_items.js`:**
    *   Defines `ITEM_QUALITY_LEVELS`, `ITEM_QUALITY_MODIFIERS`.
    *   `itemTypes` array: Each item has `id`, `name`, `baseValue`, `type` (DRUG, STOLEN_GOOD, INFORMATION, TOOL), `subType`, `heat` impact, `description`, `effects` (array of strings/objects for `ItemEffectManager`), `addictionChance`, and optional `effectsOnSell`.
    *   **Agent Interaction:** For new items or item balance changes. Ensure all relevant properties are defined.

*   **`data/data_events.js`:**
    *   `possibleWorldEvents` array: Each event has `id`, `name`, `description`, `duration`, and `effects` (object impacting game state like `heatModifier`, `customerScareChance`, `dealFailChance`).
    *   **Agent Interaction:** For new world events or modifying existing ones. Ensure effects are compatible with `WorldEventManager` and `getCombinedActiveEventEffects`.

*   **`data/contacts_data.js`:** Defines contacts with `id`, `name`, `avatarUrl`, `description`, `initialLoyalty`, `streetCredUnlockRequirement`, `services`, `missions`, and simple `dialogueTrees` (for non-transactional phone interactions).
    *   **Agent Interaction:** For adding new contacts or modifying existing ones.

*   **`data/map_data.js`:** `districtsData` array defines districts with `id`, `name`, `description`, `gridPosition`, `typicalCustomers`, `commonItemAvailability`, `ambientHeatModifier`, `size`.
    *   **Agent Interaction:** For map changes or additions.

*   **`data/etiquette_rules.js` & `data/feedback_messages.js`:** Define the street etiquette system (triggers, impacts on cred/loyalty, feedback messages).
    *   **Agent Interaction:** For tuning social dynamics and player feedback.

*   **`data/consequences.js`:** Defines long-term consequences based on player choices and systemic game stats.
    *   **Agent Interaction:** For adding narrative branches and reactive world changes.

*   **`data/news_articles.js`:** Static news articles for the in-game phone app, managed by `NewsManager`.
    *   **Agent Interaction:** For adding new narrative flavor or reflecting game events.

---

## 4. The Visual Identity (Theming & CSS Architecture)

### The Story & Symbolism

The game's visual identity is defined in `assets/css/variables.css` and is inspired by the **"One UI for Web"** design guide. The core principle is that style should be **semantic, consistent, and adaptable**. We do not style components with raw color codes; we style them with *purpose*. A button's background is not `#007bff`, it is `var(--color-button-primary-bg)`. This allows the entire visual feel of the game to be changed by modifying a central "palette," ensuring a cohesive and professional aesthetic that can easily switch between themes like light and dark mode.

### Theming Architecture & How-To Guide

The system uses CSS Custom Properties (variables) defined on the `:root` element. A `data-theme="dark"` attribute on the `<body>` tag overrides these root variables to apply the dark theme.

**To create or modify a theme:**

1.  **Work in `assets/css/variables.css`:** This is the central file for all theme definitions.
2.  **Define a New Theme Selector (Optional):** To create a new theme (e.g., "Grime"), add a new attribute selector:
    ```css
    [data-theme="grime"] {
      /* --grime-theme-overrides-go-here-- */
    }
    ```
3.  **Modify Core Theme Variables:** Within your theme selector (or within `:root` for the default light theme, and `[data-theme="dark"]` for dark), change the values of the core color variables. These will have the broadest impact.
    *   `--bg-color`: The absolute base background color.
    *   `--text-color`: The primary color for all body text.
    *   `--primary-color`: The main accent color for interactive elements.
    *   `--secondary-color`: A secondary accent color.
    *   `--color-surface`: The background for cards, modals, etc.
4.  **Leverage Semantic Aliases:** For most components, you will not need to change anything else. Their styles use semantic variables (e.g., `--color-button-primary-bg`, which is derived from `--primary-color`) that update automatically when the core theme colors change.
5.  **Apply Granular Overrides (If Needed):** If a specific component needs a unique color in your new theme that isn't covered by the core variables, you can override its specific variable (e.g., `--phone-sent-bubble-bg: #some-custom-color;`) within your theme selector.

### Core Theming Variables

All components should be styled using these semantic variables. Refer to `assets/css/variables.css` for the full list. Key categories include:

*   Core Colors: `--bg-color`, `--text-color`, `--primary-color`, `--secondary-color`, `--color-surface`.
*   Text Colors: `--color-text-base`, `--color-text-muted`, `--color-text-disabled`, `--color-text-link`.
*   Border Colors: `--color-border-strong`, `--color-border-medium`, `--color-border-light`.
*   Accent & Utility Colors: `--color-accent-gold`, `--color-success`, `--color-error`.
*   Button Colors: `--color-button-primary-bg`, `--color-button-secondary-bg`, etc.
*   Phone UI Colors: `--phone-bg-color`, `--phone-sent-bubble-bg`, etc.
*   HUD Colors: `--hud-status-bar-bg`, etc.

#### Sizing & Typography Variables (Generally Theme-Independent)

*   `--font-ui`, `--font-body`, `--font-display`: The primary font families for different UI contexts.
*   `--font-size-button`, `--font-size-body`, `--font-size-dialog-title`: The responsive type scale for text elements.
*   `--spacing-unit`: The base unit for all margins and paddings (default: 8px). All spacing (`--spacing-xs` to `--spacing-xl`) is derived from this unit.
*   `--radius-thumbnail-small`, `--radius-thumbnail-large`, `--modal-border-radius`, `--button-border-radius`: Standardized `border-radius` values for a consistent "soft" aesthetic.

---

## 5. Key Gameplay Loops & Mechanics

*   **Customer Interaction:**
    1.  `script.js` (`nextFiend` -> `generateAndStartCustomerInteraction`) requests an interaction from `CustomerManager`. `gameStateForCustomerManager` object is populated with current `inventory`, `cash`, `playerSkills`, `activeWorldEvents`, `combinedWorldEffects`, `customersInteractedThisTurn`, and `heat`.
    2.  `CustomerManager.generateInteraction` uses this full context for its "Scene Director" logic.
    3.  `UIManager` displays dialogue and choices.
    4.  Player choice in `script.js:handleChoice` updates `GameState`. `CustomerManager.getOutcomeDialogue` is called with appropriate context (including mood, and potentially `originalPreferredItemName` if an alternative was sold) to get customer's reaction. Effects are processed via `ItemEffectManager` or direct `GameState` changes. Customer ID added to `customersInteractedThisTurn` on successful transaction.

*   **Turn Progression (`handleTurnProgressionAndEvents` in `script.js`):**
    1.  `game.clearCustomersInteractedThisTurn()` is called.
    2.  Game day advances (`game.advanceDayOfWeek()`).
    3.  World events are updated by `WorldEventManager` (durations, new triggers).
    4.  Passive heat changes applied to `GameState.heat`.
    5.  `WorldEventManager.checkConsequences()` is called.
    6.  UI ticker updated.

*   **Save/Load:**
    *   Triggered by `saveGameState()` in `script.js` (primarily after interactions via `nextFiend` or `endCustomerInteraction`).
    *   `GameState.toJSON()` serializes core state, including `customersInteractedThisTurn`.
    *   `CustomerManager.getSaveState()` serializes its internal pool and cooldown states.
    *   Combined state saved to `localStorage` under key `myNiggaRikkSaveDataV10`.
    *   Loading via `loadGameState()` in `script.js` uses `GameState.fromJSON()` and `CustomerManager.loadSaveState()`. Manager re-initialization calls in `loadGameState` are minimal and non-destructive to loaded state.
    *   NG+ ("Run it Back") feature in `initializeNewGameState` selectively preserves specified parts of `GameState` (cash, inventory, cred, heat, skills, loyalty, contacts, map, choices, systemic) while resetting gameplay loop variables.

---

## 6. Agent Interaction Guidelines & Conventions

*   **Primary Logic Files:** (As listed in Section 2)
*   **Content vs. Logic:**
    *   **Content** (dialogue text, item stats, customer archetypes, event details) modifications should occur in the `data/` files.
    *   **Logic** (rules, calculations, state changes, how content is used) modifications belong in the JS class/manager files.
*   **Dialogue:** Adhere strictly to the V4 contextual structure in `customer_templates.js`. Ensure comprehensive coverage for moods and contexts. Use placeholders: `[CUSTOMER_NAME]`, `[ITEM_NAME]` (for current item in transaction), `[USUAL_ITEM_NAME]` (for originally preferred item if an alternative is offered/sold).
*   **Adding New Game Elements:**
    *   **New Item:** Add to `data/data_items.js`. Define all properties.
    *   **New Customer Archetype:** Add to `data/customer_templates.js` following the full V4 blueprint. Add avatar to `assets/images/contacts/` (convention) and update `customerAvatars` in `script.js`.
    *   **New World Event:** Add to `data/data_events.js`. Define effects handled by `WorldEventManager`.
    *   **New UI Element:** Define HTML in `index.html`. Add CSS to relevant `assets/css/` file (using variables). Implement JS control in `UIManager.js`. Hook events in `script.js`.
*   **Debugging:**
    *   Use `localStorage.setItem('rikkDebugMode', 'true')` in browser console to enable `DEBUG_MODE`.
    *   `debugLogger` from `utils.js` provides prefixed console logs. Add new logs with clear component/manager prefixes.
*   **CSS:** Strictly adhere to the theming architecture (Section 4). Use semantic CSS variables from `assets/css/variables.css`.
*   **Commit Messages:**
    *   `Feat: Brief description of new feature.`
    *   `Fix: Brief description of bug fixed.`
    *   `Refactor: Description of code improvement.`
    *   `Docs: Changes to documentation (like this AGENTS.MD).`
    *   `Style: CSS changes.`
    *   `Chore: Maintenance, build tasks.`
*   **Testing:** After making changes, conceptually walk through the affected game loops and different game states (especially NG+), and save/load functionality. Ensure contextual logic (dialogue, events) behaves as expected under various conditions.

---
*This AGENTS.MD was synthesized from an initial AI-generated version and a comprehensive user-provided definitive guide.*
