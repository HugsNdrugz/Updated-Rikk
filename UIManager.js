

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
        // this.contactsAppView = null; // This will be the main container for list/detail
        this.contactsAppScreen = null; // Main container for the contacts app
        this.contactsListContainer = null; // For the list view
        this.contactDetailView = null; // For the detail view
        this.contactDetailAvatar = null;
        this.contactDetailName = null;
        this.contactDetailDescription = null;
        this.contactDetailLoyalty = null;
        this.contactDetailServicesList = null;
        this.contactDetailMissionsList = null;
        this.contactDetailBackButton = null;

        this.mapAppView = null; // Main container for map app
        this.mapGridContainer = null; // For visual grid layout

        this.newsAppView = null; // Main container for news app
        this.newsListContainer = null; // For the list of articles
        this.newsArticleDetailView = null; // For showing full article
        this.newsArticleHeadline = null;
        this.newsArticleBody = null;
        this.newsArticleBackButton = null; // Specific back button for article view

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
        this.resetMainSettingsButton = null;
        this.resetPhoneSettingsButton = null;
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
        // this.contactsAppView = document.getElementById('contacts-app-view');
        this.contactsAppScreen = document.getElementById('contacts-app-view'); // Use existing as main screen

        // Assuming these are new elements within contacts-app-view or created dynamically
        // For now, let's assume they might not exist yet and handle null checks,
        // or that they are part of a pre-defined hidden structure in index.html
        this.contactsListContainer = document.getElementById('contacts-list-container');
        this.contactDetailView = document.getElementById('contact-detail-view');
        this.contactDetailAvatar = document.getElementById('contact-detail-avatar');
        this.contactDetailName = document.getElementById('contact-detail-name');
        this.contactDetailDescription = document.getElementById('contact-detail-description');
        this.contactDetailLoyalty = document.getElementById('contact-detail-loyalty');
        this.contactDetailServicesList = document.getElementById('contact-detail-services-list');
        this.contactDetailMissionsList = document.getElementById('contact-detail-missions-list');
        this.contactDetailBackButton = document.getElementById('contact-detail-back-button');

        this.mapAppView = document.getElementById('map-app-view');
        this.mapGridContainer = document.getElementById('map-grid-container');

        this.newsAppView = document.getElementById('news-app-view');
        this.newsListContainer = document.getElementById('news-list-container');
        this.newsArticleDetailView = document.getElementById('news-article-detail-view');
        this.newsArticleHeadline = document.getElementById('news-article-headline');
        this.newsArticleBody = document.getElementById('news-article-body');
        this.newsArticleBackButton = document.getElementById('news-article-back-button');


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
        this.resetMainSettingsButton = document.getElementById('reset-style-settings');
        this.resetPhoneSettingsButton = document.getElementById('reset-phone-style-settings');

        if (this.chatContainer) {
            this.chatSpacerElement = document.createElement('div');
            this.chatSpacerElement.className = 'chat-spacer';
            this.chatContainer.appendChild(this.chatSpacerElement);
        }
    // debugLogger.log('UIManager', 'DOM references initialized.'); // Replaced by more specific logs
    console.log("UIMGR: initDOMReferences() finished.");
    console.log("UIMGR: splashScreen element:", this.splashScreen ? "Found" : "NOT FOUND");
    console.log("UIMGR: startScreen element:", this.startScreen ? "Found" : "NOT FOUND");
    console.log("UIMGR: gameScreen element:", this.gameScreen ? "Found" : "NOT FOUND");
    console.log("UIMGR: rikkPhoneUI element:", this.rikkPhoneUI ? "Found" : "NOT FOUND");
    console.log("UIMGR: contactsAppScreen element:", this.contactsAppScreen ? "Found" : "NOT FOUND");
    console.log("UIMGR: mapAppView element:", this.mapAppView ? "Found" : "NOT FOUND");
    console.log("UIMGR: newsAppView element:", this.newsAppView ? "Found" : "NOT FOUND");
    }

    // --- HUD Updates ---
    updateHUD() {
        if (!this.cashDisplay || !this.dayDisplay || !this.heatDisplay || !this.credDisplay) {
            debugLogger.warn('UIManager', "HUD elements not fully initialized for updateHUD.");
            return;
        }
        this.cashDisplay.textContent = this.gameState.getCash();
        this.dayDisplay.textContent = this.gameState.getFiendsLeft();
        const heatLevel = this.gameState.getHeat();
        this.heatDisplay.textContent = heatLevel;
        this.credDisplay.textContent = this.gameState.getStreetCred('global'); // Assuming global for HUD

        // Remove old heat classes
        this.heatDisplay.classList.remove('heat-low', 'heat-medium', 'heat-high', 'heat-critical');

        // Add new heat class based on thresholds
        if (heatLevel <= 25) {
            this.heatDisplay.classList.add('heat-low');
        } else if (heatLevel <= 50) {
            this.heatDisplay.classList.add('heat-medium');
        } else if (heatLevel <= 75) {
            this.heatDisplay.classList.add('heat-high');
        } else {
            this.heatDisplay.classList.add('heat-critical');
        }
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
    console.log("UIMGR: showScreen() called for:", screenToShow ? screenToShow.id : "null element");
        [this.splashScreen, this.startScreen, this.gameScreen, this.endScreen].forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
    if (screenToShow) {
        screenToShow.classList.add('active');
    } else {
        console.warn("UIMGR: showScreen() called with a null element. No screen will be shown.");
    }
    }

    activateMainMenuLights(isActive) {
        if (this.mainMenuLightContainer) {
            if (isActive) this.mainMenuLightContainer.classList.add('lights-active');
            else this.mainMenuLightContainer.classList.remove('lights-active');
        }
    }


    // --- Phone UI Management (Skeleton) ---
    setPhoneUIState(state) {
        console.log("UIMGR: setPhoneUIState() called with state:", state); // Added log
        this.currentPhoneState = state; // Store the state
        if (!this.rikkPhoneUI || !this.androidHomeScreen || !this.gameChatView || !this.contactsAppScreen || !this.slotGameView || !this.phoneThemeSettingsView || !this.phoneScreenArea || !this.phoneDockedIndicator || !this.phoneDock || !this.phoneHomeIndicator) {
            console.warn('UIMGR: Critical Phone UI elements not fully initialized for setPhoneUIState. Aborting state change.'); // Changed to console.warn
            return;
        }

        // Hide all phone content views initially
        this.rikkPhoneUI.classList.remove('is-offscreen', 'chatting-game', 'home-screen-active', 'app-menu-game');
        this.androidHomeScreen.classList.add('hidden');
        this.gameChatView.classList.add('hidden');
        this.contactsAppScreen.classList.add('hidden'); // Main screen for contacts app
        if (this.contactsListContainer) this.contactsListContainer.classList.add('hidden');
        if (this.contactDetailView) this.contactDetailView.classList.add('hidden');
        if (this.mapAppView) this.mapAppView.classList.add('hidden');
        if (this.newsAppView) this.newsAppView.classList.add('hidden'); // Hide news app main view
        if (this.newsListContainer) this.newsListContainer.classList.add('hidden');
        if (this.newsArticleDetailView) this.newsArticleDetailView.classList.add('hidden');
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
            case 'contactsAppList': // New state for showing contacts list
                this.rikkPhoneUI.classList.add('app-menu-game'); // Use generic app state class
                this.contactsAppScreen.classList.remove('hidden');
                if (this.contactDetailView) this.contactDetailView.classList.add('hidden'); // Hide detail
                if (this.contactsListContainer) {
                    this.contactsListContainer.classList.remove('hidden'); // Show list
                    this._renderContactsAppList();
                } else {
                     this._renderContactsAppList(); // Render directly into contactsAppScreen if no sub-container
                }
                if (this.phoneBackButtons) this.phoneBackButtons.forEach(btn => btn.classList.remove('hidden'));
                this.setPhoneTitle("Contacts");
                break;
            case 'contactDetail': // New state for showing contact detail
                this.rikkPhoneUI.classList.add('app-menu-game');
                this.contactsAppScreen.classList.remove('hidden');
                if (this.contactsListContainer) this.contactsListContainer.classList.add('hidden'); // Hide list
                if (this.contactDetailView) {
                    this.contactDetailView.classList.remove('hidden'); // Show detail
                    // _renderContactsAppDetail would be called by the click handler with contactId
                } else {
                    // If contactDetailView is not a separate element, _renderContactsAppDetail will replace
                    // content of contactsAppScreen. The argument for contactId must be passed.
                    // This state change itself doesn't call render, the click handler does.
                }
                if (this.phoneBackButtons) this.phoneBackButtons.forEach(btn => btn.classList.remove('hidden'));
                // Phone title will be set by _renderContactsAppDetail
                break;
            case 'mapAppView': // New state for Map App
                this.rikkPhoneUI.classList.add('app-menu-game');
                if (this.mapAppView) this.mapAppView.classList.remove('hidden');
                this._renderMapAppView();
                if (this.phoneBackButtons) this.phoneBackButtons.forEach(btn => btn.classList.remove('hidden'));
                this.setPhoneTitle("City Map");
                break;
            case 'newsAppList': // New state for News App List
                this.rikkPhoneUI.classList.add('app-menu-game');
                if (this.newsAppView) this.newsAppView.classList.remove('hidden');
                if (this.newsArticleDetailView) this.newsArticleDetailView.classList.add('hidden');
                if (this.newsListContainer) {
                    this.newsListContainer.classList.remove('hidden');
                    this._renderNewsAppList();
                } else if (this.newsAppView) { // Fallback if specific list container doesn't exist
                    this._renderNewsAppList();
                }
                if (this.phoneBackButtons) this.phoneBackButtons.forEach(btn => btn.classList.remove('hidden'));
                this.setPhoneTitle("News Feed");
                break;
            case 'newsAppArticleDetail': // New state for News Article Detail
                this.rikkPhoneUI.classList.add('app-menu-game');
                if (this.newsAppView) this.newsAppView.classList.remove('hidden');
                if (this.newsListContainer) this.newsListContainer.classList.add('hidden');
                if (this.newsArticleDetailView) {
                    this.newsArticleDetailView.classList.remove('hidden');
                    // _renderNewsAppArticleDetail will be called by click handler with articleId
                } else if (this.newsAppView) { // Fallback
                     // _renderNewsAppArticleDetail will populate this main view
                }
                if (this.phoneBackButtons) this.phoneBackButtons.forEach(btn => btn.classList.remove('hidden'));
                // Phone title will be set by _renderNewsAppArticleDetail
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
                                     <p class="item-detail">Copped: $${item.purchasePrice || 'N/A'}<br>
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

    setContinueButtonVisibility(isVisible) {
        if (this.continueGameBtn) {
            if (isVisible) {
                this.continueGameBtn.classList.remove('hidden');
            } else {
                this.continueGameBtn.classList.add('hidden');
            }
        } else {
            debugLogger.warn('UIManager', 'Continue game button not found to set visibility.');
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
                        if (valueDisplaySpan) {
                            try {
                                valueDisplaySpan.textContent = control.value;
                            } catch (error) {
                                debugLogger.error('UIManager', `Error setting textContent for valueDisplaySpan in _applyValuesToControls: ${error.message}`, error);
                            }
                        }
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
                    if (valueDisplay) {
                        try {
                            valueDisplay.textContent = rawValue;
                        } catch (error) {
                            debugLogger.error('UIManager', `Error setting textContent for valueDisplay in initStyleControls event listener: ${error.message}`, error);
                        }
                    }
                }
                this._applySingleStyle(cssVariable, rawValue);
                if (!this.isPreviewModeActive && typeof saveSettingsCb === 'function') {
                    saveSettingsCb();
                }
            });
            // Initial update for range value displays after controls are populated by loadAndApplyStyleSettings
            if (control.type === 'range') {
                 const valueDisplay = document.querySelector(`.value-display[data-target="${control.id}"]`);
                 if (valueDisplay) {
                    try {
                        valueDisplay.textContent = control.value;
                    } catch (error) {
                        debugLogger.error('UIManager', `Error setting textContent for valueDisplay in initStyleControls initial setup: ${error.message}`, error);
                    }
                 }
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

    // --- Cash Change Animation ---
    showCashChangeAnimation(amount) {
        if (!this.cashDisplay || isNaN(parseFloat(amount))) return;

        const animationText = document.createElement('div');
        animationText.className = 'cash-change-animation';
        animationText.textContent = `${amount >= 0 ? '+' : ''}$${Math.abs(amount)}`;

        if (amount >= 0) {
            animationText.classList.add('positive');
        } else {
            animationText.classList.add('negative');
        }

        // Position near cashDisplay. This might need adjustment based on actual HUD layout.
        // For simplicity, append to a common ancestor or game viewport.
        const hudElement = this.cashDisplay.closest('.hud-container') || this.gameScreen || document.body;
        hudElement.appendChild(animationText);

        // Get position of cashDisplay to position the animation relatively
        const cashRect = this.cashDisplay.getBoundingClientRect();
        const hudRect = hudElement.getBoundingClientRect(); // Parent for relative positioning

        // Adjust to position above the cash display and centered
        animationText.style.position = 'absolute'; // Ensure it's absolute to its offsetParent
        animationText.style.left = `${cashRect.left - hudRect.left + (cashRect.width / 2) - (animationText.offsetWidth / 2)}px`;
        animationText.style.top = `${cashRect.top - hudRect.top - 20}px`; // 20px above

        animationText.addEventListener('animationend', () => {
            animationText.remove();
        });
    }


    // --- Contacts App UI Rendering Methods ---
    _renderContactsAppList() {
        console.log("UIMGR: Attempting to render ContactsAppList view");
        console.log("UIMGR: contactsAppScreen container:", this.contactsAppScreen ? "Found" : "NOT FOUND");
        console.log("UIMGR: contactsListContainer container:", this.contactsListContainer ? "Found" : "NOT FOUND");

        if (!this.gameState.contactsManager) {
            debugLogger.error("UIManager", "ContactsManager not found on gameState!");
            const errContainer = this.contactsListContainer || this.contactsAppScreen;
            if(errContainer) errContainer.innerHTML = '<p class="error-message">Error: Contacts unavailable (manager missing).</p>';
            return;
        }

        const unlockedContacts = this.gameState.contactsManager.getUnlockedContacts();
        const targetContainer = this.contactsListContainer || this.contactsAppScreen;

        if (!targetContainer) {
            debugLogger.error("UIManager", "Target container for contacts list not found (_renderContactsAppList).");
            return;
        }
        if (targetContainer === this.contactsAppScreen && this.contactsListContainer) {
            console.warn("UIMGR: contactsListContainer NOT FOUND. Using fallback rendering in contactsAppScreen for Contacts List.");
        }

        targetContainer.innerHTML = '';

        if (unlockedContacts.length === 0) {
            targetContainer.innerHTML = '<p class="empty-message">No contacts unlocked yet. Increase your StreetCred!</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'contacts-list';
        unlockedContacts.forEach(contact => {
            const li = document.createElement('li');
            li.className = 'contact-list-item';
            li.dataset.contactId = contact.id;

            const img = document.createElement('img');
            img.src = contact.avatarUrl || 'https://via.placeholder.com/40/cccccc/000000?text=?';
            img.alt = contact.name;
            img.className = 'contact-avatar-small';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = contact.name;
            nameSpan.className = 'contact-name';

            li.appendChild(img);
            li.appendChild(nameSpan);

            li.addEventListener('click', () => {
                this._renderContactsAppDetail(contact.id);
                this.setPhoneUIState('contactDetail'); // Switch view state
            });
            ul.appendChild(li);
        });
        targetContainer.appendChild(ul);
    }

    _renderContactsAppDetail(contactId) {
        console.log("UIMGR: Attempting to render ContactAppDetail view for contactId:", contactId);
        console.log("UIMGR: contactDetailView container:", this.contactDetailView ? "Found" : "NOT FOUND");

        if (!this.gameState.contactsManager || !this.gameState.loyaltyManager) {
            debugLogger.error("UIManager", "ContactsManager or LoyaltyManager not found on gameState for contact detail!");
            const errContainer = this.contactDetailView || this.contactsAppScreen;
            if(errContainer) errContainer.innerHTML = '<p class="error-message">Error: Contact details unavailable (manager missing).</p>';
            return;
        }

        const contact = this.gameState.contactsManager.getContact(contactId);
        if (!contact) {
            debugLogger.error("UIManager", `Contact with ID ${contactId} not found for detail view.`);
            const errContainer = this.contactDetailView || this.contactsAppScreen;
            if(errContainer) errContainer.innerHTML = '<p class="error-message">Error: Contact not found.</p>';
            return;
        }

        const targetContainer = this.contactDetailView || this.contactsAppScreen;
         if (!targetContainer) {
            debugLogger.error("UIManager", "Target container for contact detail not found (_renderContactsAppDetail).");
            return;
        }
        if (targetContainer === this.contactsAppScreen && this.contactDetailView) {
             console.warn("UIMGR: contactDetailView NOT FOUND. Using fallback rendering in contactsAppScreen for Contact Detail.");
        }
        targetContainer.innerHTML = '';

        this.setPhoneTitle(contact.name);

        // Avatar
        if (this.contactDetailAvatar) { // If dedicated img tag exists
            this.contactDetailAvatar.src = contact.avatarUrl || 'https://via.placeholder.com/80/cccccc/000000?text=?';
            this.contactDetailAvatar.alt = contact.name;
            // If not, create it dynamically
        } else {
            const avatarImg = document.createElement('img');
            avatarImg.src = contact.avatarUrl || 'https://via.placeholder.com/80/cccccc/000000?text=?';
            avatarImg.alt = contact.name;
            avatarImg.className = 'contact-detail-avatar-dynamic'; // Add class for styling
            targetContainer.appendChild(avatarImg);
        }

        // Name
        if (this.contactDetailName) this.contactDetailName.textContent = contact.name;
        else {
            const nameHeader = document.createElement('h3');
            nameHeader.className = 'contact-detail-name-dynamic';
            nameHeader.textContent = contact.name;
            targetContainer.appendChild(nameHeader);
        }

        // Description
        if (this.contactDetailDescription) this.contactDetailDescription.textContent = contact.description;
        else {
            const descP = document.createElement('p');
            descP.className = 'contact-detail-description-dynamic';
            descP.textContent = contact.description;
            targetContainer.appendChild(descP);
        }

        // Loyalty
        const loyaltyLevel = this.gameState.loyaltyManager.getLoyalty(contactId);
        if (this.contactDetailLoyalty) this.contactDetailLoyalty.textContent = `Loyalty: ${loyaltyLevel}/100`;
        else {
            const loyaltyP = document.createElement('p');
            loyaltyP.className = 'contact-detail-loyalty-dynamic';
            loyaltyP.textContent = `Loyalty: ${loyaltyLevel}/100`;
            targetContainer.appendChild(loyaltyP);
        }

        // Services
        const servicesContainer = this.contactDetailServicesList || document.createElement('div');
        if (!this.contactDetailServicesList) {
            servicesContainer.className = 'contact-detail-services-dynamic';
            targetContainer.appendChild(servicesContainer);
        }
        servicesContainer.innerHTML = '<h4>Services:</h4>';
        if (contact.services && contact.services.length > 0) {
            const ul = document.createElement('ul');
            contact.services.forEach(service => {
                const li = document.createElement('li');
                li.textContent = service.name;
                // Add event listener if service is functional in future
                // li.addEventListener('click', () => this.gameState.contactsManager.interactWithService(contactId, service.serviceId));
                ul.appendChild(li);
            });
            servicesContainer.appendChild(ul);
        } else {
            servicesContainer.innerHTML += '<p>No services currently available.</p>';
        }

        // Missions (Placeholder)
        const missionsContainer = this.contactDetailMissionsList || document.createElement('div');
         if (!this.contactDetailMissionsList) {
            missionsContainer.className = 'contact-detail-missions-dynamic';
            targetContainer.appendChild(missionsContainer);
        }
        missionsContainer.innerHTML = '<h4>Missions:</h4><p>[Coming Soon]</p>';

        // Back Button (if not using the global phone back button for this)
        if (this.contactDetailBackButton) { // If specific back button for this view
            this.contactDetailBackButton.onclick = () => this.setPhoneUIState('contactsAppList');
        } else if (targetContainer === this.contactsAppScreen) { // If rendering directly, add a dynamic back button
            const backBtn = document.createElement('button');
            backBtn.textContent = 'Back to List';
            backBtn.className = 'dynamic-back-button';
            backBtn.onclick = () => this.setPhoneUIState('contactsAppList');
            targetContainer.appendChild(backBtn);
        }
        // If using global phone back button, ensure its data-action is set to 'back-to-contacts-list' or similar
        // and handle that in script.js#handlePhoneAppClick
    }

    // --- Map App UI Rendering Methods ---
    _renderMapAppView() {
        console.log("UIMGR: Attempting to render MapAppView");
        console.log("UIMGR: mapAppView container:", this.mapAppView ? "Found" : "NOT FOUND");
        console.log("UIMGR: mapGridContainer container:", this.mapGridContainer ? "Found" : "NOT FOUND");

        if (!this.mapAppView) {
            debugLogger.warn("UIManager", "Map App view container (mapAppView) not found.");
            return;
        }
        if (!this.gameState.mapManager) {
            debugLogger.error("UIManager", "MapManager not found on gameState for map display!");
            this.mapAppView.innerHTML = '<p class="error-message">Error: Map data unavailable (manager missing).</p>';
            return;
        }

        const districts = this.gameState.mapManager.getDiscoveredDistricts();
        this.mapAppView.innerHTML = '';

        if (this.mapGridContainer) {
            this.mapGridContainer.innerHTML = '';
            this.mapGridContainer.style.display = 'grid';
            // Determine grid size (e.g., 2x2 for 4 districts)
            // This is a simplified example; a more robust solution would calculate rows/cols
            const gridSize = Math.ceil(Math.sqrt(districts.length));
            this.mapGridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
            this.mapGridContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

            districts.forEach(district => {
                const districtCell = document.createElement('div');
                districtCell.className = 'map-district-cell';
                districtCell.textContent = district.name;
                districtCell.title = district.description; // Show description on hover
                // Basic styling based on ID or type for differentiation
                districtCell.style.backgroundColor = `#${(district.id.charCodeAt(0) * district.id.length * 333 % 0xFFFFFF).toString(16).padStart(6, '0')}33`; // Semi-random color
                districtCell.style.border = '1px solid #555';
                districtCell.style.padding = '10px';
                districtCell.style.textAlign = 'center';
                districtCell.style.cursor = 'pointer'; // If clickable later

                // Position using gridPosition if available, otherwise just add to grid
                if (district.gridPosition) {
                    districtCell.style.gridColumnStart = district.gridPosition.x + 1;
                    districtCell.style.gridRowStart = district.gridPosition.y + 1;
                }

                districtCell.addEventListener('click', () => {
                    // For Phase 1, maybe just a notification. Detail view can be Phase 2.
                    if (typeof phoneShowNotification === 'function') {
                        phoneShowNotification(`Selected: ${district.name} - ${district.description}`, "Map");
                    }
                });
                this.mapGridContainer.appendChild(districtCell);
            });
            this.mapAppView.appendChild(this.mapGridContainer);

        } else { // Fallback: Render as a list if no grid container
            console.warn("UIMGR: mapGridContainer NOT FOUND. Using fallback list rendering for Map App.");
            const ul = document.createElement('ul');
            ul.className = 'map-district-list';
            if (districts.length === 0) {
                ul.innerHTML = '<li class="empty-message">No districts to display.</li>';
            } else {
                districts.forEach(district => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${district.name}</strong>: ${district.description}`;
                    // Add click listener if districts become interactive
                    // li.addEventListener('click', () => { /* handle district click */ });
                    ul.appendChild(li);
                });
            }
            this.mapAppView.appendChild(ul);
        }
    }

    // --- News App UI Rendering Methods ---
    _renderNewsAppList() {
        console.log("UIMGR: Attempting to render NewsAppList view");
        console.log("UIMGR: newsAppView container:", this.newsAppView ? "Found" : "NOT FOUND");
        console.log("UIMGR: newsListContainer container:", this.newsListContainer ? "Found" : "NOT FOUND");

        const targetContainer = this.newsListContainer || this.newsAppView;
        if (!targetContainer) {
            debugLogger.warn("UIManager", "News App list target container not found (_renderNewsAppList).");
            return;
        }
        if (!this.gameState.newsManager) {
            debugLogger.error("UIManager", "NewsManager not found on gameState for news list!");
            targetContainer.innerHTML = '<p class="error-message">Error: News feed unavailable (manager missing).</p>';
            return;
        }
        if (targetContainer === this.newsAppView && this.newsListContainer){
            console.warn("UIMGR: newsListContainer NOT FOUND. Using fallback rendering in newsAppView for News List.");
        }

        const articles = this.gameState.newsManager.getAllDisplayableArticles();
        targetContainer.innerHTML = '';

        if (articles.length === 0) {
            targetContainer.innerHTML = '<p class="empty-message">No news to report right now.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'news-article-list';
        articles.forEach(article => {
            const li = document.createElement('li');
            li.className = 'news-article-item';
            li.dataset.articleId = article.id;
            li.innerHTML = `
                <h4 class="news-headline">${article.headline}</h4>
                <p class="news-meta">${article.category || 'General'} - ${article.timestamp}</p>
            `;
            li.addEventListener('click', () => {
                this._renderNewsAppArticleDetail(article.id);
                this.setPhoneUIState('newsAppArticleDetail');
            });
            ul.appendChild(li);
        });
        targetContainer.appendChild(ul);
    }

    _renderNewsAppArticleDetail(articleId) {
        console.log("UIMGR: Attempting to render NewsAppArticleDetail view for articleId:", articleId);
        console.log("UIMGR: newsArticleDetailView container:", this.newsArticleDetailView ? "Found" : "NOT FOUND");

        const targetContainer = this.newsArticleDetailView || this.newsAppView;
        if (!targetContainer) {
            debugLogger.warn("UIManager", "News App article detail target container not found (_renderNewsAppArticleDetail).");
            return;
        }
        if (!this.gameState.newsManager) {
            debugLogger.error("UIManager", "NewsManager not found for article detail!");
            targetContainer.innerHTML = '<p class="error-message">Error: Could not load article (manager missing).</p>';
            return;
        }
        if (targetContainer === this.newsAppView && this.newsArticleDetailView){
            console.warn("UIMGR: newsArticleDetailView NOT FOUND. Using fallback rendering in newsAppView for News Article Detail.");
        }

        const article = this.gameState.newsManager.getStaticArticleById(articleId);

        if (!article) {
            debugLogger.error("UIManager", `Article with ID ${articleId} not found for detail view.`);
            targetContainer.innerHTML = '<p class="error-message">Error: Article not found.</p>';
            this.setPhoneTitle("Article Not Found");
            return;
        }

        this.setPhoneTitle(article.category || "News Article");

        if (this.newsArticleHeadline && this.newsArticleBody && this.newsArticleDetailView) {
            this.newsArticleHeadline.textContent = article.headline;
            this.newsArticleBody.textContent = article.body;
            // Back button setup
            if (this.newsArticleBackButton) {
                this.newsArticleBackButton.onclick = () => this.setPhoneUIState('newsAppList');
            }
        } else { // Fallback to populating the main newsAppView
            targetContainer.innerHTML = `
                <button class="dynamic-back-button news-dynamic-back">Back to News List</button>
                <h3 class="news-article-headline-dynamic">${article.headline}</h3>
                <p class="news-article-meta-dynamic">${article.category || 'General'} - ${article.timestamp}</p>
                <div class="news-article-body-dynamic">${article.body.replace(/\n/g, '<br>')}</div>
            `;
            const backBtn = targetContainer.querySelector('.news-dynamic-back');
            if (backBtn) {
                backBtn.onclick = () => this.setPhoneUIState('newsAppList');
            }
        }
    }
}

// Export if using ES modules
export { UIManager };