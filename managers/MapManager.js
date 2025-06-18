// managers/MapManager.js
import { debugLogger } from '../utils.js';
import { districtsData } from '../data/map_data.js'; // Assuming direct import

class MapManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.allDistricts = districtsData; // Load district data directly

        if (this.gameState.DEBUG_MODE) {
            debugLogger.log('MapManager', 'Initialized with districts data:', this.allDistricts);
        }
        this.initializeMapState();
    }

    initializeMapState() {
        if (!this.gameState.mapState) {
            this.gameState.mapState = {};
        }
        if (!this.gameState.mapState.discoveredDistricts) {
            this.gameState.mapState.discoveredDistricts = [];
            // For Phase 1, let's assume some districts are discovered by default or all are.
            // Example: Discover first district or all if no specific discovery mechanic yet.
            if (this.allDistricts.length > 0) {
                // this.gameState.mapState.discoveredDistricts.push(this.allDistricts[0].id);
                // For Phase 1, let's make all districts initially discovered for simplicity of map display
                this.allDistricts.forEach(district => {
                    if (!this.gameState.mapState.discoveredDistricts.includes(district.id)) {
                        this.gameState.mapState.discoveredDistricts.push(district.id);
                    }
                });
            }
        }
        if (!this.gameState.mapState.districtHeatLevels) { // For future use (Task 3.2.3 for GameState)
            this.gameState.mapState.districtHeatLevels = {};
            this.allDistricts.forEach(district => {
                this.gameState.mapState.districtHeatLevels[district.id] = 0; // Initial heat
            });
        }
    }

    /**
     * Retrieves a district definition by its ID.
     * @param {string} districtId - The ID of the district.
     * @returns {object|undefined} The district object or undefined if not found.
     */
    getDistrict(districtId) {
        return this.allDistricts.find(district => district.id === districtId);
    }

    /**
     * Returns all district definitions.
     * @returns {Array<object>}
     */
    getAllDistricts() {
        return this.allDistricts;
    }

    /**
     * Returns a list of district definitions that the player has discovered.
     * @returns {Array<object>}
     */
    getDiscoveredDistricts() {
        if (!this.gameState.mapState || !this.gameState.mapState.discoveredDistricts) {
            return [];
        }
        return this.allDistricts.filter(district =>
            this.gameState.mapState.discoveredDistricts.includes(district.id)
        );
    }

    // --- Methods for future dynamic heat and POIs ---
    // updateDistrictHeat(districtId, amount) { ... }
    // getDistrictHeat(districtId) { ... }
    // addPointOfInterest(districtId, poiObject) { ... }
    // getPointsOfInterest(districtId) { ... }
}

export { MapManager };
