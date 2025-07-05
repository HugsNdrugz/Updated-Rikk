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
    CHANCE_SELL_WEIRD_ITEM: 0.05, // This will be primarily superseded by new logic but kept for addicted state
    CHANCE_CUSTOMER_BUYS_RANDOM_ITEM: 0.10
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
        console.log("MANAGER: CustomerManager constructor called");
        this.customerTemplates = customerTemplatesData;
        this.itemTypes = itemTypesData;
        this.itemQualityLevels = itemQualityLevelsData;
        this.itemQualityModifiers = itemQualityModifiersData;

        this.customersPool = [];
        this.nextCustomerId = 1;
        this.customerCooldowns = {}; // { customerId: turnLastInteracted }
        this.currentTurn = 0; // Simple turn counter, incremented each time an interaction is generated

        // Cooldown durations in turns
        this.REGULAR_COOLDOWN_DURATION = 3; // e.g., 3 turns
        this.SNITCH_COOLDOWN_DURATION = 10; // e.g., 10 turns (Concerned Carol is SNITCH_ARCHETYPE_KEY)
        this.SNITCH_ARCHETYPE_KEY = "SNITCH"; // Make sure this matches the key in customer_templates.js

        // For Oddity generation
        this.CRAVING_THRESHOLD_FOR_ODDITIES = 4; // Defined in CONFIG before, now class member for clarity
        this.ODDITY_SELL_CHANCE_HIGH_CRAVING = 0.10; // 10% chance if craving is high
    }

    /**
     * The main public method to generate a complete customer interaction object.
     * @param {object} gameState - An object containing relevant state from the main script (e.g., inventory, cash, skills, currentTurn, customersInteractedThisTurn).
     * @returns {object} A fully-formed interaction object for the main script to use.
     */
    generateInteraction(gameState) {
        this.currentTurn++; // Increment turn counter for cooldowns
        const { inventory, cash, playerSkills, activeWorldEvents, combinedWorldEffects, customersInteractedThisTurn } = gameState;

        const customerInstance = this._selectOrGenerateCustomerFromPool(this.currentTurn, customersInteractedThisTurn);

        if (!customerInstance) {
            // This can happen if all potential customers are on cooldown or already interacted today
            debugLogger.log('CustomerManager', 'No eligible customer could be selected or generated.');
            return {
                instance: null,
                name: "No One",
                dialogue: [{ speaker: "narration", text: "The streets are quiet for now..." }],
                choices: [{ text: "Wait a bit.", outcome: { type: "end_interaction_quiet_streets" } }],
                isQuietStreets: true // Special flag
            };
        }

        // Update cooldown for the selected customer
        this.customerCooldowns[customerInstance.id] = this.currentTurn;

        const template = this.customerTemplates[customerInstance.archetypeKey];
        if (!template) {
            debugLogger.error('CustomerManager', `Invalid archetypeKey provided for ID ${customerInstance.id}: ${customerInstance.archetypeKey}`);
            return this._createErrorInteraction(customerInstance);
        }

        // Apply customerScareChance from world effects (can happen after selecting customer, before they speak)
        if (combinedWorldEffects && combinedWorldEffects.customerScareChance > 0 && Math.random() < combinedWorldEffects.customerScareChance) {
            const scareDialogue = this._getDialogue(customerInstance, 'customerScaredOff') || { line: `${customerInstance.name} looks around nervously and bolts.`, payload: null };
            return {
                instance: customerInstance,
                name: customerInstance.name,
                dialogue: [{ speaker: "narration", text: scareDialogue.line }],
                choices: [{ text: "Damn.", outcome: { type: "end_interaction_scared", payload: scareDialogue.payload } }],
                itemContext: null,
                archetypeKey: customerInstance.archetypeKey,
                mood: customerInstance.mood, // or a specific 'scared' mood
                isScaredOff: true
            };
        }

        // Determine customer's intent *before* greeting or generating items
        let customerIntentIsToSellToRikk;
        if (template.sellsOnly) {
            customerIntentIsToSellToRikk = true;
        } else if (template.buysOnly) {
            customerIntentIsToSellToRikk = false;
        } else {
            // Default logic if not buysOnly/sellsOnly
            customerIntentIsToSellToRikk = Math.random() < CONFIG.BASE_CUSTOMER_SELLS_CHANCE;
            if (inventory.length === 0) customerIntentIsToSellToRikk = true; // If Rikk has nothing, customer more likely to offer
            if (inventory.length >= CONFIG.INVENTORY_FULL_THRESHOLD) customerIntentIsToSellToRikk = false; // If Rikk's inventory is full, less likely to be sold to
        }

        // Fetch general greeting (should be neutral to intent now)
        const greetingResult = this._getDialogue(customerInstance, 'greeting');
        let dialogue = [
            { speaker: "customer", text: greetingResult.line },
            // Rikk's response can also be more general now
            { speaker: "rikk", text: this._getRandomElement(["Yo.", "Aight.", "What's good?", "Speak to me."]) }
        ];

        let choices = [];
        let itemContext = null;

        if (customerIntentIsToSellToRikk) {
            // Customer wants to sell an item to Rikk
            itemContext = this._generateRandomItem(customerInstance, template, combinedWorldEffects);

            if (!itemContext) { // Customer decided not to sell or had nothing suitable after all
                const noItemDialogue = this._getDialogue(customerInstance, 'customerHasNothingToSell') || { line: `${customerInstance.name} shrugs. "Ain't got nothin' for ya today, chief."`, payload: null };
                dialogue.push({ speaker: "customer", text: noItemDialogue.line });
                choices.push({ text: "Aight.", outcome: { type: "end_interaction_no_item", payload: noItemDialogue.payload } });
            } else {
                customerInstance.currentItemName = itemContext.name;
                const customerDemandsPrice = this._calculateItemValue(itemContext, true, { playerSkills, activeWorldEvents, customerInstance, combinedWorldEffects });
                const offerText = `Yo Rikk, peep this. Got a ${itemContext.quality} ${itemContext.name}. How's $${customerDemandsPrice} sound?`;
                dialogue.push({ speaker: "customer", text: offerText });
                itemContext.itemInstanceId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                const declineResultOriginal = this._getDialogue(customerInstance, 'rikkDeclinesToBuy');

                if (!customerInstance.hasMetRikkBefore) {
                    // New customer etiquette choices

                    // BAD ETIQUETTE DECLINE
                    let rudeDismissalPayload = { type: "EFFECT", effects: [] };
                    // Note: The original instruction mentioned merging with 'customerReactsToRudeDismissal' payload.
                    // For this pass, creating a fresh payload as per simplified instruction.
                    // If 'customerReactsToRudeDismissal' also has a payload, it would be merged here or its effects added.

                    // RUDE DECLINE - No direct stat changes here, etiquette system will handle it.
                    choices.push({
                        text: "That's junk. Get lost.", // More dismissive text
                        outcome: {
                            type: "decline_offer_to_buy_rude",
                            etiquetteContext: {
                                event_type: "decline_deal_from_customer",
                                customer_is_new: true,
                                choice_style: "rude",
                                target_customer_id: customerInstance.id,
                                customer_mood: customerInstance.mood
                            }
                        }
                    });

                    // POLITE DECLINE - No direct stat changes here, etiquette system will handle it.
                    choices.push({
                        text: "Not for me. Good looks tho.", // Polite decline
                        outcome: {
                            type: "decline_offer_to_buy_polite",
                            etiquetteContext: {
                                event_type: "decline_deal_from_customer",
                                customer_is_new: true,
                                choice_style: "polite",
                                target_customer_id: customerInstance.id,
                                customer_mood: customerInstance.mood
                            }
                        }
                    });

                } else {
                    // Original "Nah, pass." choice for returning customers (no special etiquette context for now)
                    choices.push({
                        text: "Nah, pass.",
                        outcome: {
                            type: "decline_offer_to_buy",
                            payload: declineResultOriginal.payload
                        }
                    });
                }

                // "Cop it" choices are added after decline options
                if (cash >= customerDemandsPrice) {
                    choices.push({ text: `Cop it ($${customerDemandsPrice})`, outcome: { type: "buy_from_customer", item: itemContext, price: customerDemandsPrice } });
                } else {
                    choices.push({ text: `Cop it (Need $${customerDemandsPrice - cash} more)`, outcome: { type: "buy_from_customer" }, disabled: true });
                }
            }
        } else if (inventory.length > 0) {
            const allOfRikksItems = [...inventory];
            const soldIds = (customerInstance.recentlySoldItems || []).map(record => record.itemInstanceId);
            const potentialItemsToBuy = allOfRikksItems.filter(item => {
                return !item.itemInstanceId || !soldIds.includes(item.itemInstanceId);
            });
            let chosenItem = null;

            if (potentialItemsToBuy.length > 0) {
                if (customerInstance.addictionStatus && customerInstance.addictionStatus.isAddicted && customerInstance.addictionStatus.drugId) {
                    const addictedDrugInStock = potentialItemsToBuy.find(item => item.id === customerInstance.addictionStatus.drugId);
                    if (addictedDrugInStock && Math.random() < 0.85) {
                        chosenItem = addictedDrugInStock;
                    }
                }

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

                if (!chosenItem) {
                    const demandedItemsInStock = potentialItemsToBuy.filter(item =>
                        combinedWorldEffects.specificItemDemand && combinedWorldEffects.specificItemDemand.includes(item.id)
                    );
                    if (demandedItemsInStock.length > 0 && Math.random() < 0.75) {
                        chosenItem = this._getRandomElement(demandedItemsInStock);
                    }
                }

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
                            chosenItem = this._getRandomElement(drugItemsInStock);
                        }
                    }
                }

                if (!chosenItem && potentialItemsToBuy.length > 0) {
                    if (Math.random() < CONFIG.CHANCE_CUSTOMER_BUYS_RANDOM_ITEM) {
                        chosenItem = this._getRandomElement(potentialItemsToBuy);
                        if (chosenItem) {
                             debugLogger.log('CustomerManager', `Customer ${customerInstance.name} buying purely random item: ${chosenItem.name}`);
                        }
                    } else {
                        debugLogger.log('CustomerManager', `Customer ${customerInstance.name} decided against buying a random item.`);
                        chosenItem = null;
                    }
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
        const playerSafeFallback = { line: "...", payload: null }; // Default player-safe fallback

        if (!template || !template.dialogue || !template.dialogue[contextKey]) {
            debugLogger.warn('CustomerManager', `Missing dialogue template or contextKey: '${contextKey}' for archetype '${customerInstance.archetypeKey}'.`);
            return playerSafeFallback;
        }
        const dialogueNode = template.dialogue[contextKey];
        for (const block of dialogueNode) {
            let allConditionsMet = true;
            if (block.conditions && block.conditions.length > 0) {
                for (const condition of block.conditions) {
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
                    else if (!this._checkCondition(customerInstance, condition)) {
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
        debugLogger.warn('CustomerManager', `No matching dialogue block after conditions for contextKey: '${contextKey}' for archetype '${customerInstance.archetypeKey}'.`);
        return playerSafeFallback; // Use the same player-safe fallback
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
    
    _selectOrGenerateCustomerFromPool(currentTurn, customersInteractedThisTurn = []) {
        // Filter existing pool: not on cooldown AND not interacted with today
        const eligibleReturningCustomers = this.customersPool.filter(customer => {
            const isOnCooldown = this.customerCooldowns[customer.id] &&
                (currentTurn - this.customerCooldowns[customer.id] <
                    (customer.archetypeKey === this.SNITCH_ARCHETYPE_KEY ? this.SNITCH_COOLDOWN_DURATION : this.REGULAR_COOLDOWN_DURATION)
                );
            const interactedToday = customersInteractedThisTurn.includes(customer.id);
            return !isOnCooldown && !interactedToday;
        });

        if (eligibleReturningCustomers.length > 0 && Math.random() < CONFIG.RETURNING_CUSTOMER_CHANCE) {
            const returningCustomer = this._getRandomElement(eligibleReturningCustomers);
            // Refresh returning customer's state slightly (e.g., mood, cashOnHand)
            const template = this.customerTemplates[returningCustomer.archetypeKey];
            returningCustomer.hasMetRikkBefore = true; // Should already be true
            if (template) {
                returningCustomer.metadata = returningCustomer.metadata || {};
                 if (returningCustomer.metadata.pendingMoodEffect) {
                    returningCustomer.mood = returningCustomer.metadata.pendingMoodEffect;
                    delete returningCustomer.metadata.pendingMoodEffect;
                } else {
                    returningCustomer.mood = template.baseStats.mood || 'chill'; // Reset mood or use a dynamic system
                }
                returningCustomer.cashOnHand = Math.floor(Math.random() * ((template.priceToleranceFactor || 1) * CONFIG.RETURNING_CUSTOMER_CASH_RANGE)) + CONFIG.RETURNING_CUSTOMER_CASH_BASE;
                if (!returningCustomer.addictionStatus) returningCustomer.addictionStatus = { isAddicted: false, drugId: null, cravingLevel: 0 };
                if (!returningCustomer.recentlySoldItems) returningCustomer.recentlySoldItems = [];
                 // recentlySoldItems are managed per transaction, not reset here
            }
            debugLogger.log('CustomerManager', `Selected returning customer: ${returningCustomer.name} (ID: ${returningCustomer.id})`);
            return returningCustomer;
        }

        // Generate a new customer: ensure their archetype isn't on cooldown (less strict, could be a new instance of same archetype)
        // OR filter archetypeKeys to exclude those whose *instances* are all on cooldown / interacted today.
        // For simplicity, we'll allow new instances of archetypes even if other instances are on cooldown,
        // but the new instance itself won't be on cooldown yet.
        // We must ensure the *new* customer is not one of the customersInteractedThisTurn (though this is less likely for a brand new ID).

        const archetypeKeys = Object.keys(this.customerTemplates);
        let availableArchetypes = archetypeKeys; // Can be further filtered if needed

        if (availableArchetypes.length === 0) {
            debugLogger.warn('CustomerManager', 'No available archetypes to generate a new customer.');
            return null; // Should not happen if templates exist
        }

        const selectedArchetypeKey = this._getRandomElement(availableArchetypes);
        const template = this.customerTemplates[selectedArchetypeKey];
        const customerId = `customer_${this.nextCustomerId++}`;

        // Check if this new ID (though unique) somehow conflicts with interacted today (highly improbable, but good for robustness)
        if (customersInteractedThisTurn.includes(customerId)) {
             debugLogger.warn('CustomerManager', `Generated new customer ID ${customerId} that was already in customersInteractedThisTurn. This is highly unlikely. Skipping.`);
             return null; // Or retry generation, but this indicates a deeper issue if it happens.
        }
        // Also, a new customer cannot be on cooldown.

        const newCustomerInstance = {
            id: customerId,
            name: `${template.baseName} #${customerId.split('_')[1]}`, // More readable name
            archetypeKey: selectedArchetypeKey,
            ...JSON.parse(JSON.stringify(template.baseStats)),
            cashOnHand: Math.floor(Math.random() * ((template.priceToleranceFactor || 1) * CONFIG.NEW_CUSTOMER_CASH_RANGE)) + CONFIG.NEW_CUSTOMER_CASH_BASE,
            hasMetRikkBefore: false,
            addictionStatus: { isAddicted: false, drugId: null, cravingLevel: 0 },
            recentlySoldItems: [],
            metadata: {}
        };

        if (this.customersPool.length < CONFIG.MAX_CUSTOMERS_IN_POOL) {
            this.customersPool.push(newCustomerInstance);
        } else {
            // Replace a random customer if pool is full - could be smarter (e.g., oldest, least interacted)
            const randomIndex = Math.floor(Math.random() * CONFIG.MAX_CUSTOMERS_IN_POOL);
            // Before replacing, remove the old customer's cooldown entry
            if(this.customersPool[randomIndex] && this.customerCooldowns[this.customersPool[randomIndex].id]) {
                delete this.customerCooldowns[this.customersPool[randomIndex].id];
            }
            this.customersPool[randomIndex] = newCustomerInstance;
        }
        debugLogger.log('CustomerManager', `Generated new customer: ${newCustomerInstance.name} (ID: ${newCustomerInstance.id})`);
        return newCustomerInstance;
    }

    _inventoryItemMatchesPreference(inventoryItem, preference) {
        if (!inventoryItem || !preference) return false;
        if (preference.any === false) return false;
        if (preference.any === true) return true;

        let match = true;
        if (preference.id) match = match && inventoryItem.id === preference.id;
        if (preference.type) match = match && inventoryItem.itemTypeObj && inventoryItem.itemTypeObj.type === preference.type;
        if (preference.subType) match = match && inventoryItem.itemTypeObj && inventoryItem.itemTypeObj.subType === preference.subType;
        if (typeof preference.quality === 'number') match = match && inventoryItem.qualityIndex === preference.quality;
        if (typeof preference.minQuality === 'number') match = match && inventoryItem.qualityIndex >= preference.minQuality;
        if (typeof preference.maxQuality === 'number') match = match && inventoryItem.qualityIndex <= preference.maxQuality;
        if (typeof preference.minBaseValue === 'number') match = match && inventoryItem.itemTypeObj && inventoryItem.itemTypeObj.baseValue >= preference.minBaseValue;

        if (!match) return false;

        if (preference.exclude) {
            let excluded = false;
            if (preference.exclude.type && inventoryItem.itemTypeObj && inventoryItem.itemTypeObj.type === preference.exclude.type) excluded = true;
            if (!excluded && preference.exclude.subType && inventoryItem.itemTypeObj && inventoryItem.itemTypeObj.subType === preference.exclude.subType) excluded = true;
            if (!excluded && preference.exclude.id && inventoryItem.id === preference.exclude.id) excluded = true;
            if (excluded) match = false;
        }
        return match;
    }

    _itemTypeMatchesPreference(itemType, preference) {
        if (!itemType || !preference) return false;
        if (preference.id && itemType.id !== preference.id) return false;
        if (preference.type && itemType.type !== preference.type) return false;
        if (preference.subType && itemType.subType !== preference.subType) return false;
        if (typeof preference.maxBaseValue === 'number' && itemType.baseValue > preference.maxBaseValue) return false;
        return true;
    }

    _generateRandomItem(customerInstance, template = null, combinedWorldEffects = {}) { // Added customerInstance
        if (combinedWorldEffects && combinedWorldEffects.itemScarcity && Math.random() < 0.5) {
            debugLogger.log('CustomerManager', `Item generation stopped by itemScarcity world effect.`);
            return null;
        }
        if (template && template.gameplayConfig && template.gameplayConfig.sellPreference && template.gameplayConfig.sellPreference.any === false) {
            debugLogger.log('CustomerManager', `Customer ${customerInstance.name} has sellPreference.any === false, will not sell anything.`);
            return null;
        }
        let itemToSell = null;

        // 1. Attempt to generate ODDITY based on high craving
        if (customerInstance &&
            customerInstance.addictionStatus &&
            customerInstance.addictionStatus.isAddicted &&
            customerInstance.addictionStatus.cravingLevel >= this.CRAVING_THRESHOLD_FOR_ODDITIES) {

            if (Math.random() < this.ODDITY_SELL_CHANCE_HIGH_CRAVING) {
                let weirdItemPool = [];
                if (template && template.itemPoolWeird && template.itemPoolWeird.length > 0) {
                    weirdItemPool = template.itemPoolWeird;
                } else {
                    weirdItemPool = this.itemTypes.filter(it => it.subType === "ODDITY").map(it => it.id);
                }

                if (weirdItemPool.length > 0) {
                    const selectedWeirdItemId = this._getRandomElement(weirdItemPool);
                    const selectedType = this.itemTypes.find(it => it.id === selectedWeirdItemId);
                    if (selectedType) {
                        const qualityLevelsForType = this.itemQualityLevels[selectedType.type] || ['Standard'];
                        const qualityIndex = 0; // Oddities usually have one quality
                        const quality = qualityLevelsForType[qualityIndex];
                        itemToSell = {
                            id: selectedType.id,
                            name: selectedType.name,
                            itemTypeObj: selectedType,
                            quality,
                            qualityIndex,
                            description: selectedType.description,
                            purchasePrice: Math.max(CONFIG.MIN_ITEM_PRICE, Math.round(selectedType.baseValue * (this.itemQualityModifiers[selectedType.type]?.[qualityIndex] || 1.0) * (0.2 + Math.random() * 0.2))),
                        };
                        debugLogger.log('CustomerManager', `Generated ODDITY item for addicted customer ${customerInstance.name}: ${itemToSell.name}`);
                        return itemToSell; // Successfully generated an oddity
                    }
                }
            } else {
                 debugLogger.log('CustomerManager', `Customer ${customerInstance.name} is highly addicted (craving: ${customerInstance.addictionStatus.cravingLevel}) but did NOT roll to sell an ODDITY this time.`);
            }
        }

        // 2. If no oddity, try to generate item based on customer's sellPreference (template.gameplayConfig.sellPreference)
        if (!itemToSell && template && template.gameplayConfig && template.gameplayConfig.sellPreference) {
            const sellPref = template.gameplayConfig.sellPreference;
            let chosenPreference = null;
            if (sellPref.or && Array.isArray(sellPref.or)) {
                const eligiblePreferences = sellPref.or.filter(p => (typeof p.chance === 'number' ? Math.random() < p.chance : true));
                if (eligiblePreferences.length > 0) chosenPreference = this._getRandomElement(eligiblePreferences);
            } else if (typeof sellPref.chance === 'number' ? Math.random() < sellPref.chance : true) {
                 chosenPreference = sellPref;
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
                        if (typeof prefQuality === 'number') {
                            if (i === prefQuality) { possibleQualityIndices.push(i); break; }
                        } else {
                            const minMatch = (typeof prefMinQuality === 'number' ? i >= prefMinQuality : true);
                            const maxMatch = (typeof prefMaxQuality === 'number' ? i <= prefMaxQuality : true);
                            if (minMatch && maxMatch) possibleQualityIndices.push(i);
                        }
                    }
                    if (possibleQualityIndices.length === 0) {
                        debugLogger.log('CustomerManager', `Item type ${selectedType.id} cannot meet quality criteria of preference for ${customerInstance.name}`);
                    } else {
                        const qualityIndex = this._getRandomElement(possibleQualityIndices);
                        const quality = qualityLevelsForType[qualityIndex];
                        itemToSell = {
                            id: selectedType.id,
                            name: selectedType.name,
                            itemTypeObj: selectedType,
                            quality,
                            qualityIndex,
                            description: selectedType.description,
                        };
                        debugLogger.log('CustomerManager', `Generated item from sellPreference: ${itemToSell.name} for ${customerInstance.name}`);
                        return itemToSell;
                    }
                }
            }
        }

        if (!itemToSell && template && template.itemPool && template.itemPool.length > 0) {
            const selectedItemId = this._getRandomElement(template.itemPool);
            const selectedType = this.itemTypes.find(it => it.id === selectedItemId);
            if (selectedType) {
                const qualityLevelsForType = this.itemQualityLevels[selectedType.type] || ['Standard'];
                const qualityIndex = Math.floor(Math.random() * qualityLevelsForType.length);
                const quality = qualityLevelsForType[qualityIndex];
                itemToSell = {
                    id: selectedType.id,
                    name: selectedType.name,
                    itemTypeObj: selectedType,
                    quality,
                    qualityIndex,
                    description: selectedType.description,
                };
                debugLogger.log('CustomerManager', `Generated item from itemPool: ${itemToSell.name} for ${customerInstance.name}`);
                return itemToSell;
            }
        }

        if (!itemToSell) {
            debugLogger.log('CustomerManager', `Customer ${customerInstance.name} generated nothing to sell.`);
        }
        return null;
    }

    _calculateItemValue(item, purchaseContext = true, context) {
        const { playerSkills, customerInstance, combinedWorldEffects } = context;
        let customerTemplate = null;
        if (customerInstance && customerInstance.archetypeKey) {
            customerTemplate = this.customerTemplates[customerInstance.archetypeKey];
        }
        if (!item || !item.itemTypeObj || typeof item.qualityIndex === 'undefined') {
            debugLogger.warn('_calculateItemValue', 'Item, item.itemTypeObj, or qualityIndex is missing.', item);
            return CONFIG.MIN_ITEM_PRICE;
        }
        let currentPrice = item.itemTypeObj.baseValue;
        if (typeof item.itemTypeObj.range === 'number' && item.itemTypeObj.range > 0) {
            const fluctuation = (Math.random() * item.itemTypeObj.range) - (item.itemTypeObj.range / 2);
            currentPrice += fluctuation;
        }
        currentPrice = Math.round(currentPrice);
        let qualityModifier = this.itemQualityModifiers[item.itemTypeObj.type]?.[item.qualityIndex] || 1.0;
        let effectiveValue = Math.round(currentPrice * qualityModifier);

        // Apply Appraiser Skill
        // When Rikk sells (purchaseContext = false), he gets a better price.
        // When Rikk buys (purchaseContext = true), he pays less.
        if (playerSkills && playerSkills.appraiser && typeof playerSkills.appraiser === 'number' && playerSkills.appraiser > 0) {
            const appraiserSkill = playerSkills.appraiser;
            // Example: 0.75% improvement per skill point (0.0075)
            const appraisalFactor = 0.0075 * appraiserSkill;

            if (!purchaseContext) { // Rikk is selling to customer
                effectiveValue *= (1 + appraisalFactor);
                if (debugLogger && typeof debugLogger.log === 'function' && customerInstance && customerInstance.name && item) { // Check if debugLogger is defined
                    debugLogger.log('AppraiserSkill', `Rikk selling ${item.name} to ${customerInstance.name}. Appraiser skill ${appraiserSkill} increased value by ${appraisalFactor * 100}%.`);
                }
            } else { // Rikk is buying from customer
                effectiveValue *= (1 - appraisalFactor);
                 if (debugLogger && typeof debugLogger.log === 'function' && customerInstance && customerInstance.name && item) {
                    debugLogger.log('AppraiserSkill', `Rikk buying ${item.name} from ${customerInstance.name}. Appraiser skill ${appraiserSkill} decreased demanded price by ${appraisalFactor * 100}%.`);
                }
            }
            effectiveValue = Math.round(effectiveValue);
        }

        if (combinedWorldEffects) {
            if (combinedWorldEffects.allPriceModifier) effectiveValue *= combinedWorldEffects.allPriceModifier;
            if (combinedWorldEffects.drugPriceModifier && item.itemTypeObj && item.itemTypeObj.type === "DRUG") effectiveValue *= combinedWorldEffects.drugPriceModifier;
        }
        if (customerInstance && customerInstance.addictionStatus && customerInstance.addictionStatus.isAddicted &&
            item.id === customerInstance.addictionStatus.drugId && !purchaseContext) {
            const cravingFactor = 1 + (customerInstance.addictionStatus.cravingLevel * 0.1);
            effectiveValue *= cravingFactor;
        }
        if (purchaseContext && customerTemplate) {
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
                customerInstance.addictionStatus.cravingLevel = Math.min((customerInstance.addictionStatus.cravingLevel || 0) + 1, 5);
            } else {
                customerInstance.addictionStatus.cravingLevel = 1;
            }
        }
    }

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
            this.customersPool = state.customersPool.map(customer => ({
                ...customer,
                metadata: customer.metadata || {}
            }));
            this.nextCustomerId = state.nextCustomerId;
        } else {
            this.reset();
        }
    }

    generatePastorJonesInteraction(gameState) {
        const archetypeKey = "PASTOR_JONES";
        const template = this.customerTemplates[archetypeKey];
        if (!template) {
            debugLogger.error('CustomerManager', `Pastor Jones template not found!`);
            return this._createErrorInteraction({ name: "Pastor Jones Error", archetypeKey });
        }

        // Find or create Pastor Jones instance (should be unique)
        let pastorInstance = this.customersPool.find(c => c.archetypeKey === archetypeKey);
        if (!pastorInstance) {
            const customerId = this.nextCustomerId++;
            pastorInstance = {
                id: `customer_${customerId}`,
                name: template.baseName,
                archetypeKey: archetypeKey,
                ...JSON.parse(JSON.stringify(template.baseStats)),
                cashOnHand: 0, // Pastor Jones is not buying/selling in this interaction
                hasMetRikkBefore: this.customersPool.some(c => c.archetypeKey === archetypeKey), // Technically true if he was ever in pool
                addictionStatus: { isAddicted: false, drugId: null, cravingLevel: 0 },
                recentlySoldItems: [],
                metadata: {}
            };
            // Add to pool if not already there to manage uniqueness
            if (!this.customersPool.find(c => c.archetypeKey === archetypeKey)) {
                 if (this.customersPool.length < CONFIG.MAX_CUSTOMERS_IN_POOL) {
                    this.customersPool.push(pastorInstance);
                } else {
                    // Replace a non-unique customer if pool is full, or handle error
                    // For now, let's assume there's space or a more robust unique handling is needed
                    debugLogger.warn("CustomerManager", "Customer pool full, Pastor Jones might not be persisted if not already in pool.");
                }
            }
        }
        pastorInstance.mood = template.baseStats.mood || 'calm'; // Ensure mood is reset/set

        const greetingResult = this._getDialogue(pastorInstance, 'greeting');
        const offerResult = this._getDialogue(pastorInstance, 'offerCommunityHelp');

        let dialogue = [
            { speaker: "customer", text: greetingResult.line },
            { speaker: "rikk", text: this._getRandomElement(["Pastor Jones. What can I do for you?", "Blessings, Pastor. What's the word?"]) },
            { speaker: "customer", text: offerResult.line }
        ];

        let choices = [
            {
                text: "I'll help, Pastor.",
                outcome: {
                    type: "pastor_jones_interaction_resolved",
                    etiquetteContext: { "event_type": "pastor_jones_request", "action_taken": "helped", "target_community_figure_id": "pastor_jones" },
                    followUpDialogueKey: "rikkAgreesToHelpPastor", // Rikk's line
                    customerFollowUpKey: "pastorThanksForHelp" // Pastor's response
                }
            },
            {
                text: "Sorry, Pastor, can't do it.",
                outcome: {
                    type: "pastor_jones_interaction_resolved",
                    etiquetteContext: { "event_type": "pastor_jones_request", "action_taken": "declined", "target_community_figure_id": "pastor_jones" },
                    followUpDialogueKey: "rikkDeclinesPastor",
                    customerFollowUpKey: "pastorDeclinesHelp"
                }
            }
        ];

        // Ensure the instance in the main pool is updated if it was already there
        const poolIndex = this.customersPool.findIndex(c => c.id === pastorInstance.id);
        if (poolIndex !== -1) {
            this.customersPool[poolIndex] = pastorInstance;
        }


        return {
            instance: pastorInstance,
            name: pastorInstance.name,
            dialogue,
            choices,
            itemContext: null, // No item transaction in this specific interaction
            archetypeKey: pastorInstance.archetypeKey,
            mood: pastorInstance.mood,
            isSpecialInteraction: true // Flag for script.js if needed
        };
    }
}