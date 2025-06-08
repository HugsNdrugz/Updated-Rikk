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
        this.streetCred = config.STARTING_STREET_CRED ?? 0;
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
    }

    // --- Getters ---
    getCash() { return this.cash; }
    getFiendsLeft() { return this.fiendsLeft; }
    getDayOfWeek() { return this.dayOfWeek; }
    isGameActive() { return this.gameActive; }
    getHeat() { return this.heat; }
    getStreetCred() { return this.streetCred; }
    getPlayerSkills() { return { ...this.playerSkills }; }
    getInventory() { return [...this.inventory]; }
    getActiveWorldEvents() { return [...this.activeWorldEvents]; }
    getCurrentCustomerInstance() { return this.currentCustomerInstance; }
    getCustomerTemplates() { return JSON.parse(JSON.stringify(this.customerTemplates)); } // Return deep copy
    getMaxHeat() { return this.MAX_HEAT; }
    getMaxInventorySlots() { return this.MAX_INVENTORY_SLOTS; }
    getDaysArray() { return this.DAYS_ARRAY; }

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

    setStreetCred(value) { this.streetCred = Math.max(0, value); }
    addStreetCred(value) { this.setStreetCred(this.streetCred + value); } // Use setStreetCred

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
        this.streetCred = config.STARTING_STREET_CRED ?? 0;
        this.playerSkills = { negotiator: 0, appraiser: 0, lowProfile: 0 };
        this.inventory = [];
        this.activeWorldEvents = [];
        this.currentCustomerInstance = null;

        // Constants are typically set at construction and might not need reset unless config changes
        this.MAX_INVENTORY_SLOTS = config.MAX_INVENTORY_SLOTS ?? this.MAX_INVENTORY_SLOTS;
        this.MAX_HEAT = config.MAX_HEAT ?? this.MAX_HEAT;
        this.DAYS_ARRAY = config.DAYS ?? this.DAYS_ARRAY;
        this.customerTemplates = config.defaultCustomerTemplates ? JSON.parse(JSON.stringify(config.defaultCustomerTemplates)) : this.customerTemplates;

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
            streetCred: this.streetCred,
            playerSkills: { ...this.playerSkills },
            inventory: [...this.inventory],
            activeWorldEvents: [...this.activeWorldEvents],
            // customerTemplates are saved/loaded separately by script.js
            // MAX_INVENTORY_SLOTS, MAX_HEAT, DAYS_ARRAY are part of config, not dynamic state to save
        };
    }

    fromJSON(savedState, config = {}) {
        this.cash = savedState.cash ?? (config.STARTING_CASH ?? 0);
        this.fiendsLeft = savedState.fiendsLeft ?? (config.MAX_FIENDS ?? 0);
        this.dayOfWeek = savedState.dayOfWeek ?? ((config.DAYS ?? this.DAYS_ARRAY)[0]);
        this.gameActive = savedState.gameActive ?? false; // Usually start inactive from a load
        this.heat = savedState.heat ?? 0;
        this.streetCred = savedState.streetCred ?? (config.STARTING_STREET_CRED ?? 0);
        this.playerSkills = savedState.playerSkills ? { ...this.playerSkills, ...savedState.playerSkills } : this.playerSkills;
        this.inventory = savedState.inventory ? [...savedState.inventory] : [];
        this.activeWorldEvents = savedState.activeWorldEvents ? [...savedState.activeWorldEvents] : [];

        // customerTemplates are handled by script.js and ContactsAppManager for persistence
        // MAX_*, DAYS_ARRAY are from config
        if (this.DEBUG_MODE) debugLogger.log('GameState', 'State loaded from saved data.');
    }
}

// Export if using ES modules in a node environment or with a bundler
// export { GameState };
