// Rikk-Refactored/src/core/utils.js

// DEBUG_MODE can be controlled via localStorage for easier toggling without code changes.
// Set localStorage.setItem('rikkRefactoredDebugMode', 'true') in browser console to enable.
export const DEBUG_MODE = localStorage.getItem('rikkRefactoredDebugMode') === 'true' || false;

export const debugLogger = {
    log: (component, message, data) => {
        if (DEBUG_MODE) console.log(`[${component}] ${message}`, data !== undefined ? data : '');
    },
    error: (component, message, error) => {
        // Errors should probably always be logged, or at least more critical ones.
        // For now, respecting DEBUG_MODE for consistency, but this could change.
        if (DEBUG_MODE) console.error(`[${component} ERROR] ${message}`, error !== undefined ? error : '');
    },
    warn: (component, message, data) => {
        if (DEBUG_MODE) console.warn(`[${component} WARN] ${message}`, data !== undefined ? data : '');
    },
    info: (component, message, data) => {
        if (DEBUG_MODE) console.info(`[${component} INFO] ${message}`, data !== undefined ? data : '');
    }
};

/**
 * Returns a random element from an array.
 * @param {Array<T>} arr - The array to pick from.
 * @returns {T|null} A random element from the array, or null if the array is empty or invalid.
 * @template T
 */
export function getRandomElement(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Checks if localStorage is available and usable.
 * @returns {boolean} True if localStorage is available, false otherwise.
 */
export function isLocalStorageAvailable() {
    let storage;
    try {
        storage = window.localStorage;
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
            // Everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // Test name field too, because code might not be present
            e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            //acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

/**
 * Creates an HTML string for an image tag. Primarily for use with SlotGameManager's table builder.
 * @param {object} params - Parameters for the image.
 * @param {string} params.src - The source URL of the image.
 * @param {number|string} [params.width] - The width of the image.
 * @param {string} [params.content] - Alt text for the image.
 * @returns {string} An HTML string for the image.
 */
export const createImage = ({ src, width, content }) => {
    return `<img src="${src}" alt="${content || ''}" ${width ? `width="${width}"` : ''} class="img-thumbnail rounded" />`;
};

/**
 * Creates an empty array of a given length, with elements being their index.
 * @param {number} length - The desired length of the array.
 * @returns {Array<number>} An array of numbers from 0 to length-1.
 */
export const createEmptyArray = (length) => Array.from({ length }).map((_, i) => i);

/**
 * Converts a hex color string to an RGBA object.
 * @param {string} hex - The hex color string (e.g., "#RRGGBB" or "#RRGGBBAA").
 * @param {number} [r=16] - The radix for parsing (default is 16).
 * @returns {{r: number, g: number, b: number, a: number}} An object with r, g, b, a properties.
 */
export const hexToObject = (hex, r = 16) => ({
    r: parseInt(hex.slice(1, 3), r),
    g: parseInt(hex.slice(3, 5), r),
    b: parseInt(hex.slice(5, 7), r),
    a: parseInt(hex.slice(7, 9), r) || 255 // Default alpha to 255 if not present
});

/**
 * Converts a decimal number to a two-digit hex string.
 * @param {number} v - The decimal number.
 * @returns {string} A two-digit hex string.
 */
export const decToHex = (v) => Math.floor(v).toString(16).padStart(2, '0');

/**
 * Returns a Promise that resolves after a specified number of milliseconds.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>}
 */
export const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generates a simple unique ID.
 * @param {string} [prefix='id'] - A prefix for the ID.
 * @returns {string} A unique ID string.
 */
export function generateUniqueId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clamps a number between a minimum and maximum value.
 * @param {number} num - The number to clamp.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The clamped number.
 */
export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

// Add other utility functions from the original utils.js or new ones as needed.
debugLogger.log('Utils', 'Core utilities module loaded.');
