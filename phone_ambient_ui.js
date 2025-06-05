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
 const phoneContainer = document.getElementById('rikk-phone-ui'); // Changed ID to rikk-phone-ui
 if (!phoneContainer) {
  console.error("Phone container (#rikk-phone-ui) not found. Ambient UI cannot be initialized.");
  return;
 }
 
 currentTimeSmallElement = phoneContainer.querySelector('#current-time-small');
 currentTimeElement = phoneContainer.querySelector('#current-time');
 currentDateElement = phoneContainer.querySelector('#current-date');
 notificationElement = phoneContainer.querySelector('#notification');
 appIcons = phoneContainer.querySelectorAll('#android-home-screen .app-icon, #phone-app-menu-game .app-icon'); // Select icons from both home and app menu
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
 
 // Setup icon animations for all app icons and dock icons
 const allClickableIcons = [...appIcons, ...dockIcons];
 allClickableIcons.forEach(icon => {
  icon.addEventListener('click', function() {
   this.style.transform = 'scale(0.9)';
   setTimeout(() => {
    this.style.transform = 'scale(1.1)';
   }, 100);
   // This is just a generic notification for clicks on other apps
   if (this.dataset.action && this.dataset.action !== 'messages' && this.dataset.action !== 'inventory') {
    showNotification(`"${this.querySelector('.app-label')?.textContent || this.dataset.action}" opened`, "Phone Info");
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
 hours = hours < 10 ? "0" + hours : hours;
 minutes = minutes < 10 ? "0" + minutes : minutes;
 
 if (currentTimeElement) currentTimeElement.textContent = `${hours}:${minutes}`;
 if (currentTimeSmallElement) currentTimeSmallElement.textContent = `${hours}:${minutes}`;
 
 // Date
 const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
 };
 if (currentDateElement) currentDateElement.textContent = now.toLocaleDateString("en-US", options);
}

/**
 * Shows a notification on the phone screen.
 * @param {string} content The message content of the notification.
 * @param {string} [title="Notification"] The title of the notification.
 * @param {number} [duration=3000] How long the notification stays visible in ms.
 */
export function showNotification(content, title = "Notification", duration = 3000) {
 if (notificationElement) {
  let notificationTitleEl = notificationElement.querySelector('.notification-title');
  if (!notificationTitleEl) {
   notificationTitleEl = document.createElement('div');
   notificationTitleEl.classList.add('notification-title');
   notificationElement.prepend(notificationTitleEl); // Add before content
  }
  notificationTitleEl.textContent = title;
  notificationElement.querySelector('.notification-content').textContent = content;
  
  notificationElement.style.display = "block";
  setTimeout(() => {
   notificationElement.style.display = "none";
  }, duration);
 }
}