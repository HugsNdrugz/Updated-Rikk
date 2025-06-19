// GameState.js
import { debugLogger } from './utils.js';

class GameState {
    constructor(config = {}) {
        // Core Game Progression
        this.cash = config.STARTING_CASH ?? 0;
        this.fiendsLeft = config.MAX_FIENDS ?? 0;
        this.dayOfWeek = config.DAYS ? config.DAYS[0] : 'Monday';
        this.gameActive = false;

        // Player Stats & Status
        this.heat = 0;
        // this.streetCred = config.STARTING_STREET_CRED ?? 0; // Old simple streetCred
        this.streetCred = {
            global: config.STARTING_STREET_CRED ?? 0,
            factions: {
                police: 0,
                zetas_cartel: 0
            },
            districts: {
                downtown: 0,
                warrens: 0
            },
            communityFigures: {
                mama_carter: 0, // Reputation with Mama Carter
                pastor_jones: 0  // Reputation with Pastor Jones
            }
        };
        this.playerSkills = {
            negotiator: 0,
            appraiser: 0,
            lowProfile: 0,
        };

        // Inventory & Items
        this.inventory = [];
        this.MAX_INVENTORY_SLOTS = config.MAX_INVENTORY_SLOTS ?? 10;

        // World & Events
        this.activeWorldEvents = [];

        // Current Interaction State
        this.currentCustomerInstance = null;
        // this.currentChoices = [];
        // this.isExpectingChoice = false;

        // Loyalty System
        this.loyalty = {}; // Stores loyalty levels for NPCs: { npcId: { level: 50, ...otherFlags } }

        // Consequences System Data
        this.choices = {}; // Stores flags for significant player decisions, e.g., { betrayedFixerBob: true }
        this.systemic = { // Stores variables for broader game states
            cityDespairLevel: 0,
            totalHardDrugsSold: 0
        };

        // World Event System Data
        this.activeWorldEvents = []; // Stores instances of { eventId, name, remainingDuration, effects, ... }
        this.activeEventModifiers = { // Stores combined impact of active event modifiers
            heatGainMultiplier: 1.0,
            cashGainMultiplier: 1.0,
            customerSpawnMultiplier: 1.0
            // other modifiers as needed
        };

        // Contacts System Data
        this.playerContacts = {}; // Stores { contactId: { unlocked: true, name: "...", ...playerSpecificNotes } }

        // Map System Data
        this.mapState = { // Stores discovered districts and dynamic district data
            discoveredDistricts: [],
            districtHeatLevels: {}
            // playerLocationId: null // Future: if player has a specific current location
        };

        // Data - Customer Templates
        this.customerTemplates = config.defaultCustomerTemplates ? JSON.parse(JSON.stringify(config.defaultCustomerTemplates)) : {};

        // Configuration constants stored within GameState
        this.MAX_HEAT = config.MAX_HEAT ?? 100;
        this.DAYS_ARRAY = config.DAYS ?? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        this.DEBUG_MODE = config.DEBUG_MODE ?? false;

        // Initial console log to confirm instantiation and config
        if (this.DEBUG_MODE) {
            debugLogger.log('GameState', 'Initialized with config:', config);
        }
        this.etiquetteViolations = {};
    }

    // --- Getters ---
    getCash() { return this.cash; }
    getFiendsLeft() { return this.fiendsLeft; }
    getDayOfWeek() { return this.dayOfWeek; }
    isGameActive() { return this.gameActive; }
    getHeat() { return this.heat; }
    getStreetCred(targetType = 'global', targetId = null) {
        if (targetType === 'global') {
            return this.streetCred.global;
        }
        if (this.streetCred[targetType] && this.streetCred[targetType].hasOwnProperty(targetId)) {
            return this.streetCred[targetType][targetId];
        }
        if (this.DEBUG_MODE) debugLogger.warn('GameState', `getStreetCred: Invalid targetType or targetId: ${targetType}, ${targetId}`);
        return 0;
    }
    // Method to get the whole streetCred object if needed
    getAllStreetCred() { return { ...this.streetCred }; }

    getPlayerSkills() { return { ...this.playerSkills }; }
    getInventory() { return [...this.inventory]; }
    getActiveWorldEvents() { return [...this.activeWorldEvents]; }
    getCurrentCustomerInstance() { return this.currentCustomerInstance; }
    getCustomerTemplates() { return JSON.parse(JSON.stringify(this.customerTemplates)); } // Return deep copy
    getMaxHeat() { return this.MAX_HEAT; }
    getMaxInventorySlots() { return this.MAX_INVENTORY_SLOTS; }
    getDaysArray() { return this.DAYS_ARRAY; }
    // getCurrentChoices() { return this.currentChoices; }
    // getIsExpectingChoice() { return this.isExpectingChoice; }

    // --- Setters & Modifiers ---
    setCash(amount) { this.cash = amount; }
    addCash(amount) { this.cash += amount; }
    removeCash(amount) { this.cash -= amount; }

    setFiendsLeft(count) { this.fiendsLeft = count; }
    decrementFiendsLeft() { this.fiendsLeft--; }

    setDayOfWeek(day) { this.dayOfWeek = day; }
    advanceDayOfWeek() {
        const currentIndex = this.DAYS_ARRAY.indexOf(this.dayOfWeek);
        this.dayOfWeek = this.DAYS_ARRAY[(currentIndex + 1) % this.DAYS_ARRAY.length];
    }

    setGameActive(isActive) { this.gameActive = isActive; }

    setHeat(value) { this.heat = Math.max(0, Math.min(value, this.MAX_HEAT)); }
    addHeat(value) { this.setHeat(this.heat + value); } // Use setHeat to ensure clamping
    decreaseHeat(value) { this.setHeat(this.heat - value); } // Use setHeat to ensure clamping

    // Deprecating simple setStreetCred and addStreetCred for global only
    // Use StreetCredManager for specific modifications.
    // For global changes (like initialization or broad rewards), these can be kept or adapted.
    setGlobalStreetCred(value) { this.streetCred.global = Math.max(0, value); }
    addGlobalStreetCred(value) { this.setGlobalStreetCred(this.streetCred.global + value); }

    // Direct modification methods for the new structure - typically to be used by StreetCredManager
    _setSpecificStreetCred(targetType, targetId, value) {
        if (this.streetCred[targetType] && this.streetCred[targetType].hasOwnProperty(targetId)) {
            this.streetCred[targetType][targetId] = Math.max(0, value);
        } else {
            if (this.DEBUG_MODE) debugLogger.warn('GameState', `_setSpecificStreetCred: Invalid targetType or targetId: ${targetType}, ${targetId}`);
        }
    }

    _addSpecificStreetCred(targetType, targetId, amount) {
        if (this.streetCred[targetType] && this.streetCred[targetType].hasOwnProperty(targetId)) {
            this.streetCred[targetType][targetId] = Math.max(0, this.streetCred[targetType][targetId] + amount);
        } else {
            if (this.DEBUG_MODE) debugLogger.warn('GameState', `_addSpecificStreetCred: Invalid targetType or targetId: ${targetType}, ${targetId}`);
        }
    }

    updatePlayerSkill(skillName, valueChange) {
        if (this.playerSkills.hasOwnProperty(skillName)) {
            this.playerSkills[skillName] = Math.max(0, this.playerSkills[skillName] + valueChange);
        } else {
            if (this.DEBUG_MODE) debugLogger.warn('GameState', `Attempted to update unknown skill: ${skillName}`);
        }
    }
    setPlayerSkills(skillsObject) { this.playerSkills = { ...this.playerSkills, ...skillsObject }; }

    setInventory(inventoryArray) { this.inventory = [...inventoryArray]; }
    addItemToInventory(item) {
        if (this.inventory.length < this.MAX_INVENTORY_SLOTS) {
            this.inventory.push(item);
            return true;
        }
        if (this.DEBUG_MODE) debugLogger.warn('GameState', 'Inventory full. Cannot add item:', item);
        return false;
    }
    removeItemFromInventoryById(itemId) {
        const itemIndex = this.inventory.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            return this.inventory.splice(itemIndex, 1)[0];
        }
        if (this.DEBUG_MODE) debugLogger.warn('GameState', `Item with id ${itemId} not found in inventory.`);
        return null;
    }
    isInventoryFull() {
        return this.inventory.length >= this.MAX_INVENTORY_SLOTS;
    }

    setActiveWorldEvents(eventsArray) { this.activeWorldEvents = [...eventsArray]; }
    addActiveWorldEvent(event) { this.activeWorldEvents.push(event); }
    updateActiveWorldEvents(updatedEvents) { this.activeWorldEvents = updatedEvents; }

    setCurrentCustomerInstance(customer) { this.currentCustomerInstance = customer; }
    clearCurrentCustomerInstance() { this.currentCustomerInstance = null; }
    // setCurrentChoices(choices) { this.currentChoices = choices; }
    // setIsExpectingChoice(isExpecting) { this.isExpectingChoice = isExpecting; }
    // clearChoiceExpectation() { this.currentChoices = []; this.isExpectingChoice = false; }

    updateCustomerTemplates(newTemplates) {
        this.customerTemplates = JSON.parse(JSON.stringify(newTemplates));
    }

    // --- Reset & Initialization ---
    resetToDefault(config = {}) {
        // Use constructor's logic for defaults by re-assigning properties
        this.cash = config.STARTING_CASH ?? 0;
        this.fiendsLeft = config.MAX_FIENDS ?? 0;
        this.dayOfWeek = (config.DAYS ?? this.DAYS_ARRAY)[0];
        this.gameActive = false;
        this.heat = 0;
        // this.streetCred = config.STARTING_STREET_CRED ?? 0; // Old
        this.streetCred = { // Reset to new structure
            global: config.STARTING_STREET_CRED ?? 0,
            factions: { police: 0, zetas_cartel: 0 },
            districts: { downtown: 0, warrens: 0 },
            communityFigures: { mama_carter: 0, pastor_jones: 0 } // Ensure Pastor Jones is reset
        };
        this.playerSkills = { negotiator: 0, appraiser: 0, lowProfile: 0 };
        this.inventory = [];
        // this.activeWorldEvents = []; // Old simple array, now handled by specific reset below
        this.loyalty = {}; // Reset loyalty
        this.choices = {}; // Reset choices
        this.systemic = { cityDespairLevel: 0, totalHardDrugsSold: 0 }; // Reset systemic variables

        this.activeWorldEvents = []; // Reset active world events
        this.activeEventModifiers = { // Reset modifiers to default
            heatGainMultiplier: 1.0,
            cashGainMultiplier: 1.0,
            customerSpawnMultiplier: 1.0
        };
        this.playerContacts = {}; // Reset player contacts
        this.mapState = { discoveredDistricts: [], districtHeatLevels: {} }; // Reset map state
        this.currentCustomerInstance = null;
        // this.currentChoices = [];
        // this.isExpectingChoice = false;

        // Constants are typically set at construction and might not need reset unless config changes
        this.MAX_INVENTORY_SLOTS = config.MAX_INVENTORY_SLOTS ?? this.MAX_INVENTORY_SLOTS;
        this.MAX_HEAT = config.MAX_HEAT ?? this.MAX_HEAT;
        this.DAYS_ARRAY = config.DAYS ?? this.DAYS_ARRAY;
        this.customerTemplates = config.defaultCustomerTemplates ? JSON.parse(JSON.stringify(config.defaultCustomerTemplates)) : this.customerTemplates;
        this.etiquetteViolations = {};

        if (this.DEBUG_MODE) debugLogger.log('GameState', 'State reset to defaults.');
    }

    // --- Persistence ---
    toJSON() {
        return {
            cash: this.cash,
            fiendsLeft: this.fiendsLeft,
            dayOfWeek: this.dayOfWeek,
            gameActive: this.gameActive, // Consider if this should always be false on save/load cycle start
            heat: this.heat,
            streetCred: this.streetCred, // Saves the entire new object
            playerSkills: { ...this.playerSkills },
            inventory: [...this.inventory],
            // activeWorldEvents: [...this.activeWorldEvents], // old simple array
            loyalty: { ...this.loyalty }, // Save loyalty object
            choices: { ...this.choices }, // Save choices
            systemic: { ...this.systemic }, // Save systemic variables
            activeWorldEvents: JSON.parse(JSON.stringify(this.activeWorldEvents)), // Deep copy for saving
            activeEventModifiers: { ...this.activeEventModifiers }, // Save modifiers
            playerContacts: { ...this.playerContacts }, // Save player contacts
            mapState: JSON.parse(JSON.stringify(this.mapState)), // Deep copy for saving mapState
            // currentChoices: JSON.parse(JSON.stringify(this.currentChoices)),
            // isExpectingChoice: this.isExpectingChoice,
            // customerTemplates are saved/loaded separately by script.js
            // MAX_INVENTORY_SLOTS, MAX_HEAT, DAYS_ARRAY are part of config, not dynamic state to save
            etiquetteViolations: { ...this.etiquetteViolations },
        };
    }

    fromJSON(savedState, config = {}) {
        this.cash = savedState.cash ?? (config.STARTING_CASH ?? 0);
        this.fiendsLeft = savedState.fiendsLeft ?? (config.MAX_FIENDS ?? 0);
        this.dayOfWeek = savedState.dayOfWeek ?? ((config.DAYS ?? this.DAYS_ARRAY)[0]);
        this.gameActive = savedState.gameActive ?? false; // Usually start inactive from a load
        this.heat = savedState.heat ?? 0;
        // this.streetCred = savedState.streetCred ?? (config.STARTING_STREET_CRED ?? 0); // Old
        if (savedState.streetCred && typeof savedState.streetCred === 'object') {
            // Deep merge for streetCred to handle potentially missing new sub-objects in old saves
            this.streetCred = {
                global: savedState.streetCred.global ?? config.STARTING_STREET_CRED ?? 0,
                factions: {
                    police: savedState.streetCred.factions?.police ?? 0,
                    zetas_cartel: savedState.streetCred.factions?.zetas_cartel ?? 0
                },
                districts: {
                    downtown: savedState.streetCred.districts?.downtown ?? 0,
                    warrens: savedState.streetCred.districts?.warrens ?? 0
                },
                communityFigures: {
                    mama_carter: savedState.streetCred.communityFigures?.mama_carter ?? 0,
                    pastor_jones: savedState.streetCred.communityFigures?.pastor_jones ?? 0 // Handles if pastor_jones is not in an older save
                }
            };
        } else {
             // Handles very old saves where streetCred might have been just a number
             this.streetCred = {
                global: typeof savedState.streetCred === 'number' ? savedState.streetCred : (config.STARTING_STREET_CRED ?? 0),
                factions: { police: 0, zetas_cartel: 0 },
                districts: { downtown: 0, warrens: 0 },
                communityFigures: { mama_carter: 0, pastor_jones: 0 }
            };
        }
        this.playerSkills = savedState.playerSkills ? { ...this.playerSkills, ...savedState.playerSkills } : this.playerSkills;
        this.inventory = savedState.inventory ? [...savedState.inventory] : [];
        // this.activeWorldEvents = savedState.activeWorldEvents ? [...savedState.activeWorldEvents] : []; // old
        this.loyalty = savedState.loyalty ? { ...savedState.loyalty } : {}; // Load loyalty
        this.choices = savedState.choices ? { ...savedState.choices } : {}; // Load choices
        this.systemic = savedState.systemic ? { ...savedState.systemic } : { cityDespairLevel: 0, totalHardDrugsSold: 0 }; // Load systemic variables
        this.activeWorldEvents = savedState.activeWorldEvents ? JSON.parse(JSON.stringify(savedState.activeWorldEvents)) : []; // Load active events
        this.activeEventModifiers = savedState.activeEventModifiers ? { ...savedState.activeEventModifiers } : { heatGainMultiplier: 1.0, cashGainMultiplier: 1.0, customerSpawnMultiplier: 1.0 }; // Load modifiers
        this.playerContacts = savedState.playerContacts ? { ...savedState.playerContacts } : {}; // Load player contacts
        this.mapState = savedState.mapState ? JSON.parse(JSON.stringify(savedState.mapState)) : { discoveredDistricts: [], districtHeatLevels: {} }; // Load mapState
        // this.currentChoices = savedState.currentChoices ? JSON.parse(JSON.stringify(savedState.currentChoices)) : [];
        // this.isExpectingChoice = savedState.isExpectingChoice ?? false;

        // customerTemplates are handled by script.js and ContactsAppManager for persistence
        // MAX_*, DAYS_ARRAY are from config
        this.etiquetteViolations = savedState.etiquetteViolations ? { ...savedState.etiquetteViolations } : {};
        if (this.DEBUG_MODE) debugLogger.log('GameState', 'State loaded from saved data.');
    }
}

// Export if using ES modules in a node environment or with a bundler
export { GameState };
