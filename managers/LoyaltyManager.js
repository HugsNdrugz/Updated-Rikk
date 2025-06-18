// managers/LoyaltyManager.js
import { debugLogger } from '../utils.js';

const DEFAULT_LOYALTY = 50;
const MIN_LOYALTY = 0;
const MAX_LOYALTY = 100;

class LoyaltyManager {
    constructor(gameState) {
        this.gameState = gameState;
        if (this.gameState.DEBUG_MODE) {
            debugLogger.log('LoyaltyManager', 'Initialized with gameState:', gameState);
        }
    }

    _ensureNpcLoyaltyEntry(npcId) {
        if (!this.gameState.loyalty[npcId]) {
            this.gameState.loyalty[npcId] = { level: DEFAULT_LOYALTY };
            if (this.gameState.DEBUG_MODE) {
                debugLogger.log('LoyaltyManager', `NPC ${npcId} initialized with default loyalty: ${DEFAULT_LOYALTY}`);
            }
        }
    }

    /**
     * Adds or removes loyalty for a specific NPC.
     * @param {string} npcId - The ID of the NPC.
     * @param {number} amount - Amount to add (can be negative to remove).
     */
    addLoyalty(npcId, amount) {
        if (!npcId || typeof amount !== 'number' || isNaN(amount)) {
            if (this.gameState.DEBUG_MODE) debugLogger.warn('LoyaltyManager', `Invalid npcId or amount for addLoyalty: ${npcId}, ${amount}`);
            return;
        }
        this._ensureNpcLoyaltyEntry(npcId);
        const currentLevel = this.gameState.loyalty[npcId].level;
        const newLevel = Math.max(MIN_LOYALTY, Math.min(MAX_LOYALTY, currentLevel + amount));
        this.gameState.loyalty[npcId].level = newLevel;

        if (this.gameState.DEBUG_MODE) {
            debugLogger.log('LoyaltyManager', `Loyalty for ${npcId} changed by ${amount} from ${currentLevel} to ${newLevel}`);
        }
    }

    /**
     * Sets loyalty for a specific NPC to a specific value.
     * @param {string} npcId - The ID of the NPC.
     * @param {number} value - The new value for loyalty.
     */
    setLoyalty(npcId, value) {
        if (!npcId || typeof value !== 'number' || isNaN(value)) {
            if (this.gameState.DEBUG_MODE) debugLogger.warn('LoyaltyManager', `Invalid npcId or value for setLoyalty: ${npcId}, ${value}`);
            return;
        }
        this._ensureNpcLoyaltyEntry(npcId);
        const newLevel = Math.max(MIN_LOYALTY, Math.min(MAX_LOYALTY, value));
        this.gameState.loyalty[npcId].level = newLevel;

        if (this.gameState.DEBUG_MODE) {
            debugLogger.log('LoyaltyManager', `Loyalty for ${npcId} set to ${newLevel}`);
        }
    }

    /**
     * Retrieves the loyalty level for a specific NPC.
     * @param {string} npcId - The ID of the NPC.
     * @returns {number} The loyalty level. Returns default if NPC not found.
     */
    getLoyalty(npcId) {
        if (!npcId) {
            if (this.gameState.DEBUG_MODE) debugLogger.warn('LoyaltyManager', `Invalid npcId for getLoyalty: ${npcId}`);
            return DEFAULT_LOYALTY;
        }
        this._ensureNpcLoyaltyEntry(npcId); // Ensures entry exists, returning default if new
        return this.gameState.loyalty[npcId].level;
    }

    /**
     * Retrieves all loyalty data.
     * @returns {object} The entire loyalty object from GameState.
     */
    getAllLoyaltyData() {
        return { ...this.gameState.loyalty };
    }

    // Placeholder for future expansion, e.g., checking/setting flags like 'hasSharedStoryX'
    // setNpcFlag(npcId, flagName, flagValue) {
    //     if (!npcId || !flagName) return;
    //     this._ensureNpcLoyaltyEntry(npcId);
    //     this.gameState.loyalty[npcId][flagName] = flagValue;
    // }

    // getNpcFlag(npcId, flagName) {
    //     if (!npcId || !flagName) return undefined;
    //     return this.gameState.loyalty[npcId] ? this.gameState.loyalty[npcId][flagName] : undefined;
    // }
}

export { LoyaltyManager };
