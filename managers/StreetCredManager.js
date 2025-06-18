// managers/StreetCredManager.js
import { debugLogger } from '../utils.js';

class StreetCredManager {
    constructor(gameState) {
        console.log("MANAGER: StreetCredManager constructor called"); // Added log
        this.gameState = gameState;
        if (this.gameState.DEBUG_MODE) {
            debugLogger.log('StreetCredManager', 'Initialized with gameState:', gameState);
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
}

export { StreetCredManager };
