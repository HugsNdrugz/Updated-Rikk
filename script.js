// =================================================================================
// My Nigga Rikk - Main Game Logic Script (Controller) - REFACTORED
// =================================================================================
// This script has been refactored to work with the new declarative data architecture.
// It acts as the main controller for the game, managing the game loop, UI state,
// and player actions. It now processes declarative payloads from the CustomerManager
// instead of containing hardcoded game logic. This is the complete, unabridged file.
// =================================================================================

// --- MODULE IMPORTS ---
import { initPhoneAmbientUI, showNotification as phoneShowNotification } from './phone_ambient_ui.js';
import { CustomerManager } from './classes/CustomerManager.js';
// REFACTOR: Import the new declarative templates instead of the old data file.
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
let rikkPhoneUI, androidHomeScreen, gameChatView, gameAppMenuView;
let chatContainer, choicesArea, phoneTitleGame, phoneTitleGameApps, phoneBackButtons;
let phoneDock, phoneHomeIndicator, phoneDockedIndicator;
let openInventoryBtn, inventoryCountDisplay, nextCustomerBtn;
let inventoryModal, closeModalBtn, inventoryList, modalInventorySlotsDisplay;
let finalDaysDisplay, finalCashDisplay, finalVerdictText;
let doorKnockSound, cashSound, deniedSound, chatBubbleSound;

// --- Game State & Managers ---
let cash = 0, fiendsLeft = 0, heat = 0, streetCred = 0;
let inventory = [], activeWorldEvents = [];
// REFACTOR: This now holds the live "instance" of the customer, not just static data.
let currentCustomerInstance = null, gameActive = false;
let playerSkills = { negotiator: 0, appraiser: 0, lowProfile: 0 };
let dayOfWeek = 'Monday';
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let customerManager;

// --- UI State ---
let chatSpacerElement = null;

// --- Game Configuration ---
const CUSTOMER_WAIT_TIME = 1100, KNOCK_ANIMATION_DURATION = 1000;
const SAVE_KEY = 'myNiggaRikkSaveDataV10'; // Incremented for new data architecture
const STARTING_CASH = 500, MAX_FIENDS = 15, SPLASH_SCREEN_DURATION = 2500;
const STARTING_STREET_CRED = 0, MAX_HEAT = 100, MAX_INVENTORY_SLOTS = 10;

// --- Avatars (For chat UI) ---
const customerAvatars = {
    "DESPERATE_FIEND": "https://randomuser.me/api/portraits/men/32.jpg",
    "HIGH_ROLLER": "https://randomuser.me/api/portraits/men/45.jpg",
    "REGULAR_JOE": "https://randomuser.me/api/portraits/women/67.jpg",
    "INFORMANT": "https://randomuser.me/api/portraits/men/78.jpg",
    "SNITCH": "https://randomuser.me/api/portraits/women/12.jpg"
};
const rikkAvatarUrl = "https://randomuser.me/api/portraits/men/9.jpg";
const systemAvatarUrl = "assets/icons/info-icon.svg";

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

function trackError(error, context = 'General') {
    debugLogger.error('ErrorTracker', `Context: ${context} | Message: ${error.message}`, error.stack);
    try {
        const errors = JSON.parse(sessionStorage.getItem('rikkErrors') || '[]');
        errors.push({
            timestamp: new Date().toISOString(),
            message: error.message, stack: error.stack, context: context,
            gameCash: typeof cash !== 'undefined' ? cash : 'N/A',
            gameDay: typeof fiendsLeft !== 'undefined' ? (MAX_FIENDS - fiendsLeft) : 'N/A',
            currentCustomerName: typeof currentCustomerInstance !== 'undefined' && currentCustomerInstance ? currentCustomerInstance.name : 'N/A'
        });
        if (errors.length > 20) { errors.splice(0, errors.length - 20); }
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
        }
    }
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


// =================================================================================
// III. CORE GAME INITIALIZATION & FLOW
// =================================================================================

function initGame() {
    // Assign all DOM elements
    splashScreen = document.getElementById('splash-screen'); gameViewport = document.getElementById('game-viewport'); startScreen = document.getElementById('start-screen'); gameScreen = document.getElementById('game-screen'); endScreen = document.getElementById('end-screen');
    newGameBtn = document.getElementById('new-game-btn'); continueGameBtn = document.getElementById('continue-game-btn'); restartGameBtn = document.getElementById('restart-game-btn');
    cashDisplay = document.getElementById('cash-display'); dayDisplay = document.getElementById('day-display'); heatDisplay = document.getElementById('heat-display'); credDisplay = document.getElementById('cred-display'); finalCredDisplay = document.getElementById('final-cred-display');
    eventTicker = document.getElementById('event-ticker'); gameScene = document.getElementById('game-scene'); knockEffect = document.getElementById('knock-effect');
    rikkPhoneUI = document.getElementById('rikk-phone-ui'); androidHomeScreen = document.getElementById('android-home-screen'); gameChatView = document.getElementById('game-chat-view'); gameAppMenuView = document.getElementById('game-app-menu-view');
    chatContainer = document.getElementById('chat-container-game'); choicesArea = document.getElementById('choices-area-game'); phoneTitleGame = document.getElementById('phone-title-game'); phoneTitleGameApps = document.getElementById('phone-title-game-apps'); phoneBackButtons = document.querySelectorAll('.phone-back-button');
    phoneDock = rikkPhoneUI.querySelector('.dock'); phoneHomeIndicator = rikkPhoneUI.querySelector('.home-indicator'); phoneDockedIndicator = document.getElementById('phone-docked-indicator');
    openInventoryBtn = document.getElementById('open-inventory-btn'); inventoryCountDisplay = document.getElementById('inventory-count-display'); nextCustomerBtn = document.getElementById('next-customer-btn');
    inventoryModal = document.getElementById('inventory-modal'); closeModalBtn = document.querySelector('#inventory-dialog .close-modal-btn'); inventoryList = document.getElementById('inventory-list'); modalInventorySlotsDisplay = document.getElementById('modal-inventory-slots-display');
    finalDaysDisplay = document.getElementById('final-days-display'); finalCashDisplay = document.getElementById('final-cash-display'); finalVerdictText = document.getElementById('final-verdict-text');
    doorKnockSound = document.getElementById('door-knock-sound'); cashSound = document.getElementById('cash-sound'); deniedSound = document.getElementById('denied-sound'); chatBubbleSound = document.getElementById('chat-bubble-sound');
    
    // REFACTOR: Instantiate Managers with the NEW template data.
    customerManager = new CustomerManager(customerTemplates, itemTypes, ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS);
    
    // Initial Screen & Listener Setup
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
    
    initPhoneAmbientUI(rikkPhoneUI);
    initDebugMode();
    setPhoneUIState('offscreen');
}

function initializeNewGameState() {
    clearSavedGameState();
    cash = STARTING_CASH; fiendsLeft = MAX_FIENDS; heat = 0; streetCred = STARTING_STREET_CRED; inventory = [];
    playerSkills = { negotiator: 0, appraiser: 0, lowProfile: 0 };
    activeWorldEvents = []; dayOfWeek = days[0]; gameActive = false;
    customerManager.reset();
    updateEventTicker();
}

function startGameFlow() {
    gameActive = true;
    startScreen.classList.remove('active');
    endScreen.classList.remove('active');
    gameScreen.classList.add('active');
    setPhoneUIState('home');
    updateHUD(); updateInventoryDisplay();
    clearChat(); clearChoices();
    nextFiend();
}

function endGame(reason) {
    gameActive = false;
    gameScreen.classList.remove('active');
    endScreen.classList.add('active');
    finalDaysDisplay.textContent = MAX_FIENDS - fiendsLeft;
    finalCashDisplay.textContent = cash;
    finalCredDisplay.textContent = streetCred;
    
    if (reason === "heat") { finalVerdictText.textContent = `The block's too hot, nigga! 5-0 swarming. Heat: ${heat}. Time to ghost.`; }
    else if (reason === "bankrupt") { finalVerdictText.textContent = "Broke as a joke, and empty handed. Can't hustle on E, fam."; }
    else if (reason === "completed") {
        if (cash >= STARTING_CASH * 3) { finalVerdictText.textContent = "You a certified KINGPIN! The streets whisper your name."; }
        else if (cash >= STARTING_CASH * 1.5) { finalVerdictText.textContent = "Solid hustle, G. Made bank and respect."; }
        else { finalVerdictText.textContent = "Broke even or worse. Gotta step your game up, Rikk."; }
    }
    finalVerdictText.style.color = (reason === "heat" || reason === "bankrupt") ? "var(--color-error)" : (cash > STARTING_CASH ? "var(--color-success-green)" : "var(--color-accent-orange)");
    setPhoneUIState('offscreen');
    clearSavedGameState();
}

function nextFiend() {
    if (!gameActive || fiendsLeft <= 0) { endGame("completed"); return; }
    updateDayOfWeek();
    advanceWorldEvents();
    triggerWorldEvent();
    heat = Math.max(0, heat - (1 + playerSkills.lowProfile));
    updateHUD(); clearChat(); clearChoices(); nextCustomerBtn.disabled = true;
    setPhoneUIState('docked');
    playSound(doorKnockSound);
    knockEffect.textContent = `*${dayOfWeek} hustle... someone's knockin'.*`;
    knockEffect.classList.remove('hidden');
    knockEffect.style.animation = 'none'; void knockEffect.offsetWidth;
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
            displayPhoneMessage(msg.text, msg.speaker);
            dialogueIndex++;
            setTimeout(displayNext, CUSTOMER_WAIT_TIME);
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

function handleStartNewGameClick() { initializeNewGameState(); startGameFlow(); }
function handleContinueGameClick() { if (loadGameState()) { startGameFlow(); } else { displaySystemMessage("System: No saved game found."); initializeNewGameState(); startGameFlow(); } }
function handleRestartGameClick() { initializeNewGameState(); startGameFlow(); }

function setPhoneUIState(state) {
    if (!rikkPhoneUI) return;
    rikkPhoneUI.classList.remove('is-offscreen', 'chatting-game', 'home-screen-active', 'app-menu-game');
    androidHomeScreen.classList.add('hidden'); gameChatView.classList.add('hidden'); gameAppMenuView.classList.add('hidden');
    phoneDock.classList.remove('hidden'); phoneHomeIndicator.classList.remove('hidden'); phoneDockedIndicator.classList.add('hidden');
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
            else if (currentCustomerInstance) { setPhoneUIState('chatting'); }
            else { phoneShowNotification("No new messages.", "Rikk's Inbox"); }
            break;
        case 'inventory-app': openInventoryModal(); break;
        case 'back-to-home': setPhoneUIState('home'); break;
        default: phoneShowNotification(`App "${action}" not implemented.`, "System"); break;
    }
}

function displayPhoneMessage(message, speaker) {
    if (typeof message === 'undefined' || message === null) { message = "..."; }
    
    if (speaker !== 'narration') {
        playSound(chatBubbleSound);
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
    
    if (speaker === 'customer' && currentCustomerInstance && currentCustomerInstance.archetypeKey) {
        avatarImg.src = customerAvatars[currentCustomerInstance.archetypeKey] || 'https://randomuser.me/api/portraits/lego/1.jpg';
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

    bubble.appendChild(document.createTextNode(message));
    contextDiv.appendChild(bubble);
    messageContainer.appendChild(contextDiv);

    if (chatContainer && chatSpacerElement) {
        chatContainer.insertBefore(messageContainer, chatSpacerElement);
    } else {
        chatContainer.appendChild(messageContainer);
    }

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function displaySystemMessage(message) { displayPhoneMessage(message, 'narration'); phoneShowNotification(message, "System Alert"); }

function displayChoices(choices) {
    choicesArea.innerHTML = '';
    if (!choices) return;
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('choice-button');
        if (choice.outcome.type.startsWith('decline')) button.classList.add('decline');
        button.textContent = choice.text;
        button.disabled = choice.disabled || false;
        if (!choice.disabled) button.addEventListener('click', () => handleChoice(choice.outcome));
        choicesArea.appendChild(button);
    });
}

function updateHUD() {
    cashDisplay.textContent = cash; dayDisplay.textContent = fiendsLeft; heatDisplay.textContent = heat; credDisplay.textContent = streetCred;
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

function openInventoryModal() { updateInventoryDisplay(); inventoryModal.classList.add('active'); setPhoneUIState('offscreen'); }
function closeInventoryModal() { inventoryModal.classList.remove('active'); setPhoneUIState(currentCustomerInstance ? 'chatting' : 'home'); }


// =================================================================================
// V. INTERACTION & CHOICE LOGIC (COMPLETELY REWRITTEN)
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

    // --- Step 1: Handle Immediate Actions (like inventory changes) ---
    switch (outcome.type) {
        case "buy_from_customer":
            if (cash >= outcome.price && inventory.length < MAX_INVENTORY_SLOTS) {
                cash -= outcome.price;
                inventory.push({ ...outcome.item });
                dealSuccess = true;
                narrationText = `Rikk copped "${outcome.item.name}".`;
                playSound(cashSound);
            } else {
                narrationText = `Deal failed. ${(inventory.length >= MAX_INVENTORY_SLOTS) ? "Stash full." : "Not enough cash."}`;
                playSound(deniedSound);
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
            } else {
                narrationText = "Couldn't find that item.";
                playSound(deniedSound);
            }
            break;
        case "negotiate_sell":
            setTimeout(() => {
                if (Math.random() < 0.55 + (playerSkills.negotiator * 0.12)) {
                    displaySystemMessage(`Negotiation successful!`);
                    handleChoice({ type: "sell_to_customer", item: outcome.item, price: outcome.proposedPrice });
                } else {
                    displaySystemMessage(`They ain't having it. "My first offer stands," they say.`);
                    const choices = [{ text: `Sell ($${outcome.originalOffer})`, outcome: { type: "sell_to_customer", item: outcome.item, price: outcome.originalOffer } }, { text: `Decline`, outcome: { type: "decline_offer_to_sell" } }];
                    displayChoices(choices);
                }
            }, 1000);
            return; // Exit handleChoice, as it will be called again by the negotiation result.
        case "decline_offer_to_buy":
            narrationText = "Rikk passes on the offer.";
            playSound(deniedSound);
            break;
        case "decline_offer_to_sell":
            narrationText = "Rikk tells them to kick rocks.";
            playSound(deniedSound);
            break;
        case "acknowledge_empty_stash":
            narrationText = "Rikk's stash is dry. Customer ain't happy.";
            playSound(deniedSound);
            break;
        case "acknowledge_error":
            narrationText = "System error acknowledged.";
            break;
    }

    if (outcome.type !== "negotiate_sell") {
        fiendsLeft--;
    }

    // --- Step 2: Get Outcome Dialogue and Execute Payloads ---
    const outcomeResult = customerManager.getOutcomeDialogue(currentCustomerInstance, outcome.type);
    if (outcome.payload) { processPayload(outcome.payload, dealSuccess); }
    if (outcomeResult.payload) { processPayload(outcomeResult.payload, dealSuccess); }
    
    // --- Step 3: Update UI and End Turn ---
    updateHUD();
    updateInventoryDisplay();

    setTimeout(() => {
        if (narrationText) displayPhoneMessage(narrationText, 'narration');
        if (outcomeResult.line) displayPhoneMessage(outcomeResult.line, 'customer');
        setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
    }, CUSTOMER_WAIT_TIME / 2);

    if (heat >= MAX_HEAT) { endGame("heat"); return; }
    if (cash <= 0 && inventory.length === 0 && fiendsLeft > 0) { endGame("bankrupt"); return; }
}

/**
 * NEW: The Payload Executor. This function interprets and applies effects from payloads.
 * @param {object} payload - The payload object from the customer template.
 * @param {boolean} dealSuccess - Whether the primary transaction was successful.
 */
function processPayload(payload, dealSuccess) {
    if (!payload || !payload.effects || payload.type !== "EFFECT") return;

    payload.effects.forEach(effect => {
        // If the effect has a condition, check it first.
        if (effect.condition) {
            if (effect.condition.stat === 'dealSuccess' && dealSuccess !== effect.condition.value) {
                return; // Skip effect if deal success doesn't match
            }
        }

        switch (effect.type) {
            case 'modifyStat':
                if (effect.target === 'player') {
                    // Using a switch for safety instead of window[var]
                    switch(effect.stat) {
                        case 'cash': cash += effect.value; break;
                        case 'heat': heat += effect.value; break;
                        case 'streetCred': streetCred += effect.value; break;
                    }
                } else if (effect.target === 'customer') {
                    currentCustomerInstance[effect.stat] = (currentCustomerInstance[effect.stat] || 0) + effect.value;
                }
                break;

            case 'triggerEvent':
                if (Math.random() < effect.chance) {
                    if (effect.eventName === 'snitchReport') {
                        heat += effect.heatValue;
                        streetCred += effect.credValue;
                        displaySystemMessage(`🚨 RAT ALERT! 🚨 Someone was seen yapping to the 5-0! (+${effect.heatValue} Heat, ${effect.credValue} Cred)`);
                    }
                    if (effect.eventName === 'highRollerTip') {
                        const tip = Math.floor(cash * effect.tipPercentage);
                        cash += tip;
                        streetCred += effect.credValue;
                        displaySystemMessage(`${currentCustomerInstance.name} was pleased and tipped you $${tip}! (+${effect.credValue} Cred)`);
                    }
                    if (effect.eventName === 'publicIncident') {
                        let conditionMet = true;
                        if (effect.condition && effect.condition.stat === 'mood') {
                           if (currentCustomerInstance.mood === effect.condition.value) conditionMet = false;
                        }
                        if (conditionMet) {
                            heat += effect.heatValue;
                            displaySystemMessage(`${currentCustomerInstance.name} stumbles away looking rough... (+${effect.heatValue} Heat)`);
                        }
                    }
                }
                break;
        }
    });
}


// =================================================================================
// VI. DATA & UTILITY FUNCTIONS
// =================================================================================

function updateDayOfWeek() { const currentIndex = days.indexOf(dayOfWeek); dayOfWeek = days[(currentIndex + 1) % days.length];}
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
    activeWorldEvents.forEach(eventState => { eventState.turnsLeft--; });
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
function clearChoices() { if(choicesArea) choicesArea.innerHTML = ''; }
function playSound(audioElement) { if (audioElement?.play) { audioElement.currentTime = 0; audioElement.play().catch(e => console.log(`Audio play failed: ${e.name}`)); } }

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
            cash = loadedState.cash ?? STARTING_CASH; fiendsLeft = loadedState.fiendsLeft ?? MAX_FIENDS; heat = loadedState.heat ?? 0; streetCred = loadedState.streetCred ?? STARTING_STREET_CRED;
            inventory = loadedState.inventory ?? []; playerSkills = loadedState.playerSkills ?? { negotiator: 0, appraiser: 0, lowProfile: 0 };
            activeWorldEvents = loadedState.activeWorldEvents ?? []; dayOfWeek = loadedState.dayOfWeek ?? days[0];
            customerManager.loadSaveState(loadedState.customerManagerState);
            updateEventTicker();
            return true;
        } catch (e) { clearSavedGameState(); return false; }
    }
    return false;
}

function clearSavedGameState() { localStorage.removeItem(SAVE_KEY); }
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