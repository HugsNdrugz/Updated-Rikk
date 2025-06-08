# Updated Project Plan: "My Nigga Rikk - Street Hustle" - V2.1 Development

**Objective:** Continue the transition of the codebase to a robust, maintainable, and fully-featured game, building upon recent refactoring efforts.

---

## Phase 1: Critical Fixes & Foundational Cleanup (Remaining)

**Goal:** Address remaining immediate bugs, resolve data inconsistencies, and complete foundational cleanup.

*   **Task 1.1: Resolve Obsolete Data File (`data_customers.js`)** (Original Task 1.1)
    *   **Action:** The file `data_customers.js` is superseded by `customer_templates.js` and `CustomerManager.js`.
    *   **Steps:**
        1.  Delete the `data_customers.js` file from the project.
        2.  Search the entire codebase for any remaining `import` statements pointing to `data_customers.js` and remove them.

*   **Task 1.2: Correct Invalid CSS Selector for Splash Screen Tagline (`style.css`)** (Original Task 1.2 - CSS part)
    *   **Action:** Fix the invalid CSS selector to correctly style the splash screen tagline.
    *   **Steps:**
        1.  In `style.css`, change the invalid selector `.#outfit-splash-tagline` to `.outfit-splash-tagline` (or `p.outfit-splash-tagline`).

*   **Task 1.3: Complete Data Persistence for Contacts App Edits** (Original Task 1.3 - `ContactsAppManager.js` part)
    *   **Action:** Ensure editing existing customer templates in the Contacts App dispatches an event so changes are saved by `script.js`.
    *   **Steps:**
        1.  **In `ContactsAppManager.js` (`classes/ContactsAppManager.js`):** Modify the `handleInputChange` method (or equivalent save method for edits). After updating the local customer object, ensure it dispatches the `customerTemplatesUpdated` custom event with all templates in `event.detail.updatedTemplates`.
        2.  **(Verification in `script.js`):** Confirm the existing listener for `customerTemplatesUpdated` correctly uses `game.updateCustomerTemplates()` and that `saveCustomerTemplates()` (which now reads from `game.getCustomerTemplates()`) is called.

*   **Task 1.4: Clarify & Finalize Range Slider Requirements** (Original Task 1.2 - HTML part, adjusted)
    *   **Action:** Confirm if additional range sliders (e.g., for font sizes) are desired beyond those already present for border radii and spacing units.
    *   **Steps:**
        1.  If new range sliders are needed:
            *   Define new CSS variables for these properties (e.g., `--font-size-base-value: 16;`).
            *   Update CSS rules to use these variables (e.g., `font-size: calc(var(--font-size-base-value) * 1px);`).
            *   Add these new variables to `defaultStyleSettings` in `script.js` with appropriate numeric default values.
            *   Add the corresponding `<input type="range">` and `<span class="value-display">` HTML to `index.html` in the relevant settings panels.
        2.  If existing sliders are sufficient, this task is complete.

---

## Phase 2: Core Gameplay Implementation (The "Make it Fun" Phase)

**Goal:** Activate the full depth of the game's design by connecting data in `/data` files to core game logic. (These tasks are largely unaddressed)

*   **Task 2.1: Implement World Event Effects** (Original Task 2.1)
    *   **Action:** Make the `effects` object in `data/data_events.js` functional.
    *   **Steps:**
        1.  In `script.js` (or a new `EventManager.js` if further refactoring is desired): When processing turns or interactions, check `game.getActiveWorldEvents()`.
        2.  Apply modifiers from active events to relevant calculations using `GameState` methods (e.g., `game.addHeat(baseHeat * heatModifier)`).
        3.  In `CustomerManager.js`, incorporate `customerScareChance` or `dealFailChance` from active events into interaction generation logic.

*   **Task 2.2: Implement Item & Tool Effects** (Original Task 2.2)
    *   **Action:** Give life to `effect` strings/properties in `data/data_items.js`.
    *   **Steps:**
        1.  **Tools (e.g., `burner_phone` with `effect: "deal_heat_reduction"`):** In `script.js` or `PlayerManager.js` (if created), create a system where owning/using these items applies benefits during transactions (modifying data in `GameState`).
        2.  **Drugs (e.g., `addictionChance`):** Build mechanics where using/selling drugs can trigger new states or events (for player or customers), potentially modifying `GameState` or `Customer` data.

*   **Task 2.3: Implement Customer Gameplay Logic** (Original Task 2.3)
    *   **Action:** Interpret the `gameplayConfig` in `customer_templates.js`.
    *   **Steps:**
        1.  **In `CustomerManager.js`:** Modify `generateInteraction` to read `gameplayConfig` from the customer template (obtained via `game.getCustomerTemplates()`).
        2.  Use `buyPreference` and `sellPreference` to influence items a customer wants or offers.
        3.  **In `script.js` (likely within `processPayload` or a dedicated post-deal function):** After a deal, use `heatImpact` and `credImpactSell`/`credImpactBuy` from the customer's template to modify player stats via `game.addHeat()`, `game.addStreetCred()`.

---

## Phase 3: Further Architectural Refactoring & Maintainability

**Goal:** Continue improving the codebase's long-term health and scalability.

*   **Task 3.1: Create a Central `utils.js` Module** (Original Task 3.2)
    *   **Action:** Consolidate duplicated helper functions.
    *   **Steps:**
        1.  Create `utils.js`.
        2.  Move `getRandomElement` (from `script.js`) into it.
        3.  Review `SlotGameManager.js` and other files for other potential utility functions (e.g., `waitFor` if it's generic) and move them to `utils.js`.
        4.  Update all files to import these functions from `utils.js`.

*   **Task 3.2: Deconstruct `style.css`** (Original Task 3.3)
    *   **Action:** Break the single large CSS file into smaller, component-based parts.
    *   **Steps:**
        1.  Create separate CSS files (e.g., `phone.css`, `modals.css`, `main-menu.css`, `base.css`).
        2.  Move relevant style blocks from `style.css` into these new files.
        3.  Update `index.html` to link to these new CSS files.

---

## Phase 4: Polish & Shine

**Goal:** Address lower-priority items that improve overall quality and user experience. (These tasks are largely unaddressed)

*   **Task 4.1: Standardize Development Logging** (Original Task 4.1)
    *   **Action:** Ensure consistent, toggleable console output using `debugLogger`.
    *   **Steps:**
        1.  Review all `.js` files. Replace ad-hoc `console.log` used for debugging with `debugLogger.log()` or `debugLogger.error()`.
        2.  Ensure `DEBUG_MODE` (from `script.js`, passed to `GameState` config) is respected by `debugLogger`.

*   **Task 4.2: Code & Asset Cleanup** (Original Task 4.2)
    *   **Action:** Final pass to remove dead code or unused assets.
    *   **Steps:**
        1.  Review files for commented-out code no longer needed.
        2.  Verify if CSS classes like `.splash-title` are unused and remove if so.
        3.  Check for unused images/audio in `assets`.

*   **Task 4.3: Final UI/UX and Accessibility Review** (Original Task 4.3)
    *   **Action:** Conduct a holistic review of user experience.
    *   **Steps:**
        1.  Re-evaluate `user-scalable=no` in `index.html`.
        2.  Ensure clear hover/active states for all interactive elements.
        3.  Review game balance (prices, event chances) after Phase 2 is complete.

---
This updated plan prioritizes the remaining critical fixes, then moves into core gameplay feature implementation, followed by further refactoring and polish.
