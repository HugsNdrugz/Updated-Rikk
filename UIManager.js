// UIManager.js
import { debugLogger } from './utils.js';

class UIManager {
    constructor(gameStateInstance, config = {}) {
        if (!gameStateInstance) {
            throw new Error("UIManager requires a GameState instance.");
        }
        this.gameState = gameStateInstance;
        this.config = config; // For UI-specific configurations like APP_CONTAINER_SELECTOR

        // --- Core UI Element References ---
        this.splashScreen = null;
        this.gameViewport = null;
        this.startScreen = null;
        this.gameScreen = null;
        this.endScreen = null;
        this.newGameBtn = null;
        this.continueGameBtn = null;
        this.restartGameBtn = null;
        this.nextCustomerBtn = null;
        this.openInventoryBtn = null;
        this.dockPhoneBtn = null;
        this.cashDisplay = null;
        this.dayDisplay = null;
        this.heatDisplay = null;
        this.credDisplay = null;
        this.eventTicker = null;
        this.gameScene = null;
        this.knockEffect = null;
        this.rikkPhoneUI = null;
        this.phoneScreenArea = null;
        this.androidHomeScreen = null;
        this.gameChatView = null;
        this.contactsAppView = null;
        this.slotGameView = null;
        this.phoneThemeSettingsView = null;
        this.chatContainer = null;
        this.choicesArea = null;
        this.phoneTitleGame = null;
        this.phoneBackButtons = null;
        this.phoneDock = null;
        this.phoneHomeIndicator = null;
        this.phoneDockedIndicator = null;
        this.inventoryModal = null;
        this.closeModalBtn = null;
        this.inventoryList = null;
        this.inventoryCountDisplay = null;
        this.modalInventorySlotsDisplay = null;
        this.finalDaysDisplay = null;
        this.finalCashDisplay = null;
        this.finalCredDisplay = null;
        this.finalVerdictText = null;
        this.primaryActionsContainer = null;
        this.submenuNavigationContainer = null;
        this.settingsMenuBtn = null;
        this.loadMenuBtn = null;
        this.creditsMenuBtn = null;
        this.settingsMenuPanel = null;
        this.loadMenuPanel = null;
        this.creditsMenuPanel = null;
        this.allSubmenuBackBtns = null;
        this.doorKnockSound = null;
        this.cashSound = null;
        this.deniedSound = null;
        this.chatBubbleSound = null;
        this.mainMenuLightContainer = null;
        this.appContainer = null;
        this.styleControls = null;
        this.chatSpacerElement = null;

        // UI State specific to UIManager
        this.currentPhoneState = 'docked'; // Example initial state

        // Style Settings Properties
        this.isPreviewModeActive = false;
        this.originalSettingsBeforePreview = {};
        this.defaultStyleSettings = config.defaultStyleSettings || {};
        this.styleSettingsKey = config.styleSettingsKey || 'rikkGameStyleSettingsV1_fallback'; // Fallback key

        // Add references for preview/reset buttons if UIManager will manage their text.
        // These will be populated in initDOMReferences.
        this.previewMainSettingsButton = null;
        this.previewPhoneSettingsButton = null;
    }

    initDOMReferences() {
        this.splashScreen = document.getElementById('splash-screen');
        this.gameViewport = document.getElementById('game-viewport');
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.endScreen = document.getElementById('end-screen');

        this.newGameBtn = document.getElementById('new-game-btn');
        this.continueGameBtn = document.getElementById('continue-game-btn');
        this.restartGameBtn = document.getElementById('restart-game-btn');

        this.cashDisplay = document.getElementById('cash-display');
        this.dayDisplay = document.getElementById('day-display'); // Represents fiendsLeft
        this.heatDisplay = document.getElementById('heat-display');
        this.credDisplay = document.getElementById('cred-display');

        this.eventTicker = document.getElementById('event-ticker');
        this.gameScene = document.getElementById('game-scene');
        this.knockEffect = document.getElementById('knock-effect');

        this.rikkPhoneUI = document.getElementById('rikk-phone-ui');
        this.phoneScreenArea = document.getElementById('phone-screen-area');
        this.androidHomeScreen = document.getElementById('android-home-screen');
        this.gameChatView = document.getElementById('game-chat-view');
        this.contactsAppView = document.getElementById('contacts-app-view'); // Passed to ContactsAppManager
        this.slotGameView = document.getElementById('slot-game-view');       // Passed to SlotGameManager
        this.phoneThemeSettingsView = document.getElementById('phone-theme-settings-view');

        this.chatContainer = document.getElementById('chat-container-game');
        this.choicesArea = document.getElementById('choices-area-game');
        this.phoneTitleGame = document.getElementById('phone-title-game');
        this.phoneBackButtons = document.querySelectorAll('.phone-back-button');

        if (this.rikkPhoneUI) {
            this.phoneDock = this.rikkPhoneUI.querySelector('.dock');
            this.phoneHomeIndicator = this.rikkPhoneUI.querySelector('.home-indicator');
        }
        this.phoneDockedIndicator = document.getElementById('phone-docked-indicator');
        this.dockPhoneBtn = document.getElementById('dock-phone-btn');

        this.openInventoryBtn = document.getElementById('open-inventory-btn');
        this.inventoryCountDisplay = document.getElementById('inventory-count-display');
        this.nextCustomerBtn = document.getElementById('next-customer-btn');

        this.inventoryModal = document.getElementById('inventory-modal');
        const inventoryDialog = this.inventoryModal ? this.inventoryModal.querySelector('#inventory-dialog') : null;
        if (inventoryDialog) {
            this.closeModalBtn = inventoryDialog.querySelector('.close-modal-btn');
        }
        this.inventoryList = document.getElementById('inventory-list');
        this.modalInventorySlotsDisplay = document.getElementById('modal-inventory-slots-display');

        this.finalDaysDisplay = document.getElementById('final-days-display');
        this.finalCashDisplay = document.getElementById('final-cash-display');
        this.finalCredDisplay = document.getElementById('final-cred-display');
        this.finalVerdictText = document.getElementById('final-verdict-text');

        this.primaryActionsContainer = document.getElementById('primary-actions');
        this.submenuNavigationContainer = document.getElementById('submenu-navigation');

        this.settingsMenuBtn = document.getElementById('settings-menu-btn');
        this.loadMenuBtn = document.getElementById('load-menu-btn');
        this.creditsMenuBtn = document.getElementById('credits-menu-btn');

        this.settingsMenuPanel = document.getElementById('settings-menu-panel');
        this.loadMenuPanel = document.getElementById('load-menu-panel');
        this.creditsMenuPanel = document.getElementById('credits-menu-panel');
        this.allSubmenuBackBtns = document.querySelectorAll('.submenu-back-btn');

        this.doorKnockSound = document.getElementById('door-knock-sound');
        this.cashSound = document.getElementById('cash-sound');
        this.deniedSound = document.getElementById('denied-sound');
        this.chatBubbleSound = document.getElementById('chat-bubble-sound');

        this.mainMenuLightContainer = document.getElementById('main-menu-lights');

        this.appContainer = document.querySelector(this.config.APP_CONTAINER_SELECTOR || '#game-viewport');
        this.styleControls = document.querySelectorAll('[data-variable]');

        // Populate new button references for style settings
        this.previewMainSettingsButton = document.getElementById('preview-style-settings');
        this.previewPhoneSettingsButton = document.getElementById('preview-phone-style-settings');

        if (this.chatContainer) {
            this.chatSpacerElement = document.createElement('div');
            this.chatSpacerElement.className = 'chat-spacer';
            this.chatContainer.appendChild(this.chatSpacerElement);
        }
        debugLogger.log('UIManager', 'DOM references initialized.');
    }

    // --- HUD Updates ---
    updateHUD() {
        if (!this.cashDisplay || !this.dayDisplay || !this.heatDisplay || !this.credDisplay) {
            debugLogger.warn('UIManager', "HUD elements not fully initialized for updateHUD.");
            return;
        }
        this.cashDisplay.textContent = this.gameState.getCash();
        this.dayDisplay.textContent = this.gameState.getFiendsLeft();
        this.heatDisplay.textContent = this.gameState.getHeat();
        this.credDisplay.textContent = this.gameState.getStreetCred();
    }

    updateEventTicker() {
        if (!this.eventTicker) return;
        const events = this.gameState.getActiveWorldEvents();
        if (events.length > 0) {
            const currentEvent = events[0];
            this.eventTicker.textContent = `Word on the street: ${currentEvent.name} (${currentEvent.turnsLeft} turns left)`;
        } else {
            this.eventTicker.textContent = `Word on the street: All quiet... for now. (${this.gameState.getDayOfWeek()})`;
        }
    }

    // --- Screen Management ---
    showScreen(screenToShow) {
        [this.splashScreen, this.startScreen, this.gameScreen, this.endScreen].forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        if (screenToShow) screenToShow.classList.add('active');
    }

    activateMainMenuLights(isActive) {
        if (this.mainMenuLightContainer) {
            if (isActive) this.mainMenuLightContainer.classList.add('lights-active');
            else this.mainMenuLightContainer.classList.remove('lights-active');
        }
    }


    // --- Phone UI Management (Skeleton) ---
    setPhoneUIState(state) {
        this.currentPhoneState = state; // Store the state
        if (!this.rikkPhoneUI || !this.androidHomeScreen || !this.gameChatView || !this.contactsAppView || !this.slotGameView || !this.phoneThemeSettingsView || !this.phoneScreenArea || !this.phoneDockedIndicator || !this.phoneDock || !this.phoneHomeIndicator) {
            debugLogger.warn('UIManager', "Phone UI elements not fully initialized for setPhoneUIState.");
            return;
        }

        // Hide all phone content views initially
        this.rikkPhoneUI.classList.remove('is-offscreen', 'chatting-game', 'home-screen-active', 'app-menu-game');
        this.androidHomeScreen.classList.add('hidden');
        this.gameChatView.classList.add('hidden');
        this.contactsAppView.classList.add('hidden');
        this.slotGameView.classList.add('hidden');
        this.phoneThemeSettingsView.classList.add('hidden');

        this.phoneScreenArea.classList.remove('screen-off');
        this.phoneDockedIndicator.classList.add('hidden');
        if (this.phoneBackButtons) this.phoneBackButtons.forEach(btn => btn.classList.add('hidden'));
        this.phoneDock.classList.add('hidden');
        this.phoneHomeIndicator.classList.add('hidden');

        switch (state) {
            case 'chatting':
                this.rikkPhoneUI.classList.add('chatting-game');
                this.gameChatView.classList.remove('hidden');
                break;
            case 'home':
                this.rikkPhoneUI.classList.add('home-screen-active');
                this.androidHomeScreen.classList.remove('hidden');
                this.phoneDock.classList.remove('hidden');
                this.phoneHomeIndicator.classList.remove('hidden');
                break;
            case 'contacts':
                this.rikkPhoneUI.classList.add('app-menu-game');
                this.contactsAppView.classList.remove('hidden');
                if (this.phoneBackButtons) this.phoneBackButtons.forEach(btn => btn.classList.remove('hidden'));
                break;
            case 'slots':
                this.rikkPhoneUI.classList.add('app-menu-game');
                this.slotGameView.classList.remove('hidden');
                // SlotGameManager.launch() will be called by script.js
                if (this.phoneBackButtons) this.phoneBackButtons.forEach(btn => btn.classList.remove('hidden'));
                break;
            case 'theme-settings':
                this.rikkPhoneUI.classList.add('app-menu-game');
                this.phoneThemeSettingsView.classList.remove('hidden');
                if (this.phoneBackButtons) this.phoneBackButtons.forEach(btn => btn.classList.remove('hidden'));
                break;
            case 'docked':
                this.rikkPhoneUI.classList.add('is-offscreen');
                this.phoneScreenArea.classList.add('screen-off');
                this.phoneDockedIndicator.classList.remove('hidden');
                break;
            case 'offscreen':
                this.rikkPhoneUI.classList.add('is-offscreen');
                this.phoneScreenArea.classList.add('screen-off');
                break;
            default:
                debugLogger.warn('UIManager', `Unknown phone state: ${state}`);
                this.setPhoneUIState('docked'); // Default to docked
                break;
        }
    }

    clearChat() {
        if (this.chatContainer && this.chatSpacerElement) {
            this.chatContainer.innerHTML = ''; // Clear all children
            this.chatContainer.appendChild(this.chatSpacerElement); // Re-add spacer
        } else if (this.chatContainer) {
            this.chatContainer.innerHTML = '';
        }
    }

    clearChoices() {
        if (this.choicesArea) {
            this.choicesArea.innerHTML = '';
        }
    }

    setPhoneTitle(title) {
        if (this.phoneTitleGame) {
            this.phoneTitleGame.textContent = title;
        }
    }

    // --- Modal Management (Inventory - Skeleton) ---
    openInventoryModal() {
        if (!this.inventoryModal) return;
        this.updateInventoryDisplay(); // Needs to be implemented fully
        this.inventoryModal.classList.add('active');
        this.setPhoneUIState('offscreen'); // Manage phone state when modal opens
    }

    closeInventoryModal() {
        if (!this.inventoryModal) return;
        this.inventoryModal.classList.remove('active');
        // Restore phone state based on game context (e.g., chatting or home)
        // This logic might need input from the game controller (script.js)
        const customerActive = this.gameState.getCurrentCustomerInstance() !== null;
        this.setPhoneUIState(customerActive ? 'chatting' : 'home');
    }

    updateInventoryDisplay() {
        if (!this.inventoryList || !this.inventoryCountDisplay || !this.modalInventorySlotsDisplay) {
            debugLogger.warn('UIManager', "Inventory display elements not fully initialized.");
            return;
        }

        const inventory = this.gameState.getInventory();
        const maxSlots = this.gameState.getMaxInventorySlots();

        this.inventoryCountDisplay.textContent = inventory.length;
        this.modalInventorySlotsDisplay.textContent = `${inventory.length}/${maxSlots}`;
        this.inventoryList.innerHTML = ''; // Clear existing items

        if (inventory.length > 0) {
            inventory.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('inventory-item-card');
                // Basic item display, can be enhanced
                itemDiv.innerHTML = `<h4>${item.name} (${item.quality || 'N/A'})</h4>
                                     <p class.item-detail>Copped: $${item.purchasePrice || 'N/A'}<br>
                                     Heat: +${item.itemTypeObj?.heat || 'N/A'}</p>`;
                this.inventoryList.appendChild(itemDiv);
            });
        } else {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'empty-stash-message';
            emptyMsg.textContent = "Your stash is bone dry.";
            this.inventoryList.appendChild(emptyMsg);
        }
    }


    // --- Audio ---
    playSound(soundElement) {
        if (soundElement && typeof soundElement.play === 'function') {
            soundElement.currentTime = 0;
            soundElement.play().catch(e => debugLogger.warn('UIManager', `Audio play failed: ${e.name}`, e));
        } else {
            // debugLogger.warn('UIManager', "Attempted to play an invalid sound element:", soundElement);
        }
    }

    // --- Knock Effect ---
    displayKnockEffect(dayName) {
        if (!this.knockEffect) return;
        this.knockEffect.textContent = `*${dayName} hustle... someone's knockin'.*`;
        this.knockEffect.classList.remove('hidden');
        this.knockEffect.style.animation = 'none'; // Reset animation
        void this.knockEffect.offsetWidth; // Trigger reflow to restart animation
        this.knockEffect.style.animation = 'knockAnim 0.5s ease-out forwards';
    }

    hideKnockEffect() {
        if (this.knockEffect) {
            this.knockEffect.classList.add('hidden');
        }
    }

    // --- Button States ---
    setNextCustomerButtonDisabled(disabled) {
        if (this.nextCustomerBtn) {
            this.nextCustomerBtn.disabled = disabled;
        }
    }

    // --- Display Choices (Skeleton) ---
    // The actual event listener for choice buttons will be attached by script.js,
    // which will pass the handleChoice callback.
    displayChoices(choices, handleChoiceCallback) {
        if (!this.choicesArea) return;
        this.clearChoices(); // Clear previous choices

        if (!choices || choices.length === 0) {
            // debugLogger.warn('UIManager', "No choices to display.");
            return;
        }

        choices.forEach(choice => {
            const button = document.createElement('button');
            button.classList.add('choice-button');
            if (choice.outcome && choice.outcome.type && choice.outcome.type.startsWith('decline')) {
                button.classList.add('decline');
            }
            button.textContent = choice.text;
            button.disabled = choice.disabled || false;

            if (!choice.disabled && typeof handleChoiceCallback === 'function') {
                button.addEventListener('click', () => handleChoiceCallback(choice.outcome));
            } else if (!choice.disabled) {
                // debugLogger.warn('UIManager', "handleChoiceCallback not provided for active choice button:", choice.text);
            }
            this.choicesArea.appendChild(button);
        });
    }

    // --- Phone Message Display (Skeleton) ---
    // This will be a complex method. For now, a basic structure.
    // Assumes currentCustomerInstance is available via this.gameState
    displayPhoneMessage(messageText, speaker) {
        if (typeof messageText === 'undefined' || messageText === null) {
            messageText = "..."; // Default for undefined messages
        }
        if (!this.chatContainer || !this.chatSpacerElement) {
            debugLogger.warn('UIManager', "Chat container not ready for messages.");
            return;
        }

        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chat__conversation-board__message-container');

        if (speaker === 'rikk') {
            messageContainer.classList.add('reversed');
        }

        const personDiv = document.createElement('div');
        personDiv.classList.add('chat__conversation-board__message__person');
        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('chat__conversation-board__message__person__avatar');
        const avatarImg = document.createElement('img');

        const customerInstance = this.gameState.getCurrentCustomerInstance();
        const customerAvatars = this.config.customerAvatars || {}; // Get from config
        const rikkAvatarUrl = this.config.rikkAvatarUrl || '';
        const systemAvatarUrl = this.config.systemAvatarUrl || '';


        if (speaker === 'customer' && customerInstance?.archetypeKey) {
            avatarImg.src = customerAvatars[customerInstance.archetypeKey] || 'https://via.placeholder.com/56/555555/FFFFFF?text=?';
            avatarImg.alt = customerInstance.name || 'Customer';
        } else if (speaker === 'rikk') {
            avatarImg.src = rikkAvatarUrl;
            avatarImg.alt = 'Rikk';
        } else { // system or narration
            avatarImg.src = systemAvatarUrl;
            avatarImg.alt = 'System';
        }
        avatarDiv.appendChild(avatarImg);

        // Only add avatar if not narration
        if (speaker !== 'narration') {
            personDiv.appendChild(avatarDiv);
            messageContainer.appendChild(personDiv);
        }


        const contextDiv = document.createElement('div');
        contextDiv.classList.add('chat__conversation-board__message__context');
        const bubble = document.createElement('div');
        bubble.classList.add('chat-bubble', speaker); // Add speaker class for styling

        if (speaker === 'customer' || speaker === 'rikk') {
            const speakerNameElement = document.createElement('span');
            speakerNameElement.classList.add('speaker-name');
            speakerNameElement.textContent = (speaker === 'customer') ? (customerInstance?.name || '[Customer]') : 'Rikk';
            bubble.appendChild(speakerNameElement);
        }

        // Handle **bold** text
        const messageParts = messageText.split(/(\*\*.*?\*\*)/g);
        messageParts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const boldEl = document.createElement('strong');
                boldEl.textContent = part.slice(2, -2);
                bubble.appendChild(boldEl);
            } else {
                bubble.appendChild(document.createTextNode(part));
            }
        });

        contextDiv.appendChild(bubble);
        messageContainer.appendChild(contextDiv);

        this.chatContainer.insertBefore(messageContainer, this.chatSpacerElement);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight; // Auto-scroll

        // Play sound, but only if not narration (narration sound is handled by game logic before calling this)
        if (speaker !== 'narration' && this.chatBubbleSound) {
            this.playSound(this.chatBubbleSound);
        }
    }

    // --- Style Settings Helper Methods ---
    _applySingleStyle(variableName, value) {
        if (typeof variableName === 'string' && typeof value !== 'undefined') {
            let cssValue = String(value); // Ensure value is string
            const control = Array.from(this.styleControls).find(c => c.dataset.variable === variableName);

            if (control && control.type === 'range' &&
                (variableName.includes('radius') || variableName.includes('unit') || variableName.includes('spacing'))) {
                cssValue += 'px';
            }
            document.documentElement.style.setProperty(variableName, cssValue);
        }
    }

    _getValuesFromControls() {
        const settings = {};
        if (this.styleControls) {
            this.styleControls.forEach(input => {
                settings[input.dataset.variable] = input.value;
            });
        }
        return settings;
    }

    _applyValuesToControls(settings) {
        if (this.styleControls) {
            this.styleControls.forEach(control => {
                const cssVariable = control.dataset.variable;
                if (settings.hasOwnProperty(cssVariable)) {
                    control.value = settings[cssVariable];
                    // Update value display for range inputs
                    if (control.type === 'range') {
                        const valueDisplaySpan = document.querySelector(`.value-display[data-target="${control.id}"]`);
                        if (valueDisplaySpan) valueDisplaySpan.textContent = control.value;
                    }
                }
            });
        }
    }

    // --- Style Settings Core Management Methods ---
    initStyleControls(saveSettingsCb) {
        if (!this.styleControls) return;
        this.styleControls.forEach(control => {
            const cssVariable = control.dataset.variable;
            let eventType = 'input';
            if (control.type === 'select-one') eventType = 'change';

            control.addEventListener(eventType, (event) => {
                const rawValue = event.target.value;
                if (control.type === 'range') {
                    const valueDisplay = document.querySelector(`.value-display[data-target="${control.id}"]`);
                    if (valueDisplay) valueDisplay.textContent = rawValue;
                }
                this._applySingleStyle(cssVariable, rawValue);
                if (!this.isPreviewModeActive && typeof saveSettingsCb === 'function') {
                    saveSettingsCb();
                }
            });
            // Initial update for range value displays after controls are populated by loadAndApplyStyleSettings
            if (control.type === 'range') {
                 const valueDisplay = document.querySelector(`.value-display[data-target="${control.id}"]`);
                 if (valueDisplay) valueDisplay.textContent = control.value;
            }
        });
    }

    loadAndApplyStyleSettings() {
        let loadedSettings = null;
        // Assuming localStorageAvailable is a global or passed via config and accessible here
        // For this example, let's assume it's global, as in the original script.
        if (typeof localStorageAvailable !== 'undefined' && localStorageAvailable) {
            try {
                const settingsString = localStorage.getItem(this.styleSettingsKey);
                if (settingsString) {
                    const parsed = JSON.parse(settingsString);
                    if (typeof parsed === 'object' && parsed !== null) loadedSettings = parsed;
                    else localStorage.removeItem(this.styleSettingsKey);
                }
            } catch (e) {
                debugLogger.error('UIManager', 'Error parsing style settings from localStorage:', e);
                localStorage.removeItem(this.styleSettingsKey);
            }
        }

        const currentStyleSettings = { ...this.defaultStyleSettings, ...loadedSettings };

        this._applyValuesToControls(currentStyleSettings);
        for (const key in currentStyleSettings) {
            this._applySingleStyle(key, currentStyleSettings[key]);
        }

        if (loadedSettings === null && typeof localStorageAvailable !== 'undefined' && localStorageAvailable) {
            this.saveStyleSettingsToStorage();
        }
    }

    saveStyleSettingsToStorage() {
        // Assuming localStorageAvailable is a global or passed via config
        if (typeof localStorageAvailable === 'undefined' || !localStorageAvailable) {
            debugLogger.warn('UIManager', 'localStorage not available. Cannot save style settings.');
            return;
        }
        try {
            const settingsToSave = this._getValuesFromControls();
            localStorage.setItem(this.styleSettingsKey, JSON.stringify(settingsToSave));
            debugLogger.log('UIManager', 'Style settings saved to storage.');
        } catch (error) {
            debugLogger.error('UIManager', 'Failed to save style settings:', error);
        }
    }

    // --- Style Settings Preview Mode Methods ---
    _addCancelPreviewButtonUI(panelId, referenceButtonId) {
        const settingsPanel = document.getElementById(panelId);
        const referenceButton = document.getElementById(referenceButtonId);
        const existingCancelButtonId = `cancel-preview-${panelId.replace(/-/g, '')}`;
        if (document.getElementById(existingCancelButtonId)) return;

        if (settingsPanel && referenceButton) {
            const cancelButton = document.createElement('button');
            cancelButton.id = existingCancelButtonId;
            cancelButton.className = 'cancel-preview-button game-button secondary-action';
            cancelButton.textContent = 'Cancel Preview';
            cancelButton.type = 'button';
            cancelButton.addEventListener('click', () => this.cancelPreview());

            if(referenceButton.nextSibling) referenceButton.parentNode.insertBefore(cancelButton, referenceButton.nextSibling);
            else referenceButton.parentNode.appendChild(cancelButton);
        }
    }

    _removeCancelPreviewButtonUI() {
        document.querySelectorAll('.cancel-preview-button').forEach(btn => btn.remove());
    }

    togglePreview(saveSettingsCb) {
        this.isPreviewModeActive = !this.isPreviewModeActive;
        if (this.appContainer) {
            this.appContainer.classList.toggle('preview-mode', this.isPreviewModeActive);
        }

        const mainBtnText = this.isPreviewModeActive ? 'Apply & Exit Preview' : 'Preview';
        if (this.previewMainSettingsButton) this.previewMainSettingsButton.textContent = mainBtnText;
        if (this.previewPhoneSettingsButton) this.previewPhoneSettingsButton.textContent = mainBtnText;

        if (this.isPreviewModeActive) {
            this.originalSettingsBeforePreview = this._getValuesFromControls();
            this._addCancelPreviewButtonUI('settings-menu-panel', 'preview-style-settings');
            this._addCancelPreviewButtonUI('phone-theme-settings-view', 'preview-phone-style-settings');
            // Assuming phoneShowNotification is a global function or passed in config
            if (typeof phoneShowNotification === 'function') phoneShowNotification("Preview Mode: Activated.", "Settings");
        } else {
            this._removeCancelPreviewButtonUI();
            if (typeof saveSettingsCb === 'function') saveSettingsCb();
            if (typeof phoneShowNotification === 'function') phoneShowNotification("Preview settings applied.", "Settings");
        }
    }

    cancelPreview() {
        if (!this.isPreviewModeActive) return;
        this._applyValuesToControls(this.originalSettingsBeforePreview);
        for (const key in this.originalSettingsBeforePreview) {
            this._applySingleStyle(key, this.originalSettingsBeforePreview[key]);
        }
        this.isPreviewModeActive = false;
        if (this.appContainer) this.appContainer.classList.remove('preview-mode');

        if (this.previewMainSettingsButton) this.previewMainSettingsButton.textContent = 'Preview';
        if (this.previewPhoneSettingsButton) this.previewPhoneSettingsButton.textContent = 'Preview';
        this._removeCancelPreviewButtonUI();
        if (typeof phoneShowNotification === 'function') phoneShowNotification("Preview cancelled.", "Settings");
    }

    resetToDefaultStyles(saveSettingsCb) {
        this._applyValuesToControls(this.defaultStyleSettings);
        for (const key in this.defaultStyleSettings) {
            this._applySingleStyle(key, this.defaultStyleSettings[key]);
        }
        if (typeof saveSettingsCb === 'function') {
            saveSettingsCb();
        }
        if (typeof phoneShowNotification === 'function') phoneShowNotification("Styles reset to defaults.", "Settings");
    }

    // --- Submenu Panel Methods ---
    toggleMainMenuButtons(show) {
        if (!this.primaryActionsContainer || !this.submenuNavigationContainer) {
            debugLogger.warn('UIManager', 'Main menu button containers not found.');
            return;
        }
        if (show) {
            this.primaryActionsContainer.classList.remove('hidden');
            this.submenuNavigationContainer.classList.remove('hidden');
        } else {
            this.primaryActionsContainer.classList.add('hidden');
            this.submenuNavigationContainer.classList.add('hidden');
        }
    }

    openSubmenuPanel(panelElement) {
        if (!panelElement) {
            debugLogger.warn('UIManager', 'Attempted to open a null panel.');
            return;
        }
        this.toggleMainMenuButtons(false);
        panelElement.classList.remove('hidden');
    }

    closeSubmenuPanel(panelElement) {
        if (!panelElement) {
            debugLogger.warn('UIManager', 'Attempted to close a null panel.');
            return;
        }
        panelElement.classList.add('hidden');
        this.toggleMainMenuButtons(true);
    }
}

// Export if using ES modules
// export { UIManager };
