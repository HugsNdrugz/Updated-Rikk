// managers/ItemEffectManager.js
import { debugLogger } from '../utils.js'; // Assuming utils.js is in the parent directory
import { phoneShowNotification } from '../phone_ambient_ui.js'; // Assuming this path

class ItemEffectManager {
    constructor(game) { // Pass the main game object (which contains gameState, managers)
        this.game = game;
        if (this.game.gameState.DEBUG_MODE) {
            debugLogger.log('ItemEffectManager', 'Initialized.');
        }
    }

    /**
     * Processes an array of effect objects associated with an item.
     * @param {Array<Object>} effectsArray - The array of effect objects (e.g., item.effectsOnSell).
     * @param {Object} context - Additional context if needed (e.g., targetNPC, environment).
     *                           For Phase 1, primarily uses this.game for gameState and managers.
     */
    processEffects(effectsArray, context = {}) {
        if (!effectsArray || !Array.isArray(effectsArray)) {
            if (this.game.gameState.DEBUG_MODE) debugLogger.warn('ItemEffectManager', 'processEffects called with invalid effectsArray.');
            return;
        }

        effectsArray.forEach(effect => {
            if (this.game.gameState.DEBUG_MODE) debugLogger.log('ItemEffectManager', `Processing effect:`, effect);

            // Check for chance
            if (effect.chance !== undefined && typeof effect.chance === 'number') {
                if (Math.random() > effect.chance) {
                    if (this.game.gameState.DEBUG_MODE) debugLogger.log('ItemEffectManager', `Effect did not trigger due to chance: ${effect.chance}`);
                    return; // Skip this effect
                }
            }

            switch (effect.type) {
                case 'statChange':
                    this.applyStatChange(effect, context);
                    break;
                // Future effect types can be added here:
                // case 'triggerEvent':
                // case 'spawnItem':
                // case 'dialogueChange':
                default:
                    if (this.game.gameState.DEBUG_MODE) debugLogger.warn('ItemEffectManager', `Unknown effect type: ${effect.type}`);
            }
        });
    }

    applyStatChange(effect, context) {
        if (effect.target === 'player') {
            let actualAmount = effect.amount;
            // Could add logic here for multipliers or resistances from context if needed in future

            switch (effect.stat) {
                case 'heat':
                    if (actualAmount > 0) { // Only reduce heat *gain*
                        const lowProfileSkill = this.game.gameState.getPlayerSkills().lowProfile || 0;
                        const reductionFactor = 1 - (lowProfileSkill * 0.05); // 5% reduction per skill point
                        actualAmount = Math.round(actualAmount * reductionFactor);
                        if (this.game.gameState.DEBUG_MODE) debugLogger.log('ItemEffectManager', `LowProfile skill ${lowProfileSkill} reduced heat gain to ${actualAmount}. Factor: ${reductionFactor}`);
                    }
                    this.game.gameState.addHeat(actualAmount);
                    if (this.game.gameState.DEBUG_MODE) debugLogger.log('ItemEffectManager', `Player heat changed by ${actualAmount}. New heat: ${this.game.gameState.getHeat()}`);
                    if (effect.message) phoneShowNotification(effect.message, "System Alert");
                    break;
                case 'cash':
                    this.game.gameState.addCash(actualAmount);
                    if (this.game.gameState.DEBUG_MODE) debugLogger.log('ItemEffectManager', `Player cash changed by ${actualAmount}. New cash: ${this.game.gameState.getCash()}`);
                     if (effect.message) phoneShowNotification(effect.message, "System Alert");
                    break;
                case 'globalStreetCred': // Assuming direct access or via StreetCredManager for global
                    if (this.game.streetCredManager) {
                        this.game.streetCredManager.addStreetCred('global', null, actualAmount);
                        if (this.game.gameState.DEBUG_MODE) debugLogger.log('ItemEffectManager', `Player globalStreetCred changed by ${actualAmount}.`);
                        if (effect.message) phoneShowNotification(effect.message, "System Alert");
                    } else {
                         if (this.game.gameState.DEBUG_MODE) debugLogger.warn('ItemEffectManager', 'StreetCredManager not found on game object.');
                    }
                    break;
                // Add other player stats here if needed (e.g., specific faction/district cred if 'target' becomes more granular)
                default:
                    if (this.game.gameState.DEBUG_MODE) debugLogger.warn('ItemEffectManager', `Unknown player stat for statChange: ${effect.stat}`);
            }
        }
        // Future: else if (effect.target === 'npc' && context.targetNPC) { ... }
        else {
            if (this.game.gameState.DEBUG_MODE) debugLogger.warn('ItemEffectManager', `Unknown target for statChange: ${effect.target}`);
        }

        // Update UI after stat changes
        if (this.game.uiManager) { // Assuming uiManager is attached to game object
            this.game.uiManager.updateHUD();
        }
    }
}

export { ItemEffectManager };
