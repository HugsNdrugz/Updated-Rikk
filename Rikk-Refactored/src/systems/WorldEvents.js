// Rikk-Refactored/src/systems/WorldEvents.js
import { debugLogger } from '../core/utils.js';

/**
 * World Event System
 * Manages the lifecycle of world events, their effects on the game state,
 * and checking for consequences based on game conditions.
 */
export class WorldEventSystem {
    constructor(gameState, dataManager, uiManager) {
        this.gameState = gameState;
        this.dataManager = dataManager;
        this.uiManager = uiManager;

        this.worldEventDefinitions = [];
        this.consequenceDefinitions = [];
        debugLogger.log('WorldEventSystem', 'Constructor called.');
        this.loadEventDefinitions();
    }

    loadEventDefinitions() {
        this.worldEventDefinitions = this.dataManager.getAllWorldEvents();
        this.consequenceDefinitions = this.dataManager.getAllConsequences();

        if (!this.worldEventDefinitions || this.worldEventDefinitions.length === 0) {
            debugLogger.warn("WorldEventSystem", "No world event definitions loaded from DataManager.");
        } else {
            debugLogger.log("WorldEventSystem", `Loaded ${this.worldEventDefinitions.length} world event definitions.`);
        }
        if (!this.consequenceDefinitions || this.consequenceDefinitions.length === 0) {
            debugLogger.warn("WorldEventSystem", "No consequence definitions loaded from DataManager.");
        } else {
            debugLogger.log("WorldEventSystem", `Loaded ${this.consequenceDefinitions.length} consequence definitions.`);
        }
        this.initializeActiveEventsFromState();
    }

    initializeActiveEventsFromState() {
        debugLogger.log('WorldEventSystem', 'Initializing active events from GameState.');
        // GameState now stores full event objects in _activeWorldEvents.
        // We just need to ensure modifiers are calculated on load.
        this.recalculateAndApplyActiveEventModifiers();
    }


    /**
     * Called periodically by the game loop or a timer (e.g., once per game hour or day).
     * NOTE: Game.js currently calls this every frame. This method should be adapted or called less frequently.
     * For now, internal logic will gate frequent updates for event duration.
     */
    update() {
        // This update should ideally be tied to game time progression (e.g., per hour)
        // For now, let's assume it's called frequently and manage updates internally or make it deltaTime sensitive.
        // The current implementation decrements duration assuming it's called per "tick".
        // This will be addressed when GameState.advanceTime is fully integrated.

        const currentActiveEvents = this.gameState.activeWorldEvents;
        let stillActiveEvents = [];
        let modifiersNeedRecalculation = false;

        for (const activeEvent of currentActiveEvents) {
            if (activeEvent.remainingDuration !== undefined) {
                // Logic to decrement remainingDuration should happen based on game time, not frame time.
                // This will be moved or adjusted when game time ticks are implemented.
                // For now, if called every frame, this would expire events too quickly.
                // Let's assume for this pass the Game.js calls this at an appropriate interval (e.g. hourly via gameState.on('timeChanged'))
                // If not, this needs a deltaTime parameter and internal accumulation.
                // For now, we will proceed as if it's called per game "tick".
                // activeEvent.remainingDuration--; // Placeholder for actual time-based decrement

                if (activeEvent.remainingDuration > 0) { // Check if still active
                    stillActiveEvents.push(activeEvent);
                } else {
                    debugLogger.log('WorldEventSystem', `Event expired: ${activeEvent.name || activeEvent.id}`);
                    if (activeEvent.messageOnExpire && this.uiManager) {
                        this.uiManager.showNotification(activeEvent.messageOnExpire, "event");
                    }
                    modifiersNeedRecalculation = true;
                }
            } else {
                stillActiveEvents.push(activeEvent); // Persistent event without duration
            }
        }

        if (stillActiveEvents.length !== currentActiveEvents.length) {
            this.gameState._activeWorldEvents = stillActiveEvents;
            this.gameState.emit('gameStateChanged', { type: 'activeWorldEvents', value: [...this.gameState._activeWorldEvents] });
            debugLogger.log('WorldEventSystem', 'Active world events list updated in GameState.');
        }

        this.worldEventDefinitions.forEach(eventDef => {
            if (eventDef.trigger && eventDef.trigger.type === "random") {
                if (Math.random() < (eventDef.trigger.chance || 0.01)) {
                    if (!this.gameState.activeWorldEvents.some(ae => ae.id === eventDef.id)) {
                        this.triggerEventById(eventDef.id);
                        modifiersNeedRecalculation = true; // Set flag as a new event started
                    }
                }
            }
        });

        this.checkConsequences();

        if (modifiersNeedRecalculation) {
            this.recalculateAndApplyActiveEventModifiers();
        }
    }

    /**
     * Decrements duration of active events. Should be called per game time unit (e.g., hour).
     */
    tickEventDurations() {
        let changed = false;
        this.gameState.activeWorldEvents.forEach(activeEvent => {
            if (activeEvent.remainingDuration !== undefined && activeEvent.remainingDuration > 0) {
                activeEvent.remainingDuration--;
                changed = true;
                if(activeEvent.remainingDuration === 0) {
                    debugLogger.log('WorldEventSystem', `Event ${activeEvent.id} duration reached zero during tick.`);
                    // Expiry handling will occur in the next main update() call
                }
            }
        });
        if (changed) {
            this.gameState.emit('gameStateChanged', { type: 'activeWorldEvents_tick', value: [...this.gameState.activeWorldEvents] });
        }
    }


    /**
     * Triggers a world event by its ID.
     * @param {string} eventId - The ID of the event to trigger from definitions.
     */
    triggerEventById(eventId) {
        const eventDef = this.worldEventDefinitions.find(def => def.id === eventId);
        if (!eventDef) {
            debugLogger.warn(`WorldEventSystem`, `Event definition not found for ID: ${eventId}`);
            return;
        }

        // Check if event is already active (and has duration, meaning it's not a one-off trigger)
        const existingActiveEvent = this.gameState.activeWorldEvents.find(ae => ae.id === eventId);
        if (existingActiveEvent && existingActiveEvent.remainingDuration !== undefined && existingActiveEvent.remainingDuration > 0) {
            debugLogger.log(`WorldEventSystem`, `Event ${eventId} is already active with remaining duration. Not re-triggering.`);
            return;
        }

        debugLogger.log(`WorldEventSystem`, `Triggering event: ${eventDef.name || eventDef.id}`);

        const activeEventInstance = {
            ...eventDef,
            remainingDuration: eventDef.duration
        };

        this.gameState.addActiveWorldEvent(activeEventInstance);

        if (eventDef.message && this.uiManager) {
            this.uiManager.showNotification(eventDef.message, "event");
        }

        this.applyInitialEventEffects(activeEventInstance);
        this.recalculateAndApplyActiveEventModifiers();
    }

    /**
     * Manually ends an active world event.
     * @param {string} eventId - The ID of the event to end.
     */
    endEventById(eventId) {
        const eventToEnd = this.gameState.activeWorldEvents.find(ae => ae.id === eventId);
        if (eventToEnd) {
            this.gameState.removeActiveWorldEvent(eventId);

            if (eventToEnd.messageOnExpire && this.uiManager) {
                this.uiManager.showNotification(eventToEnd.messageOnExpire, "event");
            }
            this.recalculateAndApplyActiveEventModifiers();
            debugLogger.log(`WorldEventSystem`, `Manually ended event ${eventId}`);
        } else {
            debugLogger.warn(`WorldEventSystem`, `Attempted to manually end non-active event ${eventId}`);
        }
    }


    applyInitialEventEffects(eventInstance) {
        if (eventInstance.effects && Array.isArray(eventInstance.effects)) {
            eventInstance.effects.forEach(effect => {
                if (effect.type === "statChange" && effect.target === "player") {
                    if (effect.stat === 'heat') this.gameState.adjustHeat(effect.amount);
                    if (effect.stat === 'money') this.gameState.adjustMoney(effect.amount);
                    // etc.
                    debugLogger.log('WorldEventSystem', `Applied initial effect from ${eventInstance.id}: ${effect.stat} by ${effect.amount}`);
                }
            });
        }
    }

    recalculateAndApplyActiveEventModifiers() {
        const activeModifiers = {
            heatGainMultiplier: 1.0,
            moneyGainMultiplier: 1.0,
            customerSpawnMultiplier: 1.0,
            drugPriceModifier: 1.0,
            drugDemandModifier: 1.0,
            itemScarcity: false,
            allPriceModifier: 1.0,
            dealFailChanceModifier: 0.0,
        };

        this.gameState.activeWorldEvents.forEach(activeEvent => {
            if (activeEvent.effects) {
                const effectsObject = activeEvent.effects; // Effects is an object in world_events.json
                for (const key in effectsObject) {
                    if (activeModifiers.hasOwnProperty(key)) {
                        if (key === 'dealFailChanceModifier') {
                             activeModifiers[key] += effectsObject[key];
                        } else if (key === 'specificItemDemand' && Array.isArray(effectsObject[key])) {
                            // Handle specificItemDemand by merging arrays (not currently in default activeModifiers)
                            // This would require activeModifiers.specificItemDemand to be initialized as an array.
                            // For now, this effect type is not directly applied as a simple modifier here.
                        } else if (typeof activeModifiers[key] === 'boolean') {
                            activeModifiers[key] = activeModifiers[key] || effectsObject[key];
                        } else if (typeof activeModifiers[key] === 'number' && typeof effectsObject[key] === 'number') {
                            activeModifiers[key] *= effectsObject[key];
                        } else {
                            debugLogger.warn('WorldEventSystem', `Modifier type mismatch or unhandled key for event ${activeEvent.id}: ${key}`);
                        }
                    }
                }
            }
        });

        this.gameState.setSystemicStat('activeEventModifiers', activeModifiers);
        debugLogger.log('WorldEventSystem', 'Recalculated active event modifiers:', activeModifiers);
    }


    checkConsequences() {
        if (!this.consequenceDefinitions || this.consequenceDefinitions.length === 0) return;

        this.consequenceDefinitions.forEach(consequence => {
            if (this.gameState.getPlayerChoice(`consequence_triggered_${consequence.consequenceId}_once`) && consequence.onceOnly) {
                return; // Skip if onceOnly and already triggered
            }
            const cooldownKey = `consequence_cooldown_${consequence.consequenceId}`;
            const now = this.gameState.currentDay * 24 + this.gameState.currentTime; // Simple time representation
            if (this.gameState.getPlayerChoice(cooldownKey) && this.gameState.getPlayerChoice(cooldownKey) > now) {
                return; // Skip if on cooldown
            }


            let conditionsMet = true;
            if (!consequence.triggerConditions || consequence.triggerConditions.length === 0) {
                conditionsMet = false; // A consequence must have trigger conditions
            }

            for (const condition of consequence.triggerConditions) {
                if (!conditionsMet) break; // Stop checking if already failed

                let currentConditionMet = false;
                const statValue = this.gameState.systemicStats[condition.statId];
                const choiceValue = this.gameState.getPlayerChoice(condition.choiceId);

                switch (condition.type) {
                    case 'systemicStat':
                        if (statValue !== undefined) {
                            switch (condition.operator) {
                                case '>=': currentConditionMet = statValue >= condition.value; break;
                                case '<=': currentConditionMet = statValue <= condition.value; break;
                                case '>': currentConditionMet = statValue > condition.value; break;
                                case '<': currentConditionMet = statValue < condition.value; break;
                                case '==': currentConditionMet = statValue == condition.value; break;
                                default: debugLogger.warn(`WorldEventSystem`,`Unknown operator in consequence ${consequence.consequenceId} for systemicStat: ${condition.operator}`);
                            }
                        } else {
                             debugLogger.warn(`WorldEventSystem`,`Systemic stat ${condition.statId} not found in GameState for consequence ${consequence.consequenceId}.`);
                        }
                        break;
                    case 'choiceMade':
                        if (choiceValue !== undefined && choiceValue === condition.value) {
                            currentConditionMet = true;
                        }
                        break;
                    default:
                        debugLogger.warn(`WorldEventSystem`, `Unknown condition type in consequence ${consequence.consequenceId}: ${condition.type}`);
                }

                if (!currentConditionMet) {
                    conditionsMet = false;
                    break;
                }
            }

            if (conditionsMet) {
                if (consequence.probability < 1.0 && Math.random() > consequence.probability) {
                    debugLogger.log('WorldEventSystem',`Consequence ${consequence.consequenceId} met conditions but failed probability check.`);
                    return;
                }

                debugLogger.log('WorldEventSystem', `Consequence Triggered: ${consequence.consequenceId} - ${consequence.description}`);
                if (this.uiManager && consequence.logMessage) {
                    this.uiManager.showNotification(consequence.description, "warning"); // Use description for user
                }
                this.applyConsequenceEffects(consequence);

                if (consequence.onceOnly) {
                    this.gameState.setPlayerChoice(`consequence_triggered_${consequence.consequenceId}_once`, true);
                    debugLogger.log('WorldEventSystem', `Consequence ${consequence.consequenceId} marked as onceOnly triggered.`);
                }
                if (consequence.cooldown > 0) {
                    const cooldownUntil = now + consequence.cooldown;
                    this.gameState.setTriggeredConsequence(cooldownKey, cooldownUntil); // Use specific method for cooldowns
                    debugLogger.log('WorldEventSystem', `Consequence ${consequence.consequenceId} cooldown set until game time ${cooldownUntil}.`);
                }
            }
        });
    }

    applyConsequenceEffects(consequence) {
        if (!consequence.effects || consequence.effects.length === 0) return;

        consequence.effects.forEach(effect => {
            switch (effect.type) {
                case 'gameStateChange':
                    const parts = effect.target.split('.');
                    if (parts.length === 2 && parts[0] === 'systemic') {
                        const statId = parts[1];
                        if (this.gameState.systemicStats.hasOwnProperty(statId)) {
                            let changeAmount = effect.value;
                            if (effect.operation === 'decrease') changeAmount = -effect.value;
                            else if (effect.operation === 'set') { // Add 'set' operation
                                this.gameState.setSystemicStat(statId, effect.value);
                                debugLogger.log('WorldEventSystem',`Applied consequence effect: ${statId} set to ${effect.value}`);
                                return; // Skip adjustSystemicStat if it's a set operation
                            }
                            this.gameState.adjustSystemicStat(statId, changeAmount);
                            debugLogger.log('WorldEventSystem',`Applied consequence effect: ${statId} ${effect.operation} by ${effect.value}`);
                        } else {
                            debugLogger.warn(`WorldEventSystem`,`Unknown systemic stat in consequence effect: ${statId}`);
                        }
                    } else {
                        debugLogger.warn(`WorldEventSystem`,`Unsupported gameStateChange target in consequence: ${effect.target}`);
                    }
                    break;
                case 'worldEvent':
                    this.triggerEventById(effect.eventId);
                    debugLogger.log('WorldEventSystem',`Applied consequence effect: Triggered world event ${effect.eventId}`);
                    break;
                case 'newsArticle':
                     // This needs a NewsManager system. For now, we can log or have UIManager show a generic news flash.
                    if (this.services && this.services.newsManager && typeof this.services.newsManager.triggerArticle === 'function') {
                        this.services.newsManager.triggerArticle(effect.articleId); // Assuming NewsManager is part of services
                    } else if (this.uiManager && typeof this.uiManager.showNotification === 'function') {
                        this.uiManager.showNotification(`News Flash! (Article: ${effect.articleId})`, "news");
                    } else {
                         debugLogger.warn(`WorldEventSystem`,`News article effect for ${effect.articleId} not processed: No NewsManager or UIManager available.`);
                    }
                    debugLogger.log('WorldEventSystem',`Applied consequence effect: Triggered news article ${effect.articleId}`);
                    break;
                default:
                    debugLogger.warn(`WorldEventSystem`,`Unknown consequence effect type: ${effect.type}`);
                    break;
            }
        });
    }
}
