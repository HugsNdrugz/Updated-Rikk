Okay, I understand. The goal is to integrate the provided Android phone UI and its ambient functionalities (time, date, app grid, notifications) into the "My
Nigga Rikk" game's `rikk-phone-display` element. The phone should behave as follows:

1. **Initial State:** When the game is not in a conversation (or just started), the `rikk-phone-display` should show the ambient Android UI (clock, date, app
grid, dock).
2. **Conversation Mode (Docked):** When a customer interaction begins, the `rikk-phone-display` should transition to showing the game's chat interface
(`chat-container` and `choices-area`), effectively "docking" the ambient Android UI. The existing `phone-header` for the chat will be used.
3. **Conversation End (Undocked):** After a conversation concludes, the phone should revert to displaying the ambient Android UI.
4. **Android Phone Functionality:** The time, date, battery animation, wallpaper animation, app icon click animations, and the general notification pop-up from
the Android phone UI should work when the ambient UI is visible.

Here's how I'll approach this, merging the files:

**1. `index.html`:**
- Add Font Awesome CDN.
- Restructure the `#rikk-phone-display` to contain the Android phone's elements.
- Create two main content layers within the phone screen: `#android-ambient-ui` (for the Android features) and `#game-chat-ui` (for the game's chat). Their
visibility will be toggled.
- Move the existing `phone-header`, `chat-container`, and `choices-area` into `#game-chat-ui`.
- The `volume-btn`, `power-btn`, `notch`, `status-bar`, `dock`, `home-indicator`, and `wallpaper` will be persistent elements within the phone's screen, visible
regardless of which content layer is active.
- Change `onclick` attributes to `data-action` for cleaner JS handling.

**2. `style.css`:**
- Copy relevant styles from the Android phone's `style.css` into the game's `style.css`.
- Adapt Android styles to fit the game's existing CSS variables (e.g., `--phone-max-width`, `--phone-border-radius`).
- Resolve naming conflicts:
- The Android `phone-body` (outer shell) will be `#rikk-phone-display`.
- The Android `.screen` (inner display area) will be `.phone-screen-area`.
- The game's `#chat-container`'s class `phone-body` will be renamed to `phone-chat-body`.
- The game's `choices-area`'s class `phone-footer` will be renamed to `phone-footer-choices`.
- Implement `.phone-mode.active` and `.phone-mode.inactive` for toggling content visibility.
- Adjust `z-index` and positioning to ensure elements stack correctly.
- Remove the game's `rikk-phone-display::before` (notch) in favor of the more detailed Android notch.
- Remove irrelevant `h1`, `p`, `card` styles from the Android CSS.

**3. `script.js`:**
- Create a new file `phone_ambient_ui.js` for the Android phone's specific ambient UI logic.
- **`phone_ambient_ui.js`:**
- Contains `updateTime()`, `showNotification()`, battery animation, wallpaper animation, and app/dock icon animations.
- All DOM queries will be scoped to the phone's elements.
- Export functions for use in `script.js`.
- **`script.js` (main game logic):**
- Import functions from `phone_ambient_ui.js`.
- In `initGame()`, call an initialization function from `phone_ambient_ui.js`.
- Modify `startCustomerInteraction()` to:
- Set `rikkPhoneDisplay` to `active`.
- Hide `#android-ambient-ui` (add `inactive` class, remove `active`).
- Show `#game-chat-ui` (add `active` class, remove `inactive`).
- Hide `dock` and `home-indicator` during chat.
- Modify `endCustomerInteraction()` to:
- Hide `#game-chat-ui`.
- Show `#android-ambient-ui`.
- Show `dock` and `home-indicator`.
- Ensure `openInventoryModal` and `closeInventoryModal` correctly manage phone visibility (the phone should be completely hidden when the inventory is open).

Let's proceed with these changes.

---

**File: `index.html`**

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>My Nigga Rikk - Street Hustle</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body>
    <div id="game-viewport" class="app-root">
        <!-- Splash Screen -->
        <section id="splash-screen" class="screen active" aria-label="Loading Game">
            <div class="content-wrapper">
                <h1 class="splash-title">My Nigga Rikk</h1>
                <p class="splash-tagline">Loading the Hustle...</p>
                <div class="loader"></div>
            </div>
        </section>
        
        <!-- Start Screen (Main Menu) -->
        <section id="start-screen" class="screen overlay-screen" aria-labelledby="start-screen-title">
            <div class="screen-content">
                <h1 id="start-screen-title">My Nigga Rikk</h1>
                <p class="screen-description">What Up doh!. Tonight, you're the connect. Buy low, sell high, and don't get burned. Can you make a killing before
                    the night's over? You fuck around you gonna find out, you're in the game now.</p>
                <div class="button-group">
                    <button id="new-game-btn" class="game-button primary-action">Hit the Streets!</button>
                    <button id="continue-game-btn" class="game-button secondary-action hidden">Continue Hustle</button>
                </div>
            </div>
        </section>
        
        <!-- Game Screen -->
        <main id="game-screen" class="screen" role="main" aria-label="Main Game Area">
            <header id="top-hud" class="hud">
                <div class="hud-item stat-cash">
                    <span class="hud-icon" aria-hidden="true">💰</span>
                    <span class="hud-label">Stash:</span> $<span id="cash-display" class="hud-value">0</span>
                </div>
                <div class="hud-item stat-fiends">
                    <span class="hud-icon" aria-hidden="true">🗓️</span>
                    <span class="hud-label">Fiends Left:</span> <span id="day-display" class="hud-value">10</span>
                </div>
                <div class="hud-item stat-heat">
                    <span class="hud-icon" aria-hidden="true">🔥</span>
                    <span class="hud-label">Heat:</span> <span id="heat-display" class="hud-value">0</span>
                </div>
                <div class="hud-item stat-cred"> <!-- NEW Street Cred -->
                    <span class="hud-icon" aria-hidden="true">🏆</span>
                    <span class="hud-label">Cred:</span> <span id="cred-display" class="hud-value">0</span>
                </div>
            </header>
            
            <div id="event-ticker-container"> <!-- NEW Event Ticker -->
                <p id="event-ticker">Word on the street: All quiet... for now.</p>
            </div>
            
            <div id="game-scene">
                <div id="knock-effect" class="hidden" aria-live="assertive">KNOCK! KNOCK!</div>
                
                <!-- Rikk's Phone Display -->
                <aside id="rikk-phone-display" class="phone-container hidden" role="complementary" aria-label="Customer Interaction Terminal">
                    <!-- Physical buttons (outside screen area) -->
                    <div class="volume-btn"></div>
                    <div class="power-btn"></div>
                    
                    <!-- Screen Area -->
                    <div class="phone-screen-area">
                        <div class="wallpaper"></div> <!-- Animated wallpaper effect -->
                        
                        <!-- Notch always visible on the screen -->
                        <div class="notch">
                            <div class="camera"></div>
                            <div class="speaker"></div>
                        </div>
                        
                        <!-- Status bar always visible on top of the screen -->
                        <div class="status-bar">
                            <div id="current-time-small">12:34</div>
                            <div class="status-icons">
                                <i class="fas fa-signal"></i>
                                <i class="fas fa-wifi"></i>
                                <i class="fas fa-battery-three-quarters"></i>
                            </div>
                        </div>
                        
                        <!-- Android Ambient UI Layer - visible when not in chat -->
                        <div id="android-ambient-ui" class="phone-mode active-mode">
                            <div class="time-display" id="current-time">00:00</div>
                            <div class="date-display" id="current-date">Monday, January 1</div>
                            <div class="notification" id="notification">
                                <div class="notification-content">System Message</div>
                            </div>
                            <div class="app-grid">
                                <div class="app-icon" data-action="messages">
                                    <i class="fas fa-envelope"></i>
                                    <div class="app-label">Messages</div>
                                </div>
                                <div class="app-icon" data-action="camera">
                                    <i class="fas fa-camera"></i>
                                    <div class="app-label">Camera</div>
                                </div>
                                <div class="app-icon" data-action="music">
                                    <i class="fas fa-music"></i>
                                    <div class="app-label">Music</div>
                                </div>
                                <div class="app-icon" data-action="maps">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <div class="app-label">Maps</div>
                                </div>
                                <div class="app-icon" data-action="calendar">
                                    <i class="fas fa-calendar"></i>
                                    <div class="app-label">Calendar</div>
                                </div>
                                <div class="app-icon" data-action="clock">
                                    <i class="fas fa-clock"></i>
                                    <div class="app-label">Clock</div>
                                </div>
                                <div class="app-icon" data-action="calculator">
                                    <i class="fas fa-calculator"></i>
                                    <div class="app-label">Calculator</div>
                                </div>
                                <div class="app-icon" data-action="weather">
                                    <i class="fas fa-cloud-sun"></i>
                                    <div class="app-label">Weather</div>
                                </div>
                                <div class="app-icon" data-action="photos">
                                    <i class="fas fa-photo-video"></i>
                                    <div class="app-label">Photos</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Game Chat UI Layer - visible when in chat -->
                        <div id="game-chat-ui" class="phone-mode inactive-mode">
                            <header class="phone-header">
                                <h3 id="phone-title">Street Talk</h3>
                            </header>
                            <div id="chat-container" class="phone-chat-body" role="log" aria-live="polite">
                                <!-- Chat messages go here -->
                            </div>
                            <footer id="choices-area" class="phone-footer-choices" role="toolbar" aria-label="Response Choices">
                                <!-- Choices buttons go here -->
                            </footer>
                        </div>
                        
                        <!-- Dock always visible on the screen, below the content layers -->
                        <div class="dock">
                            <div class="dock-icon" data-action="phone"><i class="fas fa-phone"></i></div>
                            <div class="dock-icon" data-action="messages"><i class="fas fa-comment"></i></div>
                            <div class="dock-icon" data-action="user"><i class="fas fa-user"></i></div>
                            <div class="dock-icon" data-action="compass"><i class="fas fa-compass"></i></div>
                        </div>
                        
                        <!-- Home indicator always visible on the screen, below the dock -->
                        <div class="home-indicator"></div>
                    </div>
                </aside>
            </div>
            
            <nav id="player-hub" class="player-controls" role="navigation" aria-label="Player Actions">
                <button id="open-inventory-btn" class="hub-button inventory-toggle">
                    <img src="assets/icons/backpack-icon.svg" alt="" class="button-icon" aria-hidden="true" />
                    <span>Stash (<span id="inventory-count-display">0</span>)</span>
                </button>
                <button id="next-customer-btn" class="hub-button main-action next-turn" disabled>
                    <img src="assets/icons/next-icon.svg" alt="" class="button-icon" aria-hidden="true" />
                    <span>Next Fiend</span>
                </button>
            </nav>
        </main>
        
        <!-- End Screen -->
        <section id="end-screen" class="screen overlay-screen" aria-labelledby="end-screen-title">
            <div class="screen-content">
                <h2 id="end-screen-title">The Night's Over!</h2>
                <div class="final-stats">
                    <p>You hustled for <span id="final-days-display" class="stat-value"></span> fiends.</p>
                    <p>Final Stash: $<span id="final-cash-display" class="stat-value"></span></p>
                    <p>Final Street Cred: <span id="final-cred-display" class="stat-value"></span></p> <!-- NEW -->
                </div>
                <p id="final-verdict-text" class="final-verdict"></p>
                <button id="restart-game-btn" class="game-button primary-action">Run it Back</button>
            </div>
        </section>
        
        <!-- Inventory Modal -->
        <div id="inventory-modal" class="modal-overlay hidden" aria-hidden="true">
            <div id="inventory-dialog" class="modal-content" role="dialog" aria-modal="true" aria-labelledby="inventory-modal-title"
                aria-describedby="inventory-modal-description">
                <header class="modal-header">
                    <h2 id="inventory-modal-title">Your Stash</h2>
                    <button class="close-modal-btn" aria-label="Close Stash">
                        <span aria-hidden="true">×</span>
                    </button>
                </header>
                <div id="inventory-modal-description" class="modal-body">
                    <div id="inventory-list" class="inventory-grid">
                    </div>
                </div>
                <footer class="modal-footer">
                    <p class="inventory-capacity">Capacity: <span id="modal-inventory-slots-display">0/0</span></p>
                </footer>
            </div>
        </div>
    </div>
    
    <!-- Audio Elements -->
    <audio id="door-knock-sound" src="assets/audio/door-knock.mp3" preload="auto"></audio>
    <audio id="cash-sound" src="assets/audio/cash-register.mp3" preload="auto"></audio>
    <audio id="denied-sound" src="assets/audio/denied.mp3" preload="auto"></audio>
    <audio id="chat-bubble-sound" src="assets/audio/chat-pop.mp3" preload="auto"></audio>
    
    <!-- DATA FILES FIRST -->
    <script src="data/data_items.js"></script>
    <script src="data/data_customers.js"></script>
    <script src="data/data_events.js"></script>
    <!-- HELPER/MANAGER SCRIPTS -->
    <script src="CustomerManager.js"></script>
    <!-- PHONE UI SCRIPT -->
    <script src="phone_ambient_ui.js"></script>
    <!-- MAIN SCRIPT LAST -->
    <script src="script.js"></script>
</body>

</html>
```

---

**File: `style.css`**

```css
/* === style.css === */

:root {
/* Colors */
--color-dark-bg: #121212;
--color-surface: #1e1e1e;
--color-primary: #bb86fc;
--color-secondary: #03dac6;
--color-error: #cf6679;
--color-on-surface: #e0e0e0;
--color-on-primary: #000000;

--color-light-text: #f0f0f1;
--color-mid-dark: #2c3e50;
--color-grey-dark: #333333;
--color-grey-mid: #757575;
--color-grey-light: #bdbdbd;
--color-grey-dim: #9e9e9e;

/* Accent Colors from theme */
--color-accent-gold: #f39c12;
--color-accent-orange: #e67e22;
--color-link-blue: #3498db;
--color-success-green: #2ecc71;
--color-danger-red: var(--color-error);

/* Semi-Transparent Overlays */
--color-overlay-dark-strong: rgba(0, 0, 0, 0.9);
--color-overlay-dark-medium: rgba(0, 0, 0, 0.65);
--color-overlay-dark-subtle: rgba(0, 0, 0, 0.4);

/* Button Colors using theme */
--color-button-primary-bg: var(--color-primary);
--color-button-primary-text: var(--color-on-primary);
--color-button-primary-border: var(--color-primary);

--color-button-secondary-bg: transparent;
--color-button-secondary-text: var(--color-secondary);
--color-button-secondary-border: var(--color-secondary);

/* Disabled States */
--color-disabled-bg: rgba(224, 224, 224, 0.12);
--color-disabled-border: rgba(224, 224, 224, 0.12);
--color-disabled-text: rgba(224, 224, 224, 0.38);

/* Chat Bubbles */
--color-bubble-customer: #3E3E42; /* Grey for received messages */
--color-bubble-customer-text: var(--color-on-surface);
--color-bubble-rikk-main: var(--color-primary);
--color-bubble-rikk-text: var(--color-on-primary);
--color-bubble-narration: transparent;
--color-bubble-narration-text: var(--color-grey-mid);

/* Hub Buttons */
--color-hub-action-main: var(--color-secondary);
--color-hub-action-hover: #018786;
--color-hub-inventory-main: var(--color-primary);
--color-hub-inventory-hover: #7f39fb;


/* Fonts */
--font-body: 'Roboto', 'Open Sans', sans-serif;
--font-display: 'Press Start 2P', 'Comic Neue', cursive;

/* Sizes & Dimensions */
--viewport-max-width: 480px;
--viewport-border-radius: 12px;
--phone-max-width: 320px; /* Adjusted from 300px for consistency */
--phone-max-height: 70vh;
--phone-border-radius: 24px; /* Outer phone body radius */
--phone-screen-inset-radius: calc(var(--phone-border-radius) - 6px); /* Inner screen elements */
--modal-max-width: 420px;
--modal-border-radius: 10px;
--button-border-radius: 8px;
--chat-bubble-border-radius: 18px;
--icon-size: 22px;

/* Spacing */
--spacing-unit: 8px;
--spacing-xs: calc(var(--spacing-unit) * 0.5);
--spacing-sm: var(--spacing-unit);
--spacing-md: calc(var(--spacing-unit) * 1.5);
--spacing-lg: calc(var(--spacing-unit) * 2);
--spacing-xl: calc(var(--spacing-unit) * 3);
--spacing-xxl: calc(var(--spacing-unit) * 4);

/* Transitions & Animations */
--transition-duration-short: 0.2s;
--transition-duration-medium: 0.4s;
--transition-easing: ease-in-out;
--transition-screen-fade: var(--transition-duration-medium) var(--transition-easing);
--transition-phone-slide: 0.5s cubic-bezier(0.16, 1, 0.3, 1);
--animation-knock-duration: 0.4s;
--animation-pop-in-duration: 0.3s;
}

/* Base Styles & Reset */
* {
box-sizing: border-box;
margin: 0;
padding: 0;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}

html {
font-size: 16px;
}

body {
font-family: var(--font-body);
background-color: #000000;
color: var(--color-on-surface);
min-height: 100vh;
display: flex;
justify-content: center;
align-items: center;
overflow: hidden;
padding: var(--spacing-sm);
}

/* Game Viewport */
#game-viewport {
width: 100%;
max-width: var(--viewport-max-width);
height: 100vh;
max-height: 900px;
background-color: var(--color-dark-bg);
border-radius: var(--viewport-border-radius);
box-shadow: 0 10px 40px rgba(0,0,0,0.8);
display: flex;
flex-direction: column;
overflow: hidden;
position: relative;
border: 1px solid var(--color-grey-dark);
}

/* Screen Styles */
.screen {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
display: none;
flex-direction: column;
text-align: center;
transition: opacity var(--transition-screen-fade), visibility 0s var(--transition-screen-fade);
visibility: hidden;
opacity: 0;
background-color: var(--color-dark-bg);
}

.screen.active {
display: flex;
visibility: visible;
opacity: 1;
}

/* Splash Screen Styles */
#splash-screen {
background-image: url('assets/images/splash-screen-bg.jpg');
background-size: cover;
background-position: center;
justify-content: center;
align-items: center;
z-index: 2000;
}
.splash-title {
font-family: var(--font-display);
font-size: 2.5rem;
color: var(--color-primary);
text-shadow: 2px 2px 0px #000, 4px 4px 0px var(--color-secondary);
margin-bottom: var(--spacing-lg);
}
.splash-tagline {
font-size: 1.1rem;
color: var(--color-on-surface);
text-shadow: 1px 1px 2px #000;
}
.loader {
border: 4px solid rgba(255, 255, 255, 0.2);
border-left-color: var(--color-secondary);
border-radius: 50%;
width: 40px;
height: 40px;
animation: spin 1s linear infinite;
margin-top: var(--spacing-xl);
}
@keyframes spin { to { transform: rotate(360deg); } }


/* Start Screen & End Screen (Overlay Screens) */
.overlay-screen {
justify-content: center;
align-items: center;
padding: var(--spacing-xl);
}
#start-screen.overlay-screen {
background-image: url('assets/images/main-menu-bg.jpg');
background-size: cover;
background-position: center;
}
#end-screen.overlay-screen {
background-color: var(--color-overlay-dark-strong);
}

.overlay-screen .screen-content {
background-color: rgba(30, 30, 30, 0.9);
padding: var(--spacing-xl) var(--spacing-xxl);
border-radius: var(--modal-border-radius);
box-shadow: 0 8px 25px rgba(0,0,0,0.6);
max-width: 90%;
border: 1px solid var(--color-grey-dark);
}


/* Game Screen Background */
#game-screen {
background-image: url('assets/images/game-screen-bg.jpg');
background-size: cover;
background-position: center;
}

/* Typography */
h1, #start-screen-title { /* Combined for start screen title */
font-family: var(--font-display);
font-size: 2.2rem;
color: var(--color-primary);
margin-bottom: var(--spacing-lg);
text-shadow: 2px 2px 0 var(--color-dark-bg), 3px 3px 0 var(--color-secondary);
}
#end-screen-title { /* Specific styling for end screen title */
font-family: var(--font-display);
font-size: 2rem;
color: var(--color-accent-orange);
margin-bottom: var(--spacing-lg);
text-shadow: 2px 2px 0 var(--color-dark-bg);
}


h2 { /* Modal titles, etc. */
font-family: var(--font-display);
font-size: 1.6rem;
color: var(--color-secondary);
margin-bottom: var(--spacing-md);
}
.overlay-screen p.screen-description,
#end-screen p:not(#final-verdict-text) { /* Paragraphs in overlays, excluding final verdict */
font-size: 1rem;
line-height: 1.7;
margin-bottom: var(--spacing-lg);
color: var(--color-grey-light);
}
#final-verdict-text {
font-size: 1.1rem;
font-weight: 700;
margin: var(--spacing-lg) 0;
line-height: 1.6;
}


/* HUD */
#top-hud {
width: 100%;
background-color: rgba(18, 18, 18, 0.8);
padding: var(--spacing-sm) var(--spacing-lg);
display: flex;
justify-content: space-around;
align-items: center;
font-weight: 700;
flex-shrink: 0;
border-bottom: 1px solid var(--color-grey-dark);
font-size: 0.85rem;
box-shadow: 0 2px 10px rgba(0,0,0,0.5);
}
.hud-item {
display: flex;
align-items: center;
gap: var(--spacing-xs);
}
.hud-icon {
font-size: 1.1rem;
margin-right: var(--spacing-xs);
opacity: 0.8;
}
.hud-label {
color: var(--color-grey-light);
margin-right: var(--spacing-xs);
}
.hud-value {
color: var(--color-accent-gold);
}
.stat-cred .hud-value { color: var(--color-primary); }

/* Event Ticker */
#event-ticker-container {
background-color: rgba(18, 18, 18, 0.9);
color: var(--color-secondary);
padding: var(--spacing-xs) var(--spacing-lg);
font-size: 0.8rem;
text-align: center;
font-weight: 700;
border-bottom: 1px solid var(--color-grey-dark);
text-shadow: 1px 1px 1px #000;
flex-shrink: 0;
position: relative;
overflow: hidden;
white-space: nowrap;
}


/* Game Scene Area */
#game-scene {
flex-grow: 1;
width: 100%;
position: relative;
overflow: hidden;
display: flex;
justify-content: center;
align-items: flex-end;
padding: var(--spacing-md);
background-color: transparent;
}


/* Knock Effect */
#knock-effect {
font-family: var(--font-display);
font-size: 2rem;
color: var(--color-on-primary);
background-color: var(--color-error);
padding: var(--spacing-md) var(--spacing-xl);
border-radius: var(--button-border-radius);
animation: knockAnim var(--animation-knock-duration) ease-out;
z-index: 10;
text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
box-shadow: 0 4px 15px rgba(0,0,0,0.3);
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
}

@keyframes knockAnim {
0% { transform: translate(-50%, -50%) scale(0.5) rotate(-5deg); opacity: 0; }
60% { transform: translate(-50%, -50%) scale(1.1) rotate(3deg); opacity: 1; }
100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
}

/* Phone Display - Overall Phone Look */
#rikk-phone-display {
position: relative;
width: 100%;
max-width: var(--phone-max-width);
height: var(--phone-max-height);
background: #111; /* Darker than the screen, for the bezel */
border-radius: var(--phone-border-radius);
display: flex;
flex-direction: column;
overflow: hidden;
transform: translateY(120%);
opacity: 0;
transition: transform var(--transition-phone-slide),
opacity var(--transition-duration-medium) var(--transition-easing);
z-index: 20;
box-shadow: 0 10px 30px rgba(0,0,0,0.4), 0 0 0 4px rgba(50,50,50,0.8);
border: 2px solid #000; /* Outer phone body border */
}

#rikk-phone-display.active {
transform: translateY(0);
opacity: 1;
}

/* Android Phone UI Specific Styles */
#rikk-phone-display .volume-btn {
position: absolute;
left: -5px;
top: 80px;
width: 5px;
height: 80px;
background: #333;
border-top-right-radius: 3px;
border-bottom-right-radius: 3px;
}

#rikk-phone-display .power-btn {
position: absolute;
right: -5px;
top: 100px;
width: 5px;
height: 50px;
background: #333;
border-top-left-radius: 3px;
border-bottom-left-radius: 3px;
}

#rikk-phone-display .phone-screen-area {
width: calc(100% - 20px); /* Account for phone body border */
height: calc(100% - 20px); /* Account for phone body border */
background: linear-gradient(135deg, #1a1a2e, #16213e); /* Inner screen background */
position: relative;
overflow: hidden;
border-radius: calc(var(--phone-border-radius) - 6px); /* Inner screen radius */
margin: 10px; /* To create the bezel effect */
}

#rikk-phone-display .wallpaper {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: linear-gradient(135deg, #6e45e2 0%, #89d4cf 100%);
opacity: 0.2;
z-index: 0; /* Keep it behind other content */
}

#rikk-phone-display .notch {
position: absolute;
top: 0;
left: 50%;
transform: translateX(-50%);
width: 150px;
height: 25px;
background: #111; /* Darker to blend with phone body */
border-bottom-left-radius: 15px;
border-bottom-right-radius: 15px;
z-index: 100; /* Above wallpaper and content */
}

#rikk-phone-display .notch .camera {
position: absolute;
top: 20px; /* Relative to notch */
right: 20px; /* Relative to notch */
width: 12px;
height: 12px;
border-radius: 50%;
background: #333;
border: 2px solid #444;
}

#rikk-phone-display .notch .speaker {
position: absolute;
top: 22px; /* Relative to notch */
left: 50%;
transform: translateX(-50%);
width: 60px;
height: 6px;
background: #222;
border-radius: 3px;
}

#rikk-phone-display .status-bar {
display: flex;
justify-content: space-between;
padding: 10px 20px;
color: white;
font-family: var(--font-body); /* Using game's font */
font-size: 0.8rem;
position: absolute; /* Position above content */
width: 100%;
top: 0;
left: 0;
z-index: 90;
}

#rikk-phone-display .status-icons {
display: flex;
gap: 8px;
}

#rikk-phone-display .time-display {
font-family: var(--font-body);
font-weight: 200;
color: white;
text-align: center;
margin-top: 50px; /* Spacing from top */
font-size: 3.5rem;
letter-spacing: 2px;
}

#rikk-phone-display .date-display {
font-family: var(--font-body);
color: rgba(255, 255, 255, 0.7);
text-align: center;
margin-top: 10px;
font-size: 1rem;
}

#rikk-phone-display .app-grid {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 15px;
padding: 20px;
margin-top: 30px;
place-items: center;
}

#rikk-phone-display .app-icon {
width: 60px;
height: 60px;
border-radius: 15px;
background: rgba(255, 255, 255, 0.1);
display: flex;
justify-content: center;
align-items: center;
color: white;
font-size: 1.5rem;
cursor: pointer;
transition: all 0.2s ease;
flex-direction: column;
}

#rikk-phone-display .app-icon:hover {
transform: scale(1.1);
background: rgba(255, 255, 255, 0.2);
}

#rikk-phone-display .app-label {
font-size: 0.6rem;
margin-top: 5px;
font-family: var(--font-body);
opacity: 0.8;
}

#rikk-phone-display .dock {
position: absolute;
bottom: 50px;
left: 50%;
transform: translateX(-50%);
width: 80%;
height: 50px;
background: transparent; /* Changed to transparent for game's phone */
border-radius: 20px;
display: flex;
justify-content: space-around;
align-items: center;
padding: 0.1px;
z-index: 100; /* Above app grid/ambient ui */
}

#rikk-phone-display .dock-icon {
width: 50px;
height: 40px;
border-radius: 8px;
background: rgba(255, 255, 255, 0.15);
display: flex;
justify-content: center;
align-items: center;
color: white;
font-size: 1.3rem;
cursor: pointer;
transition: all 0.2s ease;
}

#rikk-phone-display .dock-icon:hover {
transform: scale(1.1);
background: rgba(255, 255, 255, 0.25);
}

#rikk-phone-display .home-indicator {
position: absolute;
bottom: 10px;
left: 50%;
transform: translateX(-50%);
width: 100px;
height: 5px;
background: rgba(255, 255, 255, 0.5);
border-radius: 5px;
z-index: 100;
}

#rikk-phone-display .notification {
position: absolute;
top: 150px;
left: 20px;
width: calc(100% - 40px);
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border-radius: 15px;
padding: 15px;
color: white;
font-family: var(--font-body);
animation: slideIn 0.5s forwards;
display: none;
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
z-index: 101; /* Above other UI elements */
}

@keyframes slideIn {
from { transform: translateY(-50px); opacity: 0; }
to { transform: translateY(0); opacity: 1; }
}

#rikk-phone-display .notification-content {
font-size: 0.9rem;
opacity: 0.8;
}

/* New classes for toggling content layers */
.phone-mode {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
display: flex; /* Or grid for app-grid */
flex-direction: column; /* Default for ambient */
justify-content: flex-start; /* Default for ambient */
align-items: center; /* Default for ambient */
transition: opacity 0.3s ease-in-out;
}

.phone-mode.active-mode {
visibility: visible;
opacity: 1;
pointer-events: auto;
}

.phone-mode.inactive-mode {
visibility: hidden;
opacity: 0;
pointer-events: none; /* Disable interaction */
}

/* Game Chat UI Specific Styles */
#game-chat-ui {
background-color: #121212; /* Dark background for chat */
display: flex;
flex-direction: column;
justify-content: space-between; /* To push choices to bottom */
z-index: 50; /* Below status bar, notch, dock, etc. */
}

/* Phone Header Styling (for chat mode) */
.phone-header {
background-color: #2A2A2E;
padding: var(--spacing-sm) var(--spacing-md);
border-bottom: 1px solid #3A3A3C;
text-align: center;
flex-shrink: 0;
color: var(--color-on-surface);
font-weight: 700;
font-size: 0.95rem;
font-family: var(--font-body);
position: relative;
z-index: 60; /* Above chat container */
/* Remove border-radius on header, as phone-screen-area has it */
}

#phone-title {
margin: 0;
}

/* Chat Container - SMS message list styling */
#chat-container.phone-chat-body { /* Renamed for clarity */
flex-grow: 1;
padding: var(--spacing-md);
overflow-y: auto;
display: flex;
flex-direction: column-reverse;
background-color: #121212;
scrollbar-width: thin;
scrollbar-color: var(--color-primary) var(--color-dark-bg);
/* No margin here, relies on parent phone-screen-area padding */
z-index: 55; /* Below header, above wallpaper */
}
#chat-container.phone-chat-body::-webkit-scrollbar { width: 6px; }
#chat-container.phone-chat-body::-webkit-scrollbar-track { background: var(--color-dark-bg); }
#chat-container.phone-chat-body::-webkit-scrollbar-thumb { background-color: var(--color-primary); border-radius: 3px; }


/* Chat Bubbles - Refined for SMS Look */
.chat-bubble {
max-width: 75%;
padding: var(--spacing-sm) var(--spacing-md);
margin-bottom: var(--spacing-xs);
border-radius: var(--chat-bubble-border-radius);
animation: popIn var(--animation-pop-in-duration) forwards;
line-height: 1.45;
word-wrap: break-word;
box-shadow: 0 1px 2px rgba(0,0,0,0.15);
position: relative;
}
.chat-bubble .speaker-name {
display: none;
}

.chat-bubble.customer {
background-color: var(--color-bubble-customer);
color: var(--color-bubble-customer-text);
align-self: flex-start;
border-bottom-left-radius: 6px;
}

.chat-bubble.rikk {
background-color: var(--color-bubble-rikk-main);
color: var(--color-bubble-rikk-text);
align-self: flex-end;
border-bottom-right-radius: 6px;
}

.chat-bubble.narration {
background-color: var(--color-bubble-narration);
color: var(--color-bubble-narration-text);
align-self: center;
max-width: 90%;
text-align: center;
font-style: italic;
border-radius: 0;
font-size: 0.8rem;
padding: var(--spacing-sm) 0;
margin-top: var(--spacing-sm);
margin-bottom: var(--spacing-md);
box-shadow: none;
border: none;
border-top: 1px dashed var(--color-grey-dark);
border-bottom: 1px dashed var(--color-grey-dark);
}

/* Choices Area - Styled like an input field + send buttons */
#choices-area.phone-footer-choices { /* Renamed for clarity */
padding: var(--spacing-sm) var(--spacing-md);
display: flex;
flex-direction: row;
flex-wrap: wrap;
gap: var(--spacing-sm);
background-color: #2A2A2E;
border-top: 1px solid #3A3A3C;
flex-shrink: 0;
align-items: center;
justify-content: flex-start;
min-height: 50px;
/* No margin here, relies on parent phone-screen-area padding */
border-bottom-left-radius: var(--phone-screen-inset-radius); /* Match inner screen radius */
border-bottom-right-radius: var(--phone-screen-inset-radius);
z-index: 60; /* Above chat container */
}

/* Quick Reply Choice Buttons */
.choice-button {
padding: var(--spacing-xs) var(--spacing-md);
border: 1px solid var(--color-primary);
border-radius: 20px;
font-family: var(--font-body);
font-weight: 500;
font-size: 0.8rem;
cursor: pointer;
transition: background-color var(--transition-duration-short) var(--transition-easing),
color var(--transition-duration-short) var(--transition-easing),
transform var(--transition-duration-short) var(--transition-easing);
background-color: transparent;
color: var(--color-primary);
text-align: center;
}

.choice-button:hover {
background-color: var(--color-primary);
color: var(--color-on-primary);
box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.choice-button:active {
transform: scale(0.97);
}

.choice-button:disabled,
.choice-button:disabled:hover {
background-color: var(--color-disabled-bg) !important;
color: var(--color-disabled-text) !important;
border-color: var(--color-disabled-border) !important;
box-shadow: none;
transform: none;
cursor: not-allowed;
}

/* Special styling for decline buttons to make them distinct but still chip-like */
.choice-button.decline {
border-color: var(--color-grey-mid);
color: var(--color-grey-mid);
background-color: transparent;
}

.choice-button.decline:hover {
background-color: var(--color-error);
color: var(--color-on-primary);
border-color: var(--color-error);
}


/* Player Hub Styles */
#player-hub {
display: flex;
justify-content: space-between;
align-items: center;
padding: var(--spacing-sm) var(--spacing-md);
background-color: rgba(18,18,18,0.9);
width: 100%;
flex-shrink: 0;
border-top: 1px solid var(--color-grey-dark);
box-shadow: 0 -2px 10px rgba(0,0,0,0.5);
}

.hub-button {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
gap: var(--spacing-xs);
padding: var(--spacing-sm);
font-family: var(--font-body);
font-weight: 700;
font-size: 0.75rem;
color: var(--color-on-surface);
border: none;
border-radius: var(--button-border-radius);
cursor: pointer;
transition: background-color var(--transition-duration-short) var(--transition-easing), transform var(--transition-duration-short) var(--transition-easing);
background-color: transparent;
flex-grow: 1;
max-width: 120px;
}
.hub-button .button-icon {
width: calc(var(--icon-size) * 1.2);
height: calc(var(--icon-size) * 1.2);
margin-bottom: var(--spacing-xs);
filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.5));
}

#open-inventory-btn:hover {
background-color: var(--color-hub-inventory-main);
color: var(--color-on-primary);
}

.hub-button.main-action:hover {
background-color: var(--color-hub-action-main);
color: var(--color-on-primary);
}

.hub-button:active {
transform: translateY(1px) scale(0.98);
}

.hub-button:disabled,
.hub-button.main-action:disabled {
background-color: transparent !important;
color: var(--color-disabled-text) !important;
cursor: not-allowed;
transform: none;
}
.hub-button:disabled .button-icon {
opacity: 0.5;
}


/* Inventory Modal */
.modal-overlay {
display: none;
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: var(--color-overlay-dark-strong);
z-index: 1000;
justify-content: center;
align-items: center;
opacity: 0;
transition: opacity var(--transition-duration-short) var(--transition-easing);
}
.modal-overlay.active {
display: flex;
opacity: 1;
}

.modal-content {
background-color: var(--color-surface);
padding: 0;
border-radius: var(--modal-border-radius);
width: 90%;
max-width: var(--modal-max-width);
max-height: 85vh;
display: flex;
flex-direction: column;
box-shadow: 0 12px 40px rgba(0,0,0,0.7);
border: 1px solid var(--color-grey-dark);
transform: scale(0.95);
opacity: 0;
transition: transform var(--transition-duration-short) var(--transition-easing),
opacity var(--transition-duration-short) var(--transition-easing);
}
.modal-overlay.active .modal-content {
transform: scale(1);
opacity: 1;
}

.modal-header {
padding: var(--spacing-md) var(--spacing-lg);
border-bottom: 1px solid var(--color-grey-dark);
display: flex;
justify-content: space-between;
align-items: center;
}
.modal-header h2 {
margin: 0;
color: var(--color-primary);
font-size: 1.2rem;
}
.close-modal-btn {
font-size: 1.8rem;
font-weight: 700;
color: var(--color-on-surface);
cursor: pointer;
padding: var(--spacing-xs);
line-height: 1;
background: none;
border: none;
opacity: 0.7;
transition: opacity var(--transition-duration-short) var(--transition-easing);
}
.close-modal-btn:hover {
opacity: 1;
color: var(--color-error);
}

.modal-body {
padding: var(--spacing-lg);
overflow-y: auto;
flex-grow: 1;
}

#inventory-list.inventory-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); /* Wider cards */
gap: var(--spacing-md);
}
.inventory-item-card { /* Styles for the new div wrapper for items */
padding: var(--spacing-sm);
border: 1px solid var(--color-grey-dark);
border-radius: var(--spacing-xs);
background-color: var(--color-dark-bg);
color: var(--color-on-surface);
font-size: 0.9rem;
box-shadow: 0 1px 3px rgba(0,0,0,0.3);
display: flex;
flex-direction: column;
gap: var(--spacing-xs);
}
.inventory-item-card h4 {
font-family: var(--font-body);
font-weight: 700;
color: var(--color-primary);
font-size: 0.9rem;
margin: 0;
}
.item-detail {
display: block;
font-size: 0.75rem;
color: var(--color-grey-light);
line-height: 1.4; /* Increased line height for details */
margin: 0;
}

.modal-footer {
padding: var(--spacing-md) var(--spacing-lg);
border-top: 1px solid var(--color-grey-dark);
text-align: center;
}
.inventory-capacity {
margin: 0;
font-weight: 700;
color: var(--color-secondary);
font-size: 0.9rem;
}


/* Utility Classes */
.hidden {
display: none !important;
}

/* General Game Button Styles (Start/Restart on overlay screens) */
.game-button {
padding: var(--spacing-md) var(--spacing-xl);
font-family: var(--font-display);
font-size: 1rem;
border: 2px solid;
border-radius: var(--button-border-radius);
cursor: pointer;
transition: background-color var(--transition-duration-short) var(--transition-easing),
color var(--transition-duration-short) var(--transition-easing),
transform var(--transition-duration-short) var(--transition-easing),
box-shadow var(--transition-duration-short) var(--transition-easing);
text-shadow: 1px 1px 1px rgba(0,0,0,0.3);
margin-top: var(--spacing-lg);
min-width: 200px;
font-weight: 700;
text-transform: uppercase;
}

.game-button.primary-action {
background-color: var(--color-button-primary-bg);
color: var(--color-button-primary-text);
border-color: var(--color-button-primary-border);
}
.game-button.primary-action:hover {
background-color: var(--color-on-primary);
color: var(--color-button-primary-bg);
box-shadow: 0 0 15px var(--color-button-primary-bg);
}

.game-button.secondary-action {
background-color: var(--color-button-secondary-bg);
color: var(--color-button-secondary-text);
border-color: var(--color-button-secondary-border);
}
.game-button.secondary-action:hover {
background-color: var(--color-button-secondary-text);
color: var(--color-surface);
box-shadow: 0 0 15px var(--color-button-secondary-text);
}


.game-button:active {
transform: translateY(1px) scale(0.98);
}


/* Responsive Design */
@media (max-height: 750px) {
:root { --phone-max-height: 65vh; }
.overlay-screen .screen-content { padding: var(--spacing-lg); }
h1, #start-screen-title { font-size: 2rem; }
#end-screen-title { font-size: 1.8rem; }
.overlay-screen p.screen-description, #end-screen p:not(#final-verdict-text) { font-size: 0.95rem; margin-bottom: var(--spacing-lg); }
.game-button { font-size: 0.9rem; padding: var(--spacing-md) var(--spacing-lg); }
}

@media (max-width: 420px) {
:root {
--viewport-max-width: 100%;
--viewport-border-radius: 0;
}
body { padding: 0; }
#game-viewport { max-height: 100vh; border: none; }

h1, #start-screen-title { font-size: 1.8rem; }
#end-screen-title { font-size: 1.6rem; }
.hub-button {
padding: var(--spacing-sm);
font-size: 0.7rem;
max-width: 100px;
}
:root { --icon-size: 20px; }
#top-hud { font-size: 0.75rem; padding: var(--spacing-xs) var(--spacing-sm); }
.choice-button { font-size: 0.8rem; padding: var(--spacing-sm) var(--spacing-md); }
#phone-screen-header { font-size: 0.95rem; } /* Not used in new structure */
#event-ticker-container { font-size: 0.7rem; }
}

/* Phone Header Styling (for chat mode) */
.phone-header {
background-color: #2A2A2E; /* Slightly lighter than phone body, similar to an existing header style */
padding: var(--spacing-sm) var(--spacing-md);
border-bottom: 1px solid #3A3A3C; /* Subtle separator */
text-align: center; /* Center the title */
flex-shrink: 0;
/* margin: 2px; - Removed, handled by phone-screen-area padding */
/* border-top-left-radius: var(--phone-screen-inset-radius); - Removed, handled by phone-screen-area padding */
/* border-top-right-radius: var(--phone-screen-inset-radius); - Removed, handled by phone-screen-area padding */
}

/* Specific styling for the actual chat body (message list) */
#chat-container { /* Kept this rule for existing chat bubble styles */
flex-grow: 1;
padding: var(--spacing-md);
overflow-y: auto;
display: flex;
flex-direction: column-reverse;
background-color: #121212;
scrollbar-width: thin;
scrollbar-color: var(--color-primary) var(--color-dark-bg);
}

#phone-title {
color: var(--color-on-surface); /* Light text color, should be visible */
font-family: var(--font-body); /* Ensure consistent font */
font-weight: 700; /* Make it bold */
font-size: 0.95rem; /* Good readable size */
margin: 0; /* Remove default h3 margin */
}
```

---

**File: `phone_ambient_ui.js` (NEW FILE)**

```javascript
// phone_ambient_ui.js

/**
* Handles the ambient UI elements and animations of the phone.
* This includes time/date, battery, wallpaper, and app/dock icon animations.
* It's separate from the main game logic to keep concerns separated.
*/

// --- DOM Elements for Ambient UI ---
let currentTimeSmallElement;
let currentTimeElement;
let currentDateElement;
let notificationElement;
let appIcons;
let dockIcons;
let batteryIcons;
let wallpaperElement;

/**
* Initializes the ambient phone UI, sets up time/date updates,
* and attaches event listeners for animations.
*/
export function initPhoneAmbientUI() {
// Select elements within the specific phone container
const phoneContainer = document.getElementById('rikk-phone-display');
if (!phoneContainer) {
console.error("Phone container (#rikk-phone-display) not found. Ambient UI cannot be initialized.");
return;
}

currentTimeSmallElement = phoneContainer.querySelector('#current-time-small');
currentTimeElement = phoneContainer.querySelector('#current-time');
currentDateElement = phoneContainer.querySelector('#current-date');
notificationElement = phoneContainer.querySelector('#notification');
appIcons = phoneContainer.querySelectorAll('.app-icon');
dockIcons = phoneContainer.querySelectorAll('.dock-icon');
batteryIcons = phoneContainer.querySelectorAll('.fa-battery-three-quarters');
wallpaperElement = phoneContainer.querySelector('.wallpaper');

if (!currentTimeElement || !currentDateElement) {
console.warn("Time/Date elements not found in phone UI. Skipping updates.");
return;
}

// Initial update
updateTime();
// Update time every minute
setInterval(updateTime, 60000);

// Setup icon animations
[...appIcons, ...dockIcons].forEach(icon => {
icon.addEventListener('click', function() {
this.style.transform = 'scale(0.9)';
setTimeout(() => {
this.style.transform = 'scale(1.1)';
}, 100);
// Additional action for messages app icon
if (this.dataset.action === 'messages') {
showNotification("My Nigga Rikk: A new customer is here!", "New Message");
}
});
});

// Battery animation
setInterval(() => {
const levels = [
"fa-battery-empty",
"fa-battery-quarter",
"fa-battery-half",
"fa-battery-three-quarters",
"fa-battery-full"
];
const randomLevel = levels[Math.floor(Math.random() * levels.length)];
batteryIcons.forEach(icon => {
icon.classList.remove(...levels); // Remove all possible battery classes
icon.classList.add(randomLevel);
});
}, 10000); // Change every 10 seconds

// Wallpaper animation
let angle = 0;
setInterval(() => {
angle = (angle + 0.2) % 360;
if (wallpaperElement) {
wallpaperElement.style.background = `linear-gradient(${angle}deg, #6e45e2 0%, #89d4cf 100%)`;
}
}, 100);
}

/**
* Updates the current time and date displayed on the phone.
*/
function updateTime() {
const now = new Date();

// Time
let hours = now.getHours();
let minutes = now.getMinutes();
hours = hours < 10 ? "0" + hours : hours; minutes=minutes < 10 ? "0" + minutes : minutes; if (currentTimeElement)
    currentTimeElement.textContent=`${hours}:${minutes}`; if (currentTimeSmallElement) currentTimeSmallElement.textContent=`${hours}:${minutes}`; // Date const
    options={ weekday: "long" , year: "numeric" , month: "long" , day: "numeric" }; if (currentDateElement)
    currentDateElement.textContent=now.toLocaleDateString("en-US", options); } /** * Shows a notification on the phone screen. * @param {string} content The
    message content of the notification. * @param {string} [title="Notification" ] The title of the notification. * @param {number} [duration=3000] How long the
    notification stays visible in ms. */ export function showNotification(content, title="Notification" , duration=3000) { if (notificationElement) { let
    notificationTitleEl=notificationElement.querySelector('.notification-title'); if (!notificationTitleEl) { notificationTitleEl=document.createElement('div');
    notificationTitleEl.classList.add('notification-title'); notificationElement.prepend(notificationTitleEl); // Add before content }
    notificationTitleEl.textContent=title; notificationElement.querySelector('.notification-content').textContent=content;
    notificationElement.style.display="block" ; setTimeout(()=> {
    notificationElement.style.display = "none";
    }, duration);
    }
    }
    ```
    
    ---
    
    **File: `script.js`**
    
    ```javascript
    // --- DOM Element References ---
    const splashScreen = document.getElementById('splash-screen');
    const gameViewport = document.getElementById('game-viewport');
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    
    const newGameBtn = document.getElementById('new-game-btn');
    const continueGameBtn = document.getElementById('continue-game-btn');
    const restartGameBtn = document.getElementById('restart-game-btn');
    
    const cashDisplay = document.getElementById('cash-display');
    const dayDisplay = document.getElementById('day-display'); // Fiends Left
    const heatDisplay = document.getElementById('heat-display');
    const credDisplay = document.getElementById('cred-display');
    const finalCredDisplay = document.getElementById('final-cred-display');
    
    const eventTicker = document.getElementById('event-ticker');
    
    const gameScene = document.getElementById('game-scene');
    const knockEffect = document.getElementById('knock-effect');
    
    const rikkPhoneDisplay = document.getElementById('rikk-phone-display');
    const androidAmbientUI = document.getElementById('android-ambient-ui'); // New: Android UI container
    const gameChatUI = document.getElementById('game-chat-ui'); // New: Game Chat UI container
    const chatContainer = document.getElementById('chat-container');
    const choicesArea = document.getElementById('choices-area');
    const phoneTitleElement = document.getElementById('phone-title');
    const phoneDock = rikkPhoneDisplay.querySelector('.dock'); // New: Dock element
    const phoneHomeIndicator = rikkPhoneDisplay.querySelector('.home-indicator'); // New: Home indicator
    
    const openInventoryBtn = document.getElementById('open-inventory-btn');
    const inventoryCountDisplay = document.getElementById('inventory-count-display');
    const nextCustomerBtn = document.getElementById('next-customer-btn');
    
    const inventoryModal = document.querySelector('#inventory-modal.modal-overlay');
    const closeModalBtn = document.querySelector('#inventory-dialog .close-modal-btn');
    const inventoryList = document.getElementById('inventory-list');
    const modalInventorySlotsDisplay = document.getElementById('modal-inventory-slots-display');
    
    const finalDaysDisplay = document.getElementById('final-days-display');
    const finalCashDisplay = document.getElementById('final-cash-display');
    const finalVerdictText = document.getElementById('final-verdict-text');
    
    // --- Audio References ---
    const doorKnockSound = document.getElementById('door-knock-sound');
    const cashSound = document.getElementById('cash-sound');
    const deniedSound = document.getElementById('denied-sound');
    const chatBubbleSound = document.getElementById('chat-bubble-sound');
    
    // --- Game State Variables ---
    let cash = 0;
    let fiendsLeft = 0;
    let heat = 0;
    let streetCred = 0;
    let inventory = [];
    const MAX_INVENTORY_SLOTS = 10;
    let currentCustomer = null; // Will hold the active customer's data for the interaction
    let gameActive = false;
    let playerSkills = { negotiator: 0, appraiser: 0, lowProfile: 0 };
    let activeWorldEvents = [];
    let dayOfWeek = 'Monday';
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    let customersPool = [];
    let nextCustomerId = 1;
    
    // --- Game Configuration ---
    const CUSTOMER_WAIT_TIME = 1100;
    const KNOCK_ANIMATION_DURATION = 1000;
    const PHONE_ANIMATION_DURATION = 500;
    const SAVE_KEY = 'myNiggaRikkSaveDataV6'; // Incremented for new dialogue structure
    const STARTING_CASH = 500;
    const MAX_FIENDS = 15;
    const SPLASH_SCREEN_DURATION = 2500;
    const STARTING_STREET_CRED = 0;
    const MAX_HEAT = 100;
    const MAX_CUSTOMERS_IN_POOL = 20;
    
    // Import ambient phone UI functions
    import { initPhoneAmbientUI, showNotification as phoneShowNotification } from './phone_ambient_ui.js';
    
    
    // --- Helper function to get a random element from an array ---
    function getRandomElement(arr) {
    if (!arr || arr.length === 0) return "";
    return arr[Math.floor(Math.random() * arr.length)];
    }
    
    // --- HANDLER FUNCTIONS ---
    function handleStartNewGameClick() { initializeNewGameState(); startGameFlow(); }
    function handleContinueGameClick() { if (loadGameState()) { startGameFlow(); } else { displaySystemMessage("System: No saved game found or data corrupted.
    Starting new game."); initializeNewGameState(); startGameFlow(); } }
    function handleRestartGameClick() { initializeNewGameState(); startGameFlow(); }
    
    
    // --- CORE GAME FUNCTIONS ---
    function initGame() {
    splashScreen.classList.add('active'); startScreen.classList.remove('active'); gameScreen.classList.remove('active'); endScreen.classList.remove('active');
    setTimeout(() => { splashScreen.classList.remove('active'); splashScreen.style.display = 'none'; startScreen.classList.add('active'); checkForSavedGame();
    }, SPLASH_SCREEN_DURATION);
    newGameBtn.addEventListener('click', handleStartNewGameClick); continueGameBtn.addEventListener('click', handleContinueGameClick);
    restartGameBtn.addEventListener('click', handleRestartGameBtn);
    nextCustomerBtn.addEventListener('click', nextFiend); openInventoryBtn.addEventListener('click', openInventoryModal);
    closeModalBtn.addEventListener('click', closeInventoryModal);
    inventoryModal.addEventListener('click', (e) => { if (e.target === inventoryModal) closeInventoryModal(); });
    
    // Initialize ambient phone UI
    initPhoneAmbientUI();
    
    // Hide chat UI and show ambient UI by default
    androidAmbientUI.classList.add('active-mode');
    androidAmbientUI.classList.remove('inactive-mode');
    gameChatUI.classList.add('inactive-mode');
    gameChatUI.classList.remove('active-mode');
    
    // Ensure phone is initially hidden in main game screen until interaction
    rikkPhoneDisplay.classList.add('hidden');
    rikkPhoneDisplay.classList.remove('active');
    }
    
    function initializeNewGameState() {
    clearSavedGameState(); cash = STARTING_CASH; fiendsLeft = MAX_FIENDS; heat = 0; streetCred = STARTING_STREET_CRED; inventory = [];
    playerSkills = { negotiator: 0, appraiser: 0, lowProfile: 0 }; activeWorldEvents = []; dayOfWeek = days[0]; gameActive = false;
    customersPool = []; nextCustomerId = 1;
    updateEventTicker();
    }
    
    function startGameFlow() {
    gameActive = true; splashScreen.classList.remove('active'); splashScreen.style.display = 'none'; startScreen.classList.remove('active');
    endScreen.classList.remove('active'); gameScreen.classList.add('active');
    
    // Ensure phone starts in ambient mode
    androidAmbientUI.classList.add('active-mode');
    androidAmbientUI.classList.remove('inactive-mode');
    gameChatUI.classList.add('inactive-mode');
    gameChatUI.classList.remove('active-mode');
    phoneDock.classList.remove('hidden'); // Show dock
    phoneHomeIndicator.classList.remove('hidden'); // Show home indicator
    
    rikkPhoneDisplay.classList.add('hidden'); // Phone starts hidden
    rikkPhoneDisplay.classList.remove('active'); // Phone starts hidden
    
    updateHUD(); updateInventoryDisplay(); clearChat(); clearChoices(); nextFiend();
    }
    
    function endGame(reason) {
    gameActive = false; gameScreen.classList.remove('active'); endScreen.classList.add('active');
    finalDaysDisplay.textContent = MAX_FIENDS - fiendsLeft; finalCashDisplay.textContent = cash; finalCredDisplay.textContent = streetCred;
    if (reason === "heat") { finalVerdictText.textContent = `The block's too hot, nigga! 5-0 swarming. Heat: ${heat}. Time to ghost.`;
    finalVerdictText.style.color = "var(--color-error)"; }
    else if (reason === "bankrupt") { finalVerdictText.textContent = "Broke as a joke, and empty handed. Can't hustle on E, fam."; finalVerdictText.style.color
    = "var(--color-error)"; }
    else { if (cash >= STARTING_CASH * 3 && streetCred > MAX_FIENDS) { finalVerdictText.textContent = "You a certified KINGPIN! The streets whisper your name.";
    } else if (cash >= STARTING_CASH * 1.5 && streetCred > MAX_FIENDS / 2) { finalVerdictText.textContent = "Solid hustle, G. Made bank and respect."; } else if
    (cash > STARTING_CASH) { finalVerdictText.textContent = "Made some profit. Not bad for a night's work."; } else if (cash <= STARTING_CASH && streetCred < 0)
        { finalVerdictText.textContent="Tough night. Lost dough and respect. This life ain't for everyone." ; } else {
        finalVerdictText.textContent="Broke even or worse. Gotta step your game up, Rikk." ; } finalVerdictText.style.color=cash> STARTING_CASH ?
        "var(--color-success-green)" : "var(--color-accent-orange)"; }
        
        // Hide phone completely on game end
        rikkPhoneDisplay.classList.add('hidden');
        rikkPhoneDisplay.classList.remove('active');
        
        clearSavedGameState();
        }
        
        function updateDayOfWeek() { const currentIndex = days.indexOf(dayOfWeek); dayOfWeek = days[(currentIndex + 1) % days.length];}
        function triggerWorldEvent() {
        if (activeWorldEvents.length > 0 && Math.random() < 0.7) return; activeWorldEvents=activeWorldEvents.filter(event=> event.turnsLeft > 0);
            if (typeof possibleWorldEvents !== 'undefined' && possibleWorldEvents.length > 0 && Math.random() < 0.25 && activeWorldEvents.length===0) { const
                eventTemplate=getRandomElement(possibleWorldEvents); activeWorldEvents.push({ event: eventTemplate, turnsLeft: eventTemplate.duration }); }
                updateEventTicker(); } function updateEventTicker() { if (activeWorldEvents.length> 0) { const currentEvent = activeWorldEvents[0];
                eventTicker.textContent = `Word on the street: ${currentEvent.event.name} (${currentEvent.turnsLeft} turns left)`; } else {
                eventTicker.textContent = `Word on the street: All quiet... for now. (${dayOfWeek})`; } }
                function advanceWorldEvents() { activeWorldEvents.forEach(eventState => { eventState.turnsLeft--; }); activeWorldEvents =
                activeWorldEvents.filter(eventState => eventState.turnsLeft > 0); }
                
                function nextFiend() {
                if (!gameActive) return; if (fiendsLeft <= 0) { endGame("completed"); return; } updateDayOfWeek(); advanceWorldEvents(); triggerWorldEvent();
                    let heatReduction=1 + playerSkills.lowProfile; activeWorldEvents.forEach(eventState=> { if (eventState.event.effects &&
                    eventState.event.effects.heatReductionModifier) { heatReduction *= eventState.event.effects.heatReductionModifier; } });
                    heat = Math.max(0, heat - Math.round(heatReduction));
                    updateHUD(); clearChat(); clearChoices(); nextCustomerBtn.disabled = true;
                    
                    // Phone goes from ambient to chat mode when a customer interaction starts
                    rikkPhoneDisplay.classList.remove('active');
                    setTimeout(() => {
                    rikkPhoneDisplay.classList.add('hidden'); // Fully hide phone briefly for knock transition
                    // Start knock animation
                    playSound(doorKnockSound); knockEffect.textContent = `*${dayOfWeek} hustle... someone's knockin'.*`; knockEffect.classList.remove('hidden');
                    knockEffect.style.animation = 'none'; void knockEffect.offsetWidth; knockEffect.style.animation = 'knockAnim 0.5s ease-out forwards';
                    setTimeout(() => {
                    knockEffect.classList.add('hidden');
                    rikkPhoneDisplay.classList.remove('hidden'); // Show phone again
                    setTimeout(() => rikkPhoneDisplay.classList.add('active'), 50); // Animate phone in
                    startCustomerInteraction();
                    }, KNOCK_ANIMATION_DURATION);
                    }, PHONE_ANIMATION_DURATION); // Wait for phone to slide out before knock
                    saveGameState();
                    }
                    
                    function calculateItemEffectiveValue(item, purchaseContext = true, customerData = null) {
                    let customerArchetype = null;
                    if (customerData && customerData.archetypeKey && typeof customerArchetypes !== 'undefined') {
                    customerArchetype = customerArchetypes[customerData.archetypeKey];
                    }
                    
                    let baseValue = purchaseContext ? item.purchasePrice : item.estimatedResaleValue;
                    if (!item || !item.itemTypeObj || typeof item.qualityIndex === 'undefined') { console.error("Invalid item structure for value calculation:",
                    item); return baseValue; }
                    
                    let qualityModifier = 1.0;
                    if (typeof ITEM_QUALITY_MODIFIERS !== 'undefined' && ITEM_QUALITY_MODIFIERS[item.itemTypeObj.type]) {
                    qualityModifier = ITEM_QUALITY_MODIFIERS[item.itemTypeObj.type][item.qualityIndex] || 1.0;
                    }
                    
                    let effectiveValue = baseValue * qualityModifier;
                    if (!purchaseContext && playerSkills.appraiser > 0) { effectiveValue *= (1 + playerSkills.appraiser * 0.05); }
                    if (purchaseContext && playerSkills.appraiser > 0) { effectiveValue *= (1 - playerSkills.appraiser * 0.03); }
                    activeWorldEvents.forEach(eventState => { const effects = eventState.event.effects; if (effects.allPriceModifier) effectiveValue *=
                    effects.allPriceModifier; if (item.itemTypeObj.type === "DRUG" && effects.drugPriceModifier) effectiveValue *= effects.drugPriceModifier;});
                    if (customerArchetype && !purchaseContext) { effectiveValue *= customerArchetype.priceToleranceFactor; }
                    return Math.max(5, Math.round(effectiveValue));
                    }
                    
                    function generateRandomItem(archetypeData = null) {
                    if (typeof itemTypes === 'undefined' || itemTypes.length === 0) {
                    console.error("itemTypes data is not loaded or empty!");
                    return { id: "error_item", name: "Error Item", itemTypeObj: { type: "ERROR", heat: 0, description:"Data missing"}, quality: "Unknown",
                    qualityIndex: 0, purchasePrice: 1, estimatedResaleValue: 1, fullDescription: "Data load error." };
                    }
                    
                    let availableItemTypes = [...itemTypes];
                    if (archetypeData && archetypeData.itemPool && archetypeData.itemPool.length > 0) {
                    availableItemTypes = itemTypes.filter(it => archetypeData.itemPool.includes(it.id));
                    } else if (archetypeData && archetypeData.key === "DESPERATE_FIEND") {
                    availableItemTypes = itemTypes.filter(it => it.baseValue < 80 || (it.type==="DRUG" && it.subType !=="PSYCHEDELIC" && it.subType
                        !=="METHAMPHETAMINE" )); } if (availableItemTypes.length===0) availableItemTypes=[...itemTypes]; const
                        selectedType=getRandomElement(availableItemTypes); // Use getRandomElement const qualityLevelsForType=(typeof ITEM_QUALITY_LEVELS
                        !=='undefined' && ITEM_QUALITY_LEVELS[selectedType.type]) ? ITEM_QUALITY_LEVELS[selectedType.type] : ["Standard"]; const
                        qualityIndex=Math.floor(Math.random() * qualityLevelsForType.length); const quality=qualityLevelsForType[qualityIndex]; let
                        basePurchaseValue=selectedType.baseValue + Math.floor(Math.random() * (selectedType.range * 2)) - selectedType.range; const item={ id:
                        selectedType.id, name: selectedType.name, itemTypeObj: selectedType, quality: quality, qualityIndex: qualityIndex, description:
                        selectedType.description, uses: selectedType.uses || null, effect: selectedType.effect || null, };
                        item.fullDescription=`${selectedType.description} This batch is looking ${quality.toLowerCase()}.`; let qualityPriceModifier=1.0; if
                        (typeof ITEM_QUALITY_MODIFIERS !=='undefined' && ITEM_QUALITY_MODIFIERS[selectedType.type]) {
                        qualityPriceModifier=ITEM_QUALITY_MODIFIERS[selectedType.type]?.[qualityIndex] || 1.0; } item.purchasePrice=Math.max(5,
                        Math.round(basePurchaseValue * (0.3 + Math.random() * 0.25) * qualityPriceModifier));
                        item.estimatedResaleValue=Math.max(item.purchasePrice + 5, Math.round(basePurchaseValue * (0.7 + Math.random() * 0.35) *
                        qualityPriceModifier)); return item; } function selectOrGenerateCustomerFromPool() { if (typeof customerArchetypes==='undefined' ||
                        Object.keys(customerArchetypes).length===0) { console.error("customerArchetypes data is not loaded or empty!"); return { id:
                        `customer_error_${nextCustomerId++}`, name: "Error Customer" , archetypeKey: "ERROR_ARCHETYPE" , loyaltyToRikk: 0, mood: "neutral" ,
                        cashOnHand: 50, preferredDrugSubTypes: [], addictionLevel: {}, hasMetRikkBefore: false, lastInteractionWithRikk: null, patience: 3 }; }
                        if (customersPool.length> 0 && Math.random() < 0.35) { const returningCustomer=getRandomElement(customersPool);
                            returningCustomer.hasMetRikkBefore=true; const archetype=customerArchetypes[returningCustomer.archetypeKey]; if (archetype) {
                            returningCustomer.cashOnHand=Math.floor(Math.random() * (archetype.priceToleranceFactor * 90)) + 25; const moodRoll=Math.random();
                            if (moodRoll < 0.15) returningCustomer.mood="happy" ; else if (moodRoll < 0.30) returningCustomer.mood="paranoid" ; else if
                            (moodRoll < 0.45) returningCustomer.mood="angry" ; else if (archetype.initialMood && moodRoll < 0.7)
                            returningCustomer.mood=archetype.initialMood; else { // More variety in default mood for returning customers const
                            possibleMoods=["neutral", "chill" , "desperate" , "cautious" , "nosy" , "arrogant" ];
                            returningCustomer.mood=getRandomElement(possibleMoods.filter(m=> m !== returningCustomer.mood)); // try not to pick same mood
                            if (!returningCustomer.mood) returningCustomer.mood = "neutral"; // fallback
                            }
                            } else {
                            returningCustomer.cashOnHand = Math.floor(Math.random() * 80) + 20;
                            returningCustomer.mood = "neutral";
                            }
                            console.log("Returning customer:", returningCustomer.name, "New Mood:", returningCustomer.mood);
                            return returningCustomer;
                            }
                            
                            const archetypeKeys = Object.keys(customerArchetypes);
                            const selectedArchetypeKey = getRandomElement(archetypeKeys);
                            const archetypeData = customerArchetypes[selectedArchetypeKey];
                            let customerName = archetypeData.baseName;
                            if (!customerName.includes(nextCustomerId.toString())) {
                            customerName += ` #${nextCustomerId}`;
                            }
                            
                            const newCustomer = {
                            id: `customer_${nextCustomerId++}`,
                            name: customerName,
                            archetypeKey: selectedArchetypeKey,
                            loyaltyToRikk: Math.floor(Math.random() * 3) -1,
                            mood: archetypeData.initialMood || "neutral",
                            cashOnHand: Math.floor(Math.random() * (archetypeData.priceToleranceFactor * 100)) + 30,
                            preferredDrugSubTypes: [...(archetypeData.preferredDrugSubTypes || [])],
                            addictionLevel: {},
                            hasMetRikkBefore: false,
                            lastInteractionWithRikk: null,
                            patience: 3 + Math.floor(Math.random()*3),
                            };
                            
                            if (customersPool.length < MAX_CUSTOMERS_IN_POOL) { customersPool.push(newCustomer); } else { customersPool[Math.floor(Math.random()
                                * MAX_CUSTOMERS_IN_POOL)]=newCustomer; } console.log("New customer generated:", newCustomer.name, "Archetype:" ,
                                newCustomer.archetypeKey, "Initial Mood:" , newCustomer.mood); return newCustomer; } function generateCustomerInteractionData()
                                { const customerData=selectOrGenerateCustomerFromPool(); if (typeof customerArchetypes==='undefined' ||
                                !customerArchetypes[customerData.archetypeKey]) { console.error("customerArchetypes not loaded or archetypeKey invalid:",
                                customerData.archetypeKey); currentCustomer={ data: customerData, name: customerData.name || "Error Customer" , dialogue: [{
                                speaker: "narration" , text: "Error: Customer type undefined." }], choices: [{ text: "OK" , outcome: { type: "acknowledge_error"
                                } }], itemContext: null, archetypeKey: "ERROR_ARCHETYPE" , mood: "neutral" }; return; } const
                                archetype=customerArchetypes[customerData.archetypeKey]; let dialogue=[]; let choices=[]; let itemContext=null; let
                                greetingText=archetype.greeting(customerData, null); dialogue.push({ speaker: "customer" , text: greetingText }); const
                                rikkOpeners=[ "Aight, I hear ya. What's the word on the street?" , "Yo. Lay it on me. Business or bullshit?"
                                , "Speak to Rikk. You buyin', sellin', or just window shoppin'?" , "Alright, alright, take a chill pill. What's poppin'?"
                                , "Heard. Don't waste my time. What you got for Rikk, or what you want from him?" ]; if (customerData.mood==="paranoid" ) {
                                dialogue.push({ speaker: "rikk" , text: getRandomElement(["Easy there, chief. No one's listening but me and the damn city hum.
                                What's got you spooked?", "Whoa, slow down. You look like you seen a ghost. What's the haps?" ]) }); } else if
                                (customerData.mood==="angry" ) { dialogue.push({ speaker: "rikk" , text: getRandomElement(["Whoa, simmer down before you pop a
                                blood vessel. Bad vibes cost extra 'round here. What' s the
                                issue?", "Alright, tough guy. Spit it out. My patience ain't unlimited." ]) }); } else if (customerData.mood==="happy" ) {
                                dialogue.push({ speaker: "rikk" , text: getRandomElement(["Well, well, look who's grinnin' like a possum eatin' a sweet potato.
                                What's the good news?", "Someone's feelin' good today. Lay some of that sunshine on me. What can Rikk do for ya?" ]) }); } else
                                { dialogue.push({ speaker: "rikk" , text: getRandomElement(rikkOpeners) }); } let customerWillOfferItemToRikk=false; if
                                (archetype.sellsOnly) { customerWillOfferItemToRikk=true; } else { let baseChanceToOfferItem=0.35; if (inventory.length===0) {
                                baseChanceToOfferItem=0.80; } else if (inventory.length <=1) { baseChanceToOfferItem=0.65; } else if (inventory.length <=3) {
                                baseChanceToOfferItem=0.45; } else if (inventory.length>= MAX_INVENTORY_SLOTS - 1) { baseChanceToOfferItem = 0.05; }
                                
                                if (Math.random() < baseChanceToOfferItem) { customerWillOfferItemToRikk=true; } else if (customerData.cashOnHand < 20 &&
                                    Math.random() < 0.6) { customerWillOfferItemToRikk=true; } } if (customerWillOfferItemToRikk && inventory.length <
                                    MAX_INVENTORY_SLOTS) { itemContext=generateRandomItem(archetype); if (!archetype.sellsOnly && itemContext.qualityIndex> 1 &&
                                    Math.random() < 0.6) { itemContext.qualityIndex=Math.max(0, itemContext.qualityIndex - 1); const
                                        qualityLevelsForType=(typeof ITEM_QUALITY_LEVELS !=='undefined' && ITEM_QUALITY_LEVELS[itemContext.itemTypeObj.type]) ?
                                        ITEM_QUALITY_LEVELS[itemContext.itemTypeObj.type] : ["Standard"];
                                        itemContext.quality=qualityLevelsForType[itemContext.qualityIndex]; } const
                                        customerDemandsPrice=calculateItemEffectiveValue(itemContext, true, customerData); const
                                        itemNameForDialogue=itemContext.name.split("'")[1] || itemContext.name.split(" ")[1] || itemContext.name;

        let offerText = "";
        const genericOffers = [
            `Yo Rikk, peep this. Got a ${itemContext.quality} ${itemNameForDialogue}. How's $${customerDemandsPrice} sound? **Fell off a truck... a very fast, very invisible truck.**`,
            `Check it, Rikk. This ${itemContext.quality} ${itemNameForDialogue} is lookin' for a new home. $${customerDemandsPrice} and it's yours. **No questions asked, right? Unless the question is 'is it hot?' Then the answer is 'maybe a little warm'.**`,
            `Rikk, my man. Scored this ${itemContext.quality} ${itemNameForDialogue}. Figure you can move it. $${customerDemandsPrice}? **Let's make some magic happen, or at least some cash.**`
        ];
        const drugOffers = [
            `Got some ${itemContext.quality} ${itemNameForDialogue} here, Rikk. Fresh...ish. $${customerDemandsPrice} and it'll make someone's night. **Or make 'em question all their life choices. Either way, it's an experience.**`,
            `This ${itemContext.quality} ${itemNameForDialogue} is potent, Rikk. $${customerDemandsPrice}. **Handle with care, or don't. Not my problem after the cash swaps hands.**`
        ];
        const stolenGoodOffers = [
            `Found this ${itemContext.quality} ${itemNameForDialogue} just... lying around. Yeah. $${customerDemandsPrice}? **It's practically begging for a new owner. One with fewer morals, perhaps.**`,
            `This ${itemContext.quality} ${itemNameForDialogue}? Let's just say it's 'pre-liberated'. $${customerDemandsPrice} for you, Rikk. **Don't ask where I got the key, or why the previous owner was crying.**`
        ];

        if (itemContext.itemTypeObj.type === " DRUG") { offerText=getRandomElement(drugOffers); } else if (itemContext.itemTypeObj.type==="STOLEN_GOOD" ) {
                                        offerText=getRandomElement(stolenGoodOffers); } else { offerText=getRandomElement(genericOffers); } if
                                        (customerData.mood==="paranoid" ) offerText=`(Whispering) Rikk, this ${itemContext.quality} ${itemNameForDialogue}...
                                        it's clean, I think. Probably. $${customerDemandsPrice}? **But we gotta be quick, the walls are listening and the damn
                                        squirrels are taking notes!**`; else if (customerData.mood==="happy" ) offerText=`Rikk! Guess what I got! This sweet
                                        ${itemContext.quality} ${itemNameForDialogue}! $${customerDemandsPrice} and it's all yours, buddy! **Today's my lucky
                                        day, so it's your lucky day too! Unless it's cursed. Then it's mostly your lucky day.**`; else if
                                        (customerData.mood==="angry" ) offerText=`Alright, Rikk. Got this ${itemContext.quality} ${itemNameForDialogue}. Price
                                        is $${customerDemandsPrice}. **Take it or leave it, I ain't got all night to haggle with your cheap ass.**`;
                                        dialogue.push({ speaker: "customer" , text: offerText }); const rikkInspectLines=[ `Hmm, a ${itemContext.quality}
                                        ${itemNameForDialogue}, huh? For $${customerDemandsPrice}? **Street's been whisperin' about stuff like this. Or maybe
                                        that's just the tinnitus.** Let me take a look...`, `Alright, alright, show me what you got. $${customerDemandsPrice}
                                        for this ${itemNameForDialogue}? **Could be somethin', could be trash. Like most things in this city. Only one way to
                                        find out.**`, `This ${itemNameForDialogue} you're pushin'... $${customerDemandsPrice} is your number? **Smells like
                                        opportunity... or a setup. Let's see which way the wind blows.**` ]; dialogue.push({ speaker: "rikk" , text:
                                        getRandomElement(rikkInspectLines) }); if (cash>= customerDemandsPrice) {
                                        choices.push({ text: `Cop it ($${customerDemandsPrice})`, outcome: { type: "buy_from_customer", item: itemContext,
                                        price: customerDemandsPrice } });
                                        } else {
                                        let rikkNoCashText = "(Damn, stash is low for that.)";
                                        if (archetype.dialogueVariations?.lowCashRikk) {
                                        const moodReaction = archetype.dialogueVariations.lowCashRikk(customerData.mood);
                                        rikkNoCashText = Array.isArray(moodReaction) ? getRandomElement(moodReaction) : moodReaction;
                                        }
                                        dialogue.push({ speaker: "rikk", text: `(To self: ${rikkNoCashText}) Customer hears: "Yo, $${customerDemandsPrice} is a
                                        bit steep for my pockets right now, G. Wallet's lookin' anorexic."` });
                                        choices.push({ text: `Cop it (Need $${customerDemandsPrice - cash} more)`, outcome: { type: "buy_from_customer", item:
                                        itemContext, price: customerDemandsPrice }, disabled: true });
                                        }
                                        choices.push({ text: "Nah, pass on that.", outcome: { type: "decline_offer_to_buy", item: itemContext } });
                                        
                                        } else if (inventory.length > 0) {
                                        let potentialItemsToSell = inventory.filter(invItem => archetype.buyPreference ? archetype.buyPreference(invItem) :
                                        true);
                                        if (customerData.preferredDrugSubTypes && customerData.preferredDrugSubTypes.length > 0 && Math.random() < 0.7) { const
                                            preferredItems=potentialItemsToSell.filter(invItem=>
                                            invItem.itemTypeObj.type === "DRUG" && customerData.preferredDrugSubTypes.includes(invItem.itemTypeObj.subType)
                                            );
                                            if (preferredItems.length > 0) potentialItemsToSell = preferredItems;
                                            }
                                            if (potentialItemsToSell.length === 0) potentialItemsToSell = inventory;
                                            
                                            itemContext = getRandomElement(potentialItemsToSell);
                                            const itemNameForDialogue = itemContext.name.split("'")[1] || itemContext.name.split(" ")[1] || itemContext.name;
                                            
                                            // Check if the second to last message was the customer's greeting.
                                            // dialogue.length-2 because Rikk's opener was just pushed.
                                            const firstDialogueText = dialogue.length >= 2 ? dialogue[dialogue.length-2].text.toLowerCase() : "";
                                            const needsGreetingUpdate = (
                                            (archetype.key === "DESPERATE_FIEND" && (firstDialogueText.includes('fix') || firstDialogueText.includes('quiet the
                                            demons'))) ||
                                            (archetype.key === "HIGH_ROLLER" && (firstDialogueText.includes('product') || firstDialogueText.includes('exquisite
                                            diversions'))) ||
                                            (archetype.key === "REGULAR_JOE" && (firstDialogueText.includes('something decent') ||
                                            firstDialogueText.includes('unwind with'))) ||
                                            (archetype.key === "SNITCH" && (firstDialogueText.includes('noteworthy') || firstDialogueText.includes('exciting')))
                                            );
                                            
                                            if (dialogue.length >= 2 && needsGreetingUpdate && dialogue[0].speaker === "customer") { // Ensure we're updating
                                            the *customer's* initial greeting
                                            dialogue[0].text = archetype.greeting(customerData, itemContext);
                                            }
                                            
                                            const rikkBaseSellPrice = calculateItemEffectiveValue(itemContext, false, null);
                                            let customerOfferPrice = Math.round(rikkBaseSellPrice * archetype.priceToleranceFactor);
                                            customerOfferPrice = Math.max(itemContext.purchasePrice + Math.max(5, Math.round(itemContext.purchasePrice * 0.10)),
                                            customerOfferPrice); // Slightly lower min profit
                                            customerOfferPrice = Math.min(customerOfferPrice, customerData.cashOnHand);
                                            
                                            let askText = "";
                                            const genericAsks = [
                                            `So, Rikk, that ${itemContext.quality} ${itemNameForDialogue}... what's the word? I got $${customerOfferPrice}
                                            burnin' a hole. **And my patience ain't far behind.**`,
                                            `Heard you got the good ${itemContext.quality} ${itemNameForDialogue}. I can do $${customerOfferPrice}. We cool?
                                            **Or do I gotta find another connoisseur of fine... *things*?**`,
                                            `Alright Rikk, let's talk about that ${itemNameForDialogue}. My offer is $${customerOfferPrice}. Make it happen.
                                            **Time's a-wastin', and so is my good mood.**`
                                            ];
                                            if (customerData.mood === "paranoid") askText = `(Nervously) You got that ${itemContext.quality}
                                            ${itemNameForDialogue}, right? $${customerOfferPrice}. **Just... no surprises, okay? My heart's already doing a drum
                                            solo.**`;
                                            else if (customerData.mood === "happy") askText = `Rikk, my man! That ${itemContext.quality} ${itemNameForDialogue}
                                            is callin' my name! How's $${customerOfferPrice} for a slice of heaven? **Let's make today legendary! Or at least,
                                            less sucky.**`;
                                            else if (customerData.mood === "angry") askText = `That ${itemContext.quality} ${itemNameForDialogue}.
                                            $${customerOfferPrice}. **Yes or no, Rikk. I ain't got time for your sales pitch.**`;
                                            else askText = getRandomElement(genericAsks);
                                            
                                            dialogue.push({ speaker: "customer", text: askText });
                                            
                                            const rikkSellResponses = [
                                            `This fire ${itemContext.quality} ${itemNameForDialogue}? Yeah, I got that. Street says it's worth
                                            $${rikkBaseSellPrice}. You're comin' in at $${customerOfferPrice}. **We talkin' business or you just lonely?**`,
                                            `Ah, the infamous ${itemContext.quality} ${itemNameForDialogue}. Good taste... or bad habits. My price is
                                            $${rikkBaseSellPrice}, your offer $${customerOfferPrice}. **Let's see if we can bridge that gap, or if you're just
                                            gonna waste my damn time.**`,
                                            `So you want this ${itemContext.quality} ${itemNameForDialogue}, huh? Costs $${rikkBaseSellPrice} for the privilege.
                                            You got $${customerOfferPrice}. **Tempting... like a free donut next to a cop car.**`
                                            ];
                                            dialogue.push({ speaker: "rikk", text: getRandomElement(rikkSellResponses) });
                                            
                                            if (customerData.cashOnHand >= customerOfferPrice) {
                                            choices.push({ text: `Serve 'em ($${customerOfferPrice})`, outcome: { type: "sell_to_customer", item: itemContext,
                                            price: customerOfferPrice } });
                                            } else {
                                            dialogue.push({speaker: "rikk", text: `(To self: They ain't got the dough for this heat.) Yo, you're short
                                            $${customerOfferPrice - customerData.cashOnHand}, fam. **Math ain't your strong suit, huh?**`});
                                            choices.push({ text: `Serve 'em ($${customerOfferPrice}) (Short!)`, outcome: { type: "sell_to_customer", item:
                                            itemContext, price: customerOfferPrice }, disabled: true });
                                            }
                                            
                                            if (!archetype.negotiationResists && rikkBaseSellPrice > customerOfferPrice + 5 && customerData.cashOnHand >=
                                            Math.round((rikkBaseSellPrice + customerOfferPrice) / 2.1)) {
                                            const hagglePrice = Math.min(customerData.cashOnHand, Math.max(customerOfferPrice + 5, Math.round((rikkBaseSellPrice
                                            * 0.85 + customerOfferPrice * 0.15)) ));
                                            choices.push({ text: `Haggle (Aim $${hagglePrice})`, outcome: { type: "negotiate_sell", item: itemContext,
                                            proposedPrice: hagglePrice, originalOffer: customerOfferPrice } });
                                            }
                                            choices.push({ text: "Nah, kick rocks.", outcome: { type: "decline_offer_to_sell", item: itemContext } });
                                            
                                            } else {
                                            let emptyStashTextRikk = "";
                                            const rikkEmptyStashLines = [
                                            "Stash is drier than a popcorn fart, G. Nothin' to move right now.",
                                            "Shelves are bare, my friend. All out. Come back when the gettin's good, or when I magically shit out some
                                            product.",
                                            "Tapped out, fam. Fresh out. Zilch. Nada. Come back later, unless you got something FOR me."
                                            ];
                                            emptyStashTextRikk = getRandomElement(rikkEmptyStashLines);
                                            
                                            if (customerData.mood === "angry") emptyStashTextRikk = "What, you blind? I got NOTHIN'! Beat it before I lose my
                                            cool!";
                                            else if (customerData.mood === "paranoid") emptyStashTextRikk = "Uh, nothing here, man. All gone. You sure you got
                                            the right Rikk? **Maybe you're a cop. You look like a cop.**";
                                            else if (customerData.mood === "happy") emptyStashTextRikk = "Damn, G, wish I could help your good mood, but the
                                            well's dry. Maybe later, yeah?";
                                            
                                            if (dialogue.length > 0 && dialogue[dialogue.length -1].speaker === "customer") { // Should be Rikk's opener here
                                            dialogue.push({ speaker: "rikk", text: emptyStashTextRikk });
                                            } else if (dialogue.length > 0 && dialogue[dialogue.length -1].speaker === "rikk") {
                                            dialogue[dialogue.length -1].text = emptyStashTextRikk;
                                            } else { // Fallback, though Rikk's opener should be there.
                                            dialogue.push({ speaker: "rikk", text: emptyStashTextRikk });
                                            }
                                            choices.push({ text: "Aight, my bad. Later.", outcome: { type: "acknowledge_empty_stash" } });
                                            }
                                            
                                            currentCustomer = {
                                            data: customerData,
                                            name: customerData.name,
                                            dialogue,
                                            choices,
                                            itemContext,
                                            archetypeKey: customerData.archetypeKey,
                                            mood: customerData.mood
                                            };
                                            }
                                            
                                            function startCustomerInteraction() {
                                            // Hide ambient UI, show chat UI
                                            androidAmbientUI.classList.remove('active-mode');
                                            androidAmbientUI.classList.add('inactive-mode');
                                            gameChatUI.classList.remove('inactive-mode');
                                            gameChatUI.classList.add('active-mode');
                                            phoneDock.classList.add('hidden'); // Hide dock during chat
                                            phoneHomeIndicator.classList.add('hidden'); // Hide home indicator during chat
                                            
                                            generateCustomerInteractionData();
                                            if (phoneTitleElement && currentCustomer && currentCustomer.name) {
                                            phoneTitleElement.textContent = currentCustomer.name;
                                            } else if (phoneTitleElement) {
                                            phoneTitleElement.textContent = 'Street Talk';
                                            }
                                            let dialogueIndex = 0;
                                            
                                            // rikkPhoneDisplay.classList.remove('hidden'); // This is now handled by nextFiend
                                            // setTimeout(() => rikkPhoneDisplay.classList.add('active'), 50); // This is now handled by nextFiend
                                            clearChat();
                                            
                                            const displayNext = () => {
                                            if (currentCustomer && dialogueIndex < currentCustomer.dialogue.length) { const
                                                msg=currentCustomer.dialogue[dialogueIndex]; displayPhoneMessage(msg.text, msg.speaker); dialogueIndex++;
                                                setTimeout(displayNext, CUSTOMER_WAIT_TIME * (msg.text.length> 70 ? 1.4 : 1) * (msg.speaker === 'rikk' ? 0.8 :
                                                1)); // Rikk's lines a bit faster
                                                } else if (currentCustomer) {
                                                displayChoices(currentCustomer.choices);
                                                } else {
                                                console.error("startCustomerInteraction: currentCustomer became null during dialogue display.");
                                                endCustomerInteraction();
                                                }
                                                };
                                                displayNext();
                                                }
                                                
                                                function displayPhoneMessage(message, speaker) {
                                                if (typeof message === 'undefined' || message === null) {
                                                console.warn(`Attempted to display undefined/null message for speaker: ${speaker}`);
                                                message = (speaker === 'rikk') ? "(Rikk mumbles something incoherent...)" : "(They trail off awkwardly...)";
                                                }
                                                playSound(chatBubbleSound); const bubble = document.createElement('div'); bubble.classList.add('chat-bubble',
                                                speaker); if (speaker === 'customer' || speaker === 'rikk') { const speakerName =
                                                document.createElement('span'); speakerName.classList.add('speaker-name'); speakerName.textContent = (speaker
                                                === 'customer' && currentCustomer ? currentCustomer.name : 'Rikk'); bubble.appendChild(speakerName); } const
                                                textNode = document.createTextNode(message); bubble.appendChild(textNode); chatContainer.appendChild(bubble);
                                                chatContainer.scrollTop = chatContainer.scrollHeight;
                                                }
                                                function displaySystemMessage(message) { displayPhoneMessage(message, 'narration');
                                                phoneShowNotification(message, "System Alert"); } // Use phone notification as well
                                                function displayChoices(choices) { choicesArea.innerHTML = ''; choices.forEach(choice => { const button =
                                                document.createElement('button'); button.classList.add('choice-button'); button.textContent = choice.text; if
                                                (choice.outcome.type.startsWith('decline') || choice.outcome.type.includes('kick_rocks'))
                                                button.classList.add('decline'); button.disabled = choice.disabled || false; if (!choice.disabled) {
                                                button.addEventListener('click', () => handleChoice(choice.outcome)); } choicesArea.appendChild(button); }); }
                                                
                                                function handleChoice(outcome) {
                                                clearChoices();
                                                let narrationText = "";
                                                let selectedCustomerReaction = "";
                                                let heatChange = 0;
                                                let credChange = 0;
                                                
                                                if (!currentCustomer || !currentCustomer.archetypeKey || !currentCustomer.data || typeof customerArchetypes ===
                                                'undefined' || !customerArchetypes[currentCustomer.archetypeKey]) {
                                                console.error("Critical Error: currentCustomer, archetypeKey, data, or customerArchetypes undefined.",
                                                currentCustomer);
                                                displaySystemMessage("System Error: Customer data missing or type undefined. Ending interaction.");
                                                setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME);
                                                return;
                                                }
                                                const archetype = customerArchetypes[currentCustomer.archetypeKey];
                                                const customerState = currentCustomer.data;
                                                let dealSuccess = false;
                                                
                                                const getReaction = (variationFn, mood, fallback) => {
                                                if (variationFn) {
                                                const reactionOutput = variationFn(mood);
                                                if (Array.isArray(reactionOutput)) return getRandomElement(reactionOutput);
                                                return reactionOutput || fallback; // Ensure it returns fallback if output is empty string
                                                }
                                                return fallback;
                                                };
                                                
                                                switch (outcome.type) {
                                                case "buy_from_customer":
                                                if (cash >= outcome.price && inventory.length < MAX_INVENTORY_SLOTS) { cash -=outcome.price;
                                                    inventory.push({...outcome.item}); heatChange=outcome.item.itemTypeObj.heat + (archetype.heatImpact || 0);
                                                    credChange=archetype.credImpactBuy || 0; customerState.mood="happy" ; customerState.loyaltyToRikk +=1;
                                                    dealSuccess=true; narrationText=`Rikk copped "${outcome.item.name} (${outcome.item.quality})" for
                                                    $${outcome.price}. Not bad.`;
                                                    selectedCustomerReaction=getReaction(archetype.dialogueVariations?.rikkBuysSuccess,
                                                    customerState.mood, "Pleasure doin' business, Rikk!" ); playSound(cashSound); if
                                                    (outcome.item.effect==="reduce_heat_small" ) { heat=Math.max(0, heat - 10); narrationText
                                                    +=" That intel should cool things down a bit." ; } customerState.lastInteractionWithRikk={
                                                    type: "rikk_bought" , item: outcome.item.name, outcome: "success" }; } else if (inventory.length>=
                                                    MAX_INVENTORY_SLOTS) {
                                                    narrationText = `Rikk's stash is packed tighter than a clown car. No room for that ${outcome.item.name}.`;
                                                    selectedCustomerReaction = getReaction(archetype.dialogueVariations?.rikkDeclinesToBuy, customerState.mood,
                                                    "Seriously, Rikk? Full up? Lame.");
                                                    playSound(deniedSound); customerState.mood = "annoyed"; customerState.loyaltyToRikk -=1;
                                                    customerState.lastInteractionWithRikk = { type: "rikk_declined_buy", reason: "stash_full" };
                                                    } else {
                                                    narrationText = `Rikk's pockets are feelin' light. Can't swing $${outcome.price} for the
                                                    ${outcome.item.name}.`;
                                                    selectedCustomerReaction = getReaction(archetype.dialogueVariations?.rikkCannotAfford, customerState.mood,
                                                    "Broke, Rikk? Times are tough, huh?");
                                                    playSound(deniedSound); customerState.mood = "disappointed";
                                                    customerState.lastInteractionWithRikk = { type: "rikk_declined_buy", reason: "no_cash" };
                                                    }
                                                    break;
                                                    
                                                    case "sell_to_customer":
                                                    const itemIndex = inventory.findIndex(i => i.id === outcome.item.id && i.quality === outcome.item.quality &&
                                                    i.purchasePrice === outcome.item.purchasePrice);
                                                    if (itemIndex !== -1) {
                                                    const itemSold = inventory.splice(itemIndex, 1)[0]; cash += outcome.price;
                                                    heatChange = itemSold.itemTypeObj.heat + (archetype.heatImpact || 0);
                                                    credChange = archetype.credImpactSell || 0;
                                                    customerState.mood = "happy"; customerState.loyaltyToRikk += 2; dealSuccess = true;
                                                    if (itemSold.itemTypeObj.type === "DRUG" && itemSold.itemTypeObj.addictionChance > 0) {
                                                    const subType = itemSold.itemTypeObj.subType;
                                                    customerState.addictionLevel[subType] = (customerState.addictionLevel[subType] || 0) +
                                                    itemSold.itemTypeObj.addictionChance;
                                                    if (customerState.addictionLevel[subType] > 0.5 && !customerState.preferredDrugSubTypes.includes(subType)) {
                                                    customerState.preferredDrugSubTypes.push(subType);
                                                    }
                                                    }
                                                    narrationText = `Cha-ching! Rikk flipped "${itemSold.name} (${itemSold.quality})" for a cool
                                                    $${outcome.price}.`;
                                                    selectedCustomerReaction = getReaction(archetype.dialogueVariations?.rikkSellsSuccess, customerState.mood,
                                                    "My man Rikk! Good lookin' out!");
                                                    playSound(cashSound);
                                                    customerState.lastInteractionWithRikk = { type: "rikk_sold", item: itemSold.name, outcome: "success" };
                                                    } else {
                                                    narrationText = `WTF Rikk? Can't find that "${outcome.item.name}"! Did you smoke it all already?`;
                                                    selectedCustomerReaction = `Yo, Rikk, you playin' me or what? That ain't in your stash! You tryin' to ghost
                                                    me on the goods?`;
                                                    heatChange = 3; playSound(deniedSound); customerState.mood = "angry";
                                                    customerState.lastInteractionWithRikk = { type: "rikk_sell_fail", reason: "item_not_found" };
                                                    }
                                                    break;
                                                    
                                                    case "negotiate_sell":
                                                    const negotiateArchetype = archetype;
                                                    const rikkHaggleLines = [
                                                    `Hold up, $${outcome.originalOffer}? Nah, G. My stuff ain't free samples. I need at least
                                                    $${outcome.proposedPrice}.`,
                                                    `Easy there, big spender. $${outcome.originalOffer} is lowballin' it. $${outcome.proposedPrice} is where we
                                                    start talkin' real business.`,
                                                    `For this primo shit? $${outcome.originalOffer} is a joke, fam. Make it $${outcome.proposedPrice} or take a
                                                    hike.`
                                                    ];
                                                    displayPhoneMessage(`Rikk: "${getRandomElement(rikkHaggleLines)}"`, 'rikk');
                                                    
                                                    setTimeout(() => {
                                                    let successChance = 0.55 + (playerSkills.negotiator * 0.12); // Slightly better base chance
                                                    if (negotiateArchetype.priceToleranceFactor < 0.85) successChance -=0.20; if
                                                        (negotiateArchetype.priceToleranceFactor> 1.15) successChance += 0.15;
                                                        if (customerState.mood === "angry") successChance -= 0.25;
                                                        if (customerState.mood === "happy") successChance += 0.10;
                                                        
                                                        
                                                        let negHeat = 0; let negCred = 0;
                                                        if (Math.random() < successChance) { const finalPrice=outcome.proposedPrice; const
                                                            itemToSellIndex=inventory.findIndex(i=> i.id === outcome.item.id && i.quality ===
                                                            outcome.item.quality && i.purchasePrice === outcome.item.purchasePrice);
                                                            if (itemToSellIndex !== -1) {
                                                            const itemSold = inventory.splice(itemToSellIndex, 1)[0]; cash += finalPrice;
                                                            negHeat = itemSold.itemTypeObj.heat + (negotiateArchetype.heatImpact || 0) + 1;
                                                            negCred = (negotiateArchetype.credImpactSell || 0) + 1;
                                                            customerState.mood = "impressed"; customerState.loyaltyToRikk +=1; dealSuccess = true;
                                                            if (itemSold.itemTypeObj.type === "DRUG" && itemSold.itemTypeObj.addictionChance > 0) { /* ...
                                                            addiction ... */ }
                                                            displayPhoneMessage(`Rikk's smooth talk worked! Sold "${itemSold.name}" for a sweet
                                                            $${finalPrice}.`, 'narration');
                                                            selectedCustomerReaction = getReaction(negotiateArchetype.dialogueVariations?.negotiationSuccess,
                                                            customerState.mood, "Aight, Rikk, you got me. Deal.");
                                                            displayPhoneMessage(`"${currentCustomer.name}: ${selectedCustomerReaction}"`, 'customer');
                                                            playSound(cashSound);
                                                            customerState.lastInteractionWithRikk = { type: "rikk_sold_negotiated", item: itemSold.name,
                                                            outcome: "success" };
                                                            }
                                                            } else {
                                                            negHeat = 1; negCred = -1;
                                                            customerState.mood = "angry"; customerState.loyaltyToRikk -=2;
                                                            let negFailText = `They ain't budging.
                                                            "${getReaction(negotiateArchetype.dialogueVariations?.negotiationFail, customerState.mood, `Nah,
                                                            man, $${outcome.originalOffer} is my final. Take it or leave it.`)}" they spit.`;
                                                            displayPhoneMessage(negFailText, 'narration');
                                                            choicesArea.innerHTML = '';
                                                            const acceptOriginalBtn = document.createElement('button'); acceptOriginalBtn.textContent = `Aight,
                                                            fine. ($${outcome.originalOffer})`; acceptOriginalBtn.classList.add('choice-button');
                                                            acceptOriginalBtn.addEventListener('click', () => handleChoice({ type: "sell_to_customer", item:
                                                            outcome.item, price: outcome.originalOffer })); choicesArea.appendChild(acceptOriginalBtn);
                                                            const declineFullyBtn = document.createElement('button'); declineFullyBtn.textContent = `Nah, deal's
                                                            dead.`; declineFullyBtn.classList.add('choice-button', 'decline');
                                                            declineFullyBtn.addEventListener('click', () => handleChoice({ type: "decline_offer_to_sell", item:
                                                            outcome.item })); choicesArea.appendChild(declineFullyBtn);
                                                            customerState.lastInteractionWithRikk = { type: "rikk_negotiation_failed" };
                                                            return;
                                                            }
                                                            heat += negHeat; streetCred += negCred;
                                                            fiendsLeft--;
                                                            updateHUD(); updateInventoryDisplay();
                                                            setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
                                                            }, 1500);
                                                            return;
                                                            
                                                            case "decline_offer_to_buy":
                                                            narrationText = `Rikk ain't interested in their junk. Told 'em to bounce with that
                                                            "${outcome.item.name}".`;
                                                            selectedCustomerReaction = getReaction(archetype.dialogueVariations?.rikkDeclinesToBuy,
                                                            customerState.mood, "Damn, Rikk! My stuff ain't good enough for ya?");
                                                            credChange = -1;
                                                            customerState.mood = "annoyed"; customerState.loyaltyToRikk -=1;
                                                            playSound(deniedSound);
                                                            customerState.lastInteractionWithRikk = { type: "rikk_declined_buy", item: outcome.item.name };
                                                            break;
                                                            
                                                            case "decline_offer_to_sell":
                                                            narrationText = `That chump change for "${outcome.item.name}"? Rikk told 'em to kick rocks and find
                                                            a new dealer.`;
                                                            selectedCustomerReaction = getReaction(archetype.dialogueVariations?.rikkDeclinesToSell,
                                                            customerState.mood, "Cheap ass motherfucker...");
                                                            heatChange = 1;
                                                            credChange = archetype.key === "DESPERATE_FIEND" ? -2 : (archetype.key === "HIGH_ROLLER" ? 1 : 0);
                                                            customerState.mood = "angry"; customerState.loyaltyToRikk -=2;
                                                            playSound(deniedSound);
                                                            customerState.lastInteractionWithRikk = { type: "rikk_declined_sell", item: outcome.item.name };
                                                            break;
                                                            
                                                            case "acknowledge_empty_stash":
                                                            narrationText = "Rikk's stash is dry. Can't sell what you ain't got. Customer ain't happy.";
                                                            selectedCustomerReaction = getRandomElement([
                                                            `${currentCustomer.name}: Damn, Rikk. Dry spell, huh? Hit me up when you re-up, you know I'm good
                                                            for it.`,
                                                            `${currentCustomer.name}: No product? Lame. Alright, catch you later then, don't be a stranger when
                                                            the goods are in.`,
                                                            `${currentCustomer.name}: Seriously? Nothin'? Aight, guess I'll try my luck elsewhere. Don't make me
                                                            beg, Rikk.`
                                                            ]);
                                                            credChange = -1;
                                                            customerState.mood = "disappointed";
                                                            playSound(deniedSound);
                                                            customerState.lastInteractionWithRikk = { type: "rikk_empty_stash" };
                                                            break;
                                                            case "acknowledge_error":
                                                            narrationText = "System error acknowledged by Rikk. What a mess.";
                                                            break;
                                                            default:
                                                            console.error("Unhandled outcome type in handleChoice:", outcome.type);
                                                            narrationText = "System: Rikk's brain just short-circuited. Action not recognized.";
                                                            break;
                                                            }
                                                            
                                                            heat = Math.min(MAX_HEAT, Math.max(0, heat + heatChange));
                                                            streetCred = Math.max(-100, streetCred + credChange); // Prevent cred from going too low, or adjust
                                                            as needed
                                                            customerState.hasMetRikkBefore = true;
                                                            
                                                            if (outcome.type !== "negotiate_sell") { // negotiate_sell handles its own fiendsLeft--
                                                            fiendsLeft--;
                                                            }
                                                            
                                                            updateHUD();
                                                            updateInventoryDisplay();
                                                            
                                                            if (archetype && archetype.postDealEffect) {
                                                            archetype.postDealEffect(dealSuccess, customerState);
                                                            }
                                                            
                                                            activeWorldEvents.forEach(eventState => {
                                                            if(eventState.event.effects && eventState.event.effects.heatModifier && heatChange > 0) {
                                                            if (typeof heatChange === 'number' && typeof eventState.event.effects.heatModifier === 'number') {
                                                            heat = Math.min(MAX_HEAT, Math.max(0, heat + Math.round(heatChange *
                                                            (eventState.event.effects.heatModifier -1 ) ) ) );
                                                            }
                                                            }
                                                            });
                                                            updateHUD();
                                                            
                                                            setTimeout(() => {
                                                            if (narrationText) displayPhoneMessage(narrationText, 'narration');
                                                            // Display customer reaction only if it's not an error acknowledgement
                                                            if (selectedCustomerReaction && outcome.type !== "acknowledge_error") {
                                                            displayPhoneMessage(`"${currentCustomer.name}: ${selectedCustomerReaction}"`, 'customer');
                                                            }
                                                            setTimeout(endCustomerInteraction, CUSTOMER_WAIT_TIME * 1.5);
                                                            }, CUSTOMER_WAIT_TIME / 2);
                                                            
                                                            if (heat >= MAX_HEAT) { endGame("heat"); return; } // Added return to prevent further processing
                                                            if (cash <= 0 && inventory.length===0 && fiendsLeft> 0 && gameActive) { // Bankrupt if no cash AND
                                                                no inventory
                                                                endGame("bankrupt");
                                                                return;
                                                                }
                                                                }
                                                                
                                                                function endCustomerInteraction() {
                                                                clearChoices();
                                                                if (phoneTitleElement) {
                                                                phoneTitleElement.textContent = 'Street Talk';
                                                                }
                                                                currentCustomer = null;
                                                                
                                                                // Transition phone back to ambient UI mode
                                                                gameChatUI.classList.remove('active-mode');
                                                                gameChatUI.classList.add('inactive-mode');
                                                                androidAmbientUI.classList.remove('inactive-mode');
                                                                androidAmbientUI.classList.add('active-mode');
                                                                phoneDock.classList.remove('hidden'); // Show dock
                                                                phoneHomeIndicator.classList.remove('hidden'); // Show home indicator
                                                                
                                                                if (fiendsLeft > 0 && gameActive && heat < MAX_HEAT && (cash> 0 || inventory.length > 0) ) { //
                                                                    Can continue if not bankrupt
                                                                    nextCustomerBtn.disabled = false;
                                                                    }
                                                                    else if (gameActive) { // Game is active but conditions to continue not met (e.g. bankrupt,
                                                                    max heat)
                                                                    nextCustomerBtn.disabled = true;
                                                                    // Check if an end game condition was met but not yet triggered
                                                                    if (heat >= MAX_HEAT && gameActive) endGame("heat");
                                                                    else if (cash <= 0 && inventory.length===0 && fiendsLeft> 0 && gameActive)
                                                                        endGame("bankrupt");
                                                                        else if (fiendsLeft <=0 && gameActive) endGame("completed"); } saveGameState(); // Moved
                                                                            end game check from here to be more immediate within handleChoice or after
                                                                            nextCustomerBtn logic } function updateHUD() { cashDisplay.textContent=cash;
                                                                            dayDisplay.textContent=Math.max(0, fiendsLeft); heatDisplay.textContent=heat;
                                                                            credDisplay.textContent=streetCred; } function updateInventoryDisplay() {
                                                                            inventoryCountDisplay.textContent=inventory.length;
                                                                            modalInventorySlotsDisplay.textContent=`${inventory.length}/${MAX_INVENTORY_SLOTS}`;
                                                                            inventoryList.innerHTML='' ; if (inventory.length===0) {
                                                                            inventoryList.innerHTML="<p class='empty-stash-message'>Your stash is lookin' sadder than a clown at a tax audit, Rikk. Bone dry.</p>"
                                                                            ; } else { inventory.forEach(item=> {
                                                                            const itemDiv = document.createElement('div');
                                                                            itemDiv.classList.add('inventory-item-card');
                                                                            const itemNameEl = document.createElement('h4');
                                                                            itemNameEl.textContent = `${item.name} (${item.quality})`;
                                                                            itemDiv.appendChild(itemNameEl);
                                                                            const itemDetails = document.createElement('p');
                                                                            itemDetails.classList.add('item-detail');
                                                                            
                                                                            const activeCustomerData = currentCustomer ? currentCustomer.data : null;
                                                                            const effectiveBuyPrice = calculateItemEffectiveValue(item, true,
                                                                            activeCustomerData);
                                                                            const effectiveSellPrice = calculateItemEffectiveValue(item, false,
                                                                            activeCustomerData);
                                                                            itemDetails.innerHTML = `Copped: $${item.purchasePrice} <br>Street (Buy/Sell):
                                                                            $${effectiveBuyPrice} / $${effectiveSellPrice} <br>Heat: +${item.itemTypeObj.heat} |
                                                                            Type: ${item.itemTypeObj.type.slice(0,3)}/${item.itemTypeObj.subType ?
                                                                            item.itemTypeObj.subType.slice(0,4) : 'N/A'}`;
                                                                            if(item.uses) itemDetails.innerHTML += `<br>Uses: ${item.uses}`;
                                                                            if(item.itemTypeObj.effects) itemDetails.innerHTML += `<br><span
                                                                                class="item-effects">Effects: ${item.itemTypeObj.effects.join(',
                                                                                ').substring(0,20)}...</span>`;
                                                                            
                                                                            itemDiv.appendChild(itemDetails);
                                                                            inventoryList.appendChild(itemDiv);
                                                                            });
                                                                            }
                                                                            }
                                                                            
                                                                            function openInventoryModal() {
                                                                            updateInventoryDisplay(); // Ensure it's up-to-date when opened
                                                                            inventoryModal.classList.add('active');
                                                                            // Hide phone completely when inventory is open
                                                                            rikkPhoneDisplay.classList.remove('active');
                                                                            rikkPhoneDisplay.classList.add('hidden');
                                                                            }
                                                                            function closeInventoryModal() {
                                                                            inventoryModal.classList.remove('active');
                                                                            if (currentCustomer || nextCustomerBtn.disabled === false) { // Only show phone if
                                                                            an interaction is active or next customer is available
                                                                            rikkPhoneDisplay.classList.remove('hidden');
                                                                            rikkPhoneDisplay.classList.add('active');
                                                                            }
                                                                            }
                                                                            function clearChat() { chatContainer.innerHTML = ''; }
                                                                            function clearChoices() { choicesArea.innerHTML = ''; }
                                                                            function playSound(audioElement) {
                                                                            if (audioElement) {
                                                                            audioElement.currentTime = 0;
                                                                            audioElement.play().catch(e => console.warn("Audio play failed:", e.name,
                                                                            e.message));
                                                                            }
                                                                            }
                                                                            
                                                                            function saveGameState() {
                                                                            if (!gameActive && fiendsLeft > 0) return; // Don't save if game not active unless
                                                                            it's end of game
                                                                            const stateToSave = {
                                                                            cash, fiendsLeft, heat, streetCred, inventory,
                                                                            playerSkills, activeWorldEvents, dayOfWeek,
                                                                            customersPool, nextCustomerId
                                                                            };
                                                                            try {
                                                                            localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
                                                                            console.log("Game state saved.");
                                                                            } catch (e) { console.error("Error saving game state:", e); }
                                                                            }
                                                                            
                                                                            function loadGameState() {
                                                                            const savedData = localStorage.getItem(SAVE_KEY);
                                                                            if (savedData) {
                                                                            try {
                                                                            const loadedState = JSON.parse(savedData);
                                                                            cash = loadedState.cash !== undefined ? loadedState.cash : STARTING_CASH;
                                                                            fiendsLeft = loadedState.fiendsLeft !== undefined ? loadedState.fiendsLeft :
                                                                            MAX_FIENDS;
                                                                            heat = loadedState.heat !== undefined ? loadedState.heat : 0;
                                                                            streetCred = loadedState.streetCred !== undefined ? loadedState.streetCred :
                                                                            STARTING_STREET_CRED;
                                                                            inventory = Array.isArray(loadedState.inventory) ? loadedState.inventory : [];
                                                                            playerSkills = loadedState.playerSkills || { negotiator: 0, appraiser: 0,
                                                                            lowProfile: 0 };
                                                                            activeWorldEvents = Array.isArray(loadedState.activeWorldEvents) ?
                                                                            loadedState.activeWorldEvents : [];
                                                                            dayOfWeek = loadedState.dayOfWeek || days[0];
                                                                            customersPool = Array.isArray(loadedState.customersPool) ? loadedState.customersPool
                                                                            : [];
                                                                            nextCustomerId = loadedState.nextCustomerId || 1;
                                                                            updateEventTicker();
                                                                            console.log("Game state loaded.");
                                                                            return true;
                                                                            } catch (e) {
                                                                            console.error("Error parsing saved game state:", e);
                                                                            clearSavedGameState();
                                                                            return false;
                                                                            }
                                                                            }
                                                                            return false;
                                                                            }
                                                                            function clearSavedGameState() {
                                                                            localStorage.removeItem(SAVE_KEY);
                                                                            console.log("Saved game state cleared.");
                                                                            }
                                                                            function checkForSavedGame() {
                                                                            if (localStorage.getItem(SAVE_KEY)) {
                                                                            continueGameBtn.classList.remove('hidden');
                                                                            } else {
                                                                            continueGameBtn.classList.add('hidden');
                                                                            }
                                                                            }
                                                                            
                                                                            document.addEventListener('DOMContentLoaded', initGame);
                                                                            ```