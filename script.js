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

function applyStyleSetting(variableName, value) {
    if (variableName && typeof value !== 'undefined') {
        document.documentElement.style.setProperty(variableName, value);
        saveStyleSettings(); // Call save after applying a style
    }
}

function saveStyleSettings() {
    const settingsToSave = {};
    // Query all controls with data-variable, regardless of their parent panel
    const styleControls = document.querySelectorAll('[data-variable]');

    styleControls.forEach(control => {
        const cssVariable = control.dataset.variable;
        settingsToSave[cssVariable] = control.value; // Store the raw control value
    });

    try {
        localStorage.setItem(STYLE_SETTINGS_KEY, JSON.stringify(settingsToSave));
    } catch (e) {
        console.error("Failed to save style settings:", e);
    }
}

function loadStyleSettings() {
    let appliedSettings = {}; // To keep track of what's been set by localStorage

    try {
        const savedSettingsString = localStorage.getItem(STYLE_SETTINGS_KEY);
        if (savedSettingsString) {
            const savedSettings = JSON.parse(savedSettingsString);
            appliedSettings = { ...savedSettings }; // Copy saved settings

            // Apply saved settings and update controls
            // Query all controls with data-variable, regardless of their parent panel
            const styleControls = document.querySelectorAll('[data-variable]');
            styleControls.forEach(control => {
                const cssVariable = control.dataset.variable;
                if (savedSettings.hasOwnProperty(cssVariable)) {
                    const savedValue = savedSettings[cssVariable];
                    control.value = savedValue; // Update control to saved value

                    let valueToApply = savedValue;
                    let displayValue = savedValue;

                    if (control.type === 'range') {
                        if (cssVariable.includes('radius') || cssVariable.includes('unit') || cssVariable.includes('spacing')) {
                            valueToApply += 'px';
                        }
                        const valueDisplaySpan = document.querySelector(`.value-display[data-target="${control.id}"]`);
                        if (valueDisplaySpan) {
                            valueDisplaySpan.textContent = displayValue;
                        }
                    }
                    document.documentElement.style.setProperty(cssVariable, valueToApply);
                }
            });
             console.log("Loaded style settings from localStorage.");
        } else {
            // No saved settings found, will proceed to apply all defaults.
            console.log("No saved style settings found. Applying default styles.");
        }
    } catch (e) {
        console.error("Failed to load style settings from localStorage, applying defaults:", e);
        localStorage.removeItem(STYLE_SETTINGS_KEY); // Clear potentially corrupted settings
        // appliedSettings will be empty, so all defaults will be applied below.
    }

    // Apply any defaults that weren't in localStorage (new settings or if localStorage was empty/corrupted)
    // And also ensure controls are set to these defaults if nothing was loaded for them.
    // Query all controls with data-variable, regardless of their parent panel
    const styleControls = document.querySelectorAll('[data-variable]');
    let defaultsApplied = false;

    Object.keys(defaultStyleSettings).forEach(cssVariable => {
        const defaultValue = defaultStyleSettings[cssVariable];
        let valueToApply = defaultValue; // This is the raw value for setProperty if not a range
        let controlValue = defaultValue;  // This is the value for the control input

        // Find the control associated with this default CSS variable
        // Query all controls with data-variable, regardless of their parent panel
        const control = document.querySelector(`[data-variable="${cssVariable}"]`);

        if (!appliedSettings.hasOwnProperty(cssVariable)) {
            // This default was not in localStorage, so apply it
            defaultsApplied = true;

            if (control && control.type === 'range') {
                if (cssVariable.includes('radius') || cssVariable.includes('unit') || cssVariable.includes('spacing')) {
                    valueToApply += 'px'; // Add 'px' for applying the style
                }
            }
            document.documentElement.style.setProperty(cssVariable, valueToApply);

            // If a control exists for this default, update its value
            if (control) {
                control.value = controlValue;
            }
        }

        // Always ensure display spans for range inputs are updated,
        // either to loaded value (already done above) or to default value now.
        if (control && control.type === 'range') {
            const valueDisplaySpan = document.querySelector(`.value-display[data-target="${control.id}"]`);
            if (valueDisplaySpan) {
                // If it was loaded from appliedSettings, it's already set.
                // Otherwise, set it to the default controlValue (which is numeric string).
                if (!appliedSettings.hasOwnProperty(cssVariable)) {
                     valueDisplaySpan.textContent = controlValue;
                }
            }
        }
    });

    if (defaultsApplied && !localStorage.getItem(STYLE_SETTINGS_KEY)) {
        // If we applied defaults because localStorage was empty or cleared due to error,
        // save these newly applied defaults back to localStorage.
        // This avoids re-applying defaults every time if user never saves.
        // It calls the *global* saveStyleSettings which reads from controls.
        // Since we just updated controls with defaults, this is correct.
        console.log("Saving initial default styles to localStorage.");
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
            let value = event.target.value;
            if (control.type === 'range') {
                // Append 'px' for dimension variables that need it (like radii, spacing unit)
                // Check if the variable name implies it's a pixel dimension
                if (cssVariable.includes('radius') || cssVariable.includes('unit') || cssVariable.includes('spacing')) {
                    value += 'px';
                }
                // Update the associated span.value-display for range inputs
                const valueDisplay = document.querySelector(`.value-display[data-target="${control.id}"]`);
                if (valueDisplay) {
                    valueDisplay.textContent = event.target.value; // Show numeric value before 'px'
                }
            }
            applyStyleSetting(cssVariable, value);
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
// VII. SCRIPT ENTRY POINT
// =================================================================================

document.addEventListener('DOMContentLoaded', initGame);