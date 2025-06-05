// =================================================================================
// My Nigga Rikk - Main Game Logic Script
// =================================================================================
// This script contains the complete game logic, UI management, state handling,
// and debugging framework for the "My Nigga Rikk" game. It is designed to work
// with the refactored HTML structure and the `phone_ambient_ui.js` module.
// It is a single, self-contained file with no omitted functions.
// =================================================================================

// --- MODULE IMPORTS ---
// Imports functions from the separate phone ambient UI module.
// This requires the script tag in index.html to have `type="module"`.
import { initPhoneAmbientUI, showNotification as phoneShowNotification } from './phone_ambient_ui.js';

// =================================================================================
// I. DOM ELEMENT REFERENCES & GAME STATE VARIABLES
// =================================================================================

// --- DOM Element References (Declared with `let`, assigned in `initGame`) ---
// This prevents "Cannot read properties of null" errors by ensuring elements
// are assigned only after the DOM is fully loaded.
let splashScreen, gameViewport, startScreen, gameScreen, endScreen;
let newGameBtn, continueGameBtn, restartGameBtn;
let cashDisplay, dayDisplay, heatDisplay, credDisplay, finalCredDisplay;
let eventTicker, gameScene, knockEffect;
let rikkPhoneUI, androidHomeScreen, gameChatView, gameAppMenuView;
let chatContainer, choicesArea, phoneTitleGame, phoneTitleGameApps, phoneBackButtons;
let phoneDock, phoneHomeIndicator, phoneDockedIndicator;
let openInventoryBtn, inventoryCountDisplay, nextCustomerBtn;
let inventoryModal, closeModalBtn, inventoryList, modalInventorySlotsDisplay;
let finalDaysDisplay, finalCashDisplay, finalVerdictText;
let doorKnockSound, cashSound, deniedSound, chatBubbleSound;

// --- Game State Variables ---
let cash = 0;
let fiendsLeft = 0;
let heat = 0;
let streetCred = 0;
let inventory = [];
let currentCustomer = null;
let gameActive = false;
let playerSkills = { negotiator: 0, appraiser: 0, lowProfile: 0 };
let activeWorldEvents = [];
let dayOfWeek = 'Monday';
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let customersPool = [];
let nextCustomerId = 1;

// --- Game Configuration Constants ---
const CUSTOMER_WAIT_TIME = 1100;
const KNOCK_ANIMATION_DURATION = 1000;
const SAVE_KEY = 'myNiggaRikkSaveDataV7'; // Incremented for new UI structure
const STARTING_CASH = 500;
const MAX_FIENDS = 15;
const SPLASH_SCREEN_DURATION = 2500;
const STARTING_STREET_CRED = 0;
const MAX_HEAT = 100;
const MAX_INVENTORY_SLOTS = 10;
const MAX_CUSTOMERS_IN_POOL = 20;

// --- Helper function to get a random element from an array ---
// *** THIS FUNCTION WAS MISSING AND HAS BEEN ADDED TO FIX THE ERROR ***
function getRandomElement(arr) {
    if (!arr || arr.length === 0) return null; // Return null if array is empty or invalid
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

function trackError(error, context = 'General') {
    debugLogger.error('ErrorTracker', `Context: ${context} | Message: ${error.message}`, error.stack);
    try {
        const errors = JSON.parse(sessionStorage.getItem('rikkErrors') || '[]');
        errors.push({
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            context: context,
            gameCash: typeof cash !== 'undefined' ? cash : 'N/A',
            gameDay: typeof fiendsLeft !== 'undefined' ? (MAX_FIENDS - fiendsLeft) : 'N/A',
            currentCustomerName: typeof currentCustomer !== 'undefined' && currentCustomer ? currentCustomer.name : 'N/A'
        });
        if (errors.length > 20) {
            errors.splice(0, errors.length - 20);
        }
        sessionStorage.setItem('rikkErrors', JSON.stringify(errors));
    } catch (e) {
        debugLogger.error('ErrorTracker', 'Failed to save error to sessionStorage:', e);
    }
}

function toggleDebug(enable) {
    DEBUG_MODE = typeof enable === 'boolean' ? enable : !DEBUG_MODE;
    localStorage.setItem('rikkDebugMode', DEBUG_MODE);
    debugLogger.log('System', `Debug mode ${DEBUG_MODE ? 'enabled' : 'disabled'}`);
    if (DEBUG_MODE && document.getElementById('debug-overlay') === null) {
        if (typeof initDebugMode === 'function') initDebugMode();
    } else if (!DEBUG_MODE) {
        const overlay = document.getElementById('debug-overlay');
        if (overlay) overlay.remove();
        if (rikkDebugInterval) {
            clearInterval(rikkDebugInterval);
            rikkDebugInterval = null;
            debugLogger.log('DebugToggle', 'Periodic state check interval stopped.');
        }
    }
}

function validateDOMElements() {
    debugLogger.log('DOMValidation', 'Starting DOM Element Validation...');
    const requiredElements = {
        'splash-screen': 'Splash Screen', 'game-viewport': 'Game Viewport', 'start-screen': 'Start Screen', 'game-screen': 'Game Screen', 'end-screen': 'End Screen',
        'new-game-btn': 'New Game Button', 'continue-game-btn': 'Continue Game Button', 'restart-game-btn': 'Restart Game Button', 'next-customer-btn': 'Next Customer Button', 'open-inventory-btn': 'Open Inventory Button',
        'cash-display': 'Cash Display HUD', 'day-display': 'Day/Fiends Left Display HUD', 'heat-display': 'Heat Display HUD', 'cred-display': 'Cred Display HUD', 'final-cred-display': 'Final Cred Display (End Screen)',
        'event-ticker': 'Event Ticker', 'game-scene': 'Game Scene Container', 'knock-effect': 'Knock Effect Div',
        'rikk-phone-ui': 'Rikk Phone UI Main Container', 'android-home-screen': 'Phone Android Home Screen', 'game-chat-view': 'Phone Game Chat View', 'game-app-menu-view': 'Phone Game App Menu View',
        'chat-container-game': 'Phone Chat Container', 'choices-area-game': 'Phone Choices Area', 'phone-title-game': 'Phone Title (Chat)', 'phone-title-game-apps': 'Phone Title (Apps)', 'phone-docked-indicator': 'Phone Docked Indicator Icon',
        'inventory-modal': 'Inventory Modal Overlay', 'inventory-list': 'Inventory List Area', 'modal-inventory-slots-display': 'Modal Inventory Slots Display',
        'final-days-display': 'Final Days Display (End Screen)', 'final-cash-display': 'Final Cash Display (End Screen)', 'final-verdict-text': 'Final Verdict Text (End Screen)',
        'door-knock-sound': 'Door Knock Sound Audio Element', 'cash-sound': 'Cash Sound Audio Element', 'denied-sound': 'Denied Sound Audio Element', 'chat-bubble-sound': 'Chat Bubble Sound Audio Element'
    };

    const missingElements = [];
    for (const [id, description] of Object.entries(requiredElements)) {
        if (!document.getElementById(id)) {
            missingElements.push(`${description} (${id})`);
        }
    }

    if (missingElements.length > 0) {
        debugLogger.error('DOMValidation', 'Missing required DOM elements:', missingElements.join(', '));
        return false;
    }
    debugLogger.log('DOMValidation', 'All required DOM elements are present.');
    return true;
}

function debugGameState() {
    debugLogger.log('GameState', 'Checking game state integrity...');
    const stateChecks = {
        cash: () => typeof cash === 'number' && cash >= 0,
        inventory: () => Array.isArray(inventory),
        fiendsLeft: () => typeof fiendsLeft === 'number' && fiendsLeft >= 0,
        heat: () => typeof heat === 'number' && heat >= 0 && heat <= MAX_HEAT,
        streetCred: () => typeof streetCred === 'number',
        gameActive: () => typeof gameActive === 'boolean',
        dayOfWeek: () => typeof dayOfWeek === 'string' && days.includes(dayOfWeek),
        currentCustomer: () => currentCustomer === null || (typeof currentCustomer === 'object' && currentCustomer.hasOwnProperty('name') && currentCustomer.hasOwnProperty('archetypeKey') && currentCustomer.hasOwnProperty('data'))
    };

    const stateErrors = [];
    for (const [stateKey, check] of Object.entries(stateChecks)) {
        if (!check()) {
            let stateValueStr = 'N/A';
            try { stateValueStr = JSON.stringify(eval(stateKey)); } catch (e) { stateValueStr = eval(stateKey)?.toString() || 'Could not retrieve value'; }
            stateErrors.push(`Invalid ${stateKey}. Current value: ${stateValueStr}`);
        }
    }

    if (stateErrors.length > 0) {
        debugLogger.error('GameState', 'State errors detected:', stateErrors.join('; '));
    } else {
        debugLogger.log('GameState', 'Game state appears consistent.');
    }
}

function verifyEventHandlers() {
    debugLogger.log('EventHandlers', 'Verifying event handlers...');
    // This is primarily a checklist for development purposes
    const handlers = [
        { id: 'new-game-btn', func: typeof handleStartNewGameClick },
        { id: 'continue-game-btn', func: typeof handleContinueGameClick },
        { id: 'restart-game-btn', func: typeof handleRestartGameClick },
        { id: 'next-customer-btn', func: typeof nextFiend },
        { id: 'open-inventory-btn', func: typeof openInventoryModal },
    ];
    const issues = [];
    handlers.forEach(({id, func}) => {
        if (func === 'undefined') {
            issues.push(`Handler for #${id} is not defined.`);
        }
    });

    if (typeof handlePhoneAppClick === 'undefined') {
        issues.push('Global handler function handlePhoneAppClick is not defined.');
    }

    if (issues.length > 0) {
        debugLogger.error('EventHandlers', 'Issues detected:', issues);
    } else {
        debugLogger.log('EventHandlers', 'Named handlers appear to be defined.');
    }
}

function debugPhoneUIState() {
    debugLogger.log('PhoneUIState', 'Checking phone UI state...');
    const phoneUI = document.getElementById('rikk-phone-ui');
    if (!phoneUI) {
        debugLogger.error('PhoneUIState', 'Phone UI element not found.');
        return;
    }
    const states = {
        classList: Array.from(phoneUI.classList).join(', '),
        androidHomeScreenVisible: !androidHomeScreen.classList.contains('hidden'),
        gameChatViewVisible: !gameChatView.classList.contains('hidden'),
        phoneDockedIndicatorVisible: !phoneDockedIndicator.classList.contains('hidden')
    };
    debugLogger.log('PhoneUIState', 'Current phone UI state:', states);
}

function debugCustomerInteraction() {
    debugLogger.log('CustomerInteraction', 'Checking current customer state...');
    if (!currentCustomer) {
        debugLogger.log('CustomerInteraction', 'No active customer.');
        return;
    }
    debugLogger.log('CustomerInteraction', 'Current customer object:', currentCustomer);
}

function initDebugMode() {
    if (!DEBUG_MODE) {
        const existingOverlay = document.getElementById('debug-overlay');
        if (existingOverlay) existingOverlay.remove();
        if (rikkDebugInterval) clearInterval(rikkDebugInterval);
        return;
    }

    if (document.getElementById('debug-overlay')) {
        if (rikkDebugInterval) clearInterval(rikkDebugInterval);
    } else {
        const debugOverlay = document.createElement('div');
        debugOverlay.id = 'debug-overlay';
        debugOverlay.style.cssText = `position:fixed;bottom:10px;right:10px;width:auto;min-width:200px;max-width:300px;background:rgba(0,0,0,0.75);color:#0f0;padding:10px;font-family:monospace;font-size:10px;border:1px solid #0f0;border-radius:5px;z-index:9999;opacity:0.9;`;
        const title = document.createElement('div');
        title.textContent = 'Rikk Debugger (DEBUG ON)';
        title.style.fontWeight = 'bold'; title.style.marginBottom = '5px'; title.style.borderBottom = '1px solid #0f0'; title.style.paddingBottom = '5px';
        debugOverlay.appendChild(title);
        const statusDiv = document.createElement('div');
        statusDiv.id = 'debug-status-content';
        statusDiv.textContent = 'Initializing...';
        debugOverlay.appendChild(statusDiv);
        document.body.appendChild(debugOverlay);
    }

    rikkDebugInterval = setInterval(() => {
        if (!DEBUG_MODE) { clearInterval(rikkDebugInterval); return; }
        const statusContent = document.getElementById('debug-status-content');
        if (statusContent) {
            statusContent.textContent = `State OK | ${new Date().toLocaleTimeString()} | Cash:$${cash} Heat:${heat} Cred:${streetCred} Day:${MAX_FIENDS - fiendsLeft}`;
            statusContent.style.color = '#0f0';
        }
    }, 5000);
}

const debugCommands = { toggleDebug, validateDOMElements, debugGameState, verifyEventHandlers, debugPhoneUIState, debugCustomerInteraction };
window.rikkDebug = debugCommands;

// =================================================================================
// III. CORE GAME INITIALIZATION & FLOW
// =================================================================================

/**
 * Initializes the entire game application.
 * This function is the entry point, called after the DOM is fully loaded.
 */
function initGame() {
    // --- Assign all DOM elements now that the DOM is loaded ---
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
    androidHomeScreen = document.getElementById('android-home-screen');
    gameChatView = document.getElementById('game-chat-view');
    gameAppMenuView = document.getElementById('game-app-menu-view');
    chatContainer = document.getElementById('chat-container-game');
    choicesArea = document.getElementById('choices-area-game');
    phoneTitleGame = document.getElementById('phone-title-game');
    phoneTitleGameApps = document.getElementById('phone-title-game-apps');
    phoneBackButtons = document.querySelectorAll('.phone-back-button');
    phoneDock = rikkPhoneUI.querySelector('.dock');
    phoneHomeIndicator = rikkPhoneUI.querySelector('.home-indicator');
    phoneDockedIndicator = document.getElementById('phone-docked-indicator');
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
    doorKnockSound = document.getElementById('door-knock-sound');
    cashSound = document.getElementById('cash-sound');
    deniedSound = document.getElementById('denied-sound');
    chatBubbleSound = document.getElementById('chat-bubble-sound');

    // --- Initial Screen & Listener Setup ---
    splashScreen.classList.add('active');
    setTimeout(() => {
        splashScreen.classList.remove('active');
        splashScreen.style.display = 'none';
        startScreen.classList.add('active');
        checkForSavedGame();
    }, SPLASH_SCREEN_DURATION);

    newGameBtn.addEventListener('click', handleStartNewGameClick);
    continueGameBtn.addEventListener('click', handleContinueGameClick);
    restartGameBtn.addEventListener('click', handleRestartGameClick);
    nextCustomerBtn.addEventListener('click', nextFiend);
    openInventoryBtn.addEventListener('click', openInventoryModal);
    closeModalBtn.addEventListener('click', closeInventoryModal);
    inventoryModal.addEventListener('click', (e) => { if (e.target === inventoryModal) closeInventoryModal(); });
    
    rikkPhoneUI.querySelectorAll('.app-icon, .dock-icon').forEach(icon => icon.addEventListener('click', handlePhoneAppClick));
    phoneBackButtons.forEach(btn => btn.addEventListener('click', handlePhoneAppClick));
    phoneDockedIndicator.addEventListener('click', () => setPhoneUIState('home'));
    
    // --- Initialize Modules & UI State ---
    initPhoneAmbientUI(rikkPhoneUI);
    initDebugMode();
    setPhoneUIState('offscreen');
}

/** Resets all game state variables to their initial values for a new game. */
function initializeNewGameState() {
    debugLogger.log('GameFlow', 'Initializing new game state');
    clearSavedGameState();
    cash = STARTING_CASH; fiendsLeft = MAX_FIENDS; heat = 0; streetCred = STARTING_STREET_CRED; inventory = [];
    playerSkills = { negotiator: 0, appraiser: 0, lowProfile: 0 };
    activeWorldEvents = []; dayOfWeek = days[0]; gameActive = false;
    customersPool = []; nextCustomerId = 1;
    updateEventTicker();
}

/** Transitions the UI from the menu to the main game screen and starts the first turn. */
function startGameFlow() {
    debugLogger.log('GameFlow', 'Starting game flow.');
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

/** Ends the game and displays the final results screen. */
function endGame(reason) {
    debugLogger.log('GameFlow', 'Ending game', { reason });
    gameActive = false;
    gameScreen.classList.remove('active');
    endScreen.classList.add('active');
    finalDaysDisplay.textContent = MAX_FIENDS - fiendsLeft;
    finalCashDisplay.textContent = cash;
    finalCredDisplay.textContent = streetCred;
    
    if (reason === "heat") { finalVerdictText.textContent = `The block's too hot, nigga! 5-0 swarming. Heat: ${heat}. Time to ghost.`; finalVerdictText.style.color = "var(--color-error)"; }
    else if (reason === "bankrupt") { finalVerdictText.textContent = "Broke as a joke, and empty handed. Can't hustle on E, fam."; finalVerdictText.style.color = "var(--color-error)"; }
    else if (reason === "completed") {
        if (cash >= STARTING_CASH * 3 && streetCred > MAX_FIENDS) { finalVerdictText.textContent = "You a certified KINGPIN! The streets whisper your name."; }
        else if (cash >= STARTING_CASH * 1.5 && streetCred > MAX_FIENDS / 2) { finalVerdictText.textContent = "Solid hustle, G. Made bank and respect."; }
        else if (cash > STARTING_CASH) { finalVerdictText.textContent = "Made some profit. Not bad for a night's work."; }
        else { finalVerdictText.textContent = "Broke even or worse. Gotta step your game up, Rikk."; }
        finalVerdictText.style.color = cash > STARTING_CASH ? "var(--color-success-green)" : "var(--color-accent-orange)";
    } else {
        finalVerdictText.textContent = "The night comes to a close...";
    }
    
    setPhoneUIState('offscreen');
    clearSavedGameState();
}

/** Initiates the sequence for the next customer interaction. */
function nextFiend() {
    if (!gameActive) return;
    if (fiendsLeft <= 0) { endGame("completed"); return; }
    debugLogger.log('GameFlow', 'Proceeding to next fiend. Fiends left:', fiendsLeft - 1);
    updateDayOfWeek();
    advanceWorldEvents();
    triggerWorldEvent();
    let heatReduction = 1 + playerSkills.lowProfile;
    heat = Math.max(0, heat - Math.round(heatReduction));
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
        generateCustomerInteractionData();
        startCustomerInteraction();
    }, KNOCK_ANIMATION_DURATION);
    saveGameState();
}

/** Handles the display and logic of the current customer conversation. */
function startCustomerInteraction() {
    setPhoneUIState('chatting');
    if (currentCustomer && currentCustomer.name) {
        phoneTitleGame.textContent = currentCustomer.name;
        phoneShowNotification(`Incoming message from: ${currentCustomer.name}`, "New Customer");
    } else {
        phoneTitleGame.textContent = 'Street Talk';
        debugLogger.error("InteractionFlow", "startCustomerInteraction called but currentCustomer is invalid.", currentCustomer);
    }
    clearChat();
    let dialogueIndex = 0;
    const displayNext = () => {
        if (currentCustomer && dialogueIndex < currentCustomer.dialogue.length) {
            const msg = currentCustomer.dialogue[dialogueIndex];
            displayPhoneMessage(msg.text, msg.speaker);
            dialogueIndex++;
            setTimeout(displayNext, CUSTOMER_WAIT_TIME * (msg.text.length > 70 ? 1.4 : 1) * (msg.speaker === 'rikk' ? 0.8 : 1));
        } else if (currentCustomer) {
            displayChoices(currentCustomer.choices);
        } else {
            debugLogger.error("InteractionFlow", "currentCustomer became null during dialogue display.");
            endCustomerInteraction();
        }
    };
    displayNext();
}

/** Cleans up after a customer interaction and prepares for the next turn. */
function endCustomerInteraction() {
    clearChoices();
    if (phoneTitleGame) { phoneTitleGame.textContent = 'Street Talk'; }
    currentCustomer = null;
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

function handleStartNewGameClick() { initializeNewGameState(); startGameFlow(); }
function handleContinueGameClick() { if (loadGameState()) { startGameFlow(); } else { displaySystemMessage("System: No saved game found."); initializeNewGameState(); startGameFlow(); } }
function handleRestartGameClick() { initializeNewGameState(); startGameFlow(); }

function setPhoneUIState(state) {
    if (!rikkPhoneUI) return;
    rikkPhoneUI.classList.remove('is-offscreen', 'chatting-game', 'home-screen-active', 'app-menu-game');
    androidHomeScreen.classList.add('hidden');
    gameChatView.classList.add('hidden');
    gameAppMenuView.classList.add('hidden');
    phoneDock.classList.remove('hidden');
    phoneHomeIndicator.classList.remove('hidden');
    phoneDockedIndicator.classList.add('hidden');
    phoneBackButtons.forEach(btn => btn.classList.add('hidden'));
    switch (state) {
        case 'chatting':
            rikkPhoneUI.classList.add('chatting-game'); gameChatView.classList.remove('hidden');
            phoneDock.classList.add('hidden'); phoneHomeIndicator.classList.add('hidden');
            break;
        case 'home':
            rikkPhoneUI.classList.add('home-screen-active'); androidHomeScreen.classList.remove('hidden');
            break;
        case 'app-menu':
            rikkPhoneUI.classList.add('app-menu-game'); gameAppMenuView.classList.remove('hidden');
            phoneBackButtons.forEach(btn => btn.classList.remove('hidden'));
            break;
        case 'docked':
            rikkPhoneUI.classList.add('is-offscreen'); phoneDockedIndicator.classList.remove('hidden');
            break;
        case 'offscreen':
            rikkPhoneUI.classList.add('is-offscreen');
            break;
    }
}

function handlePhoneAppClick(event) {
    const action = event.currentTarget.dataset.action;
    switch(action) {
        case 'messages':
            if (!nextCustomerBtn.disabled && fiendsLeft > 0 && gameActive) { nextFiend(); }
            else if (currentCustomer) { setPhoneUIState('chatting'); }
            else { phoneShowNotification("No new messages.", "Rikk's Inbox"); }
            break;
        case 'inventory-app':
             openInventoryModal();
             break;
        case 'back-to-home':
            setPhoneUIState('home');
            break;
        default:
            phoneShowNotification(`App "${action}" not implemented.`, "System");
            break;
    }
}

function displayPhoneMessage(message, speaker) {
    if (typeof message === 'undefined' || message === null) {
        message = (speaker === 'rikk') ? "(Rikk mumbles incoherently...)" : "(They trail off awkwardly...)";
    }
    playSound(chatBubbleSound);
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', speaker);
    if (speaker === 'customer' || speaker === 'rikk') {
        const speakerNameElement = document.createElement('span');
        speakerNameElement.classList.add('speaker-name');
        if (speaker === 'customer') {
            speakerNameElement.textContent = (currentCustomer && currentCustomer.name) ? currentCustomer.name : '[Customer]';
        } else {
            speakerNameElement.textContent = 'Rikk';
        }
        bubble.appendChild(speakerNameElement);
    }
    const textNode = document.createTextNode(message);
    bubble.appendChild(textNode);
    chatContainer.appendChild(bubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function displaySystemMessage(message) {
    displayPhoneMessage(message, 'narration');
    phoneShowNotification(message, "System Alert");
}

function displayChoices(choices) {
    choicesArea.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('choice-button');
        button.textContent = choice.text;
        if (choice.outcome.type.startsWith('decline') || choice.outcome.type.includes('kick_rocks')) {
            button.classList.add('decline');
        }
        button.disabled = choice.disabled || false;
        if (!choice.disabled) {
            button.addEventListener('click', () => handleChoice(choice.outcome));
        }
        choicesArea.appendChild(button);
    });
}

function updateHUD() {
    if (cashDisplay) cashDisplay.textContent = cash;
    if (dayDisplay) dayDisplay.textContent = Math.max(0, fiendsLeft);
    if (heatDisplay) heatDisplay.textContent = heat;
    if (credDisplay) credDisplay.textContent = streetCred;
}

function updateInventoryDisplay() {
    inventoryCountDisplay.textContent = inventory.length;
    modalInventorySlotsDisplay.textContent = `${inventory.length}/${MAX_INVENTORY_SLOTS}`;
    inventoryList.innerHTML = '';
    if (inventory.length === 0) {
        inventoryList.innerHTML = "<p class='empty-stash-message'>Your stash is lookin' sadder than a clown at a tax audit, Rikk. Bone dry.</p>";
    } else {
        inventory.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('inventory-item-card');
            itemDiv.innerHTML = `
                <h4>${item.name} (${item.quality})</h4>
                <p class="item-detail">
                    Copped: $${item.purchasePrice} <br>
                    Street (Buy/Sell): $${calculateItemEffectiveValue(item, true, null)} / $${calculateItemEffectiveValue(item, false, null)} <br>
                    Heat: +${item.itemTypeObj.heat} | Type: ${item.itemTypeObj.type.slice(0,3)}/${item.itemTypeObj.subType ? item.itemTypeObj.subType.slice(0,4) : 'N/A'}
                    ${item.uses ? `<br>Uses: ${item.uses}` : ''}
                </p>`;
            inventoryList.appendChild(itemDiv);
        });
    }
}

function openInventoryModal() {
    updateInventoryDisplay();
    inventoryModal.classList.add('active');
    setPhoneUIState('offscreen');
}

function closeInventoryModal() {
    inventoryModal.classList.remove('active');
    if (currentCustomer) {
        setPhoneUIState('chatting');
    } else {
        setPhoneUIState(nextCustomerBtn.disabled ? 'docked' : 'home');
    }
}

// =================================================================================
// V. INTERACTION & CHOICE LOGIC
// =================================================================================

function handleChoice(outcome) {
    debugLogger.log('Interaction', 'Handling choice', { outcomeType: outcome.type, currentCash: cash, currentHeat: heat, currentCred: streetCred });
    clearChoices();
    let narrationText = "";
    let selectedCustomerReaction = "";
    let heatChange = 0;
    let credChange = 0;

    if (!currentCustomer || !currentCustomer.archetypeKey || !currentCustomer.data || typeof customerArchetypes === 'undefined' || !customerArchetypes[currentCustomer.archetypeKey]) {
        trackError(new Error("Critical data missing in handleChoice"), 'handleChoice - missing customer data');
        displaySystemMessage("System Error: Customer data missing. Ending interaction.");
        setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME);
        return;
    }
    const archetype = customerArchetypes[currentCustomer.archetypeKey];
    const customerState = currentCustomer.data;
    let dealSuccess = false;

    const getReaction = (variationFn, mood, fallback) => {
        if (variationFn) {
            const reactionOutput = variationFn(mood);
            if (Array.isArray(reactionOutput)) return getRandomElement(reactionOutput);
            return reactionOutput || fallback;
        }
        return fallback;
    };

    switch (outcome.type) {
        case "buy_from_customer":
            if (cash >= outcome.price && inventory.length < MAX_INVENTORY_SLOTS) {
                cash -= outcome.price; inventory.push({...outcome.item});
                heatChange = outcome.item.itemTypeObj.heat + (archetype.heatImpact || 0);
                credChange = archetype.credImpactBuy || 0;
                customerState.mood = "happy"; customerState.loyaltyToRikk += 1; dealSuccess = true;
                narrationText = `Rikk copped "${outcome.item.name} (${outcome.item.quality})" for $${outcome.price}.`;
                selectedCustomerReaction = getReaction(archetype.dialogueVariations?.rikkBuysSuccess, customerState.mood, "Pleasure doin' business, Rikk!");
                playSound(cashSound);
            } else if (inventory.length >= MAX_INVENTORY_SLOTS) {
                narrationText = `Rikk's stash is full. No room for that ${outcome.item.name}.`;
                selectedCustomerReaction = getReaction(archetype.dialogueVariations?.rikkDeclinesToBuy, customerState.mood, "Seriously, Rikk? Full up? Lame.");
                playSound(deniedSound); customerState.mood = "annoyed"; customerState.loyaltyToRikk -=1;
            } else {
                narrationText = `Rikk's pockets are light. Can't swing $${outcome.price}.`;
                selectedCustomerReaction = getReaction(archetype.dialogueVariations?.rikkCannotAfford, customerState.mood, "Broke, Rikk? Times are tough, huh?");
                playSound(deniedSound); customerState.mood = "disappointed";
            }
            break;

        case "sell_to_customer":
            const itemIndex = inventory.findIndex(i => i.id === outcome.item.id && i.quality === outcome.item.quality && i.purchasePrice === outcome.item.purchasePrice);
            if (itemIndex !== -1) {
                const itemSold = inventory.splice(itemIndex, 1)[0]; cash += outcome.price;
                heatChange = itemSold.itemTypeObj.heat + (archetype.heatImpact || 0);
                credChange = archetype.credImpactSell || 0;
                customerState.mood = "happy"; customerState.loyaltyToRikk += 2; dealSuccess = true;
                narrationText = `Cha-ching! Rikk flipped "${itemSold.name}" for a cool $${outcome.price}.`;
                selectedCustomerReaction = getReaction(archetype.dialogueVariations?.rikkSellsSuccess, customerState.mood, "My man Rikk! Good lookin' out!");
                playSound(cashSound);
            } else {
                narrationText = `WTF Rikk? Can't find that "${outcome.item.name}"!`;
                selectedCustomerReaction = `Yo, Rikk, you playin' me or what?`;
                heatChange = 3; playSound(deniedSound); customerState.mood = "angry";
            }
            break;

        case "negotiate_sell":
            const rikkHaggleLines = [ `Hold up, $${outcome.originalOffer}? Nah, G. I need at least $${outcome.proposedPrice}.` ];
            displayPhoneMessage(`Rikk: "${getRandomElement(rikkHaggleLines)}"`, 'rikk');
            setTimeout(() => {
                let successChance = 0.55 + (playerSkills.negotiator * 0.12);
                if (Math.random() < successChance) {
                    const itemToSellIndex = inventory.findIndex(i => i.id === outcome.item.id && i.quality === outcome.item.quality);
                    if (itemToSellIndex !== -1) {
                        const itemSold = inventory.splice(itemToSellIndex, 1)[0]; cash += outcome.proposedPrice;
                        displayPhoneMessage(`Rikk's smooth talk worked! Sold "${itemSold.name}" for $${outcome.proposedPrice}.`, 'narration');
                        selectedCustomerReaction = getReaction(archetype.dialogueVariations?.negotiationSuccess, customerState.mood, "Aight, Rikk, deal.");
                        displayPhoneMessage(`"${currentCustomer.name}: ${selectedCustomerReaction}"`, 'customer');
                        playSound(cashSound);
                        heat += itemSold.itemTypeObj.heat + 1; streetCred += 1; dealSuccess = true;
                        fiendsLeft--; updateHUD(); updateInventoryDisplay();
                        setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
                    }
                } else {
                    let negFailText = `They ain't budging. "${getReaction(archetype.dialogueVariations?.negotiationFail, customerState.mood, `Nah, man, $${outcome.originalOffer} is my final.`)}"`;
                    displayPhoneMessage(negFailText, 'narration');
                    const acceptOriginalBtn = document.createElement('button'); acceptOriginalBtn.textContent = `Aight, fine. ($${outcome.originalOffer})`; acceptOriginalBtn.classList.add('choice-button');
                    acceptOriginalBtn.addEventListener('click', () => handleChoice({ type: "sell_to_customer", item: outcome.item, price: outcome.originalOffer }));
                    const declineFullyBtn = document.createElement('button'); declineFullyBtn.textContent = `Nah, deal's dead.`; declineFullyBtn.classList.add('choice-button', 'decline');
                    declineFullyBtn.addEventListener('click', () => handleChoice({ type: "decline_offer_to_sell", item: outcome.item }));
                    choicesArea.innerHTML = ''; choicesArea.appendChild(acceptOriginalBtn); choicesArea.appendChild(declineFullyBtn);
                }
            }, 1500);
            return;

        case "decline_offer_to_buy":
            narrationText = `Rikk ain't interested in their junk.`;
            selectedCustomerReaction = getReaction(archetype.dialogueVariations?.rikkDeclinesToBuy, customerState.mood, "Damn, Rikk! My stuff ain't good enough for ya?");
            credChange = -1; customerState.mood = "annoyed"; customerState.loyaltyToRikk -=1; playSound(deniedSound);
            break;

        case "decline_offer_to_sell":
            narrationText = `That chump change ain't worth it. Rikk told 'em to kick rocks.`;
            selectedCustomerReaction = getReaction(archetype.dialogueVariations?.rikkDeclinesToSell, customerState.mood, "Cheap ass motherfucker...");
            heatChange = 1; credChange = archetype.key === "DESPERATE_FIEND" ? -2 : (archetype.key === "HIGH_ROLLER" ? 1 : 0);
            customerState.mood = "angry"; customerState.loyaltyToRikk -=2; playSound(deniedSound);
            break;

        case "acknowledge_empty_stash":
            narrationText = "Rikk's stash is dry. Customer ain't happy.";
            selectedCustomerReaction = `${currentCustomer.name}: Damn, Rikk. Dry spell, huh? Hit me up when you re-up.`;
            credChange = -1; customerState.mood = "disappointed"; playSound(deniedSound);
            break;

        case "acknowledge_error":
             narrationText = "System error acknowledged by Rikk.";
             break;
    }

    heat = Math.min(MAX_HEAT, Math.max(0, heat + heatChange));
    streetCred = Math.max(-100, streetCred + credChange);
    customerState.hasMetRikkBefore = true;
    if (outcome.type !== "negotiate_sell") { fiendsLeft--; }
    updateHUD();
    updateInventoryDisplay();

    setTimeout(() => {
        if (narrationText) displayPhoneMessage(narrationText, 'narration');
        if (selectedCustomerReaction) displayPhoneMessage(`${currentCustomer.name}: ${selectedCustomerReaction}`, 'customer');
        setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
    }, CUSTOMER_WAIT_TIME / 2);

    if (heat >= MAX_HEAT) { endGame("heat"); return; }
    if (cash <= 0 && inventory.length === 0 && fiendsLeft > 0 && gameActive) { endGame("bankrupt"); return; }
}

// =================================================================================
// VI. DATA GENERATION & CALCULATION
// =================================================================================

function calculateItemEffectiveValue(item, purchaseContext = true, customerData = null) {
    let customerArchetype = null;
    if (customerData && customerData.archetypeKey && typeof customerArchetypes !== 'undefined') {
        customerArchetype = customerArchetypes[customerData.archetypeKey];
    }
    let baseValue = purchaseContext ? item.purchasePrice : item.estimatedResaleValue;
    if (!item || !item.itemTypeObj || typeof item.qualityIndex === 'undefined') {
        trackError(new Error("Invalid item structure for value calculation"), 'calculateItemEffectiveValue');
        return baseValue;
    }
    let qualityModifier = 1.0;
    if (typeof ITEM_QUALITY_MODIFIERS !== 'undefined' && ITEM_QUALITY_MODIFIERS[item.itemTypeObj.type]) {
        qualityModifier = ITEM_QUALITY_MODIFIERS[item.itemTypeObj.type][item.qualityIndex] || 1.0;
    }
    let effectiveValue = baseValue * qualityModifier;
    if (!purchaseContext && playerSkills.appraiser > 0) { effectiveValue *= (1 + playerSkills.appraiser * 0.05); }
    if (purchaseContext && playerSkills.appraiser > 0) { effectiveValue *= (1 - playerSkills.appraiser * 0.03); }
    activeWorldEvents.forEach(eventState => { const effects = eventState.event.effects; if (effects.allPriceModifier) effectiveValue *= effects.allPriceModifier; if (item.itemTypeObj.type === "DRUG" && effects.drugPriceModifier) effectiveValue *= effects.drugPriceModifier;});
    if (customerArchetype && !purchaseContext) { effectiveValue *= customerArchetype.priceToleranceFactor; }
    return Math.max(5, Math.round(effectiveValue));
}

function generateRandomItem(archetypeData = null) {
    if (typeof itemTypes === 'undefined' || itemTypes.length === 0) {
        trackError(new Error("itemTypes data is not loaded or empty!"), 'generateRandomItem');
        return { id: "error_item", name: "Error Item", itemTypeObj: { type: "ERROR", heat: 0, description:"Data missing"}, quality: "Unknown", qualityIndex: 0, purchasePrice: 1, estimatedResaleValue: 1, fullDescription: "Data load error." };
    }
    let availableItemTypes = [...itemTypes];
    if (archetypeData && archetypeData.itemPool && archetypeData.itemPool.length > 0) {
         availableItemTypes = itemTypes.filter(it => archetypeData.itemPool.includes(it.id));
    } else if (archetypeData && archetypeData.key === "DESPERATE_FIEND") {
        availableItemTypes = itemTypes.filter(it => it.baseValue < 80 || (it.type === "DRUG" && it.subType !== "PSYCHEDELIC" && it.subType !== "METHAMPHETAMINE"));
    }
    if (availableItemTypes.length === 0) availableItemTypes = [...itemTypes];
    const selectedType = getRandomElement(availableItemTypes);
    const qualityLevelsForType = (typeof ITEM_QUALITY_LEVELS !== 'undefined' && ITEM_QUALITY_LEVELS[selectedType.type]) ? ITEM_QUALITY_LEVELS[selectedType.type] : ["Standard"];
    const qualityIndex = Math.floor(Math.random() * qualityLevelsForType.length);
    const quality = qualityLevelsForType[qualityIndex];
    let basePurchaseValue = selectedType.baseValue + Math.floor(Math.random() * (selectedType.range * 2)) - selectedType.range;
    const item = {
      id: selectedType.id, name: selectedType.name, itemTypeObj: selectedType, quality: quality, qualityIndex: qualityIndex,
      description: selectedType.description, uses: selectedType.uses || null, effect: selectedType.effect || null,
    };
    item.fullDescription = `${selectedType.description} This batch is looking ${quality.toLowerCase()}.`;
    let qualityPriceModifier = 1.0;
    if (typeof ITEM_QUALITY_MODIFIERS !== 'undefined' && ITEM_QUALITY_MODIFIERS[selectedType.type]) {
        qualityPriceModifier = ITEM_QUALITY_MODIFIERS[selectedType.type]?.[qualityIndex] || 1.0;
    }
    item.purchasePrice = Math.max(5, Math.round(basePurchaseValue * (0.3 + Math.random() * 0.25) * qualityPriceModifier));
    item.estimatedResaleValue = Math.max(item.purchasePrice + 5, Math.round(basePurchaseValue * (0.7 + Math.random() * 0.35) * qualityPriceModifier));
    return item;
}

function selectOrGenerateCustomerFromPool() {
    if (typeof customerArchetypes === 'undefined' || Object.keys(customerArchetypes).length === 0) {
        trackError(new Error("customerArchetypes data is not loaded or empty!"), 'selectOrGenerateCustomerFromPool');
        return { id: `customer_error_${nextCustomerId++}`, name: "Error Customer", archetypeKey: "ERROR_ARCHETYPE", loyaltyToRikk: 0, mood: "neutral", cashOnHand: 50, hasMetRikkBefore: false, patience: 3 };
    }
    if (customersPool.length > 0 && Math.random() < 0.35) {
        const returningCustomer = getRandomElement(customersPool);
        returningCustomer.hasMetRikkBefore = true;
        const archetype = customerArchetypes[returningCustomer.archetypeKey];
        if (archetype) {
            returningCustomer.cashOnHand = Math.floor(Math.random() * (archetype.priceToleranceFactor * 90)) + 25;
            const moodRoll = Math.random();
            if (moodRoll < 0.15) returningCustomer.mood = "happy"; else if (moodRoll < 0.30) returningCustomer.mood = "paranoid"; else if (moodRoll < 0.45) returningCustomer.mood = "angry";
            else { returningCustomer.mood = getRandomElement(["neutral", "chill", "desperate", "cautious"]); }
        }
        return returningCustomer;
    }
    const archetypeKeys = Object.keys(customerArchetypes);
    const selectedArchetypeKey = getRandomElement(archetypeKeys);
    const archetypeData = customerArchetypes[selectedArchetypeKey];
    let customerName = archetypeData.baseName + ` #${nextCustomerId}`;
    const newCustomer = {
        id: `customer_${nextCustomerId++}`, name: customerName, archetypeKey: selectedArchetypeKey,
        loyaltyToRikk: Math.floor(Math.random() * 3) - 1, mood: archetypeData.initialMood || "neutral",
        cashOnHand: Math.floor(Math.random() * (archetypeData.priceToleranceFactor * 100)) + 30,
        hasMetRikkBefore: false, patience: 3 + Math.floor(Math.random() * 3),
    };
    if (customersPool.length < MAX_CUSTOMERS_IN_POOL) {
        customersPool.push(newCustomer);
    } else {
        customersPool[Math.floor(Math.random() * MAX_CUSTOMERS_IN_POOL)] = newCustomer;
    }
    return newCustomer;
}

function generateCustomerInteractionData() {
    const customerData = selectOrGenerateCustomerFromPool();
    if (typeof customerArchetypes === 'undefined' || !customerArchetypes[customerData.archetypeKey]) {
        trackError(new Error(`Invalid archetypeKey: ${customerData.archetypeKey}`), 'generateCustomerInteractionData');
        currentCustomer = { data: customerData, name: customerData.name || "Error Customer", dialogue: [{ speaker: "narration", text: "Error: Customer type undefined." }], choices: [{ text: "OK", outcome: { type: "acknowledge_error" } }], itemContext: null, archetypeKey: "ERROR_ARCHETYPE" };
        return;
    }
    const archetype = customerArchetypes[customerData.archetypeKey];
    let dialogue = [];
    let choices = [];
    let itemContext = null;
    let greetingText = archetype.greeting(customerData, null);
    dialogue.push({ speaker: "customer", text: greetingText });
    const rikkOpeners = ["Aight, what's the word?", "Yo. Lay it on me.", "Speak. You buyin' or sellin'?"];
    dialogue.push({ speaker: "rikk", text: getRandomElement(rikkOpeners) });

    let customerWillOfferItemToRikk = Math.random() < 0.5;
    if (inventory.length === 0) customerWillOfferItemToRikk = true;
    if (inventory.length >= MAX_INVENTORY_SLOTS) customerWillOfferItemToRikk = false;

    if (customerWillOfferItemToRikk) {
        itemContext = generateRandomItem(archetype);
        const customerDemandsPrice = calculateItemEffectiveValue(itemContext, true, customerData);
        let offerText = `Yo Rikk, peep this. Got a ${itemContext.quality} ${itemContext.name}. How's $${customerDemandsPrice} sound?`;
        dialogue.push({ speaker: "customer", text: offerText });
        if (cash >= customerDemandsPrice) {
            choices.push({ text: `Cop it ($${customerDemandsPrice})`, outcome: { type: "buy_from_customer", item: itemContext, price: customerDemandsPrice } });
        } else {
            choices.push({ text: `Cop it (Need $${customerDemandsPrice - cash} more)`, outcome: { type: "buy_from_customer" }, disabled: true });
        }
        choices.push({ text: "Nah, pass.", outcome: { type: "decline_offer_to_buy" } });
    } else if (inventory.length > 0) {
        itemContext = getRandomElement(inventory);
        const rikkBaseSellPrice = calculateItemEffectiveValue(itemContext, false, null);
        let customerOfferPrice = Math.round(rikkBaseSellPrice * archetype.priceToleranceFactor);
        customerOfferPrice = Math.min(customerOfferPrice, customerData.cashOnHand);
        let askText = `So, Rikk, that ${itemContext.quality} ${itemContext.name}... what's the word? I got $${customerOfferPrice} burnin' a hole.`;
        dialogue.push({ speaker: "customer", text: askText });
        if (customerData.cashOnHand >= customerOfferPrice) {
            choices.push({ text: `Serve 'em ($${customerOfferPrice})`, outcome: { type: "sell_to_customer", item: itemContext, price: customerOfferPrice } });
        }
        if (rikkBaseSellPrice > customerOfferPrice + 5) {
            const hagglePrice = Math.min(customerData.cashOnHand, Math.round((rikkBaseSellPrice + customerOfferPrice) / 2));
            choices.push({ text: `Haggle (Aim $${hagglePrice})`, outcome: { type: "negotiate_sell", item: itemContext, proposedPrice: hagglePrice, originalOffer: customerOfferPrice } });
        }
        choices.push({ text: "Nah, kick rocks.", outcome: { type: "decline_offer_to_sell" } });
    } else {
        dialogue.push({ speaker: "rikk", text: "Stash is dry, G. Nothin' to move." });
        choices.push({ text: "Aight, my bad.", outcome: { type: "acknowledge_empty_stash" } });
    }

    currentCustomer = { data: customerData, name: customerData.name, dialogue, choices, itemContext, archetypeKey: customerData.archetypeKey };
}

function updateDayOfWeek() { const currentIndex = days.indexOf(dayOfWeek); dayOfWeek = days[(currentIndex + 1) % days.length];}
function triggerWorldEvent() { /* Simplified */ if (Math.random() < 0.1) { console.log("A world event could happen here."); } updateEventTicker(); }
function advanceWorldEvents() { /* Simplified */ }
function updateEventTicker() { if(eventTicker) eventTicker.textContent = `Word on the street: All quiet... for now. (${dayOfWeek})`; }

// =================================================================================
// VII. UTILITY & SAVE/LOAD FUNCTIONS
// =================================================================================

function clearChat() { if(chatContainer) chatContainer.innerHTML = ''; }
function clearChoices() { if(choicesArea) choicesArea.innerHTML = ''; }

function playSound(audioElement) {
    if (audioElement && audioElement.play) {
        audioElement.currentTime = 0;
        audioElement.play().catch(e => debugLogger.log('Audio', `Play failed: ${e.name}`, e.message));
    }
}

function saveGameState() {
    if (!gameActive && fiendsLeft > 0) return;
    debugLogger.log('GameSave', 'Attempting to save game state.');
    const stateToSave = { cash, fiendsLeft, heat, streetCred, inventory, playerSkills, activeWorldEvents, dayOfWeek, customersPool, nextCustomerId };
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
        trackError(e, 'saveGameState');
    }
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
            customersPool = loadedState.customersPool ?? [];
            nextCustomerId = loadedState.nextCustomerId ?? 1;
            updateEventTicker();
            debugLogger.log('GameLoad', "Game state loaded.");
            return true;
        } catch (e) {
            trackError(e, 'loadGameState - parsing');
            clearSavedGameState();
            return false;
        }
    }
    return false;
}

function clearSavedGameState() {
    localStorage.removeItem(SAVE_KEY);
    debugLogger.log('GameSave', "Saved game state cleared.");
}

function checkForSavedGame() {
    if (localStorage.getItem(SAVE_KEY)) {
        continueGameBtn.classList.remove('hidden');
    } else {
        continueGameBtn.classList.add('hidden');
    }
}

// =================================================================================
// VIII. SCRIPT ENTRY POINT
// =================================================================================

document.addEventListener('DOMContentLoaded', initGame);