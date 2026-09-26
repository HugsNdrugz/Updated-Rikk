import { debugLogger } from '../utils.js';
import { genericDialogueTemplates } from '../data/customer_templates.js';
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
    BASE_CUSTOMER_SELLS_CHANCE: 0.65, // Increased sell chance so customers offer product/drugs more often
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
        this.lastArchetypeKey = null; // Track last selected archetype to prevent back-to-back repeats

    }

    /**
     * The main public method to generate a complete customer interaction object.
     * @param {object} gameState - An object containing relevant state from the main script (e.g., inventory, cash, skills, currentTurn, customersInteractedThisTurn).
     * @returns {object} A fully-formed interaction object for the main script to use.
     */
    generateInteraction(gameState) {
        this.currentTurn++;
        const { inventory, cash, playerSkills, activeWorldEvents, combinedWorldEffects, customersInteractedThisTurn, heat } = gameState;

        const streetCredGlobal = (typeof gameState.streetCred === 'object' ? gameState.streetCred?.global : gameState.streetCred) || 0;

        let customerInstance = null;
        let itemContext = null; // This will hold the item being discussed/transacted if customer is selling
        let customerTemplate = null;
        const MAX_SELECTION_RETRIES = 10;
        let selectionRetries = 0;
        let successfullySelectedCustomer = false;
        let excludedArchetypesForThisTurnAttempt = []; // Archetypes that failed item gen in this specific generateInteraction call

        do {
            customerInstance = this._selectOrGenerateCustomerFromPool(this.currentTurn, customersInteractedThisTurn, excludedArchetypesForThisTurnAttempt, streetCredGlobal);

            if (!customerInstance) {
                debugLogger.log('CustomerManager', `No eligible customer could be selected or generated after ${selectionRetries} retries or initially.`);
                return { // Return quiet streets object
                    instance: null, name: "No One",
                    dialogue: [{ speaker: "narration", text: "The streets are quiet for now..." }],
                    choices: [{ text: "Wait a bit.", outcome: { type: "end_interaction_quiet_streets" } }],
                    isQuietStreets: true
                };
            }

            customerTemplate = this.customerTemplates[customerInstance.archetypeKey];
            if (!customerTemplate) {
                debugLogger.error('CustomerManager', `Invalid archetypeKey for ID ${customerInstance.id}: ${customerInstance.archetypeKey}. This should not happen.`);
                return this._createErrorInteraction(customerInstance); // Critical error
            }

            if (customerTemplate.sellsOnly) {
                // For sellsOnly characters, try to generate their item immediately.
                itemContext = this._generateRandomItem(customerInstance, customerTemplate, combinedWorldEffects, streetCredGlobal);
                if (itemContext) {
                    successfullySelectedCustomer = true; // Valid sellsOnly customer with an item.
                } else {
                    // This sellsOnly customer couldn't generate an item. Add its archetype to a temporary exclusion list for this turn's re-selection process.
                    debugLogger.log('CustomerManager', `SellsOnly customer ${customerInstance.name} (Archetype: ${customerInstance.archetypeKey}) failed to generate item. Adding to exclusion for this attempt & retrying selection.`);
                    if (!excludedArchetypesForThisTurnAttempt.includes(customerInstance.archetypeKey)) {
                        excludedArchetypesForThisTurnAttempt.push(customerInstance.archetypeKey);
                    }
                    customerInstance = null; // Invalidate this selection, loop will retry.
                    selectionRetries++;
                }
            } else {
                // Customer is not sellsOnly, so they are considered valid for selection.
                // Their intent to buy/sell and specific items will be determined later.
                successfullySelectedCustomer = true;
            }

        } while (!successfullySelectedCustomer && selectionRetries < MAX_SELECTION_RETRIES);

        if (!successfullySelectedCustomer || !customerInstance) {
            debugLogger.log('CustomerManager', 'Failed to find a valid customer interaction after max retries (e.g., all sellsOnly customers had no items).');
            return {
                instance: null, name: "No One",
                dialogue: [{ speaker: "narration", text: "The streets are quiet for now..." }],
                choices: [{ text: "Wait a bit.", outcome: { type: "end_interaction_quiet_streets" } }],
                isQuietStreets: true
            };
        }
        // At this point, customerInstance is valid, and if it's a sellsOnly type, customerTemplate is its template and itemContext is populated.
        // If it's not sellsOnly, customerTemplate is its template, and itemContext is still null (to be determined by intent).

        this.customerCooldowns[customerInstance.id] = this.currentTurn;
        this.lastArchetypeKey = customerInstance.archetypeKey;
        // customerTemplate is already defined from the loop above.

        // --- Contextual Analysis ---
        const isReturningCustomer = customerInstance.hasMetRikkBefore;
        const customerMood = customerInstance.mood;
        // For sellsOnly customers, intent is fixed. itemContext is already determined.
        // For others, determine intent.
        let customerIntent = customerTemplate.sellsOnly ? 'sell' :
                             (customerTemplate.buysOnly ? 'buy' :
                             (Math.random() < CONFIG.BASE_CUSTOMER_SELLS_CHANCE ? 'sell' : 'buy'));

        // Adjust intent based on Rikk's inventory, but NOT for sellsOnly characters whose item is already set.
        if (!customerTemplate.sellsOnly) {
            if (inventory.length === 0 && customerIntent === 'buy') {
                customerIntent = 'sell'; // If Rikk has nothing, non-sellsOnly customer might try to sell
            }
            if (inventory.length >= CONFIG.INVENTORY_FULL_THRESHOLD && customerIntent === 'sell') {
                customerIntent = 'buy'; // If Rikk is full, non-sellsOnly customer might try to buy
            }
        }


        let isUsualAvailable = false;
        let preferredItemName = "their usual"; // Generic default

        if (isReturningCustomer && customerIntent === 'buy' && customerTemplate.gameplayConfig?.buyPreference) {
            const buyPrefs = Array.isArray(customerTemplate.gameplayConfig.buyPreference.or) ? customerTemplate.gameplayConfig.buyPreference.or : [customerTemplate.gameplayConfig.buyPreference];
            for (const pref of buyPrefs) {
                // Simplified check: just check if any item Rikk has matches the ID or SubType of a preference.
                // A more robust check would consider quality, etc., as in _inventoryItemMatchesPreference.
                const matchedItemInStock = inventory.find(item =>
                    (pref.id && item.id === pref.id) ||
                    (pref.subType && item.itemTypeObj?.subType === pref.subType) ||
                    (pref.type && item.itemTypeObj?.type === pref.type)
                );
                if (matchedItemInStock) {
                    isUsualAvailable = true;
                    preferredItemName = matchedItemInStock.name; // Or derive from pref if more specific
                    customerInstance.currentItemName = preferredItemName; // For [USUAL_ITEM_NAME] placeholder
                    break;
                }
            }
        }
        // --- End Contextual Analysis ---

        // Apply customerScareChance from world effects (can happen after selecting customer, before they speak)
        if (combinedWorldEffects && combinedWorldEffects.customerScareChance > 0 && Math.random() < combinedWorldEffects.customerScareChance) {
            const scareDialogue = this._getDialogue(customerInstance, 'customerScaredOff', { mood: customerMood }) || { line: `${customerInstance.name} looks around nervously and bolts.`, payload: null };
            return { /* ... scare return object ... */ }; // Keep existing scare return structure
        }

        // Fetch greeting based on full context
        const greetingContext = { isNew: !isReturningCustomer, intent: customerIntent, isUsualAvailable, mood: customerMood };
        const greetingResult = this._getDialogue(customerInstance, 'greeting', greetingContext);

        let dialogue = [
            { speaker: "customer", text: greetingResult.line },
            { speaker: "rikk", text: this._getRandomElement(["Yo.", "Aight.", "What's good?", "Speak to me."]) }
        ];

        // --- Environmental Interruption Check (Example Point) ---
        // This could also be checked later, e.g. before choices are displayed.
        if (gameState.heat > 70 && activeWorldEvents.some(event => event.type === 'police_activity')) { // Example condition
            const interruption = this._getDialogue(customerInstance, 'interruption_sirens_nearby', { mood: customerMood });
            dialogue.push({ speaker: "narration", text: interruption.line });
            return {
                instance: customerInstance,
                name: customerInstance.name,
                dialogue,
                choices: [{ text: "Damn, cops!", outcome: { type: "end_interaction_interrupted_heat" } }],
                archetypeKey: customerInstance.archetypeKey,
                mood: customerMood, // Or a specific 'panicked' mood
                isInterrupted: true
            };
        }

        let choices = [];
        // itemContext is already declared in the outer scope.
        // This was the source of the "Identifier 'itemContext' has already been declared" error.

        // --- "The Usual" Unavailable Flow ---
        let soldAlternativeAfterUsualFail = false;
        if (isReturningCustomer && customerIntent === 'buy' && !isUsualAvailable) {
            const usualUnavailableDialogue = this._getDialogue(customerInstance, 'usual_unavailable', { mood: customerMood, itemName: preferredItemName }); // Pass preferredItemName
            if(usualUnavailableDialogue.line !== "...") dialogue.push({ speaker: "customer", text: usualUnavailableDialogue.line });
        }

        // --- Mood-Driven Price Tolerance (Example) ---
        // Note: customerTemplate is already defined from the selection loop
        let currentPriceToleranceFactor = customerTemplate.priceToleranceFactor || 1.0;
        if (customerMood === 'angry') currentPriceToleranceFactor *= (customerIntent === 'sell' ? 1.15 : 0.85); // Angry customer wants more if selling, pays less if buying
        if (customerMood === 'desperate' && customerIntent === 'buy') currentPriceToleranceFactor *= 0.85; // Desperate buyer pays more (Rikk effectively gets better price)

        // --- Main Interaction Logic based on Intent ---
        if (customerIntent === 'sell') { // Customer wants to sell an item to Rikk
            // If customer is 'sellsOnly', itemContext was already populated and validated in the selection loop.
            // If customer is not 'sellsOnly' but intent is 'sell', generate item now.
            if (!customerTemplate.sellsOnly) {
                itemContext = this._generateRandomItem(customerInstance, customerTemplate, combinedWorldEffects, streetCredGlobal);
            }
            // Now itemContext is either populated (for sellsOnly or successful non-sellsOnly generation) or null

            if (!itemContext) { // Customer (who is not sellsOnly type) decided not to sell or had nothing suitable.
                                // sellsOnly types would have been filtered out by the selection loop if itemContext was null.
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
                    if (customerTemplate.gameplayConfig && customerTemplate.gameplayConfig.buyPreference) {
                        const buyPref = customerTemplate.gameplayConfig.buyPreference;
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
                let customerOfferPrice = Math.round(rikkBaseSellPrice * (customerTemplate.priceToleranceFactor || 1.0));
                customerOfferPrice = Math.min(customerOfferPrice, customerInstance.cashOnHand);
                const askText = `So, Rikk, that ${itemContext.quality} ${itemContext.name}... what's the word? I got $${customerOfferPrice} burnin' a hole.`;
                dialogue.push({ speaker: "customer", text: askText });
                const declineResult = this._getDialogue(customerInstance, 'rikkDeclinesToSell');
                if (customerInstance.cashOnHand >= customerOfferPrice) {
                    choices.push({ text: `Serve 'em ($${customerOfferPrice})`, outcome: { type: "sell_to_customer", item: itemContext, price: customerOfferPrice } });
                } else {
                    choices.push({ text: `Serve 'em ($${customerOfferPrice}) (Short!)`, outcome: { type: "sell_to_customer" }, disabled: true });
                }
                if (!customerTemplate.negotiationResists && rikkBaseSellPrice > customerOfferPrice + CONFIG.HAGGLE_PRICE_DIFFERENCE_THRESHOLD) {
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
    
    getOutcomeDialogue(customerInstance, contextKey, subContext = {}) {
        return this._getDialogue(customerInstance, contextKey, subContext);
    }

    _getDialogue(customerInstance, primaryContextKey, subContext = {}) {
        debugLogger.log('_getDialogue', `Called for ${customerInstance.archetypeKey}, ContextKey: ${primaryContextKey}, SubContext: ${JSON.stringify(subContext)}`);
        const template = this.customerTemplates[customerInstance.archetypeKey];
        const playerSafeFallback = { line: "...", payload: null };
        const mood = subContext.mood || customerInstance.mood || 'neutral';
        debugLogger.log('_getDialogue', `Effective mood: ${mood}`);

        if (!template || !template.dialogue) {
            debugLogger.warn('CustomerManager', `_getDialogue: No dialogue template for archetype '${customerInstance.archetypeKey}'.`);
            return playerSafeFallback;
        }

        let dialoguePool = template.dialogue[primaryContextKey];
        debugLogger.log('_getDialogue', `Initial dialoguePool for ${primaryContextKey}:`, JSON.parse(JSON.stringify(dialoguePool || null)));

        if (!dialoguePool) {
            // Attempt to get from genericDialogueTemplates
            if (genericDialogueTemplates[primaryContextKey]) {
                dialoguePool = genericDialogueTemplates[primaryContextKey];
                debugLogger.log('_getDialogue', `Using generic dialogue for ${primaryContextKey} for archetype ${customerInstance.archetypeKey}`);
            } else {
                debugLogger.warn('CustomerManager', `_getDialogue: Missing primaryContextKey: '${primaryContextKey}' for archetype '${customerInstance.archetypeKey}' and no generic fallback.`);
                return playerSafeFallback;
            }
        }

        // Navigate nested structure for 'greeting'
        if (primaryContextKey === 'greeting' && !Array.isArray(dialoguePool)) {
            debugLogger.log('_getDialogue', 'Processing "greeting" context.');
            const historyKey = subContext.isNew ? 'new_customer' : 'returning_customer';
            if (!dialoguePool[historyKey]) {
                debugLogger.warn('CustomerManager', `Missing historyKey: '${historyKey}' in greeting for '${customerInstance.archetypeKey}'. Using top-level dialogue pool.`);
            } else {
                dialoguePool = dialoguePool[historyKey];
            }

            const intentKey = subContext.intent === 'sell' ? 'seeking_to_sell' : 'seeking_to_buy';
            if (!dialoguePool[intentKey]) {
                // Fallback for seeking_to_buy if specific intent path (like usual/general) is missing
                if (intentKey === 'seeking_to_buy' && dialoguePool['seeking_to_buy_general']) {
                    dialoguePool = dialoguePool['seeking_to_buy_general'];
                } else if (intentKey === 'seeking_to_buy' && dialoguePool['seeking_to_buy_usual']) {
                     dialoguePool = dialoguePool['seeking_to_buy_usual'];
                } else {
                    debugLogger.warn('CustomerManager', `Missing intentKey: '${intentKey}' in greeting for '${customerInstance.archetypeKey}/${historyKey}'.`);
                    return playerSafeFallback;
                }
            } else {
                 dialoguePool = dialoguePool[intentKey];
            }


            if (intentKey === 'seeking_to_buy' && !subContext.isNew) { // Only for returning customers buying
                const availabilityKey = subContext.isUsualAvailable ? 'seeking_to_buy_usual' : 'seeking_to_buy_general';
                 // If specific usual/general path doesn't exist under seeking_to_buy, dialoguePool might already be the array.
                if (dialoguePool[availabilityKey]) { // Check if it's an object with these keys
                    dialoguePool = dialoguePool[availabilityKey];
                } else if (!Array.isArray(dialoguePool)) {
                    // This means seeking_to_buy was an object but didn't have usual/general, which is a structure error.
                    // Or, if seeking_to_buy itself was the array (simpler structure for some archetypes)
                    debugLogger.warn('CustomerManager', `Missing availabilityKey: '${availabilityKey}' or structure error in greeting for '${customerInstance.archetypeKey}/${historyKey}/${intentKey}'. Using current pool.`);
                    // If dialoguePool is not an array at this point, it's an error in template or logic.
                     if (!Array.isArray(dialoguePool)) return playerSafeFallback;
                }
            }
        }

        // Ensure dialoguePool is an array of blocks now
        if (!Array.isArray(dialoguePool)) {
            debugLogger.warn('CustomerManager', `Dialogue pool for '${primaryContextKey}' (final path) is not an array for '${customerInstance.archetypeKey}'. Path: ${JSON.stringify(subContext)}`);
            return playerSafeFallback;
        }

        // Filter by mood first
        let moodSpecificBlocks = dialoguePool.filter(block => block.moods && block.moods.includes(mood));
        let chosenBlock = null;

        if (moodSpecificBlocks.length > 0) {
            chosenBlock = this._getRandomElement(moodSpecificBlocks);
        } else {
            // Fallback to mood-agnostic lines within the same context
            let moodAgnosticBlocks = dialoguePool.filter(block => !block.moods);
            if (moodAgnosticBlocks.length > 0) {
                chosenBlock = this._getRandomElement(moodAgnosticBlocks);
            }
        }

        // If still no block, and it's a nested greeting, try to fallback to a more general greeting within the same history/intent
        // This fallback is complex and might be better handled by ensuring templates are complete.
        // For now, if no specific mood/agnostic block is found in the deepest context, it might return fallback.

        if (chosenBlock) {
            // Legacy condition check (can be phased out or integrated with mood selection)
            // For now, if a mood-selected block also has conditions, they must pass.
            if (chosenBlock.conditions && chosenBlock.conditions.length > 0) {
                let allLegacyConditionsMet = true;
                for (const condition of chosenBlock.conditions) {
                    if (!this._checkCondition(customerInstance, condition)) {
                        allLegacyConditionsMet = false;
                        break;
                    }
                }
                if (!allLegacyConditionsMet) {
                    // This specific mood-matched block failed legacy conditions.
                    // Ideally, we'd try another mood-matched block or then mood-agnostic.
                    // For simplicity now, might fall through to global fallback if this happens.
                    // Or, better: re-filter the chosen pool (moodSpecific or moodAgnostic) to exclude this failed block and try again.
                    // This part needs refinement for robust fallback.
                    debugLogger.log('CustomerManager', `Mood-matched block failed legacy conditions for ${primaryContextKey}.`);
                    // Quick fix: try a mood-agnostic one from the original pool if mood-specific failed conditions
                    if (moodSpecificBlocks.includes(chosenBlock)) { // if the failed block was mood-specific
                       let moodAgnosticBlocks = dialoguePool.filter(block => !block.moods);
                       if (moodAgnosticBlocks.length > 0) chosenBlock = this._getRandomElement(moodAgnosticBlocks);
                       else chosenBlock = null; // No mood-agnostic fallback in this specific context
                    } else { // The failed block was already mood-agnostic
                        chosenBlock = null;
                    }
                     if (chosenBlock && chosenBlock.conditions && chosenBlock.conditions.length > 0) { // Re-check conditions if we picked a new block
                        let allLegacyConditionsMetRetry = true;
                        for (const condition of chosenBlock.conditions) {
                           if (!this._checkCondition(customerInstance, condition)) {allLegacyConditionsMetRetry = false; break;}
                        }
                        if(!allLegacyConditionsMetRetry) chosenBlock = null;
                     }
                }
            }
        }

        if (chosenBlock && chosenBlock.lines && chosenBlock.lines.length > 0) {
            const randomLine = this._getRandomElement(chosenBlock.lines);
            const processedLine = randomLine
                .replace(/\[ITEM_NAME\]/g, customerInstance.currentItemName || 'the goods') // General fallback
                .replace(/\[USUAL_ITEM_NAME\]/g, subContext.itemName || 'my usual') // For usual_unavailable context
                .replace(/\[CUSTOMER_NAME\]/g, customerInstance.name);
            return { line: processedLine, payload: chosenBlock.payload || null };
        }

        debugLogger.warn('CustomerManager', `No matching dialogue line found for primaryContextKey: '${primaryContextKey}', mood: '${mood}', subContext: ${JSON.stringify(subContext)} for archetype '${customerInstance.archetypeKey}'.`);
        return playerSafeFallback;
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
    
    _selectOrGenerateCustomerFromPool(currentTurn, customersInteractedThisTurn = [], excludedArchetypes = [], streetCredGlobal = 0) {
        // Filter existing pool: not on cooldown AND not interacted with today AND not an excluded archetype
        let eligibleReturningCustomers = this.customersPool.filter(customer => {
            const isOnCooldown = this.customerCooldowns[customer.id] &&
                (currentTurn - this.customerCooldowns[customer.id] <
                    (customer.archetypeKey === this.SNITCH_ARCHETYPE_KEY ? this.SNITCH_COOLDOWN_DURATION : this.REGULAR_COOLDOWN_DURATION)
                );
            const interactedToday = customersInteractedThisTurn.includes(customer.id);
            const isExcluded = excludedArchetypes.includes(customer.archetypeKey);
            return !isOnCooldown && !interactedToday && !isExcluded;
        });

        // Avoid repeating the exact same archetype consecutively if alternatives are available
        if (eligibleReturningCustomers.length > 1 && this.lastArchetypeKey) {
            const nonRepeatReturning = eligibleReturningCustomers.filter(c => c.archetypeKey !== this.lastArchetypeKey);
            if (nonRepeatReturning.length > 0) {
                eligibleReturningCustomers = nonRepeatReturning;
            }
        }

        if (eligibleReturningCustomers.length > 0 && Math.random() < CONFIG.RETURNING_CUSTOMER_CHANCE) {
            const returningCustomer = this._getRandomElement(eligibleReturningCustomers);
            const returnCustomerTemplate = this.customerTemplates[returningCustomer.archetypeKey];
            returningCustomer.hasMetRikkBefore = true;
            if (returnCustomerTemplate) {
                returningCustomer.metadata = returningCustomer.metadata || {};
                if (returningCustomer.metadata.pendingMoodEffect) {
                    returningCustomer.mood = returningCustomer.metadata.pendingMoodEffect;
                    delete returningCustomer.metadata.pendingMoodEffect;
                } else {
                    returningCustomer.mood = returnCustomerTemplate.baseStats.mood || 'chill';
                }
                returningCustomer.cashOnHand = Math.floor(Math.random() * ((returnCustomerTemplate.priceToleranceFactor || 1) * CONFIG.RETURNING_CUSTOMER_CASH_RANGE)) + CONFIG.RETURNING_CUSTOMER_CASH_BASE;
                if (!returningCustomer.addictionStatus) returningCustomer.addictionStatus = { isAddicted: false, drugId: null, cravingLevel: 0 };
                if (!returningCustomer.recentlySoldItems) returningCustomer.recentlySoldItems = [];
            }
            debugLogger.log('CustomerManager', `Selected returning customer: ${returningCustomer.name} (ID: ${returningCustomer.id}), excludedArchetypes: ${JSON.stringify(excludedArchetypes)}`);
            return returningCustomer;
        }

        const allArchetypeKeys = Object.keys(this.customerTemplates);
        // Filter out archetypes based on exclusions, unique checks, streetCred gating, and back-to-back anti-clustering
        let availableArchetypes = allArchetypeKeys.filter(key => {
            if (excludedArchetypes.includes(key)) return false;

            // Street cred progression requirements for archetypes
            if (key === "HIGH_ROLLER" && streetCredGlobal < 15) return false;

            const temp = this.customerTemplates[key];
            if (temp.gameplayConfig && temp.gameplayConfig.isUnique) {
                const existingUnique = this.customersPool.find(c => c.archetypeKey === key);
                if (existingUnique) {
                     const isOnCooldown = this.customerCooldowns[existingUnique.id] &&
                        (currentTurn - this.customerCooldowns[existingUnique.id] <
                            (existingUnique.archetypeKey === this.SNITCH_ARCHETYPE_KEY ? this.SNITCH_COOLDOWN_DURATION : this.REGULAR_COOLDOWN_DURATION)
                        );
                    const interactedToday = customersInteractedThisTurn.includes(existingUnique.id);
                    if(isOnCooldown || interactedToday) return false;
                }
            }
            return true;
        });

        // Avoid generating the exact same archetype consecutively if other options exist
        if (availableArchetypes.length > 1 && this.lastArchetypeKey) {
            const nonRepeatArchetypes = availableArchetypes.filter(k => k !== this.lastArchetypeKey);
            if (nonRepeatArchetypes.length > 0) {
                availableArchetypes = nonRepeatArchetypes;
            }
        }

        if (availableArchetypes.length === 0) {
            debugLogger.warn('CustomerManager', `No available archetypes to generate a new customer after exclusions: ${JSON.stringify(excludedArchetypes)}.`);
            return null;
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

    _itemTypeMatchesPreference(itemType, preference, streetCredGlobal = 0) {
        if (!itemType || !preference) return false;
        if (preference.id && itemType.id !== preference.id) return false;
        if (preference.type && itemType.type !== preference.type) return false;
        if (preference.subType && itemType.subType !== preference.subType) return false;
        if (typeof preference.maxBaseValue === 'number' && itemType.baseValue > preference.maxBaseValue) return false;

        // Progression gating: high-tier items require street cred progression
        if (streetCredGlobal < 5 && itemType.baseValue > 120) return false;
        if (streetCredGlobal < 15 && itemType.baseValue > 200) return false;

        return true;
    }

    _generateRandomItem(customerInstance, template = null, combinedWorldEffects = {}, streetCredGlobal = 0) {
        if (combinedWorldEffects && combinedWorldEffects.itemScarcity && Math.random() < 0.5) {
            debugLogger.log('CustomerManager', `Item generation stopped by itemScarcity world effect.`);
            return null;
        }
        if (template && template.gameplayConfig && template.gameplayConfig.sellPreference && template.gameplayConfig.sellPreference.any === false) {
            debugLogger.log('CustomerManager', `Customer ${customerInstance.name} has sellPreference.any === false, will not sell anything.`);
            return null;
        }
        let itemToSell = null;

        // Generate item based on customer's sellPreference (template.gameplayConfig.sellPreference)
        if (!itemToSell && template && template.gameplayConfig && template.gameplayConfig.sellPreference) {
            const sellPref = template.gameplayConfig.sellPreference;
            let preferencesList = [];
            if (sellPref.or && Array.isArray(sellPref.or)) {
                preferencesList = sellPref.or;
            } else {
                preferencesList = [sellPref];
            }

            // Shuffle or filter eligible preferences
            const eligiblePreferences = preferencesList.filter(p => (typeof p.chance === 'number' ? Math.random() < p.chance : true));
            const prefsToTry = eligiblePreferences.length > 0 ? eligiblePreferences : preferencesList;

            // Give priority to DRUG type preferences if available to make substances more prevalent
            const drugPrefs = prefsToTry.filter(p => p.type === 'DRUG' || p.subType);
            const selectedPrefList = (drugPrefs.length > 0 && Math.random() < 0.8) ? drugPrefs : prefsToTry;
            const chosenPreference = this._getRandomElement(selectedPrefList);

            if (chosenPreference) {
                let candidateItemTypes = this.itemTypes.filter(it => this._itemTypeMatchesPreference(it, chosenPreference, streetCredGlobal));
                if (candidateItemTypes.length === 0) {
                    // Fallback ignoring street cred restriction if no items match
                    candidateItemTypes = this.itemTypes.filter(it => this._itemTypeMatchesPreference(it, chosenPreference, 999));
                }
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
                        possibleQualityIndices = [0]; // Default fallback if no quality indices matched
                    }
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
}