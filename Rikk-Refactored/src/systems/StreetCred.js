// Rikk-Refactored/src/systems/StreetCred.js

/**
 * StreetCred System
 * Manages the player's global street cred and processes actions against etiquette rules.
 * This system interacts directly with GameState for street cred data and DataManager for rules.
 */
export class StreetCredSystem {
    constructor(gameState, dataManager, uiManager) {
        this.gameState = gameState;
        this.dataManager = dataManager;
        this.uiManager = uiManager; // For displaying feedback messages

        this.etiquetteRules = [];
        this.feedbackMessages = {};

        this.loadRulesAndMessages();

        // Example of listening to a game event that might trigger an etiquette check
        // This is illustrative; specific event triggers would be defined by game actions.
        // this.gameState.on('playerSoldItem', (eventData) => this.handleItemSale(eventData));
        // this.gameState.on('playerDeclinedDeal', (eventData) => this.handleDealDeclined(eventData));
    }

    loadRulesAndMessages() {
        this.etiquetteRules = this.dataManager.getAllEtiquetteRules();
        this.feedbackMessages = this.dataManager.getAllFeedbackMessages();

        if (!this.etiquetteRules || this.etiquetteRules.length === 0) {
            console.warn("StreetCredSystem: No etiquette rules loaded from DataManager.");
        }
        if (!this.feedbackMessages || Object.keys(this.feedbackMessages).length === 0) {
            console.warn("StreetCredSystem: No feedback messages loaded from DataManager.");
        }
    }

    /**
     * Processes a player's action against the defined street etiquette rules.
     * If a rule's trigger conditions match the provided actionContext, its impacts
     * (like StreetCred and Loyalty changes) are applied to the game state.
     *
     * @param {object} actionContext - An object containing details about the player's action
     *                                 and relevant game state. Properties should align with
     *                                 trigger conditions in `etiquette_rules.json`.
     *                                 Example: {
     *                                   event_type: "decline_deal_from_customer",
     *                                   customer_is_new: true,
     *                                   choice_style: "rude",
     *                                   target_customer_id: "customer_123", (optional, for loyalty)
     *                                   item_demand: "high", (optional)
     *                                   world_event_active: "shortage_generic", (optional)
     *                                   price_ratio_to_base: 1.9 (optional)
     *                                 }
     */
    processEtiquetteAction(actionContext) {
        if (!this.etiquetteRules) {
            console.warn("StreetCredSystem: Etiquette rules not loaded. Cannot process action.");
            return;
        }

        console.log('StreetCredSystem.processEtiquetteAction: Processing action:', actionContext);

        for (const rule of this.etiquetteRules) {
            let conditionsMet = true;
            // Check if all trigger conditions in the rule are met by the actionContext
            for (const key in rule.trigger) {
                if (rule.trigger[key] !== actionContext[key]) {
                    // Special handling for numeric comparisons like ">1.8"
                    if (typeof rule.trigger[key] === 'string' && rule.trigger[key].startsWith('>')) {
                        const numericValue = parseFloat(rule.trigger[key].substring(1));
                        if (isNaN(numericValue) || !(actionContext[key] > numericValue)) {
                            conditionsMet = false;
                            break;
                        }
                    } else if (typeof rule.trigger[key] === 'string' && rule.trigger[key].startsWith('<')) {
                         const numericValue = parseFloat(rule.trigger[key].substring(1));
                        if (isNaN(numericValue) || !(actionContext[key] < numericValue)) {
                            conditionsMet = false;
                            break;
                        }
                    }
                    else {
                        conditionsMet = false;
                        break;
                    }
                }
            }

            if (conditionsMet) {
                console.log(`StreetCredSystem: Matched etiquette rule: ${rule.id}`, rule);

                // Apply defined impacts
                if (typeof rule.impacts.streetCred_global_change === 'number') {
                    this.gameState.adjustStreetCred(rule.impacts.streetCred_global_change);
                }

                // Apply loyalty change if specified and a target customer is provided
                // This assumes LoyaltySystem or direct GameState methods handle loyalty.
                // For now, we'll assume GameState has a way to update contact loyalty.
                if (typeof rule.impacts.loyalty_change === 'number' && actionContext.target_customer_id) {
                    // This interaction needs to be well-defined. GameState has updateContactLoyalty.
                    // We need the contact's actual ID, not customer_id which might be temporary.
                    // This part might need refinement based on how customers map to persistent contacts.
                    // For now, let's assume actionContext.target_contact_id is available if loyalty applies to a persistent contact.
                    if (actionContext.target_contact_id) {
                         this.gameState.updateContactLoyalty(actionContext.target_contact_id, rule.impacts.loyalty_change);
                         console.log(`StreetCredSystem: Adjusted loyalty for contact ${actionContext.target_contact_id} by ${rule.impacts.loyalty_change}`);
                    } else {
                        console.warn(`StreetCredSystem: Loyalty change for rule ${rule.id} specified, but no target_contact_id in actionContext.`);
                    }
                }

                // Note: Faction/Community Figure specific cred is not in the current GameState structure.
                // This would require expanding GameState or having separate managers.
                // For now, only global street cred is handled.

                console.log(`StreetCredSystem: Applied impacts for rule ${rule.id}:`, rule.impacts);

                // Display feedback message if available
                if (rule.impacts.feedback_message_id && this.uiManager && this.feedbackMessages) {
                    const message = this.feedbackMessages[rule.impacts.feedback_message_id];
                    if (message) {
                        this.uiManager.showNotification(message, "info"); // Or determine type based on cred change
                    } else {
                        console.warn(`StreetCredSystem: Feedback message ID "${rule.impacts.feedback_message_id}" not found.`);
                    }
                }

                return; // Stop after the first matched rule.
            }
        }
        console.log('StreetCredSystem: No etiquette rule matched for action:', actionContext);
    }

    // Example handler for a game event (illustrative)
    // handleItemSale(eventData) {
    //     // eventData might contain: { itemId, customerId, pricePaid, baseItemValue, world_event_active, etc. }
    //     const actionContext = {
    //         event_type: "sell_to_customer_success",
    //         item_demand: this.dataManager.getItemById(eventData.itemId)?.demand || "normal", // Requires item data to have demand property
    //         world_event_active: eventData.world_event_active, // e.g., "shortage_generic"
    //         price_ratio_to_base: eventData.pricePaid / (this.dataManager.getItemById(eventData.itemId)?.baseValue || 1),
    //         target_contact_id: eventData.contactId // Assuming customer maps to a contact
    //     };
    //     this.processEtiquetteAction(actionContext);
    // }
}
