// src/core/Game.js
import { GameState } from './GameState.js';
import { UIManager } from './UIManager.js';
import { AppLoader } from './AppLoader.js';
import { dataManager } from './DataManager.js';
import { StreetCredSystem } from '../systems/StreetCred.js';
import { LoyaltySystem } from '../systems/Loyalty.js';
import { WorldEventSystem } from '../systems/WorldEvents.js';
import { debugLogger, DEBUG_MODE } from './utils.js';

export class Game {
    constructor() {
        // Pass dataManager to GameState constructor for initial contact loyalty if needed
        this.gameState = new GameState(dataManager);
        this.appLoader = new AppLoader(this.gameState, dataManager);
        this.uiManager = new UIManager(this.gameState, this.appLoader);

        this.streetCredSystem = new StreetCredSystem(this.gameState, dataManager, this.uiManager);
        this.loyaltySystem = new LoyaltySystem(this.gameState, dataManager);
        this.worldEventSystem = new WorldEventSystem(this.gameState, dataManager, this.uiManager);

        this.isRunning = false;
        this.lastTick = 0;
        this.gameLoop = this.gameLoop.bind(this);

        debugLogger.log("Game", "Game components instantiated.");
        if (DEBUG_MODE) {
            debugLogger.log("Game", "GameState:", this.gameState);
            debugLogger.log("Game", "DataManager:", dataManager);
            debugLogger.log("Game", "UIManager:", this.uiManager);
            debugLogger.log("Game", "AppLoader:", this.appLoader);
        }
    }

    async start() {
        if (this.isRunning) {
            debugLogger.warn("Game", "Game is already running.");
            return;
        }
        debugLogger.log("Game", "Starting Rikk's Hustle Refactored...");

        await dataManager.loadAllData();
        if (!dataManager.items) {
             debugLogger.error("Game", "Critical error: Game data failed to load. Cannot start game.");
             this.uiManager.showNotification("Error: Could not load game data. Please refresh.", "error", 10000);
             return;
        }

        this.gameState.loadGameState();

        const services = {
            gameState: this.gameState,
            dataManager: dataManager,
            uiManager: this.uiManager,
            worldEventSystem: this.worldEventSystem,
            // Expose other systems as services if apps need them
            streetCredSystem: this.streetCredSystem,
            loyaltySystem: this.loyaltySystem,
        };
        this.appLoader.init(services);
        this.uiManager.services = services; // Provide services to UIManager if needed for location name etc.


        this.worldEventSystem.initializeActiveEventsFromState();

        // Example: Initial time advancement to trigger first day's events/checks
        this.advanceGameTimeTick(0); // Advance 0 hours just to run initial tick logic

        this.isRunning = true;
        this.lastTick = performance.now();
        requestAnimationFrame(this.gameLoop);

        debugLogger.log("Game", "Rikk's Hustle Refactored game started successfully.");
        this.uiManager.showNotification("Game Ready!", "success", 3000);

        if (DEBUG_MODE) {
            window.rikkGame = this;
            debugLogger.log("Game", "Game instance is now available as window.rikkGame for debugging.");
        }
    }

    stop() {
        this.isRunning = false;
        debugLogger.log("Game", "Game stopped.");
        this.gameState.saveGameState(); // Save on stop
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = (timestamp - this.lastTick) / 1000;
        this.lastTick = timestamp;

        this.update(deltaTime);
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Advances game time by a specified number of hours and triggers time-based updates.
     * @param {number} [hours=1] - Number of game hours to advance.
     */
    advanceGameTimeTick(hours = 1) {
        if (this.gameState.gameFlags.isPaused && hours > 0) { // Allow 0-hour tick even if paused for init
            debugLogger.log("Game", "Game is paused, time tick advancement skipped.");
            return;
        }

        if (hours > 0) {
            this.gameState.advanceTime(hours); // Advances game time, emits 'timeChanged', 'dayChanged'
        }

        // Systems that react to time progression or need periodic updates
        this.worldEventSystem.tickEventDurations(); // Decrement event durations based on game time
        this.worldEventSystem.update(); // Check for new random events, expired events, consequences

        // Other time-dependent updates can go here (e.g., market price fluctuations, NPC schedules)

        debugLogger.log("Game", `Advanced game time tick by ${hours} hour(s).`);
        this.gameState.saveGameState(); // Auto-save after significant time progression
    }

    /**
     * Main update method called every frame. Handles frame-based logic.
     * @param {number} deltaTime - Time elapsed since the last frame in seconds.
     */
    update(deltaTime) {
        if (this.gameState.gameFlags.isPaused) return;

        // Update current app if it has an update method that runs every frame (e.g., for animations)
        if (this.appLoader.currentApp && typeof this.appLoader.currentApp.update === 'function') {
            this.appLoader.currentApp.update(deltaTime);
        }
        // Other per-frame logic can go here
    }

    // render() {
        // Most rendering is event-driven via UIManager or handled by AppLoader's HTML/CSS.
    // }
}
