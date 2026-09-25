# StreetCred Enhancements - Implementation Status

This document outlines the current implementation status of the Phase 2 StreetCred enhancements.

## I. Street Etiquette Sub-System

**Implemented Features:**

*   **Data Structure for Rules (`data/etiquette_rules.json`):**
    *   Created with an initial set of rules. Each rule includes `id`, `description`, `trigger` conditions (e.g., event_type, customer_mood, choice_type), and `impacts` (streetCred_global_change, loyalty_change, feedback_message_id).
*   **`GameState.js` Sufficiency:**
    *   Existing `streetCred.global` and `loyalty` structures are used for immediate impacts. No new specific state variables for persistent etiquette violation tracking were added at this stage.
*   **`StreetCredManager.js` Logic:**
    *   Enhanced with a new method `processEtiquetteAction(actionContext)`.
    *   This method loads rules from `data/etiquette_rules.json`.
    *   It matches `actionContext` (provided by game logic) against rule triggers.
    *   Applies `streetCred_global_change` via existing StreetCred manager methods and `loyalty_change` via `gameState.loyaltyManager`.
    *   Returns a `feedback_message_id` for UI display.
*   **Integration into Game Logic (`CustomerManager.js`, `script.js`):**
    *   Calls to `processEtiquetteAction` integrated into `CustomerManager.js` for dialogue choices (e.g., rude/polite declines with new customers). The `etiquetteContext` is passed from choice outcomes.
    *   Calls also integrated into `script.js` for system-level checks (e.g., during sales transactions to check for price gouging based on item demand and shortage events).
    *   Adjustments made in `script.js` to prevent double-application of StreetCred/Loyalty if an etiquette rule already covers the impact.
*   **UI/UX Feedback (`data/feedback_messages.json`, `UIManager.js`):**
    *   `data/feedback_messages.json` created to map `feedback_message_id`s to display strings.
    *   `UIManager.js` includes a new `displayEtiquetteFeedback(feedbackId)` method that uses the `phoneShowNotification` utility to display these messages.
    *   `script.js` calls this UI method with the ID returned by `processEtiquetteAction`.

**Remaining / Not Implemented:**

*   **Persistent Etiquette Violation Tracking:** `GameState.js` does not yet have specific structures for tracking cumulative etiquette breaches (this was deferred for initial simplicity).
*   **Advanced UI/UX for Etiquette:** More nuanced UI feedback like character facial expressions or specific sound cues for etiquette breaches (beyond notifications) is not implemented.
*   **Broader Rule Set:** `data/etiquette_rules.json` has a few examples; a more comprehensive set of rules covering more diverse scenarios is needed for full impact.

## II. Faction/Community Figure Integration

**Implemented Features:**

*   **`GameState.js` Update:**
    *   The structures for `factions` (e.g., `zetas_cartel`, `police`) and other `communityFigures` (e.g., `mama_carter`) were already present from Phase 1.
*   **`StreetCredManager.js` Capability:**
    *   The manager already possessed methods (`addStreetCred`, `setStreetCred`) capable of targeting specific factions or community figures using `targetType` and `targetId` parameters.

**Remaining / Not Implemented:**

*   **Game Logic for Specific Reputation Changes:**
    *   No game logic has been implemented yet in `script.js` or `CustomerManager.js` to actually *trigger* changes to `mama_carter` or any faction-specific reputations (e.g., `zetas_cartel`). The system can store and modify these values, but no events currently do so.

## III. Testing and Refinement

**Remaining / Not Implemented:**

*   **Dedicated Testing:** No new automated tests were added for these specific StreetCred enhancements.
*   **Thorough Playtesting:** The new etiquette rules and their impacts require thorough playtesting to ensure they trigger correctly and feel balanced. The feedback mechanism also needs to be tested across various scenarios.

```
