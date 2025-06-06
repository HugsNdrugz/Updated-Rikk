// =================================================================================
// CustomerManager Class
// =================================================================================
// This class is the definitive authority on all customer-related logic. It handles
// the generation of customer profiles, dialogue, interaction scenarios (buy/sell),
// item generation for customers, and value calculation. It is designed to be
// instantiated once by the main game script and fed the necessary game data,
// ensuring a clean separation of concerns.
// =================================================================================

export class CustomerManager {
    /**
     * Initializes the CustomerManager with all necessary data dependencies.
     * @param {object} customerArchetypesData - Data from data_customers.js
     * @param {object} itemTypesData - Data from data_items.js
     * @param {object} itemQualityLevelsData - Data from data_items.js
     * @param {object} itemQualityModifiersData - Data from data_items.js
     */
    constructor(customerArchetypesData, itemTypesData, itemQualityLevelsData, itemQualityModifiersData) {
        // Store references to all required game data, injected upon creation
        this.customerArchetypes = customerArchetypesData;
        this.itemTypes = itemTypesData;
        this.itemQualityLevels = itemQualityLevelsData;
        this.itemQualityModifiers = itemQualityModifiersData;

        // Internal state for managing the pool of unique customers
        this.customersPool = [];
        this.nextCustomerId = 1;
        this.MAX_CUSTOMERS_IN_POOL = 20; // Internal configuration
    }

    /**
     * The main public method to generate a complete customer interaction object.
     * The main script.js will call this single method to get everything it needs for an interaction.
     * @param {object} gameState - An object containing relevant state from the main script.
     * @returns {object} A fully-formed `currentCustomer` object for the interaction.
     */
    generateInteraction(gameState) {
        const { inventory, cash, playerSkills, activeWorldEvents } = gameState;
        const customerData = this._selectOrGenerateCustomerFromPool();

        // Safety check in case the archetype data is missing or corrupt
        if (!this.customerArchetypes || !this.customerArchetypes[customerData.archetypeKey]) {
            console.error(`CustomerManager: Invalid archetypeKey provided: ${customerData.archetypeKey}`);
            return {
                data: customerData, name: customerData.name || "Error Customer",
                dialogue: [{ speaker: "narration", text: "Error: Customer data is corrupted." }],
                choices: [{ text: "OK", outcome: { type: "acknowledge_error" } }],
                itemContext: null, archetypeKey: "ERROR_ARCHETYPE", mood: "error"
            };
        }

        const archetype = this.customerArchetypes[customerData.archetypeKey];
        let dialogue = [];
        let choices = [];
        let itemContext = null;

        // --- Step 1: Generate Initial Dialogue ---
        let greetingText = archetype.greeting(customerData, null);
        dialogue.push({ speaker: "customer", text: greetingText });
        const rikkOpeners = ["Aight, what's the word?", "Yo. Lay it on me.", "Speak. You buyin' or sellin'?"];
        dialogue.push({ speaker: "rikk", text: this._getRandomElement(rikkOpeners) });

        // --- Step 2: Determine Interaction Type (Customer Sells vs. Customer Buys) ---
        let customerWillOfferItemToRikk = Math.random() < 0.5;
        if (inventory.length === 0) customerWillOfferItemToRikk = true;
        if (inventory.length >= 10) customerWillOfferItemToRikk = false;

        if (archetype.sellsOnly) {
            customerWillOfferItemToRikk = true;
        }

        if (customerWillOfferItemToRikk) {
            // --- Scenario A: Customer is SELLING an item TO Rikk ---
            itemContext = this._generateRandomItem(archetype);
            const customerDemandsPrice = this._calculateItemValue(itemContext, true, { playerSkills, activeWorldEvents, customerData });
            let offerText = `Yo Rikk, peep this. Got a ${itemContext.quality} ${itemContext.name}. How's $${customerDemandsPrice} sound?`;
            dialogue.push({ speaker: "customer", text: offerText });

            if (cash >= customerDemandsPrice) {
                choices.push({ text: `Cop it ($${customerDemandsPrice})`, outcome: { type: "buy_from_customer", item: itemContext, price: customerDemandsPrice } });
            } else {
                choices.push({ text: `Cop it (Need $${customerDemandsPrice - cash} more)`, outcome: { type: "buy_from_customer" }, disabled: true });
            }
            choices.push({ text: "Nah, pass.", outcome: { type: "decline_offer_to_buy" } });

        } else if (inventory.length > 0) {
            // --- Scenario B: Customer is BUYING an item FROM Rikk ---
            itemContext = this._getRandomElement(inventory); // Pick a random item from Rikk's stash
            const rikkBaseSellPrice = this._calculateItemValue(itemContext, false, { playerSkills, activeWorldEvents, customerData });
            let customerOfferPrice = Math.round(rikkBaseSellPrice * archetype.priceToleranceFactor);
            customerOfferPrice = Math.min(customerOfferPrice, customerData.cashOnHand);

            let askText = `So, Rikk, that ${itemContext.quality} ${itemContext.name}... what's the word? I got $${customerOfferPrice} burnin' a hole.`;
            dialogue.push({ speaker: "customer", text: askText });

            if (customerData.cashOnHand >= customerOfferPrice) {
                choices.push({ text: `Serve 'em ($${customerOfferPrice})`, outcome: { type: "sell_to_customer", item: itemContext, price: customerOfferPrice } });
            } else {
                choices.push({ text: `Serve 'em ($${customerOfferPrice}) (Short!)`, outcome: { type: "sell_to_customer" }, disabled: true });
            }

            if (!archetype.negotiationResists && rikkBaseSellPrice > customerOfferPrice + 5) {
                const hagglePrice = Math.min(customerData.cashOnHand, Math.round((rikkBaseSellPrice + customerOfferPrice) / 2));
                choices.push({ text: `Haggle (Aim $${hagglePrice})`, outcome: { type: "negotiate_sell", item: itemContext, proposedPrice: hagglePrice, originalOffer: customerOfferPrice } });
            }
            choices.push({ text: "Nah, kick rocks.", outcome: { type: "decline_offer_to_sell" } });

        } else {
            // --- Scenario C: Rikk has no inventory to sell ---
            dialogue.push({ speaker: "rikk", text: "Stash is drier than a popcorn fart, G. Nothin' to move right now." });
            choices.push({ text: "Aight, my bad. Later.", outcome: { type: "acknowledge_empty_stash" } });
        }

        // --- Step 3: Return the complete interaction object ---
        return {
            data: customerData, name: customerData.name,
            dialogue, choices, itemContext,
            archetypeKey: customerData.archetypeKey, mood: customerData.mood
        };
    }

    // --- Internal "Private" Helper Methods ---

    _selectOrGenerateCustomerFromPool() {
        if (this.customersPool.length > 0 && Math.random() < 0.35) {
            const returningCustomer = this._getRandomElement(this.customersPool);
            returningCustomer.hasMetRikkBefore = true;
            const archetype = this.customerArchetypes[returningCustomer.archetypeKey];
            if (archetype) {
                returningCustomer.cashOnHand = Math.floor(Math.random() * (archetype.priceToleranceFactor * 90)) + 25;
                const moodRoll = Math.random();
                if (moodRoll < 0.15) returningCustomer.mood = "happy";
                else if (moodRoll < 0.30) returningCustomer.mood = "paranoid";
                else if (moodRoll < 0.45) returningCustomer.mood = "angry";
                else { returningCustomer.mood = this._getRandomElement(["neutral", "chill", "desperate", "cautious"]); }
            }
            return returningCustomer;
        }

        const archetypeKeys = Object.keys(this.customerArchetypes);
        const selectedArchetypeKey = this._getRandomElement(archetypeKeys);
        const archetypeData = this.customerArchetypes[selectedArchetypeKey];
        const newCustomer = {
            id: `customer_${this.nextCustomerId++}`,
            name: `${archetypeData.baseName} #${this.nextCustomerId - 1}`,
            archetypeKey: selectedArchetypeKey,
            loyaltyToRikk: Math.floor(Math.random() * 3) - 1,
            mood: archetypeData.initialMood || "neutral",
            cashOnHand: Math.floor(Math.random() * (archetypeData.priceToleranceFactor * 100)) + 30,
            hasMetRikkBefore: false,
            patience: 3 + Math.floor(Math.random() * 3),
            data: {} // Reserved for future state like addiction levels, etc.
        };

        if (this.customersPool.length < this.MAX_CUSTOMERS_IN_POOL) { this.customersPool.push(newCustomer); }
        else { this.customersPool[Math.floor(Math.random() * this.MAX_CUSTOMERS_IN_POOL)] = newCustomer; }
        return newCustomer;
    }

    _generateRandomItem(archetypeData = null) {
        if (!this.itemTypes || this.itemTypes.length === 0) {
            console.error("CustomerManager: itemTypes data not loaded or empty!");
            return { id: "error_item", name: "Error Item", itemTypeObj: { type: "ERROR", heat: 0, description:"Data missing"}, quality: "Unknown", qualityIndex: 0, purchasePrice: 1, estimatedResaleValue: 1 };
        }
        let availableItemTypes = [...this.itemTypes];
        if (archetypeData && archetypeData.itemPool && archetypeData.itemPool.length > 0) {
             availableItemTypes = this.itemTypes.filter(it => archetypeData.itemPool.includes(it.id));
        }
        if (availableItemTypes.length === 0) availableItemTypes = [...this.itemTypes];

        const selectedType = this._getRandomElement(availableItemTypes);
        const qualityLevelsForType = this.itemQualityLevels[selectedType.type] || ["Standard"];
        const qualityIndex = Math.floor(Math.random() * qualityLevelsForType.length);
        const quality = qualityLevelsForType[qualityIndex];
        const basePurchaseValue = selectedType.baseValue + Math.floor(Math.random() * (selectedType.range * 2)) - selectedType.range;
        
        const item = {
          id: selectedType.id, name: selectedType.name, itemTypeObj: selectedType, quality, qualityIndex,
          description: selectedType.description, uses: selectedType.uses || null, effect: selectedType.effect || null,
        };
        
        const qualityPriceModifier = this.itemQualityModifiers[selectedType.type]?.[qualityIndex] || 1.0;
        item.purchasePrice = Math.max(5, Math.round(basePurchaseValue * (0.3 + Math.random() * 0.25) * qualityPriceModifier));
        item.estimatedResaleValue = Math.max(item.purchasePrice + 5, Math.round(basePurchaseValue * (0.7 + Math.random() * 0.35) * qualityPriceModifier));
        return item;
    }

    _calculateItemValue(item, purchaseContext = true, context) {
        const { playerSkills, activeWorldEvents, customerData } = context;
        let customerArchetype = null;
        if (customerData && customerData.archetypeKey) {
            customerArchetype = this.customerArchetypes[customerData.archetypeKey];
        }
        let baseValue = purchaseContext ? item.purchasePrice : item.estimatedResaleValue;
        if (!item || !item.itemTypeObj || typeof item.qualityIndex === 'undefined') { return baseValue; }
        let qualityModifier = this.itemQualityModifiers[item.itemTypeObj.type]?.[item.qualityIndex] || 1.0;
        let effectiveValue = baseValue * qualityModifier;
        if (playerSkills) {
            if (!purchaseContext && playerSkills.appraiser > 0) { effectiveValue *= (1 + playerSkills.appraiser * 0.05); }
            if (purchaseContext && playerSkills.appraiser > 0) { effectiveValue *= (1 - playerSkills.appraiser * 0.03); }
        }
        
        if (activeWorldEvents) {
            activeWorldEvents.forEach(eventState => {
                // *** THE FIX IS HERE ***
                // The object in the array *is* the state, which has an `effects` property.
                // It does not have a nested `event` property.
                const effects = eventState.effects; 
                // *** END OF FIX ***

                if (effects && effects.allPriceModifier) { effectiveValue *= effects.allPriceModifier; }
                if (effects && item.itemTypeObj.type === "DRUG" && effects.drugPriceModifier) { effectiveValue *= effects.drugPriceModifier; }
            });
        }

        if (customerArchetype && !purchaseContext) { effectiveValue *= customerArchetype.priceToleranceFactor; }
        return Math.max(5, Math.round(effectiveValue));
    }
    
    _getRandomElement(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // --- State Management Methods ---
    reset() {
        this.customersPool = [];
        this.nextCustomerId = 1;
    }

    getSaveState() {
        return {
            customersPool: this.customersPool,
            nextCustomerId: this.nextCustomerId,
        };
    }

    loadSaveState(state) {
        if (state) {
            this.customersPool = state.customersPool || [];
            this.nextCustomerId = state.nextCustomerId || 1;
        } else {
            this.reset();
        }
    }
}