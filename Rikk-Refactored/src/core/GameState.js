// src/core/GameState.js
import { EventEmitter } from './EventEmitter.js';
import { debugLogger, generateUniqueId, clamp } from './utils.js';

export class GameState extends EventEmitter {
    constructor(dataManager) { // Pass DataManager for initial contact loyalty
        super();
        this.dataManager = dataManager; // Store DataManager instance
        debugLogger.log('GameState', 'Constructor called.');
        this.resetToDefault(); // Initialize with default values
    }

    // --- Getters ---
    get money() { return this._money; }
    get streetCred() { return this._streetCred; } // Returns the whole object
    get heat() { return this._heat; }
    get inventory() { return [...this._inventory]; }
    get currentLocationId() { return this._currentLocationId; }
    get contactsState() { return {...this._contactsState}; }
    get systemicStats() { return {...this._systemicStats}; }
    get gameFlags() { return {...this._gameFlags}; }
    get playerSkills() { return {...this._playerSkills}; }
    get currentDay() { return this._currentDay; }
    get currentTime() { return this._currentTime; }
    get activeWorldEvents() { return [...this._activeWorldEvents]; }
    get activeEventModifiers() { return {...this._activeEventModifiers}; }
    getPlayerChoice(choiceId) { return this._playerChoices[choiceId]; }
    isToolEffectActive(effectId) { return this._activeToolEffects.includes(effectId); }
    getTriggeredConsequenceTimestamp(consequenceId) { return this._triggeredConsequences[consequenceId]; }


    // --- Adjusters (Mutators) ---
    adjustMoney(amount) {
        const oldMoney = this._money;
        this._money = clamp(this._money + amount, 0, Infinity);
        this.emit('moneyChanged', { newAmount: this._money, oldAmount: oldMoney, difference: this._money - oldMoney });
        this.emit('gameStateChanged', { type: 'money', value: this._money });
        debugLogger.log('GameState', `Money adjusted by ${amount}. New: ${this._money}`);
        return true;
    }

    adjustStreetCred(amount, targetType = 'global', targetId = null) {
        if (targetType === 'global') {
            const oldCred = this._streetCred.global;
            this._streetCred.global = clamp((this._streetCred.global || 0) + amount, 0, Infinity);
            this.emit('streetCredChanged', { newAmount: this._streetCred.global, oldAmount: oldCred, difference: this._streetCred.global - oldCred, targetType, targetId });
            debugLogger.log('GameState', `Global StreetCred adjusted by ${amount}. New: ${this._streetCred.global}`);
        } else if (this._streetCred[targetType] && this._streetCred[targetType].hasOwnProperty(targetId)) {
            const oldCred = this._streetCred[targetType][targetId];
            this._streetCred[targetType][targetId] = clamp((this._streetCred[targetType][targetId] || 0) + amount, 0, Infinity);
            this.emit('streetCredChanged', { newAmount: this._streetCred[targetType][targetId], oldAmount: oldCred, difference: this._streetCred[targetType][targetId] - oldCred, targetType, targetId });
            debugLogger.log('GameState', `${targetType}.${targetId} StreetCred adjusted by ${amount}. New: ${this._streetCred[targetType][targetId]}`);
        } else {
            debugLogger.warn('GameState', `Invalid targetType or targetId for adjustStreetCred: ${targetType}, ${targetId}`);
            return; // Explicitly return if invalid target
        }
        this.emit('gameStateChanged', { type: 'streetCred', value: this._streetCred });
    }

    adjustHeat(amount) {
        const oldHeat = this._heat;
        this._heat = clamp(this._heat + amount, 0, 100);
        this.emit('heatChanged', { newAmount: this._heat, oldAmount: oldHeat, difference: this._heat - oldHeat });
        this.emit('gameStateChanged', { type: 'heat', value: this._heat });
        debugLogger.log('GameState', `Heat adjusted by ${amount}. New: ${this._heat}`);
    }

    setHeat(value) {
        const oldHeat = this._heat;
        this._heat = clamp(value, 0, 100);
        this.emit('heatChanged', { newAmount: this._heat, oldAmount: oldHeat, difference: this._heat - oldHeat });
        this.emit('gameStateChanged', { type: 'heat', value: this._heat });
        debugLogger.log('GameState', `Heat set to ${value}. New: ${this._heat}`);
    }

    advanceTime(hours) {
        // const oldTime = this._currentTime;
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
        debugLogger.log('GameState', `Time advanced by ${hours} hours. New time: Day ${this._currentDay}, ${this._currentTime}:00`);
    }

    addItemToInventory(itemId, quantity, qualityIndex, itemData = null) {
        if (quantity <= 0) {
            debugLogger.warn('GameState', `Attempted to add non-positive quantity of ${itemId}`);
            return false;
        }
        if (this.isInventoryFull() && !this._inventory.find(item => item.itemId === itemId && item.quality === qualityIndex)) {
             debugLogger.warn('GameState', `Inventory full. Cannot add new item type ${itemId}.`);
             this.emit('inventoryFull', { itemAttempted: { itemId, quantity, quality: qualityIndex } });
             return false;
        }

        const existingItem = this._inventory.find(item => item.itemId === itemId && item.quality === qualityIndex);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const instanceId = generateUniqueId('itemstack');
            this._inventory.push({ instanceId, itemId, quantity, quality: qualityIndex, itemData });
        }
        this.emit('inventoryChanged', { action: 'add', item: { itemId, quantity, quality: qualityIndex, itemData }, newInventory: [...this._inventory] });
        this.emit('gameStateChanged', { type: 'inventory', value: [...this._inventory] });
        debugLogger.log('GameState', `Added ${quantity} of ${itemId} (Q${qualityIndex}) to inventory.`);
        return true;
    }

    removeItemFromInventory(itemId, quantity, qualityIndex) {
        if (quantity <= 0) {
            debugLogger.warn('GameState', `Attempted to remove non-positive quantity of ${itemId}`);
            return false;
        }
        const itemIndex = this._inventory.findIndex(item => item.itemId === itemId && item.quality === qualityIndex);
        if (itemIndex > -1) {
            const item = this._inventory[itemIndex];
            if (item.quantity >= quantity) {
                item.quantity -= quantity;
                const removedItemData = { ...item, quantity };
                if (item.quantity === 0) {
                    this._inventory.splice(itemIndex, 1);
                }
                this.emit('inventoryChanged', { action: 'remove', item: removedItemData, newInventory: [...this._inventory] });
                this.emit('gameStateChanged', { type: 'inventory', value: [...this._inventory] });
                debugLogger.log('GameState', `Removed ${quantity} of ${itemId} (Q${qualityIndex}) from inventory.`);
                return true;
            } else {
                debugLogger.warn('GameState', `Insufficient quantity of ${itemId} (Q${qualityIndex}) to remove. Has: ${item.quantity}, Tried: ${quantity}`);
            }
        } else {
            debugLogger.warn('GameState', `Item ${itemId} (Q${qualityIndex}) not found in inventory to remove.`);
        }
        return false;
    }

    getInventoryItem(itemId, qualityIndex) {
        return this._inventory.find(item => item.itemId === itemId && item.quality === qualityIndex);
    }

    isInventoryFull() {
        return this._inventory.length >= (this._gameFlags.maxInventorySlots || 10);
    }

    setCurrentLocation(locationId) {
        const oldLocation = this._currentLocationId;
        this._currentLocationId = locationId;
        this.emit('locationChanged', { newLocationId: this._currentLocationId, oldLocationId: oldLocation });
        this.emit('gameStateChanged', { type: 'location', value: this._currentLocationId });
        debugLogger.log('GameState', `Location changed from ${oldLocation} to ${this._currentLocationId}`);
    }

    updateContactLoyalty(contactId, amount) {
        if (!this.dataManager) {
            debugLogger.error('GameState', 'DataManager not available in GameState. Cannot initialize contact loyalty properly.');
            // Fallback to a very basic initialization if DataManager is missing
            if (!this._contactsState[contactId]) {
                this._contactsState[contactId] = { loyalty: 50, missionsCompleted: [] };
                debugLogger.warn('GameState', `Initialized contact ${contactId} with fallback loyalty due to missing DataManager.`);
            }
        } else if (!this._contactsState[contactId]) {
            const contactData = this.dataManager.getContactById(contactId);
            const initialLoyalty = contactData ? contactData.initialLoyalty : 50;
            this._contactsState[contactId] = { loyalty: initialLoyalty, missionsCompleted: [] };
            debugLogger.log('GameState', `Initialized contact ${contactId} with loyalty ${initialLoyalty}.`);
        }

        const oldLoyalty = this._contactsState[contactId].loyalty;
        this._contactsState[contactId].loyalty = clamp(this._contactsState[contactId].loyalty + amount, 0, 100);

        this.emit('contactLoyaltyChanged', { contactId, newLoyalty: this._contactsState[contactId].loyalty, oldLoyalty, difference: this._contactsState[contactId].loyalty - oldLoyalty });
        this.emit('gameStateChanged', { type: 'contactsState', value: {...this._contactsState} });
        debugLogger.log('GameState', `Loyalty for ${contactId} changed by ${amount}. New: ${this._contactsState[contactId].loyalty}`);
    }

    addCompletedMissionForContact(contactId, missionId) {
        if (!this._contactsState[contactId]) {
            const contactData = this.dataManager?.getContactById(contactId); // Use optional chaining
            const initialLoyalty = contactData ? contactData.initialLoyalty : 50;
            this._contactsState[contactId] = { loyalty: initialLoyalty, missionsCompleted: [] };
            debugLogger.log('GameState', `Initialized contact ${contactId} for mission completion.`);
        }
        if (!this._contactsState[contactId].missionsCompleted.includes(missionId)) {
            this._contactsState[contactId].missionsCompleted.push(missionId);
            this.emit('contactMissionCompleted', { contactId, missionId });
            this.emit('gameStateChanged', { type: 'contactsState', value: {...this._contactsState} });
            debugLogger.log('GameState', `Mission ${missionId} completed for contact ${contactId}.`);
        }
    }

    setSystemicStat(statId, value) {
        const oldValue = this._systemicStats[statId];
        this._systemicStats[statId] = value;
        this.emit('systemicStatChanged', { statId, newValue: value, oldValue });
        this.emit('gameStateChanged', { type: 'systemicStats', value: {...this._systemicStats} });
        if (statId === 'activeEventModifiers') {
            this._activeEventModifiers = {...value};
            this.emit('activeEventModifiersChanged', {...this._activeEventModifiers});
        }
    }

    adjustSystemicStat(statId, amount) {
        const oldValue = this._systemicStats[statId] || 0;
        this._systemicStats[statId] = oldValue + amount;
        this.emit('systemicStatChanged', { statId, newValue: this._systemicStats[statId], oldValue, difference: amount });
        this.emit('gameStateChanged', { type: 'systemicStats', value: {...this._systemicStats} });
    }

    setGameFlag(flagName, value) {
        const oldValue = this._gameFlags[flagName];
        if (typeof value !== 'boolean' && flagName !== 'currentOpenApp' && flagName !== 'maxInventorySlots') { // Allow non-boolean for specific flags
            debugLogger.warn('GameState', `Attempted to set flag "${flagName}" with non-boolean value:`, value);
            return;
        }
        this._gameFlags[flagName] = value;
        this.emit('gameFlagChanged', { flagName, newValue: value, oldValue });
        this.emit('gameStateChanged', { type: 'gameFlags', value: {...this._gameFlags} });
    }

    updatePlayerSkill(skillName, valueChange) {
        if (this._playerSkills.hasOwnProperty(skillName)) {
            const oldValue = this._playerSkills[skillName];
            this._playerSkills[skillName] = clamp(this._playerSkills[skillName] + valueChange, 0, 10);
            this.emit('playerSkillChanged', { skillName, newValue: this._playerSkills[skillName], oldValue, difference: this._playerSkills[skillName] - oldValue });
            this.emit('gameStateChanged', { type: 'playerSkills', value: {...this._playerSkills} });
            debugLogger.log('GameState', `Player skill ${skillName} changed by ${valueChange}. New: ${this._playerSkills[skillName]}`);
        } else {
            debugLogger.warn('GameState', `Attempted to update unknown skill: ${skillName}`);
        }
    }

    setPlayerSkills(skillsObject) {
        this._playerSkills = { ...this._playerSkills, ...skillsObject };
        this.emit('playerSkillsLoaded', {...this._playerSkills});
        this.emit('gameStateChanged', { type: 'playerSkills', value: {...this._playerSkills} });
        debugLogger.log('GameState', `Player skills set/loaded:`, this._playerSkills);
    }

    setPlayerChoice(choiceId, value) {
        const oldValue = this._playerChoices[choiceId];
        this._playerChoices[choiceId] = value;
        this.emit('playerChoiceChanged', { choiceId, newValue: value, oldValue });
        this.emit('gameStateChanged', { type: 'playerChoices', value: {...this._playerChoices} });
        debugLogger.log('GameState', `Player choice ${choiceId} set to ${value}.`);
    }

    addActiveToolEffect(effectId) {
        if (!this._activeToolEffects.includes(effectId)) {
            this._activeToolEffects.push(effectId);
            this.emit('toolEffectActivated', { effectId });
            this.emit('gameStateChanged', { type: 'activeToolEffects', value: [...this._activeToolEffects]});
            debugLogger.log('GameState', `Tool effect ${effectId} activated.`);
        }
    }

    removeActiveToolEffect(effectId) {
        const index = this._activeToolEffects.indexOf(effectId);
        if (index > -1) {
            this._activeToolEffects.splice(index, 1);
            this.emit('toolEffectDeactivated', { effectId });
            this.emit('gameStateChanged', { type: 'activeToolEffects', value: [...this._activeToolEffects]});
            debugLogger.log('GameState', `Tool effect ${effectId} deactivated.`);
        }
    }

    setTriggeredConsequence(consequenceId, timestamp) {
        this._triggeredConsequences[consequenceId] = timestamp;
        this.emit('consequenceStateChanged', { consequenceId, timestamp });
        this.emit('gameStateChanged', { type: 'triggeredConsequences', value: {...this._triggeredConsequences}});
        debugLogger.log('GameState', `Consequence ${consequenceId} marked as triggered/on cooldown until ${timestamp}.`);
    }

    addActiveWorldEvent(eventObject) {
        if (!eventObject || !eventObject.id) {
            debugLogger.warn("GameState", "Attempted to add invalid event object to activeWorldEvents", eventObject);
            return;
        }
        if (!this._activeWorldEvents.some(ev => ev.id === eventObject.id)) {
            this._activeWorldEvents.push(eventObject);
            this.emit('worldEventStarted', { eventId: eventObject.id, event: eventObject });
        } else {
            debugLogger.log('GameState', `Event ${eventObject.id} is already active or being re-added.`);
            const index = this._activeWorldEvents.findIndex(ev => ev.id === eventObject.id);
            if (index > -1) this._activeWorldEvents[index] = eventObject;
            else this._activeWorldEvents.push(eventObject);
        }
        this.emit('gameStateChanged', { type: 'activeWorldEvents', value: [...this._activeWorldEvents] });
    }

    removeActiveWorldEvent(eventId) {
        const index = this._activeWorldEvents.findIndex(event => event.id === eventId);
        if (index > -1) {
            const removedEvent = this._activeWorldEvents.splice(index, 1)[0];
            this.emit('worldEventEnded', { eventId: removedEvent.id, event: removedEvent });
            this.emit('gameStateChanged', { type: 'activeWorldEvents', value: [...this._activeWorldEvents] });
            debugLogger.log('GameState', `Active world event ${eventId} removed.`);
        }
    }

    saveGameState() {
        const stateToSave = {
            _money: this._money,
            _streetCred: this._streetCred,
            _heat: this._heat,
            _inventory: this._inventory,
            _currentLocationId: this._currentLocationId,
            _contactsState: this._contactsState,
            _systemicStats: this._systemicStats, // Includes _activeEventModifiers
            _gameFlags: this._gameFlags,
            _playerSkills: this._playerSkills,
            _currentDay: this._currentDay,
            _currentTime: this._currentTime,
            _activeWorldEvents: this._activeWorldEvents,
            _playerChoices: this._playerChoices,
            _activeToolEffects: this._activeToolEffects,
            _triggeredConsequences: this._triggeredConsequences,
        };
        try {
            localStorage.setItem('rikkRefactoredGameState', JSON.stringify(stateToSave));
            debugLogger.log("GameState", "GameState saved to localStorage.");
            this.emit('gameStateSaved');
        } catch (e) {
            debugLogger.error("GameState", "Error saving game state to localStorage:", e);
        }
    }

    loadGameState() {
        try {
            const savedStateString = localStorage.getItem('rikkRefactoredGameState');
            if (savedStateString) {
                const parsedState = JSON.parse(savedStateString);

                this._money = parsedState._money ?? 1000;
                this._streetCred = parsedState._streetCred ?? { global: 0, factions: { police: 0, zetas_cartel: 0 }, districts: { downtown: 0, warrens: 0 }, communityFigures: { mama_carter: 0, pastor_jones: 0 }};
                this._heat = parsedState._heat ?? 0;
                this._inventory = parsedState._inventory || [];
                this._currentLocationId = parsedState._currentLocationId || "the_warrens";
                this._contactsState = parsedState._contactsState || {};
                this._systemicStats = parsedState._systemicStats || { cityDespairLevel: 5, totalHardDrugsSold: 0, activeEventModifiers: {} };
                this._activeEventModifiers = this._systemicStats.activeEventModifiers || {};
                this._gameFlags = parsedState._gameFlags || { isPhoneActive: false, isPaused: false, currentOpenApp: 'home', maxInventorySlots: 10 };
                this._playerSkills = parsedState._playerSkills || { negotiator: 0, lowProfile: 0, appraiser: 0 };
                this._currentDay = parsedState._currentDay || 1;
                this._currentTime = parsedState._currentTime || 8;
                this._activeWorldEvents = parsedState._activeWorldEvents || [];
                this._playerChoices = parsedState._playerChoices || {};
                this._activeToolEffects = parsedState._activeToolEffects || [];
                this._triggeredConsequences = parsedState._triggeredConsequences || {};

                debugLogger.log("GameState","GameState loaded from localStorage.");
                this.emit('gameStateLoaded', { loadedState: this });
                this.emit('gameStateChanged', { type: 'full_load', value: this });
            } else {
                debugLogger.log("GameState","No saved game state found. Starting fresh.");
                this.resetToDefault();
                this.emit('newGameStarted');
            }
        } catch (e) {
            debugLogger.error("GameState", "Error loading game state from localStorage:", e);
            this.resetToDefault();
            this.emit('newGameStarted');
        }
    }

    resetToDefault() {
        debugLogger.log('GameState', 'Resetting to default state.');
        this._money = 1000;
        this._streetCred = { global: 0, factions: { police: 0, zetas_cartel: 0 }, districts: { downtown: 0, warrens: 0 }, communityFigures: { mama_carter: 0, pastor_jones: 0 }};
        this._heat = 0;
        this._inventory = [];
        this._currentLocationId = "the_warrens";
        this._contactsState = {}; // Will be populated by LoyaltySystem/ContactsApp as needed
        this._systemicStats = {
            cityDespairLevel: 5,
            totalHardDrugsSold: 0,
            activeEventModifiers: {}
        };
        this._activeEventModifiers = {};
        this._gameFlags = {
            isPhoneActive: false,
            isPaused: false,
            currentOpenApp: 'home',
            maxInventorySlots: 10 // Default max slots
        };
        this._playerSkills = { negotiator: 0, lowProfile: 0, appraiser: 0 };
        this._currentDay = 1;
        this._currentTime = 8;
        this._activeWorldEvents = [];
        this._playerChoices = {};
        this._activeToolEffects = [];
        this._triggeredConsequences = {};
        this.emit('gameStateReset');
        this.emit('gameStateChanged', { type: 'full_reset', value: this });
    }
}
