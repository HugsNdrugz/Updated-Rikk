Rikk: The Definitive Architectural Blueprint

This document outlines a complete, professional-grade refactoring strategy. The objective is to evolve the codebase from a collection of interconnected scripts into a robust, scalable, and modern application architecture. Adhering to this blueprint will make adding new content and features—like phone apps—a simple, predictable, and isolated process.

Part I: The Philosophical Foundation - Why We Are Doing This

The current architecture, common in early-stage projects, relies on a "global scope" model. You load a series of <script> tags, and they all share one big, open workspace. GameState.js defines a variable, and script.js can directly access and modify it.

The Problem (The "Messy Workshop"):
Imagine a workshop where every tool is just left out on the main floor. When you need a 10mm socket, you have to scan the entire room. When you're done, you drop it where you stood. Soon, you have multiple versions of the same tool, tools get lost, and using one tool might accidentally knock over another. This is "global scope pollution" and "tight coupling." It works when you only have a few tools, but it becomes chaos as the project grows.

The Solution (The "Organized Toolbox"):
We are building a clean, organized workshop with a designated toolbox for every job. Each toolbox (a "Module") contains only the tools needed for that task. The main workbench holds only the essential, shared systems.

Our architecture will be built on these core principles:

Modularity & Encapsulation: Every distinct piece of the game (a phone app, the HUD, the Street Cred system) will be a self-contained module. Its internal logic and data are private. It will not know, nor care, about the internal workings of other modules.

Single Source of Truth (SSoT): All critical, dynamic game data (player's money, inventory, stats) will live in one and only one place: the GameState module. No other module will store its own copy of the player's money. They will ask GameState for it.

Explicit, Controlled Communication: Modules will not randomly grab variables from each other. They will communicate through two primary, controlled methods:

Dependency Injection: A module will be given the tools it needs to function when it's created.

Event-Driven Architecture: When something important happens, a module will broadcast an "event" (a message) to the entire system. Other modules can "listen" for these events and react accordingly, without the broadcaster needing to know who is listening.

Part II: The New File Structure - The Master Blueprint

This is our new, clean directory structure. This is non-negotiable for organization.

/Rikk-Refactored/
|
|-- index.html              # The master HTML shell. The ONLY .html file.
|
|-- /assets/                # Shared, non-code files (fonts, global images/icons).
|
|-- /data/                  # ALL static game data lives here as JSON.
|   |-- items.json
|   |-- contacts.json
|   |-- events.json
|   |-- map.json
|   |-- ...etc.
|
|-- /src/                   # ALL JavaScript source code lives here.
|   |
|   |-- /apps/              # Every self-contained Phone App.
|   |   |-- /slots/
|   |   |   |-- slots.js    # The app's logic module.
|   |   |   |-- slots.css   # The app's unique styles.
|   |   |   |-- slots.html  # The app's unique HTML template.
|   |   |
|   |   |-- /contacts/
|   |   |   |-- contacts.js
|   |   |   |-- contacts.css
|   |   |   |-- contacts.html
|   |
|   |-- /core/              # The absolute central engine of the game.
|   |   |-- main.js         # The main entry point. Initializes everything.
|   |   |-- Game.js         # The main Game class that orchestrates everything.
|   |   |-- GameState.js    # Manages all dynamic player data.
|   |   |-- UIManager.js    # Manages global UI (HUD, notifications, modals).
|   |   |-- DataManager.js  # Loads and provides access to all /data/ files.
|   |   |-- AppLoader.js    # The "Operating System" for the phone apps.
|   |
|   |-- /systems/           # Formerly "managers". Core game logic systems.
|   |   |-- StreetCred.js
|   |   |-- Loyalty.js
|   |   |-- WorldEvents.js
|
|-- /styles/                # ALL CSS files live here.
|   |-- main.css              # Global styles, layout, CSS variables (theming).
|   |-- phone.css             # Styles for the phone's physical frame and home screen.
|   |-- hud.css               # Styles for the Heads-Up Display.


Part III: The Phased Refactoring Process - A Deep Dive

Phase 1: Foundation and Data Abstraction

Action 1: Convert All Data to JSON.
Your current data/*.js files are a mix of data and executable code. We must separate them.

Before: const itemsData = [{...}];

After (/data/items.json): [ { "id": 1, "name": "Backpack", ... } ] (Note the double quotes on keys, which is required for valid JSON).
Do this for every single data file.

Action 2: Create the DataManager.
This module's only job is to load all that JSON data on startup and provide it to the rest of the game. This prevents every other module from needing to know how to fetch files.

// src/core/DataManager.js

class DataManager {
    constructor() {
        this.items = [];
        this.contacts = [];
        // ... and so on for all your data types
    }

    // This method will be called once at the very beginning of the game.
    async loadAllData() {
        // Using Promise.all to fetch all data files concurrently for speed.
        const [items, contacts] = await Promise.all([
            fetch('/data/items.json').then(res => res.json()),
            fetch('/data/contacts.json').then(res => res.json())
        ]);

        this.items = items;
        this.contacts = contacts;
        console.log("DataManager: All game data loaded.");
    }

    // Example of a "getter" method.
    getItemById(id) {
        return this.items.find(item => item.id === id);
    }
    
    getAllContacts() {
        return this.contacts;
    }
}

// Export a single instance so the whole game shares the same DataManager.
export const dataManager = new DataManager();


Action 3: Create the Master HTML Shell and Global CSS.
Your index.html becomes extremely simple. It's just a skeleton. The <div id="phone-screen"></div> is the "stage" for our apps.

Your /styles/main.css will define your CSS Variables. This is how you'll manage themes like dark mode easily.

/* /styles/main.css */
:root {
  --bg-primary: #F3F4F6;
  --text-primary: #1F2937;
  --accent-color: #3B82F6;
  --phone-bg: #FFFFFF;
  --border-color: #E5E7EB;
}

body.dark-mode {
  --bg-primary: #111827;
  --text-primary: #F9FAFB;
  --accent-color: #60A5FA;
  --phone-bg: #1F2937;
  --border-color: #374151;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
}


Phase 2: The Core Engine - Game, GameState, and Communication

Action 4: Create the GameState with an Event Emitter.
This is the single source of truth for player data. Crucially, it will announce changes.

// src/core/GameState.js

// A simple Event Emitter class
class EventEmitter {
    constructor() { this.events = {}; }
    on(eventName, listener) {
        if (!this.events[eventName]) { this.events[eventName] = []; }
        this.events[eventName].push(listener);
    }
    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(listener => listener(data));
        }
    }
}

export class GameState extends EventEmitter {
    constructor() {
        super(); // Initializes the event emitter capabilities
        this._money = 1000;
        this._streetCred = 0;
        this._inventory = [];
    }
    
    get money() {
        return this._money;
    }

    adjustMoney(amount) {
        this._money += amount;
        // ANNOUNCE THE CHANGE!
        this.emit('moneyChanged', this._money); 
    }
    
    // ... other getters and methods for cred, inventory, etc.
}


Action 5: Create the Global UIManager.
This module controls the HUD and listens for GameState events.

// src/core/UIManager.js

export class UIManager {
    constructor(gameState) {
        this.moneyElement = document.getElementById('hud-money');
        this.credElement = document.getElementById('hud-cred');
        
        // LISTEN for announcements from GameState.
        gameState.on('moneyChanged', (newAmount) => this.updateMoney(newAmount));
        gameState.on('credChanged', (newAmount) => this.updateCred(newAmount));
    }

    updateMoney(amount) {
        this.moneyElement.textContent = `$${amount}`;
    }

    updateCred(amount) {
        this.credElement.textContent = `${amount} XP`;
    }
    
    showNotification(message, type = 'info') {
        // Logic to create and display a temporary notification on the screen.
    }
}


Notice the decoupling: GameState has no idea the UIManager exists. It just shouts "My money changed!" into the void. UIManager is listening and knows what to do with that information.

Action 6: Create the Main Game Class.
This is the orchestrator. It builds all the core systems and connects them.

// src/core/Game.js
import { GameState } from './GameState.js';
import { UIManager } from './UIManager.js';
import { AppLoader } from './AppLoader.js';
import { dataManager } from './DataManager.js';

export class Game {
    constructor() {
        this.gameState = new GameState();
        this.uiManager = new UIManager(this.gameState); // Pass gameState to UI
        this.appLoader = new AppLoader();
        // ... initialize other systems like StreetCred, Loyalty, etc.
    }

    async start() {
        await dataManager.loadAllData();
        
        // Pass the core services to the AppLoader so it can give them to apps.
        const services = {
            gameState: this.gameState,
            dataManager: dataManager,
            uiManager: this.uiManager
        };
        this.appLoader.init(services);
        
        console.log("Game started successfully.");
        // Render the home screen, kick off the game loop, etc.
    }
}


Phase 3: The App Ecosystem - The "Plug-and-Play" Model

Action 7: Define the "App Standard" and Create the AppLoader.
Every app must conform to a contract. This makes them interchangeable. The AppLoader is the "OS" that runs them.

// src/core/AppLoader.js

export class AppLoader {
    constructor() {
        this.phoneScreen = document.getElementById('phone-screen');
        this.currentApp = null;
        this.services = {}; // Will be populated by Game.start()

        // The registry of all available apps. The key is the app's ID.
        this.appRegistry = {
            'slots': () => import('../apps/slots/slots.js'),
            'contacts': () => import('../apps/contacts/contacts.js'),
        };
    }
    
    init(services) {
        this.services = services;
        // Logic to render the home screen icons.
    }

    async openApp(appId) {
        if (!this.appRegistry[appId]) return console.error(`App not found: ${appId}`);

        // 1. Cleanup the old app
        if (this.currentApp && this.currentApp.destroy) {
            this.currentApp.destroy();
        }
        this.unloadAppCSS();

        // 2. Load the new app
        const appModule = await this.appRegistry[appId](); // e.g., { slotsApp: ... }
        this.currentApp = appModule.default; // Assuming export default

        // 3. Mount the new app
        this.loadAppCSS(this.currentApp.cssPath);
        this.phoneScreen.innerHTML = await fetch(this.currentApp.htmlPath).then(res => res.text());
        
        // 4. Initialize the new app's logic
        if (this.currentApp.init) {
            this.currentApp.init(this.phoneScreen, this.services);
        }
    }
    
    loadAppCSS(path) { /* ... logic to add <link> tag ... */ }
    unloadAppCSS() { /* ... logic to remove <link> tag ... */ }
}


Action 8: Refactor an Existing App (Slots Example).
Let's convert the slots game.

/src/apps/slots/slots.html: Contains only the HTML structure for the slots game.

/src/apps/slots/slots.css: Contains only the CSS rules for .slots-container, .reel, etc.

/src/apps/slots/slots.js: The logic module.

// src/apps/slots/slots.js

class SlotsApp {
    constructor() {
        this.htmlPath = '/src/apps/slots/slots.html';
        this.cssPath = '/styles/apps/slots.css'; // This would be managed by AppLoader
        this.spinButton = null;
        this.gameState = null; // Will be provided during init
    }

    // This is the main entry point called by AppLoader
    init(container, services) {
        this.gameState = services.gameState;
        
        this.spinButton = container.querySelector('#slot-spin-button');
        
        // IMPORTANT: Use .bind(this) to maintain the correct 'this' context inside the handler.
        this.spinButton.addEventListener('click', this.handleSpin.bind(this));
        
        console.log("Slots App Initialized.");
    }
    
    handleSpin() {
        if (this.gameState.money >= 10) {
            this.gameState.adjustMoney(-10); // Use the official method
            // ... run spin animation ...
        } else {
            // Use the UIManager service to show a notification
            this.services.uiManager.showNotification("Not enough money!", "error");
        }
    }
    
    // This is the cleanup function called by AppLoader before switching apps.
    destroy() {
        // Crucial for preventing memory leaks!
        this.spinButton.removeEventListener('click', this.handleSpin.bind(this));
        console.log("Slots App Destroyed. Listeners removed.");
    }
}

export default new SlotsApp();


Part IV: Putting It All Together - The main.js Entry Point

Finally, your main script is incredibly simple. Its only job is to create the main Game object and start it.

// src/core/main.js
import { Game } from './Game.js';

// This is the entire file.
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.start();

    // Make the game instance globally accessible for debugging if needed.
    window.rikkGame = game; 
});


Your index.html would only need to include this one script: <script type="module" src="/src/core/main.js"></script>. The module system handles the rest of the dependencies.

You now have a professional, robust, and scalable architecture. You've gone from a messy workshop to a state-of-the-art manufacturing facility. Adding a new feature is no longer a risky venture; it's a standardized, repeatable process.