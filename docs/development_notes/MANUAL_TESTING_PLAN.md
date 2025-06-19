# Manual Testing Plan for StreetCred Enhancements (Phase 2)

This document outlines manual test cases for the StreetCred enhancements, focusing on persistent etiquette violation tracking, expanded etiquette rules, faction/community figure reputation changes, and UI feedback.

## I. Persistent Etiquette Violation Tracking

**Test Case 1.1: Rude Decline Tracking**
*   **Setup:** Start a new game.
*   **Steps:**
    1.  Ensure at least one new customer appears who offers you an item.
    2.  When presented with choices, select the "rudest" decline option (e.g., "That's junk. Get lost.").
    3.  Repeat this rude decline with two more different new customers.
    4.  (Requires debug access or save game inspection) Check the `gameState.etiquetteViolations.rude_customer_declines` value.
*   **Expected Outcome:**
    *   `gameState.etiquetteViolations.rude_customer_declines` should be 3.
    *   The appropriate negative feedback message for rude decline should appear with negative styling.
    *   Global StreetCred and Loyalty should decrease as per the `decline_deal_rude_new_customer` rule.

**Test Case 1.2: Unnecessary Aggression Tracking**
*   **Setup:** Start a new game. Ensure the `aggressive_tone_neutral_customer` rule is in `data/etiquette_rules.json`.
*   **Steps:**
    1.  Trigger an interaction that would match the `aggressive_tone_neutral_customer` rule (this might require temporarily forcing an `actionContext` in the code or setting up a specific scenario if one exists).
    2.  (Requires debug access or save game inspection) Check `gameState.etiquetteViolations.unnecessary_aggression`.
*   **Expected Outcome:**
    *   `gameState.etiquetteViolations.unnecessary_aggression` should be 1.
    *   Feedback message `feedback_aggressive_tone_neutral` should appear with negative styling.
    *   StreetCred and Loyalty should change as per the rule.

## II. Expanded Etiquette Rules & UI Feedback

**Test Case 2.1: Polite Decline (New Customer)**
*   **Setup:** Start a new game.
*   **Steps:**
    1.  A new customer offers an item.
    2.  Select the "polite" decline option (e.g., "Not for me. Good looks tho.").
*   **Expected Outcome:**
    *   Feedback message `feedback_decline_polite_new_customer` should appear with positive styling.
    *   Global StreetCred and Loyalty should increase as per the `decline_deal_polite_new_customer` rule.

**Test Case 2.2: Price Gouging during Shortage (if testable)**
*   **Setup:**
        *   Ensure the `price_gouge_during_shortage` rule exists.
        *   Requires a way to trigger a "shortage_generic" world event.
        *   Requires an item considered "high_demand".
        *   Requires selling this item at a price significantly (>1.8x) above its base value.
*   **Steps:**
    1.  If setup is possible, perform the sale.
*   **Expected Outcome:**
    *   Feedback message `feedback_price_gouge_shortage` should appear with negative styling.
    *   StreetCred and Loyalty should decrease significantly.
    *   `etiquetteViolations` for price gouging might be tracked if the rule was updated to do so.

**Test Case 2.3: Fair Price during Shortage (if testable)**
*   **Setup:** Similar to 2.2, but sell the item at a normal/fair price.
*   **Steps:**
    1.  If setup is possible, perform the sale.
*   **Expected Outcome:**
    *   Feedback message `feedback_fair_price_shortage` should appear with positive styling.
    *   StreetCred and Loyalty should increase.

**Test Case 2.4: Discount Loyal Customer (if testable)**
*   **Setup:**
        *   Requires a customer to be "loyal" (`loyalty_level_high: true`).
        *   Requires an game mechanic/choice to offer a discount, triggering `event_type: "offer_discount_customer"`.
        *   Customer mood should be positive.
*   **Steps:**
    1.  If setup is possible, offer the discount.
*   **Expected Outcome:**
    *   Feedback `feedback_discount_loyal_customer` (positive styling).
    *   StreetCred/Loyalty increase per rule `discount_loyal_customer`.

## III. Faction/Community Figure Reputation Changes

**Test Case 3.1: Help Pastor Jones**
*   **Setup:** Play until Pastor Jones appears (Global StreetCred > 10, then random chance).
*   **Steps:**
    1.  Pastor Jones makes his request ("community center supplies").
    2.  Choose the option to help him.
*   **Expected Outcome:**
    *   Feedback message `feedback_helped_pastor_jones` should appear with positive styling.
    *   `gameState.streetCred.communityFigures.pastor_jones` should increase by 10.
    *   Global StreetCred should increase by 1.

**Test Case 3.2: Decline Pastor Jones' Request**
*   **Setup:** Play until Pastor Jones appears.
*   **Steps:**
    1.  Pastor Jones makes his request.
    2.  Choose the option to decline his request.
*   **Expected Outcome:**
    *   Feedback message `feedback_declined_pastor_jones` should appear with negative styling.
    *   `gameState.streetCred.communityFigures.pastor_jones` should decrease by 5.
    *   Global StreetCred should decrease by 1.

**Test Case 3.3: Mama Carter Reputation (Placeholder Test)**
*   **Setup:** Start a new game.
*   **Steps:**
    1.  Acquire and sell the item that was used as a placeholder for `specific_rare_item_id_for_mama_carter_quest` in `script.js` (e.g., if it was 'weed_good', sell 'weed_good').
*   **Expected Outcome:**
    *   A notification "Your standing with Mama Carter improved by 10!" should appear.
    *   `gameState.streetCred.communityFigures.mama_carter` should increase by 10.

## IV. Save/Load Game State

**Test Case 4.1: Persistence of Etiquette Violations and Reputations**
*   **Setup:**
    1.  Perform actions that change `etiquetteViolations` (e.g., Test Case 1.1).
    2.  Perform actions that change Pastor Jones's reputation (e.g., Test Case 3.1).
    3.  Perform actions that change Mama Carter's reputation (e.g., Test Case 3.3).
*   **Steps:**
    1.  Save the game after these actions.
    2.  Quit or restart the game.
    3.  Load the saved game.
    4.  (Requires debug access or save game inspection) Check `gameState.etiquetteViolations`, `gameState.streetCred.communityFigures.pastor_jones`, and `gameState.streetCred.communityFigures.mama_carter`.
*   **Expected Outcome:**
    *   The values for `etiquetteViolations`, Pastor Jones's reputation, and Mama Carter's reputation should be the same as they were at the time of saving.

## Notes for Testers:
*   Accessing game state variables like `gameState.etiquetteViolations` or specific StreetCred values might require using browser developer tools (if it's a web game) and console commands, or specific debug UI if available.
*   Some scenarios (e.g., "shortage_generic" event, "loyal customer" status, specific item for Mama Carter) might need to be forced or simulated using debug commands if not easily achievable through normal gameplay for testing purposes.
*   Pay attention to the styling (color) of the feedback notifications.
```
