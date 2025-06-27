// src/core/AppLoader.js
import { debugLogger } from './utils.js';

/**
 * AppLoader: Manages the loading, display, and lifecycle of phone applications.
 * It acts like a mini "Operating System" for the apps within the phone interface.
 */
export class AppLoader {
    constructor(gameState, dataManager) {
        this.gameState = gameState;
        this.dataManager = dataManager; // For apps that might need static data
        debugLogger.log('AppLoader', 'Constructor called.');

        this.phoneScreen = document.getElementById('phone-screen');
        this.phoneHomeScreen = document.getElementById('phone-home-screen');

        this.currentApp = null;
        this.currentAppId = null;
        this.services = {};

        // Define appRegistry with actual or placeholder icon paths
        // Ensure these paths are relative to the Rikk-Refactored/index.html location
        this.appRegistry = {
            'home': {
                name: 'Home',
                icon: 'assets/images/icons/home_icon.png', // Placeholder - ensure this exists or use a valid one
                module: async () => ({ default: this.createHomeScreenApp() })
            },
            'slots': {
                name: 'Slots',
                icon: 'assets/images/icons/slots_icon.png', // Placeholder
                module: () => import('../apps/slots/slots.js')
            },
            'contacts': {
                name: 'Contacts',
                icon: 'assets/images/icons/contacts_icon.png', // Placeholder
                module: () => import('../apps/contacts/contacts.js')
            },
            // Add other apps here as they are refactored or created
            // 'messages': { name: 'Messages', icon: 'assets/images/icons/messages_icon.png', module: () => import('../apps/messages/messages.js') },
            // 'map': { name: 'Map', icon: 'assets/images/icons/map_icon.png', module: () => import('../apps/map/map.js') },
            // 'news': { name: 'News', icon: 'assets/images/icons/news_icon.png', module: () => import('../apps/news/news.js') },
        };

        this.activeAppCssLink = null;
    }

    init(services) {
        this.services = services;
        this.renderHomeScreenIcons(); // Call this first
        if (!this.currentAppId || this.currentAppId === 'home') { // Ensure home is opened if no app or home was last
            this.openApp('home'); // Then open home
        }
        debugLogger.log("AppLoader","AppLoader initialized.");
    }

    createHomeScreenApp() {
        // This "app" makes the #phone-home-screen (icon container) visible.
        return {
            init: (container, services) => {
                debugLogger.log("AppLoader","Home screen app 'init' called.");
                if (this.phoneHomeScreen) {
                    this.phoneHomeScreen.style.display = 'flex'; // Make icon container visible
                    this.renderHomeScreenIcons(); // Re-render icons in case underlying data changed (e.g. new apps unlocked)
                }
                // Clear any main content from other apps in phoneScreen that isn't the homeScreen div
                Array.from(this.phoneScreen.children).forEach(child => {
                    if (child !== this.phoneHomeScreen) {
                        child.innerHTML = ''; // Or child.remove() if they are dynamically added full-screen containers
                    }
                });
            },
            destroy: () => {
                debugLogger.log("AppLoader","Home screen app 'destroy' called (hiding icon container).");
                if (this.phoneHomeScreen) {
                    this.phoneHomeScreen.style.display = 'none'; // Hide icon container
                }
            },
        };
    }

    renderHomeScreenIcons() {
        if (!this.phoneHomeScreen) {
            debugLogger.warn("AppLoader","Phone home screen element (#phone-home-screen) not found. Cannot render app icons.");
            return;
        }
        this.phoneHomeScreen.innerHTML = '';

        for (const appId in this.appRegistry) {
            if (appId === 'home') continue;

            const appConfig = this.appRegistry[appId];
            const iconElement = document.createElement('div');
            iconElement.className = 'app-icon';
            iconElement.setAttribute('data-app-id', appId);
            // Using a more robust way to set innerHTML to avoid issues with complex names
            const img = document.createElement('img');
            img.src = appConfig.icon || 'assets/icons/default_app_icon.png'; // Fallback icon
            img.alt = appConfig.name;

            const span = document.createElement('span');
            span.textContent = appConfig.name;

            iconElement.appendChild(img);
            iconElement.appendChild(span);

            iconElement.addEventListener('click', () => this.openApp(appId));
            this.phoneHomeScreen.appendChild(iconElement);
        }
    }

    async openApp(appId) {
        if (!this.appRegistry[appId]) {
            debugLogger.error(`AppLoader`, `App not found in registry: ${appId}`);
            if (this.services.uiManager) this.services.uiManager.showNotification(`App "${appId}" not found.`, "error");
            return;
        }

        if (this.currentAppId === appId && appId !== 'home') {
            debugLogger.log(`AppLoader`, `App ${appId} is already open.`);
            return;
        }

        debugLogger.log(`AppLoader`, `Opening app ${appId}...`);

        if (this.currentApp && typeof this.currentApp.destroy === 'function') {
            try {
                this.currentApp.destroy();
                debugLogger.log(`AppLoader`, `Destroyed previous app: ${this.currentAppId}`);
            } catch (e) {
                debugLogger.error(`AppLoader`, `Error destroying app ${this.currentAppId}:`, e);
            }
        }
        this.unloadAppCSS();
        if (this.phoneHomeScreen && appId !== 'home') {
            this.phoneHomeScreen.style.display = 'none';
        }

        try {
            const appModuleImport = await this.appRegistry[appId].module();
            this.currentApp = appModuleImport.default;
            this.currentAppId = appId;
            debugLogger.log(`AppLoader`, `Loaded module for app: ${appId}`);
        } catch (e) {
            debugLogger.error(`AppLoader`, `Error loading module for app ${appId}:`, e);
            if (this.services.uiManager) this.services.uiManager.showNotification(`Error loading app: ${appId}.`, "error");
            this.currentApp = null;
            this.currentAppId = null;
            if (appId !== 'home') this.openApp('home');
            return;
        }

        if (this.currentApp.htmlPath) {
            try {
                const htmlContent = await fetch(this.currentApp.htmlPath).then(res => {
                    if (!res.ok) throw new Error(`Failed to fetch HTML: ${res.status} ${res.statusText} for ${this.currentApp.htmlPath}`);
                    return res.text();
                });
                this.phoneScreen.innerHTML = htmlContent;
                debugLogger.log(`AppLoader`, `Mounted HTML for ${appId} from ${this.currentApp.htmlPath}`);
            } catch (e) {
                debugLogger.error(`AppLoader`, `Error fetching/mounting HTML for ${appId}:`, e);
                if (this.services.uiManager) this.services.uiManager.showNotification(`Error loading app view: ${appId}.`, "error");
                this.phoneScreen.innerHTML = `<p style='color:red; padding:10px;'>Error loading ${appId}. Details in console.</p>`;
                if (appId !== 'home') this.openApp('home');
                return;
            }
        } else if (appId === 'home') {
             this.phoneScreen.innerHTML = '';
             this.phoneScreen.appendChild(this.phoneHomeScreen);
             if(this.phoneHomeScreen) this.phoneHomeScreen.style.display = 'flex'; // Ensure home icons are visible
        } else {
            this.phoneScreen.innerHTML = '';
            debugLogger.log(`AppLoader`, `App ${appId} has no htmlPath. Screen cleared.`);
        }

        if (this.currentApp.cssPath) {
            this.loadAppCSS(this.currentApp.cssPath, appId);
        }

        if (this.currentApp && typeof this.currentApp.init === 'function') {
            try {
                this.currentApp.init(this.phoneScreen, this.services);
                debugLogger.log(`AppLoader`, `Initialized logic for app: ${appId}`);
            } catch (e) {
                debugLogger.error(`AppLoader`, `Error initializing app ${appId}:`, e);
                if (this.services.uiManager) this.services.uiManager.showNotification(`Error starting app: ${appId}.`, "error");
                if (appId !== 'home') this.openApp('home');
            }
        }
        this.gameState.setGameFlag('currentOpenApp', appId);
    }

    loadAppCSS(cssPath, appId) {
        if (this.activeAppCssLink) {
            this.unloadAppCSS();
        }
        const link = document.createElement('link');
        link.id = `app-css-${appId}`;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = cssPath;
        document.head.appendChild(link);
        this.activeAppCssLink = link;
        debugLogger.log(`AppLoader`, `Loaded CSS for ${appId} from ${cssPath}`);
    }

    unloadAppCSS() {
        if (this.activeAppCssLink && this.activeAppCssLink.parentNode) {
            document.head.removeChild(this.activeAppCssLink);
            debugLogger.log(`AppLoader`, `Unloaded CSS: ${this.activeAppCssLink.id}`);
            this.activeAppCssLink = null;
        }
    }

    getActiveApp() {
        return this.currentApp;
    }
}
