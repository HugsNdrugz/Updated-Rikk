// =================================================================================
// CustomerManager Class (Refactored)
// =================================================================================
// This class is the definitive authority on all customer-related logic.
// It has been refactored into a data INTERPRETER, not a logic container. It reads
// declarative templates from customer_templates.js, creates live instances of customers,
// and uses the data to drive interactions, including dialogue and game effects.
// =================================================================================

export class CustomerManager {
    /**
     * Initializes the CustomerManager with the new template data and other game data.
     * @param {object} customerTemplatesData - Data from the new customer_templates.js.
     * @param {object} itemTypesData - Data from data_items.js.
     * @param {object} itemQualityLevelsData - Data from data_items.js.
     * @param {object} itemQualityModifiersData - Data from data_items.js.
     */
    constructor(customerTemplatesData, itemTypesData, itemQualityLevelsData, itemQualityModifiersData) {
        // Store references to all required game data.
        this.customerTemplates = customerTemplatesData;
        this.itemTypes = itemTypesData;
        this.itemQualityLevels = itemQualityLevelsData;
        this.itemQualityModifiers = itemQualityModifiersData;

        // Internal state for managing the pool of unique customer instances.
        this.customersPool = [];
        this.nextCustomerId = 1;
        this.MAX_CUSTOMERS_IN_POOL = 20; // Internal configuration
    }

    /**
     * The main public method to generate a complete customer interaction object.
     * @param {object} gameState - An object containing relevant state from the main script.
     * @returns {object} A fully-formed interaction object for the main script to use.
     */
    generateInteraction(gameState) {
        const { inventory, cash, playerSkills, activeWorldEvents } = gameState;
        const customerInstance = this._selectOrGenerateCustomerFromPool();

        // Retrieve the base template for this customer.
        const template = this.customerTemplates[customerInstance.archetypeKey];
        if (!template) {
            console.error(`CustomerManager: Invalid archetypeKey provided: ${customerInstance.archetypeKey}`);
            return this._createErrorInteraction(customerInstance);
        }
        
        // Get the initial dialogue using the new interpreter method.
        const greetingResult = this._getDialogue(customerInstance, 'greeting');
        let dialogue = [
            { speaker: "customer", text: greetingResult.line },
            { speaker: "rikk", text: this._getRandomElement(["Aight, what's the word?", "Yo. Lay it on me.", "Speak."]) }
        ];

        let choices = [];
        let itemContext = null;

        // Determine interaction type (buy vs. sell)
        let customerWillOfferItemToRikk = Math.random() < 0.5;
        if (inventory.length === 0) customerWillOfferItemToRikk = true;
        if (inventory.length >= 10) customerWillOfferItemToRikk = false;
        if (template.sellsOnly) {
            customerWillOfferItemToRikk = true;
        }

        if (customerWillOfferItemToRikk) {
            // --- Scenario A: Customer is SELLING an item TO Rikk ---
            itemContext = this._generateRandomItem(template);
            customerInstance.currentItemName = itemContext.name;
            
            const customerDemandsPrice = this._calculateItemValue(itemContext, true, { playerSkills, activeWorldEvents, customerInstance });
            const offerText = `Yo Rikk, peep this. Got a ${itemContext.quality} ${itemContext.name}. How's $${customerDemandsPrice} sound?`;
            dialogue.push({ speaker: "customer", text: offerText });

            const declineResult = this._getDialogue(customerInstance, 'rikkDeclinesToBuy');

            if (cash >= customerDemandsPrice) {
                choices.push({ text: `Cop it ($${customerDemandsPrice})`, outcome: { type: "buy_from_customer", item: itemContext, price: customerDemandsPrice } });
            } else {
                choices.push({ text: `Cop it (Need $${customerDemandsPrice - cash} more)`, outcome: { type: "buy_from_customer" }, disabled: true });
            }
            choices.push({ text: "Nah, pass.", outcome: { type: "rikkDeclinesToBuy'", payload: declineResult.payload } });

        } else if (inventory.length > 0) {
            // --- Scenario B: Customer is BUYING an item FROM Rikk ---
            itemContext = this._getRandomElement(inventory);
            customerInstance.currentItemName = itemContext.name;

            const rikkBaseSellPrice = this._calculateItemValue(itemContext, false, { playerSkills, activeWorldEvents, customerInstance });
            const template = this.customerTemplates[customerInstance.archetypeKey];
            let customerOfferPrice = Math.round(rikkBaseSellPrice * (template.priceToleranceFactor || 1.0));
            customerOfferPrice = Math.min(customerOfferPrice, customerInstance.cashOnHand);

            const askText = `So, Rikk, that ${itemContext.quality} ${itemContext.name}... what's the word? I got $${customerOfferPrice} burnin' a hole.`;
            dialogue.push({ speaker: "customer", text: askText });

            const declineResult = this._getDialogue(customerInstance, 'rikkDeclinesToSell');

            if (customerInstance.cashOnHand >= customerOfferPrice) {
                choices.push({ text: `Serve 'em ($${customerOfferPrice})`, outcome: { type: "sell_to_customer", item: itemContext, price: customerOfferPrice } });
            } else {
                choices.push({ text: `Serve 'em ($${customerOfferPrice}) (Short!)`, outcome: { type: "sell_to_customer" }, disabled: true });
            }

            if (!template.negotiationResists && rikkBaseSellPrice > customerOfferPrice + 5) {
                const hagglePrice = Math.min(customerInstance.cashOnHand, Math.round((rikkBaseSellPrice + customerOfferPrice) / 2));
                choices.push({ text: `Haggle (Aim $${hagglePrice})`, outcome: { type: "negotiate_sell", item: itemContext, proposedPrice: hagglePrice, originalOffer: customerOfferPrice } });
            }
            choices.push({ text: "Nah, kick rocks.", outcome: { type: "rikkDeclinesToSell", payload: declineResult.payload } });

        } else {
            // --- Scenario C: Rikk has no inventory to sell ---
            const emptyStashResult = this._getDialogue(customerInstance, 'acknowledge_empty_stash');
            dialogue.push({ speaker: "rikk", text: "Stash is drier than a popcorn fart, G. Nothin' to move right now." });
            choices.push({ text: "Aight, my bad. Later.", outcome: { type: "acknowledge_empty_stash", payload: emptyStashResult ? emptyStashResult.payload : null } });
        }

        return {
            instance: customerInstance,
            name: customerInstance.name,
            dialogue,
            choices,
            itemContext,
            archetypeKey: customerInstance.archetypeKey,
            mood: customerInstance.mood
        };
    }
    
    getOutcomeDialogue(customerInstance, contextKey) {
        return this._getDialogue(customerInstance, contextKey);
    }

    _getDialogue(customerInstance, contextKey) {
        const template = this.customerTemplates[customerInstance.archetypeKey];
        if (!template || !template.dialogue || !template.dialogue[contextKey]) {
            return { line: `... (missing dialogue: ${contextKey})`, payload: null };
        }

        const dialogueNode = template.dialogue[contextKey];

        for (const block of dialogueNode) {
            let allConditionsMet = true;
            if (block.conditions && block.conditions.length > 0) {
                for (const condition of block.conditions) {
                    if (!this._checkCondition(customerInstance, condition)) {
                        allConditionsMet = false;
                        break;
                    }
                }
            }

            if (allConditionsMet) {
                const randomLine = this._getRandomElement(block.lines) || `(missing lines for ${contextKey})`;
                const processedLine = randomLine
                    .replace(/\[ITEM_NAME\]/g, customerInstance.currentItemName || 'the stuff')
                    .replace(/\[CUSTOMER_NAME\]/g, customerInstance.name);
                return { line: processedLine, payload: block.payload || null };
            }
        }

        return { line: `... (no matching dialogue block for ${contextKey})`, payload: null };
    }

    _checkCondition(customerInstance, condition) {
        const customerStatValue = customerInstance[condition.stat];
        const checkValue = condition.value;

        switch (condition.op) {
            case 'is': return customerStatValue === checkValue;
            case 'isNot': return customerStatValue !== checkValue;
            case 'gt': return customerStatValue > checkValue;
            case 'gte': return customerStatValue >= checkValue;
            case 'lt': return customerStatValue < checkValue;
            case 'lte': return customerStatValue <= checkValue;
            default: return false;
        }
    }
    
    _selectOrGenerateCustomerFromPool() {
        if (this.customersPool.length > 0 && Math.random() < 0.35) {
            const returningCustomer = this._getRandomElement(this.customersPool);
            returningCustomer.hasMetRikkBefore = true;
            const template = this.customerTemplates[returningCustomer.archetypeKey];
            if (template) {
                returningCustomer.mood = template.baseStats.mood || 'chill';
                returningCustomer.cashOnHand = Math.floor(Math.random() * ((template.priceToleranceFactor || 1) * 90)) + 25;
            }
            return returningCustomer;
        }

        const archetypeKeys = Object.keys(this.customerTemplates);
        const selectedArchetypeKey = this._getRandomElement(archetypeKeys);
        const template = this.customerTemplates[selectedArchetypeKey];
        
        const newCustomerInstance = {
            id: `customer_${this.nextCustomerId++}`,
            name: `${template.baseName} #${this.nextCustomerId - 1}`,
            archetypeKey: selectedArchetypeKey,
            ...JSON.parse(JSON.stringify(template.baseStats)), 
            cashOnHand: Math.floor(Math.random() * ((template.priceToleranceFactor || 1) * 100)) + 30,
            hasMetRikkBefore: false
        };

        if (this.customersPool.length < this.MAX_CUSTOMERS_IN_POOL) { this.customersPool.push(newCustomerInstance); }
        else { this.customersPool[Math.floor(Math.random() * this.MAX_CUSTOMERS_IN_POOL)] = newCustomerInstance; }
        return newCustomerInstance;
    }

    _generateRandomItem(template = null) {
        if (!this.itemTypes || this.itemTypes.length === 0) {
            return { id: "error_item", name: "Error Item", itemTypeObj: { type: "ERROR", heat: 0 }, quality: "Unknown", qualityIndex: 0, purchasePrice: 1 };
        }
        let availableItemTypes = [...this.itemTypes];
        if (template && template.itemPool && template.itemPool.length > 0) {
             availableItemTypes = this.itemTypes.filter(it => template.itemPool.includes(it.id));
        }
        if (availableItemTypes.length === 0) availableItemTypes = [...this.itemTypes];

        const selectedType = this._getRandomElement(availableItemTypes);
        const qualityLevelsForType = this.itemQualityLevels[selectedType.type] || ["Standard"];
        const qualityIndex = Math.floor(Math.random() * qualityLevelsForType.length);
        const quality = qualityLevelsForType[qualityIndex];
        const basePurchaseValue = selectedType.baseValue + Math.floor(Math.random() * (selectedType.range * 2)) - selectedType.range;
        
        const item = {
          id: selectedType.id, name: selectedType.name, itemTypeObj: selectedType, quality, qualityIndex,
          description: selectedType.description,
        };
        
        const qualityPriceModifier = this.itemQualityModifiers[selectedType.type]?.[qualityIndex] || 1.0;
        item.purchasePrice = Math.max(5, Math.round(basePurchaseValue * (0.3 + Math.random() * 0.25) * qualityPriceModifier));
        item.estimatedResaleValue = Math.max(item.purchasePrice + 5, Math.round(basePurchaseValue * (0.7 + Math.random() * 0.35) * qualityPriceModifier));
        return item;
    }

    _calculateItemValue(item, purchaseContext = true, context) {
        const { playerSkills, activeWorldEvents, customerInstance } = context;
        let customerTemplate = null;
        if (customerInstance && customerInstance.archetypeKey) {
            customerTemplate = this.customerTemplates[customerInstance.archetypeKey];
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
                const effects = eventState.effects; 
                if (effects && effects.allPriceModifier) { effectiveValue *= effects.allPriceModifier; }
                if (effects && item.itemTypeObj.type === "DRUG" && effects.drugPriceModifier) { effectiveValue *= effects.drugPriceModifier; }
            });
        }

        if (customerTemplate && !purchaseContext) { effectiveValue *= customerTemplate.priceToleranceFactor; }
        return Math.max(5, Math.round(effectiveValue));
    }
    
    _getRandomElement(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    _createErrorInteraction(customerInstance) {
        return {
            instance: customerInstance, name: customerInstance.name || "Error Customer",
            dialogue: [{ speaker: "narration", text: "Error: Customer data is corrupted." }],
            choices: [{ text: "OK", outcome: { type: "acknowledge_error" } }],
            itemContext: null, archetypeKey: "ERROR_ARCHETYPE", mood: "error"
        };
    }

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