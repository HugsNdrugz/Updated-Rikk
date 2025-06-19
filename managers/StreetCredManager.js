// managers/StreetCredManager.js
import { debugLogger } from '../utils.js';
import etiquetteRules from '../data/etiquette_rules.json';

class StreetCredManager {
    constructor(gameState) {
        console.log("MANAGER: StreetCredManager constructor called");
        this.gameState = gameState;
        this.etiquetteRules = etiquetteRules;

        if (this.gameState.DEBUG_MODE) {
            debugLogger.log('StreetCredManager', 'Initialized with gameState:', gameState);
            if (this.etiquetteRules && Array.isArray(this.etiquetteRules)) { // Check if array
                debugLogger.log('StreetCredManager', `Loaded ${this.etiquetteRules.length} etiquette rules.`);
            } else {
                debugLogger.warn('StreetCredManager', 'Etiquette rules did not load correctly or is not an array!', this.etiquetteRules);
                this.etiquetteRules = []; // Ensure it's an array to prevent errors
            }
        } else if (!this.etiquetteRules || !Array.isArray(this.etiquetteRules)) { // Ensure array in non-debug
            this.etiquetteRules = [];
        }
    }

    /**
     * Adds or removes StreetCred from a specific target.
     * @param {string} targetType - Type of target: 'global', 'faction', 'district', 'communityFigure'.
     * @param {string|null} targetId - Specific ID (e.g., 'police', 'downtown', 'mama_carter'). Null/ignored for 'global'.
     * @param {number} amount - Amount to add (can be negative to remove).
     */
    addStreetCred(targetType, targetId, amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            if (this.gameState.DEBUG_MODE) debugLogger.warn('StreetCredManager', `Invalid amount for addStreetCred: ${amount}`);
            return;
        }

        if (targetType === 'global') {
            this.gameState.addGlobalStreetCred(amount);
            if (this.gameState.DEBUG_MODE) debugLogger.log('StreetCredManager', `Global StreetCred changed by ${amount} to ${this.gameState.getStreetCred('global')}`);
        } else if (this.gameState.streetCred[targetType] && this.gameState.streetCred[targetType].hasOwnProperty(targetId)) {
            this.gameState._addSpecificStreetCred(targetType, targetId, amount);
            if (this.gameState.DEBUG_MODE) debugLogger.log('StreetCredManager', `${targetType}.${targetId} StreetCred changed by ${amount} to ${this.gameState.getStreetCred(targetType, targetId)}`);
        } else {
            if (this.gameState.DEBUG_MODE) debugLogger.warn('StreetCredManager', `Invalid targetType or targetId for addStreetCred: ${targetType}, ${targetId}`);
        }
    }

    /**
     * Sets StreetCred for a specific target to a specific value.
     * @param {string} targetType - Type of target: 'global', 'faction', 'district', 'communityFigure'.
     * @param {string|null} targetId - Specific ID (e.g., 'police', 'downtown', 'mama_carter'). Null/ignored for 'global'.
     * @param {number} value - The new value for StreetCred.
     */
    setStreetCred(targetType, targetId, value) {
        if (typeof value !== 'number' || isNaN(value)) {
            if (this.gameState.DEBUG_MODE) debugLogger.warn('StreetCredManager', `Invalid value for setStreetCred: ${value}`);
            return;
        }

        if (targetType === 'global') {
            this.gameState.setGlobalStreetCred(value);
            if (this.gameState.DEBUG_MODE) debugLogger.log('StreetCredManager', `Global StreetCred set to ${this.gameState.getStreetCred('global')}`);
        } else if (this.gameState.streetCred[targetType] && this.gameState.streetCred[targetType].hasOwnProperty(targetId)) {
            this.gameState._setSpecificStreetCred(targetType, targetId, value);
            if (this.gameState.DEBUG_MODE) debugLogger.log('StreetCredManager', `${targetType}.${targetId} StreetCred set to ${this.gameState.getStreetCred(targetType, targetId)}`);
        } else {
            if (this.gameState.DEBUG_MODE) debugLogger.warn('StreetCredManager', `Invalid targetType or targetId for setStreetCred: ${targetType}, ${targetId}`);
        }
    }

    /**
     * Retrieves the StreetCred for a specific target.
     * @param {string} targetType - Type of target: 'global', 'faction', 'district', 'communityFigure'.
     * @param {string|null} targetId - Specific ID (e.g., 'police', 'downtown', 'mama_carter'). Null/ignored for 'global'.
     * @returns {number} The StreetCred value.
     */
    getStreetCred(targetType, targetId) {
        return this.gameState.getStreetCred(targetType, targetId);
    }

    /**
     * Retrieves the entire StreetCred object.
     * @returns {object} The full streetCred object from GameState.
     */
    getAllStreetCred() {
        return this.gameState.getAllStreetCred();
    }

    /**
     * Processes a player's action against the defined street etiquette rules.
     * If a rule's trigger conditions match the provided actionContext, its impacts
     * (like StreetCred and Loyalty changes) are applied to the game state.
     *
     * @param {object} actionContext - An object containing details about the player's action
     *                                 and relevant game state. Properties should align with
     *                                 trigger conditions in `data/etiquette_rules.json`.
     *                                 Example: {
     *                                   event_type: "decline_deal_from_customer",
     *                                   customer_is_new: true,
     *                                   choice_style: "rude",
     *                                   target_customer_id: "customer_123",
     *                                   customer_mood: "neutral"
     *                                 }
     * @returns {object|null} An object containing a `feedback_message_id` if a rule is matched
     *                        and has feedback defined, otherwise null.
     *                        Example: { feedback_message_id: "feedback_decline_rude_new_customer" }
     */
    processEtiquetteAction(actionContext) {
        if (this.gameState.DEBUG_MODE) {
            debugLogger.log('StreetCredManager.processEtiquetteAction', 'Processing action:', actionContext);
        }

        for (const rule of this.etiquetteRules) {
            let conditionsMet = true;
            // Check if all trigger conditions in the rule are met by the actionContext
            for (const key in rule.trigger) {
                if (rule.trigger[key] !== actionContext[key]) {
                    conditionsMet = false; // If any condition doesn't match, this rule is not triggered
                    break;
                }
            }

            if (conditionsMet) {
                if (this.gameState.DEBUG_MODE) {
                    debugLogger.log('StreetCredManager.processEtiquetteAction', `Matched etiquette rule: ${rule.id}`, rule);
                }

                // Increment persistent etiquette violation counter if specified in the rule
                if (rule.impacts.violation_type_to_increment) {
                    const violationType = rule.impacts.violation_type_to_increment;
                    if (!this.gameState.etiquetteViolations) {
                        this.gameState.etiquetteViolations = {}; // Initialize if somehow not present
                    }
                    if (this.gameState.etiquetteViolations.hasOwnProperty(violationType)) {
                        this.gameState.etiquetteViolations[violationType]++;
                    } else {
                        this.gameState.etiquetteViolations[violationType] = 1;
                    }
                    if (this.gameState.DEBUG_MODE) {
                        debugLogger.log('StreetCredManager.processEtiquetteAction', `Incremented etiquetteViolation: ${violationType}. New count: ${this.gameState.etiquetteViolations[violationType]}`);
                    }
                }

                // Apply defined impacts
                if (rule.impacts.streetCred_global_change) {
                    this.addStreetCred('global', null, rule.impacts.streetCred_global_change);
                }

                // Apply loyalty change if specified and a target customer is provided
                if (rule.impacts.loyalty_change && actionContext.target_customer_id) {
                    if (this.gameState.loyaltyManager) {
                        this.gameState.loyaltyManager.addLoyalty(actionContext.target_customer_id, rule.impacts.loyalty_change);
                    } else {
                        if (this.gameState.DEBUG_MODE) {
                            debugLogger.warn('StreetCredManager.processEtiquetteAction', 'LoyaltyManager not found on gameState. Cannot apply loyalty change for rule:', rule.id);
                        }
                    }
                }

                // Apply faction-specific StreetCred change
                if (rule.impacts.streetCred_faction_change && actionContext.target_faction_id) {
                    this.addStreetCred('factions', actionContext.target_faction_id, rule.impacts.streetCred_faction_change);
                }
                // Apply community figure-specific StreetCred change
                if (rule.impacts.streetCred_community_figure_change && actionContext.target_community_figure_id) {
                     this.addStreetCred('communityFigures', actionContext.target_community_figure_id, rule.impacts.streetCred_community_figure_change);
                }

                if (this.gameState.DEBUG_MODE) {
                    debugLogger.log('StreetCredManager.processEtiquetteAction', `Applied impacts for rule ${rule.id}:`, rule.impacts);
                }

                let feedback_type = 'neutral';
                if (rule.impacts.streetCred_global_change > 0) {
                    feedback_type = 'positive';
                } else if (rule.impacts.streetCred_global_change < 0) {
                    feedback_type = 'negative';
                }

                // Return feedback message ID and type; stop after the first matched rule.
                return {
                    feedback_message_id: rule.impacts.feedback_message_id,
                    feedback_type: feedback_type
                };
            }
        }

        if (this.gameState.DEBUG_MODE) {
            debugLogger.log('StreetCredManager.processEtiquetteAction', 'No etiquette rule matched for action:', actionContext);
        }
        return null; // No rule was matched
    }
}

export { StreetCredManager };
