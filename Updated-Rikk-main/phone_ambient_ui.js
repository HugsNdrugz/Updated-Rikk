// phone_ambient_ui.js

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
        console.error("Phone container not provided. Ambient UI cannot be initialized.");
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
* @param {number} [duration=3000] - How long the notification stays visible in ms.
*/
let notificationTimeout;
export function showNotification(content, title = "Notification", duration = 3000) {
    if (!notificationElement || !notificationTitleEl || !notificationContentEl) return;

    // Clear any existing timeout to reset the timer if a new notification appears
    if (notificationTimeout) clearTimeout(notificationTimeout);

    notificationTitleEl.textContent = title;
    notificationContentEl.textContent = content;
    notificationElement.style.display = "block";

    notificationTimeout = setTimeout(() => {
        notificationElement.style.display = "none";
    }, duration);
}