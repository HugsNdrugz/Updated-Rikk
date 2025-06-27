// src/apps/slots/slots.js
import { debugLogger } from '../../core/utils.js'; // Adjusted path

class SlotsApp {
    constructor() {
        this.htmlPath = '/src/apps/slots/slots.html';
        this.cssPath = '/src/apps/slots/slots.css'; // Corrected path as per plan

        // DOM Elements
        this.container = null;
        this.reelElements = [];
        this.spinButton = null;
        this.messageArea = null;
        this.playerMoneyDisplay = null;
        this.exitButton = null;

        // Game Services
        this.gameState = null;
        this.uiManager = null;
        this.appLoader = null; // To close the app

        // Game Logic
        this.symbols = ['🍒', '🍋', '🍊', '🍉', '🔔', '⭐', '🍀']; // Cherry, Lemon, Orange, Watermelon, Bell, Star, Clover
        this.spinCost = 10;
        this.isSpinning = false;

        // Bind methods
        this.handleSpin = this.handleSpin.bind(this);
        this.handleExit = this.handleExit.bind(this);
        this._updatePlayerMoneyDisplay = this._updatePlayerMoneyDisplay.bind(this);
    }

    init(container, services) {
        this.container = container; // This is #phone-screen, app content is already loaded
        this.gameState = services.gameState;
        this.uiManager = services.uiManager;
        this.appLoader = services.appLoader; // Get AppLoader from services

        // Query for elements within the loaded HTML
        this.reelElements = [
            this.container.querySelector('#reel1 .reel-symbol'),
            this.container.querySelector('#reel2 .reel-symbol'),
            this.container.querySelector('#reel3 .reel-symbol')
        ];
        this.spinButton = this.container.querySelector('#slot-spin-button');
        this.messageArea = this.container.querySelector('#slots-message-area p');
        this.playerMoneyDisplay = this.container.querySelector('#slots-player-money');
        this.exitButton = this.container.querySelector('#slots-exit-button');

        if (!this.spinButton || !this.exitButton || this.reelElements.some(el => !el) || !this.messageArea || !this.playerMoneyDisplay) {
            debugLogger.error("SlotsApp", "Could not find all necessary DOM elements after HTML load.");
            if (this.uiManager) this.uiManager.showNotification("Error initializing Slots App UI.", "error");
            return;
        }

        this.spinButton.addEventListener('click', this.handleSpin);
        this.exitButton.addEventListener('click', this.handleExit);

        // Initial UI setup
        this._updatePlayerMoneyDisplay();
        this.resetReels();
        this.displayMessage(`Welcome! Cost per spin: $${this.spinCost}`);

        // Listen for money changes from GameState to keep display in sync
        this.gameState.on('moneyChanged', this._updatePlayerMoneyDisplay);

        debugLogger.log("SlotsApp", "Slots App Initialized.");
    }

    _updatePlayerMoneyDisplay() {
        if (this.playerMoneyDisplay && this.gameState) {
            this.playerMoneyDisplay.textContent = `$${this.gameState.money}`;
        }
        // Disable spin button if not enough money
        if (this.spinButton && this.gameState) {
            this.spinButton.disabled = this.gameState.money < this.spinCost || this.isSpinning;
        }
    }

    displayMessage(message, isError = false) {
        if (this.messageArea) {
            this.messageArea.textContent = message;
            this.messageArea.className = isError ? 'error' : '';
        }
    }

    resetReels(useQuestionMark = true) {
        this.reelElements.forEach(reel => {
            reel.textContent = useQuestionMark ? '?' : this.getRandomSymbol();
            reel.classList.remove('stopped'); // Start animation
        });
    }

    getRandomSymbol() {
        return this.symbols[Math.floor(Math.random() * this.symbols.length)];
    }

    async handleSpin() {
        if (this.isSpinning) return;
        if (this.gameState.money < this.spinCost) {
            this.displayMessage("Not enough money to spin!", true);
            this.uiManager.showNotification("Not enough money!", "error");
            return;
        }

        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.gameState.adjustMoney(-this.spinCost);
        // _updatePlayerMoneyDisplay will be called by the 'moneyChanged' event

        this.displayMessage("Spinning...");
        this.reelElements.forEach(reel => reel.classList.remove('stopped')); // Ensure spinning animation

        // Simulate spinning animation delay
        // Each reel stops at a slightly different time
        const spinDuration = 1000; // Base duration for spinning
        const results = [];

        for (let i = 0; i < this.reelElements.length; i++) {
            await new Promise(resolve => setTimeout(resolve, spinDuration / 2 + Math.random() * (spinDuration / 2)));
            const symbol = this.getRandomSymbol();
            results.push(symbol);
            this.reelElements[i].textContent = symbol;
            this.reelElements[i].classList.add('stopped');
        }

        this.evaluateResults(results);
        this.isSpinning = false;
        this._updatePlayerMoneyDisplay(); // Re-check button disable state
    }

    evaluateResults(results) {
        // results is an array like ['🍒', '🍋', '🍊']
        let winnings = 0;
        let message = "No win. Try again!";

        // Basic win conditions (can be expanded)
        if (results[0] === results[1] && results[1] === results[2]) { // Three of a kind
            const symbol = results[0];
            if (symbol === '⭐') winnings = 250;
            else if (symbol === '🔔') winnings = 100;
            else if (symbol === '🍉') winnings = 50;
            else if (symbol === '🍀') winnings = 40;
            else if (symbol === '🍊') winnings = 30;
            else if (symbol === '🍋') winnings = 20;
            else if (symbol === '🍒') winnings = 15;
            message = `JACKPOT! Three ${symbol}! You win $${winnings}!`;
        } else if (results.filter(s => s === '🍒').length === 2) { // Two cherries
            winnings = 5;
            message = `Two Cherries! You win $${winnings}!`;
        } else if (results.filter(s => s === '🍒').length === 1) { // One cherry
            winnings = 2;
            message = `One Cherry! You win $${winnings}!`;
        }
        // Add more complex win conditions (e.g., specific pairs, sequences)

        if (winnings > 0) {
            this.gameState.adjustMoney(winnings);
            this.displayMessage(message);
            this.uiManager.showNotification(`You won $${winnings} in slots!`, 'success');
        } else {
            this.displayMessage(message, true); // No win is a type of "error" or negative feedback
        }
    }

    handleExit() {
        if (this.appLoader) {
            this.appLoader.openApp('home'); // Or whatever the ID for the home screen is
        }
    }

    destroy() {
        // Remove event listeners to prevent memory leaks
        if (this.spinButton) {
            this.spinButton.removeEventListener('click', this.handleSpin);
        }
        if (this.exitButton) {
            this.exitButton.removeEventListener('click', this.handleExit);
        }

        // Unsubscribe from GameState events
        this.gameState.off('moneyChanged', this._updatePlayerMoneyDisplay);

        // Clear references
        this.container = null;
        this.reelElements = [];
        this.spinButton = null;
        this.messageArea = null;
        this.playerMoneyDisplay = null;
        this.exitButton = null;
        this.gameState = null;
        this.uiManager = null;
        this.appLoader = null;

        debugLogger.log("SlotsApp", "Slots App Destroyed. Listeners removed, references cleared.");
    }
}

export default new SlotsApp();
