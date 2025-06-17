import { debugLogger } from '../utils.js';
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
    MAX_RECENT_SOLD_ITEMS_PER_CUSTOMER: 5,
    CHANCE_SELL_WEIRD_ITEM: 0.05,
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
            debugLogger.error('CustomerManager', `Invalid archetypeKey provided: ${customerInstance.archetypeKey}`);
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
                itemContext.itemInstanceId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                if (cash >= customerDemandsPrice) {
                    choices.push({ text: `Cop it ($${customerDemandsPrice})`, outcome: { type: "buy_from_customer", item: itemContext, price: customerDemandsPrice } });
                } else {
                    choices.push({ text: `Cop it (Need $${customerDemandsPrice - cash} more)`, outcome: { type: "buy_from_customer" }, disabled: true });
                }
                choices.push({ text: "Nah, pass.", outcome: { type: "rikkDeclinesToBuy", payload: declineResult.payload, followUpDialogue: declineResult.line } });
            }
        } else if (inventory.length > 0) {
            const allOfRikksItems = [...inventory];
            // Ensure recentlySoldItems exists and is an array
            const soldIds = (customerInstance.recentlySoldItems || []).map(record => record.itemInstanceId);
            const potentialItemsToBuy = allOfRikksItems.filter(item => {
                // If item has no instanceId, it can't be one they sold
                // If it has an instanceId, it must NOT be in soldIds
                return !item.itemInstanceId || !soldIds.includes(item.itemInstanceId);
            });
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
                if (!returningCustomer.recentlySoldItems) {
                    returningCustomer.recentlySoldItems = [];
                }
                // Pruning logic for returning customer
                if (returningCustomer.recentlySoldItems.length > CONFIG.MAX_RECENT_SOLD_ITEMS_PER_CUSTOMER) {
                    returningCustomer.recentlySoldItems = returningCustomer.recentlySoldItems.slice(-CONFIG.MAX_RECENT_SOLD_ITEMS_PER_CUSTOMER);
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
            addictionStatus: { isAddicted: false, drugId: null, cravingLevel: 0 }, // Initialize addiction status
            recentlySoldItems: [] // Initialize for new customer
        };

        // Pruning logic for new customer (though array will be empty initially, this is for consistency)
        if (newCustomerInstance.recentlySoldItems.length > CONFIG.MAX_RECENT_SOLD_ITEMS_PER_CUSTOMER) {
            newCustomerInstance.recentlySoldItems = newCustomerInstance.recentlySoldItems.slice(-CONFIG.MAX_RECENT_SOLD_ITEMS_PER_CUSTOMER);
        }

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
        // Explicitly handle { any: false }
        if (preference.any === false) return false;
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
        // Check for maxBaseValue
        if (typeof preference.maxBaseValue === 'number' && itemType.baseValue > preference.maxBaseValue) {
            return false;
        }
        return true;
    }

    _generateRandomItem(template = null, combinedWorldEffects = {}) {
        // 1. Initial scarcity check
        if (combinedWorldEffects && combinedWorldEffects.itemScarcity && Math.random() < 0.5) { // Assuming 0.5 is the configured scarcity trigger
            debugLogger.log('CustomerManager', `Item generation stopped by itemScarcity world effect.`);
            return null;
        }

        // 2. Early exit for sellPreference.any === false
        if (template && template.gameplayConfig && template.gameplayConfig.sellPreference && template.gameplayConfig.sellPreference.any === false) {
            debugLogger.log('CustomerManager', `Customer ${template.key} has sellPreference.any === false, will not sell.`);
            return null;
        }

        let itemToSell = null;

        // 3. Weird Item Generation
        // Allow template to override global CHANCE_SELL_WEIRD_ITEM
        const weirdItemChance = (template && typeof template.chanceSellWeirdItem === 'number')
                                ? template.chanceSellWeirdItem
                                : CONFIG.CHANCE_SELL_WEIRD_ITEM;

        if (Math.random() < weirdItemChance) {
            let weirdItemPool = [];
            if (template && template.itemPoolWeird && template.itemPoolWeird.length > 0) {
                weirdItemPool = template.itemPoolWeird;
            } else {
                // Fallback to a global ODDITY pool if no archetype-specific weird pool
                weirdItemPool = this.itemTypes.filter(it => it.subType === "ODDITY").map(it => it.id);
            }

            if (weirdItemPool.length > 0) {
                const selectedWeirdItemId = this._getRandomElement(weirdItemPool);
                const selectedType = this.itemTypes.find(it => it.id === selectedWeirdItemId);
                if (selectedType) {
                    // Weird items default to base quality (index 0 or 'Standard')
                    const qualityLevelsForType = this.itemQualityLevels[selectedType.type] || ['Standard'];
                    const qualityIndex = 0;
                    const quality = qualityLevelsForType[qualityIndex];
                    const qualityPriceModifier = this.itemQualityModifiers[selectedType.type]?.[qualityIndex] || 1.0;

                    itemToSell = {
                        id: selectedType.id,
                        name: selectedType.name,
                        itemTypeObj: selectedType,
                        quality,
                        qualityIndex,
                        description: selectedType.description,
                        // Simplified pricing for weird items - could be 0 or low fixed value
                        purchasePrice: Math.max(CONFIG.MIN_ITEM_PRICE, Math.round(selectedType.baseValue * qualityPriceModifier * (0.2 + Math.random() * 0.2))), // Customer asks for less for weird stuff
                    };
                    itemToSell.estimatedResaleValue = itemToSell.purchasePrice; // Rikk values it at what he paid initially
                    debugLogger.log('CustomerManager', `Generated weird item: ${itemToSell.name} for ${template.key}`);
                    return itemToSell;
                }
            }
        }

        // 4. Evaluate sellPreference
        if (!itemToSell && template && template.gameplayConfig && template.gameplayConfig.sellPreference) {
            const sellPref = template.gameplayConfig.sellPreference;
            let chosenPreference = null;

            if (sellPref.or && Array.isArray(sellPref.or)) {
                // Filter preferences that pass their individual chance rolls first
                const eligiblePreferences = sellPref.or.filter(p => (typeof p.chance === 'number' ? Math.random() < p.chance : true));
                if (eligiblePreferences.length > 0) {
                    chosenPreference = this._getRandomElement(eligiblePreferences);
                }
            } else if (typeof sellPref.chance === 'number' ? Math.random() < sellPref.chance : true) {
                 chosenPreference = sellPref; // Single preference object
            }


            if (chosenPreference) {
                const candidateItemTypes = this.itemTypes.filter(it => this._itemTypeMatchesPreference(it, chosenPreference));
                if (candidateItemTypes.length > 0) {
                    const selectedType = this._getRandomElement(candidateItemTypes);
                    const qualityLevelsForType = this.itemQualityLevels[selectedType.type] || ['Standard'];

                    let possibleQualityIndices = [];
                    const prefQuality = chosenPreference.quality;
                    const prefMinQuality = chosenPreference.minQuality;
                    const prefMaxQuality = chosenPreference.maxQuality;

                    for (let i = 0; i < qualityLevelsForType.length; i++) {
                        const qualityAvailable = true; // Future: could check if a specific quality is "locked" for a type

                        if (qualityAvailable) {
                            if (typeof prefQuality === 'number') { // Specific quality requested
                                if (i === prefQuality) {
                                    possibleQualityIndices.push(i);
                                    break; // Found the specific quality, no need to check others
                                }
                            } else { // Range or no specific quality preference
                                const minMatch = (typeof prefMinQuality === 'number' ? i >= prefMinQuality : true);
                                const maxMatch = (typeof prefMaxQuality === 'number' ? i <= prefMaxQuality : true);
                                if (minMatch && maxMatch) {
                                    possibleQualityIndices.push(i);
                                }
                            }
                        }
                    }

                    if (possibleQualityIndices.length === 0) {
                        // This selectedType cannot meet the quality criteria of the chosenPreference.
                        // This path of sellPreference fails for this item type.
                        // Potentially log this event.
                        debugLogger.log('CustomerManager', `Item type ${selectedType.id} cannot meet quality criteria of preference for ${template.key}`);
                        // Continue to the next logic block (itemPool or return null) by not assigning itemToSell here
                    } else {
                        const qualityIndex = this._getRandomElement(possibleQualityIndices);
                        const quality = qualityLevelsForType[qualityIndex];
                        const qualityPriceModifier = this.itemQualityModifiers[selectedType.type]?.[qualityIndex] || 1.0;

                        itemToSell = {
                        id: selectedType.id,
                        name: selectedType.name,
                        itemTypeObj: selectedType,
                        quality,
                        qualityIndex,
                        description: selectedType.description,
                        purchasePrice: Math.max(CONFIG.MIN_ITEM_PRICE, Math.round(selectedType.baseValue * qualityPriceModifier * (0.8 + Math.random() * 0.4))),
                    };
                    itemToSell.estimatedResaleValue = itemToSell.purchasePrice;
                    debugLogger.log('CustomerManager', `Generated item from sellPreference: ${itemToSell.name} for ${template.key}`);
                    return itemToSell;
                }
            }
        }

        // 5. Evaluate itemPool
        if (!itemToSell && template && template.itemPool && template.itemPool.length > 0) {
            const selectedItemId = this._getRandomElement(template.itemPool);
            const selectedType = this.itemTypes.find(it => it.id === selectedItemId);
            if (selectedType) {
                const qualityLevelsForType = this.itemQualityLevels[selectedType.type] || ['Standard'];
                const qualityIndex = Math.floor(Math.random() * qualityLevelsForType.length);
                const quality = qualityLevelsForType[qualityIndex];
                const qualityPriceModifier = this.itemQualityModifiers[selectedType.type]?.[qualityIndex] || 1.0;

                itemToSell = {
                    id: selectedType.id,
                    name: selectedType.name,
                    itemTypeObj: selectedType,
                    quality,
                    qualityIndex,
                    description: selectedType.description,
                    purchasePrice: Math.max(CONFIG.MIN_ITEM_PRICE, Math.round(selectedType.baseValue * qualityPriceModifier * (0.8 + Math.random() * 0.4))),
                };
                itemToSell.estimatedResaleValue = itemToSell.purchasePrice;
                debugLogger.log('CustomerManager', `Generated item from itemPool: ${itemToSell.name} for ${template.key}`);
                return itemToSell;
            }
        }

        // 6. If no item generated by specific rules, return null
        if (!itemToSell) {
            debugLogger.log('CustomerManager', `Customer ${template ? template.key : 'Unknown'} generated nothing to sell based on specific rules (weird, sellPref, itemPool).`);
        }
        return null;
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
        }
    }

    // --- Save/Load and State Management ---
    reset() {
        this.customersPool = [];
        this.nextCustomerId = 1;
        debugLogger.log('CustomerManager', "CustomerManager has been reset.");
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