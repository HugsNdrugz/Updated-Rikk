
    // =================================================================================
    // My Nigga Rikk - Main Game Logic Script (Controller) - FINAL, REFACTORED BUILD
    // =================================================================================
    // This script is the definitive controller for the application. It has been fully
    // refactored to delegate state management to GameState.js and all direct DOM
    // manipulation to UIManager.js. This file coordinates the logic between modules.
    // Compiled by AI Studio Operations Core.
    // =================================================================================
    
    // --- MODULE IMPORTS ---
import { initPhoneAmbientUI, showNotification as phoneShowNotification } from './phone_ambient_ui.js';
import { AIManager } from './AIManager.js';
import { GameState } from './GameState.js';
import { UIManager } from './UIManager.js';
import { StreetCredManager } from './managers/StreetCredManager.js';
import { LoyaltyManager } from './managers/LoyaltyManager.js';
import { WorldEventManager } from './managers/WorldEventManager.js';
import { ItemEffectManager } from './managers/ItemEffectManager.js';
import { ContactsManager } from './managers/ContactsManager.js';
import { MapManager } from './managers/MapManager.js';
import { NewsManager } from './managers/NewsManager.js'; // Added
import { CustomerManager } from './classes/CustomerManager.js';
import { ContactsAppManager } from './classes/ContactsAppManager.js';
// import { ContactsAppManager } from './classes/ContactsAppManager.js'; // Old one, replaced by new manager
import { SlotGameManager } from './classes/SlotGameManager.js';
import { customerTemplates as defaultCustomerTemplates } from './data/customer_templates.js';
import { itemTypes, ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS } from './data/data_items.js';
import { possibleWorldEvents } from './data/data_events.js';
import { getRandomElement, isLocalStorageAvailable, debugLogger, DEBUG_MODE } from './utils.js';

// =================================================================================
// I. CONFIGURATION & INITIALIZATION
// =================================================================================

// --- Global Constants & Game Configuration ---
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CUSTOMER_WAIT_TIME = 1100;
const KNOCK_ANIMATION_DURATION = 1000;
const SAVE_KEY = 'myNiggaRikkSaveDataV10';
const STYLE_SETTINGS_KEY = 'rikkGameStyleSettingsV1';
const CUSTOMER_TEMPLATES_SAVE_KEY = 'rikkGameCustomerTemplatesV1';
const STARTING_CASH = 500;
const MAX_FIENDS = 15;
const SPLASH_SCREEN_DURATION = 2500;
const STARTING_STREET_CRED = 0;
const MAX_HEAT = 100;
const MAX_INVENTORY_SLOTS = 10;
const APP_CONTAINER_SELECTOR = '#game-viewport';

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

// --- TTS Configuration (Added to resolve ReferenceError) ---
const TTS_ENABLED = false; // Set to true to enable TTS, requires API key
const ELEVENLABS_API_KEY = null; // Replace with your ElevenLabs API Key if TTS_ENABLED
const ELEVENLABS_VOICE_ID_CUSTOMER = 'YOUR_CUSTOMER_VOICE_ID'; // Placeholder: replace with actual ElevenLabs voice ID
const ELEVENLABS_VOICE_ID_RIKK = 'YOUR_RIKK_VOICE_ID'; // Placeholder: replace with actual ElevenLabs voice ID
const ELEVENLABS_API_ENDPOINT_BASE = 'https://api.elevenlabs.io/v1/text-to-speech/';

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

// --- Prepare Configuration Objects ---
const gameStateConfig = {
    STARTING_CASH,
    MAX_FIENDS,
    DAYS: days,
    STARTING_STREET_CRED,
    MAX_INVENTORY_SLOTS,
    MAX_HEAT,
    defaultCustomerTemplates,
    DEBUG_MODE
};

const uiManagerConfig = {
    APP_CONTAINER_SELECTOR,
    customerAvatars,
    rikkAvatarUrl,
    systemAvatarUrl,
    defaultStyleSettings,
    styleSettingsKey: STYLE_SETTINGS_KEY
};

// --- Instantiate Core Classes ---
console.log("SCRIPT: Instantiating GameState...");
const game = new GameState(gameStateConfig);
console.log("SCRIPT: GameState instantiated.");

console.log("SCRIPT: Instantiating UIManager...");
const uiManager = new UIManager(game, uiManagerConfig);
console.log("SCRIPT: UIManager instantiated.");

console.log("SCRIPT: Instantiating StreetCredManager...");
const streetCredManager = new StreetCredManager(game);
game.streetCredManager = streetCredManager; // Attach immediately
console.log("SCRIPT: StreetCredManager instantiated and attached.");

console.log("SCRIPT: Instantiating LoyaltyManager...");
const loyaltyManager = new LoyaltyManager(game);
game.loyaltyManager = loyaltyManager; // Attach immediately
console.log("SCRIPT: LoyaltyManager instantiated and attached.");

console.log("SCRIPT: Instantiating WorldEventManager...");
const worldEventManager = new WorldEventManager(game, uiManager);
game.worldEventManager = worldEventManager; // Attach immediately
console.log("SCRIPT: WorldEventManager instantiated and attached.");

console.log("SCRIPT: Instantiating ItemEffectManager...");
const itemEffectManager = new ItemEffectManager(game);
game.itemEffectManager = itemEffectManager; // Attach immediately
console.log("SCRIPT: ItemEffectManager instantiated and attached.");

console.log("SCRIPT: Instantiating ContactsManager...");
const contactsManager = new ContactsManager(game);
game.contactsManager = contactsManager; // Attach immediately
console.log("SCRIPT: ContactsManager instantiated and attached.");

console.log("SCRIPT: Instantiating MapManager...");
const mapManager = new MapManager(game);
game.mapManager = mapManager; // Attach immediately
console.log("SCRIPT: MapManager instantiated and attached.");

console.log("SCRIPT: Instantiating NewsManager...");
const newsManager = new NewsManager(game);
game.newsManager = newsManager; // Attach immediately
console.log("SCRIPT: NewsManager instantiated and attached.");

console.log("SCRIPT: Instantiating AIManager...");
const aiManager = new AIManager();
game.aiManager = aiManager; // Attach to game instance
console.log("SCRIPT: AIManager instantiated and attached to game.");
aiManager.init(); // IMPORTANT: Kick off the model download

// --- State Variables ---
const localStorageAvailable = isLocalStorageAvailable();
let audioQueue = [];
let isPlayingAudio = false;

// .

// =================================================================================
// II. HELPER & UTILITY FUNCTIONS
// =================================================================================

function getCombinedActiveEventEffects() {
    const activeEvents = game.getActiveWorldEvents();
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
        if (event.effects.heatModifier) combinedEffects.heatModifier *= event.effects.heatModifier;
        if (event.effects.customerScareChance) combinedEffects.customerScareChance = Math.max(combinedEffects.customerScareChance, event.effects.customerScareChance);
        if (event.effects.drugPriceModifier) combinedEffects.drugPriceModifier *= event.effects.drugPriceModifier;
        if (event.effects.drugDemandModifier) combinedEffects.drugDemandModifier *= event.effects.drugDemandModifier;
        if (event.effects.dealFailChance) combinedEffects.dealFailChance = Math.max(combinedEffects.dealFailChance, event.effects.dealFailChance);
        if (event.effects.itemScarcity) combinedEffects.itemScarcity = true;
        if (event.effects.allPriceModifier) combinedEffects.allPriceModifier *= event.effects.allPriceModifier;
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
    if (gameInstance.isToolEffectActive && gameInstance.isToolEffectActive('burner_phone')) {
        debugLogger.log('applyDealHeat', 'Burner phone active, reducing deal heat.', { originalHeat: baseHeat });
        return Math.round(baseHeat * 0.5);
    }
    return baseHeat;
}

// =================================================================================
// III. CORE GAME INITIALIZATION & FLOW
// =================================================================================

function saveCustomerTemplates() {
    if (!localStorageAvailable) return;
    try {
        const templatesToSave = game.getCustomerTemplates();
        localStorage.setItem(CUSTOMER_TEMPLATES_SAVE_KEY, JSON.stringify(templatesToSave));
    } catch (error) {
        console.error('Failed to save customer templates:', error);
    }
}

function loadCustomerTemplates() {
    let loadedTemplates = JSON.parse(JSON.stringify(defaultCustomerTemplates)); // Start with defaults
    if (!localStorageAvailable) {
        game.updateCustomerTemplates(loadedTemplates);
        return;
    }
    try {
        const savedTemplatesString = localStorage.getItem(CUSTOMER_TEMPLATES_SAVE_KEY);
        if (savedTemplatesString) {
            const parsed = JSON.parse(savedTemplatesString);
            if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
                loadedTemplates = parsed;
            } else {
                localStorage.removeItem(CUSTOMER_TEMPLATES_SAVE_KEY);
            }
        }
    } catch (error) {
        console.error('Error loading customer templates:', error);
        localStorage.removeItem(CUSTOMER_TEMPLATES_SAVE_KEY);
    }
    game.updateCustomerTemplates(loadedTemplates);
}

function initializeManagers() {
    console.log("SCRIPT: initializeManagers() started.");
    loadCustomerTemplates();
    const currentTemplates = game.getCustomerTemplates();

    console.log("SCRIPT: Instantiating CustomerManager...");
    game.customerManager = new CustomerManager(currentTemplates, itemTypes, ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS, aiManager);
    console.log("SCRIPT: CustomerManager instantiated.");

    game.contactsAppManager = new ContactsAppManager(uiManager.contactsAppScreen, currentTemplates);

    console.log("SCRIPT: Instantiating SlotGameManager...");
    game.slotGameManager = new SlotGameManager(
        uiManager.slotGameView,
        () => game.getCash(),
        (newCash) => {
            game.setCash(newCash);
            uiManager.updateHUD();
        }
    );

    // The event listener for 'customerTemplatesUpdated' from the old ContactsAppManager
    // might need to be re-evaluated or removed if that functionality is no longer part of a UI view
    // or if the new ContactsManager handles template updates differently (it currently doesn't manage templates).
    // For now, commenting it out to avoid errors if uiManager.contactsAppView is not the old component.
    /*
    if (uiManager.contactsAppScreen) { // Assuming contactsAppScreen is the main view for new app
        uiManager.contactsAppScreen.addEventListener('customerTemplatesUpdated', (event) => {
            if (event.detail && event.detail.updatedTemplates) {
                game.updateCustomerTemplates(event.detail.updatedTemplates);
                saveCustomerTemplates();
                // CustomerManager might need re-initialization or an update method if templates change
                game.customerManager = new CustomerManager(game.getCustomerTemplates(), itemTypes, ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS);
                phoneShowNotification('Contact templates updated and saved!', 'Contacts App');
            }
        });
    }
    */
}

function setupEventListeners() {
    if (uiManager.newGameBtn) uiManager.newGameBtn.addEventListener('click', handleStartNewGameClick);
    if (uiManager.continueGameBtn) uiManager.continueGameBtn.addEventListener('click', handleContinueGameClick);
    if (uiManager.restartGameBtn) uiManager.restartGameBtn.addEventListener('click', handleRestartGameClick);
    if (uiManager.nextCustomerBtn) uiManager.nextCustomerBtn.addEventListener('click', nextFiend);
    if (uiManager.openInventoryBtn) uiManager.openInventoryBtn.addEventListener('click', () => uiManager.openInventoryModal());
    if (uiManager.closeModalBtn) uiManager.closeModalBtn.addEventListener('click', () => uiManager.closeInventoryModal());
    if (uiManager.inventoryModal) uiManager.inventoryModal.addEventListener('click', (e) => {
        if (e.target === uiManager.inventoryModal) uiManager.closeInventoryModal();
    });
    if (uiManager.rikkPhoneUI) {
        uiManager.rikkPhoneUI.querySelectorAll('.app-icon, .dock-icon').forEach(icon => icon.addEventListener('click', handlePhoneAppClick));
    }
    if (uiManager.phoneBackButtons) uiManager.phoneBackButtons.forEach(btn => btn.addEventListener('click', handlePhoneAppClick));
    if (uiManager.phoneDockedIndicator) uiManager.phoneDockedIndicator.addEventListener('click', () => uiManager.setPhoneUIState('home'));
    if (uiManager.dockPhoneBtn) uiManager.dockPhoneBtn.addEventListener('click', () => uiManager.setPhoneUIState('docked'));
    if (uiManager.settingsMenuBtn) {
        uiManager.settingsMenuBtn.addEventListener('click', () => uiManager.openSubmenuPanel(uiManager.settingsMenuPanel));
    }
    if (uiManager.allSubmenuBackBtns) uiManager.allSubmenuBackBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            const panelToClose = event.target.closest('.submenu-panel');
            if (panelToClose) uiManager.closeSubmenuPanel(panelToClose);
        });
    });
}

function initializeUIAndSettings() {
    if (uiManager.splashScreen) {
        console.log("SCRIPT: Showing splash screen.");
        uiManager.showScreen(uiManager.splashScreen);
        setTimeout(() => {
            console.log("SCRIPT: Attempting to hide splash screen and show startScreen/mainMenu.");
            uiManager.showScreen(uiManager.startScreen);
            console.log("SCRIPT: startScreen (or mainMenu) displayed.");
            uiManager.activateMainMenuLights(true);
            checkForSavedGame();
        }, SPLASH_SCREEN_DURATION);
    } else {
        console.warn("SCRIPT: Splash screen element not found by UIManager. Proceeding without splash timeout.");
        // If splash is not found, proceed to show startScreen directly after a minimal delay or immediately
        // This ensures the game doesn't halt if splash is missing.
        setTimeout(() => {
            uiManager.showScreen(uiManager.startScreen);
            console.log("SCRIPT: startScreen (or mainMenu) displayed (no splash).");
            uiManager.activateMainMenuLights(true);
            checkForSavedGame();
        }, 50);
    }
    uiManager.initStyleControls(saveStyleSettings);
    uiManager.loadAndApplyStyleSettings();
    if (uiManager.rikkPhoneUI) {
        initPhoneAmbientUI(uiManager.rikkPhoneUI);
    }
}

function initGame() {
    console.log("SCRIPT: initGame() started.");
    try {
        uiManager.initDOMReferences();
        // uiManager.setChatInputHandler(processPlayerChoiceInput);
        console.log("SCRIPT: uiManager.initDOMReferences() completed.");
        initializeManagers();
        console.log("SCRIPT: initializeManagers() completed. All game-specific managers should be instantiated.");
        initializeUIAndSettings();
        console.log("SCRIPT: initializeUIAndSettings() completed.");
        setupEventListeners();
        console.log("SCRIPT: setupEventListeners() completed.");
        console.log("SCRIPT: initGame() finished successfully.");
    } catch (error) {
        console.error("CRITICAL ERROR during game initialization:", error);
        // Optionally, display a user-friendly error message on the page
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = `<div style="color: white; background-color: red; padding: 20px; text-align: center; font-family: sans-serif;"><h1>Game Initialization Failed</h1><p>A critical error occurred. Please check the console (F12) for details and report the issue.</p><p>${error.message}</p></div>`;
        }
    }
}

function initializeNewGameState() {
    console.log("SCRIPT: initializeNewGameState() started.");
    clearSavedGameState();
    game.resetToDefault(gameStateConfig);
    console.log("SCRIPT: game.resetToDefault() completed.");
    if (game.customerManager) {
        game.customerManager.reset();
        console.log("SCRIPT: game.customerManager.reset() completed.");
    }
    // Managers like ContactsManager and MapManager initialize their GameState parts in their constructor
    // or through methods called during their instantiation (e.g. ensureInitialPlayerContacts, initializeMapState)
    // If they require explicit re-initialization for a new game *after* GameState.resetToDefault(),
    // those calls would go here. For example:
    if (game.contactsManager) {
      // game.contactsManager.ensureInitialPlayerContacts(); // This is already called in constructor, but also on getUnlockedContacts.
                                                          // Repopulates based on current (reset) streetcred.
      console.log("SCRIPT: contactsManager re-checked/initialized initial contacts.");
    }
    if (game.mapManager) {
      // game.mapManager.initializeMapState(); // Also called in constructor.
      console.log("SCRIPT: mapManager re-checked/initialized map state.");
    }

    uiManager.updateEventTicker();
    console.log("SCRIPT: initializeNewGameState() finished.");
}

function startGameFlow() {
    uiManager.activateMainMenuLights(false);
    game.setGameActive(true);
    uiManager.showScreen(uiManager.gameScreen);
    uiManager.setPhoneUIState('home');
    uiManager.updateHUD();
    uiManager.updateInventoryDisplay();
    uiManager.clearChat();
    uiManager.clearChoices();
    nextFiend();
}

function endGame(reason) {
    game.setGameActive(false);
    uiManager.showScreen(uiManager.endScreen);
    if (uiManager.finalDaysDisplay) uiManager.finalDaysDisplay.textContent = gameStateConfig.MAX_FIENDS - game.getFiendsLeft();
    if (uiManager.finalCashDisplay) uiManager.finalCashDisplay.textContent = game.getCash();
    if (uiManager.finalCredDisplay) uiManager.finalCredDisplay.textContent = game.getStreetCred();

    let verdict = "";
    if (reason === "heat") {
        verdict = `The block's too hot, nigga! 5-0 swarming. Heat: ${game.getHeat()}. Time to ghost.`;
    } else if (reason === "bankrupt") {
        verdict = "Broke as a joke, and empty handed. Can't hustle on E, fam.";
    } else if (reason === "completed") {
        if (game.getCash() >= STARTING_CASH * 3) {
            verdict = "You a certified KINGPIN! The streets whisper your name.";
        } else if (game.getCash() >= STARTING_CASH * 1.5) {
            verdict = "Solid hustle, G. Made bank and respect.";
        } else {
            verdict = "Broke even or worse. Gotta step your game up, Rikk.";
        }
    }
    if (uiManager.finalVerdictText) {
        uiManager.finalVerdictText.textContent = verdict;
        uiManager.finalVerdictText.style.color = (reason === "heat" || reason === "bankrupt") ? "var(--color-error)" : (game.getCash() > STARTING_CASH ? "var(--color-success-green)" : "var(--color-accent-orange)");
    }
    uiManager.setPhoneUIState('offscreen');
    clearSavedGameState();
}

function handleTurnProgressionAndEvents() {
    game.advanceDayOfWeek();
    let currentEvents = game.getActiveWorldEvents();
    currentEvents.forEach(eventState => eventState.turnsLeft--);
    game.setActiveWorldEvents(currentEvents.filter(eventState => eventState.turnsLeft > 0));

    let worldEventsState = game.getActiveWorldEvents();
    if (!(worldEventsState.length > 0 && Math.random() < 0.7)) {
        worldEventsState = worldEventsState.filter(event => event.turnsLeft > 0);
        if (possibleWorldEvents.length > 0 && Math.random() < 0.25 && worldEventsState.length === 0) {
            const eventTemplate = getRandomElement(possibleWorldEvents);
            worldEventsState.push({ ...eventTemplate, turnsLeft: eventTemplate.duration });
        }
        game.setActiveWorldEvents(worldEventsState);
    }
    uiManager.updateEventTicker();

    const skills = game.getPlayerSkills();
    const worldEffects = getCombinedActiveEventEffects();
    let passiveHeatChange = -(1 + (skills.lowProfile || 0));

    // Apply world event modifiers to passive heat change
    const currentModifiers = game.activeEventModifiers;
    if (currentModifiers && currentModifiers.heatGainMultiplier) {
        // If heatGainMultiplier is > 1, passive heat reduction is less effective
        // If heatGainMultiplier is < 1, passive heat reduction is more effective
        // A multiplier of 0 would mean infinite heat reduction, so guard against that.
        if (currentModifiers.heatGainMultiplier !== 0) {
             passiveHeatChange /= currentModifiers.heatGainMultiplier;
        } else {
            passiveHeatChange = -game.getMaxHeat(); // Effectively cools down all heat if multiplier is 0
        }
    }

    // This worldEffects.heatModifier seems to be from a different system (possibly items or specific customer interactions)
    // It should be combined with or reviewed alongside the new activeEventModifiers.
    // For now, let's assume they stack multiplicatively or one takes precedence.
    // Sticking to the original logic for worldEffects.heatModifier for now.
    if (worldEffects.heatModifier !== 0) { // This was from getCombinedActiveEventEffects() from activeWorldEvents in GameState directly
        passiveHeatChange /= worldEffects.heatModifier; // This might be redundant if worldEffects are now fully in activeEventModifiers
    }

    if (typeof game.isToolEffectActive === 'function' && game.isToolEffectActive('info_cops')) {
        passiveHeatChange -= 2;
    }
    game.addHeat(Math.round(passiveHeatChange));
    uiManager.updateHUD();

    // Update world events (triggers new, updates active) & then check consequences
    if (game.worldEventManager) {
        game.worldEventManager.updateEvents(); // This will also recalculate modifiers
        game.worldEventManager.checkConsequences();
    }
}

function setupUIForNewInteraction() {
    uiManager.clearChat();
    uiManager.clearChoices();
    uiManager.setNextCustomerButtonDisabled(true);
    uiManager.setPhoneUIState('docked');
    uiManager.playSound(uiManager.doorKnockSound);
    uiManager.displayKnockEffect(game.getDayOfWeek());
}

async function generateAndStartCustomerInteraction() {
    uiManager.hideKnockEffect();
    const combinedWorldEffects = getCombinedActiveEventEffects();
    const gameStateForCustomerManager = {
        inventory: game.getInventory(),
        cash: game.getCash(),
        playerSkills: game.getPlayerSkills(),
        activeWorldEvents: game.getActiveWorldEvents(),
        combinedWorldEffects: combinedWorldEffects
    };
    const interaction = await game.customerManager.generateInteraction(gameStateForCustomerManager);
    game.setCurrentCustomerInstance(interaction.instance);
    startCustomerInteraction(interaction);
}

async function nextFiend() {
    if (!game.isGameActive() || game.getFiendsLeft() <= 0) {
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
                if (uiManager.nextCustomerBtn) uiManager.nextCustomerBtn.disabled = true;
                phoneShowNotification("Oops! A glitch in the matrix. Try restarting if issues persist.", "System Error");
            }
        }, KNOCK_ANIMATION_DURATION);
    } catch (e) {
        console.error("[SCRIPT ERROR in nextFiend main block]", e);
        debugLogger.error('nextFiend', 'Critical error in turn progression', e);
        if (uiManager.nextCustomerBtn) uiManager.nextCustomerBtn.disabled = true;
        phoneShowNotification("An error occurred. Things might be unstable.", "System Error");
    }
    saveGameState();
}

function startCustomerInteraction(interaction) {
    uiManager.setPhoneUIState('chatting');
    // uiManager.setPhoneTitle(interaction.name); // REMOVE THIS LINE
    uiManager.updateChatParticipantInfo(interaction.name); // ADD THIS LINE
    phoneShowNotification(`Incoming message from: ${interaction.name}`, "New Customer");
    uiManager.clearChat();
    let dialogueIndex = 0;
    const displayNext = () => {
        if (dialogueIndex < interaction.dialogue.length) {
            const msg = interaction.dialogue[dialogueIndex]; // msg is now an object {text, speaker, isAI}
            dialogueIndex++;
            queueNextMessage(msg, () => { // Pass the whole msg object
                setTimeout(displayNext, CUSTOMER_WAIT_TIME);
            });
        } else { // This is after all dialogue messages are displayed
            if (interaction.choices && interaction.choices.length > 0) {
                uiManager.displayChoices(interaction.choices, handleChoice);
            } else {
                console.warn("Interaction ended with no choices to present, or choices array is malformed.");
                endCustomerInteraction(); // Proceed to end interaction if no choices
            }
        }
    };
    displayNext();
}

function endCustomerInteraction() {
    uiManager.clearChoices();
    // uiManager.setPhoneTitle('Street Talk'); // This will be handled by updateChatParticipantInfo
    game.clearCurrentCustomerInstance();
    uiManager.updateChatParticipantInfo(null); // ADD THIS LINE
    uiManager.setPhoneUIState('home');
    if (game.isGameActive() && game.getFiendsLeft() > 0 && game.getHeat() < game.getMaxHeat() && (game.getCash() > 0 || game.getInventory().length > 0)) {
        uiManager.setNextCustomerButtonDisabled(false);
    } else if (game.isGameActive()) {
        uiManager.setNextCustomerButtonDisabled(true);
        if (game.getHeat() >= game.getMaxHeat()) endGame("heat");
        else if (game.getCash() <= 0 && game.getInventory().length === 0) endGame("bankrupt");
        else if (game.getFiendsLeft() <= 0) endGame("completed");
    }
    saveGameState();
}

// =================================================================================
// IV. UI HANDLERS & EVENT LOGIC
// =================================================================================

function saveStyleSettings() {
    uiManager.saveStyleSettingsToStorage();
}

function handleStartNewGameClick() {
    initializeNewGameState();
    startGameFlow();
}

function handleContinueGameClick() {
    if (loadGameState()) {
        startGameFlow();
    } else {
        uiManager.displayPhoneMessage({ text: "System: No saved game found.", speaker: "narration", isAI: false });
        initializeNewGameState();
        startGameFlow();
    }
}

function handleRestartGameClick() {
    initializeNewGameState();
    startGameFlow();
}

function handlePhoneAppClick(event) {
    const action = event.currentTarget.dataset.action;
    switch (action) {
        case 'messages':
            if (uiManager.nextCustomerBtn && !uiManager.nextCustomerBtn.disabled && game.getFiendsLeft() > 0 && game.isGameActive()) {
                nextFiend();
            } else if (game.getCurrentCustomerInstance()) {
                uiManager.setPhoneUIState('chatting');
                // If there's an active customer, their info should already be in the header.
                // No need to call updateChatParticipantInfo here unless logic changes.
            } else { // No active customer, no new fiend
                // uiManager.setPhoneUIState('chatting'); // Optionally switch to chat view
                uiManager.updateChatParticipantInfo(null); // Reset header to generic
                phoneShowNotification("No new messages.", "Rikk's Inbox");
                // If you also want to ensure the chat view is shown and empty:
                // uiManager.clearChat();
                // uiManager.setPhoneUIState('chatting'); // if you want to show the empty chat view
            }
            break;
        case 'inventory-app':
            uiManager.openInventoryModal();
            break;
        case 'contacts-app':
            uiManager.setPhoneUIState('contactsAppList');
            break;
        case 'map-app':
            uiManager.setPhoneUIState('mapAppView');
            break;
        case 'news-app': // Added News App case
            uiManager.setPhoneUIState('newsAppList');
            break;
        case 'slot-game':
            uiManager.setPhoneUIState('slots');
            if (game.slotGameManager) {
                game.slotGameManager.launch();
            }
            break;
        case 'theme-settings':
            uiManager.setPhoneUIState('theme-settings');
            break;
        case 'back-to-home':
            uiManager.setPhoneUIState('home');
            break;
        default:
            phoneShowNotification(`App "${action}" not implemented.`, "System");
            break;
    }
}

// queueNextMessage now expects a full message object (or a simple string for narration)
function queueNextMessage(messageObject, callback) { // speaker is now part of messageObject
    audioQueue.push({ messageObject, callback }); // Store the whole object
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
    const { messageObject, callback } = audioQueue.shift(); // messageObject is {text, speaker, isAI} or string

    // Determine text and speaker for TTS, if messageObject is an object
    const textForTTS = (typeof messageObject === 'object' && messageObject.text) ? messageObject.text : messageObject;
    const speakerForTTS = (typeof messageObject === 'object' && messageObject.speaker) ? messageObject.speaker : 'narration';

    if (!TTS_ENABLED || speakerForTTS === 'narration' || !ELEVENLABS_API_KEY) {
        uiManager.playSound(uiManager.chatBubbleSound);
        uiManager.displayPhoneMessage(messageObject); // Pass the whole object or string
        if (callback) callback();
        setTimeout(() => processAudioQueue(), 400);
        return;
    }

    const voiceId = speakerForTTS === 'customer' ? ELEVENLABS_VOICE_ID_CUSTOMER : ELEVENLABS_VOICE_ID_RIKK;
    const url = `${ELEVENLABS_API_ENDPOINT_BASE}${voiceId}`;
    const headers = { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json", "Accept": "audio/mpeg" };
    const ttsPayload = { text: textForTTS.replace(/\*\*|[\*_]/g, ''), model_id: "eleven_monolingual_v1", voice_settings: { stability: 0.5, similarity_boost: 0.75 } };

    fetch(url, { method: "POST", headers: headers, body: JSON.stringify(ttsPayload) })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.blob();
        })
        .then(audioBlob => {
            const audioUrl = URL.createObjectURL(audioBlob);
            uiManager.displayPhoneMessage(messageObject); // Pass the whole object
            const audio = new Audio(audioUrl);
            audio.volume = 0.8;
            audio.play().catch(e => { console.error("TTS Audio Playback Error:", e); });
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                if (callback) callback();
                processAudioQueue();
            };
        })
        .catch(err => {
            console.error("Error with ElevenLabs TTS:", err);
            uiManager.displayPhoneMessage({ text: `TTS service failed. Displaying text only.`, speaker: "narration", isAI: false });
            uiManager.playSound(uiManager.chatBubbleSound);
            uiManager.displayPhoneMessage(messageObject); // Display original intended message (object or string)
            if (callback) callback();
            processAudioQueue();
        });
}

function displaySystemMessage(messageText) {
    uiManager.displayPhoneMessage({ text: messageText, speaker: 'narration', isAI: false });
    phoneShowNotification(messageText, "System Alert");
}

function handleChoice(outcome) {
    const currentCustomer = game.getCurrentCustomerInstance();
    if (!currentCustomer) {
        console.error("handleChoice called with no active customer instance from GameState.");
        return;
    }
    try {
        uiManager.clearChoices();
        const combinedWorldEffects = getCombinedActiveEventEffects();
        const nonDealOutcomes = ["decline_offer_to_buy", "decline_offer_to_sell", "acknowledge_empty_stash", "acknowledge_error", "end_interaction", "end_interaction_scared", "end_interaction_no_item"];
        if (!nonDealOutcomes.includes(outcome.type) && combinedWorldEffects.dealFailChance > 0 && Math.random() < combinedWorldEffects.dealFailChance) {
            const failMsg = game.getCurrentCustomerInstance() ? `${game.getCurrentCustomerInstance().name} suddenly gets spooked and calls it off!` : "The deal just fell through... damn.";
            uiManager.displayPhoneMessage({ text: failMsg, speaker: "narration", isAI: false });
            game.decrementFiendsLeft();
            uiManager.updateHUD();
            setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
            return;
        }

        let narrationText = "";
        let dealSuccess = false;
        let dialogueContextKey = '';
        let loyaltyChange = 0; // Initialize loyalty change

        switch (outcome.type) {
            case "buy_from_customer":
                if (game.getCash() >= outcome.price && !game.isInventoryFull()) {
                    const price = outcome.price;
                    game.removeCash(price);
                    uiManager.showCashChangeAnimation(-price); // Cash lost
                    game.addItemToInventory({ ...outcome.item });
                    dealSuccess = true;
                    loyaltyChange = 2; // Successful buy
                    narrationText = `Rikk copped "${outcome.item.name}".`;
                    uiManager.playSound(uiManager.cashSound);
                    dialogueContextKey = 'rikkBuysSuccess';
                } else {
                    dealSuccess = false;
                    loyaltyChange = -1; // Failed buy
                    narrationText = `Deal failed. ${(game.isInventoryFull()) ? "Stash full." : "Not enough cash."}`;
                    uiManager.playSound(uiManager.deniedSound);
                    dialogueContextKey = 'lowCashRikk';
                }
                break;
            case "sell_to_customer":
                const soldItem = game.removeItemFromInventoryById(outcome.item.id);
                if (soldItem) {
                    const price = outcome.price;
                    game.addCash(price);
                    uiManager.showCashChangeAnimation(price); // Cash gained
                    dealSuccess = true;
                    loyaltyChange = 2; // Successful sell
                    narrationText = `Flipped "${soldItem.name}" for $${price}.`;
                    uiManager.playSound(uiManager.cashSound);
                    dialogueContextKey = 'rikkSellsSuccess';
                    if (game.customerManager && typeof game.customerManager.processPotentialAddiction === 'function') {
                        game.customerManager.processPotentialAddiction(currentCustomer, soldItem);
                    }

                    // Process item effects on successful sell
                    const itemDefinition = itemTypes.find(it => it.id === soldItem.id);
                    if (itemDefinition && itemDefinition.effectsOnSell && game.itemEffectManager) {
                        if (game.DEBUG_MODE) debugLogger.log('handleChoice', `Processing effectsOnSell for ${itemDefinition.name}`);
                        game.itemEffectManager.processEffects(itemDefinition.effectsOnSell, { gameState: game /* pass full game object as context */ });
                    }
                } else {
                    dealSuccess = false;
                    loyaltyChange = 0; // No item, no real interaction to penalize loyalty for yet
                    narrationText = "Couldn't find that item.";
                    uiManager.playSound(uiManager.deniedSound);
                }
                break;
            case "negotiate_sell":
                setTimeout(() => {
                    const negotiatorSkill = game.getPlayerSkills().negotiator || 0;
                    // Base success chance: 50%. Each skill point adds 5% to success chance.
                    const successChance = 0.50 + (negotiatorSkill * 0.05);
                    if (game.DEBUG_MODE) debugLogger.log('Negotiate_Sell', `Negotiator Skill: ${negotiatorSkill}, Success Chance: ${successChance}`);

                    if (Math.random() < successChance) {
                        const negoSuccessResult = game.customerManager.getOutcomeDialogue(currentCustomer, 'negotiationSuccess');
                        // Price improvement: Each skill point adds 0.5% to the proposed price, capped at a reasonable amount (e.g., 10% of original offer diff)
                        const priceDifference = outcome.proposedPrice - outcome.originalOffer;
                        let priceImprovement = priceDifference * (negotiatorSkill * 0.005); // 0.5% per point on the *negotiated part*
                        // Ensure improvement is not excessively large, cap at e.g. 25% of the proposed price increase or a fixed small % of total
                        const maxImprovement = Math.min(priceDifference * 0.25, outcome.proposedPrice * 0.05); // Cap improvement
                        priceImprovement = Math.min(priceImprovement, maxImprovement);

                        const finalNegotiatedPrice = Math.round(outcome.proposedPrice + priceImprovement);

                        if (game.DEBUG_MODE) debugLogger.log('Negotiate_Sell', `Original Offer: ${outcome.originalOffer}, Proposed: ${outcome.proposedPrice}, Price Improvement: ${priceImprovement}, Final Price: ${finalNegotiatedPrice}`);
                        // Note: showCashChangeAnimation will be called when handleChoice processes the "sell_to_customer" type
                        queueNextMessage({ text: `Negotiation successful! ${negoSuccessResult.line}`, speaker: 'customer', isAI: false }, () => { // Assume nego result is not AI
                            handleChoice({ type: "sell_to_customer", item: outcome.item, price: finalNegotiatedPrice });
                        });
                    } else {
                        // Failed Haggle: For Phase 1, no additional direct penalty beyond not getting the better price.
                        // Future: negotiator skill could reduce any negative sentiment from a failed haggle.
                        const negoFailResult = game.customerManager.getOutcomeDialogue(currentCustomer, 'negotiationFail');
                        queueNextMessage({ text: `They ain't having it. ${negoFailResult.line}`, speaker: 'customer', isAI: false }, () => { // Assume nego result is not AI
                            const choices = [{ text: `Sell ($${outcome.originalOffer})`, outcome: { type: "sell_to_customer", item: outcome.item, price: outcome.originalOffer } }, { text: `Decline`, outcome: { type: "decline_offer_to_sell" } }];
                            uiManager.displayChoices(choices, handleChoice);
                        });
                    }
                }, 1000);
                return; // Loyalty handled after negotiation outcome
            case "decline_offer_to_buy":
                dealSuccess = false;
                loyaltyChange = -1; // Declined to buy from them
                narrationText = "Rikk passes on the offer.";
                uiManager.playSound(uiManager.deniedSound);
                dialogueContextKey = 'rikkDeclinesToBuy';
                break;
            case "decline_offer_to_sell":
                dealSuccess = false;
                loyaltyChange = -1; // Declined to sell to them
                narrationText = "Rikk tells them to kick rocks.";
                uiManager.playSound(uiManager.deniedSound);
                dialogueContextKey = 'rikkDeclinesToSell';
                break;
            case "acknowledge_empty_stash":
                dealSuccess = false;
                loyaltyChange = -1; // Rikk is unprepared
                narrationText = "Rikk's stash is dry. Customer ain't happy.";
                uiManager.playSound(uiManager.deniedSound);
                dialogueContextKey = 'acknowledge_empty_stash';
                break;
            case "acknowledge_error":
                loyaltyChange = 0; // System error, no loyalty change
                narrationText = "System error acknowledged.";
                break;
        }

        if (outcome.type !== "negotiate_sell") {
            game.decrementFiendsLeft();
        }

        const outcomeResult = dialogueContextKey ? game.customerManager.getOutcomeDialogue(currentCustomer, dialogueContextKey) : { line: '', payload: null };
        if (outcome.payload) processPayload(outcome.payload, dealSuccess);
        if (outcomeResult.payload) processPayload(outcomeResult.payload, dealSuccess);

        const customerInstanceForLoyalty = game.getCurrentCustomerInstance();
        if (customerInstanceForLoyalty && customerInstanceForLoyalty.id && loyaltyChange !== 0) {
            game.loyaltyManager.addLoyalty(customerInstanceForLoyalty.id, loyaltyChange);
            phoneShowNotification(`Loyalty with ${customerInstanceForLoyalty.name} changed by ${loyaltyChange}.`, "System");
        }

        if (customerInstanceForLoyalty && customerInstanceForLoyalty.archetypeKey) {
            const allTemplates = game.getCustomerTemplates();
            const customerTemplateData = allTemplates[customerInstanceForLoyalty.archetypeKey];
            if (customerTemplateData && customerTemplateData.gameplayConfig) {
                const config = customerTemplateData.gameplayConfig;
                if (dealSuccess) {
                    // Basic global street cred for any successful deal
                    game.streetCredManager.addStreetCred('global', null, 1);
                    if (game.DEBUG_MODE) phoneShowNotification("StreetCred +1 (Successful Deal).", "System");

                    if (outcome.type === "sell_to_customer" && typeof config.credImpactSell === 'number' && config.credImpactSell !== 1) {
                        game.streetCredManager.addStreetCred('global', null, config.credImpactSell - 1);
                        if (game.DEBUG_MODE) debugLogger.log('handleChoice', `Additional global StreetCred from template (sell): ${config.credImpactSell - 1}`);
                    } else if (outcome.type === "buy_from_customer" && typeof config.credImpactBuy === 'number' && config.credImpactBuy !== 1) {
                        game.streetCredManager.addStreetCred('global', null, config.credImpactBuy - 1);
                        if (game.DEBUG_MODE) debugLogger.log('handleChoice', `Additional global StreetCred from template (buy): ${config.credImpactBuy - 1}`);
                    }
                }
            }
        }

        uiManager.updateHUD();
        uiManager.updateInventoryDisplay();

        const followUp = () => {
            if (outcomeResult.line && outcomeResult.line.trim() !== "") {
                // Assume outcomeResult.line from _getDialogue is not AI-generated unless specified otherwise
                queueNextMessage({ text: outcomeResult.line, speaker: 'customer', isAI: false }, () => {
                    setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
                });
            } else {
                setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
            }
        };

        if (narrationText.trim() !== "") {
            queueNextMessage({ text: narrationText, speaker: 'narration', isAI: false }, followUp);
        } else {
            followUp();
        }

        if (game.getHeat() >= game.getMaxHeat()) endGame("heat");
        else if (game.getCash() <= 0 && game.getInventory().length === 0 && game.getFiendsLeft() > 0) endGame("bankrupt");

    } catch (e) {
        console.error("[SCRIPT ERROR in handleChoice]", e);
        debugLogger.error('handleChoice', 'Error processing player choice', e);
        phoneShowNotification("Error processing that action. Please try again or proceed.", "System Error");
        endCustomerInteraction();
    }
}

function processPayload(payload, dealSuccess) {
    if (!payload || !payload.effects || payload.type !== "EFFECT") return;
    const currentCustomer = game.getCurrentCustomerInstance();
    const worldEffects = getCombinedActiveEventEffects();
    payload.effects.forEach(effect => {
        if (effect.condition) {
            if (effect.condition.stat === 'dealSuccess' && dealSuccess !== effect.condition.value) return;
            if (effect.condition.stat === 'mood' && currentCustomer && currentCustomer.mood !== effect.condition.value) return;
        }
        switch (effect.type) {
            case 'modifyStat':
                if (effect.statToModify && typeof effect.value === 'number') {
                    let valueToApply = effect.value;
                    if (effect.statToModify === 'heat' && valueToApply > 0) {
                        // Apply general world event heat modifiers first
                        const currentModifiers = game.activeEventModifiers;
                        if (currentModifiers && currentModifiers.heatGainMultiplier) {
                            valueToApply *= currentModifiers.heatGainMultiplier;
                        }

                        // Apply LowProfile skill reduction to heat gain
                        if (valueToApply > 0) { // Only reduce heat *gain*
                            const lowProfileSkill = game.getPlayerSkills().lowProfile || 0;
                            const reductionFactor = 1 - (lowProfileSkill * 0.05); // 5% reduction per skill point
                            valueToApply *= reductionFactor;
                            if (game.DEBUG_MODE) debugLogger.log('processPayload', `LowProfile skill ${lowProfileSkill} reducing heat gain by factor ${reductionFactor}. Pre-dealHeat value: ${valueToApply}`);
                        }

                        // Apply specific deal-related heat modification (like burner phone)
                        valueToApply = applyDealHeat(Math.round(valueToApply), game);
                    }
                    const statMap = {
                        'cash': () => {
                            game.addCash(valueToApply);
                            uiManager.showCashChangeAnimation(valueToApply); // Show animation for payload cash changes
                        },
                        'heat': () => game.addHeat(valueToApply), // Value already processed for heat
                        'streetCred': () => game.streetCredManager.addStreetCred('global', null, valueToApply),
                        'loyalty': () => { // Added loyalty effect processing
                            if (currentCustomer && currentCustomer.id) {
                                game.loyaltyManager.addLoyalty(currentCustomer.id, valueToApply);
                                if (game.DEBUG_MODE) debugLogger.log('processPayload', `Loyalty for ${currentCustomer.id} changed by ${valueToApply} via payload.`);
                            } else {
                                if (game.DEBUG_MODE) debugLogger.warn('processPayload', 'Could not apply loyalty effect: currentCustomer or ID missing.');
                            }
                        },
                        'playerSkills.negotiator': () => game.updatePlayerSkill('negotiator', valueToApply),
                        'playerSkills.appraiser': () => game.updatePlayerSkill('appraiser', valueToApply),
                        'playerSkills.lowProfile': () => game.updatePlayerSkill('lowProfile', valueToApply)
                    };
                    if (statMap[effect.statToModify]) {
                        statMap[effect.statToModify]();
                    } else {
                        debugLogger.warn('PayloadSystem', `Unknown statToModify: ${effect.statToModify}`);
                    }
                }
                break;
            case 'triggerEvent':
                if (Math.random() < effect.chance && currentCustomer) {
                    let message = effect.message || '';
                    if (effect.eventName === 'snitchReport') {
                        let heatGain = Math.round((Math.floor(Math.random() * (effect.heatValueMax - effect.heatValueMin + 1)) + effect.heatValueMin) * worldEffects.heatModifier); // Initial heat calc
                        const currentModifiers = game.activeEventModifiers;
                        if (currentModifiers && currentModifiers.heatGainMultiplier) {
                            heatGain *= currentModifiers.heatGainMultiplier;
                        }
                        // Apply LowProfile skill reduction
                        if (heatGain > 0) {
                            const lowProfileSkill = game.getPlayerSkills().lowProfile || 0;
                            const reductionFactor = 1 - (lowProfileSkill * 0.05);
                            heatGain *= reductionFactor;
                             if (game.DEBUG_MODE) debugLogger.log('processPayload', `SnitchReport: LowProfile ${lowProfileSkill} reducing heat to ${heatGain}`);
                        }
                        heatGain = applyDealHeat(Math.round(heatGain), game);
                        game.addHeat(heatGain);
                        if (effect.credValue) game.streetCredManager.addStreetCred('global', null, effect.credValue);
                        message = message.replace('[CUSTOMER_NAME]', currentCustomer.name).replace('[HEAT_VALUE]', heatGain);
                    } else if (effect.eventName === 'highRollerTip') {
                        const tip = Math.floor(game.getCash() * effect.tipPercentage); // Tip is calculated based on current cash *before* adding the tip itself.
                        game.addCash(tip);
                        uiManager.showCashChangeAnimation(tip); // Show tip animation
                        if (effect.credValue) game.streetCredManager.addStreetCred('global', null, effect.credValue);
                        message = message.replace('[CUSTOMER_NAME]', currentCustomer.name).replace('[TIP_AMOUNT]', tip);
                    } else if (effect.eventName === 'publicIncident') {
                        let heatValue = effect.heatValue; // Base heat from event
                        const currentModifiers = game.activeEventModifiers;
                        if (currentModifiers && currentModifiers.heatGainMultiplier) {
                            heatValue *= currentModifiers.heatGainMultiplier;
                        }
                        // Apply LowProfile skill reduction
                        if (heatValue > 0) {
                            const lowProfileSkill = game.getPlayerSkills().lowProfile || 0;
                            const reductionFactor = 1 - (lowProfileSkill * 0.05);
                            heatValue *= reductionFactor;
                            if (game.DEBUG_MODE) debugLogger.log('processPayload', `PublicIncident: LowProfile ${lowProfileSkill} reducing heat to ${heatValue}`);
                        }
                        heatValue = applyDealHeat(Math.round(heatValue), game);
                        game.addHeat(heatValue);
                        message = message.replace('[CUSTOMER_NAME]', currentCustomer.name);
                    }
                    if (message) uiManager.displayPhoneMessage({ text: message, speaker: "narration", isAI: false });
                }
                break;
            default:
                console.warn(`processPayload: Unknown effect type '${effect.type}'`);
                break;
        }
    });

    const customerForConfig = game.getCurrentCustomerInstance();
    if (customerForConfig && customerForConfig.archetypeKey) {
        const customerTemplateData = game.getCustomerTemplates()[customerForConfig.archetypeKey];
        if (customerTemplateData?.gameplayConfig?.heatImpact) {
            let heatFromConfig = customerTemplateData.gameplayConfig.heatImpact;
            if (heatFromConfig > 0) {
                const currentModifiers = game.activeEventModifiers;
                if (currentModifiers && currentModifiers.heatGainMultiplier) {
                    heatFromConfig *= currentModifiers.heatGainMultiplier;
                }
                // Apply LowProfile skill reduction
                const lowProfileSkill = game.getPlayerSkills().lowProfile || 0;
                const reductionFactor = 1 - (lowProfileSkill * 0.05);
                heatFromConfig *= reductionFactor;
                if (game.DEBUG_MODE) debugLogger.log('processPayload', `CustomerTemplate Heat: LowProfile ${lowProfileSkill} reducing heat to ${heatFromConfig}`);

                heatFromConfig = applyDealHeat(Math.round(heatFromConfig), game);
            }
            game.addHeat(Math.round(heatFromConfig)); // Ensure it's rounded before final add
        }
    }
    uiManager.updateHUD();
}

// =================================================================================
// VI. DATA PERSISTENCE
// =================================================================================

function saveGameState() {
    if (!localStorageAvailable || (!game.isGameActive() && game.getFiendsLeft() > 0)) return;
    try {
        const stateToSave = game.toJSON();
        if (game.customerManager?.getSaveState) {
            stateToSave.customerManagerState = game.customerManager.getSaveState();
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Error saving game state:", error);
    }
}

function loadGameState() {
    if (!localStorageAvailable) {
        console.log("SCRIPT: loadGameState() - localStorage not available.");
        return false;
    }
    const savedData = localStorage.getItem(SAVE_KEY);
    console.log("SCRIPT: loadGameState() attempting to load from localStorage.");
    if (savedData) {
        try {
            const loadedState = JSON.parse(savedData);
            console.log("SCRIPT: GameState parsed successfully from localStorage.");
            game.fromJSON(loadedState, gameStateConfig);
            console.log("SCRIPT: game.fromJSON() completed.");
            if (game.customerManager?.loadSaveState && loadedState.customerManagerState) {
                game.customerManager.loadSaveState(loadedState.customerManagerState);
                console.log("SCRIPT: Loaded customerManager save state.");
            }
            // Other managers might need to load state if they save anything specific
            // For now, ContactsManager, MapManager, etc., re-initialize based on GameState.
            if (game.contactsManager) game.contactsManager.ensureInitialPlayerContacts(); // Re-check after loading streetcred
            if (game.mapManager) game.mapManager.initializeMapState(); // Re-check after loading mapState

            uiManager.updateEventTicker();
            uiManager.updateHUD();
            console.log("SCRIPT: GameState loaded and UI updated.");
            return true;
        } catch (e) {
            console.error("Error loading game state:", e);
            console.log("SCRIPT: Error loading game state. Clearing saved data.");
            clearSavedGameState();
            return false;
        }
    }
    console.log("SCRIPT: No saved data found in localStorage.");
    return false;
}

function clearSavedGameState() {
    if (localStorageAvailable) {
        localStorage.removeItem(SAVE_KEY);
        console.log("SCRIPT: Cleared saved game state from localStorage.");
    }
}

function checkForSavedGame() {
    const hasSave = localStorageAvailable && localStorage.getItem(SAVE_KEY) !== null;
    uiManager.setContinueButtonVisibility(hasSave);
}

// =================================================================================
// VII. SCRIPT ENTRY POINT
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    if (uiManager.previewMainSettingsButton) {
        uiManager.previewMainSettingsButton.addEventListener('click', () => uiManager.togglePreview(saveStyleSettings));
    } else {
        console.warn("Preview button for main settings (preview-style-settings) not found by UIManager.");
    }
    
    if (uiManager.previewPhoneSettingsButton) {
        uiManager.previewPhoneSettingsButton.addEventListener('click', () => uiManager.togglePreview(saveStyleSettings));
    } else {
        console.warn("Preview button for phone settings (preview-phone-style-settings) not found by UIManager.");
    }
    
    if (uiManager.resetMainSettingsButton) {
        uiManager.resetMainSettingsButton.addEventListener('click', () => uiManager.resetToDefaultStyles(saveStyleSettings));
    } else {
        console.warn("Reset button for main settings (reset-style-settings) not found by UIManager.");
    }
    
    if (uiManager.resetPhoneSettingsButton) {
        uiManager.resetPhoneSettingsButton.addEventListener('click', () => uiManager.resetToDefaultStyles(saveStyleSettings));
    } else {
        console.warn("Reset button for phone settings (reset-phone-style-settings) not found by UIManager.");
    }
    
    const elSettingsLoading = document.querySelector('.settings-loading');
    const elSettingsError = document.querySelector('.settings-error');
    if (elSettingsLoading) elSettingsLoading.classList.add('hidden');
    if (elSettingsError) elSettingsError.classList.add('hidden');
});

/*
function processPlayerChoiceInput(inputText) {
    if (!game.getIsExpectingChoice()) {
        // Not expecting a choice, could be a general chat message if that feature is ever added
        // For now, we can just display it as player chat or ignore.
        // uiManager.displayPhoneMessage(inputText, 'rikk'); // Current behavior of initChatFormListener
        return; // Or handle as a general message if applicable
    }

    const choiceOutcomes = game.getCurrentChoices();
    const choiceNumber = parseInt(inputText.trim(), 10);

    if (!isNaN(choiceNumber) && choiceNumber > 0 && choiceNumber <= choiceOutcomes.length) {
        const selectedOutcome = choiceOutcomes[choiceNumber - 1];
        game.clearChoiceExpectation(); // Clear flag and choices
        uiManager.displayPhoneMessage(`You chose: "${inputText}"`, 'rikk'); // Echo player's choice
        handleChoice(selectedOutcome); // Call original handler
    } else {
        uiManager.displayPhoneMessage("Invalid choice. Please type a number from the list.", 'narration');
    }
}
*/
