// Rikk-Refactored/src/systems/WorldEvents.js

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

        this.worldEventDefinitions = []; // From world_events.json
        this.consequenceDefinitions = []; // From consequences.json

        this.loadEventDefinitions();

        // This system might have an update(deltaTime) method called by the main game loop
        // if events have time-based triggers or ongoing effects not handled by simple modifiers.
    }

    loadEventDefinitions() {
        this.worldEventDefinitions = this.dataManager.getAllWorldEvents(); // from world_events.json
        this.consequenceDefinitions = this.dataManager.getAllConsequences();

        if (!this.worldEventDefinitions || this.worldEventDefinitions.length === 0) {
            console.warn("WorldEventSystem: No world event definitions loaded from DataManager.");
        }
        if (!this.consequenceDefinitions || this.consequenceDefinitions.length === 0) {
            console.warn("WorldEventSystem: No consequence definitions loaded from DataManager.");
        }
        // Initialize active events from GameState if any were saved
        this.initializeActiveEventsFromState();
    }

    initializeActiveEventsFromState() {
        // If GameState._activeWorldEvents stores full event objects with remainingDuration
        // this method would ensure their effects are correctly re-applied or re-calculated on load.
        // For now, GameState.addActiveWorldEvent and removeActiveWorldEvent will handle event state.
        // We might need to re-apply modifiers if they are not saved directly in GameState.
        // The current GameState.activeWorldEvents just stores IDs. We need to store more.
        // Let's adjust GameState to store event objects with remaining duration.

        // For now, we'll assume GameState.activeWorldEvents is just an array of IDs
        // and we re-trigger them with their original duration if they were meant to be persistent
        // This is a simplification; a robust system would save remaining durations.

        // The current GameState._activeWorldEvents stores event IDs.
        // The `triggerEvent` method now adds the full event object with remainingDuration to gameState.
        // So, when loading, if `gameState.activeWorldEvents` contains these objects,
        // we just need to ensure their modifiers are applied.
        this.recalculateAndApplyActiveEventModifiers();
    }


    /**
     * Called periodically by the game loop or a timer (e.g., once per game hour or day).
     */
    update() {
        // 1. Decrement durations of active events in GameState
        const currentActiveEvents = this.gameState.activeWorldEvents; // This is an array of event objects
        const stillActiveEvents = [];
        let modifiersNeedRecalculation = false;

        for (const activeEvent of currentActiveEvents) {
            if (activeEvent.remainingDuration !== undefined) {
                activeEvent.remainingDuration--; // Assuming update is called once per "tick" (e.g., hour)
                if (activeEvent.remainingDuration > 0) {
                    stillActiveEvents.push(activeEvent);
                } else {
                    console.log(`WorldEventSystem: Event expired: ${activeEvent.name || activeEvent.id}`);
                    if (activeEvent.messageOnExpire && this.uiManager) {
                        this.uiManager.showNotification(activeEvent.messageOnExpire, "event");
                    }
                    // No need to call gameState.removeActiveWorldEvent if we are rebuilding the array
                    modifiersNeedRecalculation = true;
                }
            } else {
                // Event without duration, might be persistent until explicitly removed
                stillActiveEvents.push(activeEvent);
            }
        }

        // Directly update the GameState's array if it has changed
        if (stillActiveEvents.length !== currentActiveEvents.length) {
            this.gameState._activeWorldEvents = stillActiveEvents; // GameState should emit its own event for this change
            this.gameState.emit('gameStateChanged', { type: 'activeWorldEvents', value: [...this.gameState._activeWorldEvents] });
        }


        // 2. Trigger new random events from worldEventDefinitions
        this.worldEventDefinitions.forEach(eventDef => {
            if (eventDef.trigger && eventDef.trigger.type === "random") {
                if (Math.random() < (eventDef.trigger.chance || 0.01)) { // Default chance if not specified
                    if (!this.gameState.activeWorldEvents.some(ae => ae.id === eventDef.id)) {
                        this.triggerEventById(eventDef.id); // This will add to GameState and set up modifiers
                        modifiersNeedRecalculation = true;
                    }
                }
            }
        });

        // 3. Check for consequences
        this.checkConsequences();

        // 4. Recalculate modifiers if any event started or ended
        if (modifiersNeedRecalculation) {
            this.recalculateAndApplyActiveEventModifiers();
        }
    }

    /**
     * Triggers a world event by its ID.
     * @param {string} eventId - The ID of the event to trigger from definitions.
     */
    triggerEventById(eventId) {
        const eventDef = this.worldEventDefinitions.find(def => def.id === eventId);
        if (!eventDef) {
            console.warn(`WorldEventSystem: Event definition not found for ID: ${eventId}`);
            return;
        }

        if (this.gameState.activeWorldEvents.some(ae => ae.id === eventId && ae.remainingDuration > 0)) {
            console.log(`WorldEventSystem: Event ${eventId} is already active.`);
            return; // Don't re-trigger if already active with duration
        }

        console.log(`WorldEventSystem: Triggering event: ${eventDef.name || eventDef.id}`);

        const activeEventInstance = {
            ...eventDef,
            remainingDuration: eventDef.duration // Set initial duration
        };

        this.gameState.addActiveWorldEvent(activeEventInstance); // GameState now stores the full object

        if (eventDef.message && this.uiManager) {
            this.uiManager.showNotification(eventDef.message, "event");
        }

        this.applyInitialEventEffects(activeEventInstance);
        this.recalculateAndApplyActiveEventModifiers(); // Apply new modifiers immediately
    }

    /**
     * Manually ends an active world event.
     * @param {string} eventId - The ID of the event to end.
     */
    endEventById(eventId) {
        const eventToEnd = this.gameState.activeWorldEvents.find(ae => ae.id === eventId);
        if (eventToEnd) {
            // Set remaining duration to 0 so it gets cleaned up by the update loop,
            // or directly remove it from GameState.
            this.gameState.removeActiveWorldEvent(eventId); // GameState should handle this

            if (eventToEnd.messageOnExpire && this.uiManager) {
                this.uiManager.showNotification(eventToEnd.messageOnExpire, "event");
            }
            this.recalculateAndApplyActiveEventModifiers();
            console.log(`WorldEventSystem: Manually ended event ${eventId}`);
        }
    }


    applyInitialEventEffects(eventInstance) {
        if (eventInstance.effects && Array.isArray(eventInstance.effects)) {
            eventInstance.effects.forEach(effect => {
                // This system focuses on event lifecycle. Specific effect application
                // might be delegated or handled by GameState itself.
                // Example:
                if (effect.type === "statChange" && effect.target === "player") {
                    if (effect.stat === 'heat') this.gameState.adjustHeat(effect.amount);
                    if (effect.stat === 'money') this.gameState.adjustMoney(effect.amount);
                    // etc.
                    console.log(`WorldEventSystem: Applied initial effect from ${eventInstance.id}: ${effect.stat} by ${effect.amount}`);
                }
                // For "modifier" effects, recalculateAndApplyActiveEventModifiers will handle them.
            });
        }
    }

    recalculateAndApplyActiveEventModifiers() {
        // This method should ideally update a dedicated structure in GameState for current global modifiers.
        // For now, let's assume GameState has a way to store/apply these.
        // If not, this system would need to notify other systems (like UI, transaction logic)
        // about the current modifiers.

        const activeModifiers = {
            heatGainMultiplier: 1.0,
            moneyGainMultiplier: 1.0, // Example, if events can modify this
            customerSpawnMultiplier: 1.0,
            drugPriceModifier: 1.0, // from police_crackdown example
            drugDemandModifier: 1.0, // from party_weekend example
            itemScarcity: false, // from supply_drought
            allPriceModifier: 1.0, // from supply_drought
            dealFailChanceModifier: 0.0, // from rival_tension (additive)
        };

        this.gameState.activeWorldEvents.forEach(activeEvent => {
            if (activeEvent.effects) { // Effects could be an object or array
                const effects = Array.isArray(activeEvent.effects) ? activeEvent.effects : [activeEvent.effects]; // Ensure array
                effects.forEach(effect => {
                    if (effect.type === "modifier" && effect.duration === "event") { // Old structure
                         if (activeModifiers.hasOwnProperty(effect.stat)) {
                            activeModifiers[effect.stat] *= effect.value;
                        }
                    } else { // New structure where effects is an object
                        for (const key in effect) {
                            if (activeModifiers.hasOwnProperty(key)) {
                                if (key === 'dealFailChanceModifier') {
                                     activeModifiers[key] += effect[key]; // Additive
                                } else if (typeof activeModifiers[key] === 'boolean') {
                                    activeModifiers[key] = activeModifiers[key] || effect[key]; // OR for booleans
                                }
                                else {
                                    activeModifiers[key] *= effect[key]; // Multiplicative
                                }
                            }
                        }
                    }
                });
            }
        });

        // Update GameState with these calculated modifiers
        // This requires GameState to have a field like _activeEventModifiers
        this.gameState.setSystemicStat('activeEventModifiers', activeModifiers);
        // GameState's setSystemicStat will emit 'systemicStatChanged' and 'gameStateChanged'

        console.log('WorldEventSystem: Recalculated active event modifiers:', activeModifiers);
    }


    checkConsequences() {
        if (!this.consequenceDefinitions || this.consequenceDefinitions.length === 0) return;

        this.consequenceDefinitions.forEach(consequence => {
            // Skip if consequence has a cooldown and is still cooling down (needs GameState support)
            // if (this.gameState.isConsequenceCoolingDown(consequence.consequenceId)) return;
            // Skip if consequence is onceOnly and has already triggered (needs GameState support)
            // if (consequence.onceOnly && this.gameState.hasConsequenceTriggered(consequence.consequenceId)) return;

            let conditionsMet = true;
            if (!consequence.triggerConditions || consequence.triggerConditions.length === 0) {
                conditionsMet = false;
            }

            for (const condition of consequence.triggerConditions) {
                let currentConditionMet = false;
                const statValue = this.gameState.systemicStats[condition.statId]; // All systemic stats are in gameState.systemicStats

                if (condition.type === 'systemicStat') {
                    if (typeof statValue !== 'undefined') {
                        switch (condition.operator) {
                            case '>=': currentConditionMet = statValue >= condition.value; break;
                            case '<=': currentConditionMet = statValue <= condition.value; break;
                            case '>': currentConditionMet = statValue > condition.value; break;
                            case '<': currentConditionMet = statValue < condition.value; break;
                            case '==': currentConditionMet = statValue == condition.value; break;
                            default: console.warn(`Unknown operator: ${condition.operator}`); break;
                        }
                    }
                } else if (condition.type === 'choiceMade') { // 'choiceMade' is not in current GameState
                    // This would require GameState to store player choices.
                    // const choiceValue = this.gameState.getPlayerChoice(condition.choiceId);
                    // if (choiceValue === condition.value) currentConditionMet = true;
                    console.warn(`Consequence condition type 'choiceMade' not yet supported by GameState.`);
                }
                // Add other condition types here (e.g., worldEventActive, playerStat)

                if (!currentConditionMet) {
                    conditionsMet = false;
                    break;
                }
            }

            if (conditionsMet) {
                if (consequence.probability < 1.0 && Math.random() > consequence.probability) {
                    console.log(`Consequence ${consequence.consequenceId} met conditions but failed probability.`);
                    return;
                }

                console.log(`WorldEventSystem: Consequence Triggered: ${consequence.consequenceId} - ${consequence.description}`);
                if (this.uiManager && consequence.logMessage) { // Using consequence.description as user-facing message
                    this.uiManager.showNotification(consequence.description, "warning");
                }
                this.applyConsequenceEffects(consequence);
                // Mark as triggered or set cooldown in GameState if needed
                // this.gameState.markConsequenceTriggered(consequence.consequenceId);
                // this.gameState.setConsequenceCooldown(consequence.consequenceId, consequence.cooldown);
            }
        });
    }

    applyConsequenceEffects(consequence) {
        if (!consequence.effects || consequence.effects.length === 0) return;

        consequence.effects.forEach(effect => {
            switch (effect.type) {
                case 'gameStateChange':
                    // Example: { "type": "gameStateChange", "target": "systemic.cityDespairLevel", "operation": "increase", "value": 1 }
                    // This needs careful parsing of 'target'
                    const parts = effect.target.split('.');
                    if (parts.length === 2 && parts[0] === 'systemic') {
                        const statId = parts[1];
                        if (this.gameState.systemicStats.hasOwnProperty(statId)) {
                            let changeAmount = effect.value;
                            if (effect.operation === 'decrease') changeAmount = -effect.value;
                            // GameState.adjustSystemicStat will handle the update and event emission
                            this.gameState.adjustSystemicStat(statId, changeAmount);
                            console.log(`Applied consequence effect: ${statId} ${effect.operation} by ${effect.value}`);
                        } else {
                            console.warn(`Unknown systemic stat in consequence effect: ${statId}`);
                        }
                    } else {
                        console.warn(`Unsupported gameStateChange target in consequence: ${effect.target}`);
                    }
                    break;
                case 'worldEvent':
                    this.triggerEventById(effect.eventId);
                    console.log(`Applied consequence effect: Triggered world event ${effect.eventId}`);
                    break;
                case 'newsArticle':
                    // This would require a NewsSystem to be integrated or UIManager to handle news
                    if (this.uiManager && typeof this.uiManager.displayNews === 'function') {
                        // this.uiManager.displayNews(effect.articleId);
                    } else if (this.services && this.services.newsManager) { // If NewsManager is a service
                        this.services.newsManager.triggerArticle(effect.articleId);
                    }
                    else {
                         console.warn(`News article effect for ${effect.articleId} not processed: No NewsManager or UIManager.displayNews.`);
                    }
                    console.log(`Applied consequence effect: Triggered news article ${effect.articleId}`);
                    break;
                default:
                    console.warn(`Unknown consequence effect type: ${effect.type}`);
                    break;
            }
        });
    }
}
