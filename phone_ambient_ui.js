// phone_ambient_ui.js
import { debugLogger } from './utils.js';

/**
* Handles the ambient UI elements and animations of the phone.
* This is a self-contained module.
*/

// --- Module-level variables ---
let currentTimeSmallElement, currentTimeElement, currentDateElement;
let notificationElement, notificationTitleEl, notificationContentEl;
let batteryIcons, wallpaperElement;
let timeUpdateInterval, batteryUpdateInterval, wallpaperUpdateInterval;

/**
* Initializes the ambient phone UI by querying elements and starting intervals.
* @param {HTMLElement} phoneContainer - The main phone container element (e.g., #rikk-phone-ui).
*/
export function initPhoneAmbientUI(phoneContainer) {
    if (!phoneContainer) {
        debugLogger.error('PhoneUI', "Phone container not provided. Ambient UI cannot be initialized.");
        return;
    }

    // Query all necessary elements scoped within the provided container
    currentTimeSmallElement = phoneContainer.querySelector('#current-time-small');
    currentTimeElement = phoneContainer.querySelector('#current-time');
    currentDateElement = phoneContainer.querySelector('#current-date');
    notificationElement = phoneContainer.querySelector('#notification');
    batteryIcons = phoneContainer.querySelectorAll('.status-icons .fas'); // More specific selector
    wallpaperElement = phoneContainer.querySelector('.wallpaper');

    if (notificationElement) {
        notificationTitleEl = notificationElement.querySelector('.notification-title');
        notificationContentEl = notificationElement.querySelector('.notification-content');
    }

    // Stop existing intervals to prevent duplication on re-initialization
    if (timeUpdateInterval) clearInterval(timeUpdateInterval);
    if (batteryUpdateInterval) clearInterval(batteryUpdateInterval);
    if (wallpaperUpdateInterval) clearInterval(wallpaperUpdateInterval);

    // Initial update
    updateTime();
    
    // Set up recurring updates
    timeUpdateInterval = setInterval(updateTime, 60000); // Every minute
    batteryUpdateInterval = setInterval(animateBattery, 15000); // Every 15 seconds
    wallpaperUpdateInterval = setInterval(animateWallpaper, 100); // Smooth animation
}

/**
* Updates the current time and date displayed on the phone.
*/
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    if (currentTimeElement) currentTimeElement.textContent = timeString;
    if (currentTimeSmallElement) currentTimeSmallElement.textContent = timeString;

    const dateOptions = { weekday: "long", month: "long", day: "numeric" };
    if (currentDateElement) {
        currentDateElement.textContent = now.toLocaleDateString("en-US", dateOptions);
    }
}

/**
* Animates the battery icon in the status bar.
*/
function animateBattery() {
    if (!batteryIcons || batteryIcons.length === 0) return;
    const levels = ["fa-battery-empty", "fa-battery-quarter", "fa-battery-half", "fa-battery-three-quarters", "fa-battery-full"];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    
    batteryIcons.forEach(icon => {
        if (icon.classList.contains('fa-signal') || icon.classList.contains('fa-wifi')) return;
        icon.className = `fas ${randomLevel}`; // Replace all classes with new battery level
    });
}

/**
* Animates the wallpaper gradient.
*/
let wallpaperAngle = 0;
function animateWallpaper() {
    if (!wallpaperElement) return;
    wallpaperAngle = (wallpaperAngle + 0.1) % 360;
    wallpaperElement.style.background = `linear-gradient(${wallpaperAngle}deg, #6e45e2 0%, #89d4cf 100%)`;
}


/**
* Shows a notification on the phone screen.
* @param {string} content - The message content of the notification.
* @param {string} [title="Notification"] - The title of the notification.
* @param {string} [type="neutral"] - The type of notification ('positive', 'negative', 'neutral').
* @param {number} [duration=3000] - How long the notification stays visible in ms.
*/
let notificationTimeout;
export function showNotification(content, title = "Notification", type = "neutral", duration = 3000) {
    if (!notificationElement || !notificationTitleEl || !notificationContentEl) return;

    // Clear any existing timeout to reset the timer if a new notification appears
    if (notificationTimeout) clearTimeout(notificationTimeout);

    notificationTitleEl.textContent = title;
    notificationContentEl.textContent = content;

    // Remove previous type classes
    notificationElement.classList.remove('positive-feedback', 'negative-feedback');

    // Add type class for styling
    if (type === 'positive') {
        notificationElement.classList.add('positive-feedback');
    } else if (type === 'negative') {
        notificationElement.classList.add('negative-feedback');
    }
    // Neutral type doesn't add a special class by default

    notificationElement.style.display = "block"; // Make it visible
    notificationElement.classList.add('show'); // For potential future CSS animations if display:none/block is too abrupt

    notificationTimeout = setTimeout(() => {
        notificationElement.classList.remove('show');
        // Hide it again after duration. Using display none for simplicity, could use opacity/transform for animation.
        notificationElement.style.display = "none";
        if (type === 'positive') {
            notificationElement.classList.remove('positive-feedback');
        } else if (type === 'negative') {
            notificationElement.classList.remove('negative-feedback');
        }
    }, duration);
}