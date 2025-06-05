// CustomerManager.js
class CustomerManager {
	constructor(customerArchetypesData, itemTypesData, itemQualityLevelsData, itemQualityModifiersData) {
		this.customerArchetypes = customerArchetypesData; // from data_customers.js
		// Potentially store references to item data if item generation is moved here
		// this.itemTypes = itemTypesData;
		// this.itemQualityLevels = itemQualityLevelsData;
		// this.itemQualityModifiers = itemQualityModifiersData;
		
		this.customersPool = [];
		this.nextCustomerId = 1;
		this.MAX_CUSTOMERS_IN_POOL = 20; // Or get from global config
	}
	
	// Method to select/generate a customer
	getNextCustomerProfile() {
		// ... logic from selectOrGenerateCustomerFromPool() ...
		// This method would return the raw customer data object.
	}
	
	// Method to generate the full interaction object
	generateInteraction(customerProfile, rikkInventory, rikkCash, playerSkills, activeWorldEvents) {
		// ... logic from generateCustomerInteractionData() ...
		// This method would take the customerProfile from getNextCustomerProfile()
		// and other necessary game state (rikk's inventory, cash, skills, world events)
		// It would call internal helpers for item generation (if moved here) and value calculation.
		// It would return the full { dialogue, choices, itemContext, ... } object.
	}
	
	// (Optional) Method to update customer after a deal
	updateCustomerPostInteraction(customerData, outcomeType, dealSuccess, itemInvolved) {
		// ... logic for updating loyalty, mood, addiction, lastInteractionWithRikk ...
		// ... potentially call archetype.postDealEffect ...
	}
	
	// (Optional, if item generation is moved here)
	_generateRandomItemForCustomer(customerArchetype) {
		// ... logic from generateRandomItem(), tailored by archetype ...
	}
	
	// (Optional, if value calculation is specialized here)
	_calculateItemValueForCustomer(item, purchaseContext, customerData, playerSkills, activeWorldEvents) {
		// ... logic from calculateItemEffectiveValue(), potentially with more customer-specific twists ...
	}
	
	reset() {
		this.customersPool = [];
		this.nextCustomerId = 1;
	}
	
	// Methods for saving/loading its own state (customersPool, nextCustomerId)
	getSaveState() {
		return {
			customersPool: this.customersPool,
			nextCustomerId: this.nextCustomerId,
		};
	}
	
	loadSaveState(savedCustomerManagerState) {
		if (savedCustomerManagerState) {
			this.customersPool = Array.isArray(savedCustomerManagerState.customersPool) ? savedCustomerManagerState.customersPool : [];
			this.nextCustomerId = savedCustomerManagerState.nextCustomerId || 1;
		}
	}
}