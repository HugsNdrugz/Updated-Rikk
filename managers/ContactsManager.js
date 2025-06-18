// managers/ContactsManager.js
import { debugLogger } from '../utils.js';
import { contactsData } from '../data/contacts_data.js'; // Assuming direct import

class ContactsManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.allContacts = contactsData; // Load contacts directly

        if (this.gameState.DEBUG_MODE) {
            debugLogger.log('ContactsManager', 'Initialized with contacts data:', this.allContacts);
        }
        this.ensureInitialPlayerContacts();
    }

    ensureInitialPlayerContacts() {
        if (!this.gameState.playerContacts) {
            this.gameState.playerContacts = {};
        }
        this.allContacts.forEach(contact => {
            if (contact.streetCredUnlockRequirement <= this.gameState.getStreetCred('global') && !this.gameState.playerContacts[contact.id]) {
                this.unlockContact(contact.id, false); // Unlock without immediate notification, happens on app open
            }
        });
    }

    /**
     * Retrieves a contact definition by its ID.
     * @param {string} contactId - The ID of the contact.
     * @returns {object|undefined} The contact object or undefined if not found.
     */
    getContact(contactId) {
        return this.allContacts.find(contact => contact.id === contactId);
    }

    /**
     * Returns all contact definitions.
     * @returns {Array<object>}
     */
    getAllContacts() {
        return this.allContacts;
    }

    /**
     * Checks for newly unlocked contacts based on current StreetCred and adds them to playerContacts.
     * This should be called periodically or when StreetCred changes significantly.
     */
    refreshUnlockedContacts() {
        let newContactsUnlocked = false;
        this.allContacts.forEach(contact => {
            if (!this.gameState.playerContacts[contact.id] || !this.gameState.playerContacts[contact.id].unlocked) {
                if (this.gameState.getStreetCred('global') >= contact.streetCredUnlockRequirement) {
                    this.unlockContact(contact.id, true); // Unlock with notification
                    newContactsUnlocked = true;
                }
            }
        });
        return newContactsUnlocked;
    }

    /**
     * Unlocks a specific contact for the player.
     * @param {string} contactId - The ID of the contact to unlock.
     * @param {boolean} notify - Whether to show a notification (used by refreshUnlockedContacts).
     */
    unlockContact(contactId, notify = true) {
        const contact = this.getContact(contactId);
        if (contact) {
            if (!this.gameState.playerContacts[contact.id] || !this.gameState.playerContacts[contact.id].unlocked) {
                this.gameState.playerContacts[contact.id] = {
                    unlocked: true,
                    id: contact.id,
                    name: contact.name
                    // Player-specific notes can be added here later
                };
                // Initialize loyalty for newly unlocked contact
                if (this.gameState.loyaltyManager) { // Check if loyaltyManager exists
                    this.gameState.loyaltyManager.setLoyalty(contact.id, contact.initialLoyalty || 50);
                }
                if (notify && this.gameState.DEBUG_MODE) { // Simple debug log, actual notification via UIManager later
                     debugLogger.log('ContactsManager', `Contact Unlocked: ${contact.name}`);
                     // Consider calling a UIManager notification here if appropriate
                }
            }
        } else {
            if (this.gameState.DEBUG_MODE) debugLogger.warn('ContactsManager', `Attempted to unlock non-existent contact: ${contactId}`);
        }
    }

    /**
     * Returns a list of contact definitions that the player has unlocked.
     * Calls refreshUnlockedContacts first to ensure the list is up-to-date.
     * @returns {Array<object>}
     */
    getUnlockedContacts() {
        this.refreshUnlockedContacts(); // Ensure playerContacts is up-to-date with current StreetCred
        const unlockedContactDetails = [];
        for (const contactId in this.gameState.playerContacts) {
            if (this.gameState.playerContacts[contactId].unlocked) {
                const contactDetail = this.getContact(contactId);
                if (contactDetail) {
                    unlockedContactDetails.push(contactDetail);
                }
            }
        }
        return unlockedContactDetails.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
    }

    // --- Placeholder for future methods ---
    // startContactMission(contactId, missionId) { ... }
    // interactWithService(contactId, serviceId) { ... }
    // addPlayerNoteToContact(contactId, note) { ... }
    // getPlayerNotesForContact(contactId) { ... }
}

export { ContactsManager };
