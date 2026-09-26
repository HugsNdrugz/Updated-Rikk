import assert from 'node:assert/strict';
import { execSync } from 'child_process';
import { GameState } from '../GameState.js';
import { CustomerManager } from '../classes/CustomerManager.js';
import { customerTemplates } from '../data/customer_templates.js';
import { itemTypes, ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS } from '../data/data_items.js';
import { StreetCredManager } from '../managers/StreetCredManager.js';
import { LoyaltyManager } from '../managers/LoyaltyManager.js';

console.log("==========================================");
console.log("RUNNING RIGOROUS TEST SUITE");
console.log("==========================================\n");

let passed = 0;
let failed = 0;

function runTest(testName, fn) {
    try {
        fn();
        console.log(`[PASS] ${testName}`);
        passed++;
    } catch (err) {
        console.error(`[FAIL] ${testName}`);
        console.error(err);
        failed++;
    }
}

// 1. Syntax Check across all project JS files
runTest("Syntax Check Across Project JS Files", () => {
    const command = 'node -c *.js classes/*.js managers/*.js data/*.js utils.js';
    execSync(command, { encoding: 'utf-8' });
});

// 2. Data Integrity Checks
runTest("Data Integrity: customer_templates.js Contexts & Archetypes", () => {
    if (!customerTemplates || typeof customerTemplates !== 'object') throw new Error("customerTemplates is missing or not an object");

    const requiredKeys = ['key', 'baseName', 'avatarUrl', 'baseStats', 'gameplayConfig', 'dialogue'];

    for (const [archetypeKey, template] of Object.entries(customerTemplates)) {
        for (const reqKey of requiredKeys) {
            if (!(reqKey in template)) {
                throw new Error(`Archetype ${archetypeKey} missing required key: ${reqKey}`);
            }
        }
        if (!template.dialogue.greeting) {
            throw new Error(`Archetype ${archetypeKey} missing dialogue.greeting`);
        }
    }
});

runTest("Data Integrity: data_items.js No Oddities", () => {
    if (!Array.isArray(itemTypes) || itemTypes.length === 0) throw new Error("itemTypes must be a non-empty array");
    const oddities = itemTypes.filter(item => item.subType === 'ODDITY');
    if (oddities.length > 0) {
        throw new Error(`Expected 0 oddity items, found ${oddities.length}`);
    }
    const requiredItemKeys = ['id', 'name', 'baseValue', 'type'];
    itemTypes.forEach(item => {
        for (const reqKey of requiredItemKeys) {
            if (!(reqKey in item)) {
                throw new Error(`Item ${item.id || 'unknown'} missing required property: ${reqKey}`);
            }
        }
    });
});

// 3. CustomerManager Unit Tests
runTest("CustomerManager: Selection, Item Generation & Selling Mechanics", () => {
    const cm = new CustomerManager(customerTemplates, itemTypes, ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS);

    const mockGameState = {
        inventory: [
            { id: "green_crack", name: "Green Crack", quality: "Decent Batch", qualityIndex: 1, itemTypeObj: itemTypes.find(i => i.id === "green_crack") }
        ],
        cash: 500,
        playerSkills: { appraiser: 1, negotiator: 1 },
        activeWorldEvents: [],
        combinedWorldEffects: { heatModifier: 1 },
        customersInteractedThisTurn: [],
        heat: 10,
        streetCred: { global: 10 }
    };

    let generatedSellsCount = 0;
    let generatedDrugsCount = 0;
    const TOTAL_TRIALS = 100;

    for (let i = 0; i < TOTAL_TRIALS; i++) {
        const interaction = cm.generateInteraction(mockGameState);
        if (interaction && !interaction.isQuietStreets) {
            if (interaction.choices && interaction.choices.some(c => c.outcome && c.outcome.type === "buy_from_customer")) {
                generatedSellsCount++;
                if (interaction.itemContext && interaction.itemContext.itemTypeObj && interaction.itemContext.itemTypeObj.type === "DRUG") {
                    generatedDrugsCount++;
                }
            }
        }
    }

    if (generatedSellsCount === 0) {
        throw new Error("CustomerManager generated 0 customer sell offers across 100 trials");
    }
    console.log(`       -> Customer sell offers in 100 trials: ${generatedSellsCount}, Drug sell offers: ${generatedDrugsCount}`);
});

runTest("CustomerManager: Price Calculation & Boundaries", () => {
    const cm = new CustomerManager(customerTemplates, itemTypes, ITEM_QUALITY_LEVELS, ITEM_QUALITY_MODIFIERS);
    const testItem = {
        id: "white_pony",
        name: "Gram of 'White Pony'",
        qualityIndex: 1,
        itemTypeObj: itemTypes.find(i => i.id === "white_pony")
    };

    const val = cm._calculateItemValue(testItem, true, {
        playerSkills: { appraiser: 2 },
        customerInstance: { archetypeKey: "DESPERATE_FIEND" },
        combinedWorldEffects: {}
    });

    if (typeof val !== 'number' || val < 5 || isNaN(val)) {
        throw new Error(`Invalid calculated item value: ${val}`);
    }
});

// 4. GameState Serialization & Operations
runTest("GameState: Serialization & State Integrity", () => {
    const gs = new GameState({
        STARTING_CASH: 500,
        MAX_FIENDS: 15,
        DAYS: ["Monday", "Tuesday"],
        STARTING_STREET_CRED: 0,
        MAX_INVENTORY_SLOTS: 10,
        MAX_HEAT: 100,
        DEFAULT_STARTING_INVENTORY: [],
        defaultCustomerTemplates: customerTemplates
    });

    gs.addCash(150);
    gs.addHeat(25);
    if (gs.getCash() !== 650) throw new Error(`Expected cash 650, got ${gs.getCash()}`);
    if (gs.getHeat() !== 25) throw new Error(`Expected heat 25, got ${gs.getHeat()}`);

    const serialized = gs.toJSON();
    const gs2 = new GameState({
        STARTING_CASH: 500,
        MAX_FIENDS: 15,
        DAYS: ["Monday", "Tuesday"],
        STARTING_STREET_CRED: 0,
        MAX_INVENTORY_SLOTS: 10,
        MAX_HEAT: 100,
        DEFAULT_STARTING_INVENTORY: [],
        defaultCustomerTemplates: customerTemplates
    });

    gs2.fromJSON(serialized);
    if (gs2.getCash() !== 650) throw new Error(`Deserialized cash mismatch: expected 650, got ${gs2.getCash()}`);
    if (gs2.getHeat() !== 25) throw new Error(`Deserialized heat mismatch: expected 25, got ${gs2.getHeat()}`);
});

// 5. Manager Functionality Tests
runTest("StreetCredManager & LoyaltyManager Functionality", () => {
    const gs = new GameState({
        STARTING_CASH: 500,
        MAX_FIENDS: 15,
        DAYS: ["Monday"],
        STARTING_STREET_CRED: 0,
        MAX_INVENTORY_SLOTS: 10,
        MAX_HEAT: 100,
        DEFAULT_STARTING_INVENTORY: [],
        defaultCustomerTemplates: customerTemplates
    });

    const scm = new StreetCredManager(gs);
    scm.addStreetCred("global", null, 5);
    if (scm.getStreetCred("global") !== 5) throw new Error(`Expected StreetCred 5, got ${scm.getStreetCred("global")}`);

    const lm = new LoyaltyManager(gs);
    lm.addLoyalty("customer_1", 3);
    if (lm.getLoyalty("customer_1") !== 53) throw new Error(`Expected Loyalty 53, got ${lm.getLoyalty("customer_1")}`);
});

console.log("\n==========================================");
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("==========================================");

if (failed > 0) {
    process.exit(1);
}
