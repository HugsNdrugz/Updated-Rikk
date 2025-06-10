// phone_launcher_drag.js

let draggedItem = null;
let dragOverContainer = null;
let onAppOrderChangedCallback = null;

// Function to initialize the module, potentially with a callback
export function initDraggableGrid(callback) {
    onAppOrderChangedCallback = callback;
    // console.log('Draggable grid initialized.');
}

// Call this when an item starts dragging
export function handleDragStart(event, appElement) {
    draggedItem = appElement;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', appElement.id); // Optional: set data
    appElement.classList.add('dragging');
    // console.log('Drag Start:', appElement.id);
}

// Call this when dragging over an app icon or grid container
export function handleDragOver(event, containerElement) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    dragOverContainer = containerElement; // Keep track of the container we are dragging over
    // console.log('Drag Over:', containerElement.id);
    return false; // Necessary for some browsers
}

// Call this when an item is dropped
export function handleDrop(event, targetAppElementOrGrid) {
    event.preventDefault();
    if (!draggedItem) return;

    const targetIsApp = targetAppElementOrGrid.classList.contains('app-icon');
    const parentGrid = targetIsApp ? targetAppElementOrGrid.closest('.app-grid') : targetAppElementOrGrid;

    if (parentGrid && draggedItem !== targetAppElementOrGrid) {
        if (targetIsApp) {
            // Insert before the target app icon
            parentGrid.insertBefore(draggedItem, targetAppElementOrGrid);
        } else {
            // Dropped on the grid itself, append to the end
            parentGrid.appendChild(draggedItem);
        }
        // console.log('Dropped:', draggedItem.id, 'into/before:', targetAppElementOrGrid.id);

        // Persist changes
        persistAppOrder(parentGrid);
    }
    if (draggedItem) { // Check if draggedItem is not null before accessing classList
        draggedItem.classList.remove('dragging');
    }
    draggedItem = null;
    dragOverContainer = null;
}

// Call this at the end of a drag operation (success or fail)
export function handleDragEnd(event, appElement) {
    // console.log('Drag End:', appElement.id);
    if (draggedItem) { // If dragEnd is called and draggedItem still exists (e.g., drop was outside valid target)
        draggedItem.classList.remove('dragging');
    }
    draggedItem = null;
    dragOverContainer = null;
}

// Helper to get new order and call callback
function persistAppOrder(appGridElement) {
    const pageElement = appGridElement.closest('.launcher-page');
    if (!pageElement || !onAppOrderChangedCallback) return;

    const pageId = pageElement.dataset.pageId; // Assumes .launcher-page will have a data-page-id attribute
    const appIcons = Array.from(appGridElement.querySelectorAll('.app-icon'));
    const newOrder = appIcons.map(icon => icon.dataset.appId); // Assumes .app-icon will have a data-app-id attribute

    // console.log('Persisting order for page:', pageId, 'New order:', newOrder);
    onAppOrderChangedCallback(pageId, newOrder);
}

// Add any additional helper functions or classes for styling (e.g., 'drag-over-active') if needed.
