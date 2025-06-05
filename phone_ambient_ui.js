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
 const phoneContainer = document.getElementById('rikk-phone-ui'); // Updated container ID
 if (!phoneContainer) {
  console.error("Phone container (#rikk-phone-ui) not found. Ambient UI cannot be initialized.");
  return;
 }
 
 currentTimeSmallElement = phoneContainer.querySelector('#current-time-small-phone'); // Updated ID
 currentTimeElement = phoneContainer.querySelector('#current-time-phone'); // Updated ID
 currentDateElement = phoneContainer.querySelector('#current-date-phone'); // Updated ID
 notificationElement = phoneContainer.querySelector('#notification'); // This ID might need checking if it's part of the new phone UI, assuming it is for now or handled elsewhere.
 appIcons = phoneContainer.querySelectorAll('#android-home-screen .app-icon, #phone-app-menu-game .app-icon'); // More specific app icon selection
 dockIcons = phoneContainer.querySelectorAll('.dock-icon');
 batteryIcons = phoneContainer.querySelectorAll('.fa-battery-three-quarters'); // This class is generic, should be fine
 wallpaperElement = phoneContainer.querySelector('.wallpaper'); // This class might need checking if it exists in new UI.
 
 if (!currentTimeElement || !currentDateElement || !currentTimeSmallElement) { // Added small element to check
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
// The second block of duplicated code from the original file has been removed.
// Ensure this is the desired outcome or if the second block had unique changes, they should be merged.