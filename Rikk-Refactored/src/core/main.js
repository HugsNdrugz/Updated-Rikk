// src/core/main.js
import { Game } from './Game.js';

// This is the main entry point for the application.
// It waits for the DOM to be fully loaded, then creates and starts the game.
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing game...");

    const game = new Game();

    // Start the game. This will handle data loading, state initialization, UI setup, etc.
    game.start().catch(error => {
        // Catch any critical errors during game startup
        console.error("A critical error occurred during game initialization:", error);
        // Optionally, display a user-friendly error message on the page
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = `
                <div style="padding: 20px; text-align: center; color: red;">
                    <h1>Oops! Something went wrong.</h1>
                    <p>Could not start the game. Please try refreshing the page or contact support if the problem persists.</p>
                    <p><em>Error: ${error.message}</em></p>
                </div>
            `;
        }
    });

    // For debugging purposes, making the game instance globally accessible.
    // In a production environment, you might want to remove or conditionalize this.
    window.rikkGame = game;
    console.log("Game instance is now available as window.rikkGame for debugging.");
});
