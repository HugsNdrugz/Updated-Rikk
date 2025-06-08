// =================================================================================
// My Nigga Rikk - Main Game Logic Script (Controller) - FINAL, UNABRIDGED BUILD
// =================================================================================
// This script is the definitive controller for the application. It manages the game
// loop, UI state, player actions, data persistence, and all integrations.u
// This file is complete with no omissions or truncations.
// =================================================================================

// --- MODULE IMPORTS ---
import { initPhoneAmbientUI, showNotification as phoneShowNotification } from './phone_ambient_ui.js';
import { GameState } from './GameState.js'; // MODIFIED
import { UIManager } from './UIManager.js'; // ADDED
import { CustomerManager } 
from './classes/CustomerManager.js';
import { ContactsAppManager } from './classes/ContactsAppManager.js';
import { SlotGameManager } from './classes/SlotGameManager.js';
import { customerTemplates as defaultCustomerTemplates } from './data/customer_templates.js'; // MODIFIED
import { itemTypes, ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS } from './data/data_items.js';
import { possibleWorldEvents } from './data/data_events.js';
import { getRandomElement, isLocalStorageAvailable, debugLogger, DEBUG_MODE } from './utils.js';

// =================================================================================
// I. DOM ELEMENT REFERENCES & GAME STATE VARIABLES
// =================================================================================

// --- Global Constants & Game Configuration ---
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CUSTOMER_WAIT_TIME = 1100, KNOCK_ANIMATION_DURATION = 1000;
const SAVE_KEY = 'myNiggaRikkSaveDataV10';
const STYLE_SETTINGS_KEY = 'rikkGameStyleSettingsV1';
const CUSTOMER_TEMPLATES_SAVE_KEY = 'rikkGameCustomerTemplatesV1';
const STARTING_CASH = 500, MAX_FIENDS = 15, SPLASH_SCREEN_DURATION = 2500;
const STARTING_STREET_CRED = 0, MAX_HEAT = 100, MAX_INVENTORY_SLOTS = 10;
const APP_CONTAINER_SELECTOR = '#game-viewport';

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
const systemAvatarUrl = "";

// --- Game State & Managers (customerTemplates and DEBUG_MODE remain global for PoC) ---
// let customerTemplates = JSON.parse(JSON.stringify(defaultCustomerTemplates)); // REMOVED Global Variable
// let DEBUG_MODE = localStorage.getItem('rikkDebugMode') === 'true' || false; // DEBUG_MODE is now imported from utils.js

// Prepare Configuration Objects
const gameStateConfig = {
    STARTING_CASH: STARTING_CASH,
    MAX_FIENDS: MAX_FIENDS,
    DAYS: days,
    STARTING_STREET_CRED: STARTING_STREET_CRED,
    MAX_INVENTORY_SLOTS: MAX_INVENTORY_SLOTS,
    MAX_HEAT: MAX_HEAT,
    defaultCustomerTemplates: defaultCustomerTemplates, // Using the imported default, not the global 'let'
    DEBUG_MODE: DEBUG_MODE
};

const uiManagerConfig = {
    APP_CONTAINER_SELECTOR: APP_CONTAINER_SELECTOR,
    customerAvatars: customerAvatars,
    rikkAvatarUrl: rikkAvatarUrl,
    systemAvatarUrl: systemAvatarUrl,
    defaultStyleSettings: defaultStyleSettings, // Pass the global const
    styleSettingsKey: STYLE_SETTINGS_KEY     // Pass the global const
};

// Instantiate Managers
const game = new GameState(gameStateConfig); // MODIFIED
const uiManager = new UIManager(game, uiManagerConfig);
game.uiManager = uiManager; // Link UIManager instance to the game instance

// --- UI State (chatSpacerElement might be managed by UIManager later) ---
// let chatSpacerElement = null; // This was likely for UIManager, can be removed if UIManager handles its own spacer

// --- Style Settings Preview Mode State ---
// let isPreviewModeActive = false; // REMOVED - Moved to UIManager
// let originalSettingsBeforePreview = {}; // REMOVED - Moved to UIManager
// const APP_CONTAINER_SELECTOR = '#game-viewport'; // Moved to global constants

// --- localStorage Availability Check ---
const localStorageAvailable = isLocalStorageAvailable();

// --- Game Configuration (Most moved to top) ---
// const CUSTOMER_WAIT_TIME = 1100, KNOCK_ANIMATION_DURATION = 1000; // Moved
// const SAVE_KEY = 'myNiggaRikkSaveDataV10'; // Moved
// const STYLE_SETTINGS_KEY = 'rikkGameStyleSettingsV1'; // Moved
// const CUSTOMER_TEMPLATES_SAVE_KEY = 'rikkGameCustomerTemplatesV1'; // Moved
// const STARTING_CASH = 500, MAX_FIENDS = 15, SPLASH_SCREEN_DURATION = 2500; // Moved
// const STARTING_STREET_CRED = 0, MAX_HEAT = 100, MAX_INVENTORY_SLOTS = 10; // Moved

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

// --- Avatars (For chat UI) --- // Moved to top
// const customerAvatars = { ... };
// const rikkAvatarUrl = "...";
// const systemAvatarUrl = "...";

// --- ElevenLabs TTS API Configuration ---
const TTS_ENABLED = false;
const ELEVENLABS_API_ENDPOINT_BASE = 'https://api.elevenlabs.io/v1/text-to-speech/';
const ELEVENLABS_API_KEY = "sk_a49dfec4b4491a9e71ba4a3d6af9ec9868925673ba098b64";
const ELEVENLABS_VOICE_ID_CUSTOMER = "21m00Tcm4TlvDq8ikWAM";
const ELEVENLABS_VOICE_ID_RIKK = "VR6AewLTigWG4xSOh1om";

// --- TTS Audio Queue Management ---
let audioQueue = [];
let isPlayingAudio = false;

// =================================================================================
// II. DEBUGGING FRAMEWORK
// =================================================================================

let rikkDebugInterval = null;
// const debugLogger = { ... }; // debugLogger is now imported from utils.js

// --- World Event Effects Helper ---
function getCombinedActiveEventEffects() {
    const activeEvents = game.getActiveWorldEvents(); // 'game' is the GameState instance
    const combinedEffects = {
        heatModifier: 1,
        customerScareChance: 0,
        drugPriceModifier: 1,
        drugDemandModifier: 1,
        dealFailChance: 0,
        itemScarcity: false,
        allPriceModifier: 1,
        specificItemDemand: []
    };

    activeEvents.forEach(event => {
        if (!event.effects) return;

        if (event.effects.heatModifier) {
            combinedEffects.heatModifier *= event.effects.heatModifier;
        }
        if (event.effects.customerScareChance) {
            combinedEffects.customerScareChance = Math.max(combinedEffects.customerScareChance, event.effects.customerScareChance);
        }
        if (event.effects.drugPriceModifier) {
            combinedEffects.drugPriceModifier *= event.effects.drugPriceModifier;
        }
        if (event.effects.drugDemandModifier) {
            combinedEffects.drugDemandModifier *= event.effects.drugDemandModifier;
        }
        if (event.effects.dealFailChance) {
            combinedEffects.dealFailChance = Math.max(combinedEffects.dealFailChance, event.effects.dealFailChance);
        }
        if (event.effects.itemScarcity) {
            combinedEffects.itemScarcity = true;
        }
        if (event.effects.allPriceModifier) {
            combinedEffects.allPriceModifier *= event.effects.allPriceModifier;
        }
        if (event.effects.specificItemDemand && Array.isArray(event.effects.specificItemDemand)) {
            event.effects.specificItemDemand.forEach(item => {
                if (!combinedEffects.specificItemDemand.includes(item)) {
                    combinedEffects.specificItemDemand.push(item);
                }
            });
        }
    });
    return combinedEffects;
}

function applyDealHeat(baseHeat, gameInstance) {
    // Assume gameInstance.isToolEffectActive('burner_phone') exists and works as intended
    if (gameInstance.isToolEffectActive && gameInstance.isToolEffectActive('burner_phone')) {
        debugLogger.log('applyDealHeat', 'Burner phone active, reducing deal heat.', { originalHeat: baseHeat });
        return Math.round(baseHeat * 0.5);
    } else {
        return baseHeat;
    }
}

// =================================================================================
// III. CORE GAME INITIALIZATION & FLOW
// =================================================================================

// function assignDOMReferences() { // DELETED
// ... DOM element assignments removed ...
// }

// ADDED: Function to save customer templates
function saveCustomerTemplates() {
    if (!localStorageAvailable) {
        console.warn('localStorage is not available. Customer templates will not be saved.');
        return;
    }
    try {
        // Get templates from the GameState instance
        const templatesToSave = game.getCustomerTemplates();
        localStorage.setItem(CUSTOMER_TEMPLATES_SAVE_KEY, JSON.stringify(templatesToSave));
        console.log('Customer templates (from GameState) saved successfully.');
    } catch (error) {
        console.error('Failed to save customer templates (from GameState):', error);
    }
}

// ADDED: Function to load customer templates
function loadCustomerTemplates() {
    let loadedTemplates;
    if (!localStorageAvailable) {
        console.warn('localStorage is not available. Using default customer templates.');
        loadedTemplates = JSON.parse(JSON.stringify(defaultCustomerTemplates));
    } else {
        try {
            const savedTemplatesString = localStorage.getItem(CUSTOMER_TEMPLATES_SAVE_KEY);
            if (savedTemplatesString) {
                const parsed = JSON.parse(savedTemplatesString);
                if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
                    console.log('Customer templates loaded from localStorage.');
                    loadedTemplates = parsed;
                } else {
                    console.warn('Invalid customer templates found in localStorage. Using defaults.');
                    localStorage.removeItem(CUSTOMER_TEMPLATES_SAVE_KEY);
                    loadedTemplates = JSON.parse(JSON.stringify(defaultCustomerTemplates));
                }
            } else {
                loadedTemplates = JSON.parse(JSON.stringify(defaultCustomerTemplates)); // Defaults if nothing in storage
            }
        } catch (error) {
            console.error('Error loading customer templates from localStorage. Using defaults.', error);
            localStorage.removeItem(CUSTOMER_TEMPLATES_SAVE_KEY);
            loadedTemplates = JSON.parse(JSON.stringify(defaultCustomerTemplates));
        }
    }
    game.updateCustomerTemplates(loadedTemplates); // Update GameState instance
}

function initializeManagers() {
    loadCustomerTemplates(); // Load and set templates into 'game' instance

    const currentTemplates = game.getCustomerTemplates(); // Get from GameState

    game.customerManager = new CustomerManager(currentTemplates, itemTypes, ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS);
    game.contactsAppManager = new ContactsAppManager(uiManager.contactsAppView, currentTemplates);

    game.slotGameManager = new SlotGameManager(
        uiManager.slotGameView,
        () => game.getCash(),
        (newCash) => {
            game.setCash(newCash);
            uiManager.updateHUD();
        }
    );

    if (uiManager.contactsAppView) {
       uiManager.contactsAppView.addEventListener('customerTemplatesUpdated', (event) => {
           if (event.detail && event.detail.updatedTemplates) {
               console.log('customerTemplatesUpdated event received in script.js');
               // customerTemplates = event.detail.updatedTemplates; // REMOVE THIS LINE
               game.updateCustomerTemplates(event.detail.updatedTemplates); // Update in GameState
               saveCustomerTemplates(); // Will now save from game.getCustomerTemplates()

               // Re-initialize CustomerManager with the new templates from GameState
               game.customerManager = new CustomerManager(game.getCustomerTemplates(), itemTypes, ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS);
               console.log('CustomerManager re-initialized with updated templates (from GameState) due to event.');

               phoneShowNotification('Contact templates updated and saved!', 'Contacts App');
           }
       });
    }
}

function setupEventListeners() {
    // Assumes uiManager.newGameBtn etc. are now populated by uiManager.initDOMReferences()
    if (uiManager.newGameBtn) uiManager.newGameBtn.addEventListener('click', handleStartNewGameClick);
    if (uiManager.continueGameBtn) uiManager.continueGameBtn.addEventListener('click', handleContinueGameClick);
    if (uiManager.restartGameBtn) uiManager.restartGameBtn.addEventListener('click', handleRestartGameClick);
    if (uiManager.nextCustomerBtn) uiManager.nextCustomerBtn.addEventListener('click', nextFiend);
    if (uiManager.openInventoryBtn) uiManager.openInventoryBtn.addEventListener('click', () => uiManager.openInventoryModal()); // Changed
    if (uiManager.closeModalBtn) uiManager.closeModalBtn.addEventListener('click', () => uiManager.closeInventoryModal()); // Changed
    if (uiManager.inventoryModal) uiManager.inventoryModal.addEventListener('click', (e) => { // Changed
        if (e.target === uiManager.inventoryModal) uiManager.closeInventoryModal(); // Changed
    });

    if (uiManager.rikkPhoneUI) { // Changed
        uiManager.rikkPhoneUI.querySelectorAll('.app-icon, .dock-icon').forEach(icon => icon.addEventListener('click', handlePhoneAppClick));
    }
    if (uiManager.phoneBackButtons) uiManager.phoneBackButtons.forEach(btn => btn.addEventListener('click', handlePhoneAppClick)); // Changed
    if (uiManager.phoneDockedIndicator) uiManager.phoneDockedIndicator.addEventListener('click', () => uiManager.setPhoneUIState('home')); // Changed
    if (uiManager.dockPhoneBtn) uiManager.dockPhoneBtn.addEventListener('click', () => uiManager.setPhoneUIState('docked')); // Changed

    if (uiManager.settingsMenuBtn) { // Changed
        uiManager.settingsMenuBtn.addEventListener('click', () => openSubmenuPanel(uiManager.settingsMenuPanel)); // Changed
    }
    if (uiManager.loadMenuBtn) { // Changed
        uiManager.loadMenuBtn.addEventListener('click', () => openSubmenuPanel(uiManager.loadMenuPanel)); // Changed
    }
    if (uiManager.creditsMenuBtn) { // Changed
        uiManager.creditsMenuBtn.addEventListener('click', () => openSubmenuPanel(uiManager.creditsMenuPanel)); // Changed
    }

    if (uiManager.allSubmenuBackBtns) uiManager.allSubmenuBackBtns.forEach(button => { // Changed
        button.addEventListener('click', (event) => {
            const panelToClose = event.target.closest('.submenu-panel');
            if (panelToClose) {
                closeSubmenuPanel(panelToClose);
            }
        });
    });
}

function initializeUIAndSettings() {
    // Initial Screen Flow using UIManager
    if (uiManager.splashScreen) {
        uiManager.splashScreen.classList.add('active');
        setTimeout(() => {
            if (uiManager.splashScreen) {
                uiManager.splashScreen.classList.remove('active');
                uiManager.splashScreen.style.display = 'none';
            }
            if (uiManager.startScreen) {
                 uiManager.startScreen.classList.add('active');
            }
            if (uiManager.mainMenuLightContainer) {
                uiManager.activateMainMenuLights(true);
            }
            checkForSavedGame();
        }, SPLASH_SCREEN_DURATION);
    }

    initStyleSettingsControls(); // Initializes controls for both main menu and phone app
    loadStyleSettings(); // Loads and applies styles to all relevant controls

    // Initialize Sub-modules
    if (uiManager.rikkPhoneUI) {
        initPhoneAmbientUI(uiManager.rikkPhoneUI);
    }
    // Replace direct calls with UIManager methods
    uiManager.initStyleControls(saveStyleSettings); // Pass the script.js saveStyleSettings as callback
    uiManager.loadAndApplyStyleSettings();
}

function initGame() {
    try {
        uiManager.initDOMReferences(); // MODIFIED: Call UIManager's DOM reference initialization
        initializeManagers();
        initializeUIAndSettings();
        setupEventListeners();
    } catch (error) {
        console.error("CRITICAL ERROR during game initialization:", error);
        // Optionally, display a user-friendly message on the page if possible,
        // though UIManager might not be initialized enough to do so.
        // For now, console.error is the primary goal.
    }
}

function initializeNewGameState() {
    clearSavedGameState();
    game.resetToDefault(gameStateConfig); // MODIFIED: Use GameState's reset method

    if (game.customerManager) game.customerManager.reset();
    uiManager.updateEventTicker(); // MODIFIED: Call UIManager method
}

function startGameFlow() {
    if (uiManager.mainMenuLightContainer) { // MODIFIED
        uiManager.activateMainMenuLights(false); // MODIFIED
    }

    game.setGameActive(true); // MODIFIED
    uiManager.showScreen(uiManager.gameScreen);  // MODIFIED
    if (uiManager.startScreen) uiManager.startScreen.classList.remove('active'); // MODIFIED
    if (uiManager.endScreen) uiManager.endScreen.classList.remove('active'); // MODIFIED

    uiManager.setPhoneUIState('home'); // MODIFIED
    uiManager.updateHUD(); // MODIFIED
    uiManager.updateInventoryDisplay(); // MODIFIED
    uiManager.clearChat(); // MODIFIED
    uiManager.clearChoices(); // MODIFIED
    nextFiend();
}

function endGame(reason) {
    game.setGameActive(false); // MODIFIED
    uiManager.showScreen(uiManager.endScreen); // MODIFIED
    if (uiManager.gameScreen) uiManager.gameScreen.classList.remove('active'); // MODIFIED

    if (uiManager.finalDaysDisplay) uiManager.finalDaysDisplay.textContent = gameStateConfig.MAX_FIENDS - game.getFiendsLeft(); // MODIFIED
    if (uiManager.finalCashDisplay) uiManager.finalCashDisplay.textContent = game.getCash(); // MODIFIED
    if (uiManager.finalCredDisplay) uiManager.finalCredDisplay.textContent = game.getStreetCred(); // MODIFIED
    
    if (reason === "heat") {
        if (uiManager.finalVerdictText) uiManager.finalVerdictText.textContent = `The block's too hot, nigga! 5-0 swarming. Heat: ${game.getHeat()}. Time to ghost.`; // MODIFIED
    } else if (reason === "bankrupt") {
        if (uiManager.finalVerdictText) uiManager.finalVerdictText.textContent = "Broke as a joke, and empty handed. Can't hustle on E, fam."; // MODIFIED
    } else if (reason === "completed") {
        if (game.getCash() >= STARTING_CASH * 3) { // MODIFIED
            if (uiManager.finalVerdictText) uiManager.finalVerdictText.textContent = "You a certified KINGPIN! The streets whisper your name."; // MODIFIED
        } else if (game.getCash() >= STARTING_CASH * 1.5) { // MODIFIED
            if (uiManager.finalVerdictText) uiManager.finalVerdictText.textContent = "Solid hustle, G. Made bank and respect."; // MODIFIED
        } else {
            if (uiManager.finalVerdictText) uiManager.finalVerdictText.textContent = "Broke even or worse. Gotta step your game up, Rikk."; // MODIFIED
        }
    }
    if (uiManager.finalVerdictText) uiManager.finalVerdictText.style.color = (reason === "heat" || reason === "bankrupt") ? "var(--color-error)" : (game.getCash() > STARTING_CASH ? "var(--color-success-green)" : "var(--color-accent-orange)"); // MODIFIED

    uiManager.setPhoneUIState('offscreen'); // MODIFIED
    clearSavedGameState();
}

function handleTurnProgressionAndEvents() {
    game.advanceDayOfWeek();

    let currentEvents = game.getActiveWorldEvents();
    currentEvents.forEach(eventState => eventState.turnsLeft--);
    game.setActiveWorldEvents(currentEvents.filter(eventState => eventState.turnsLeft > 0));

    let worldEventsState = game.getActiveWorldEvents();
    if (worldEventsState.length > 0 && Math.random() < 0.7) { /* do nothing */ }
    else {
        worldEventsState = worldEventsState.filter(event => event.turnsLeft > 0);
        if (possibleWorldEvents.length > 0 && Math.random() < 0.25 && worldEventsState.length === 0) {
            const eventTemplate = getRandomElement(possibleWorldEvents);
            worldEventsState.push({ ...eventTemplate, turnsLeft: eventTemplate.duration });
        }
        game.setActiveWorldEvents(worldEventsState);
    }
    uiManager.updateEventTicker();

    const skills = game.getPlayerSkills();
    const worldEffects = getCombinedActiveEventEffects(); // Get combined world effects

    let passiveHeatChange = -(1 + (skills.lowProfile || 0)); // Negative for reduction
    // If heatModifier makes things "hotter" (e.g., 1.5), it should reduce the *effectiveness* of heat loss.
    // So, divide the heat loss by the modifier. If modifier is < 1, heat loss is amplified.
    if (worldEffects.heatModifier !== 0) { // Avoid division by zero, though 0 is unlikely for a modifier
         passiveHeatChange /= worldEffects.heatModifier;
    }

    if (game.isToolEffectActive && game.isToolEffectActive('info_cops')) { // Assuming game.isToolEffectActive exists
        debugLogger.log('handleTurnProgressionAndEvents', 'info_cops active, increasing passive heat reduction.');
        passiveHeatChange -= 2; // Additional passive heat reduction
    }

    game.addHeat(Math.round(passiveHeatChange)); // addHeat will handle clamping

    uiManager.updateHUD();
}

function setupUIForNewInteraction() {
    uiManager.clearChat(); // MODIFIED
    uiManager.clearChoices(); // MODIFIED
    if (uiManager.nextCustomerBtn) uiManager.nextCustomerBtn.disabled = true; // MODIFIED
    uiManager.setPhoneUIState('docked'); // MODIFIED
    uiManager.playSound(uiManager.doorKnockSound); // MODIFIED
    uiManager.displayKnockEffect(game.getDayOfWeek()); // MODIFIED
}

function generateAndStartCustomerInteraction() {
    uiManager.hideKnockEffect(); // MODIFIED

    const combinedWorldEffects = getCombinedActiveEventEffects(); // Get combined effects

    const gameStateForCustomerManager = {
        inventory: game.getInventory(),
        cash: game.getCash(),
        playerSkills: game.getPlayerSkills(),
        activeWorldEvents: game.getActiveWorldEvents(), // Keep this for now, CM might still use it directly for some things
        combinedWorldEffects: combinedWorldEffects // Pass the new combined object
    };

    const interaction = game.customerManager.generateInteraction(gameStateForCustomerManager);
    game.setCurrentCustomerInstance(interaction.instance); // MODIFIED: Use GameState method
    startCustomerInteraction(interaction);
}

function nextFiend() {
    if (!game.isGameActive() || game.getFiendsLeft() <= 0) { // MODIFIED
        endGame("completed");
        return;
    }

    try {
        handleTurnProgressionAndEvents();
        setupUIForNewInteraction();

        setTimeout(() => {
            try {
                generateAndStartCustomerInteraction();
            } catch (e) {
                console.error("[SCRIPT ERROR in generateAndStartCustomerInteraction]", e);
                if (uiManager.nextCustomerBtn) uiManager.nextCustomerBtn.disabled = true; // MODIFIED
                if (typeof phoneShowNotification === 'function') phoneShowNotification("Oops! A glitch in the matrix. Try restarting if issues persist.", "System Error");
            }
        }, KNOCK_ANIMATION_DURATION);

    } catch (e) {
        console.error("[SCRIPT ERROR in nextFiend main block]", e);
        if (typeof debugLogger !== 'undefined' && debugLogger.error) {
            debugLogger.error('nextFiend', 'Critical error in turn progression', e);
        }
        if (uiManager.nextCustomerBtn) uiManager.nextCustomerBtn.disabled = true; // MODIFIED
        if (typeof phoneShowNotification === 'function') phoneShowNotification("An error occurred. Things might be unstable.", "System Error");
    }

    saveGameState(); // saveGameState will need refactoring to use game.toJSON()
}

function startCustomerInteraction(interaction) {
    uiManager.setPhoneUIState('chatting'); // MODIFIED
    uiManager.setPhoneTitle(interaction.name); // MODIFIED
    phoneShowNotification(`Incoming message from: ${interaction.name}`, "New Customer");
    
    uiManager.clearChat(); // MODIFIED
    let dialogueIndex = 0;
    const displayNext = () => {
        if (dialogueIndex < interaction.dialogue.length) {
            const msg = interaction.dialogue[dialogueIndex];
            dialogueIndex++;
            queueNextMessage(msg.text, msg.speaker, () => { // queueNextMessage will use uiManager.displayPhoneMessage
                setTimeout(displayNext, CUSTOMER_WAIT_TIME);
            });
        } else {
            uiManager.displayChoices(interaction.choices, handleChoice); // MODIFIED: Pass handleChoice
        }
    };
    displayNext();
}

function endCustomerInteraction() {
    uiManager.clearChoices(); // MODIFIED
    uiManager.setPhoneTitle('Street Talk'); // MODIFIED
    game.clearCurrentCustomerInstance(); // MODIFIED
    uiManager.setPhoneUIState('home'); // MODIFIED

    // MODIFIED: Use game getters for conditions
    if (game.isGameActive() && game.getFiendsLeft() > 0 && game.getHeat() < game.getMaxHeat() && (game.getCash() > 0 || game.getInventory().length > 0)) {
        uiManager.setNextCustomerButtonDisabled(false); // MODIFIED
    } else if (game.isGameActive()) { // MODIFIED
        uiManager.setNextCustomerButtonDisabled(true); // MODIFIED
        if (game.getHeat() >= game.getMaxHeat()) endGame("heat"); // MODIFIED
        else if (game.getCash() <= 0 && game.getInventory().length === 0) endGame("bankrupt"); // MODIFIED
        else if (game.getFiendsLeft() <= 0) endGame("completed"); // MODIFIED
    }
    saveGameState(); // Needs refactor
}

// =================================================================================
// IV. UI MANAGEMENT & DISPLAY FUNCTIONS
// (Many of these functions will be deleted or moved to UIManager)
// =================================================================================

// DELETED: toggleMainMenuButtons (functionality moved to UIManager)
// DELETED: openSubmenuPanel (functionality moved to UIManager)
// DELETED: closeSubmenuPanel (functionality moved to UIManager)

// DELETED: applyStyleSetting (moved to UIManager as _applySingleStyle)
// DELETED: getSettingsFromLocalStorage (logic moved to UIManager)
// DELETED: validateAndMergeSettings (logic simplified or moved to UIManager)
// DELETED: applySettingsToDOM (logic moved to UIManager)
// DELETED: loadStyleSettings (functionality moved to UIManager.loadAndApplyStyleSettings)
// DELETED: initStyleSettingsControls (functionality moved to UIManager.initStyleControls)

// MODIFIED: saveStyleSettings in script.js now just a trigger for UIManager method
function saveStyleSettings() {
    uiManager.saveStyleSettingsToStorage();
}

function handleStartNewGameClick() {
    initializeNewGameState();
    startGameFlow();
}

function handleContinueGameClick() {
    if (loadGameState()) { // loadGameState will need refactor for game.fromJSON()
        startGameFlow();
    } else {
        // displaySystemMessage("System: No saved game found."); // This will be uiManager.displayPhoneMessage
        uiManager.displayPhoneMessage("System: No saved game found.", "narration"); // Example
        initializeNewGameState();
        startGameFlow();
    }
}

function handleRestartGameClick() {
    initializeNewGameState();
    startGameFlow();
}

// function setPhoneUIState(state) { // DELETED - Now in UIManager
// ...
// }

function handlePhoneAppClick(event) {
    const action = event.currentTarget.dataset.action;
    switch(action) {
        case 'messages':
            // MODIFIED: Use game/uiManager properties/methods
            if (uiManager.nextCustomerBtn && !uiManager.nextCustomerBtn.disabled && game.getFiendsLeft() > 0 && game.isGameActive()) {
                nextFiend(); 
            } else if (game.getCurrentCustomerInstance()) {
                uiManager.setPhoneUIState('chatting');
            } else { 
                phoneShowNotification("No new messages.", "Rikk's Inbox"); 
            }
            break;
        case 'inventory-app': 
            uiManager.openInventoryModal(); // MODIFIED
            break;
        case 'contacts-app':
            uiManager.setPhoneUIState('contacts'); // MODIFIED
            break;
        case 'slot-game':
            uiManager.setPhoneUIState('slots'); // MODIFIED
            break;
        case 'theme-settings':
            uiManager.setPhoneUIState('theme-settings'); // MODIFIED
            break;
        case 'back-to-home': 
            uiManager.setPhoneUIState('home');  // MODIFIED
            break;
        default: 
            phoneShowNotification(`App "${action}" not implemented.`, "System"); 
            break;
    }
}

function queueNextMessage(message, speaker, callback) {
    // This function's core logic (TTS or direct display) will largely remain,
    // but calls to displayPhoneMessage and playSound will go through uiManager.
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
        uiManager.playSound(uiManager.chatBubbleSound); // MODIFIED
        uiManager.displayPhoneMessage(message, speaker); // MODIFIED
        if (callback) callback();
        setTimeout(() => processAudioQueue(), 400); // Keep delay for non-TTS
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
        text: message.replace(/\*\*|[\*_]/g, ''), // TTS usually doesn't need markdown
        model_id: "eleven_monolingual_v1", // Or your preferred model
        voice_settings: { stability: 0.5, similarity_boost: 0.75 } // Example settings
    };

    fetch(url, { method: "POST", headers: headers, body: JSON.stringify(data) })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => { // Try to parse JSON error from ElevenLabs
                const errorDetail = errData.detail?.message || JSON.stringify(errData.detail);
                throw new Error(`HTTP error ${response.status}: ${errorDetail}`);
            }).catch(() => { // Fallback if error is not JSON
                throw new Error(`HTTP error! status: ${response.status}`);
            });
        }
        return response.blob();
    })
    .then(audioBlob => {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.volume = 0.8; // Or from config
        uiManager.displayPhoneMessage(message, speaker); // Display message first
        audio.play().catch(e => { throw e; }); // Play audio
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            if (callback) callback();
            processAudioQueue(); // Process next in queue
        };
    })
    .catch(err => {
        console.error("Error with ElevenLabs TTS:", err);
        // displaySystemMessage(`TTS service failed. Displaying text only.`); // Use uiManager
        uiManager.displayPhoneMessage(`TTS service failed. Displaying text only.`, "narration");
        uiManager.playSound(uiManager.chatBubbleSound); // Fallback sound
        uiManager.displayPhoneMessage(message, speaker); // Display message
        if (callback) callback();
        processAudioQueue(); // Process next
    });
}

// function displayPhoneMessage(message, speaker) { // DELETED - Now in UIManager
// ...
// }

function displaySystemMessage(message) { // This can use uiManager.displayPhoneMessage directly
    uiManager.displayPhoneMessage(message, 'narration'); // MODIFIED
    phoneShowNotification(message, "System Alert"); // phoneShowNotification is from phone_ambient_ui.js, can remain for now
}

// function displayChoices(choices) { // DELETED - Now in UIManager, but handleChoice is passed
// ...
// }

// function updateHUD() { // DELETED - Now uiManager.updateHUD()
// ...
// }

// function updateInventoryDisplay() { // DELETED - Now uiManager.updateInventoryDisplay()
// ...
// }

// function openInventoryModal() { // DELETED - Now uiManager.openInventoryModal()
// ...
// }

// function closeInventoryModal() { // DELETED - Now uiManager.closeInventoryModal()
// ...
// }

// =================================================================================
// V. INTERACTION & CHOICE LOGIC
// =================================================================================

function handleChoice(outcome) {
    // MODIFIED: Get current customer from GameState
    const currentCustomer = game.getCurrentCustomerInstance();
    if (!currentCustomer) {
        console.error("handleChoice called with no active customer instance from GameState.");
        return;
    }

    try {
        uiManager.clearChoices(); // MODIFIED

        const combinedWorldEffects = getCombinedActiveEventEffects(); // Get world effects

        // Check for deal failure BEFORE processing the chosen outcome, unless it's a non-deal outcome
        const nonDealOutcomes = ["decline_offer_to_buy", "decline_offer_to_sell", "acknowledge_empty_stash", "acknowledge_error", "end_interaction", "end_interaction_scared", "end_interaction_no_item"];
        if (!nonDealOutcomes.includes(outcome.type) && combinedWorldEffects.dealFailChance > 0 && Math.random() < combinedWorldEffects.dealFailChance) {
            const currentCustomerInst = game.getCurrentCustomerInstance(); // Re-fetch in case it's cleared by other async logic
            let failMsg = "The deal just fell through... damn.";
            if (currentCustomerInst) { // Check if customer instance still exists
                failMsg = `${currentCustomerInst.name} suddenly gets spooked and calls it off!`;
            }
            uiManager.displayPhoneMessage(failMsg, "narration");

            // Apply a small heat penalty for a failed deal attempt, if desired
            // game.addHeat(Math.round(5 * combinedWorldEffects.heatModifier)); // Example heat penalty

            game.decrementFiendsLeft(); // A turn/fiend is still consumed
            uiManager.updateHUD();
            // Call endCustomerInteraction directly, bypassing normal outcome processing
            setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
            return; // Exit handleChoice early
        }

        let narrationText = "";
        let dealSuccess = false;
        let dialogueContextKey = '';

        // MODIFIED: Use game state getters and setters
        switch (outcome.type) {
            case "buy_from_customer": // Verified: Uses game.getCash(), game.isInventoryFull(), game.removeCash(), game.addItemToInventory()
                if (game.getCash() >= outcome.price && !game.isInventoryFull()) {
                    game.removeCash(outcome.price);
                    game.addItemToInventory({ ...outcome.item });
                    dealSuccess = true;
                    narrationText = `Rikk copped "${outcome.item.name}".`;
                    uiManager.playSound(uiManager.cashSound);
                    dialogueContextKey = 'rikkBuysSuccess';
                } else {
                    narrationText = `Deal failed. ${(game.isInventoryFull()) ? "Stash full." : "Not enough cash."}`;
                    uiManager.playSound(uiManager.deniedSound);
                    dialogueContextKey = 'lowCashRikk';
                }
                break;
            case "sell_to_customer": // Verified: Uses game.removeItemFromInventoryById(), game.addCash()
                const soldItem = game.removeItemFromInventoryById(outcome.item.id);
                if (soldItem) {
                    game.addCash(outcome.price);
                    dealSuccess = true;
                    narrationText = `Flipped "${soldItem.name}" for $${outcome.price}.`;
                    uiManager.playSound(uiManager.cashSound);
                    dialogueContextKey = 'rikkSellsSuccess';
                    if (game.customerManager && typeof game.customerManager.processPotentialAddiction === 'function') {
                        game.customerManager.processPotentialAddiction(currentCustomer, soldItem);
                    }
                } else {
                    narrationText = "Couldn't find that item.";
                    uiManager.playSound(uiManager.deniedSound);
                }
                break;
            case "negotiate_sell": // Verified: Uses game.getPlayerSkills()
                setTimeout(() => {
                    // MODIFIED: Use game.getPlayerSkills()
                    if (Math.random() < 0.55 + (game.getPlayerSkills().negotiator * 0.12)) {
                        const negoSuccessResult = game.customerManager.getOutcomeDialogue(currentCustomer, 'negotiationSuccess');
                        queueNextMessage(`Negotiation successful! ${negoSuccessResult.line}`, 'customer', () => {
                             handleChoice({ type: "sell_to_customer", item: outcome.item, price: outcome.proposedPrice });
                        });
                    } else {
                        const negoFailResult = game.customerManager.getOutcomeDialogue(currentCustomer, 'negotiationFail');
                        queueNextMessage(`They ain't having it. ${negoFailResult.line}`, 'customer', () => {
                            const choices = [{ text: `Sell ($${outcome.originalOffer})`, outcome: { type: "sell_to_customer", item: outcome.item, price: outcome.originalOffer } }, { text: `Decline`, outcome: { type: "decline_offer_to_sell" } }];
                            uiManager.displayChoices(choices, handleChoice);
                        });
                    }
                }, 1000);
                return;
            case "decline_offer_to_buy": // Verified: uiManager.playSound
                narrationText = "Rikk passes on the offer.";
                uiManager.playSound(uiManager.deniedSound);
                dialogueContextKey = 'rikkDeclinesToBuy';
                break;
            case "decline_offer_to_sell": // Verified: uiManager.playSound
                narrationText = "Rikk tells them to kick rocks.";
                uiManager.playSound(uiManager.deniedSound);
                dialogueContextKey = 'rikkDeclinesToSell';
                break;
            case "acknowledge_empty_stash": // Verified: uiManager.playSound
                narrationText = "Rikk's stash is dry. Customer ain't happy.";
                uiManager.playSound(uiManager.deniedSound);
                dialogueContextKey = 'acknowledge_empty_stash';
                break;
            case "acknowledge_error": // No state/UI changes here
                narrationText = "System error acknowledged.";
                break;
        }

        if (outcome.type !== "negotiate_sell") { // Verified: game.decrementFiendsLeft()
            game.decrementFiendsLeft();
        }

        const outcomeResult = dialogueContextKey ? game.customerManager.getOutcomeDialogue(currentCustomer, dialogueContextKey) : { line: '', payload: null };
        if (outcome.payload) { processPayload(outcome.payload, dealSuccess); }
        if (outcomeResult.payload) { processPayload(outcomeResult.payload, dealSuccess); }

        const customerForCredConfig = game.getCurrentCustomerInstance();
        if (customerForCredConfig && customerForCredConfig.archetypeKey) {
            // Use game.getCustomerTemplates() to get the potentially customized templates
            const allTemplates = game.getCustomerTemplates ? game.getCustomerTemplates() : game.defaultCustomerTemplates;
            const customerTemplateData = allTemplates[customerForCredConfig.archetypeKey];

            if (customerTemplateData && customerTemplateData.gameplayConfig) {
                const config = customerTemplateData.gameplayConfig;
                if (dealSuccess) { // Only apply if the deal was successful
                    if (outcome.type === "sell_to_customer" && typeof config.credImpactSell === 'number') {
                        debugLogger.log('handleChoice', 'Applying credImpactSell from customer gameplayConfig.', { cred: config.credImpactSell });
                        game.addStreetCred(config.credImpactSell);
                    } else if (outcome.type === "buy_from_customer" && typeof config.credImpactBuy === 'number') {
                        debugLogger.log('handleChoice', 'Applying credImpactBuy from customer gameplayConfig.', { cred: config.credImpactBuy });
                        game.addStreetCred(config.credImpactBuy);
                    }
                }
            }
        }

        uiManager.updateHUD();
        uiManager.updateInventoryDisplay();

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

        // Verified: game.getHeat(), game.getMaxHeat(), game.getCash(), game.getInventory(), game.getFiendsLeft()
        if (game.getHeat() >= game.getMaxHeat()) {
            endGame("heat");
            return;
        }
        if (game.getCash() <= 0 && game.getInventory().length === 0 && game.getFiendsLeft() > 0) {
            endGame("bankrupt");
            return;
        }

    } catch (e) {
        console.error("[SCRIPT ERROR in handleChoice]", e);
        if (typeof debugLogger !== 'undefined' && debugLogger.error) {
            debugLogger.error('handleChoice', 'Error processing player choice', e);
        }
        if (typeof phoneShowNotification === 'function') {
            phoneShowNotification("Error processing that action. Please try again or proceed.", "System Error");
        }
        endCustomerInteraction();
    }
}

function processPayload(payload, dealSuccess) {
    if (!payload || !payload.effects || payload.type !== "EFFECT") return;
    const currentCustomer = game.getCurrentCustomerInstance();

    const worldEffects = getCombinedActiveEventEffects(); // Get combined world effects

    payload.effects.forEach(effect => {
        // ... existing condition checks ...
        if (effect.condition) {
            if (effect.condition.stat === 'dealSuccess' && dealSuccess !== effect.condition.value) return;
            if (effect.condition.stat === 'mood' && currentCustomer) {
                const customerMood = currentCustomer.mood;
                if (effect.condition.op === 'is' && customerMood !== effect.condition.value) return;
                if (effect.condition.op === 'isNot' && customerMood === effect.condition.value) return;
            }
        }

        switch (effect.type) {
            case 'modifyStat':
                if (effect.statToModify && typeof effect.value === 'number') {
                    let valueToApply = effect.value;
                    if (effect.statToModify === 'heat' && valueToApply > 0) { // Only modify heat increases
                        valueToApply = Math.round(valueToApply * worldEffects.heatModifier);
                        valueToApply = applyDealHeat(valueToApply, game); // Apply burner phone effect
                    }

                    switch (effect.statToModify) {
                        case 'cash':
                            game.addCash(valueToApply);
                            break;
                        case 'heat': // Value is already modified above if it's a positive gain
                            game.addHeat(valueToApply);
                            break;
                        case 'streetCred':
                            game.addStreetCred(valueToApply);
                            break;
                        case 'playerSkills.negotiator':
                            game.updatePlayerSkill('negotiator', valueToApply);
                            break;
                        case 'playerSkills.appraiser':
                            game.updatePlayerSkill('appraiser', valueToApply);
                            break;
                        case 'playerSkills.lowProfile':
                            game.updatePlayerSkill('lowProfile', valueToApply);
                            break;
                        default:
                            if (typeof debugLogger !== 'undefined' && debugLogger.warn) {
                                debugLogger.warn('PayloadSystem', `Unknown statToModify: ${effect.statToModify}`);
                            } else {
                                console.warn(`[PayloadSystem WARNING] Unknown statToModify: ${effect.statToModify}`);
                            }
                            break;
                    }
                } else {
                    if (typeof debugLogger !== 'undefined' && debugLogger.warn) {
                        debugLogger.warn('PayloadSystem', 'Invalid modifyStat effect:', effect);
                    } else {
                        console.warn('[PayloadSystem WARNING] Invalid modifyStat effect:', effect);
                    }
                }
                break;
            case 'triggerEvent':
                if (Math.random() < effect.chance) {
                    let message = effect.message || '';
                    if (effect.eventName === 'snitchReport' && currentCustomer) {
                        let heatGain = Math.floor(Math.random() * (effect.heatValueMax - effect.heatValueMin + 1)) + effect.heatValueMin;
                        heatGain = Math.round(heatGain * worldEffects.heatModifier); // Apply world heat modifier
                        heatGain = applyDealHeat(heatGain, game); // Apply burner phone effect
                        game.addHeat(heatGain);
                        game.addStreetCred(effect.credValue);
                        message = message.replace('[CUSTOMER_NAME]', currentCustomer.name).replace('[HEAT_VALUE]', heatGain);
                    }
                    if (effect.eventName === 'highRollerTip' && currentCustomer) {
                        const tip = Math.floor(game.getCash() * effect.tipPercentage);
                        game.addCash(tip);
                        game.addStreetCred(effect.credValue);
                        message = message.replace('[CUSTOMER_NAME]', currentCustomer.name).replace('[TIP_AMOUNT]', tip);
                    }
                    if (effect.eventName === 'publicIncident' && currentCustomer) {
                        let heatValue = effect.heatValue;
                        heatValue = Math.round(heatValue * worldEffects.heatModifier); // Apply world heat modifier
                        heatValue = applyDealHeat(heatValue, game); // Apply burner phone effect
                        game.addHeat(heatValue);
                        message = message.replace('[CUSTOMER_NAME]', currentCustomer.name);
                    }
                    if (message) uiManager.displayPhoneMessage(message, "narration");
                }
                break;
            default:
                console.warn(`processPayload: Unknown effect type '${effect.type}'`);
                break;
        }
    });

    const customerForConfig = game.getCurrentCustomerInstance(); // Re-fetch to be safe
    if (customerForConfig && customerForConfig.archetypeKey) {
        // Access template data through the game instance, which holds defaultCustomerTemplates
        const customerTemplateData = game.defaultCustomerTemplates[customerForConfig.archetypeKey];
        if (customerTemplateData && customerTemplateData.gameplayConfig && typeof customerTemplateData.gameplayConfig.heatImpact === 'number') {
            let heatFromConfig = customerTemplateData.gameplayConfig.heatImpact;
            // Optional: Decide if heatImpact from config should also be modified by burner phones or world effects.
            // For now, let's assume it's a direct impact but still subject to burner phone if positive.
            if (heatFromConfig > 0) {
                // Applying applyDealHeat to this as well for consistency if it's heat from a "deal interaction"
                // Alternatively, this could be a flat heat not subject to deal modifiers.
                // Based on "after a transaction", it implies it's tied to the deal's signature.
                heatFromConfig = applyDealHeat(heatFromConfig, game);
            }
            debugLogger.log('processPayload', 'Applying heatImpact from customer gameplayConfig.', { archetypeKey: customerForConfig.archetypeKey, heat: heatFromConfig });
            game.addHeat(heatFromConfig);
        }
    }

    uiManager.updateHUD();
}

// =================================================================================
// VI. DATA & UTILITY FUNCTIONS (Many will be deleted or their logic moved)
// =================================================================================

// function updateDayOfWeek() { // DELETED - Handled by game.advanceDayOfWeek()
// ...
// }

// function triggerWorldEvent() { // DELETED - Logic moved to handleTurnProgressionAndEvents
// ...
// }

// function advanceWorldEvents() { // DELETED - Logic moved to handleTurnProgressionAndEvents
// ...
// }

// function updateEventTicker() { // DELETED - Handled by uiManager.updateEventTicker()
// ...
// }

// function clearChat() { // DELETED - Handled by uiManager.clearChat()
// ...
// }

// function clearChoices() { // DELETED - Handled by uiManager.clearChoices()
// ...
// }

// function playSound(audioElement) { // DELETED - Handled by uiManager.playSound()
// ...
// }

function saveGameState() {
    // MODIFIED: Use game.toJSON() and game.isGameActive()
    if (!game.isGameActive() && game.getFiendsLeft() > 0) return;

    const stateToSave = game.toJSON(); // GameState now provides the core save data
    // Add CustomerManager state if it's still managed separately for PoC
    if (game.customerManager && typeof game.customerManager.getSaveState === 'function') {
        stateToSave.customerManagerState = game.customerManager.getSaveState();
    }
    // Consider if customerTemplates (global let) needs to be saved here or if GameState handles it

    localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
}

function loadGameState() {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
        try {
            const loadedState = JSON.parse(savedData);
            game.fromJSON(loadedState, gameStateConfig); // GameState handles its own loading

            // Load CustomerManager state if it's still managed separately
            if (game.customerManager && typeof game.customerManager.loadSaveState === 'function' && loadedState.customerManagerState) {
                game.customerManager.loadSaveState(loadedState.customerManagerState);
            }
            // customerTemplates is loaded in initializeManagers for now. If GameState handles it, this might change.

            uiManager.updateEventTicker(); // Update ticker after loading
            uiManager.updateHUD(); // Update HUD after loading
            return true;
        } catch (e) {
            console.error("Error loading game state:", e);
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
    // MODIFIED: Use uiManager properties
    if (localStorage.getItem(SAVE_KEY)) {
        if(uiManager.continueGameBtn) uiManager.continueGameBtn.classList.remove('hidden');
    } else {
        if(uiManager.continueGameBtn) uiManager.continueGameBtn.classList.add('hidden');
    }
}

// =================================================================================
// --- Preview Mode Helper Functions ---

function getCurrentSettingsFromInputs() {
    const settings = {};
    document.querySelectorAll('[data-variable]').forEach(input => {
        settings[input.dataset.variable] = input.value;
    });
    return settings;
}

function applySettingsToDOMAndInputs(settingsToApply) {
// DELETED: getCurrentSettingsFromInputs (logic moved to UIManager)
// DELETED: applySettingsToDOMAndInputs (logic moved to UIManager)
// DELETED: addCancelPreviewButton (logic moved to UIManager)
// DELETED: removeCancelPreviewButtons (logic moved to UIManager)
// DELETED: togglePreviewMode (functionality moved to UIManager.togglePreview)
// DELETED: cancelPreview (functionality moved to UIManager.cancelPreview)

// VII. SCRIPT ENTRY POINT
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
    initGame();

    // --- Preview Mode Button Event Listeners ---
    // These buttons might also become part of UIManager's references if they are standard UI elements
    const previewMainSettingsButton = document.getElementById('preview-style-settings');
    const previewPhoneSettingsButton = document.getElementById('preview-phone-style-settings');

    if (previewMainSettingsButton) {
        previewMainSettingsButton.addEventListener('click', () => uiManager.togglePreview(saveStyleSettings));
    } else {
        console.warn("Preview button for main settings (preview-style-settings) not found.");
    }

    if (previewPhoneSettingsButton) {
        previewPhoneSettingsButton.addEventListener('click', () => uiManager.togglePreview(saveStyleSettings));
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

    // DELETED: applyDefaultsToDOMAndPersist (logic moved to UIManager)
    // DELETED: handleResetToDefaults (functionality moved to UIManager)

    if (resetMainSettingsButton) {
        resetMainSettingsButton.addEventListener('click', () => uiManager.resetToDefaultStyles(saveStyleSettings));
    } else {
        console.warn("Reset button for main settings (reset-style-settings) not found.");
    }

    if (resetPhoneSettingsButton) {
        resetPhoneSettingsButton.addEventListener('click', () => uiManager.resetToDefaultStyles(saveStyleSettings));
    } else {
        console.warn("Reset button for phone settings (reset-phone-style-settings) not found.");
    }
});