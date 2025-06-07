// =================================================================================
// My Nigga Rikk - Main Game Logic Script (Controller) - FINAL, UNABRIDGED BUILD
// =================================================================================
// This script is the definitive controller for the application. It manages the game
// loop, UI state, player actions, data persistence, and all integrations.u
// This file is complete with no omissions or truncations.
// =================================================================================

// --- MODULE IMPORTS ---
import { initPhoneAmbientUI, showNotification as phoneShowNotification } from './phone_ambient_ui.js';
import { CustomerManager } 
from './classes/CustomerManager.js';
import { ContactsAppManager } from './classes/ContactsAppManager.js';
import { SlotGameManager } from './classes/SlotGameManager.js';
import { customerTemplates } from './data/customer_templates.js';
import { itemTypes, ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS } from './data/data_items.js';
import { possibleWorldEvents } from './data/data_events.js';

// =================================================================================
// I. DOM ELEMENT REFERENCES & GAME STATE VARIABLES
// =================================================================================

// --- DOM Element References (Declared with `let`, assigned in `initGame`) ---
let splashScreen, gameViewport, startScreen, gameScreen, endScreen;
let newGameBtn, continueGameBtn, restartGameBtn;
let cashDisplay, dayDisplay, heatDisplay, credDisplay, finalCredDisplay;
let eventTicker, gameScene, knockEffect;
let rikkPhoneUI, phoneScreenArea, androidHomeScreen, gameChatView, contactsAppView, slotGameView;
let chatContainer, choicesArea, phoneTitleGame, phoneBackButtons;
let phoneDock, phoneHomeIndicator, phoneDockedIndicator, dockPhoneBtn;
let openInventoryBtn, inventoryCountDisplay, nextCustomerBtn;
let inventoryModal, closeModalBtn, inventoryList, modalInventorySlotsDisplay;
let finalDaysDisplay, finalCashDisplay, finalVerdictText;
let doorKnockSound, cashSound, deniedSound, chatBubbleSound;
let primaryActionsContainer, submenuNavigationContainer;
let settingsMenuBtn, loadMenuBtn, creditsMenuBtn;
let settingsMenuPanel, loadMenuPanel, creditsMenuPanel;
let allSubmenuBackBtns;
let phoneThemeSettingsView; // NEW: Declare phone theme settings view

// --- Game State & Managers ---
let cash = 0, fiendsLeft = 0, heat = 0, streetCred = 0;
let inventory = [], activeWorldEvents = [];
let currentCustomerInstance = null, gameActive = false;
let playerSkills = { negotiator: 0, appraiser: 0, lowProfile: 0 };
let dayOfWeek = 'Monday';
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let customerManager, contactsAppManager, slotGameManager;

// --- UI State ---
let chatSpacerElement = null;

// --- Style Settings Preview Mode State ---
let isPreviewModeActive = false; // Added for Preview Mode
let originalSettingsBeforePreview = {}; // Added for Preview Mode
const APP_CONTAINER_SELECTOR = '#game-viewport'; // Added for Preview Mode (using game-viewport)

// --- localStorage Availability Check ---
function isLocalStorageAvailable() {
    let storage;
    try {
        storage = window.localStorage;
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
            e.code === 22 || e.code === 1014 ||
            e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            (storage && storage.length !== 0);
    }
}
const localStorageAvailable = isLocalStorageAvailable();

// --- Game Configuration ---
const CUSTOMER_WAIT_TIME = 1100, KNOCK_ANIMATION_DURATION = 1000;
const SAVE_KEY = 'myNiggaRikkSaveDataV10';
const STYLE_SETTINGS_KEY = 'rikkGameStyleSettingsV1';
const STARTING_CASH = 500, MAX_FIENDS = 15, SPLASH_SCREEN_DURATION = 2500;
const STARTING_STREET_CRED = 0, MAX_HEAT = 100, MAX_INVENTORY_SLOTS = 10;

const defaultStyleSettings = {
    '--color-dark-bg': '#121212',
    '--color-surface': '#1e1e1e',
    '--color-primary': '#bb86fc',
    '--color-secondary': '#03dac6',
    '--color-on-surface': '#e0e0e0',
    '--color-on-primary': '#000000',
    '--color-accent-gold': '#f39c12',
    '--color-error': '#cf6679',
    '--color-success-green': '#2ecc71',
    '--font-body': "'Roboto', 'Open Sans', sans-serif",
    '--font-display': "'Press Start 2P', 'Comic Neue', cursive",
    '--viewport-border-radius': '12',
    '--phone-border-radius': '28',
    '--modal-border-radius': '10',
    '--button-border-radius': '8',
    '--spacing-unit': '8'
};

// --- Avatars (For chat UI) ---
const customerAvatars = {
    "DESPERATE_FIEND": "https://randomuser.me/api/portraits/men/32.jpg",
    "HIGH_ROLLER": "https://randomuser.me/api/portraits/men/45.jpg",
    "REGULAR_JOE": "https://randomuser.me/api/portraits/women/67.jpg",
    "INFORMANT": "https://randomuser.me/api/portraits/men/78.jpg",
    "SNITCH": "https://randomuser.me/api/portraits/women/12.jpg",
    "STIMULANT_USER": "https://randomuser.me/api/portraits/men/9.jpg",
    "PSYCHEDELIC_EXPLORER": "https://randomuser.me/api/portraits/men/7.jpg"
};
const rikkAvatarUrl = "https://randomuser.me/api/portraits/men/9.jpg";
const systemAvatarUrl = "assets/icons/info-icon.svg";

// --- ElevenLabs TTS API Configuration ---
const TTS_ENABLED = false;
const ELEVENLABS_API_ENDPOINT_BASE = 'https://api.elevenlabs.io/v1/text-to-speech/';
const ELEVENLABS_API_KEY = "sk_a49dfec4b4491a9e71ba4a3d6af9ec9868925673ba098b64";
const ELEVENLABS_VOICE_ID_CUSTOMER = "21m00Tcm4TlvDq8ikWAM";
const ELEVENLABS_VOICE_ID_RIKK = "VR6AewLTigWG4xSOh1om";

// --- TTS Audio Queue Management ---
let audioQueue = [];
let isPlayingAudio = false;

// --- Helper function ---
function getRandomElement(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

// =================================================================================
// II. DEBUGGING FRAMEWORK
// =================================================================================

let rikkDebugInterval = null;
let DEBUG_MODE = localStorage.getItem('rikkDebugMode') === 'true' || false;

const debugLogger = {
    log: (component, message, data) => {
        if (DEBUG_MODE) console.log(`[${component}] ${message}`, data || '');
    },
    error: (component, message, error) => {
        if (DEBUG_MODE) console.error(`[${component} ERROR] ${message}`, error || '');
    }
};

// =================================================================================
// III. CORE GAME INITIALIZATION & FLOW
// =================================================================================

function initGame() {
    // Assign all DOM elements
    splashScreen = document.getElementById('splash-screen');
    gameViewport = document.getElementById('game-viewport');
    startScreen = document.getElementById('start-screen');
    gameScreen = document.getElementById('game-screen');
    endScreen = document.getElementById('end-screen');
    newGameBtn = document.getElementById('new-game-btn');
    continueGameBtn = document.getElementById('continue-game-btn');
    restartGameBtn = document.getElementById('restart-game-btn');
    cashDisplay = document.getElementById('cash-display');
    dayDisplay = document.getElementById('day-display');
    heatDisplay = document.getElementById('heat-display');
    credDisplay = document.getElementById('cred-display');
    finalCredDisplay = document.getElementById('final-cred-display');
    eventTicker = document.getElementById('event-ticker');
    gameScene = document.getElementById('game-scene');
    knockEffect = document.getElementById('knock-effect');
    rikkPhoneUI = document.getElementById('rikk-phone-ui');
    phoneScreenArea = document.getElementById('phone-screen-area');
    androidHomeScreen = document.getElementById('android-home-screen');
    gameChatView = document.getElementById('game-chat-view');
    contactsAppView = document.getElementById('contacts-app-view');
    slotGameView = document.getElementById('slot-game-view');
    phoneThemeSettingsView = document.getElementById('phone-theme-settings-view'); // NEW: Assign phone theme settings view
    chatContainer = document.getElementById('chat-container-game');
    choicesArea = document.getElementById('choices-area-game');
    phoneTitleGame = document.getElementById('phone-title-game');
    phoneBackButtons = document.querySelectorAll('.phone-back-button');
    phoneDock = rikkPhoneUI.querySelector('.dock');
    phoneHomeIndicator = rikkPhoneUI.querySelector('.home-indicator');
    phoneDockedIndicator = document.getElementById('phone-docked-indicator');
    dockPhoneBtn = document.getElementById('dock-phone-btn');
    openInventoryBtn = document.getElementById('open-inventory-btn');
    inventoryCountDisplay = document.getElementById('inventory-count-display');
    nextCustomerBtn = document.getElementById('next-customer-btn');
    inventoryModal = document.getElementById('inventory-modal');
    closeModalBtn = document.querySelector('#inventory-dialog .close-modal-btn');
    inventoryList = document.getElementById('inventory-list');
    modalInventorySlotsDisplay = document.getElementById('modal-inventory-slots-display');
    finalDaysDisplay = document.getElementById('final-days-display');
    finalCashDisplay = document.getElementById('final-cash-display');
    finalVerdictText = document.getElementById('final-verdict-text');
    primaryActionsContainer = document.getElementById('primary-actions');
    submenuNavigationContainer = document.getElementById('submenu-navigation');
    settingsMenuBtn = document.getElementById('settings-menu-btn');
    loadMenuBtn = document.getElementById('load-menu-btn');
    creditsMenuBtn = document.getElementById('credits-menu-btn');
    settingsMenuPanel = document.getElementById('settings-menu-panel');
    loadMenuPanel = document.getElementById('load-menu-panel');
    creditsMenuPanel = document.getElementById('credits-menu-panel');
    allSubmenuBackBtns = document.querySelectorAll('.submenu-back-btn');
    doorKnockSound = document.getElementById('door-knock-sound');
    cashSound = document.getElementById('cash-sound');
    deniedSound = document.getElementById('denied-sound');
    chatBubbleSound = document.getElementById('chat-bubble-sound');
    
    // Initialize Managers
    customerManager = new CustomerManager(customerTemplates, itemTypes, ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS);
    contactsAppManager = new ContactsAppManager(contactsAppView, customerTemplates);
    slotGameManager = new SlotGameManager(slotGameView, () => cash, (newCash) => {
        cash = newCash;
        updateHUD();
    });

    // Initial Screen Flow
    splashScreen.classList.add('active');
    setTimeout(() => {
        splashScreen.classList.remove('active');
        splashScreen.style.display = 'none';
        startScreen.classList.add('active');
        checkForSavedGame();
    }, SPLASH_SCREEN_DURATION);

    // Attach Event Listeners
    newGameBtn.addEventListener('click', handleStartNewGameClick);
    continueGameBtn.addEventListener('click', handleContinueGameClick);
    restartGameBtn.addEventListener('click', handleRestartGameClick);
    nextCustomerBtn.addEventListener('click', nextFiend);
    openInventoryBtn.addEventListener('click', openInventoryModal);
    closeModalBtn.addEventListener('click', closeInventoryModal);
    inventoryModal.addEventListener('click', (e) => {
        if (e.target === inventoryModal) closeInventoryModal();
    });
    
    rikkPhoneUI.querySelectorAll('.app-icon, .dock-icon').forEach(icon => icon.addEventListener('click', handlePhoneAppClick));
    phoneBackButtons.forEach(btn => btn.addEventListener('click', handlePhoneAppClick));
    phoneDockedIndicator.addEventListener('click', () => setPhoneUIState('home'));
    dockPhoneBtn.addEventListener('click', () => setPhoneUIState('docked'));
    
    // Event listeners for new main menu submenu buttons
    if (settingsMenuBtn) {
        settingsMenuBtn.addEventListener('click', () => openSubmenuPanel(settingsMenuPanel));
    }
    if (loadMenuBtn) {
        loadMenuBtn.addEventListener('click', () => openSubmenuPanel(loadMenuPanel));
    }
    if (creditsMenuBtn) {
        creditsMenuBtn.addEventListener('click', () => openSubmenuPanel(creditsMenuPanel));
    }

    allSubmenuBackBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            const panelToClose = event.target.closest('.submenu-panel');
            if (panelToClose) {
                closeSubmenuPanel(panelToClose);
            }
        });
    });

    initStyleSettingsControls(); // Initializes controls for both main menu and phone app
    loadStyleSettings(); // Loads and applies styles to all relevant controls

    // Initialize Sub-modules
    initPhoneAmbientUI(rikkPhoneUI);
}

function initializeNewGameState() {
    clearSavedGameState();
    cash = STARTING_CASH;
    fiendsLeft = MAX_FIENDS;
    heat = 0;
    streetCred = STARTING_STREET_CRED;
    inventory = [];
    playerSkills = { negotiator: 0, appraiser: 0, lowProfile: 0 };
    activeWorldEvents = [];
    dayOfWeek = days[0];
    gameActive = false;
    customerManager.reset();
    updateEventTicker();
}

function startGameFlow() {
    gameActive = true;
    startScreen.classList.remove('active');
    endScreen.classList.remove('active');
    gameScreen.classList.add('active');
    setPhoneUIState('home');
    updateHUD();
    updateInventoryDisplay();
    clearChat();
    clearChoices();
    nextFiend();
}

function endGame(reason) {
    gameActive = false;
    gameScreen.classList.remove('active');
    endScreen.classList.add('active');
    finalDaysDisplay.textContent = MAX_FIENDS - fiendsLeft;
    finalCashDisplay.textContent = cash;
    finalCredDisplay.textContent = streetCred;
    
    if (reason === "heat") {
        finalVerdictText.textContent = `The block's too hot, nigga! 5-0 swarming. Heat: ${heat}. Time to ghost.`;
    } else if (reason === "bankrupt") {
        finalVerdictText.textContent = "Broke as a joke, and empty handed. Can't hustle on E, fam.";
    } else if (reason === "completed") {
        if (cash >= STARTING_CASH * 3) {
            finalVerdictText.textContent = "You a certified KINGPIN! The streets whisper your name.";
        } else if (cash >= STARTING_CASH * 1.5) {
            finalVerdictText.textContent = "Solid hustle, G. Made bank and respect.";
        } else {
            finalVerdictText.textContent = "Broke even or worse. Gotta step your game up, Rikk.";
        }
    }
    finalVerdictText.style.color = (reason === "heat" || reason === "bankrupt") ? "var(--color-error)" : (cash > STARTING_CASH ? "var(--color-success-green)" : "var(--color-accent-orange)");
    setPhoneUIState('offscreen');
    clearSavedGameState();
}

function nextFiend() {
    if (!gameActive || fiendsLeft <= 0) {
        endGame("completed");
        return;
    }
    updateDayOfWeek();
    advanceWorldEvents();
    triggerWorldEvent();
    heat = Math.max(0, heat - (1 + playerSkills.lowProfile));
    updateHUD();
    clearChat();
    clearChoices();
    nextCustomerBtn.disabled = true;
    setPhoneUIState('docked');
    playSound(doorKnockSound);
    knockEffect.textContent = `*${dayOfWeek} hustle... someone's knockin'.*`;
    knockEffect.classList.remove('hidden');
    knockEffect.style.animation = 'none';
    void knockEffect.offsetWidth;
    knockEffect.style.animation = 'knockAnim 0.5s ease-out forwards';

    setTimeout(() => {
        knockEffect.classList.add('hidden');
        const gameState = { inventory, cash, playerSkills, activeWorldEvents };
        const interaction = customerManager.generateInteraction(gameState);
        currentCustomerInstance = interaction.instance;
        startCustomerInteraction(interaction);
    }, KNOCK_ANIMATION_DURATION);
    saveGameState();
}

function startCustomerInteraction(interaction) {
    setPhoneUIState('chatting');
    phoneTitleGame.textContent = interaction.name;
    phoneShowNotification(`Incoming message from: ${interaction.name}`, "New Customer");
    
    clearChat();
    let dialogueIndex = 0;
    const displayNext = () => {
        if (dialogueIndex < interaction.dialogue.length) {
            const msg = interaction.dialogue[dialogueIndex];
            dialogueIndex++;
            queueNextMessage(msg.text, msg.speaker, () => {
                setTimeout(displayNext, CUSTOMER_WAIT_TIME);
            });
        } else {
            displayChoices(interaction.choices);
        }
    };
    displayNext();
}

function endCustomerInteraction() {
    clearChoices();
    phoneTitleGame.textContent = 'Street Talk';
    currentCustomerInstance = null;
    setPhoneUIState('home');
    if (gameActive && fiendsLeft > 0 && heat < MAX_HEAT && (cash > 0 || inventory.length > 0)) {
        nextCustomerBtn.disabled = false;
    } else if (gameActive) {
        nextCustomerBtn.disabled = true;
        if (heat >= MAX_HEAT) endGame("heat");
        else if (cash <= 0 && inventory.length === 0) endGame("bankrupt");
        else if (fiendsLeft <= 0) endGame("completed");
    }
    saveGameState();
}

// =================================================================================
// IV. UI MANAGEMENT & DISPLAY FUNCTIONS
// =================================================================================

function toggleMainMenuButtons(show) {
    if (!primaryActionsContainer || !submenuNavigationContainer) return; // Guard clause
    if (show) {
        primaryActionsContainer.classList.remove('hidden');
        submenuNavigationContainer.classList.remove('hidden');
    } else {
        primaryActionsContainer.classList.add('hidden');
        submenuNavigationContainer.classList.add('hidden');
    }
}

function openSubmenuPanel(panelElement) {
    if (!panelElement) return; // Guard clause
    toggleMainMenuButtons(false);
    panelElement.classList.remove('hidden');
}

function closeSubmenuPanel(panelElement) {
    if (!panelElement) return; // Guard clause
    panelElement.classList.add('hidden');
    toggleMainMenuButtons(true);
}

// Modified: applyStyleSetting now ONLY sets the CSS property. Saving is handled by initStyleSettingsControls.
function applyStyleSetting(variableName, value) {
    if (variableName && typeof value !== 'undefined') {
        let cssValue = value; // Value from input, e.g. "12" or "#FFFFFF" or "'Roboto', sans-serif"

        const control = document.querySelector(`[data-variable="${variableName}"]`);
        if (control && control.type === 'range' &&
            (variableName.includes('radius') || variableName.includes('unit') || variableName.includes('spacing'))) {
            // Ensure value is string for concatenation, input.value is usually string
            cssValue = String(value) + 'px';
        }
        document.documentElement.style.setProperty(variableName, cssValue);
    }
}

function saveStyleSettings() {
    if (!localStorageAvailable) {
        console.warn('localStorage is not available. Settings will not be saved.');
        // Optionally, inform the user via UI that settings cannot be saved.
        // showErrorState("Cannot save settings: Storage unavailable.", null); // Example if showErrorState is available
        return;
    }

    const actualSettingsLoadingElement = document.querySelector('.settings-loading');
    const actualSettingsErrorElement = document.querySelector('.settings-error');
    const actualSettingsErrorMessageElement = actualSettingsErrorElement ? actualSettingsErrorElement.querySelector('.error-message') : null;

    if (actualSettingsLoadingElement) actualSettingsLoadingElement.classList.remove('hidden');
    if (actualSettingsErrorElement) actualSettingsErrorElement.classList.add('hidden'); // Hide error if showing

    try {
        const settingsToSave = {};
        const styleControls = document.querySelectorAll('[data-variable]');
        styleControls.forEach(control => {
            const cssVariable = control.dataset.variable;
            settingsToSave[cssVariable] = control.value; // Store the raw control value
        });
        localStorage.setItem(STYLE_SETTINGS_KEY, JSON.stringify(settingsToSave));

        if (actualSettingsLoadingElement) actualSettingsLoadingElement.classList.add('hidden');
        console.log('Settings saved successfully (minimal).');
        // Optional: if (typeof phoneShowNotification === 'function') phoneShowNotification("Settings Saved!", "System");

    } catch (error) {
        if (actualSettingsLoadingElement) actualSettingsLoadingElement.classList.add('hidden');
        if (actualSettingsErrorElement) {
            if (actualSettingsErrorMessageElement) actualSettingsErrorMessageElement.textContent = `Failed to save settings: ${error.message}`;
            actualSettingsErrorElement.classList.remove('hidden');
        }
        console.error('Failed to save settings (minimal):', error);
    }
}

function loadStyleSettings() {
    let loadedSettings = null;
    let settingsSource = "defaults"; // For logging

    if (localStorageAvailable) {
        try {
            const settingsString = localStorage.getItem(STYLE_SETTINGS_KEY);
            if (settingsString) {
                loadedSettings = JSON.parse(settingsString);

                // Basic Validation
                if (typeof loadedSettings !== 'object' || loadedSettings === null) {
                    console.warn('Loaded settings are not a valid object. Falling back to defaults.');
                    loadedSettings = null; // Force fallback
                    localStorage.removeItem(STYLE_SETTINGS_KEY); // Remove corrupted data
                } else {
                    // Type validation against defaultStyleSettings
                    for (const key in loadedSettings) {
                        if (defaultStyleSettings.hasOwnProperty(key)) {
                            if (typeof loadedSettings[key] !== typeof defaultStyleSettings[key]) {
                                console.warn(`Type mismatch for setting "${key}". Expected ${typeof defaultStyleSettings[key]} but got ${typeof loadedSettings[key]}. Using default for this key.`);
                                loadedSettings[key] = defaultStyleSettings[key]; // Revert only this key to default
                            }
                        } else {
                            // Optional: delete loadedSettings[key]; // Remove unexpected keys
                        }
                    }
                    console.log("Successfully loaded and validated settings from localStorage.");
                    settingsSource = "localStorage";
                }
            } else {
                console.log("No settings found in localStorage. Will use defaults.");
            }
        } catch (error) {
            console.error('Error loading or parsing settings from localStorage:', error);
            loadedSettings = null; // Ensure fallback on error
            if (localStorageAvailable) localStorage.removeItem(STYLE_SETTINGS_KEY); // Attempt to clear corrupted data
        }
    } else {
        console.warn('localStorage is not available. Using default settings for this session.');
    }

    // Use validated loadedSettings or fall back to a fresh copy of defaultStyleSettings
    const currentStyleSettings = loadedSettings ? { ...defaultStyleSettings, ...loadedSettings } : { ...defaultStyleSettings };

    if (!loadedSettings) { // This means we are using defaults fully or partially due to missing/corrupt localStorage
        console.log("Applying default styles as primary source or fallback.");
    }

    // Apply currentStyleSettings to DOM elements and CSS properties
    const styleControls = document.querySelectorAll('[data-variable]');
    styleControls.forEach(control => {
        const cssVariable = control.dataset.variable;
        if (currentStyleSettings.hasOwnProperty(cssVariable)) {
            const value = currentStyleSettings[cssVariable];
            control.value = value;
            applyStyleSetting(cssVariable, value); // Visually apply (handles 'px' for ranges)

            if (control.type === 'range') {
                const valueDisplaySpan = document.querySelector(`.value-display[data-target="${control.id}"]`);
                if (valueDisplaySpan) valueDisplaySpan.textContent = value; // value is numeric string for ranges from defaults/storage
            }
        } else {
             // A control exists for a variable not in currentStyleSettings (e.g. if defaultStyleSettings is incomplete)
            console.warn(`Control found for ${cssVariable} but it's not in current style settings. Check defaultStyleSettings.`);
        }
    });

    // If settings were loaded from defaults because localStorage was empty/unavailable/corrupt,
    // and localStorage is actually available, save these defaults to localStorage.
    if (settingsSource === "defaults" && localStorageAvailable) {
        console.log("Saving initial default styles to localStorage because no valid saved settings were found.");
        saveStyleSettings();
    }
}

function initStyleSettingsControls() {
    // Modify to query all controls with data-variable, enabling it for both main menu and phone app
    const styleControls = document.querySelectorAll('[data-variable]');

    styleControls.forEach(control => {
        const cssVariable = control.dataset.variable;
        let eventType = 'input'; // For live updates on color pickers and range sliders
        if (control.type === 'select-one') {
            eventType = 'change'; // 'change' is better for select elements
        }

        // Remove existing listener to prevent duplicates if called multiple times (e.g., during app re-launch)
        // This needs to be done carefully to avoid removing listeners that are only *meant* to be there once.
        // For simplicity with this current design, we assume init is called once on DOMContentLoaded.
        // If apps were truly dynamic, a more robust event delegation or cleanup pattern would be needed.

        control.addEventListener(eventType, (event) => {
            const rawValue = event.target.value; // e.g., "12", "#FFFFFF"
            // const cssVariable = control.dataset.variable; // cssVariable is already defined in outer scope

            if (control.type === 'range') {
                const valueDisplay = document.querySelector(`.value-display[data-target="${control.id}"]`);
                if (valueDisplay) {
                    valueDisplay.textContent = rawValue; // Show numeric value
                }
            }

            applyStyleSetting(cssVariable, rawValue); // Apply visually to CSS (handles 'px' conversion internally)

            if (!isPreviewModeActive) { // isPreviewModeActive needs to be defined globally
                saveStyleSettings();
            } else {
                console.log(`Preview change: ${cssVariable} = ${rawValue} (not saved)`);
            }
        });

        // Initial update of the value display span for range inputs (if they exist)
        // This is handled by loadStyleSettings, but a fallback can be here if needed.
        if (control.type === 'range') {
            const valueDisplay = document.querySelector(`.value-display[data-target="${control.id}"]`);
            if (valueDisplay) {
                valueDisplay.textContent = control.value;
            }
        }
    });
}

function handleStartNewGameClick() {
    initializeNewGameState();
    startGameFlow();
}

function handleContinueGameClick() {
    if (loadGameState()) {
        startGameFlow();
    } else {
        displaySystemMessage("System: No saved game found.");
        initializeNewGameState();
        startGameFlow();
    }
}

function handleRestartGameClick() {
    initializeNewGameState();
    startGameFlow();
}

function setPhoneUIState(state) {
    if (!rikkPhoneUI) return;
    
    // Hide all phone content views initially
    rikkPhoneUI.classList.remove('is-offscreen', 'chatting-game', 'home-screen-active', 'app-menu-game');
    androidHomeScreen.classList.add('hidden'); 
    gameChatView.classList.add('hidden'); 
    contactsAppView.classList.add('hidden');
    slotGameView.classList.add('hidden');
    phoneThemeSettingsView.classList.add('hidden'); // NEW: Hide phone theme settings view
    
    phoneScreenArea.classList.remove('screen-off');
    phoneDockedIndicator.classList.add('hidden');
    phoneBackButtons.forEach(btn => btn.classList.add('hidden'));
    phoneDock.classList.add('hidden'); 
    phoneHomeIndicator.classList.add('hidden'); 
    
    switch (state) {
        case 'chatting':
            rikkPhoneUI.classList.add('chatting-game'); 
            gameChatView.classList.remove('hidden');
            break;
        case 'home':
            rikkPhoneUI.classList.add('home-screen-active'); 
            androidHomeScreen.classList.remove('hidden');
            phoneDock.classList.remove('hidden');
            phoneHomeIndicator.classList.remove('hidden');
            break;
        case 'contacts':
            rikkPhoneUI.classList.add('app-menu-game'); 
            contactsAppView.classList.remove('hidden');
            phoneBackButtons.forEach(btn => btn.classList.remove('hidden'));
            break;
        case 'slots':
            rikkPhoneUI.classList.add('app-menu-game');
            slotGameView.classList.remove('hidden');
            slotGameManager.launch();
            phoneBackButtons.forEach(btn => btn.classList.remove('hidden'));
            break;
        case 'theme-settings': // NEW: Phone Theme Settings case
            rikkPhoneUI.classList.add('app-menu-game');
            phoneThemeSettingsView.classList.remove('hidden');
            // Re-initialize controls if needed (though initStyleSettingsControls runs globally)
            // loadStyleSettings() ensures controls are up-to-date
            phoneBackButtons.forEach(btn => btn.classList.remove('hidden'));
            break;
        case 'docked':
            rikkPhoneUI.classList.add('is-offscreen'); 
            phoneScreenArea.classList.add('screen-off');
            phoneDockedIndicator.classList.remove('hidden');
            break;
        case 'offscreen':
            rikkPhoneUI.classList.add('is-offscreen');
            phoneScreenArea.classList.add('screen-off');
            break;
    }
}

function handlePhoneAppClick(event) {
    const action = event.currentTarget.dataset.action;
    switch(action) {
        case 'messages':
            if (!nextCustomerBtn.disabled && fiendsLeft > 0 && gameActive) { 
                nextFiend(); 
            } else if (currentCustomerInstance) { 
                setPhoneUIState('chatting'); 
            } else { 
                phoneShowNotification("No new messages.", "Rikk's Inbox"); 
            }
            break;
        case 'inventory-app': 
            openInventoryModal(); 
            break;
        case 'contacts-app':
            setPhoneUIState('contacts');
            break;
        case 'slot-game':
            setPhoneUIState('slots');
            break;
        case 'theme-settings': // NEW: Handle Theme Settings app click
            setPhoneUIState('theme-settings');
            break;
        case 'back-to-home': 
            setPhoneUIState('home'); 
            break;
        default: 
            phoneShowNotification(`App "${action}" not implemented.`, "System"); 
            break;
    }
}

function queueNextMessage(message, speaker, callback) {
    audioQueue.push({ message, speaker, callback });
    if (!isPlayingAudio) {
        processAudioQueue();
    }
}

function processAudioQueue() {
    if (audioQueue.length === 0) {
        isPlayingAudio = false;
        return;
    }

    isPlayingAudio = true;
    const { message, speaker, callback } = audioQueue.shift();

    if (!TTS_ENABLED || speaker === 'narration' || !ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID_CUSTOMER || !ELEVENLABS_VOICE_ID_RIKK) {
        playSound(chatBubbleSound);
        displayPhoneMessage(message, speaker);
        if (callback) callback();
        setTimeout(() => processAudioQueue(), 400);
        return;
    }

    let voiceId = speaker === 'customer' ? ELEVENLABS_VOICE_ID_CUSTOMER : ELEVENLABS_VOICE_ID_RIKK;
    const url = `${ELEVENLABS_API_ENDPOINT_BASE}${voiceId}`;
    const headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    };
    const data = {
        text: message.replace(/\*\*|[\*_]/g, ''),
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    };

    fetch(url, { method: "POST", headers: headers, body: JSON.stringify(data) })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                const errorDetail = errData.detail?.message || JSON.stringify(errData.detail);
                throw new Error(`HTTP error ${response.status}: ${errorDetail}`);
            }).catch(() => {
                throw new Error(`HTTP error! status: ${response.status}`);
            });
        }
        return response.blob();
    })
    .then(audioBlob => {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.volume = 0.8;
        displayPhoneMessage(message, speaker);
        audio.play().catch(e => { throw e; });
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            if (callback) callback();
            processAudioQueue();
        };
    })
    .catch(err => {
        console.error("Error with ElevenLabs TTS:", err);
        displaySystemMessage(`TTS service failed. Displaying text only.`);
        playSound(chatBubbleSound);
        displayPhoneMessage(message, speaker);
        if (callback) callback();
        processAudioQueue();
    });
}

function displayPhoneMessage(message, speaker) {
    if (typeof message === 'undefined' || message === null) {
        message = "...";
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
    
    if (speaker === 'customer' && currentCustomerInstance?.archetypeKey) {
        avatarImg.src = customerAvatars[currentCustomerInstance.archetypeKey] || 'https://via.placeholder.com/56/555555/FFFFFF?text=?';
        avatarImg.alt = currentCustomerInstance.name || 'Customer';
    } else if (speaker === 'rikk') {
        avatarImg.src = rikkAvatarUrl;
        avatarImg.alt = 'Rikk';
    } else { 
        avatarImg.src = systemAvatarUrl;
        avatarImg.alt = 'System';
    }
    avatarDiv.appendChild(avatarImg);
    personDiv.appendChild(avatarDiv);

    if (speaker !== 'narration') {
        messageContainer.appendChild(personDiv);
    }

    const contextDiv = document.createElement('div');
    contextDiv.classList.add('chat__conversation-board__message__context');
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', speaker);

    if (speaker === 'customer' || speaker === 'rikk') {
        const speakerNameElement = document.createElement('span');
        speakerNameElement.classList.add('speaker-name');
        speakerNameElement.textContent = (speaker === 'customer') ? (currentCustomerInstance.name || '[Customer]') : 'Rikk';
        bubble.appendChild(speakerNameElement);
    }
    
    const messageParts = message.split(/(\*\*.*?\*\*)/g);
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

    if (chatContainer && chatSpacerElement) {
        chatContainer.insertBefore(messageContainer, chatSpacerElement);
    } else if (chatContainer) {
        chatContainer.appendChild(messageContainer);
    }

    if(chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

function displaySystemMessage(message) {
    displayPhoneMessage(message, 'narration');
    phoneShowNotification(message, "System Alert");
}

function displayChoices(choices) {
    choicesArea.innerHTML = '';
    if (!choices) return;
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('choice-button');
        if (choice.outcome.type.startsWith('decline')) {
            button.classList.add('decline');
        }
        button.textContent = choice.text;
        button.disabled = choice.disabled || false;
        if (!choice.disabled) {
            button.addEventListener('click', () => handleChoice(choice.outcome));
        }
        choicesArea.appendChild(button);
    });
}

function updateHUD() {
    cashDisplay.textContent = cash;
    dayDisplay.textContent = fiendsLeft;
    heatDisplay.textContent = heat;
    credDisplay.textContent = streetCred;
}

function updateInventoryDisplay() {
    inventoryCountDisplay.textContent = inventory.length;
    modalInventorySlotsDisplay.textContent = `${inventory.length}/${MAX_INVENTORY_SLOTS}`;
    inventoryList.innerHTML = '';
    if (inventory.length > 0) {
        inventory.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('inventory-item-card');
            itemDiv.innerHTML = `<h4>${item.name} (${item.quality})</h4><p class="item-detail">Copped: $${item.purchasePrice}<br>Heat: +${item.itemTypeObj.heat}</p>`;
            inventoryList.appendChild(itemDiv);
        });
    } else {
        inventoryList.innerHTML = "<p class='empty-stash-message'>Your stash is bone dry.</p>";
    }
}

function openInventoryModal() {
    updateInventoryDisplay();
    inventoryModal.classList.add('active');
    setPhoneUIState('offscreen');
}

function closeInventoryModal() {
    inventoryModal.classList.remove('active');
    setPhoneUIState(currentCustomerInstance ? 'chatting' : 'home');
}

// =================================================================================
// V. INTERACTION & CHOICE LOGIC
// =================================================================================

function handleChoice(outcome) {
    clearChoices();

    if (!currentCustomerInstance) {
        console.error("handleChoice called with no active customer instance.");
        endCustomerInteraction();
        return;
    }

    let narrationText = "";
    let dealSuccess = false;
    let dialogueContextKey = '';

    switch (outcome.type) {
        case "buy_from_customer":
            if (cash >= outcome.price && inventory.length < MAX_INVENTORY_SLOTS) {
                cash -= outcome.price;
                inventory.push({ ...outcome.item });
                dealSuccess = true;
                narrationText = `Rikk copped "${outcome.item.name}".`;
                playSound(cashSound);
                dialogueContextKey = 'rikkBuysSuccess';
            } else {
                narrationText = `Deal failed. ${(inventory.length >= MAX_INVENTORY_SLOTS) ? "Stash full." : "Not enough cash."}`;
                playSound(deniedSound);
                dialogueContextKey = 'lowCashRikk';
            }
            break;
        case "sell_to_customer":
            const itemIndex = inventory.findIndex(i => i.id === outcome.item.id && i.quality === outcome.item.quality);
            if (itemIndex !== -1) {
                const itemSold = inventory.splice(itemIndex, 1)[0];
                cash += outcome.price;
                dealSuccess = true;
                narrationText = `Flipped "${itemSold.name}" for $${outcome.price}.`;
                playSound(cashSound);
                dialogueContextKey = 'rikkSellsSuccess';
            } else {
                narrationText = "Couldn't find that item.";
                playSound(deniedSound);
            }
            break;
        case "negotiate_sell":
            setTimeout(() => {
                if (Math.random() < 0.55 + (playerSkills.negotiator * 0.12)) {
                    const negoSuccessResult = customerManager.getOutcomeDialogue(currentCustomerInstance, 'negotiationSuccess');
                    queueNextMessage(`Negotiation successful! ${negoSuccessResult.line}`, 'customer', () => {
                         handleChoice({ type: "sell_to_customer", item: outcome.item, price: outcome.proposedPrice });
                    });
                } else {
                    const negoFailResult = customerManager.getOutcomeDialogue(currentCustomerInstance, 'negotiationFail');
                    queueNextMessage(`They ain't having it. ${negoFailResult.line}`, 'customer', () => {
                        const choices = [{ text: `Sell ($${outcome.originalOffer})`, outcome: { type: "sell_to_customer", item: outcome.item, price: outcome.originalOffer } }, { text: `Decline`, outcome: { type: "decline_offer_to_sell" } }];
                        displayChoices(choices);
                    });
                }
            }, 1000);
            return;
        case "decline_offer_to_buy":
            narrationText = "Rikk passes on the offer.";
            playSound(deniedSound);
            dialogueContextKey = 'rikkDeclinesToBuy';
            break;
        case "decline_offer_to_sell":
            narrationText = "Rikk tells them to kick rocks.";
            playSound(deniedSound);
            dialogueContextKey = 'rikkDeclinesToSell';
            break;
        case "acknowledge_empty_stash":
            narrationText = "Rikk's stash is dry. Customer ain't happy.";
            playSound(deniedSound);
            dialogueContextKey = 'acknowledge_empty_stash';
            break;
        case "acknowledge_error":
            narrationText = "System error acknowledged.";
            break;
    }

    if (outcome.type !== "negotiate_sell") {
        fiendsLeft--;
    }

    const outcomeResult = dialogueContextKey ? customerManager.getOutcomeDialogue(currentCustomerInstance, dialogueContextKey) : { line: '', payload: null };
    if (outcome.payload) { processPayload(outcome.payload, dealSuccess); }
    if (outcomeResult.payload) { processPayload(outcomeResult.payload, dealSuccess); }
    
    updateHUD();
    updateInventoryDisplay();

    if (narrationText.trim() !== "") {
        queueNextMessage(narrationText, 'narration', () => {
            if (outcomeResult.line && outcomeResult.line.trim() !== "") {
                queueNextMessage(outcomeResult.line, 'customer', () => {
                    setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
                });
            } else {
                setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
            }
        });
    } else if (outcomeResult.line && outcomeResult.line.trim() !== "") {
        queueNextMessage(outcomeResult.line, 'customer', () => {
            setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
        });
    } else {
        setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
    }

    if (heat >= MAX_HEAT) {
        endGame("heat");
        return;
    }
    if (cash <= 0 && inventory.length === 0 && fiendsLeft > 0) {
        endGame("bankrupt");
        return;
    }
}

function processPayload(payload, dealSuccess) {
    if (!payload || !payload.effects || payload.type !== "EFFECT") return;

    payload.effects.forEach(effect => {
        if (effect.condition) {
            if (effect.condition.stat === 'dealSuccess' && dealSuccess !== effect.condition.value) return;
            if (effect.condition.stat === 'mood') {
                const customerMood = currentCustomerInstance.mood;
                if (effect.condition.op === 'is' && customerMood !== effect.condition.value) return;
                if (effect.condition.op === 'isNot' && customerMood === effect.condition.value) return;
            }
        }

        switch (effect.type) {
            case 'modifyStat':
                break;
            case 'triggerEvent':
                if (Math.random() < effect.chance) {
                    let message = effect.message || '';
                    if (effect.eventName === 'snitchReport') {
                        const heatGain = Math.floor(Math.random() * (effect.heatValueMax - effect.heatValueMin + 1)) + effect.heatValueMin;
                        heat += heatGain;
                        streetCred += effect.credValue;
                        message = message.replace('[CUSTOMER_NAME]', currentCustomerInstance.name).replace('[HEAT_VALUE]', heatGain);
                    }
                    if (effect.eventName === 'highRollerTip') {
                        const tip = Math.floor(cash * effect.tipPercentage);
                        cash += tip;
                        streetCred += effect.credValue;
                        message = message.replace('[CUSTOMER_NAME]', currentCustomerInstance.name).replace('[TIP_AMOUNT]', tip);
                    }
                    if (effect.eventName === 'publicIncident') {
                        heat += effect.heatValue;
                        message = message.replace('[CUSTOMER_NAME]', currentCustomerInstance.name);
                    }
                    if (message) displaySystemMessage(message);
                }
                break;
            default:
                console.warn(`processPayload: Unknown effect type '${effect.type}'`);
                break;
        }
    });
}

// =================================================================================
// VI. DATA & UTILITY FUNCTIONS
// =================================================================================

function updateDayOfWeek() {
    const currentIndex = days.indexOf(dayOfWeek);
    dayOfWeek = days[(currentIndex + 1) % days.length];
}

function triggerWorldEvent() {
    if (activeWorldEvents.length > 0 && Math.random() < 0.7) return;
    activeWorldEvents = activeWorldEvents.filter(event => event.turnsLeft > 0);
    if (possibleWorldEvents.length > 0 && Math.random() < 0.25 && activeWorldEvents.length === 0) {
        const eventTemplate = getRandomElement(possibleWorldEvents);
        activeWorldEvents.push({ ...eventTemplate, turnsLeft: eventTemplate.duration });
    }
    updateEventTicker();
}

function advanceWorldEvents() { 
    activeWorldEvents.forEach(eventState => {
        eventState.turnsLeft--;
    });
    activeWorldEvents = activeWorldEvents.filter(eventState => eventState.turnsLeft > 0);
}

function updateEventTicker() { 
    if (activeWorldEvents.length > 0) {
        const currentEvent = activeWorldEvents[0];
        eventTicker.textContent = `Word on the street: ${currentEvent.name} (${currentEvent.turnsLeft} turns left)`;
    } else {
        eventTicker.textContent = `Word on the street: All quiet... for now. (${dayOfWeek})`;
    }
}

function clearChat() { 
    if(chatContainer) {
        chatContainer.innerHTML = ''; 
        chatSpacerElement = document.createElement('div');
        chatSpacerElement.className = 'chat-spacer';
        chatContainer.appendChild(chatSpacerElement);
    }
}

function clearChoices() {
    if(choicesArea) choicesArea.innerHTML = '';
}

function playSound(audioElement) {
    if (audioElement?.play) {
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.log(`Audio play failed: ${e.name}`));
    }
}

function saveGameState() {
    if (!gameActive && fiendsLeft > 0) return;
    const stateToSave = {
        cash, fiendsLeft, heat, streetCred, inventory, playerSkills, activeWorldEvents, dayOfWeek,
        customerManagerState: customerManager.getSaveState()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
}

function loadGameState() {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
        try {
            const loadedState = JSON.parse(savedData);
            cash = loadedState.cash ?? STARTING_CASH;
            fiendsLeft = loadedState.fiendsLeft ?? MAX_FIENDS;
            heat = loadedState.heat ?? 0;
            streetCred = loadedState.streetCred ?? STARTING_STREET_CRED;
            inventory = loadedState.inventory ?? [];
            playerSkills = loadedState.playerSkills ?? { negotiator: 0, appraiser: 0, lowProfile: 0 };
            activeWorldEvents = loadedState.activeWorldEvents ?? [];
            dayOfWeek = loadedState.dayOfWeek ?? days[0];
            customerManager.loadSaveState(loadedState.customerManagerState);
            updateEventTicker();
            return true;
        } catch (e) {
            clearSavedGameState();
            return false;
        }
    }
    return false;
}

function clearSavedGameState() {
    localStorage.removeItem(SAVE_KEY);
}

function checkForSavedGame() {
    if (localStorage.getItem(SAVE_KEY)) {
        continueGameBtn.classList.remove('hidden');
    } else {
        continueGameBtn.classList.add('hidden');
    }
}

// =================================================================================
// --- Preview Mode Helper Functions ---

function getCurrentSettingsFromInputs() {
    const settings = {};
    document.querySelectorAll('[data-variable]').forEach(input => {
        settings[input.dataset.variable] = input.value; // Store raw input value
    });
    return settings;
}

function applySettingsToDOMAndInputs(settingsToApply) {
    if (!settingsToApply) return;
    for (const variableName in settingsToApply) {
        if (settingsToApply.hasOwnProperty(variableName)) {
            const value = settingsToApply[variableName]; // Raw value, e.g., "12"
            const inputs = document.querySelectorAll(`[data-variable="${variableName}"]`);

            inputs.forEach(input => {
                input.value = value;
                if (input.type === 'range') {
                    const valueDisplaySpan = document.querySelector(`.value-display[data-target="${input.id}"]`);
                    if (valueDisplaySpan) valueDisplaySpan.textContent = value;
                }
            });
            applyStyleSetting(variableName, value); // Applies to CSS (new applyStyleSetting handles 'px')
        }
    }
}

function addCancelPreviewButton(panelId, referenceButtonId) {
    const settingsPanel = document.getElementById(panelId);
    const referenceButton = document.getElementById(referenceButtonId);
    // Ensure no duplicate cancel button for the same panel
    const existingCancelButtonId = `cancel-preview-${panelId.replace(/-/g, '')}`;
    if (document.getElementById(existingCancelButtonId)) {
        return;
    }

    if (settingsPanel && referenceButton) {
        const cancelButton = document.createElement('button');
        cancelButton.id = existingCancelButtonId;
        cancelButton.className = 'cancel-preview-button game-button secondary-action';
        cancelButton.textContent = 'Cancel Preview';
        cancelButton.type = 'button';
        cancelButton.addEventListener('click', cancelPreview); // cancelPreview function defined below

        if(referenceButton.nextSibling) {
            referenceButton.parentNode.insertBefore(cancelButton, referenceButton.nextSibling);
        } else {
            referenceButton.parentNode.appendChild(cancelButton);
        }
    }
}

function removeCancelPreviewButtons() {
    document.querySelectorAll('.cancel-preview-button').forEach(btn => btn.remove());
}

function togglePreviewMode() {
    isPreviewModeActive = !isPreviewModeActive;
    const appContainer = document.querySelector(APP_CONTAINER_SELECTOR);

    if (!appContainer && typeof phoneShowNotification === 'function') {
        phoneShowNotification("Error: App container not found.", "Settings Error");
        console.error("App container not found:", APP_CONTAINER_SELECTOR);
        isPreviewModeActive = false; // Revert state
        return;
    }

    const previewMainButton = document.getElementById('preview-style-settings');
    const previewPhoneButton = document.getElementById('preview-phone-style-settings');

    if (isPreviewModeActive) {
        originalSettingsBeforePreview = getCurrentSettingsFromInputs();
        if (appContainer) appContainer.classList.add('preview-mode');

        if (previewMainButton) previewMainButton.textContent = 'Apply & Exit Preview';
        addCancelPreviewButton('settings-menu-panel', 'preview-style-settings');

        if (previewPhoneButton) previewPhoneButton.textContent = 'Apply & Exit Preview';
        // Assuming phone settings view is separate, add cancel button there too
        addCancelPreviewButton('phone-theme-settings-view', 'preview-phone-style-settings');

        console.log('Preview Mode Activated.');
        if (typeof phoneShowNotification === 'function') phoneShowNotification("Preview Mode: Activated. Changes are not saved yet.", "Settings");
    } else { // Exiting Preview Mode (Applying changes)
        if (appContainer) appContainer.classList.remove('preview-mode');
        if (typeof saveStyleSettings === 'function') saveStyleSettings(); // Saves current state of inputs

        if (previewMainButton) previewMainButton.textContent = 'Preview';
        if (previewPhoneButton) previewPhoneButton.textContent = 'Preview';
        removeCancelPreviewButtons();
        console.log('Preview Mode Deactivated. Changes Applied.');
        if (typeof phoneShowNotification === 'function') phoneShowNotification("Preview settings applied and saved.", "Settings");
    }
}

function cancelPreview() {
    if (!isPreviewModeActive) return;

    applySettingsToDOMAndInputs(originalSettingsBeforePreview); // Revert inputs and CSS
    // No saveStyleSettings() call needed, as we reverted to last known saved state.

    isPreviewModeActive = false;
    const appContainer = document.querySelector(APP_CONTAINER_SELECTOR);
    if (appContainer) appContainer.classList.remove('preview-mode');

    const previewMainButton = document.getElementById('preview-style-settings');
    if (previewMainButton) previewMainButton.textContent = 'Preview';
    const previewPhoneButton = document.getElementById('preview-phone-style-settings');
    if (previewPhoneButton) previewPhoneButton.textContent = 'Preview';

    removeCancelPreviewButtons();
    console.log('Preview Mode Cancelled.');
    if (typeof phoneShowNotification === 'function') phoneShowNotification("Preview cancelled. Changes reverted.", "Settings");
}

// VII. SCRIPT ENTRY POINT
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
    initGame(); // Initialize the game and its UI elements

    // --- Preview Mode Button Event Listeners ---
    const previewMainSettingsButton = document.getElementById('preview-style-settings');
    const previewPhoneSettingsButton = document.getElementById('preview-phone-style-settings');

    if (previewMainSettingsButton) {
        previewMainSettingsButton.addEventListener('click', togglePreviewMode);
    } else {
        console.warn("Preview button for main settings (preview-style-settings) not found.");
    }

    if (previewPhoneSettingsButton) {
        previewPhoneSettingsButton.addEventListener('click', togglePreviewMode);
    } else {
        console.warn("Preview button for phone settings (preview-phone-style-settings) not found.");
    }

    // --- Initial hide for loading/error states ---
    const elSettingsLoading = document.querySelector('.settings-loading');
    const elSettingsError = document.querySelector('.settings-error');
    if (elSettingsLoading) elSettingsLoading.classList.add('hidden');
    if (elSettingsError) elSettingsError.classList.add('hidden');

    // --- 'Reset to Defaults' Functionality ---
    const resetMainSettingsButton = document.getElementById('reset-style-settings');
    const resetPhoneSettingsButton = document.getElementById('reset-phone-style-settings');

    // defaultStyleSettings, applyStyleSetting, saveStyleSettings are assumed to be available in this scope
    // as they are defined globally or within the script's top scope.

    function handleResetToDefaults() {
        if (typeof defaultStyleSettings === 'undefined') {
            console.error('Error: defaultStyleSettings object is not defined.');
            if (typeof phoneShowNotification === 'function') {
                phoneShowNotification("Error: Default settings not found.", "Settings Error");
            }
            return;
        }

        console.log('Resetting styles to defaults...');

        // First, update all relevant input controls to their default values
        // and apply the visual style to the document.
        for (const variableName in defaultStyleSettings) {
            if (defaultStyleSettings.hasOwnProperty(variableName)) {
                const defaultValue = defaultStyleSettings[variableName];

                // Update input controls
                const inputsToUpdate = document.querySelectorAll(`[data-variable="${variableName}"]`);
                inputsToUpdate.forEach(input => {
                    input.value = defaultValue;
                    // Special handling for range input display values
                    if (input.type === 'range') {
                        const valueDisplaySpan = document.querySelector(`.value-display[data-target="${input.id}"]`);
                        if (valueDisplaySpan) {
                             // Ensure defaultValue for ranges is the numeric part if 'px' is appended for CSS
                            valueDisplaySpan.textContent = defaultValue;
                        }
                    }
                });

                // Apply the style to the document element
                let valueToApply = defaultValue;
                // Check if the variable is for a range slider that needs 'px'
                const controlForVar = document.querySelector(`[data-variable="${variableName}"]`);
                if (controlForVar && controlForVar.type === 'range' &&
                    (variableName.includes('radius') || variableName.includes('unit') || variableName.includes('spacing'))) {
                    valueToApply += 'px';
                }
                document.documentElement.style.setProperty(variableName, valueToApply);
            }
        }

        // After all inputs are set to their default values and styles are visually applied,
        // call saveStyleSettings() once to persist this entire default state.
        if (typeof saveStyleSettings === 'function') {
            saveStyleSettings(); // This function reads from all inputs and saves.
            console.log('Default styles applied and saved to localStorage.');
            if (typeof phoneShowNotification === 'function') {
                phoneShowNotification("Styles have been reset to defaults.", "Settings");
            }
        } else {
            console.error('Error: saveStyleSettings function is not defined. Cannot persist reset settings.');
            if (typeof phoneShowNotification === 'function') {
                phoneShowNotification("Error saving reset settings.", "Settings Error");
            }
        }
    }

    if (resetMainSettingsButton) {
        resetMainSettingsButton.addEventListener('click', handleResetToDefaults);
    } else {
        console.warn("Reset button for main settings (reset-style-settings) not found.");
    }

    if (resetPhoneSettingsButton) {
        // Assuming both buttons trigger a global reset to the defined defaults.
        // If phone settings had a separate default object or subset, this would need adjustment.
        resetPhoneSettingsButton.addEventListener('click', handleResetToDefaults);
    } else {
        console.warn("Reset button for phone settings (reset-phone-style-settings) not found.");
    }
});