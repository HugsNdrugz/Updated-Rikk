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
        const { inventory, cash, playerSkills, activeWorldEvents, combinedWorldEffects } = gameState;
        const customerInstance = this._selectOrGenerateCustomerFromPool();

        // Apply customerScareChance from world effects
        if (combinedWorldEffects && combinedWorldEffects.customerScareChance > 0 && Math.random() < combinedWorldEffects.customerScareChance) {
            const scareDialogue = this._getDialogue(customerInstance, 'customerScaredOff') || { line: `${customerInstance.name} looks around nervously and walks away.`, payload: null };
            return {
                instance: customerInstance,
                name: customerInstance.name,
                dialogue: [{ speaker: "narration", text: scareDialogue.line }],
                choices: [{ text: "Unlucky.", outcome: { type: "end_interaction_scared", payload: scareDialogue.payload } }],
                itemContext: null,
                archetypeKey: customerInstance.archetypeKey,
                mood: customerInstance.mood,
                isScaredOff: true
            };
        }

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

        let customerWillOfferItemToRikk = Math.random() < CONFIG.BASE_CUSTOMER_SELLS_CHANCE;
        if (inventory.length === 0) customerWillOfferItemToRikk = true;
        if (inventory.length >= CONFIG.INVENTORY_FULL_THRESHOLD) customerWillOfferItemToRikk = false;
        if (template.sellsOnly) {
            customerWillOfferItemToRikk = true;
        }

        if (customerWillOfferItemToRikk) {
            itemContext = this._generateRandomItem(template, combinedWorldEffects);

            if (!itemContext) {
                const noItemDialogue = this._getDialogue(customerInstance, 'customerHasNothingToSell') || { line: `${customerInstance.name} shrugs. "Ain't got nothin' for ya today, chief."`, payload: null };
                dialogue.push({ speaker: "customer", text: noItemDialogue.line });
                choices.push({ text: "Aight.", outcome: { type: "end_interaction_no_item", payload: noItemDialogue.payload } });
            } else {
                customerInstance.currentItemName = itemContext.name;
                const customerDemandsPrice = this._calculateItemValue(itemContext, true, { playerSkills, activeWorldEvents, customerInstance, combinedWorldEffects });
                const offerText = `Yo Rikk, peep this. Got a ${itemContext.quality} ${itemContext.name}. How's $${customerDemandsPrice} sound?`;
                dialogue.push({ speaker: "customer", text: offerText });
                const declineResult = this._getDialogue(customerInstance, 'rikkDeclinesToBuy');
                if (cash >= customerDemandsPrice) {
                    choices.push({ text: `Cop it ($${customerDemandsPrice})`, outcome: { type: "buy_from_customer", item: itemContext, price: customerDemandsPrice } });
                } else {
                    choices.push({ text: `Cop it (Need $${customerDemandsPrice - cash} more)`, outcome: { type: "buy_from_customer" }, disabled: true });
                }
                choices.push({ text: "Nah, pass.", outcome: { type: "rikkDeclinesToBuy", payload: declineResult.payload, followUpDialogue: declineResult.line } });
            }
        } else if (inventory.length > 0) {
            let potentialItemsToBuy = [...inventory];
            let chosenItem = null;

            if (potentialItemsToBuy.length > 0) {
                // 0. Check for Addiction Preference (Highest Priority)
                if (customerInstance.addictionStatus && customerInstance.addictionStatus.isAddicted && customerInstance.addictionStatus.drugId) {
                    const addictedDrugInStock = potentialItemsToBuy.find(item => item.id === customerInstance.addictionStatus.drugId);
                    if (addictedDrugInStock && Math.random() < 0.85) { // 85% chance to demand their drug
                        chosenItem = addictedDrugInStock;
                    }
                }

                // 1. NEW: Check for Customer's buyPreference
                if (!chosenItem) {
                    if (template.gameplayConfig && template.gameplayConfig.buyPreference) {
                        const buyPref = template.gameplayConfig.buyPreference;
                        let preferencesToConsider = [];
                        if (buyPref.or && Array.isArray(buyPref.or)) {
                            preferencesToConsider = buyPref.or;
                        } else {
                            preferencesToConsider.push(buyPref);
                        }

                        if (preferencesToConsider.length > 0) {
                            const preferredItemsInStock = potentialItemsToBuy.filter(item => {
                                for (const p of preferencesToConsider) {
                                    if (this._inventoryItemMatchesPreference(item, p)) return true;
                                }
                                return false;
                            });
                            if (preferredItemsInStock.length > 0) {
                                chosenItem = this._getRandomElement(preferredItemsInStock);
                            }
                        }
                    }
                }

                // 2. If not chosen by addiction or buyPreference, check for Specific Item Demand (World Event)
                if (!chosenItem) {
                    const demandedItemsInStock = potentialItemsToBuy.filter(item =>
                        combinedWorldEffects.specificItemDemand && combinedWorldEffects.specificItemDemand.includes(item.id)
                    );
                    if (demandedItemsInStock.length > 0 && Math.random() < 0.75) {
                        chosenItem = this._getRandomElement(demandedItemsInStock);
                    }
                }

                // 2. If still not chosen, apply drug demand modifier (World Event)
                if (!chosenItem) {
                    const drugItemsInStock = potentialItemsToBuy.filter(item => item.itemTypeObj && item.itemTypeObj.type === "DRUG");
                    const nonDrugItemsInStock = potentialItemsToBuy.filter(item => !item.itemTypeObj || item.itemTypeObj.type !== "DRUG");

                    if (drugItemsInStock.length > 0 && combinedWorldEffects.drugDemandModifier > 1) {
                        const baseDrugChance = 0.5;
                        const modifiedDrugChance = (baseDrugChance * combinedWorldEffects.drugDemandModifier) /
                                                   ( (baseDrugChance * combinedWorldEffects.drugDemandModifier) + (1 - baseDrugChance) );

                        if (Math.random() < modifiedDrugChance) {
                            chosenItem = this._getRandomElement(drugItemsInStock);
                        } else if (nonDrugItemsInStock.length > 0) {
                            chosenItem = this._getRandomElement(nonDrugItemsInStock);
                        } else {
                            chosenItem = this._getRandomElement(drugItemsInStock); // Only drugs in stock
                        }
                    }
                }

                // 3. If still no item chosen, pick randomly from remaining
                if (!chosenItem && potentialItemsToBuy.length > 0) {
                    chosenItem = this._getRandomElement(potentialItemsToBuy);
                }
            }
            itemContext = chosenItem;

            if (!itemContext) {
                const customerResponse = this._getDialogue(customerInstance, 'rikkHasNothingCustomerWants') || { line: "Aight, guess you ain't got what I need today.", payload: null};
                dialogue.push({ speaker: "rikk", text: "So, what are you looking for?"});
                dialogue.push({ speaker: "customer", text: customerResponse.line });
                choices.push({ text: "My bad.", outcome: { type: "end_interaction_no_desired_item", payload: customerResponse.payload } });
            } else {
                customerInstance.currentItemName = itemContext.name;
                const rikkBaseSellPrice = this._calculateItemValue(itemContext, false, { playerSkills, activeWorldEvents, customerInstance, combinedWorldEffects });
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
            }
        } else {
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
                    // Check for addiction status condition
                    if (condition.stat === "addictionStatus.isAddicted") {
                        if (!customerInstance.addictionStatus || customerInstance.addictionStatus.isAddicted !== condition.value) {
                            allConditionsMet = false;
                            break;
                        }
                    } else if (condition.stat === "addictionStatus.drugId") {
                         if (!customerInstance.addictionStatus || customerInstance.addictionStatus.drugId !== condition.value) {
                            allConditionsMet = false;
                            break;
                        }
                    }
                    else if (!this._checkCondition(customerInstance, condition)) { // Original condition check
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
        const customerStatValue = customerInstance[condition.stat]; // This might fail if condition.stat is nested like "addictionStatus.isAddicted"
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
            returningCustomer.hasMetRikkBefore = true;
            if (template) {
                returningCustomer.mood = template.baseStats.mood || 'chill';
                returningCustomer.cashOnHand = Math.floor(Math.random() * ((template.priceToleranceFactor || 1) * CONFIG.RETURNING_CUSTOMER_CASH_RANGE)) + CONFIG.RETURNING_CUSTOMER_CASH_BASE;
                // Ensure addictionStatus is present
                if (!returningCustomer.addictionStatus) {
                    returningCustomer.addictionStatus = { isAddicted: false, drugId: null, cravingLevel: 0 };
                }
            }
            return returningCustomer;
        }

        const archetypeKeys = Object.keys(this.customerTemplates);
        const selectedArchetypeKey = this._getRandomElement(archetypeKeys);
        const template = this.customerTemplates[selectedArchetypeKey];
        const customerId = this.nextCustomerId++;
        const newCustomerInstance = {
            id: `customer_${customerId}`,
            name: `${template.baseName} #${customerId}`,
            archetypeKey: selectedArchetypeKey,
            ...JSON.parse(JSON.stringify(template.baseStats)), 
            cashOnHand: Math.floor(Math.random() * ((template.priceToleranceFactor || 1) * CONFIG.NEW_CUSTOMER_CASH_RANGE)) + CONFIG.NEW_CUSTOMER_CASH_BASE,
            hasMetRikkBefore: false,
            addictionStatus: { isAddicted: false, drugId: null, cravingLevel: 0 } // Initialize addiction status
        };

        if (this.customersPool.length < CONFIG.MAX_CUSTOMERS_IN_POOL) {
            this.customersPool.push(newCustomerInstance);
        } else {
            const randomIndex = Math.floor(Math.random() * CONFIG.MAX_CUSTOMERS_IN_POOL);
            this.customersPool[randomIndex] = newCustomerInstance;
        }
        return newCustomerInstance;
    }

    _inventoryItemMatchesPreference(inventoryItem, preference) {
        if (!inventoryItem || !preference) return false;
        if (preference.any === true) return true;

        let match = true;

        if (preference.id) {
            match = match && inventoryItem.id === preference.id;
        }
        if (preference.type) {
            match = match && inventoryItem.itemTypeObj && inventoryItem.itemTypeObj.type === preference.type;
        }
        if (preference.subType) {
            match = match && inventoryItem.itemTypeObj && inventoryItem.itemTypeObj.subType === preference.subType;
        }
        if (typeof preference.quality === 'number') {
            match = match && inventoryItem.qualityIndex === preference.quality;
        }
        if (typeof preference.minQuality === 'number') {
            match = match && inventoryItem.qualityIndex >= preference.minQuality;
        }
        if (typeof preference.maxQuality === 'number') {
            match = match && inventoryItem.qualityIndex <= preference.maxQuality;
        }
        if (typeof preference.minBaseValue === 'number') {
            match = match && inventoryItem.itemTypeObj && inventoryItem.itemTypeObj.baseValue >= preference.minBaseValue;
        }

        if (!match) return false; // Early exit if basic checks fail

        if (preference.exclude) {
            let excluded = false;
            if (preference.exclude.type && inventoryItem.itemTypeObj && inventoryItem.itemTypeObj.type === preference.exclude.type) {
                excluded = true;
            }
            if (!excluded && preference.exclude.subType && inventoryItem.itemTypeObj && inventoryItem.itemTypeObj.subType === preference.exclude.subType) {
                excluded = true;
            }
            if (!excluded && preference.exclude.id && inventoryItem.id === preference.exclude.id) {
                excluded = true;
            }
            if (excluded) {
                match = false;
            }
        }
        return match;
    }

    _itemTypeMatchesPreference(itemType, preference) {
        if (!itemType || !preference) return false;

        if (preference.id && itemType.id !== preference.id) {
            return false;
        }
        if (preference.type && itemType.type !== preference.type) {
            return false;
        }
        if (preference.subType && itemType.subType !== preference.subType) {
            return false;
        }
        return true;
    }

    _generateRandomItem(template = null, combinedWorldEffects = {}) {
        if (combinedWorldEffects.itemScarcity && Math.random() < 0.5) {
            return null;
        }

        if (template && template.gameplayConfig && template.gameplayConfig.sellPreference) {
            const sellPref = template.gameplayConfig.sellPreference;
            let chosenPreference = null;

            if (sellPref.or && Array.isArray(sellPref.or)) {
                chosenPreference = this._getRandomElement(sellPref.or);
            } else {
                chosenPreference = sellPref;
            }

            if (chosenPreference) {
                let applyPreference = true;
                if (typeof chosenPreference.chance === 'number') {
                    applyPreference = Math.random() < chosenPreference.chance;
                }

                if (applyPreference) {
                    const candidateItemTypes = this.itemTypes.filter(it => this._itemTypeMatchesPreference(it, chosenPreference));
                    if (candidateItemTypes.length > 0) {
                        const selectedType = this._getRandomElement(candidateItemTypes);

                        let qualityIndex;
                        const qualityLevelsForType = this.itemQualityLevels[selectedType.type] || ['Standard'];
                        if (typeof chosenPreference.quality === 'number') {
                            qualityIndex = Math.min(chosenPreference.quality, qualityLevelsForType.length - 1);
                        } else {
                            qualityIndex = Math.floor(Math.random() * qualityLevelsForType.length);
                        }
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
                }
            }
        }

        if (!this.itemTypes || this.itemTypes.length === 0) {
            return { id: "error_item", name: "Error Item", itemTypeObj: { type: "ERROR", heat: 0 }, quality: "Unknown", qualityIndex: 0, purchasePrice: 1, estimatedResaleValue: 1 };
        }

        let availableItemTypes = [...this.itemTypes];
        if (template && template.itemPool && template.itemPool.length > 0) {
             availableItemTypes = this.itemTypes.filter(it => template.itemPool.includes(it.id));
        }
        if (availableItemTypes.length === 0) {
            // Fallback if template.itemPool filters out everything, or itemPool is empty
            availableItemTypes = [...this.itemTypes];
        }

        // Ensure selectedType is not null before proceeding
        const selectedType = this._getRandomElement(availableItemTypes);
        if (!selectedType) { // Should ideally not happen if this.itemTypes is not empty
            console.error("CustomerManager: Could not select an item type in _generateRandomItem after all filters.");
            return { id: "error_item_notype", name: "Error Item (No Type)", itemTypeObj: { type: "ERROR", heat: 0 }, quality: "Unknown", qualityIndex: 0, purchasePrice: 1, estimatedResaleValue: 1 };
        }

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
        const { playerSkills, customerInstance, combinedWorldEffects } = context;
        let customerTemplate = null;
        if (customerInstance && customerInstance.archetypeKey) {
            customerTemplate = this.customerTemplates[customerInstance.archetypeKey];
        }
        let baseValue = purchaseContext ? item.purchasePrice : item.estimatedResaleValue;
        if (!item || !item.itemTypeObj || typeof item.qualityIndex === 'undefined') { return baseValue; }
        let qualityModifier = this.itemQualityModifiers[item.itemTypeObj.type]?.[item.qualityIndex] || 1.0;
        let effectiveValue = baseValue * qualityModifier;

        if (playerSkills) {
            if (!purchaseContext && playerSkills.appraiser > 0) {
                effectiveValue *= (1 + playerSkills.appraiser * 0.05);
            }
            if (purchaseContext && playerSkills.appraiser > 0) {
                effectiveValue *= (1 - playerSkills.appraiser * 0.03);
            }
        }
        
        if (combinedWorldEffects) {
            if (combinedWorldEffects.allPriceModifier) {
                effectiveValue *= combinedWorldEffects.allPriceModifier;
            }
            if (combinedWorldEffects.drugPriceModifier && item.itemTypeObj && item.itemTypeObj.type === "DRUG") {
                effectiveValue *= combinedWorldEffects.drugPriceModifier;
            }
        }

        // Addiction price tolerance modification
        if (customerInstance && customerInstance.addictionStatus && customerInstance.addictionStatus.isAddicted &&
            item.id === customerInstance.addictionStatus.drugId && !purchaseContext) {
            const cravingFactor = 1 + (customerInstance.addictionStatus.cravingLevel * 0.1);
            effectiveValue *= cravingFactor;
        }

        if (customerTemplate && !purchaseContext) {
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

    processPotentialAddiction(customerInstance, soldDrugItem) {
        if (!customerInstance || !soldDrugItem || !soldDrugItem.itemTypeObj || typeof soldDrugItem.itemTypeObj.addictionChance !== 'number') {
            // console.warn('[CustomerManager] Invalid parameters for processPotentialAddiction');
            return;
        }

        const drugProps = soldDrugItem.itemTypeObj;
        if (Math.random() < drugProps.addictionChance) {
            if (!customerInstance.addictionStatus) {
                customerInstance.addictionStatus = { isAddicted: false, drugId: null, cravingLevel: 0 };
            }

            const wasAlreadyAddictedToThisDrug = customerInstance.addictionStatus.isAddicted && customerInstance.addictionStatus.drugId === soldDrugItem.id;

            customerInstance.addictionStatus.isAddicted = true;
            customerInstance.addictionStatus.drugId = soldDrugItem.id;

            if (wasAlreadyAddictedToThisDrug) {
                customerInstance.addictionStatus.cravingLevel = Math.min((customerInstance.addictionStatus.cravingLevel || 0) + 1, 5); // Cap craving level, e.g., at 5
            } else {
                customerInstance.addictionStatus.cravingLevel = 1; // Start craving at 1 for new addiction
            }

            // console.log(`[CustomerManager] Customer ${customerInstance.name} addiction status updated for ${soldDrugItem.name}. New status:`, customerInstance.addictionStatus);
        }
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