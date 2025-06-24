// managers/WorldEventManager.js
import { debugLogger } from '../utils.js';
import { possibleWorldEvents } from '../data/data_events.js'; // Now loading event definitions
import { consequencesData } from '../data/consequences.js';
import { showNotification as phoneShowNotification } from '../phone_ambient_ui.js';

class WorldEventManager {
    constructor(gameState, uiManager) {
        console.log("MANAGER: WorldEventManager constructor called"); // Added log
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.eventDefinitions = possibleWorldEvents;
        this.consequences = consequencesData; // Assign imported consequences

        if (this.gameState.DEBUG_MODE) {
            debugLogger.log('WorldEventManager', 'Initialized with event definitions:', this.eventDefinitions);
            debugLogger.log('WorldEventManager', 'Initialized with consequences:', this.consequences);
        }
    }

    /**
     * Updates active world events: decrements durations, removes expired events,
     * and triggers new random events.
     */
    updateEvents() {
        // Decrement durations and remove expired events
        const stillActiveEvents = [];
        let modifiersChanged = false;
        for (const activeEvent of this.gameState.activeWorldEvents) {
            activeEvent.remainingDuration--;
            if (activeEvent.remainingDuration > 0) {
                stillActiveEvents.push(activeEvent);
            } else {
                if (this.gameState.DEBUG_MODE) debugLogger.log('WorldEventManager', `Event expired: ${activeEvent.name}`);
                if (activeEvent.messageOnExpire) phoneShowNotification(activeEvent.messageOnExpire, "Event Update");
                modifiersChanged = true; // An event expired, so modifiers might change
            }
        }
        this.gameState.activeWorldEvents = stillActiveEvents;

        // Trigger new random events
        this.eventDefinitions.forEach(eventDef => {
            if (eventDef.trigger && eventDef.trigger.type === "random") {
                if (Math.random() < eventDef.trigger.chance) {
                    // Check if a similar event isn't already active (optional, by id)
                    if (!this.gameState.activeWorldEvents.some(ae => ae.id === eventDef.id)) {
                        this.triggerEvent(eventDef);
                        modifiersChanged = true; // A new event triggered
                    }
                }
            }
        });

        if (modifiersChanged) {
            this.recalculateActiveEventModifiers();
        }

        // UIManager should be updated based on gameState.activeWorldEvents
        if (this.uiManager && typeof this.uiManager.updateEventTicker === 'function') {
            this.uiManager.updateEventTicker(); // UIManager will read from gameState
        }
    }

    /**
     * Activates an event and applies its initial one-time effects.
     * @param {Object} eventDefinition - The definition of the event to trigger.
     */
    triggerEvent(eventDefinition) {
        if (this.gameState.DEBUG_MODE) debugLogger.log('WorldEventManager', `Triggering event: ${eventDefinition.name}`);

        const newActiveEvent = {
            ...eventDefinition, // Copy all properties from definition
            remainingDuration: eventDefinition.duration
        };
        this.gameState.activeWorldEvents.push(newActiveEvent);

        if (eventDefinition.message) {
            phoneShowNotification(eventDefinition.message, "Event Alert");
        }

        // Apply initial one-time effects
        this.applyInitialEventEffects(newActiveEvent);
    }

    /**
     * Applies one-time effects of an event when it first triggers.
     * @param {Object} activeEventInstance - The instance of the event.
     */
    applyInitialEventEffects(activeEventInstance) {
        if (activeEventInstance.effects && Array.isArray(activeEventInstance.effects)) {
            activeEventInstance.effects.forEach(effect => {
                if (effect.type === "statChange" && effect.target === "player") {
                    // Using ItemEffectManager's logic for consistency if complex, or direct for simple
                    if (this.gameState.itemEffectManager) { // game.itemEffectManager should be set up in script.js
                         // ItemEffectManager processEffects expects an array, so wrap single effect
                        this.gameState.itemEffectManager.processEffects([effect], { gameState: this.gameState });
                    } else { // Fallback to direct application if manager not available (not ideal)
                        switch (effect.stat) {
                            case 'heat': this.gameState.addHeat(effect.amount); break;
                            case 'cash': this.gameState.addCash(effect.amount); break;
                            // Add other direct stat changes if necessary
                        }
                        if (this.gameState.DEBUG_MODE) debugLogger.log('WorldEventManager', `Directly applied statChange from event ${activeEventInstance.id}: ${effect.stat} by ${effect.amount}`);
                    }
                }
                // Other initial effect types (e.g., spawn NPC, unlock mission) would be handled here
            });
        }
    }

    /**
     * Recalculates and updates combined modifiers from all active events.
     * Stores them in gameState.activeEventModifiers.
     */
    recalculateActiveEventModifiers() {
        const newModifiers = {
            heatGainMultiplier: 1.0,
            cashGainMultiplier: 1.0,
            customerSpawnMultiplier: 1.0,
            // Add other potential modifiers here with their default values
        };

        this.gameState.activeWorldEvents.forEach(activeEvent => {
            if (activeEvent.effects && Array.isArray(activeEvent.effects)) {
                activeEvent.effects.forEach(effect => {
                    if (effect.type === "modifier" && effect.duration === "event") {
                        if (newModifiers.hasOwnProperty(effect.stat)) {
                            // For multipliers, we multiply. For additive modifiers, we add.
                            // This example assumes multiplicative modifiers.
                            newModifiers[effect.stat] *= effect.value;
                        } else {
                             if (this.gameState.DEBUG_MODE) debugLogger.warn('WorldEventManager', `Unknown modifier stat: ${effect.stat} in event ${activeEvent.id}`);
                        }
                    }
                });
            }
        });

        this.gameState.activeEventModifiers = newModifiers;
        if (this.gameState.DEBUG_MODE) debugLogger.log('WorldEventManager', 'Recalculated activeEventModifiers:', newModifiers);
    }


    /**
     * Checks for and potentially triggers consequences based on game state. (Existing function)
     * @param {GameState} gameState - The current game state.
     */
    checkConsequences() { // gameState is available via this.gameState
        if (this.gameState.DEBUG_MODE) {
            debugLogger.log('WorldEventManager', 'Checking consequences. Current choices:', JSON.stringify(this.gameState.choices));
            debugLogger.log('WorldEventManager', 'Current systemic vars:', JSON.stringify(this.gameState.systemic));
        }

        if (!this.consequences || this.consequences.length === 0) {
            if (this.gameState.DEBUG_MODE) {
                debugLogger.log('WorldEventManager', 'No consequences defined or loaded.');
            }
            return;
        }

        this.consequences.forEach(consequence => {
            let conditionsMet = true;
            if (!consequence.triggerConditions || consequence.triggerConditions.length === 0) {
                conditionsMet = false; // Requires at least one trigger condition
            }

            for (const condition of consequence.triggerConditions) {
                let currentConditionMet = false;
                switch (condition.type) {
                    case 'choiceMade':
                        if (this.gameState.choices && this.gameState.choices[condition.choiceId] === condition.value) {
                            currentConditionMet = true;
                        }
                        break;
                    case 'systemicStat':
                        if (this.gameState.systemic && typeof this.gameState.systemic[condition.statId] !== 'undefined') {
                            const statValue = this.gameState.systemic[condition.statId];
                            switch (condition.operator) {
                                case '>=': currentConditionMet = statValue >= condition.value; break;
                                case '<=': currentConditionMet = statValue <= condition.value; break;
                                case '>': currentConditionMet = statValue > condition.value; break;
                                case '<': currentConditionMet = statValue < condition.value; break;
                                case '==': currentConditionMet = statValue == condition.value; break; // Use == for flexibility if types might differ slightly
                                default:
                                    if (this.gameState.DEBUG_MODE) debugLogger.warn('WorldEventManager', `Unknown operator in consequence ${consequence.consequenceId}: ${condition.operator}`);
                                    break;
                            }
                        }
                        break;
                    // Add other condition types here (e.g., worldEventActive, playerStat)
                    default:
                        if (this.gameState.DEBUG_MODE) debugLogger.warn('WorldEventManager', `Unknown condition type in consequence ${consequence.consequenceId}: ${condition.type}`);
                        break;
                }
                if (!currentConditionMet) {
                    conditionsMet = false;
                    break;
                }
            }

            if (conditionsMet) {
                // Basic probability check
                if (consequence.probability < 1.0 && Math.random() > consequence.probability) {
                    if (this.gameState.DEBUG_MODE) debugLogger.log('WorldEventManager', `Consequence ${consequence.consequenceId} met conditions but failed probability check.`);
                    return; // Skips this consequence for this check
                }

                // TODO: Implement cooldown and onceOnly logic if needed for full feature.
                // For now, just log or apply effects directly.

                if (this.gameState.DEBUG_MODE) {
                    debugLogger.log('WorldEventManager', `Consequence Triggered: ${consequence.consequenceId} - ${consequence.logMessage}`);
                }
                // Placeholder for applying effects:
                // this.applyConsequenceEffects(consequence.effects);
                // For now, just show a notification if there's a log message.
                if (consequence.logMessage) {
                    phoneShowNotification(consequence.logMessage, "System Update");
                }
            }
        });
    }

    // Placeholder for a future method to apply effects.
    // applyConsequenceEffects(effects) {
    //     effects.forEach(effect => {
    //         // Logic to apply different effect types (worldEvent, newsArticle, gameStateChange, etc.)
    //         // This would be similar to applyInitialEventEffects or ItemEffectManager logic.
    //         if (this.gameState.DEBUG_MODE) debugLogger.log('WorldEventManager', `Applying consequence effect:`, effect);
    //     });
    // }
}

export { WorldEventManager };
