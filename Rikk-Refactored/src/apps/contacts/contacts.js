// src/apps/contacts/contacts.js
import { debugLogger } from '../../core/utils.js'; // Adjusted path

class ContactsApp {
    constructor() {
        this.htmlPath = '/src/apps/contacts/contacts.html';
        this.cssPath = '/src/apps/contacts/contacts.css';

        // DOM Elements
        this.container = null;
        this.contactListContainer = null;
        this.contactDetailView = null;
        this.contactDetailContent = null; // Specific elements within detail view
        this.backButton = null;
        this.exitButton = null;

        // Services
        this.gameState = null;
        this.dataManager = null;
        this.uiManager = null;
        this.appLoader = null;

        // State
        this.contactsData = []; // To store processed contact data
        this.selectedContactId = null;

        // Bind methods
        this._renderContactList = this._renderContactList.bind(this);
        this._showContactDetail = this._showContactDetail.bind(this);
        this._showContactList = this._showContactList.bind(this);
        this.handleExit = this.handleExit.bind(this);
    }

    init(container, services) {
        this.container = container; // This is #phone-screen
        this.gameState = services.gameState;
        this.dataManager = services.dataManager;
        this.uiManager = services.uiManager;
        this.appLoader = services.appLoader;

        // Query for elements within the loaded HTML
        this.contactListContainer = this.container.querySelector('#contact-list-container');
        this.contactDetailView = this.container.querySelector('#contact-detail-view');
        this.contactDetailContent = {
            name: this.container.querySelector('#detail-contact-name'),
            avatar: this.container.querySelector('#detail-contact-avatar'),
            description: this.container.querySelector('#detail-contact-description'),
            loyalty: this.container.querySelector('#detail-contact-loyalty'),
            servicesList: this.container.querySelector('#detail-services-list'),
            missionsList: this.container.querySelector('#detail-missions-list'),
        };
        this.backButton = this.container.querySelector('#back-to-contact-list');
        this.exitButton = this.container.querySelector('#contacts-exit-button');

        if (!this.contactListContainer || !this.contactDetailView || !this.backButton || !this.exitButton || !this.contactDetailContent.name) {
            debugLogger.error("ContactsApp", "Could not find all necessary DOM elements.");
            if(this.uiManager) this.uiManager.showNotification("Error initializing Contacts App UI.", "error");
            return;
        }

        this.loadContacts();
        this._renderContactList();
        this._showContactList(); // Start with the list view

        // Event Listeners
        this.backButton.addEventListener('click', this._showContactList);
        this.exitButton.addEventListener('click', this.handleExit);

        // Listen for gameState changes that might affect contact display (e.g., loyalty)
        this.gameState.on('contactLoyaltyChanged', this.handleContactUpdate.bind(this));
        this.gameState.on('contactMissionCompleted', this.handleContactUpdate.bind(this));


        debugLogger.log("ContactsApp", "Contacts App Initialized.");
    }

    loadContacts() {
        const rawContacts = this.dataManager.getAllContacts();
        const contactsState = this.gameState.contactsState; // Player-specific state like loyalty

        this.contactsData = rawContacts.map(contact => {
            const state = contactsState[contact.id] || { loyalty: contact.initialLoyalty, missionsCompleted: [] };
            // Filter services/missions based on loyalty or street cred if rules were defined
            // For now, show all that are unlocked by default street cred
            const unlocked = contact.streetCredUnlockRequirement <= this.gameState.streetCred;
            return {
                ...contact,
                currentLoyalty: state.loyalty,
                missionsCompleted: state.missionsCompleted || [],
                isUnlocked: unlocked,
            };
        }).filter(contact => contact.isUnlocked); // Only keep unlocked contacts for display

        // Sort contacts, e.g., by name or unlock status
        this.contactsData.sort((a, b) => a.name.localeCompare(b.name));
    }

    handleContactUpdate(eventData) {
        // This is called when contact loyalty or mission status changes
        // Re-load and re-render the list and detail view if necessary
        this.loadContacts();
        if (this.selectedContactId) {
            const updatedContact = this.contactsData.find(c => c.id === this.selectedContactId);
            if (updatedContact) {
                this._populateDetailView(updatedContact);
            } else { // Contact might have become locked or data changed
                this._showContactList();
            }
        }
        this._renderContactList(); // Always refresh list as loyalty might be displayed there too
    }


    _renderContactList() {
        if (!this.contactListContainer) return;
        this.contactListContainer.innerHTML = ''; // Clear previous list

        if (this.contactsData.length === 0) {
            this.contactListContainer.innerHTML = '<p>No contacts available yet. Increase your Street Cred!</p>';
            return;
        }

        this.contactsData.forEach(contact => {
            const itemElement = document.createElement('div');
            itemElement.className = 'contact-list-item';
            itemElement.setAttribute('data-contact-id', contact.id);

            itemElement.innerHTML = `
                <img src="${contact.avatarUrl || 'assets/images/contacts/default_avatar.png'}" alt="${contact.name}" class="contact-avatar">
                <div class="contact-info">
                    <h3>${contact.name}</h3>
                    <p>${contact.description.substring(0, 40)}...</p>
                    <p><small>Loyalty: ${contact.currentLoyalty}</small></p>
                </div>
            `;
            itemElement.addEventListener('click', () => this._showContactDetail(contact.id));
            this.contactListContainer.appendChild(itemElement);
        });
    }

    _showContactDetail(contactId) {
        this.selectedContactId = contactId;
        const contact = this.contactsData.find(c => c.id === contactId);

        if (!contact) {
            debugLogger.error("ContactsApp",`Contact with ID ${contactId} not found.`);
            if(this.uiManager) this.uiManager.showNotification("Contact not found.", "error");
            this._showContactList();
            return;
        }

        this._populateDetailView(contact);

        this.contactListContainer.classList.add('hidden');
        this.contactDetailView.classList.remove('hidden');
    }

    _populateDetailView(contact) {
        this.contactDetailContent.name.textContent = contact.name;
        this.contactDetailContent.avatar.src = contact.avatarUrl || 'assets/images/contacts/default_avatar.png';
        this.contactDetailContent.avatar.alt = contact.name;
        this.contactDetailContent.description.textContent = contact.description;
        this.contactDetailContent.loyalty.textContent = contact.currentLoyalty;

        // Populate Services
        this.contactDetailContent.servicesList.innerHTML = '';
        if (contact.services && contact.services.length > 0) {
            contact.services.forEach(service => {
                // Future: Add conditions for service availability (e.g., loyalty lock)
                const li = document.createElement('li');
                li.textContent = service.name;
                // Add click handlers for services if they are interactive
                // li.addEventListener('click', () => this.handleServiceInteraction(service.serviceId));
                this.contactDetailContent.servicesList.appendChild(li);
            });
        } else {
            this.contactDetailContent.servicesList.innerHTML = '<li>No services available.</li>';
        }

        // Populate Missions
        this.contactDetailContent.missionsList.innerHTML = '';
        if (contact.missions && contact.missions.length > 0) {
            contact.missions.forEach(mission => {
                const isCompleted = contact.missionsCompleted.includes(mission.missionId);
                const status = isCompleted ? 'Completed' : (mission.status || 'Available'); // Default to 'Available'
                const li = document.createElement('li');
                li.textContent = `${mission.name} (${status})`;
                if (!isCompleted && status !== 'locked') { // Make available missions clickable
                    // li.addEventListener('click', () => this.handleMissionInteraction(mission.missionId));
                    // li.style.cursor = 'pointer';
                }
                this.contactDetailContent.missionsList.appendChild(li);
            });
        } else {
            this.contactDetailContent.missionsList.innerHTML = '<li>No missions available.</li>';
        }
    }

    _showContactList() {
        this.selectedContactId = null;
        this.contactDetailView.classList.add('hidden');
        this.contactListContainer.classList.remove('hidden');
    }

    handleExit() {
        if (this.appLoader) {
            this.appLoader.openApp('home');
        }
    }

    destroy() {
        if (this.backButton) this.backButton.removeEventListener('click', this._showContactList);
        if (this.exitButton) this.exitButton.removeEventListener('click', this.handleExit);

        this.gameState.off('contactLoyaltyChanged', this.handleContactUpdate.bind(this));
        this.gameState.off('contactMissionCompleted', this.handleContactUpdate.bind(this));

        // Clear DOM references
        this.container = null;
        this.contactListContainer = null;
        this.contactDetailView = null;
        this.contactDetailContent = null;
        this.backButton = null;
        this.exitButton = null;
        this.services = null;
        this.gameState = null;
        this.dataManager = null;
        this.uiManager = null;
        this.appLoader = null;
        this.contactsData = [];

        debugLogger.log("ContactsApp", "Contacts App Destroyed.");
    }
}

export default new ContactsApp();
