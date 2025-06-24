// UIManager.js
import { debugLogger } from './utils.js';
import { ContactsAppManager } from './classes/ContactsAppManager.js'; // Note: This import seems unused in the provided UIManager code.
import { feedbackMessages } from './data/feedback_messages.js';
import { showNotification } from './phone_ambient_ui.js';

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
        this.initStyleControls(); // Assuming this should be called after DOM refs
    }

    initDOMReferences() {
        this.appContainer = document.querySelector(this.config.APP_CONTAINER_SELECTOR || '#game-viewport');

        // Screens
        this.splashScreen = document.getElementById('splash-screen');
        if (this.game.DEBUG_MODE) console.log("[Debug UIManager] Initializing this.splashScreen:", this.splashScreen);
        this.startScreen = document.getElementById('start-screen');
        if (this.game.DEBUG_MODE) console.log("[Debug UIManager] Initializing this.startScreen:", this.startScreen);
        this.gameScreen = document.getElementById('game-screen');
        if (this.game.DEBUG_MODE) console.log("[Debug UIManager] Initializing this.gameScreen:", this.gameScreen);
        this.endScreen = document.getElementById('end-screen');
        if (this.game.DEBUG_MODE) console.log("[Debug UIManager] Initializing this.endScreen:", this.endScreen);

        // Main Menu & Sub-panels
        this.newGameBtn = document.getElementById('new-game-btn');
        this.continueGameBtn = document.getElementById('continue-game-btn');
        this.settingsMenuBtn = document.getElementById('settings-menu-btn');
        this.mainMenuLights = document.getElementById('main-menu-lights'); // Corrected from mainMenuLightContainer

        this.settingsMenuPanel = document.getElementById('settings-menu-panel');
        this.loadMenuPanel = document.getElementById('load-menu-panel'); // Assuming this exists or will be added
        this.creditsMenuPanel = document.getElementById('credits-menu-panel'); // Assuming this exists
        this.allSubmenuBackBtns = document.querySelectorAll('.submenu-back-btn');
        this.settingsControlsContainer = document.querySelector('.settings-controls-container');
        this.previewMainSettingsButton = document.getElementById('preview-style-settings');
        this.resetMainSettingsButton = document.getElementById('reset-style-settings');

        // Game HUD
        this.cashDisplay = document.getElementById('cash-display');
        this.dayDisplay = document.getElementById('day-display'); // Represents game.dayOfWeek in new UIManager
        this.heatDisplay = document.getElementById('heat-display');
        this.credDisplay = document.getElementById('cred-display');
        this.eventTicker = document.getElementById('event-ticker');
        if (!this.eventTicker) debugLogger.error("UIManager: #event-ticker not found.");
        this.inventoryCountDisplay = document.getElementById('inventory-count-display');
        if (!this.inventoryCountDisplay) debugLogger.error("UIManager: #inventory-count-display not found.");
        this.nextCustomerBtn = document.getElementById('next-customer-btn');
        if (!this.nextCustomerBtn) debugLogger.error("UIManager: #next-customer-btn not found.");
        this.openInventoryBtn = document.getElementById('open-inventory-btn');
        if (!this.openInventoryBtn) debugLogger.error("UIManager: #open-inventory-btn not found.");

        // Knock Effect
        this.knockEffect = document.getElementById('knock-effect');
        if (!this.knockEffect) debugLogger.warn("UIManager: #knock-effect not found (optional).");

        // Inventory Modal
        this.inventoryModal = document.getElementById('inventory-modal');
        if (!this.inventoryModal) debugLogger.error("UIManager: #inventory-modal not found.");
        this.inventoryDialog = document.getElementById('inventory-dialog');
        if (!this.inventoryDialog) debugLogger.error("UIManager: #inventory-dialog not found.");
        this.inventoryList = document.getElementById('inventory-list');
        if (!this.inventoryList) debugLogger.error("UIManager: #inventory-list not found.");
        this.closeModalBtn = document.querySelector('#inventory-modal .close-modal-btn');
        if (!this.closeModalBtn) debugLogger.error("UIManager: #inventory-modal .close-modal-btn not found.");
        this.modalInventorySlotsDisplay = document.getElementById('modal-inventory-slots-display');
        if (!this.modalInventorySlotsDisplay) debugLogger.error("UIManager: #modal-inventory-slots-display not found.");

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
        // this.phoneContentContainer = this.rikkPhoneUI ? this.rikkPhoneUI.querySelector('.screen-content') : null; // Unused and potentially incorrect selector
        this.phoneBackButtons = document.querySelectorAll('.phone-back-button');

        // Chat View
        this.gameChatView = document.getElementById('game-chat-view');
        if (!this.gameChatView) debugLogger.error("UIManager: #game-chat-view not found.");
        this.chatContainer = document.getElementById('chat-container-game');
        if (!this.chatContainer) debugLogger.error("UIManager: #chat-container-game not found.");
        this.quickReplyContainer = this.gameChatView ? this.gameChatView.querySelector('.quick-reply-container') : null;
        if (!this.quickReplyContainer && this.gameChatView) debugLogger.warn("UIManager: .quick-reply-container not found in #game-chat-view.");
        this.chatHeaderAvatar = document.getElementById('chat-header-avatar');
        if (!this.chatHeaderAvatar) debugLogger.error("UIManager: #chat-header-avatar not found.");
        this.chatHeaderName = document.getElementById('chat-header-contact-name');
        if (!this.chatHeaderName) debugLogger.error("UIManager: #chat-header-contact-name not found.");
        this.chatFooterStatus = document.getElementById('chat-footer-rcs-status');
        if (!this.chatFooterStatus) debugLogger.error("UIManager: #chat-footer-rcs-status not found.");

        // Home Screen & Other Apps
        this.homeScreen = document.getElementById('android-home-screen');
        if (!this.homeScreen) debugLogger.error("UIManager: #android-home-screen not found.");
        this.contactsAppScreen = document.getElementById('contacts-app-view');
        if (!this.contactsAppScreen) debugLogger.error("UIManager: #contacts-app-view not found.");
        this.contactsListContainer = document.getElementById('contacts-list-container');
        if (!this.contactsListContainer) debugLogger.warn("UIManager: #contacts-list-container not found (optional, for ContactsAppManager).");
        this.contactDetailView = document.getElementById('contact-detail-view');
        if (!this.contactDetailView) debugLogger.warn("UIManager: #contact-detail-view not found (optional, for ContactsAppManager).");
        this.mapAppView = document.getElementById('map-app-view');
        if (!this.mapAppView) debugLogger.warn("UIManager: #map-app-view not found (optional).");
        this.newsAppView = document.getElementById('news-app-view');
        if (!this.newsAppView) debugLogger.warn("UIManager: #news-app-view not found (optional).");
        this.slotGameView = document.getElementById('slot-game-view');
        if (!this.slotGameView) debugLogger.warn("UIManager: #slot-game-view not found (optional).");

        // Phone Theme Settings
        this.phoneThemeSettingsView = document.getElementById('phone-theme-settings-view');
        if (!this.phoneThemeSettingsView) debugLogger.warn("UIManager: #phone-theme-settings-view not found (optional).");
        this.previewPhoneSettingsButton = document.getElementById('preview-phone-style-settings');
        if (!this.previewPhoneSettingsButton) debugLogger.warn("UIManager: #preview-phone-style-settings button not found (optional).");
        this.resetPhoneSettingsButton = document.getElementById('reset-phone-style-settings');
        if (!this.resetPhoneSettingsButton) debugLogger.warn("UIManager: #reset-phone-style-settings button not found (optional).");

        // Phone Dock & Home Indicator (for hiding in app views)
        if (this.rikkPhoneUI) {
            this.phoneDock = this.rikkPhoneUI.querySelector('.dock');
            if (!this.phoneDock) debugLogger.warn("UIManager: .dock (phone dock) not found in #rikk-phone-ui.");
            this.phoneHomeIndicator = this.rikkPhoneUI.querySelector('.home-indicator');
            if (!this.phoneHomeIndicator) debugLogger.warn("UIManager: .home-indicator (phone home indicator) not found in #rikk-phone-ui.");
        } else {
            debugLogger.error("UIManager: #rikk-phone-ui not found, cannot query for dock and home indicator.");
            this.phoneDock = null;
            this.phoneHomeIndicator = null;
        }

        // Collapsible header elements for News App
        if (this.newsAppView) {
            this.newsAppHeader = this.newsAppView.querySelector('.collapsible-header');
            this.newsAppInteractionArea = this.newsAppView.querySelector('.interaction-area');
            if (this.newsAppHeader && this.newsAppInteractionArea) {
                this.newsAppInteractionArea.addEventListener('scroll', () => {
                    if (this.newsAppInteractionArea.scrollTop > 50) {
                        this.newsAppHeader.classList.add('scrolled');
                    } else {
                        this.newsAppHeader.classList.remove('scrolled');
                    }
                });
            } else {
                debugLogger.warn("UIManager: Collapsible header elements for News App not fully found.");
            }
        }
    }

    // --- Screen Management ---
    showScreen(screenElement) {
        if (this.game.DEBUG_MODE) {
            console.log("[Debug UIManager] showScreen called with screenElement:", screenElement);
        }
        const allScreens = document.querySelectorAll('.screen');
        if (this.game.DEBUG_MODE) {
            console.log("[Debug UIManager] All elements with .screen class:", allScreens);
        }
        allScreens.forEach(s => {
            if (this.game.DEBUG_MODE) console.log(`[Debug UIManager] Removing 'active' from:`, s);
            s.classList.remove('active');
        });
        if (screenElement) {
            if (this.game.DEBUG_MODE) console.log(`[Debug UIManager] Adding 'active' to:`, screenElement);
            screenElement.classList.add('active');
        } else {
            debugLogger.warn('UIManager', 'showScreen called with null or undefined element.');
            if (this.game.DEBUG_MODE) console.warn("[Debug UIManager] showScreen: screenElement is null or undefined. No screen will be activated.");
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
        if (this.dayDisplay) this.dayDisplay.textContent = this.game.getDayOfWeek(); // Changed from getFiendsLeft
        if (this.heatDisplay) this.heatDisplay.textContent = this.game.getHeat();
        if (this.credDisplay) this.credDisplay.textContent = this.game.getStreetCred('global');
        if (this.inventoryCountDisplay) this.inventoryCountDisplay.textContent = `${this.game.getInventory().length}/${this.game.getMaxInventorySlots()}`;
    }

    showCashChangeAnimation(amount) {
        if (!this.cashDisplay) return;

        const animationElement = document.createElement('span');
        animationElement.textContent = `${amount > 0 ? '+' : ''}${amount}`;
        animationElement.className = `cash-change ${amount > 0 ? 'positive' : 'negative'}`;
        animationElement.style.position = 'absolute';
        animationElement.style.left = '50%';
        animationElement.style.transform = 'translateX(-50%)';
        animationElement.style.pointerEvents = 'none';
        animationElement.style.textShadow = '0 0 5px black';
        animationElement.style.fontWeight = 'bold';
        animationElement.style.color = amount > 0 ? 'var(--color-success-green)' : 'var(--color-error)'; // Ensure these CSS vars exist

        animationElement.animate([
            { top: '50%', opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
            { top: '0%', opacity: 0, transform: 'translate(-50%, -150%) scale(1.2)' }
        ], {
            duration: 1500,
            easing: 'ease-out'
        });

        this.cashDisplay.parentElement.appendChild(animationElement);
        setTimeout(() => {
            animationElement.remove();
        }, 1500);
    }

    updateEventTicker() {
        if (!this.eventTicker) return;
        const activeEvents = this.game.getActiveWorldEvents();
        if (activeEvents.length > 0) {
            this.eventTicker.textContent = `Ongoing: ${activeEvents.map(e => `${e.name} (${e.remainingDuration || e.turnsLeft} turns left)`).join(', ')}`; // Adjusted for remainingDuration
            this.eventTicker.classList.remove('hidden');
        } else {
            this.eventTicker.textContent = "Word on the street: All quiet... for now.";
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
        this.rikkPhoneUI.querySelectorAll('.phone-content-view').forEach(view => view.classList.add('hidden'));

        // Handle overall phone visibility (offscreen/docked)
        if (state === 'docked' || state === 'offscreen') {
            this.rikkPhoneUI.classList.add('is-offscreen');
            if (this.phoneDock) this.phoneDock.classList.add('hidden'); // Hide dock if phone is offscreen/docked
            if (this.phoneHomeIndicator) this.phoneHomeIndicator.classList.add('hidden'); // Hide home indicator too

            if (state === 'docked') {
                if (this.phoneDockedIndicator) this.phoneDockedIndicator.classList.remove('hidden');
            } else {
                if (this.phoneDockedIndicator) this.phoneDockedIndicator.classList.add('hidden');
            }
        } else {
            this.rikkPhoneUI.classList.remove('is-offscreen');
            if (this.phoneDockedIndicator) this.phoneDockedIndicator.classList.add('hidden');
            // Dock and home indicator visibility will be handled by specific app states below
        }

        // Handle visibility of specific views and the dock/home indicator
        let showDockAndIndicator = false;

        switch (state) {
            case 'home':
                if (this.homeScreen) this.homeScreen.classList.remove('hidden');
                showDockAndIndicator = true;
                break;
            case 'chatting':
                if (this.gameChatView) this.gameChatView.classList.remove('hidden');
                // Dock hidden for chat
                if (this.dockPhoneBtn) this.dockPhoneBtn.classList.add('hidden');
                break;
            case 'contactsAppList':
                if (this.contactsAppScreen) this.contactsAppScreen.classList.remove('hidden');
                // Dock hidden for contacts app
                break;
            case 'playerContactsList': // New case for player-facing contacts
                if (this.contactsAppScreen) {
                    this.contactsAppScreen.classList.remove('hidden');
                    this.renderPlayerContactsList(); // New method to render actual contacts
                }
                // Dock typically hidden for full-screen app views
                break;
            case 'mapAppView':
                if (this.mapAppView) {
                    this.mapAppView.classList.remove('hidden');
                    this.renderMap();
                }
                // Dock hidden for map app
                break;
            case 'newsAppList':
                if (this.newsAppView) {
                    this.newsAppView.classList.remove('hidden');
                    this.renderNewsList();
                }
                // Dock hidden for news app
                break;
            case 'newsArticleDetail': // Assuming news detail is also full screen
                if (this.newsAppView) this.newsAppView.classList.remove('hidden'); // The parent container for news
                // Need to ensure the specific detail view within newsAppView is shown by newsManager/UIManager logic
                // Dock hidden for news article detail
                break;
            case 'slots':
                if (this.slotGameView) this.slotGameView.classList.remove('hidden');
                // Dock hidden for slot game
                break;
            case 'theme-settings': // This is a phone app view
                if (this.phoneThemeSettingsView) this.phoneThemeSettingsView.classList.remove('hidden');
                // Dock hidden for theme settings app
                break;
            case 'docked':
            case 'offscreen':
                // Dock and indicator are already handled (hidden)
                break;
            default:
                if (this.homeScreen) this.homeScreen.classList.remove('hidden');
                showDockAndIndicator = true; // Default to showing dock if state is unknown but phone is on-screen
                debugLogger.warn('UIManager', `Unknown phone UI state requested: ${state}. Defaulting to home screen.`);
                break;
        }

        // Apply dock and home indicator visibility unless phone is offscreen
        if (!this.rikkPhoneUI.classList.contains('is-offscreen')) {
            if (this.phoneDock) {
                if (showDockAndIndicator) this.phoneDock.classList.remove('hidden');
                else this.phoneDock.classList.add('hidden');
            }
            if (this.phoneHomeIndicator) {
                if (showDockAndIndicator) this.phoneHomeIndicator.classList.remove('hidden');
                else this.phoneHomeIndicator.classList.add('hidden');
            }
        }

        // Manage #dock-phone-btn visibility separately
        // It should be hidden if phone is offscreen/docked, or if in specific states like 'chatting'.
        // Otherwise, for on-screen app views (including home), it should be visible.
        if (this.dockPhoneBtn) {
            if (state === 'chatting' || this.rikkPhoneUI.classList.contains('is-offscreen')) {
                this.dockPhoneBtn.classList.add('hidden');
            } else {
                this.dockPhoneBtn.classList.remove('hidden');
            }
        }
    }

    updateChatParticipantInfo(contactName = null) {
        if (!this.chatHeaderName || !this.chatHeaderAvatar || !this.chatFooterStatus) return;

        if (contactName) {
            const customer = this.game.getCurrentCustomerInstance(); // Assuming game has this method
            this.chatHeaderName.textContent = contactName;
            this.chatFooterStatus.textContent = `RCS chat with ${contactName}`;
            if (customer && customer.avatarUrl) { // Assuming customer instance has avatarUrl
                this.chatHeaderAvatar.innerHTML = `<img src="${customer.avatarUrl}" alt="${contactName[0]}" style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                this.chatHeaderAvatar.innerHTML = contactName ? contactName[0].toUpperCase() : '?';
            }
        } else {
            // Default/empty state
            this.chatHeaderName.textContent = 'Messages';
            this.chatFooterStatus.textContent = 'Select a conversation';
            this.chatHeaderAvatar.innerHTML = `<i class="fas fa-comment-dots"></i>`;
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

        if (speaker === 'rikk') messageClass = 'sent';
        else if (speaker === 'customer') messageClass = 'received';
        else messageClass = 'narration';

        if (messageClass === 'narration') {
            bubble.className = 'timestamp';
            let formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<i>$1</i>');
            bubble.innerHTML = formattedMessage;
            if(spacer) this.chatContainer.insertBefore(bubble, spacer);
            else this.chatContainer.appendChild(bubble);
        } else {
            messageRow.className = `message-row ${messageClass}`;
            bubble.className = `message-bubble ${messageClass}`;
            let formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<i>$1</i>');
            bubble.innerHTML = formattedMessage;
            messageRow.appendChild(bubble);
            if (spacer) this.chatContainer.insertBefore(messageRow, spacer);
            else this.chatContainer.appendChild(messageRow);
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
            button.innerHTML = choice.text; // Assuming text, not innerHTML for security if from dynamic source
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
        if (!this.inventoryList || !this.modalInventorySlotsDisplay) {
            debugLogger.error("UIManager: Inventory list or slots display element not found in updateInventoryDisplay.");
            return;
        }
        const inventory = this.game.getInventory();
        const maxSlots = this.game.getMaxInventorySlots();
        this.inventoryList.innerHTML = ''; // Clear previous items

        if (inventory.length === 0) {
            this.inventoryList.innerHTML = '<p class="empty-inventory">Your stash is empty.</p>';
        } else {
            inventory.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'inventory-item';

                const itemTypeDesc = item.itemTypeObj && item.itemTypeObj.description ? item.itemTypeObj.description : 'No description available.';
                const itemIconClass = item.itemTypeObj && item.itemTypeObj.type ? item.itemTypeObj.type.toLowerCase() : 'unknown';
                // Default purchasePrice to 'N/A' if not present, though it should always be there for inventory items
                const displayPrice = typeof item.purchasePrice === 'number' ? item.purchasePrice : 'N/A';

                itemDiv.innerHTML = `
                    <div class="item-icon ${itemIconClass}"></div>
                    <div class="item-name">${item.name || 'Unknown Item'}</div>
                    <div class="item-quality">${item.quality || 'Standard'}</div>
                    <div class="item-value">$${displayPrice}</div>
                    <div class="item-description">${itemTypeDesc}</div>
                `;
                this.inventoryList.appendChild(itemDiv);
            });
        }
        this.modalInventorySlotsDisplay.textContent = `${inventory.length}/${maxSlots}`;
    }

    // --- Phone App Rendering ---
    renderMap() {
        if (!this.game.mapManager) { // Assuming game has mapManager
            debugLogger.error('UIManager', 'MapManager not available on game object.');
            return;
        }
        const discoveredDistricts = this.game.mapManager.getDiscoveredDistricts();
        const mapGrid = document.getElementById('map-grid-container'); // Assuming this ID exists in mapAppView
        if (!mapGrid) {
            debugLogger.error('UIManager', 'map-grid-container element not found.');
            return;
        }
        mapGrid.innerHTML = '';
        mapGrid.style.gridTemplateColumns = '1fr 1fr';
        mapGrid.style.gridTemplateRows = '1fr 1fr';
        discoveredDistricts.forEach(district => {
            const cell = document.createElement('div');
            cell.className = 'map-district-cell';
            cell.textContent = district.name;
            mapGrid.appendChild(cell);
        });
    }

    renderNewsList() {
        if (!this.game.newsManager) return; // Assuming game has newsManager
        const articles = this.game.newsManager.getAllDisplayableArticles();
        const newsListContainer = document.getElementById('news-list-container'); // Assuming this ID exists
        if (!newsListContainer) return;

        const detailView = document.getElementById('news-article-detail-view');
        if(detailView) detailView.classList.add('hidden');
        newsListContainer.classList.remove('hidden');
        newsListContainer.innerHTML = '';

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
        const article = this.game.newsManager.getStaticArticleById(articleId);
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
        if (newsListContainer) newsListContainer.classList.add('hidden');
        detailView.classList.remove('hidden');
        headlineEl.textContent = article.headline;
        metaEl.textContent = `${article.category} - ${article.timestamp}`;
        bodyEl.textContent = article.body;
    }

    renderPlayerContactsList() {
        if (!this.contactsListContainer || !this.game.contactsManager) {
            debugLogger.error("UIManager: Contacts list container or ContactsManager not available.");
            return;
        }

        // Ensure list is visible and detail is hidden
        this.contactsListContainer.classList.remove('hidden');
        if (this.contactDetailView) this.contactDetailView.classList.add('hidden');

        this.contactsListContainer.innerHTML = ''; // Clear previous list
        const contacts = this.game.contactsManager.getUnlockedContacts();

        if (contacts.length === 0) {
            this.contactsListContainer.innerHTML = '<p class="empty-message">No contacts unlocked yet.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'player-contact-list'; // Add a class for specific styling if needed

        contacts.forEach(contact => {
            const li = document.createElement('li');
            li.className = 'customer-card'; // Reuse existing styling for list items
            li.dataset.contactId = contact.id;

            // Avatar
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'customer-card-avatar';
            if (contact.avatarUrl) {
                const img = document.createElement('img');
                img.src = contact.avatarUrl;
                img.alt = contact.name;
                avatarDiv.appendChild(img);
            } else {
                avatarDiv.textContent = contact.name ? contact.name[0].toUpperCase() : '?';
            }
            li.appendChild(avatarDiv);

            // Info
            const infoDiv = document.createElement('div');
            infoDiv.className = 'customer-card-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'customer-card-name';
            nameDiv.textContent = contact.name;
            infoDiv.appendChild(nameDiv);

            const keyDiv = document.createElement('div'); // For a subtitle, e.g., their role or a snippet
            keyDiv.className = 'customer-card-key';
            keyDiv.textContent = contact.shortDescription || "Mysterious Figure"; // Fallback
            infoDiv.appendChild(keyDiv);

            li.appendChild(infoDiv);

            li.addEventListener('click', () => this.renderPlayerContactDetail(contact.id));
            ul.appendChild(li);
        });
        this.contactsListContainer.appendChild(ul);
    }

    renderPlayerContactDetail(contactId) {
        if (!this.contactDetailView || !this.game.contactsManager) {
            debugLogger.error("UIManager: Contact detail view or ContactsManager not available.");
            return;
        }
        const contact = this.game.contactsManager.getContactById(contactId);
        if (!contact) {
            debugLogger.error(`UIManager: Contact with ID ${contactId} not found.`);
            this.renderPlayerContactsList(); // Go back to list if contact not found
            return;
        }

        // Hide list, show detail
        if (this.contactsListContainer) this.contactsListContainer.classList.add('hidden');
        this.contactDetailView.classList.remove('hidden');
        this.contactDetailView.innerHTML = ''; // Clear previous details

        // Back button (could be part of the static HTML for contact-detail-view and just handled by existing phone-back-button logic)
        // For now, we'll assume a global back button or one within the contacts-app-view's header can take user back to list.
        // Alternatively, add one dynamically:
        // const backButton = document.createElement('button');
        // backButton.className = 'btn btn-neutral phone-back-button'; // Re-use existing styles
        // backButton.textContent = 'Back to List';
        // backButton.addEventListener('click', () => this.renderPlayerContactsList());
        // this.contactDetailView.appendChild(backButton);


        // Avatar
        const avatarImg = document.createElement('img');
        avatarImg.id = 'contact-detail-avatar'; // Corresponds to existing CSS
        avatarImg.className = 'contact-avatar-large'; // Corresponds to existing CSS
        avatarImg.src = contact.avatarUrl || 'assets/images/default-avatar.png'; // Provide a default
        avatarImg.alt = contact.name;
        this.contactDetailView.appendChild(avatarImg);

        // Name
        const nameH3 = document.createElement('h3');
        nameH3.id = 'contact-detail-name'; // Corresponds to existing CSS
        nameH3.textContent = contact.name;
        this.contactDetailView.appendChild(nameH3);

        // Description
        const descriptionP = document.createElement('p');
        descriptionP.id = 'contact-detail-description'; // Corresponds to existing CSS
        descriptionP.textContent = contact.description;
        this.contactDetailView.appendChild(descriptionP);

        // Loyalty
        const loyaltyP = document.createElement('p');
        loyaltyP.id = 'contact-detail-loyalty';
        const loyaltyData = this.game.loyaltyManager.getLoyalty(contact.id);
        loyaltyP.textContent = `Loyalty: ${loyaltyData.levelName} (${loyaltyData.points})`;
        this.contactDetailView.appendChild(loyaltyP);

        // Services
        if (contact.services && contact.services.length > 0) {
            const servicesHeader = document.createElement('h4');
            servicesHeader.textContent = 'Services:';
            this.contactDetailView.appendChild(servicesHeader);
            const servicesUl = document.createElement('ul');
            servicesUl.id = 'contact-detail-services-list'; // Corresponds to existing CSS
            contact.services.forEach(serviceId => {
                const service = this.game.contactsManager.getServiceById(serviceId);
                if (service) {
                    servicesUl.appendChild(this._renderServiceItem(service, contact.id));
                }
            });
            this.contactDetailView.appendChild(servicesUl);
        }

        // Missions
        if (contact.missions && contact.missions.length > 0) {
            const missionsHeader = document.createElement('h4');
            missionsHeader.textContent = 'Missions:';
            this.contactDetailView.appendChild(missionsHeader);
            const missionsDiv = document.createElement('div');
            missionsDiv.id = 'contact-detail-missions-list'; // Corresponds to existing CSS
            contact.missions.forEach(missionId => {
                const mission = this.game.contactsManager.getMissionById(missionId);
                if (mission) {
                    // Check if player meets requirements for this mission
                    const canStart = this.game.contactsManager.canStartMission(contact.id, missionId);
                    missionsDiv.appendChild(this._renderMissionItem(mission, contact.id, canStart));
                }
            });
            this.contactDetailView.appendChild(missionsDiv);
        }
    }

    _renderServiceItem(service, contactId) {
        const li = document.createElement('li');
        li.className = 'service-item'; // For styling

        const nameSpan = document.createElement('span');
        nameSpan.className = 'service-name';
        nameSpan.textContent = `${service.name} - Cost: $${service.cost}`;
        li.appendChild(nameSpan);

        const descriptionP = document.createElement('p');
        descriptionP.className = 'service-description';
        descriptionP.textContent = service.description;
        li.appendChild(descriptionP);

        const activateButton = document.createElement('button');
        activateButton.className = 'btn btn-primary btn-small'; // Use existing button styles
        activateButton.textContent = 'Activate Service';
        activateButton.disabled = this.game.getCash() < service.cost;
        activateButton.addEventListener('click', () => {
            const success = this.game.contactsManager.activateService(contactId, service.id);
            if (success) {
                showNotification(`Service "${service.name}" activated! Cost: $${service.cost}`, "Contacts");
                this.updateHUD(); // Update cash display
                this.renderPlayerContactDetail(contactId); // Re-render detail to update button states
            } else {
                showNotification(`Could not activate "${service.name}". Not enough cash or service unavailable.`, "Contacts", "negative");
            }
        });
        li.appendChild(activateButton);
        return li;
    }

    _renderMissionItem(mission, contactId, canStart) {
        const div = document.createElement('div');
        div.className = 'mission-item'; // For styling

        const nameH5 = document.createElement('h5');
        nameH5.className = 'mission-name';
        nameH5.textContent = mission.name;
        div.appendChild(nameH5);

        const descriptionP = document.createElement('p');
        descriptionP.className = 'mission-description';
        descriptionP.textContent = mission.description;
        div.appendChild(descriptionP);

        if (mission.requirements) {
            const reqP = document.createElement('p');
            reqP.className = 'mission-requirements';
            let reqText = "Requires: ";
            if (mission.requirements.minStreetCred) reqText += `Street Cred ${mission.requirements.minStreetCred}, `;
            if (mission.requirements.minLoyalty) reqText += `Loyalty Level "${this.game.loyaltyManager.getLoyaltyLevelName(mission.requirements.minLoyalty)}" with ${this.game.contactsManager.getContactById(contactId).name}, `;
            // Add other requirement displays here
            reqP.textContent = reqText.slice(0, -2); // Remove trailing comma and space
            div.appendChild(reqP);
        }

        const startButton = document.createElement('button');
        startButton.className = 'btn btn-secondary btn-small'; // Use existing button styles
        startButton.textContent = 'Start Mission';
        startButton.disabled = !canStart;
        if (!canStart) {
            startButton.title = "Requirements not met or mission already completed/active.";
        }
        startButton.addEventListener('click', () => {
            // Logic to start mission - this would typically involve setting game state
            // and potentially navigating to a mission-specific UI or dialogue.
            // For now, just a notification.
            const started = this.game.contactsManager.startMission(contactId, mission.id);
            if(started){
                showNotification(`Mission "${mission.name}" started! Check objectives.`, "Contacts");
                this.renderPlayerContactDetail(contactId); // Re-render to update button state
            } else {
                showNotification(`Could not start mission "${mission.name}".`, "Contacts", "negative");
            }
        });
        div.appendChild(startButton);
        return div;
    }

    // --- Audio ---
    playSound(soundElement) {
        if (soundElement && soundElement.play) {
            soundElement.currentTime = 0;
            soundElement.play().catch(error => debugLogger.warn('Audio', `Playback prevented for ${soundElement.id || 'unknown sound'}`, error));
        }
    }

    // --- Style & Theme Management ---
    initStyleControls(saveCallback) { // saveCallback is passed from script.js
        const styleControls = (this.settingsControlsContainer || this.appContainer).querySelectorAll('input[data-variable], select[data-variable]');
        styleControls.forEach(control => {
            const variable = control.dataset.variable;
            const eventType = (control.type === 'range' || control.type === 'color') ? 'input' : 'change';
            control.addEventListener(eventType, () => {
                let value = control.value;
                const display = (this.settingsControlsContainer || this.appContainer).querySelector(`span[data-target="${control.id}"]`);
                if (control.type === 'range' && (variable.includes('radius') || variable.includes('unit') || variable.includes('spacing'))) { // Added spacing check
                    value += 'px';
                    if (display) display.textContent = value;
                } else if (display && control.type === 'range') { // For other range inputs like opacity
                     if (display) display.textContent = value;
                }
                (this.appContainer || document.documentElement).style.setProperty(variable, value); // Apply to appContainer or root
                 // If not in preview mode, call the save callback
                if (!this.isPreviewing && saveCallback) {
                    saveCallback();
                }
            });
        });
    }

    isPreviewing = false; // Add this property to the class

    loadAndApplyStyleSettings() {
        const settings = this.getStoredStyleSettings();
        this.applyStyleSettings(settings);
        const styleControls = (this.settingsControlsContainer || this.appContainer).querySelectorAll('input[data-variable], select[data-variable]');
        styleControls.forEach(control => {
            const variableName = control.dataset.variable;
            if (settings[variableName] !== undefined) { // Check if property exists
                let value = settings[variableName];
                if (control.type === 'range' && (variableName.includes('radius') || variableName.includes('unit') || variableName.includes('spacing'))) {
                    value = String(value).replace('px', ''); // Ensure it's a string before replace
                }
                control.value = value;
                if (control.type === 'range') {
                    const display = (this.settingsControlsContainer || this.appContainer).querySelector(`span[data-target="${control.id}"]`);
                    if (display) display.textContent = variableName.includes('radius') || variableName.includes('unit') || variableName.includes('spacing') ? `${value}px` : value;
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
            if ((variable.includes('radius') || variable.includes('spacing-unit') || variable.includes('spacing')) &&
                !isNaN(parseFloat(value)) && !String(value).endsWith('px')) { // Ensure string for endsWith
                finalValue = `${value}px`;
            }
            (this.appContainer || document.documentElement).style.setProperty(variable, finalValue);
        }
    }

    saveStyleSettingsToStorage() { // This method should be called by script.js via the callback
        const settings = {};
        const styleControls = (this.settingsControlsContainer || this.appContainer).querySelectorAll('input[data-variable], select[data-variable]');
        styleControls.forEach(control => {
            let value = control.value;
             if (control.type === 'range' && (control.dataset.variable.includes('radius') || control.dataset.variable.includes('unit') || control.dataset.variable.includes('spacing'))) {
                value += 'px';
            }
            settings[control.dataset.variable] = value;
        });
        try {
            localStorage.setItem(this.config.styleSettingsKey, JSON.stringify(settings));
            debugLogger.log('UIManager', 'Style settings saved successfully.');
        } catch (error) {
            debugLogger.error('UIManager', 'Failed to save style settings to localStorage.', error);
        }
    }

    originalSettingsBeforePreview = {}; // Add this property

    resetToDefaultStyles(saveCallback) {
        this.originalSettingsBeforePreview = this.getStoredStyleSettings(); // Store current before resetting
        this.applyStyleSettings(this.config.defaultStyleSettings);
        this.loadAndApplyStyleSettings(); // This re-syncs the input controls to default values
        if (saveCallback) saveCallback(); // Save the default settings
         if (typeof showNotification === 'function') showNotification("Styles reset to default and saved.", "Settings");
    }

    togglePreview(saveCallback) { // saveCallback is passed from script.js
        this.isPreviewing = !this.isPreviewing;
        const previewButton = this.previewMainSettingsButton || this.previewPhoneSettingsButton; // Assuming one exists

        if (this.isPreviewing) {
            this.originalSettingsBeforePreview = {};
             (this.settingsControlsContainer || this.appContainer).querySelectorAll('input[data-variable], select[data-variable]').forEach(control => {
                this.originalSettingsBeforePreview[control.dataset.variable] = control.value;
             });
            if (previewButton) previewButton.textContent = 'Apply & Save Preview';
             if (typeof showNotification === 'function') showNotification("Preview Mode ON. Changes are temporary.", "Settings");
        } else {
            // Exiting preview mode
            if (previewButton) previewButton.textContent = 'Preview Styles';
            if (saveCallback) {
                saveCallback(); // This will save the current (previewed) styles
                 if (typeof showNotification === 'function') showNotification("Preview settings applied and saved.", "Settings");
            }
        }
    }

    // This method is for cancelling preview and reverting to original values *before* preview started
    cancelPreviewAndRevert() {
        if (this.isPreviewing) {
            this.applyStyleSettings(this.originalSettingsBeforePreview);
            this.loadAndApplyStyleSettings(); // Resync controls to original values
            this.isPreviewing = false;
            const previewButton = this.previewMainSettingsButton || this.previewPhoneSettingsButton;
            if (previewButton) previewButton.textContent = 'Preview Styles';
             if (typeof showNotification === 'function') showNotification("Preview cancelled. Styles reverted.", "Settings");
        }
    }


    displayEtiquetteFeedback(feedbackId, type) { // type is 'positive', 'negative', or 'neutral'
        const message = feedbackMessages[feedbackId] || "Your actions have been noted on the street.";
        showNotification(message, "Street Murmurs", type); // Directly use imported showNotification
    }
}

export { UIManager };
