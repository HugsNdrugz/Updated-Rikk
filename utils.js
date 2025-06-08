// utils.js

export function getRandomElement(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

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
            e.code === 22 || e.code === 1014 ||
            e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            (storage && storage.length !== 0);
    }
}

export const createImage = ({ src, width, content }) => {
    // Assuming this is for HTML string generation or simple object, not direct DOM Image element for canvas.
    // If it was for canvas, it would be `new Image()` and an onload handler.
    // Based on SlotGameManager.createPayTable, it's used for an HTML string.
    return `<img src="${src}" alt="${content || ''}" width="${width}" class="img-thumbnail rounded" />`;
};

export const createEmptyArray = (length) => Array.from({ length }).map((_, i) => i);

export const hexToObject = (hex, r = 16) => ({
    r: parseInt(hex.slice(1, 3), r),
    g: parseInt(hex.slice(3, 5), r),
    b: parseInt(hex.slice(5, 7), r),
    a: parseInt(hex.slice(7, 9), r) || 255
});

export const decToHex = (v) => Math.floor(v).toString(16).padStart(2, '0');

export const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
