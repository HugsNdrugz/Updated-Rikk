// src/core/EventEmitter.js

/**
 * A simple Event Emitter class for handling event-driven communication.
 * Modules can emit events, and other modules can subscribe to listen for those events.
 */
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Subscribes a listener function to a specific event.
     * @param {string} eventName - The name of the event to listen for.
     * @param {Function} listener - The callback function to execute when the event is emitted.
     */
    on(eventName, listener) {
        if (typeof listener !== 'function') {
            console.error(`Listener for event "${eventName}" is not a function.`);
            return;
        }
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
    }

    /**
     * Emits an event, calling all registered listeners for that event.
     * @param {string} eventName - The name of the event to emit.
     * @param {*} data - The data to pass to the listener functions.
     */
    emit(eventName, data) {
        if (this.events[eventName]) {
            // Iterate over a copy of the listeners array in case a listener modifies the array (e.g., by calling off())
            [...this.events[eventName]].forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`Error in listener for event "${eventName}":`, error);
                }
            });
        }
    }

    /**
     * Unsubscribes a listener function from a specific event.
     * If no listener is provided, all listeners for that event will be removed.
     * @param {string} eventName - The name of the event to unsubscribe from.
     * @param {Function} [listenerToRemove] - The specific listener function to remove.
     */
    off(eventName, listenerToRemove) {
        if (!this.events[eventName]) {
            return;
        }
        if (!listenerToRemove) {
            // Remove all listeners for this event
            delete this.events[eventName];
        } else {
            this.events[eventName] = this.events[eventName].filter(
                listener => listener !== listenerToRemove
            );
            if (this.events[eventName].length === 0) {
                delete this.events[eventName]; // Clean up if no listeners remain
            }
        }
    }

    /**
     * Subscribes a listener function to an event for a single emission.
     * After the event is emitted once, the listener is automatically unsubscribed.
     * @param {string} eventName - The name of the event to listen for.
     * @param {Function} listener - The callback function to execute once when the event is emitted.
     */
    once(eventName, listener) {
        if (typeof listener !== 'function') {
            console.error(`Listener for event "${eventName}" (once) is not a function.`);
            return;
        }
        const onceWrapper = (data) => {
            listener(data);
            this.off(eventName, onceWrapper);
        };
        this.on(eventName, onceWrapper);
    }
}
