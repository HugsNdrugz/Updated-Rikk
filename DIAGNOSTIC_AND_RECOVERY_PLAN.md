# Diagnostic and Recovery Plan for "My Nigga Rikk" Project

**Overall Objective:** Resolve critical tooling/environment issues to enable continued development, verify recently implemented features, and then proceed with the remaining project tasks.

---

## Section A: Diagnose and Resolve Tooling/Environment Issues (BLOCKER)

**Goal:** Identify and fix the root cause of persistent failures with file modification tools (`overwrite_file_with_block`, `replace_with_git_merge_diff`) in the development environment.

*   **Task A.1: Investigate File System and Tool Integrity**
    *   **Action:** Perform diagnostic checks on the development environment's file system and the file manipulation tools.
    *   **Details (Conceptual - for human intervention):**
        1.  Check for disk space issues or permission errors in the sandbox.
        2.  Verify the integrity of the file manipulation tool binaries or scripts.
        3.  Test tools with simple, non-project files to isolate issues.
        4.  Review any logs from the sandbox environment or tools for error messages beyond what's reported to the AI.
        5.  Consider if recent environment updates or changes could be related.

*   **Task A.2: Test Basic File Operations**
    *   **Action:** Attempt minimal, verifiable file modifications on a test file, then on a non-critical project file, then on `script.js` and `CustomerManager.js`.
    *   **Details:**
        1.  Create a new dummy file (e.g., `test_edit.js`).
        2.  Attempt to write a simple line to it using `overwrite_file_with_block`. Verify.
        3.  Attempt to append a line using `replace_with_git_merge_diff`. Verify.
        4.  If successful, try a trivial, easily identifiable change in a less critical project JS file.
        5.  If successful, attempt a trivial change in `script.js` (e.g., adding a console log).
        6.  If successful, attempt a trivial change in `CustomerManager.js`.
    *   **Goal:** Determine if the issue is global or specific to certain files/operations.

---

## Section B: Verify Recently Applied Changes (Post-Tooling Fix)

**Goal:** Ensure the features reported as implemented *before* the widespread tooling failures are correctly in place and functional.

*   **Task B.1: Verify World Event Effects Implementation**
    *   **Action:** Review `script.js` and `CustomerManager.js` to confirm all aspects of World Event effects are working.
    *   **Details:**
        1.  Check `script.js` for `getCombinedActiveEventEffects()` helper.
        2.  Verify `heatModifier` logic in `script.js` (`processPayload`, `handleTurnProgressionAndEvents`).
        3.  Verify price modifier logic in `CustomerManager.js#_calculateItemValue` uses `combinedWorldEffects`.
        4.  Verify `customerScareChance` logic in `CustomerManager.js#generateInteraction`.
        5.  Verify `itemScarcity` logic in `CustomerManager.js#_generateRandomItem`.
        6.  Verify `dealFailChance` logic in `script.js#handleChoice`. (This was reported as successful before recent widespread failures, needs confirmation).
        7.  Verify `drugDemandModifier` and `specificItemDemand` logic in `CustomerManager.js#generateInteraction`.

*   **Task B.2: Verify Customer Addiction Mechanics in `CustomerManager.js`**
    *   **Action:** Review `CustomerManager.js` to confirm addiction logic.
    *   **Details:**
        1.  Confirm `addictionStatus` property in customer instances.
        2.  Confirm `processPotentialAddiction` method correctly handles addiction chance and progression.
        3.  Confirm `generateInteraction` and `_calculateItemValue` use `addictionStatus` for item preference and pricing.
        4.  Confirm `_getDialogue` can support addiction-specific lines.

*   **Task B.3: Verify `utils.js` Creation and `SlotGameManager.js` Refactoring**
    *   **Action:** Confirm `utils.js` exists with correct functions and `SlotGameManager.js` uses it.
    *   **Details:**
        1.  Check `utils.js` content (`getRandomElement`, `isLocalStorageAvailable`, `createImage`, etc.).
        2.  Check `SlotGameManager.js` for imports from `utils.js` and removal of local utility definitions.

---

## Section C: Complete Partially Implemented Features (Post-Tooling Fix)

**Goal:** Finish features that were blocked by tooling issues.

*   **Task C.1: Complete `utils.js` Integration for `script.js`**
    *   **Action:** Refactor `script.js` to import and use `getRandomElement` and `isLocalStorageAvailable` from `utils.js`.
    *   **Steps:**
        1.  Add imports to `script.js`.
        2.  Remove local definitions from `script.js`.

*   **Task C.2: Implement `gameplayConfig` Preferences in `CustomerManager.js`** (Completes original Task 2.3 for CustomerManager)
    *   **Action:** Modify `CustomerManager.js` to use `buyPreference` and `sellPreference` from `gameplayConfig`.
    *   **Steps:** (As outlined in the previously failed subtask for this)
        1.  Refine `_generateRandomItem` for `sellPreference`.
        2.  Refine `generateInteraction` for `buyPreference`.

*   **Task C.3: Implement Tool Effects in `script.js`** (Completes original Task 2.2 for tools)
    *   **Action:** Add logic to `script.js` for `burner_phone`, `info_cops`.
    *   **Steps:**
        1.  Implement `applyDealHeat` helper in `script.js` for `burner_phone`.
        2.  Modify `processPayload` to use `applyDealHeat`.
        3.  Modify `handleTurnProgressionAndEvents` for `info_cops` passive heat reduction.
        4.  (Consider `info_rival` if a clear mechanic is decided).

*   **Task C.4: Implement Addiction Trigger in `script.js`** (Completes original Task 2.2 for addiction)
    *   **Action:** Modify `script.js#handleChoice` to call `game.customerManager.processPotentialAddiction()` after a successful drug sale.

*   **Task C.5: Implement `heatImpact` and `credImpact` from `gameplayConfig` in `script.js`** (Completes original Task 2.3 for script.js)
    *   **Action:** In `script.js#processPayload` (or a similar function called after a deal), after a transaction, retrieve `heatImpact`, `credImpactSell`, `credImpactBuy` from the `customerInstance.template.gameplayConfig`.
    *   Apply these values to `game.addHeat()` and `game.addStreetCred()`.

---

## Section D: Remaining Tasks from UPDATED_PROJECT_PLAN.md (Post-Tooling Fix & Catch-up)

**Goal:** Address the remaining tasks from the broader project plan once blockers are cleared and pending work is complete.

*   **Task D.1: Deconstruct `style.css`** (Original Plan Task 3.2)
    *   Action: Break `style.css` into smaller, component-based files.
    *   Steps: Create separate CSS files, move relevant styles, update `index.html`.

*   **Task D.2: Standardize Development Logging** (Original Plan Task 4.1)
    *   Action: Ensure consistent use of `debugLogger`.
    *   Steps: Review all `.js` files, replace `console.log` with `debugLogger`, ensure `DEBUG_MODE` is respected.

*   **Task D.3: Code & Asset Cleanup** (Original Plan Task 4.2)
    *   Action: Remove dead code and unused assets.
    *   Steps: Review files for commented code, unused CSS, unused assets.

*   **Task D.4: Final UI/UX and Accessibility Review** (Original Plan Task 4.3)
    *   Action: Conduct holistic review.
    *   Steps: Re-evaluate `user-scalable=no`, check hover/active states, review game balance.

---
This plan prioritizes fixing the critical tooling issues first, then verifying existing work, completing interrupted tasks, and finally moving on to new features and polish.
