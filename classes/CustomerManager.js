// =================================================================================
// CustomerManager Class (Refactored)
// =================================================================================
// This class is the definitive authority on all customer-related logic.
// It has been refactored into a data INTERPRETER, not a logic container. It reads
// declarative templates from customer_templates.js, creates live instances of customers,
// and uses the data to drive interactions, including dialogue and game effects.
// =================================================================================

// Configuration object to manage "magic numbers" for easy tweaking.
const CONFIG = {
    MAX_CUSTOMERS_IN_POOL: 20,
    BASE_CUSTOMER_SELLS_CHANCE: 0.5,
    INVENTORY_FULL_THRESHOLD: 10,
    RETURNING_CUSTOMER_CHANCE: 0.35,
    HAGGLE_PRICE_DIFFERENCE_THRESHOLD: 5,
    MIN_ITEM_PRICE: 5,
    // Base cash ranges for new customers
    NEW_CUSTOMER_CASH_RANGE: 100,
    NEW_CUSTOMER_CASH_BASE: 30,
    // Base cash ranges for returning customers
    RETURNING_CUSTOMER_CASH_RANGE: 90,
    RETURNING_CUSTOMER_CASH_BASE: 25,
};

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
    }

    /**
     * The main public method to generate a complete customer interaction object.
     * @param {object} gameState - An object containing relevant state from the main script.
     * @returns {object} A fully-formed interaction object for the main script to use.
     */
    generateInteraction(gameState) {
        const { inventory, cash, playerSkills, activeWorldEvents } = gameState;
        const customerInstance = this._selectOrGenerateCustomerFromPool();

        const template = this.customerTemplates[customerInstance.archetypeKey];
        if (!template) {
            console.error(`CustomerManager: Invalid archetypeKey provided: ${customerInstance.archetypeKey}`);
            return this._createErrorInteraction(customerInstance);
        }

        const greetingResult = this._getDialogue(customerInstance, 'greeting');
        let dialogue = [
            { speaker: "customer", text: greetingResult.line },
            { speaker: "rikk", text: this._getRandomElement(["Aight, what's the word?", "Yo. Lay it on me.", "Speak."]) }
        ];

        let choices = [];
        let itemContext = null;

        // Determine interaction type (buy vs. sell) with clear, configurable logic.
        let customerWillOfferItemToRikk = Math.random() < CONFIG.BASE_CUSTOMER_SELLS_CHANCE;
        if (inventory.length === 0) customerWillOfferItemToRikk = true;
        if (inventory.length >= CONFIG.INVENTORY_FULL_THRESHOLD) customerWillOfferItemToRikk = false;
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
            // CRITICAL FIX: Removed trailing single quote from the outcome type.
            choices.push({ text: "Nah, pass.", outcome: { type: "rikkDeclinesToBuy", payload: declineResult.payload, followUpDialogue: declineResult.line } });

        } else if (inventory.length > 0) {
            // --- Scenario B: Customer is BUYING an item FROM Rikk ---
            itemContext = this._getRandomElement(inventory);
            customerInstance.currentItemName = itemContext.name;

            const rikkBaseSellPrice = this._calculateItemValue(itemContext, false, { playerSkills, activeWorldEvents, customerInstance });
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

            if (!template.negotiationResists && rikkBaseSellPrice > customerOfferPrice + CONFIG.HAGGLE_PRICE_DIFFERENCE_THRESHOLD) {
                const hagglePrice = Math.min(customerInstance.cashOnHand, Math.round((rikkBaseSellPrice + customerOfferPrice) / 2));
                choices.push({ text: `Haggle (Aim $${hagglePrice})`, outcome: { type: "negotiate_sell", item: itemContext, proposedPrice: hagglePrice, originalOffer: customerOfferPrice } });
            }
            choices.push({ text: "Nah, kick rocks.", outcome: { type: "rikkDeclinesToSell", payload: declineResult.payload, followUpDialogue: declineResult.line } });

        } else {
            // --- Scenario C: Rikk has no inventory to sell ---
            // LOGIC FIX: Correctly use the retrieved dialogue for both Rikk and the customer.
            const rikkLine = "Stash is drier than a popcorn fart, G. Nothin' to move right now.";
            const customerResponse = this._getDialogue(customerInstance, 'acknowledge_empty_stash');
            
            dialogue.push({ speaker: "rikk", text: rikkLine });
            dialogue.push({ speaker: "customer", text: customerResponse.line });

            choices.push({ text: "Later.", outcome: { type: "end_interaction", payload: customerResponse.payload } });
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
    
    /**
     * Public method to retrieve a specific dialogue line for outcomes processed outside the main interaction loop.
     * @param {object} customerInstance - The specific customer instance.
     * @param {string} contextKey - The key for the dialogue context (e.g., 'negotiation_success').
     * @returns {object} An object containing the processed line and any payload.
     */
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
        if (this.customersPool.length > 0 && Math.random() < CONFIG.RETURNING_CUSTOMER_CHANCE) {
            const returningCustomer = this._getRandomElement(this.customersPool);
            const template = this.customerTemplates[returningCustomer.archetypeKey];

            // Refresh the state of the returning customer for this new interaction
            returningCustomer.hasMetRikkBefore = true;
            if (template) {
                returningCustomer.mood = template.baseStats.mood || 'chill';
                returningCustomer.cashOnHand = Math.floor(Math.random() * ((template.priceToleranceFactor || 1) * CONFIG.RETURNING_CUSTOMER_CASH_RANGE)) + CONFIG.RETURNING_CUSTOMER_CASH_BASE;
            }
            return returningCustomer;
        }

        // Generate a new customer
        const archetypeKeys = Object.keys(this.customerTemplates);
        const selectedArchetypeKey = this._getRandomElement(archetypeKeys);
        const template = this.customerTemplates[selectedArchetypeKey];
        
        // REFACTOR: Simplified and more robust ID/Name generation.
        const customerId = this.nextCustomerId;
        this.nextCustomerId++;

        const newCustomerInstance = {
            id: `customer_${customerId}`,
            name: `${template.baseName} #${customerId}`,
            archetypeKey: selectedArchetypeKey,
            // Use JSON stringify/parse for a deep copy of the stats object, preventing mutation of the original template.
            // This is safe for JSON-compatible data (no functions, undefined, Symbols).
            ...JSON.parse(JSON.stringify(template.baseStats)), 
            cashOnHand: Math.floor(Math.random() * ((template.priceToleranceFactor || 1) * CONFIG.NEW_CUSTOMER_CASH_RANGE)) + CONFIG.NEW_CUSTOMER_CASH_BASE,
            hasMetRikkBefore: false
        };

        // Add to pool, replacing an old customer if the pool is full.
        if (this.customersPool.length < CONFIG.MAX_CUSTOMERS_IN_POOL) {
            this.customersPool.push(newCustomerInstance);
        } else {
            const randomIndex = Math.floor(Math.random() * CONFIG.MAX_CUSTOMERS_IN_POOL);
            this.customersPool[randomIndex] = newCustomerInstance;
        }
        return newCustomerInstance;
    }

    _generateRandomItem(template = null) {
        if (!this.itemTypes || this.itemTypes.length === 0) {
            return { id: "error_item", name: "Error Item", itemTypeObj: { type: "ERROR", heat: 0 }, quality: "Unknown", qualityIndex: 0, purchasePrice: 1, estimatedResaleValue: 1 };
        }
        
        let availableItemTypes = [...this.itemTypes];
        if (template && template.itemPool && template.itemPool.length > 0) {
             availableItemTypes = this.itemTypes.filter(it => template.itemPool.includes(it.id));
        }
        if (availableItemTypes.length === 0) {
            availableItemTypes = [...this.itemTypes]; // Fallback to all items if template pool is invalid
        }

        const selectedType = this._getRandomElement(availableItemTypes);
        const qualityLevelsForType = this.itemQualityLevels[selectedType.type] || ["Standard"];
        const qualityIndex = Math.floor(Math.random() * qualityLevelsForType.length);
        const quality = qualityLevelsForType[qualityIndex];
        const basePurchaseValue = selectedType.baseValue + Math.floor(Math.random() * (selectedType.range * 2)) - selectedType.range;
        
        const item = {
          id: selectedType.id,
          name: selectedType.name,
          itemTypeObj: selectedType,
          quality,
          qualityIndex,
          description: selectedType.description,
        };
        
        const qualityPriceModifier = this.itemQualityModifiers[selectedType.type]?.[qualityIndex] || 1.0;
        item.purchasePrice = Math.max(CONFIG.MIN_ITEM_PRICE, Math.round(basePurchaseValue * (0.3 + Math.random() * 0.25) * qualityPriceModifier));
        item.estimatedResaleValue = Math.max(item.purchasePrice + CONFIG.MIN_ITEM_PRICE, Math.round(basePurchaseValue * (0.7 + Math.random() * 0.35) * qualityPriceModifier));
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
            if (!purchaseContext && playerSkills.appraiser > 0) { // Selling to customer
                effectiveValue *= (1 + playerSkills.appraiser * 0.05);
            }
            if (purchaseContext && playerSkills.appraiser > 0) { // Buying from customer
                effectiveValue *= (1 - playerSkills.appraiser * 0.03);
            }
        }
        
        if (activeWorldEvents) {
            activeWorldEvents.forEach(eventState => {
                const effects = eventState.effects; 
                if (!effects) return;
                if (effects.allPriceModifier) { effectiveValue *= effects.allPriceModifier; }
                if (effects.drugPriceModifier && item.itemTypeObj.type === "DRUG") { effectiveValue *= effects.drugPriceModifier; }
            });
        }

        if (customerTemplate && !purchaseContext) { // When selling to a customer, their tolerance matters
            effectiveValue *= (customerTemplate.priceToleranceFactor || 1.0);
        }
        return Math.max(CONFIG.MIN_ITEM_PRICE, Math.round(effectiveValue));
    }
    
    _getRandomElement(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    _createErrorInteraction(customerInstance) {
        return {
            instance: customerInstance,
            name: customerInstance.name || "Error Customer",
            dialogue: [{ speaker: "narration", text: "Error: Customer data is corrupted." }],
            choices: [{ text: "OK", outcome: { type: "acknowledge_error" } }],
            itemContext: null,
            archetypeKey: "ERROR_ARCHETYPE",
            mood: "error"
        };
    }

    // --- Save/Load and State Management ---

    reset() {
        this.customersPool = [];
        this.nextCustomerId = 1;
        console.log("CustomerManager has been reset.");
    }

    getSaveState() {
        return {
            customersPool: this.customersPool,
            nextCustomerId: this.nextCustomerId,
        };
    }

    loadSaveState(state) {
        if (state && state.customersPool && state.nextCustomerId) {
            this.customersPool = state.customersPool;
            this.nextCustomerId = state.nextCustomerId;
        } else {
            this.reset();
        }
    }
}