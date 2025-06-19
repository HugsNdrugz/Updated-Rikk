// UIManager.js
import { debugLogger } from './utils.js';
import { ContactsAppManager } from './classes/ContactsAppManager.js';
import { feedbackMessages } from './data/feedback_messages.js'; // FIXED: Import feedback messages
import { showNotification } from './phone_ambient_ui.js'; // FIXED: Statically import showNotification

class UIManager {
    constructor(game, config) {
        this.game = game;
        this.config = config;

        // Sound elements are also part of the UI experience
        this.doorKnockSound = document.getElementById('door-knock-sound');
        this.cashSound = document.getElementById('cash-sound');
        this.deniedSound = document.getElementById('denied-sound');
        this.chatBubbleSound = document.getElementById('chat-bubble-sound');

        this.initDOMReferences();
        this.initStyleControls();
    }

    initDOMReferences() {
        this.appContainer = document.querySelector(this.config.APP_CONTAINER_SELECTOR || '#game-viewport');

        // Screens
        this.splashScreen = document.getElementById('splash-screen');
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.endScreen = document.getElementById('end-screen');

        // Main Menu & Sub-panels
        this.newGameBtn = document.getElementById('new-game-btn');
        this.continueGameBtn = document.getElementById('continue-game-btn');
        this.settingsMenuBtn = document.getElementById('settings-menu-btn');
        this.mainMenuLights = document.getElementById('main-menu-lights');
        
        this.settingsMenuPanel = document.getElementById('settings-menu-panel');
        this.loadMenuPanel = document.getElementById('load-menu-panel');
        this.creditsMenuPanel = document.getElementById('credits-menu-panel');
        this.allSubmenuBackBtns = document.querySelectorAll('.submenu-back-btn');
        this.settingsControlsContainer = document.querySelector('.settings-controls-container'); // More specific name from review
        this.previewMainSettingsButton = document.getElementById('preview-style-settings');
        this.resetMainSettingsButton = document.getElementById('reset-style-settings');


        // Game HUD
        this.cashDisplay = document.getElementById('cash-display');
        this.dayDisplay = document.getElementById('day-display');
        this.heatDisplay = document.getElementById('heat-display');
        this.credDisplay = document.getElementById('cred-display');
        this.eventTicker = document.getElementById('event-ticker');
        this.inventoryCountDisplay = document.getElementById('inventory-count-display');
        this.nextCustomerBtn = document.getElementById('next-customer-btn');
        this.openInventoryBtn = document.getElementById('open-inventory-btn');

        // Knock Effect
        this.knockEffect = document.getElementById('knock-effect');

        // Inventory Modal
        this.inventoryModal = document.getElementById('inventory-modal');
        this.inventoryDialog = document.getElementById('inventory-dialog');
        this.inventoryList = document.getElementById('inventory-list');
        this.closeModalBtn = document.querySelector('.close-modal-btn');
        this.modalInventorySlotsDisplay = document.getElementById('modal-inventory-slots-display');

        // End Screen
        this.finalDaysDisplay = document.getElementById('final-days-display');
        this.finalCashDisplay = document.getElementById('final-cash-display');
        this.finalCredDisplay = document.getElementById('final-cred-display');
        this.finalVerdictText = document.getElementById('final-verdict-text');
        this.restartGameBtn = document.getElementById('restart-game-btn');

        // Phone UI
        this.rikkPhoneUI = document.getElementById('rikk-phone-ui');
        this.phoneScreenArea = document.getElementById('phone-screen-area');
        this.phoneDockedIndicator = document.getElementById('phone-docked-indicator');
        this.dockPhoneBtn = document.getElementById('dock-phone-btn');
        this.phoneContentContainer = this.rikkPhoneUI ? this.rikkPhoneUI.querySelector('.screen-content') : null;
        this.phoneBackButtons = document.querySelectorAll('.phone-back-button');

        // Chat View
        this.gameChatView = document.getElementById('game-chat-view');
        this.chatContainer = document.getElementById('chat-container-game');
        this.quickReplyContainer = this.gameChatView ? this.gameChatView.querySelector('.quick-reply-container') : null;
        this.chatHeaderAvatar = document.getElementById('chat-header-avatar');
        this.chatHeaderName = document.getElementById('chat-header-contact-name');
        this.chatFooterStatus = document.getElementById('chat-footer-rcs-status');

        // Home Screen & Other Apps
        this.homeScreen = document.getElementById('android-home-screen');
        
        // This is the view for the new ContactsAppManager
        this.contactsAppScreen = document.getElementById('contacts-app-view'); 
        
        // This is the container for the OLD contact system
        this.contactsListContainer = document.getElementById('contacts-list-container'); 
        this.contactDetailView = document.getElementById('contact-detail-view');

        this.mapAppView = document.getElementById('map-app-view');
        this.newsAppView = document.getElementById('news-app-view');
        this.slotGameView = document.getElementById('slot-game-view');
        
        // Phone Theme Settings
        this.phoneThemeSettingsView = document.getElementById('phone-theme-settings-view');
        this.previewPhoneSettingsButton = document.getElementById('preview-phone-style-settings');
        this.resetPhoneSettingsButton = document.getElementById('reset-phone-style-settings');
    }

    // --- Screen Management ---
    showScreen(screenElement) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        if (screenElement) {
            screenElement.classList.add('active');
        } else {
            debugLogger.warn('UIManager', 'showScreen called with null or undefined element.');
        }
    }

    // --- Main Menu ---
    activateMainMenuLights(isActive) {
        if (!this.mainMenuLights) return;
        if (isActive) {
            this.mainMenuLights.classList.add('lights-active');
        } else {
            this.mainMenuLights.classList.remove('lights-active');
        }
    }

    setContinueButtonVisibility(visible) {
        if (!this.continueGameBtn) return;
        if (visible) {
            this.continueGameBtn.classList.remove('hidden');
        } else {
            this.continueGameBtn.classList.add('hidden');
        }
    }
    
    openSubmenuPanel(panelElement) {
        if(panelElement) panelElement.classList.remove('hidden');
    }

    closeSubmenuPanel(panelElement) {
        if(panelElement) panelElement.classList.add('hidden');
    }


    // --- Game HUD & Core UI ---
    updateHUD() {
        if (this.cashDisplay) this.cashDisplay.textContent = this.game.getCash();
        if (this.dayDisplay) this.dayDisplay.textContent = this.game.getDayOfWeek();
        if (this.heatDisplay) this.heatDisplay.textContent = this.game.getHeat();
        if (this.credDisplay) this.credDisplay.textContent = this.game.getStreetCred('global');
        if (this.inventoryCountDisplay) this.inventoryCountDisplay.textContent = `${this.game.getInventory().length}/${this.game.getMaxInventorySlots()}`;
    }
    
    showCashChangeAnimation(amount) {
        if (!this.cashDisplay) return;
    
        const animationElement = document.createElement('span');
        animationElement.textContent = `${amount > 0 ? '+' : ''}${amount}`;
        animationElement.className = `cash-change ${amount > 0 ? 'positive' : 'negative'}`;
        
        // Style the animation element directly in JS for simplicity
        animationElement.style.position = 'absolute';
        animationElement.style.left = '50%';
        animationElement.style.transform = 'translateX(-50%)';
        animationElement.style.pointerEvents = 'none';
        animationElement.style.textShadow = '0 0 5px black';
        animationElement.style.fontWeight = 'bold';
        animationElement.style.color = amount > 0 ? 'var(--color-success)' : 'var(--color-error)';
        
        // Define the animation using JS
        animationElement.animate([
            { top: '50%', opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
            { top: '0%', opacity: 0, transform: 'translate(-50%, -150%) scale(1.2)' }
        ], {
            duration: 1500,
            easing: 'ease-out'
        });
        
        this.cashDisplay.parentElement.appendChild(animationElement);
    
        // Clean up the animation element after it finishes
        setTimeout(() => {
            animationElement.remove();
        }, 1500);
    }

    updateEventTicker() {
        if (!this.eventTicker) return;
        const activeEvents = this.game.getActiveWorldEvents();
        if (activeEvents.length > 0) {
            this.eventTicker.textContent = `Ongoing: ${activeEvents.map(e => `${e.name} (${e.remainingDuration} turns left)`).join(', ')}`;
            this.eventTicker.classList.remove('hidden');
        } else {
            this.eventTicker.textContent = "Word on the street: All quiet... for now.";
            // Optionally hide it if you prefer it gone when no events are active
            // this.eventTicker.classList.add('hidden'); 
        }
    }

    displayKnockEffect() {
        if (!this.knockEffect) return;
        this.knockEffect.classList.remove('hidden');
    }

    hideKnockEffect() {
        if (!this.knockEffect) return;
        this.knockEffect.classList.add('hidden');
    }

    setNextCustomerButtonDisabled(disabled) {
        if (this.nextCustomerBtn) {
            this.nextCustomerBtn.disabled = disabled;
        }
    }

    // --- Phone UI Management ---
    setPhoneUIState(state) {
        if (!this.rikkPhoneUI || !this.phoneDockedIndicator) return;
    
        // Hide all views first
        this.rikkPhoneUI.querySelectorAll('.phone-content-view').forEach(view => view.classList.add('hidden'));
    
        // Handle phone visibility and docked indicator
        if (state === 'docked' || state === 'offscreen') {
            this.rikkPhoneUI.classList.add('is-offscreen');
            if (state === 'docked') {
                this.phoneDockedIndicator.classList.remove('hidden');
            } else {
                this.phoneDockedIndicator.classList.add('hidden');
            }
        } else {
            this.rikkPhoneUI.classList.remove('is-offscreen');
            this.phoneDockedIndicator.classList.add('hidden');
        }
    
        // Show the correct view
        switch (state) {
            case 'home':
                if (this.homeScreen) this.homeScreen.classList.remove('hidden');
                break;
            case 'chatting':
                if (this.gameChatView) this.gameChatView.classList.remove('hidden');
                break;
            case 'contactsAppList':
                if (this.contactsAppScreen) this.contactsAppScreen.classList.remove('hidden');
                // The ContactsAppManager handles its own internal state, just make its container visible
                break;
            case 'mapAppView':
                if (this.mapAppView) {
                    this.mapAppView.classList.remove('hidden');
                    this.renderMap();
                }
                break;
            case 'newsAppList':
                if (this.newsAppView) {
                    this.newsAppView.classList.remove('hidden');
                    this.renderNewsList();
                }
                break;
            case 'newsArticleDetail':
                if (this.newsAppView) this.newsAppView.classList.remove('hidden');
                // The render function for the detail view will handle showing/hiding internal elements
                break;
            case 'slots':
                if (this.slotGameView) this.slotGameView.classList.remove('hidden');
                break;
            case 'theme-settings':
                if (this.phoneThemeSettingsView) this.phoneThemeSettingsView.classList.remove('hidden');
                break;
            case 'docked':
            case 'offscreen':
                // Handled above, no specific view to show
                break;
            default:
                if (this.homeScreen) this.homeScreen.classList.remove('hidden');
                debugLogger.warn('UIManager', `Unknown phone UI state requested: ${state}. Defaulting to home.`);
                break;
        }
    }
    
    updateChatParticipantInfo(contactName = null) {
        if (!this.chatHeaderName || !this.chatHeaderAvatar || !this.chatFooterStatus) return;
    
        if (contactName) {
            const customer = this.game.getCurrentCustomerInstance();
            this.chatHeaderName.textContent = contactName;
            this.chatFooterStatus.textContent = `RCS chat with ${contactName}`;
            if (customer && customer.avatarUrl) {
                this.chatHeaderAvatar.innerHTML = `<img src="${customer.avatarUrl}" alt="${contactName[0]}" style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                this.chatHeaderAvatar.innerHTML = contactName ? contactName[0].toUpperCase() : '?';
            }
        } else {
            // Reset to default/generic state when no one is being chatted with
            this.chatHeaderName.textContent = 'Messages';
            this.chatFooterStatus.textContent = 'Select a conversation';
            this.chatHeaderAvatar.innerHTML = `<i class="fas fa-comment-dots"></i>`; // Or some generic icon
        }
    }


    // --- Chat & Choices ---
    clearChat() {
        if (this.chatContainer) {
            this.chatContainer.innerHTML = '<div class="chat-spacer"></div>';
        }
    }

    displayPhoneMessage(message, speaker) {
        if (!this.chatContainer) return;
        
        const spacer = this.chatContainer.querySelector('.chat-spacer');
        const messageRow = document.createElement('div');
        const bubble = document.createElement('div');
        
        let messageClass = '';
        let avatarUrl = '';
        let speakerName = 'System';
    
        if (speaker === 'rikk') {
            messageClass = 'sent';
            avatarUrl = this.config.rikkAvatarUrl;
            speakerName = 'Rikk';
        } else if (speaker === 'customer') {
            messageClass = 'received';
            const customer = this.game.getCurrentCustomerInstance();
            avatarUrl = customer?.avatarUrl || this.config.customerAvatars.default || '';
            speakerName = customer?.name || 'Customer';
        } else { // narration
            messageClass = 'narration';
            avatarUrl = this.config.systemAvatarUrl;
        }
    
        if (messageClass === 'narration') {
            bubble.className = 'timestamp'; // Use the timestamp style for narration
            bubble.innerHTML = message;
            // Narration doesn't get a row, it's appended directly
            if(spacer) {
                this.chatContainer.insertBefore(bubble, spacer);
            } else {
                this.chatContainer.appendChild(bubble);
            }
        } else {
            messageRow.className = `message-row ${messageClass}`;
            bubble.className = `message-bubble ${messageClass}`;
            bubble.innerHTML = message;
            messageRow.appendChild(bubble);
            if (spacer) {
                this.chatContainer.insertBefore(messageRow, spacer);
            } else {
                this.chatContainer.appendChild(messageRow);
            }
        }
        
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    clearChoices() {
        if (this.quickReplyContainer) {
            this.quickReplyContainer.innerHTML = '';
        }
    }

    displayChoices(choices, callback) {
        if (!this.quickReplyContainer) return;
        this.clearChoices();
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'quick-reply-button';
            button.innerHTML = choice.text;
            button.disabled = choice.disabled || false;
            button.addEventListener('click', () => callback(choice.outcome));
            this.quickReplyContainer.appendChild(button);
        });
    }


    // --- Inventory Modal ---
    openInventoryModal() {
        if (!this.inventoryModal) return;
        this.updateInventoryDisplay();
        this.inventoryModal.classList.add('active');
        this.inventoryModal.setAttribute('aria-hidden', 'false');
    }

    closeInventoryModal() {
        if (!this.inventoryModal) return;
        this.inventoryModal.classList.remove('active');
        this.inventoryModal.setAttribute('aria-hidden', 'true');
    }

    updateInventoryDisplay() {
        if (!this.inventoryList || !this.modalInventorySlotsDisplay) return;
        
        const inventory = this.game.getInventory();
        const maxSlots = this.game.getMaxInventorySlots();
        
        this.inventoryList.innerHTML = '';
        if (inventory.length === 0) {
            this.inventoryList.innerHTML = '<p class="empty-inventory">Your stash is empty.</p>';
        } else {
            inventory.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'inventory-item';
                itemDiv.innerHTML = `
                    <div class="item-icon ${item.itemTypeObj.type.toLowerCase()}"></div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-quality">${item.quality}</div>
                    <div class="item-value">$${item.purchasePrice}</div>
                    <div class="item-description">${item.itemTypeObj.description}</div>
                `;
                this.inventoryList.appendChild(itemDiv);
            });
        }
        this.modalInventorySlotsDisplay.textContent = `${inventory.length}/${maxSlots}`;
    }

    // --- Phone App Rendering ---
    renderMap() {
        if (!this.game.mapManager) {
            debugLogger.error('UIManager', 'MapManager not available on game object.');
            return;
        }
        const discoveredDistricts = this.game.mapManager.getDiscoveredDistricts();
        const mapGrid = document.getElementById('map-grid-container');
        if (!mapGrid) {
            debugLogger.error('UIManager', 'map-grid-container element not found.');
            return;
        }
        mapGrid.innerHTML = ''; // Clear previous render

        // Simple grid for now, assumes 2x2
        mapGrid.style.gridTemplateColumns = '1fr 1fr';
        mapGrid.style.gridTemplateRows = '1fr 1fr';
        
        // This relies on the order of districts in map_data.js matching a 2x2 grid.
        // A more robust solution would use gridPosition from data.
        discoveredDistricts.forEach(district => {
            const cell = document.createElement('div');
            cell.className = 'map-district-cell';
            cell.textContent = district.name;
            // TODO: Add click handlers or more info display
            mapGrid.appendChild(cell);

        });
    }

    renderNewsList() {
        if (!this.game.newsManager) return;
        const articles = this.game.newsManager.getAllDisplayableArticles();
        const newsListContainer = document.getElementById('news-list-container');
        if (!newsListContainer) return;
    
        // Show list, hide detail
        newsListContainer.innerHTML = '';
        const detailView = document.getElementById('news-article-detail-view');
        if(detailView) detailView.classList.add('hidden');
        newsListContainer.classList.remove('hidden');
    
        if (articles.length === 0) {
            newsListContainer.innerHTML = '<p class="empty-message">No news to report.</p>';
            return;
        }
    
        const list = document.createElement('ul');
        list.className = 'news-article-list';
        articles.forEach(article => {
            const item = document.createElement('li');
            item.className = 'news-article-item';
            item.innerHTML = `
                <h4 class="news-headline">${article.headline}</h4>
                <p class="news-meta">${article.category} - ${article.timestamp}</p>
            `;
            item.addEventListener('click', () => this.renderNewsDetail(article.id));
            list.appendChild(item);
        });
        newsListContainer.appendChild(list);
    }
    
    renderNewsDetail(articleId) {
        if (!this.game.newsManager) return;
        const article = this.game.newsManager.getStaticArticleById(articleId); // Assuming static for now
        if (!article) return;
    
        const newsListContainer = document.getElementById('news-list-container');
        const detailView = document.getElementById('news-article-detail-view');
        const headlineEl = document.getElementById('news-article-headline');
        const metaEl = document.getElementById('news-article-meta');
        const bodyEl = document.getElementById('news-article-body');
    
        if (!detailView || !headlineEl || !metaEl || !bodyEl) {
            debugLogger.error('UIManager', 'One or more news detail elements are missing from the DOM.');
            return;
        }
    
        // Hide list, show detail
        if (newsListContainer) newsListContainer.classList.add('hidden');
        detailView.classList.remove('hidden');
    
        headlineEl.textContent = article.headline;
        metaEl.textContent = `${article.category} - ${article.timestamp}`;
        bodyEl.textContent = article.body;
    
        // Assuming a back button with data-action="back-to-home" or similar is present
        // Or one could be dynamically added. For now, rely on generic phone back button.
    }


    // --- Audio ---
    playSound(soundElement) {
        if (soundElement && soundElement.play) {
            soundElement.currentTime = 0;
            soundElement.play().catch(error => debugLogger.warn('Audio', `Playback prevented for ${soundElement.id}`, error));
        }
    }
    
    // --- Style & Theme Management ---
    initStyleControls(saveCallback) {
        const styleControls = this.appContainer.querySelectorAll('input[data-variable], select[data-variable]');
        
        styleControls.forEach(control => {
            const variable = control.dataset.variable;
            const eventType = (control.type === 'range' || control.type === 'color') ? 'input' : 'change';

            control.addEventListener(eventType, () => {
                let value = control.value;
                const display = this.appContainer.querySelector(`span[data-target="${control.id}"]`);

                if (control.type === 'range') {
                    value += 'px'; // Append units for radius/spacing
                    if (display) display.textContent = value;
                }
                
                this.appContainer.style.setProperty(variable, value);
            });
        });
    }
    
    loadAndApplyStyleSettings() {
        const settings = this.getStoredStyleSettings();
        this.applyStyleSettings(settings);

        // Also update the control values to reflect the loaded settings
        const styleControls = this.appContainer.querySelectorAll('input[data-variable], select[data-variable]');
        styleControls.forEach(control => {
            const variableName = control.dataset.variable;
            if (settings[variableName]) {
                let value = settings[variableName];
                // Remove 'px' for range sliders
                if (control.type === 'range') {
                    value = value.replace('px', '');
                }
                control.value = value;
                // Update display span for sliders
                if (control.type === 'range') {
                    const display = this.appContainer.querySelector(`span[data-target="${control.id}"]`);
                    if (display) display.textContent = `${value}px`;
                }
            }
        });
    }

    getStoredStyleSettings() {
        try {
            const savedSettings = localStorage.getItem(this.config.styleSettingsKey);
            return savedSettings ? JSON.parse(savedSettings) : { ...this.config.defaultStyleSettings };
        } catch (error) {
            debugLogger.error('UIManager', 'Failed to parse stored style settings. Using defaults.', error);
            return { ...this.config.defaultStyleSettings };
        }
    }

    applyStyleSettings(settings) {
        for (const [variable, value] of Object.entries(settings)) {
            let finalValue = value;
            if (variable.includes('radius') || variable.includes('spacing-unit')) {
                 if (!isNaN(parseFloat(value)) && !value.endsWith('px')) {
                    finalValue = `${value}px`;
                }
            }
            this.appContainer.style.setProperty(variable, finalValue);
        }
    }

    saveStyleSettingsToStorage() {
        const settings = {};
        const styleControls = this.appContainer.querySelectorAll('input[data-variable], select[data-variable]');
        styleControls.forEach(control => {
            settings[control.dataset.variable] = control.value;
        });
        
        try {
            localStorage.setItem(this.config.styleSettingsKey, JSON.stringify(settings));
            debugLogger.log('UIManager', 'Style settings saved successfully.');
        } catch (error) {
            debugLogger.error('UIManager', 'Failed to save style settings to localStorage.', error);
        }
    }

    resetToDefaultStyles(saveCallback) {
        this.applyStyleSettings(this.config.defaultStyleSettings);
        if (saveCallback) saveCallback();
        // After applying, we also need to reset the input controls themselves
        this.loadAndApplyStyleSettings(); // This re-syncs the input controls
    }

    togglePreview(saveCallback) {
        this.appContainer.classList.toggle('preview-mode');
        const isPreviewing = this.appContainer.classList.contains('preview-mode');
        
        // Disable all settings controls during preview
        this.appContainer.querySelectorAll('.settings-group input, .settings-group select').forEach(el => {
            el.disabled = isPreviewing;
        });

        if (!isPreviewing) { // When exiting preview mode
            if (confirm("Do you want to save these changes?")) {
                if(saveCallback) saveCallback();
            } else {
                // Revert to last saved settings
                this.loadAndApplyStyleSettings(); 
            }
        }
    }

    displayEtiquetteFeedback(feedbackId, type) {
        const message = feedbackMessages[feedbackId] || "Your actions have been noted on the street.";
        showNotification(message, "Street Murmurs", type);
    }
}

export { UIManager };