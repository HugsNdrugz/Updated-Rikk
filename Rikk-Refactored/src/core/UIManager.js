// src/core/UIManager.js

export class UIManager {
    constructor(gameState, appLoader) {
        this.gameState = gameState;
        this.appLoader = appLoader; // Will be used later for phone interactions

        // HUD Elements
        this.moneyElement = document.getElementById('hud-money');
        this.timeElement = document.getElementById('hud-time');
        this.heatElement = document.getElementById('hud-heat');
        this.credElement = document.getElementById('hud-street-cred');

        // Phone Elements
        this.phoneElement = document.getElementById('phone');
        this.phoneScreenElement = document.getElementById('phone-screen');
        this.phoneHomeButton = document.getElementById('phone-home-button');

        // Notification Container
        this.notificationContainer = document.getElementById('world-notifications');

        // Modal Container and content
        this.modalContainer = document.getElementById('modal-container');

        this.bindEventListeners();
        this.initializeUI();
    }

    bindEventListeners() {
        // Listen for GameState changes
        this.gameState.on('moneyChanged', (data) => this.updateMoneyDisplay(data.newAmount));
        this.gameState.on('streetCredChanged', (data) => this.updateCredDisplay(data.newAmount));
        this.gameState.on('heatChanged', (data) => this.updateHeatDisplay(data.newAmount));
        this.gameState.on('timeChanged', (data) => this.updateTimeDisplay(data.newDay, data.newTime));
        this.gameState.on('locationChanged', (data) => this.updateLocationDisplay(data.newLocationId)); // Placeholder
        this.gameState.on('gameStateLoaded', () => this.initializeUI()); // Refresh UI on load

        // Phone interaction listeners (basic examples)
        if (this.phoneHomeButton && this.appLoader) {
            this.phoneHomeButton.addEventListener('click', () => this.appLoader.openApp('home')); // Assuming 'home' is the ID for home screen
        }

        // Toggle phone visibility (example - might be triggered by a button not yet created)
        // document.addEventListener('keydown', (e) => {
        //     if (e.key === 'p' || e.key === 'P') { // Toggle phone with 'P' key
        //         this.togglePhone();
        //     }
        // });
    }

    initializeUI() {
        // Initial population of UI elements from GameState
        this.updateMoneyDisplay(this.gameState.money);
        this.updateCredDisplay(this.gameState.streetCred);
        this.updateHeatDisplay(this.gameState.heat);
        this.updateTimeDisplay(this.gameState.currentDay, this.gameState.currentTime);
        // Any other UI elements that need to be set on load
        // For example, if phone starts hidden:
        // if (this.phoneElement) this.phoneElement.classList.add('hidden');
    }

    // --- HUD Update Methods ---
    updateMoneyDisplay(amount) {
        if (this.moneyElement) {
            this.moneyElement.textContent = `$${Math.floor(amount)}`;
        }
    }

    updateCredDisplay(amount) {
        if (this.credElement) {
            this.credElement.textContent = `Cred: ${amount}`;
        }
    }

    updateHeatDisplay(amount) {
        if (this.heatElement) {
            this.heatElement.textContent = `Heat: ${amount}`;
            this.heatElement.className = ''; // Reset classes
            if (amount >= 75) {
                this.heatElement.classList.add('high');
            } else if (amount >= 40) {
                this.heatElement.classList.add('medium');
            } else {
                this.heatElement.classList.add('low');
            }
        }
    }

    updateTimeDisplay(day, time) {
        if (this.timeElement) {
            const formattedTime = String(time).padStart(2, '0') + ":00";
            this.timeElement.textContent = `Day ${day}, ${formattedTime}`;
        }
    }

    updateLocationDisplay(locationId) {
        // Placeholder: In a real game, this might update a map or district name display
        console.log(`UIManager: Location changed to ${locationId}`);
        // Example: if there was an element <div id="hud-location"></div>
        // const locationElement = document.getElementById('hud-location');
        // if (locationElement) locationElement.textContent = locationId;
    }

    // --- Notification System ---
    showNotification(message, type = 'info', duration = 5000) {
        if (!this.notificationContainer) return;

        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${type}`; // e.g., 'info', 'success', 'error', 'warning'
        notificationElement.textContent = message;

        this.notificationContainer.appendChild(notificationElement);

        // Trigger animations (defined in main.css)
        // Animations handle their own removal or hiding after duration via keyframes

        // Fallback removal if CSS animations aren't perfectly synced or for cleanup
        setTimeout(() => {
            if (notificationElement.parentNode === this.notificationContainer) {
                 this.notificationContainer.removeChild(notificationElement);
            }
        }, duration);
    }

    // --- Phone Management ---
    togglePhone() {
        if (this.phoneElement) {
            const isHidden = this.phoneElement.classList.toggle('hidden');
            this.gameState.setGameFlag('isPhoneActive', !isHidden);
            if (!isHidden && this.appLoader) {
                // If phone is opened and no app is active, or to ensure home screen is shown
                if (!this.appLoader.currentApp) {
                     this.appLoader.openApp('home'); // Or your default app ID
                }
            }
            console.log(`Phone visibility toggled. Active: ${!isHidden}`);
        }
    }

    openPhone() {
        if (this.phoneElement && this.phoneElement.classList.contains('hidden')) {
            this.togglePhone();
        }
    }

    closePhone() {
        if (this.phoneElement && !this.phoneElement.classList.contains('hidden')) {
            this.togglePhone();
        }
    }

    // --- Modal System (Basic Implementation) ---
    showModal(contentHTML, onConfirm, onCancel) {
        if (!this.modalContainer) return;

        this.modalContainer.innerHTML = ''; // Clear previous modal

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.innerHTML = contentHTML; // User-provided HTML for modal body

        // Example: Add Confirm and Cancel buttons
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirm';
        confirmButton.onclick = () => {
            if (onConfirm) onConfirm();
            this.hideModal();
        };

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.marginLeft = 'var(--spacing-2)';
        cancelButton.onclick = () => {
            if (onCancel) onCancel();
            this.hideModal();
        };

        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = 'var(--spacing-4)';
        buttonContainer.appendChild(confirmButton);
        buttonContainer.appendChild(cancelButton);
        modalContent.appendChild(buttonContainer);

        this.modalContainer.appendChild(modalContent);
        this.modalContainer.style.display = 'flex'; // Show modal
        this.gameState.setGameFlag('isPaused', true); // Pause game when modal is up
    }

    hideModal() {
        if (this.modalContainer) {
            this.modalContainer.style.display = 'none';
            this.modalContainer.innerHTML = ''; // Clear content
        }
        this.gameState.setGameFlag('isPaused', false); // Unpause game
    }

    // --- Dynamic Content Loading for Phone Screen (managed by AppLoader) ---
    // This UIManager will rely on AppLoader to handle the actual HTML/CSS of apps.
    // UIManager might provide services to apps via AppLoader, like showNotification.

    // Add more UI management methods as needed, e.g., for specific game interactions
}
