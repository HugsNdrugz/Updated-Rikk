// Rikk-Refactored/src/systems/Loyalty.js
import { debugLogger, clamp } from '../core/utils.js';

const MIN_LOYALTY = 0;
const MAX_LOYALTY = 100;
// Default loyalty if a contact is somehow accessed without an initial value from data files.
const FALLBACK_DEFAULT_LOYALTY = 50;

/**
 * Loyalty System
 * Manages loyalty levels for various contacts/NPCs.
 * This system interacts directly with GameState for storing and retrieving loyalty data
 * and with DataManager to get initial contact data if needed.
 */
export class LoyaltySystem {
    constructor(gameState, dataManager) {
        this.gameState = gameState;
        this.dataManager = dataManager;
        debugLogger.log('LoyaltySystem', 'Constructor called.');
        // GameState._contactsState is the source of truth: { contactId: { loyalty: 50, missionsCompleted: [] }, ... }
        // GameState.updateContactLoyalty and GameState.addCompletedMissionForContact are the primary mutators.
    }

    /**
     * Ensures a contact has an entry in the GameState's contact states.
     * If not, it initializes it using initialLoyalty from DataManager via GameState.updateContactLoyalty.
     * This is mostly a helper for internal consistency if a contact is accessed before any loyalty-adjusting action.
     * GameState's updateContactLoyalty should ideally handle this transparently.
     * @param {string} contactId - The ID of the contact.
     * @private
     */
    _ensureContactInitialized(contactId) {
        if (!this.gameState.contactsState[contactId]) {
            const contactData = this.dataManager.getContactById(contactId);
            const initialLoyalty = contactData ? contactData.initialLoyalty : FALLBACK_DEFAULT_LOYALTY;
            // Call updateContactLoyalty with 0 amount. GameState's updateContactLoyalty
            // has been enhanced to initialize with initialLoyalty if the contact doesn't exist.
            this.gameState.updateContactLoyalty(contactId, 0 );
            debugLogger.log('LoyaltySystem', `Ensured contact ${contactId} is initialized in GameState. Initial/Current loyalty: ${this.gameState.contactsState[contactId]?.loyalty}`);
        }
    }


    /**
     * Adds or removes loyalty for a specific contact.
     * Uses GameState's updateContactLoyalty method which handles clamping and events.
     * @param {string} contactId - The ID of the contact.
     * @param {number} amount - Amount to add (can be negative to remove).
     */
    adjustLoyalty(contactId, amount) {
        if (!contactId || typeof amount !== 'number' || isNaN(amount)) {
            debugLogger.warn('LoyaltySystem', `Invalid contactId or amount for adjustLoyalty:`, {contactId, amount});
            return;
        }
        // GameState.updateContactLoyalty handles initialization, clamping, and event emission.
        this.gameState.updateContactLoyalty(contactId, amount);
        // GameState's updateContactLoyalty should log its own changes.
    }

    /**
     * Sets loyalty for a specific contact to a specific value.
     * Calculates the difference and uses GameState's updateContactLoyalty.
     * @param {string} contactId - The ID of the contact.
     * @param {number} value - The new value for loyalty.
     */
    setLoyalty(contactId, value) {
        if (!contactId || typeof value !== 'number' || isNaN(value)) {
            debugLogger.warn('LoyaltySystem', `Invalid contactId or value for setLoyalty:`, {contactId, value});
            return;
        }

        this._ensureContactInitialized(contactId); // Ensure contact exists in GameState before getting current loyalty.
        const currentLoyalty = this.gameState.contactsState[contactId]?.loyalty || FALLBACK_DEFAULT_LOYALTY; // Fallback if still not set
        const clampedValue = clamp(value, MIN_LOYALTY, MAX_LOYALTY);
        const amountToAdjust = clampedValue - currentLoyalty;

        // Only adjust if there's a change needed or if it's an initialization scenario.
        if (amountToAdjust !== 0 || !this.gameState.contactsState[contactId] || this.gameState.contactsState[contactId].loyalty !== clampedValue) {
            this.gameState.updateContactLoyalty(contactId, amountToAdjust);
        }
        // GameState's updateContactLoyalty should log its own changes.
    }

    /**
     * Retrieves the loyalty level for a specific contact.
     * @param {string} contactId - The ID of the contact.
     * @returns {number} The loyalty level. Returns initial if contact not yet in GameState.
     */
    getLoyalty(contactId) {
        if (!contactId) {
            debugLogger.warn('LoyaltySystem', 'Invalid contactId for getLoyalty');
            return FALLBACK_DEFAULT_LOYALTY;
        }

        const contactState = this.gameState.contactsState[contactId];
        if (contactState && typeof contactState.loyalty === 'number') {
            return contactState.loyalty;
        } else {
            // Contact not in GameState, fetch default from DataManager
            const contactData = this.dataManager.getContactById(contactId);
            const initialLoyalty = contactData ? contactData.initialLoyalty : FALLBACK_DEFAULT_LOYALTY;
            // Don't log here every time for non-initialized contacts, _ensureContactInitialized will log if it does init.
            // debugLogger.log('LoyaltySystem', `Contact ${contactId} not in active GameState, returning initial loyalty: ${initialLoyalty}`);
            return initialLoyalty;
        }
    }

    /**
     * Retrieves all contacts' loyalty data from GameState.
     * @returns {object} A copy of the contactsState object from GameState.
     */
    getAllLoyaltyData() {
        return this.gameState.contactsState; // GameState getter returns a copy
    }

    /**
     * Marks a mission as completed for a contact.
     * Uses GameState's addCompletedMissionForContact method.
     * @param {string} contactId - The ID of the contact.
     * @param {string} missionId - The ID of the mission.
     */
    completeMissionForContact(contactId, missionId) {
        if (!contactId || !missionId) {
            debugLogger.warn('LoyaltySystem', 'Invalid contactId or missionId for completeMissionForContact');
            return;
        }
        this.gameState.addCompletedMissionForContact(contactId, missionId);
        // GameState's method should log its own changes.
    }

    /**
     * Checks if a specific mission has been completed for a contact.
     * @param {string} contactId - The ID of the contact.
     * @param {string} missionId - The ID of the mission.
     * @returns {boolean} True if the mission is completed, false otherwise.
     */
    isMissionCompleted(contactId, missionId) {
        if (!contactId || !missionId) {
            debugLogger.warn('LoyaltySystem', 'Invalid contactId or missionId for isMissionCompleted');
            return false;
        }
        const contactState = this.gameState.contactsState[contactId];
        return !!(contactState && contactState.missionsCompleted && contactState.missionsCompleted.includes(missionId));
    }
}
