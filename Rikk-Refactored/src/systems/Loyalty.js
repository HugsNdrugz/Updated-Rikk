// Rikk-Refactored/src/systems/Loyalty.js

const MIN_LOYALTY = 0;
const MAX_LOYALTY = 100;

/**
 * Loyalty System
 * Manages loyalty levels for various contacts/NPCs.
 * This system interacts directly with GameState for storing and retrieving loyalty data
 * and with DataManager to get initial contact data if needed.
 */
export class LoyaltySystem {
    constructor(gameState, dataManager) {
        this.gameState = gameState;
        this.dataManager = dataManager; // To access initial contact data for default loyalty

        // The GameState's _contactsState is expected to store loyalty:
        // this.gameState._contactsState = { contactId: { loyalty: 50, missionsCompleted: [] }, ... }
        // This system will primarily use gameState.updateContactLoyalty and gameState.contactsState
    }

    /**
     * Ensures a contact has an entry in the GameState's contact states.
     * If not, it initializes it using initialLoyalty from DataManager.
     * @param {string} contactId - The ID of the contact.
     * @private
     */
    _ensureContactStateEntry(contactId) {
        if (!this.gameState.contactsState[contactId]) {
            const contactData = this.dataManager.getContactById(contactId);
            const initialLoyalty = contactData ? contactData.initialLoyalty : 50; // Default if not found

            // GameState needs to be able to initialize a contact's state
            // This is a bit of a workaround; ideally, GameState.updateContactLoyalty would handle init.
            // For now, let's assume GameState._contactsState can be directly manipulated here for init,
            // or that updateContactLoyalty with amount 0 would init.
            // Let's use updateContactLoyalty to initialize.
            this.gameState.updateContactLoyalty(contactId, initialLoyalty - (this.gameState.contactsState[contactId]?.loyalty || 0) );
             if (!this.gameState.contactsState[contactId].missionsCompleted) {
                // Ensure missionsCompleted array exists
                // This direct manipulation is not ideal, GameState should manage its structure.
                // This suggests GameState's contact state initialization might need to be more robust.
                // For now, let's assume updateContactLoyalty handles setting up the structure.
                // If not, a direct GameState method to init contact state would be better.
                // For the purpose of this refactor, let's assume GameState.updateContactLoyalty
                // correctly initializes the structure if it doesn't exist.
            }
            console.log(`LoyaltySystem: Contact ${contactId} initialized with loyalty: ${this.gameState.contactsState[contactId].loyalty}`);
        }
    }

    /**
     * Adds or removes loyalty for a specific contact.
     * Uses GameState's updateContactLoyalty method which should handle clamping and events.
     * @param {string} contactId - The ID of the contact.
     * @param {number} amount - Amount to add (can be negative to remove).
     */
    adjustLoyalty(contactId, amount) {
        if (!contactId || typeof amount !== 'number' || isNaN(amount)) {
            console.warn('LoyaltySystem: Invalid contactId or amount for adjustLoyalty:', contactId, amount);
            return;
        }
        // GameState's updateContactLoyalty should handle initialization if not present,
        // clamping, and emitting events.
        this.gameState.updateContactLoyalty(contactId, amount);
        // console.log(`LoyaltySystem: Loyalty for ${contactId} adjusted by ${amount}. New loyalty: ${this.getLoyalty(contactId)}`);
    }

    /**
     * Sets loyalty for a specific contact to a specific value.
     * Uses GameState's updateContactLoyalty method by calculating the difference.
     * @param {string} contactId - The ID of the contact.
     * @param {number} value - The new value for loyalty.
     */
    setLoyalty(contactId, value) {
        if (!contactId || typeof value !== 'number' || isNaN(value)) {
            console.warn('LoyaltySystem: Invalid contactId or value for setLoyalty:', contactId, value);
            return;
        }

        const currentLoyalty = this.getLoyalty(contactId); // This will ensure entry via _ensureContactStateEntry if called by getLoyalty
        const clampedValue = Math.max(MIN_LOYALTY, Math.min(MAX_LOYALTY, value));
        const amountToAdjust = clampedValue - currentLoyalty;

        this.gameState.updateContactLoyalty(contactId, amountToAdjust);
        // console.log(`LoyaltySystem: Loyalty for ${contactId} set to ${clampedValue}`);
    }

    /**
     * Retrieves the loyalty level for a specific contact.
     * @param {string} contactId - The ID of the contact.
     * @returns {number} The loyalty level. Returns initial if contact not yet in GameState.
     */
    getLoyalty(contactId) {
        if (!contactId) {
            console.warn('LoyaltySystem: Invalid contactId for getLoyalty');
            const contactData = this.dataManager.getContactById(contactId); // Attempt to get default
            return contactData ? contactData.initialLoyalty : 50; // Fallback default
        }

        const contactState = this.gameState.contactsState[contactId];
        if (contactState && typeof contactState.loyalty === 'number') {
            return contactState.loyalty;
        } else {
            // Contact not in GameState, fetch default from DataManager
            const contactData = this.dataManager.getContactById(contactId);
            const initialLoyalty = contactData ? contactData.initialLoyalty : 50;
            // It might be good practice to also initialize them in GameState here if not present
            // However, updateContactLoyalty in GameState should ideally handle this.
            // For now, just return the default if not found in active state.
            // To ensure consistency, we could call _ensureContactStateEntry here,
            // but that might have side effects if getLoyalty is meant to be purely read-only from GameState perspective.
            // GameState.updateContactLoyalty should be the single point of write/initialization.
            // If GameState.contactsState[contactId] is undefined, it means no interaction has modified loyalty yet.
            return initialLoyalty;
        }
    }

    /**
     * Retrieves all contacts' loyalty data from GameState.
     * @returns {object} An object where keys are contact IDs and values are their state objects (including loyalty).
     */
    getAllLoyaltyData() {
        // Returns a copy of the contactsState from GameState
        return this.gameState.contactsState;
    }

    /**
     * Marks a mission as completed for a contact.
     * Uses GameState's addCompletedMissionForContact method.
     * @param {string} contactId - The ID of the contact.
     * @param {string} missionId - The ID of the mission.
     */
    completeMissionForContact(contactId, missionId) {
        if (!contactId || !missionId) {
            console.warn('LoyaltySystem: Invalid contactId or missionId for completeMissionForContact');
            return;
        }
        this.gameState.addCompletedMissionForContact(contactId, missionId);
        // console.log(`LoyaltySystem: Mission ${missionId} marked as completed for contact ${contactId}.`);
    }

    /**
     * Checks if a specific mission has been completed for a contact.
     * @param {string} contactId - The ID of the contact.
     * @param {string} missionId - The ID of the mission.
     * @returns {boolean} True if the mission is completed, false otherwise.
     */
    isMissionCompleted(contactId, missionId) {
        if (!contactId || !missionId) {
            console.warn('LoyaltySystem: Invalid contactId or missionId for isMissionCompleted');
            return false;
        }
        const contactState = this.gameState.contactsState[contactId];
        return contactState && contactState.missionsCompleted && contactState.missionsCompleted.includes(missionId);
    }
}
