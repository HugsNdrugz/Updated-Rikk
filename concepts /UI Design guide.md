Of course. Here is a complete rewrite of the One UI Design Guidelines, reinterpreted and refactored for modern web development using **HTML, CSS, and JavaScript**.

This guide preserves the core principles, structure, and visual identity of One UI while providing practical, web-focused explanations and code examples.

***

# **One UI for Web: Design Guidelines**

### A Web-Focused Interpretation of Samsung's Ergonomic Design System

---

## **Index**

### **Overview**
*   Introduction: Bringing One UI to the Web

### **Web Architecture**
1.  **Core Layout:** The Viewing & Interaction Areas with Flexbox
2.  **Theming:** Light & Dark Modes with CSS Variables
3.  **Responsive Design:** Using Media Queries for Tablets & Desktops
4.  **Spacing & Safe Areas:** Margins, Padding, and Viewport Units
5.  **Screen Optimization:** Font Scaling and Accessibility

### **Visual Design**
1.  **Icons:** Using SVG for Clarity and Scalability
2.  **Color:** A Semantic Color Palette with CSS Variables
3.  **Typography:** The Roboto Font Stack and Type Scale for the Web
4.  **Thumbnail Radius:** Implementing `border-radius` for Focus

### **Components (HTML, CSS, JS)**
1.  **App Bar:** The Collapsible Header
2.  **Bottom Bar / Tab Bar:** A Sticky Footer for Navigation
3.  **Buttons:** Contained and Flat Button Styles
4.  **Sliders:** The HTML `<input type="range">`
5.  **Dialogs (Modals):** Accessible Bottom-Sheet Modals
6.  **Lists:** Semantic List Structures
7.  **Focus Blocks (Cards):** The Core Content Container

### **Motion & Interaction**
1.  **Intuitive:** Meaningful Transitions
2.  **Seamless:** Shared Element Transitions
3.  **Tangible:** Micro-interactions with CSS & JS

### **Auditory Design**
1.  **Principle:** When to Use Sound on the Web
2.  **Sound Feedback:** Using the `<audio>` Element and Web Audio API

### **Accessibility (WCAG)**
1.  **Principle:** Designing for Everyone
2.  **Vision:** Color Contrast, `alt` Text, and Text Resizing
3.  **Hearing:** Transcripts and Captions
4.  **Interaction and Dexterity:** Keyboard Navigation and ARIA
5.  **Web Checklist:** An Accessibility Checklist for Developers

---

## **Overview**

### **Introduction: Bringing One UI to the Web**

Samsung's One UI was designed to make large mobile devices easier to use. Its core principles—ergonomic layout, focus on content, and comfortable viewing—are incredibly relevant to modern web design. As web applications become more complex and are used on a wider range of devices, these human-centered guidelines offer a powerful framework for creating intuitive and accessible experiences.

This document reinterprets the native Android guidelines for web developers. By following these principles, you can build web apps that are not only aesthetically pleasing but also consistent, easy to navigate, and comfortable to use, regardless of the screen size.

---

## **Web Architecture**

### **1. Core Layout: The Viewing & Interaction Areas**

The most defining feature of One UI is its split-screen layout.
*   **Viewing Area (Top):** Displays content for consumption, like titles and images. It's often out of easy thumb reach.
*   **Interaction Area (Bottom):** Contains all interactive elements like buttons, lists, and tabs, placing them within easy reach.

We can achieve this with CSS Flexbox.

#### **HTML Structure**
```html
<div class="one-ui-screen">
  <main class="one-ui-content">
    <header class="viewing-area">
      <h1>Your Title</h1>
    </header>
    <section class="interaction-area">
      <!-- Buttons, lists, and other controls go here -->
    </section>
  </main>
</div>
```

#### **CSS Implementation**
```css
.one-ui-screen {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
}

.one-ui-content {
  flex-grow: 1; /* Allows this element to grow and fill space */
  overflow-y: auto; /* Makes only this part scrollable */
}

.viewing-area {
  padding: 80px 24px 24px 24px;
  /* A large top padding pushes the title down into the interaction zone on load */
}

.interaction-area {
  padding: 24px;
}
```

### **2. Theming: Light & Dark Modes with CSS Variables**

One UI provides comfortable default and dark themes. Using CSS Custom Properties (variables) is the most efficient way to implement this on the web.

#### **CSS Implementation**
```css
/* Define colors for the default (light) theme */
:root {
  --bg-color: #f2f2f2;
  --text-color: #000000;
  --primary-color: #007bff;
  --card-bg-color: #ffffff;
  --border-color: #e0e0e0;
}

/* Override variables for dark mode */
[data-theme="dark"] {
  --bg-color: #121212;
  --text-color: #e1e1e1;
  --primary-color: #3e91ff;
  --card-bg-color: #252525;
  --border-color: #333333;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}
```

#### **JavaScript Toggle**
A button can toggle the theme by changing a data attribute on the `<html>` or `<body>` tag.
```javascript
const themeToggleBtn = document.getElementById('theme-toggle');
themeToggleBtn.addEventListener('click', () => {
    let newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = newTheme;
});
```

### **3. Responsive Design: Using Media Queries**

One UI layouts adapt gracefully. While the single-column, split-screen layout is perfect for mobile, use media queries to adapt for tablets and desktops.

#### **CSS Example for Tablets**
```css
/* On screens wider than 768px... */
@media (min-width: 768px) {
  .interaction-area {
    /* Create a two-column grid for focus blocks */
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}
```

### **4. Spacing & Safe Areas**

One UI recommends a minimum margin of **24dp** on each side. On the web, we can use `px` or `rem` units and apply this as padding to our main container to create a "safe area" for content.

```css
.one-ui-content {
  /* This ensures content never touches the screen edges */
  padding-left: 24px;
  padding-right: 24px;
}
```

---

## **Visual Design**

### **1. Icons: Using SVG for Clarity**

One UI icons are simple, clear, and have rounded characteristics. **SVG (Scalable Vector Graphics)** is the ideal format for web icons.

*   **Use an Icon Library:** Libraries like [Feather Icons](https://feathericons.com/) or [Font Awesome](https://fontawesome.com/) provide high-quality, consistent SVGs.
*   **Style with CSS:** You can easily style SVGs (color, stroke width) directly with CSS, making them adaptable to your themes.

```html
<!-- Example using an inline SVG -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 20h9"></path>
  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
</svg>
```

### **2. Color: A Semantic Palette**

Use the CSS color variables defined in the Architecture section. This ensures consistency.
*   `--primary-color`: For all interactive elements like links, active states, and contained buttons.
*   `--text-color`: For primary text.
*   `--card-bg-color`: For the background of Focus Blocks.

### **3. Typography: The Web Font Stack**

One UI uses **Roboto**. For the web, it's best to use a system font stack that includes Roboto but provides fallbacks. Capitalize the first letter of words in titles, tabs, and buttons.

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

h1, .button, .tab {
  text-transform: capitalize;
}
```
#### **Web Type Scale (from Page 65)**
```css
.extend-title { font-size: 40px; font-weight: 300; }
.dialog-title { font-size: 20px; font-weight: 500; }
.title { font-size: 19px; }
.main-list-text { font-size: 18px; }
.body-text { font-size: 16px; }
.button-text { font-size: 15px; }
```

### **4. Thumbnail Radius: `border-radius`**

One UI's soft aesthetic comes from generously rounded corners. Apply this consistently, especially to Focus Blocks.

```css
.focus-block {
  /* As per page 66, for large blocks */
  border-radius: 26px; 
}

.image-thumbnail-large {
  border-radius: 20px;
}

.image-thumbnail-small {
  border-radius: 12px;
}
```

---

## **Components (HTML, CSS, JS)**

### **1. App Bar: The Collapsible Header**

This is the most iconic One UI component. It starts large and collapses into a standard, small header on scroll.

#### **HTML**
```html
<header class="collapsible-header">
  <h1 class="expanded-title">Settings</h1>
  <div class="collapsed-title">Settings</div>
</header>
```
#### **CSS**
```css
.collapsible-header {
  position: sticky;
  top: 0;
  background-color: var(--bg-color);
  height: 200px; /* Expanded height */
  transition: height 0.3s ease-out;
  display: flex;
  align-items: flex-end; /* Push title to bottom */
  padding: 24px;
}

.collapsible-header.scrolled {
  height: 60px; /* Collapsed height */
  align-items: center; /* Center title vertically */
  border-bottom: 1px solid var(--border-color);
}

.expanded-title { transition: opacity 0.2s; }
.collapsed-title { position: absolute; left: 50%; transform: translateX(-50%); opacity: 0; transition: opacity 0.3s; }

.collapsible-header.scrolled .expanded-title { opacity: 0; }
.collapsible-header.scrolled .collapsed-title { opacity: 1; }
```

#### **JavaScript**
```javascript
const header = document.querySelector('.collapsible-header');
const content = document.querySelector('.one-ui-content');

content.addEventListener('scroll', () => {
  if (content.scrollTop > 50) { // Threshold
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});
```

### **2. Buttons: Contained and Flat**

#### **HTML**
```html
<button class="button btn-contained">Save</button>
<button class="button btn-flat">Cancel</button>
```
#### **CSS**
```css
.button {
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s;
}
.button:active {
  transform: scale(0.97); /* Tangible feedback */
}

.btn-contained {
  background-color: var(--primary-color);
  color: #fff;
}
.btn-flat {
  background-color: transparent;
  color: var(--primary-color);
}
```

### **3. Dialogs (Modals)**

One UI dialogs appear from the bottom of the screen.

#### **HTML**
```html
<div class="dialog-overlay">
  <div class="dialog-box">
    <h2>Dialog Title</h2>
    <p>Dialog message goes here.</p>
    <div class="button-group">
      <!-- Buttons -->
    </div>
  </div>
</div>
```
#### **CSS**
```css
.dialog-overlay {
  position: fixed; /* Covers the whole screen */
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end; /* Aligns box to bottom */
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s;
}
.dialog-overlay.is-visible {
  opacity: 1;
  visibility: visible;
}
.dialog-box {
  background-color: var(--card-bg-color);
  width: 100%;
  max-width: 450px;
  padding: 24px;
  border-radius: 26px 26px 0 0;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
}
.dialog-overlay.is-visible .dialog-box {
  transform: translateY(0);
}
```
*JavaScript is required to toggle the `.is-visible` class on a button click.*

---

## **Motion & Interaction**

*   **Intuitive:** Use CSS `transform` for animations. For example, when a dialog appears, it slides up from the bottom (`transform: translateY(...)`), indicating it's an overlay from the UI chrome area.
*   **Seamless:** For transitions between page states (e.g., clicking a list item to go to a detail view), use a JavaScript routing library (like React Router, Vue Router) combined with page transition animations to avoid a full-page reload.
*   **Tangible:** Provide immediate feedback for user actions. Use CSS `:active` pseudo-classes on buttons to make them visually react to a click, as shown in the button example.

---

## **Accessibility (WCAG)**

Bringing One UI to the web means adhering to the Web Content Accessibility Guidelines (WCAG).

*   **Vision:**
    *   Ensure all colors defined in your `--*` variables meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text).
    *   All `<img>` tags must have descriptive `alt` attributes.
    *   Use `rem` units for font sizes to allow users to resize text in their browser settings without breaking the layout.

*   **Hearing:**
    *   Provide text transcripts for audio-only content and captions for video content using the `<track>` element.

*   **Interaction and Dexterity:**
    *   **Use Semantic HTML:** Use `<button>`, `<nav>`, `<main>`, and `<header>` correctly. This gives screen readers a clear structure.
    *   **Keyboard Navigability:** Ensure all interactive elements are reachable and operable via the Tab key.
    *   **Visible Focus:** Style the `:focus-visible` state so keyboard users can always see where they are on the page.
    ```css
    a:focus-visible, button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    ```
    *   **Use ARIA Roles:** When creating custom components, use ARIA (Accessible Rich Internet Applications) roles like `role="dialog"` and `aria-modal="true"` to describe their function to assistive technologies.

### **Web Accessibility Checklist**
1.  Does every `<img>` have a descriptive `alt` attribute?
2.  Are all interactive elements (links, buttons, inputs) focusable and operable with a keyboard?
3.  Is the focus order logical and predictable?
4.  Is there a clear, visible focus indicator for keyboard users?
5.  Does all text meet a 4.5:1 contrast ratio against its background?
6.  Are ARIA attributes used correctly for custom components like dialogs and tabs?
7.  Does the layout remain usable when text is zoomed to 200%?
8.  Are form inputs associated with `<label>` tags?
Excellent. Let's continue building out the **One UI for Web** guide, focusing on the remaining core components and principles.

***

## **Components (Continued)**

Here we will implement more of the essential One UI components using web technologies, referencing the original guide's page numbers.

### **5. Bottom Navigation Bar (Pages 31-34)**

A bottom navigation bar provides persistent access to the top-level destinations in a web app. It's a cornerstone of mobile-first design and a perfect fit for the One UI philosophy. On the web, we implement this as a sticky footer.

#### **HTML Structure**
Use a semantic `<nav>` element at the bottom of your main screen container.

```html
<!-- Place this inside the .phone-simulator, after the .one-ui-content -->
<nav class="bottom-nav">
    <a href="#home" class="nav-item active">
        <svg class="icon"><!-- home icon svg --></svg>
        <span class="label">Home</span>
    </a>
    <a href="#explore" class="nav-item">
        <svg class="icon"><!-- compass icon svg --></svg>
        <span class="label">Explore</span>
    </a>
    <a href="#profile" class="nav-item">
        <svg class="icon"><!-- user icon svg --></svg>
        <span class="label">Profile</span>
    </a>
</nav>
```

#### **CSS Implementation**
```css
.bottom-nav {
  position: sticky;
  bottom: 0;
  width: 100%;
  background-color: var(--card-bg-color);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  z-index: 50;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--secondary-text-color);
  text-decoration: none;
  padding: 4px 12px;
  border-radius: 12px;
  transition: background-color 0.2s;
}
.nav-item .icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}
.nav-item .label {
  font-size: 12px;
}

/* Style for the active/current item */
.nav-item.active {
  color: var(--primary-color);
}
.nav-item:active {
  background-color: rgba(0,0,0,0.05); /* Tangible feedback */
}
```

### **6. Sliders (Page 36)**

Sliders are used for selecting a value from a range (e.g., volume, brightness). We can use the native HTML `<input type="range">` and style it to match the One UI aesthetic.

#### **HTML Structure**
```html
<label for="brightness-slider">Brightness</label>
<input type="range" id="brightness-slider" class="one-ui-slider" min="0" max="100" value="75">
```

#### **CSS Implementation**
Styling range inputs requires vendor-prefixed pseudo-elements.

```css
.one-ui-slider {
  -webkit-appearance: none; /* remove default appearance */
  width: 100%;
  height: 6px;
  background-color: var(--border-color);
  border-radius: 3px;
  outline: none;
}

/* The slider thumb (the circle) */
.one-ui-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background-color: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.one-ui-slider::-moz-range-thumb { /* For Firefox */
  width: 20px;
  height: 20px;
  background-color: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: transform 0.2s ease;
}

/* Tangible feedback on interaction (Page 76) */
.one-ui-slider:active::-webkit-slider-thumb {
  transform: scale(1.2);
}
.one-ui-slider:active::-moz-range-thumb {
  transform: scale(1.2);
}
```

### **7. Progress Indicators (Pages 45-47)**

Provide feedback for ongoing processes.

#### **Determinate Progress Bar (e.g., File Upload)**
Use the semantic `<progress>` element.

```html
<label for="file-progress">Uploading...</label>
<progress id="file-progress" class="one-ui-progress" max="100" value="70"></progress>
```
```css
.one-ui-progress {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
}
/* Style the bar */
.one-ui-progress::-webkit-progress-bar {
  background-color: var(--border-color);
  border-radius: 3px;
}
.one-ui-progress::-webkit-progress-value {
  background-color: var(--primary-color);
  border-radius: 3px;
}
```
#### **Indeterminate Spinner (e.g., Loading Data)**
This is best done with a pure CSS animation. The guide (Page 47) correctly shows that the spinner should appear on the element that triggered the action, not as a full-screen overlay.

```html
<button class="button btn-contained" id="load-data-btn">
    <span class="btn-text">Load Data</span>
    <div class="spinner is-hidden"></div>
</button>
```
```css
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.is-hidden { display: none; }
.btn-contained .spinner {
    margin-left: 10px; /* Space between text and spinner */
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```
*JavaScript is needed to toggle the text and the `.is-hidden` class on the spinner.*

### **8. Action Toasts / Snackbars (Page 50)**

Toasts provide brief, non-interruptive feedback about an operation. They appear at the bottom of the screen and disappear automatically.

#### **HTML Structure**
Create a container that is fixed to the bottom of the viewport. Toasts will be added to it dynamically with JavaScript.
```html
<div id="toast-container"></div>
```
#### **CSS Implementation**
```css
#toast-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.toast {
  background-color: #323232;
  color: #fff;
  padding: 12px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  opacity: 0;
  transform: translateY(20px);
  animation: fade-in-up 0.3s forwards;
}

.toast .action-button {
  color: var(--primary-color);
  font-weight: bold;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
}

@keyframes fade-in-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### **JavaScript Function**
```javascript
function showToast(message, duration = 4000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Automatically remove the toast after the duration
  setTimeout(() => {
    toast.style.animation = 'fade-out 0.3s forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// Example usage:
// showToast('Item saved successfully!');
```
*A corresponding `fade-out` animation would need to be created.*

### **9. Selection Control (Page 54)**

Styling native checkboxes and radios to match a design system requires hiding the default input and creating a custom one with CSS.

#### **HTML Structure**
Always use a `<label>` for accessibility.
```html
<div class="checkbox-control">
  <input type="checkbox" id="terms" class="one-ui-checkbox">
  <label for="terms">I agree to the terms</label>
</div>
```

#### **CSS Implementation**
```css
.checkbox-control {
  display: flex;
  align-items: center;
  gap: 12px;
}
.one-ui-checkbox {
  position: absolute; /* Hide the actual checkbox */
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}
.checkbox-control label {
  position: relative;
  padding-left: 30px; /* Space for the custom checkbox */
  cursor: pointer;
}
/* Create the custom box */
.checkbox-control label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  width: 20px;
  border: 2px solid var(--border-color);
  background-color: transparent;
  border-radius: 6px;
  transition: background-color 0.2s, border-color 0.2s;
}
/* Style the checkmark (hidden by default) */
.checkbox-control label::after {
  content: '✓';
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%) scale(0);
  font-size: 16px;
  color: #fff;
  transition: transform 0.2s;
}

/* Change style when the hidden checkbox is checked */
.one-ui-checkbox:checked + label::before {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}
.one-ui-checkbox:checked + label::after {
  transform: translateY(-50%) scale(1);
}
```

---

## **Auditory Design**

### **1. Principle: Use Sparingly and With Purpose**
On the web, sound can be intrusive. Unlike a mobile OS where sounds signify system-level events, web sounds should be used only for:
*   **Critical Feedback:** Confirming a successful, non-obvious action (e.g., a "swoosh" sound after sending a large file).
*   **Notifications in Active Apps:** In a real-time chat application, a subtle sound for a new message can be helpful, but it **must** be user-configurable.
*   **Accessibility:** As an alternative or supplement to visual cues.

**Rule of Thumb:** Never autoplay sound when a page loads. All sounds should be a direct result of a user's action and should be controllable (i.e., include a mute setting in your app).

### **2. Sound Feedback: The Web Audio API**

For simple feedback, use the `<audio>` element with JavaScript.

#### **HTML**
```html
<audio id="success-sound" src="path/to/success-chime.mp3" preload="auto"></audio>
```
#### **JavaScript**
```javascript
function playSuccessSound() {
    const sound = document.getElementById('success-sound');
    // Ensure we can play from the start if it was just played
    sound.currentTime = 0; 
    sound.play();
}

// Example: Play sound after a successful form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    //... process form ...
    playSuccessSound();
    showToast('Your submission was received!');
});
```

---

## **Conclusion**

By applying these web-centric interpretations of Samsung's One UI guidelines, you can create interfaces that are not just visually aligned but functionally and philosophically aligned as well. The focus on ergonomics, clarity, and user comfort translates into a superior user experience on the web, especially for complex applications and mobile users. Using modern web standards like CSS Custom Properties, Flexbox, and semantic HTML makes building these experiences more efficient and maintainable than ever before.