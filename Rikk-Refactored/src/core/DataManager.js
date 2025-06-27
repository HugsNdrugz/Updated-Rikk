// src/core/DataManager.js

class DataManager {
    constructor() {
        this.items = null;
        this.contacts = null;
        this.customerTemplates = null;
        this.events = null; // from events.json (formerly data_events.json)
        this.worldEvents = null; // from world_events.json (formerly data_events.js)
        this.mapData = null;
        this.newsArticles = null;
        this.etiquetteRules = null;
        this.feedbackMessages = null;
        this.consequences = null;

        // Item-specific lookups
        this.itemQualityLevels = null;
        this.itemQualityModifiers = null;
        this.itemTypes = null;
    }

    async loadAllData() {
        try {
            const [
                itemsData,
                contactsData,
                customerTemplatesData,
                eventsData,
                worldEventsData,
                mapData,
                newsArticlesData,
                etiquetteRulesData,
                feedbackMessagesData,
                consequencesData
            ] = await Promise.all([
                fetch('/data/items.json').then(res => res.json()),
                fetch('/data/contacts.json').then(res => res.json()),
                fetch('/data/customer_templates.json').then(res => res.json()),
                fetch('/data/events.json').then(res => res.json()),
                fetch('/data/world_events.json').then(res => res.json()),
                fetch('/data/map.json').then(res => res.json()),
                fetch('/data/news_articles.json').then(res => res.json()),
                fetch('/data/etiquette_rules.json').then(res => res.json()),
                fetch('/data/feedback_messages.json').then(res => res.json()),
                fetch('/data/consequences.json').then(res => res.json())
            ]);

            // Store combined items data
            this.items = itemsData; // Contains ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS, and itemTypes
            this.itemQualityLevels = itemsData.ITEM_QUALITY_LEVELS;
            this.itemQualityModifiers = itemsData.ITEM_QUALITY_MODIFIERS;
            this.itemTypes = itemsData.itemTypes; // This is the array of item definitions

            this.contacts = contactsData;
            this.customerTemplates = customerTemplatesData;
            this.events = eventsData;
            this.worldEvents = worldEventsData;
            this.mapData = mapData; // This is the array of district data
            this.newsArticles = newsArticlesData; // Contains staticNewsArticles and dynamicNewsTemplates
            this.etiquetteRules = etiquetteRulesData;
            this.feedbackMessages = feedbackMessagesData;
            this.consequences = consequencesData;

            console.log("DataManager: All game data loaded successfully.");

        } catch (error) {
            console.error("DataManager: Error loading game data", error);
            // Consider how to handle critical data load failures - perhaps a game state that prevents play
        }
    }

    // --- Item Data Getters ---
    getItemById(id) {
        return this.itemTypes ? this.itemTypes.find(item => item.id === id) : null;
    }

    getAllItems() {
        return this.itemTypes || [];
    }

    getItemQualityLevelsForType(itemType) {
        return this.itemQualityLevels ? this.itemQualityLevels[itemType] : null;
    }

    getItemQualityModifiersForType(itemType) {
        return this.itemQualityModifiers ? this.itemQualityModifiers[itemType] : null;
    }

    // --- Contacts Data Getters ---
    getContactById(id) {
        return this.contacts ? this.contacts.find(contact => contact.id === id) : null;
    }

    getAllContacts() {
        return this.contacts || [];
    }

    // --- Customer Templates Data Getters ---
    getCustomerTemplateByKey(key) {
        return this.customerTemplates ? this.customerTemplates[key] : null;
    }

    getAllCustomerTemplates() {
        return this.customerTemplates || {};
    }

    // --- Events Data Getters (events.json) ---
    getEventById(id) {
        return this.events ? this.events.find(event => event.id === id) : null;
    }

    getAllEvents() {
        return this.events || [];
    }

    // --- World Events Data Getters (world_events.json) ---
    getWorldEventById(id) {
        return this.worldEvents ? this.worldEvents.find(event => event.id === id) : null;
    }

    getAllWorldEvents() {
        return this.worldEvents || [];
    }

    // --- Map Data Getters ---
    getDistrictById(id) {
        return this.mapData ? this.mapData.find(district => district.id === id) : null;
    }

    getAllDistricts() {
        return this.mapData || [];
    }

    // --- News Articles Data Getters ---
    getStaticNewsArticleById(id) {
        return this.newsArticles ? this.newsArticles.staticNewsArticles.find(article => article.id === id) : null;
    }

    getAllStaticNewsArticles() {
        return this.newsArticles ? this.newsArticles.staticNewsArticles || [] : [];
    }

    getDynamicNewsTemplateById(templateId) {
        return this.newsArticles ? this.newsArticles.dynamicNewsTemplates.find(template => template.templateId === templateId) : null;
    }

    getAllDynamicNewsTemplates() {
        return this.newsArticles ? this.newsArticles.dynamicNewsTemplates || [] : [];
    }

    // --- Etiquette Rules Data Getters ---
    getEtiquetteRuleById(id) {
        return this.etiquetteRules ? this.etiquetteRules.find(rule => rule.id === id) : null;
    }

    getAllEtiquetteRules() {
        return this.etiquetteRules || [];
    }

    // --- Feedback Messages Data Getters ---
    getFeedbackMessageById(id) {
        return this.feedbackMessages ? this.feedbackMessages[id] : null;
    }

    getAllFeedbackMessages() {
        return this.feedbackMessages || {};
    }

    // --- Consequences Data Getters ---
    getConsequenceById(id) {
        return this.consequences ? this.consequences.find(consequence => consequence.consequenceId === id) : null;
    }

    getAllConsequences() {
        return this.consequences || [];
    }
}

// Export a single instance so the whole game shares the same DataManager.
export const dataManager = new DataManager();
