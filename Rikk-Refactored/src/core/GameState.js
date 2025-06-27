// src/core/GameState.js
import { EventEmitter } from './EventEmitter.js';

export class GameState extends EventEmitter {
    constructor() {
        super(); // Initializes the event emitter capabilities

        // Player's core stats
        this._money = 1000; // Initial money
        this._streetCred = 0; // Initial street cred
        this._heat = 0; // Initial heat level
        this._currentDay = 1;
        this._currentTime = 8; // Representing 08:00

        // Player's inventory
        // Structure: [{ itemId: "green_crack", quantity: 10, quality: 1 (index for quality string) }, ...]
        this._inventory = [];

        // Player's location
        this._currentLocationId = "the_warrens"; // Starting district

        // Contacts data
        // Structure: { contactId: "contact_whisper", loyalty: 40, missionsCompleted: [] }
        this._contactsState = {};

        // Systemic states (could be expanded)
        this._systemicStats = {
            cityDespairLevel: 5, // Example systemic stat
            totalHardDrugsSold: 0,
            // ... other stats affecting the game world
        };

        // Game flags or states
        this._gameFlags = {
            isPhoneActive: false,
            isPaused: false,
            // ... other boolean flags
        };

        // Player skills or perks (example structure)
        this._playerSkills = {
            negotiation: 0, // Level or points
            stealth: 0,
        };

        // Active world events
        // Now stores event objects: { id, name, description, duration, effects, remainingDuration, messageOnExpire }
        this._activeWorldEvents = [];
        this._activeEventModifiers = {}; // Stores combined modifiers from active events
    }

    // --- Getters ---
    get money() { return this._money; }
    get streetCred() { return this._streetCred; }
    get heat() { return this._heat; }
    get inventory() { return [...this._inventory]; } // Return a copy to prevent direct modification
    get currentLocationId() { return this._currentLocationId; }
    get contactsState() { return {...this._contactsState}; } // Return a copy
    get systemicStats() { return {...this._systemicStats}; } // Return a copy
    get gameFlags() { return {...this._gameFlags}; } // Return a copy
    get playerSkills() { return {...this._playerSkills}; } // Return a copy
    get currentDay() { return this._currentDay; }
    get currentTime() { return this._currentTime; } // Integer hour
    get activeWorldEvents() { return [...this._activeWorldEvents]; } // Returns array of active event objects
    get activeEventModifiers() { return {...this._activeEventModifiers}; }


    // --- Adjusters (Mutators) ---

    // Money
    adjustMoney(amount) {
        const oldMoney = this._money;
        this._money += amount;
        if (this._money < 0) this._money = 0; // Cannot have negative money
        this.emit('moneyChanged', { newAmount: this._money, oldAmount: oldMoney, difference: amount });
        this.emit('gameStateChanged', { type: 'money', value: this._money });
        return true; // Indicate success
    }

    // Street Cred
    adjustStreetCred(amount) {
        const oldCred = this._streetCred;
        this._streetCred += amount;
        if (this._streetCred < 0) this._streetCred = 0; // Cannot have negative cred
        this.emit('streetCredChanged', { newAmount: this._streetCred, oldAmount: oldCred, difference: amount });
        this.emit('gameStateChanged', { type: 'streetCred', value: this._streetCred });
    }

    // Heat
    adjustHeat(amount) {
        const oldHeat = this._heat;
        this._heat += amount;
        if (this._heat < 0) this._heat = 0;
        if (this._heat > 100) this._heat = 100; // Max heat
        this.emit('heatChanged', { newAmount: this._heat, oldAmount: oldHeat, difference: amount });
        this.emit('gameStateChanged', { type: 'heat', value: this._heat });
    }

    setHeat(value) {
        const oldHeat = this._heat;
        this._heat = Math.max(0, Math.min(100, value));
        this.emit('heatChanged', { newAmount: this._heat, oldAmount: oldHeat, difference: this._heat - oldHeat });
        this.emit('gameStateChanged', { type: 'heat', value: this._heat });
    }

    // Time
    advanceTime(hours) {
        const oldTime = this._currentTime;
        this._currentTime += hours;
        let daysAdvanced = 0;
        while (this._currentTime >= 24) {
            this._currentTime -= 24;
            this._currentDay += 1;
            daysAdvanced++;
        }
        this.emit('timeChanged', { newTime: this._currentTime, newDay: this._currentDay, hoursAdvanced: hours, daysAdvanced });
        this.emit('gameStateChanged', { type: 'time', day: this._currentDay, hour: this._currentTime });
        if (daysAdvanced > 0) {
            this.emit('dayChanged', { newDay: this._currentDay });
        }
    }

    // Inventory
    addItemToInventory(itemId, quantity, qualityIndex) {
        if (quantity <= 0) return false;

        const existingItem = this._inventory.find(item => item.itemId === itemId && item.quality === qualityIndex);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this._inventory.push({ itemId, quantity, quality: qualityIndex });
        }
        this.emit('inventoryChanged', { action: 'add', item: { itemId, quantity, quality: qualityIndex }, newInventory: [...this._inventory] });
        this.emit('gameStateChanged', { type: 'inventory', value: [...this._inventory] });
        return true;
    }

    removeItemFromInventory(itemId, quantity, qualityIndex) {
        if (quantity <= 0) return false;

        const itemIndex = this._inventory.findIndex(item => item.itemId === itemId && item.quality === qualityIndex);
        if (itemIndex > -1) {
            const item = this._inventory[itemIndex];
            if (item.quantity >= quantity) {
                item.quantity -= quantity;
                if (item.quantity === 0) {
                    this._inventory.splice(itemIndex, 1); // Remove item if quantity is zero
                }
                this.emit('inventoryChanged', { action: 'remove', item: { itemId, quantity, quality: qualityIndex }, newInventory: [...this._inventory] });
                this.emit('gameStateChanged', { type: 'inventory', value: [...this._inventory] });
                return true;
            }
        }
        return false; // Item not found or insufficient quantity
    }

    getInventoryItem(itemId, qualityIndex) {
        return this._inventory.find(item => item.itemId === itemId && item.quality === qualityIndex);
    }

    // Location
    setCurrentLocation(locationId) {
        const oldLocation = this._currentLocationId;
        this._currentLocationId = locationId;
        this.emit('locationChanged', { newLocationId: this._currentLocationId, oldLocationId: oldLocation });
        this.emit('gameStateChanged', { type: 'location', value: this._currentLocationId });
    }

    // Contacts State
    updateContactLoyalty(contactId, amount) {
        if (!this._contactsState[contactId]) {
            // Initialize if contact not yet in state (e.g. first interaction)
            // This assumes dataManager provides initial loyalty values if needed elsewhere
            this._contactsState[contactId] = { loyalty: 0, missionsCompleted: [] };
        }
        const oldLoyalty = this._contactsState[contactId].loyalty;
        this._contactsState[contactId].loyalty += amount;
        // Clamp loyalty (e.g., 0-100) if necessary
        // if (this._contactsState[contactId].loyalty < 0) this._contactsState[contactId].loyalty = 0;
        // if (this._contactsState[contactId].loyalty > 100) this._contactsState[contactId].loyalty = 100;

        this.emit('contactLoyaltyChanged', { contactId, newLoyalty: this._contactsState[contactId].loyalty, oldLoyalty, difference: amount });
        this.emit('gameStateChanged', { type: 'contactsState', value: {...this._contactsState} });
    }

    addCompletedMissionForContact(contactId, missionId) {
        if (!this._contactsState[contactId]) {
            this._contactsState[contactId] = { loyalty: 0, missionsCompleted: [] };
        }
        if (!this._contactsState[contactId].missionsCompleted.includes(missionId)) {
            this._contactsState[contactId].missionsCompleted.push(missionId);
            this.emit('contactMissionCompleted', { contactId, missionId });
            this.emit('gameStateChanged', { type: 'contactsState', value: {...this._contactsState} });
        }
    }

    // Systemic Stats
    setSystemicStat(statId, value) {
        const oldValue = this._systemicStats[statId];
        this._systemicStats[statId] = value;
        this.emit('systemicStatChanged', { statId, newValue: value, oldValue });
        this.emit('gameStateChanged', { type: 'systemicStats', value: {...this._systemicStats} });

        // Special handling for activeEventModifiers as it's a complex object
        if (statId === 'activeEventModifiers') {
            this._activeEventModifiers = {...value}; // Ensure it's a new object reference
            this.emit('activeEventModifiersChanged', {...this._activeEventModifiers});
        }
    }

    adjustSystemicStat(statId, amount) {
        const oldValue = this._systemicStats[statId] || 0;
        this._systemicStats[statId] = oldValue + amount;
        this.emit('systemicStatChanged', { statId, newValue: this._systemicStats[statId], oldValue, difference: amount });
        this.emit('gameStateChanged', { type: 'systemicStats', value: {...this._systemicStats} });
    }


    // Game Flags
    setGameFlag(flagName, value) {
        const oldValue = this._gameFlags[flagName];
        if (typeof value !== 'boolean') {
            console.warn(`GameState: Attempted to set flag "${flagName}" with non-boolean value:`, value);
            return;
        }
        this._gameFlags[flagName] = value;
        this.emit('gameFlagChanged', { flagName, newValue: value, oldValue });
        this.emit('gameStateChanged', { type: 'gameFlags', value: {...this._gameFlags} });
    }

    // Player Skills
    updatePlayerSkill(skillName, value) {
        const oldValue = this._playerSkills[skillName];
        this._playerSkills[skillName] = value;
        this.emit('playerSkillChanged', { skillName, newValue: value, oldValue });
        this.emit('gameStateChanged', { type: 'playerSkills', value: {...this._playerSkills} });
    }

    // Active World Events
    addActiveWorldEvent(eventObject) { // Now expects the full event object
        if (!eventObject || !eventObject.id) {
            console.warn("GameState: Attempted to add invalid event object to activeWorldEvents", eventObject);
            return;
        }
        // Check if an event with the same ID is already active to prevent duplicates if logic elsewhere doesn't handle it
        if (!this._activeWorldEvents.some(ev => ev.id === eventObject.id)) {
            this._activeWorldEvents.push(eventObject);
            this.emit('worldEventStarted', { eventId: eventObject.id, event: eventObject });
            this.emit('gameStateChanged', { type: 'activeWorldEvents', value: [...this._activeWorldEvents] });
        } else {
            // If event is already active, perhaps update its duration or re-apply effects?
            // For now, let's just log. WorldEventSystem should manage re-triggering logic.
            console.log(`GameState: Event ${eventObject.id} is already active or being re-added.`);
            // To ensure it's the latest version if re-added:
            const index = this._activeWorldEvents.findIndex(ev => ev.id === eventObject.id);
            if (index > -1) this._activeWorldEvents[index] = eventObject; // Replace with new object
            else this._activeWorldEvents.push(eventObject); // Add if somehow not found by findIndex but present in some check
            this.emit('gameStateChanged', { type: 'activeWorldEvents', value: [...this._activeWorldEvents] });
        }
    }

    removeActiveWorldEvent(eventId) {
        const index = this._activeWorldEvents.findIndex(event => event.id === eventId);
        if (index > -1) {
            const removedEvent = this._activeWorldEvents.splice(index, 1)[0];
            this.emit('worldEventEnded', { eventId: removedEvent.id, event: removedEvent });
            this.emit('gameStateChanged', { type: 'activeWorldEvents', value: [...this._activeWorldEvents] });
        }
    }

    // --- Persistence (Example Stubs) ---
    // These would interact with localStorage or a backend
    saveGameState() {
        const stateToSave = {
            _money: this._money,
            _streetCred: this._streetCred,
            _heat: this._heat,
            _inventory: this._inventory,
            _currentLocationId: this._currentLocationId,
            _contactsState: this._contactsState,
            _systemicStats: this._systemicStats,
            _gameFlags: this._gameFlags,
            _playerSkills: this._playerSkills,
            _currentDay: this._currentDay,
            _currentTime: this._currentTime,
            _activeWorldEvents: this._activeWorldEvents,
        };
        try {
            localStorage.setItem('rikkRefactoredGameState', JSON.stringify(stateToSave));
            console.log("GameState saved.");
            this.emit('gameStateSaved');
        } catch (e) {
            console.error("Error saving game state:", e);
        }
    }

    loadGameState() {
        try {
            const savedState = localStorage.getItem('rikkRefactoredGameState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                this._money = parsedState._money || 1000;
                this._streetCred = parsedState._streetCred || 0;
                this._heat = parsedState._heat || 0;
                this._inventory = parsedState._inventory || [];
                this._currentLocationId = parsedState._currentLocationId || "the_warrens";
                this._contactsState = parsedState._contactsState || {};
                this._systemicStats = parsedState._systemicStats || { cityDespairLevel: 5, totalHardDrugsSold: 0 };
                this._gameFlags = parsedState._gameFlags || { isPhoneActive: false, isPaused: false };
                this._playerSkills = parsedState._playerSkills || { negotiation: 0, stealth: 0 };
                this._currentDay = parsedState._currentDay || 1;
                this._currentTime = parsedState._currentTime || 8;
                this._activeWorldEvents = parsedState._activeWorldEvents || [];

                console.log("GameState loaded.");
                this.emit('gameStateLoaded', { loadedState: this }); // Emit with the full state
                this.emit('gameStateChanged', { type: 'full_load', value: this }); // General change event
            } else {
                console.log("No saved game state found. Starting fresh.");
                // Optionally emit an event if you want UI to react to a "new game" scenario specifically
                this.emit('newGameStarted');
            }
        } catch (e) {
            console.error("Error loading game state:", e);
            // Start fresh if loading fails
             this.emit('newGameStarted');
        }
    }
}
