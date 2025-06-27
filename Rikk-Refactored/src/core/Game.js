// src/core/Game.js
import { GameState } from './GameState.js';
import { UIManager } from './UIManager.js';
import { AppLoader } from './AppLoader.js'; // Will be fully utilized later
import { dataManager } from './DataManager.js';
// Import future system modules as they are created
import { StreetCredSystem } from '../systems/StreetCred.js';
import { LoyaltySystem } from '../systems/Loyalty.js';
import { WorldEventSystem } from '../systems/WorldEvents.js';

export class Game {
    constructor() {
        this.gameState = new GameState();
        // AppLoader needs to be instantiated before UIManager if UIManager needs it
        this.appLoader = new AppLoader(this.gameState, dataManager); // Pass dependencies to AppLoader
        this.uiManager = new UIManager(this.gameState, this.appLoader); // Pass gameState and appLoader to UIManager

        // Initialize other game systems here, passing dependencies
        this.streetCredSystem = new StreetCredSystem(this.gameState, dataManager, this.uiManager);
        this.loyaltySystem = new LoyaltySystem(this.gameState, dataManager);
        this.worldEventSystem = new WorldEventSystem(this.gameState, dataManager, this.uiManager);

        this.isRunning = false;
        this.lastTick = 0;
        this.gameLoop = this.gameLoop.bind(this); // Bind context for requestAnimationFrame

        console.log("Game components instantiated.");
        console.log("GameState:", this.gameState);
        console.log("DataManager:", dataManager);
        console.log("UIManager:", this.uiManager);
        console.log("AppLoader:", this.appLoader);
    }

    async start() {
        if (this.isRunning) {
            console.warn("Game is already running.");
            return;
        }
        console.log("Starting Rikk's Hustle Refactored...");

        // 1. Load all static game data
        await dataManager.loadAllData();
        if (!dataManager.items) { // Basic check to see if data loaded
             console.error("Critical error: Game data failed to load. Cannot start game.");
             this.uiManager.showNotification("Error: Could not load game data. Please refresh.", "error", 10000);
             return;
        }
        console.log("Game data loaded by DataManager.");

        // 2. Load saved game state or initialize new state
        this.gameState.loadGameState(); // This will also emit 'gameStateLoaded' or 'newGameStarted'
        console.log("GameState initialized/loaded.");

        // 3. Initialize core services for AppLoader
        // The services object allows apps to access core game functionalities in a controlled way.
        const services = {
            gameState: this.gameState,
            dataManager: dataManager,
            uiManager: this.uiManager,
            worldEventSystem: this.worldEventSystem, // Make WorldEventSystem available to apps if needed
            // Future: Add other services like soundManager etc.
        };
        this.appLoader.init(services); // Initialize AppLoader with core services
        console.log("AppLoader initialized with services.");

        // 4. Initialize UI Manager (already done in constructor for event binding, but can refresh)
        // UIManager's constructor already binds to gameState events.
        // initializeUI is called on 'gameStateLoaded'

        // 5. Initialize other game systems
        this.worldEventSystem.initializeActiveEventsFromState(); // Ensure loaded events are processed

        // 6. Start the game loop
        this.isRunning = true;
        this.lastTick = performance.now();
        requestAnimationFrame(this.gameLoop);

        console.log("Rikk's Hustle Refactored game started successfully.");
        this.uiManager.showNotification("Game Ready!", "success", 3000);

        // For debugging: make game instance globally accessible
        window.rikkGame = this;
    }

    stop() {
        this.isRunning = false;
        console.log("Game stopped.");
        // Potentially save game state here
        // this.gameState.saveGameState();
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = (timestamp - this.lastTick) / 1000; // Delta time in seconds
        this.lastTick = timestamp;

        this.update(deltaTime);
        // this.render(); // If there's a separate render step not handled by UIManager/AppLoader

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        // This is where time-based game logic would happen if not paused
        if (this.gameState.gameFlags.isPaused) return;

        // Example: Advance game time (simplified)
        // A more robust time system might be its own module
        // this.gameState.advanceTime(deltaTime * TIME_MULTIPLIER); // Where TIME_MULTIPLIER speeds up game time

        // Update active world events - this should be driven by game time ticks, not every frame.
        // For now, we can call it here, but it's better tied to game hour/day changes.
        // Let's assume for now it's okay to call frequently, and it has internal logic for when to act.
        this.worldEventSystem.update();

        // Update current app if it has an update method
        if (this.appLoader.currentApp && typeof this.appLoader.currentApp.update === 'function') {
            this.appLoader.currentApp.update(deltaTime);
        }
    }

    // render() {
        // Most rendering is event-driven via UIManager or handled by AppLoader's HTML/CSS.
        // This could be used for canvas animations or other direct rendering if needed.
    // }
}
