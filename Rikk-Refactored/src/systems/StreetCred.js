// Rikk-Refactored/src/systems/StreetCred.js
import { debugLogger } from '../core/utils.js';

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
        debugLogger.log('StreetCredSystem', 'Constructor called.');

        this.loadRulesAndMessages();
    }

    loadRulesAndMessages() {
        this.etiquetteRules = this.dataManager.getAllEtiquetteRules();
        this.feedbackMessages = this.dataManager.getAllFeedbackMessages();

        if (!this.etiquetteRules || this.etiquetteRules.length === 0) {
            debugLogger.warn("StreetCredSystem", "No etiquette rules loaded from DataManager.");
        } else {
            debugLogger.log("StreetCredSystem", `Loaded ${this.etiquetteRules.length} etiquette rules.`);
        }
        if (!this.feedbackMessages || Object.keys(this.feedbackMessages).length === 0) {
            debugLogger.warn("StreetCredSystem", "No feedback messages loaded from DataManager.");
        } else {
            debugLogger.log("StreetCredSystem", `Loaded ${Object.keys(this.feedbackMessages).length} feedback messages.`);
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
            debugLogger.warn("StreetCredSystem", "Etiquette rules not loaded. Cannot process action.");
            return;
        }

        debugLogger.log('StreetCredSystem', 'Processing etiquette action:', actionContext);

        for (const rule of this.etiquetteRules) {
            let conditionsMet = true;
            for (const key in rule.trigger) {
                const ruleValue = rule.trigger[key];
                const contextValue = actionContext[key];

                if (typeof ruleValue === 'string' && (ruleValue.startsWith('>') || ruleValue.startsWith('<'))) {
                    const operator = ruleValue.substring(0, ruleValue.startsWith('>=') || ruleValue.startsWith('<=') ? 2 : 1);
                    const numericRuleValue = parseFloat(ruleValue.replace(/[<>=]/g, ''));
                    const numericContextValue = parseFloat(contextValue);

                    if (isNaN(numericRuleValue) || isNaN(numericContextValue)) {
                        conditionsMet = false; break;
                    }

                    switch (operator) {
                        case '>': if (!(numericContextValue > numericRuleValue)) conditionsMet = false; break;
                        case '>=': if (!(numericContextValue >= numericRuleValue)) conditionsMet = false; break;
                        case '<': if (!(numericContextValue < numericRuleValue)) conditionsMet = false; break;
                        case '<=': if (!(numericContextValue <= numericRuleValue)) conditionsMet = false; break;
                        default: conditionsMet = false; // Should not happen if parsing is correct
                    }
                } else if (ruleValue !== contextValue) {
                    conditionsMet = false;
                }
                if (!conditionsMet) break;
            }

            if (conditionsMet) {
                debugLogger.log('StreetCredSystem', `Matched etiquette rule: ${rule.id}`, rule);

                // Apply defined impacts
                if (typeof rule.impacts.streetCred_global_change === 'number') {
                    this.gameState.adjustStreetCred(rule.impacts.streetCred_global_change, 'global');
                }
                // --- FACTION & COMMUNITY FIGURE CRED CHANGES ---
                if (typeof rule.impacts.streetCred_faction_change === 'number' && actionContext.target_faction_id) {
                    this.gameState.adjustStreetCred(rule.impacts.streetCred_faction_change, 'factions', actionContext.target_faction_id);
                }
                if (typeof rule.impacts.streetCred_community_figure_change === 'number' && actionContext.target_community_figure_id) {
                    this.gameState.adjustStreetCred(rule.impacts.streetCred_community_figure_change, 'communityFigures', actionContext.target_community_figure_id);
                }
                // --- END FACTION & COMMUNITY FIGURE CRED CHANGES ---


                if (typeof rule.impacts.loyalty_change === 'number' && actionContext.target_contact_id) {
                     this.gameState.updateContactLoyalty(actionContext.target_contact_id, rule.impacts.loyalty_change);
                     debugLogger.log('StreetCredSystem', `Adjusted loyalty for contact ${actionContext.target_contact_id} by ${rule.impacts.loyalty_change} due to rule ${rule.id}`);
                } else if (typeof rule.impacts.loyalty_change === 'number' && actionContext.target_customer_id) {
                    // Fallback if only generic customer_id is available, though target_contact_id is preferred
                    debugLogger.warn(`StreetCredSystem`, `Loyalty change for rule ${rule.id} specified with target_customer_id, but target_contact_id is preferred for persistent contacts.`);
                    // Potentially map customer_id to contact_id if possible, or log that this loyalty change might be temporary / non-persistent.
                }

                debugLogger.log('StreetCredSystem', `Applied impacts for rule ${rule.id}:`, rule.impacts);

                // Display feedback message if available
                if (rule.impacts.feedback_message_id && this.uiManager && this.feedbackMessages) {
                    const message = this.feedbackMessages[rule.impacts.feedback_message_id];
                    if (message) {
                        // Determine notification type based on cred/loyalty change
                        let notificationType = "info";
                        if (rule.impacts.streetCred_global_change < 0 || rule.impacts.loyalty_change < 0) {
                            notificationType = "warning";
                        } else if (rule.impacts.streetCred_global_change > 0 || rule.impacts.loyalty_change > 0) {
                            notificationType = "success";
                        }
                        this.uiManager.showNotification(message, notificationType);
                    } else {
                        debugLogger.warn(`StreetCredSystem`, `Feedback message ID "${rule.impacts.feedback_message_id}" not found.`);
                    }
                }

                return; // Stop after the first matched rule.
            }
        }
        debugLogger.log('StreetCredSystem', 'No etiquette rule matched for action:', actionContext);
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
