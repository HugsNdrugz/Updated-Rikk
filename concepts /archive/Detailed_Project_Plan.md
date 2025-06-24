# Detailed Project Plan: [Game Name] Enhancement

## 0. Introduction

This document outlines the detailed project plan for the enhancement of [Game Name]. It encompasses the phased implementation strategy, specific tasks for core gameplay mechanics, new feature integrations, narrative deepening, UI/UX alignment, and technical considerations. This plan is derived from the `Enhancement_Roadmap.md` and subsequent detailed planning sessions. Its purpose is to guide the development team through the execution of these enhancements, ensuring clarity on objectives, tasks, and priorities.

## 1. Overall Phased Implementation Sequence

The project will be implemented in three main phases, each with specific focuses and deliverables. Roadmap subsections are prioritized within these phases.

### Phase 1: Foundational Systems & Core UI Shells

*   **Goal:** Establish the essential backend systems and basic UI frameworks for new features. Provide a playable, albeit limited, core experience.
*   **Focus Roadmap Subsections:**
    *   2.1 StreetCred System Overhaul (Core Logic & Data Structures)
    *   2.2 Loyalty System Implementation (Core Logic & Data Structures)
    *   3.1 Functional 'Contacts' App (Basic UI & Core Contact Management Logic)
    *   3.2 Functional 'Map' App (Basic UI & Core District Data Logic)
    *   3.3 Functional 'News' App (Basic UI & Core News Generation Logic)
    *   6.2 Data Structure Modifications (Initial Setup for `GameState.js` and new JSON files)
    *   6.3 Save/Load Impact & Modularity (Core System Updates)
*   **Key Task Groups:**
    *   Backend system development for StreetCred and Loyalty.
    *   Initial `GameState.js` modifications.
    *   Creation of basic data schemas for `contacts_data.json`, `map_data.json`, `news_articles.json`.
    *   Development of UI shells for Contacts, Map, and News apps.
    *   Core logic for contact management, map display, and news item display.
    *   Update save/load system for new core data.

### Phase 2: Content Population & Deepening Mechanics

*   **Goal:** Populate the foundational systems with content, flesh out gameplay mechanics, and begin narrative integration.
*   **Focus Roadmap Subsections:**
    *   2.1 StreetCred System Overhaul (Street Etiquette Sub-System, Faction/Community Figure Integration)
    *   2.2 Loyalty System Implementation (Nuanced Dialogue, NPC Life Changes Impact)
    *   2.3 Deepening Consequences (Consequence Loops, Funny Fails, Illusion of Choice)
    *   2.4 Mechanical Item Effects (Utility, Experiential & Narrative Effects)
    *   2.5 World Event System Sophistication (Systemic, Thematic, Humorous Events)
    *   3.1 Functional 'Contacts' App (Contact Acquisition, Archetypes, Services, Mission Links)
    *   3.2 Functional 'Map' App (District Characteristics, Dynamic Heat, Meeting Spots)
    *   3.3 Functional 'News' App (Dynamic Content Triggers, Foreshadowing, Flavor Content)
    *   4.1 Integrating 'The Message' (Initial Thematic Scenarios & Customer Archetype Adjustments)
    *   6.2 Data Structure Modifications (Expansion for new features and content)
    *   6.5 Testing Strategy (Begin focused playtesting for new mechanics)
*   **Key Task Groups:**
    *   Detailed content creation for contacts, map districts, news articles, items, and world events.
    *   Implementation of advanced logic for StreetCred, Loyalty, Consequences, Item Effects, and World Events.
    *   Development of specific missions and services for contacts.
    *   Integration of "The Message" narrative elements.
    *   Expansion of data files and `GameState.js`.
    *   Implementation of debug tools for testing.

### Phase 3: Refinement, Advanced Features & Thematic Polish

*   **Goal:** Refine all systems, implement advanced narrative features, ensure thematic consistency in UI/UX, and conduct thorough balancing and polishing.
*   **Focus Roadmap Subsections:**
    *   2.6 Skill Progression System Refinement (Existing & New Skills, Slang Proficiency, UI)
    *   4.1 Integrating 'The Message' (Full Integration, Moments of Choice, Internal Monologue)
    *   4.2 Enhancing Impact of Unseen Antagonists & Allies (Full System Implementation)
    *   4.3 Implementing Meaningful Endings/Win Conditions (All Endings & Triggers)
    *   5.1 Diegetic Redesign of Core Phone Interface & Apps (Full Thematic Redesign)
    *   5.2 SlotGame & Other Minigames Thematic Integration (Redesign & New Minigames)
    *   5.3 Dynamic Visual Feedback for Game State & Events (Full Implementation)
    *   6.1 Prioritization Strategy (Final Review and Adjustments)
    *   6.6 Performance Considerations (Optimization Pass)
*   **Key Task Groups:**
    *   Implementation of the full skill system and its UI.
    *   Completion of "The Message" integration and all ending conditions.
    *   Development of systems for unseen antagonists/allies.
    *   Full diegetic redesign of the phone UI and all apps.
    *   Development and integration of new/re-skinned minigames.
    *   Implementation of all dynamic visual feedback.
    *   Comprehensive playtesting, balancing, bug fixing, and performance optimization.

## 2. Core Gameplay Mechanic Enhancements

Detailed tasks for enhancing fundamental gameplay systems.

### 2.1 StreetCred System Overhaul
*   **Task 2.1.1:** Modify `GameState.js` to store StreetCred as an object (Values: factions, districts, key community figures).
*   **Task 2.1.2:** Design and implement logic for "Street Etiquette" sub-system (dialogue choice impacts, action breaches).
*   **Task 2.1.3:** Implement tracking mechanism for "Street Etiquette" violations or tie to dialogue payloads.
*   **Task 2.1.4:** Update `CustomerManager.js` / `Script.js` for StreetCred modifications based on actions, quests, dialogue.
*   **Task 2.1.5:** Create/modify data files for StreetCred thresholds, rewards, consequences, etiquette rules, community figure metrics.
*   **Task 2.1.6:** Design and implement UI for displaying StreetCred changes and standings.
*   **Task 2.1.7:** Design and implement subtle UI/UX feedback for etiquette breaches (facial expressions, sounds, dialogue lines).
*   **Task 2.1.8:** Integrate StreetCred impacts with key community figures ("Mama Carter," "Pastor Jones").

### 2.2 Loyalty System Implementation
*   **Task 2.2.1:** Modify `GameState.js` to track loyalty with specific NPCs/Contacts.
*   **Task 2.2.2:** Implement logic for loyalty shifts based on major NPC life changes (e.g., customer entering recovery).
*   **Task 2.2.3:** Implement functions in `CustomerManager.js` / `Script.js` to modify loyalty and gate interactions.
*   **Task 2.2.4:** Design and implement nuanced dialogue options based on loyalty tiers (e.g., "chat" options).
*   **Task 2.2.5:** Create/modify data files for loyalty thresholds, benefits/consequences, and dialogue variations.
*   **Task 2.2.6:** Integrate loyalty impacts on NPC behavior (e.g., personal stories, interventions, betrayal, rumor spreading).

### 2.3 Deepening Consequences
*   **Task 2.3.1:** Modify `GameState.js` to add flags/variables for significant choices, world states, aggregate statistics (e.g., total hard drugs sold).
*   **Task 2.3.2:** Design and implement "Consequence Loops" (e.g., drug sales -> city despair -> police raids).
*   **Task 2.3.3:** Design and implement "Funny Fails" and absurd setbacks based on choices.
*   **Task 2.3.4:** Design and implement "Illusion of Choice" scenarios with significant downsides for all options.
*   **Task 2.3.5:** Develop logic in `Script.js` / `WorldEventManager.js` to check flags and trigger systemic consequences.
*   **Task 2.3.6:** Create/modify data files to define humorous, systemic, and ripple-effect consequences.
*   **Task 2.3.7:** Design and implement UI/UX for communicating consequences (news, dialogue, environment, Rikk's monologue).

### 2.4 Mechanical Item Effects
*   **Task 2.4.1:** Restructure item data files (`data_items.js`) to support new effect categories and fields.
*   **Task 2.4.2:** Design and implement Utility & Stat-Based item effects (StreetCred gain gear, reaction consumables, tools).
*   **Task 2.4.3:** Design and implement "High Thoughts" experiential effect (dialogue triggers, mood impacts).
*   **Task 2.4.4:** Design and implement "Munchies" experiential effect (side-objectives, deal impacts).
*   **Task 2.4.5:** Design and implement "Observable Quirks/Stims" effect (dialogue allusions, minor mechanical +/-).
*   **Task 2.4.6:** Design and implement "Item Provenance/History" effect (flavor text links, event connections).
*   **Task 2.4.7:** Implement logic in `Script.js` / `PlayerManager.js` / `CustomerManager.js` for the item effect system.
*   **Task 2.4.8:** Add new fields to `data_items.js` for experiential effects (`triggersHighThought`, `munchiesDemand`).
*   **Task 2.4.9:** Design and implement UI/UX for displaying item effects, especially experiential ones (dialogue, notifications).

### 2.5 World Event System Sophistication
*   **Task 2.5.1:** Design and implement systemic & thematic events (Recession, Rehab Funding Cut, Price War, Supplier Arrest).
*   **Task 2.5.2:** Design and implement humorous & absurd events (Lost Circus Animal, Bizarre Street Trend).
*   **Task 2.5.3:** Modify `data_events.js` to define a wider variety of events with systemic triggers/effects and humor.
*   **Task 2.5.4:** Ensure event triggers can be tied to aggregated player actions or narrative flags.
*   **Task 2.5.5:** Enhance `WorldEventManager.js` to handle new event types and triggers.
*   **Task 2.5.6:** Design and implement UI/UX for communicating world events (News, dialogue, visual cues, customer needs changes).

### 2.6 Skill Progression System Refinement
*   **Task 2.6.1:** Review and ensure clear benefits for existing skills (`negotiator`, `appraiser`, `lowProfile`) as per `STORY_BREAKDOWN.MD`.
*   **Task 2.6.2:** Design and implement new skills (Persuasion, Stealth).
*   **Task 2.6.3:** Design and implement "Slang Proficiency" skill/sub-skill.
*   **Task 2.6.4:** Modify `GameState.js` to store new/refined skill structures.
*   **Task 2.6.5:** Update `Script.js` / `PlayerManager.js` for new skill XP logic and effect application.
*   **Task 2.6.6:** Create/modify data files for new skill definitions, progression, and benefits.
*   **Task 2.6.7:** Design and implement a dedicated "Skills" tab/section in the phone UI (descriptions, point assignment).

## 3. New Feature Integrations - Phone Applications

Detailed tasks for implementing new phone applications.

### 3.1 Functional 'Contacts' App
*   **Task 3.1.1:** Update Contacts App vision: proactive hustler tool.
*   **Task 3.1.2:** Implement display of detailed contact notes (e.g., "Reliable but pricey").
*   **Task 3.1.3:** Deepen integration with StreetCred (unlocks) and Loyalty (service quality).
*   **Task 3.1.4:** Design and implement Contact Acquisition methods (StreetCred milestones, loyal customers, informants, events).
*   **Task 3.1.5:** Design and implement Contact Archetypes & Services:
    *   Suppliers (bulk goods, delivery times, seizure risk).
    *   Info Brokers (Heat reports, rival intel, tip-offs).
    *   Service Providers (Heat reduction, lawyer services).
    *   Mission/Job Providers (dead drops, acquisitions, intimidation).
*   **Task 3.1.6:** Enhance UI/UX to display contact specialties and risks clearly.
*   **Task 3.1.7:** Create `contacts_data.json` with fields for services, dialogue, mission links, loyalty, StreetCred reqs.
*   **Task 3.1.8:** Enhance `ContactsManager.js` for managing interactions, mission states.

### 3.2 Functional 'Map' App
*   **Task 3.2.1:** Update Map App vision: strategic location decisions.
*   **Task 3.2.2:** Implement distinct districts with unique characteristics (customer archetypes, item availability/demand, base Heat) based on `STORY_BREAKDOWN.MD`.
*   **Task 3.2.3:** Implement display of player's conceptual current location/operational area.
*   **Task 3.2.4:** Design and implement dynamic "District `Heat`" levels (visualization, influence by Rikk's actions, events).
*   **Task 3.2.5:** Design and implement Meeting Spots for missions/contacts (conceptual travel, time/risk).
*   **Task 3.2.6:** Re-evaluate fast travel option.
*   **Task 3.2.7:** Enhance UI/UX to effectively communicate district characteristics and `Heat` levels.
*   **Task 3.2.8:** Create `map_data.json` with fields for district characteristics, ambient `Heat` modifier.
*   **Task 3.2.9:** Enhance `MapManager.js` for `Heat` visualization and travel mechanics.
*   **Task 3.2.10:** Modify `GameState.js` to store current `Heat` levels for each district.
*   **Task 3.2.11:** Implement logic in `Script.js` to update district `Heat` based on Rikk's actions.

### 3.3 Functional 'News' App
*   **Task 3.3.1:** Update News App vision: reflect player actions (successes/failures), provide opportunities, foreshadow.
*   **Task 3.3.2:** Implement news content reflecting direct consequences of Rikk's actions (even if not caught, e.g., overdose spike, rival arrest from tip).
*   **Task 3.3.3:** Implement news content reflecting changes in city `Heat`/Despair levels.
*   **Task 3.3.4:** Implement news items that foreshadow future `World Events` or challenges.
*   **Task 3.3.5:** Implement "Dopey" podcast-style humorous/cautionary tales.
*   **Task 3.3.6:** Create `news_articles.json` with templates supporting complex trigger conditions (actions, stats, event combos).
*   **Task 3.3.7:** Enhance `NewsManager.js` with robust logic to check `GameState` for relevant news triggers.
*   **Task 3.3.8:** Ensure `ContactsManager.js` can send flags/updates to `NewsManager.js`.

## 4. Narrative & Thematic Deepening

Detailed tasks for enriching the game's story and themes.

### 4.1 Integrating 'The Message' (Thematic Core)
*   **Task 4.1.1:** Refine Goals & Approach: Weave systemic failure, addiction, human cost themes into core loop.
*   **Task 4.1.2:** Enhance `DESPERATE_FIEND` and vulnerable customer archetypes (dialogue, item requests, addiction progression) as reflections.
*   **Task 4.1.3:** Implement choices for Rikk in interacting with these archetypes (exploit, kindness, refusal) and their consequences.
*   **Task 4.1.4:** Introduce `World Events` as systemic commentary (Overdose Spike, Halfway House Funding Cut, Police Crackdown on Users).
*   **Task 4.1.5:** Design and implement "Moments of Choice & Helplessness" scenarios confronting Rikk with critical customer states.
*   **Task 4.1.6:** Implement subtle information gathering mechanics (News, dialogue, Contact intel) for broader understanding.
*   **Task 4.1.7:** Implement rare Rikk's Internal Monologue pop-ups after resonant interactions.
*   **Task 4.1.8:** Update `QuestManager.js` / `StoryManager.js` to track flags for thematically relevant choices, influencing future events/interactions (not a single quest line).

### 4.2 Enhancing Impact of Unseen Antagonists & Allies
*   **Task 4.2.1:** Implement Law Enforcement presence beyond `Heat` score (wary dialogue, patrol reports, specific `World Events` like "Corrupt Officer Purge").
*   **Task 4.2.2:** Implement Rival Dealers/Crews presence (market fluctuations, customer comments, Contact warnings, missions to undermine rivals).
*   **Task 4.2.3:** Implement Supplier impact via Contacts App (reliability, price changes, stock shortages).
*   **Task 4.2.4:** Implement Community Figures ("Mama Carter," "Pastor Jones") impact (approval/disapproval tracked, localized `World Events`, unique non-transactional missions).
*   **Task 4.2.5:** Develop/Update `WorldEventManager.js` / `FactionManager.js` (conceptual) to simulate background influence and track standings.
*   **Task 4.2.6:** Create/modify data files (`factions.json`) for unseen forces, motivations, actions, reactions to Rikk.

### 4.3 Implementing Meaningful Endings/Win Conditions
*   **Task 4.3.1:** Design and implement "The Escape Artist" ending conditions and narrative.
*   **Task 4.3.2:** Design and implement "The Street King/Queen" ending conditions and narrative.
*   **Task 4.3.3:** Design and implement "The Community Pillar" (New Thematic Ending) conditions and narrative.
*   **Task 4.3.4:** Design and implement "The Informant's Bargain" (New Thematic Ending) conditions and narrative.
*   **Task 4.3.5:** Design and implement Tragic/Downfall Endings:
    *   "The Burnout" (high-risk choices, addiction, alienation).
    *   "Betrayed" (low loyalty with key contacts).
*   **Task 4.3.6:** Modify `GameState.js` to track all necessary flags for these endings.
*   **Task 4.3.7:** Implement logic in `Script.js` / `GameManager.js` to check for ending conditions.
*   **Task 4.3.8:** Design quest/story choices to clearly contribute towards specific ending conditions.

## 5. UI/UX Thematic Alignment Enhancements

Detailed tasks for improving UI/UX immersion and thematic consistency.

### 5.1 Diegetic Redesign of Core Phone Interface & Apps
*   **Task 5.1.1:** Implement overall phone aesthetic changes (visual wear & tear, customizable wallpapers, gritty fonts/colors).
*   **Task 5.1.2:** Implement Contacts App diegetic deepening (user-editable notes, text/brief call feel, slang).
*   **Task 5.1.3:** Implement Stash App (Inventory) redesign (hidden bag/box feel, gritty icons, visual space constraint).
*   **Task 5.1.4:** Implement Map App redesign (out-of-date map style, digital annotations).
*   **Task 5.1.5:** Implement News App redesign (local/underground feed feel, social media/rumor style).
*   **Task 5.1.6:** Focus UI Development on visual styling, interaction patterns, minor sound design (notifications, clicks).
*   **Task 5.1.7:** Create new UI assets (icons, backgrounds, fonts, damage overlays).

### 5.2 SlotGame & Other Minigames Thematic Integration
*   **Task 5.2.1:** Re-skin existing SlotGame (visuals, sounds, symbols matching game universe).
*   **Task 5.2.2:** Implement contextual availability for SlotGame (specific locations/unlocks).
*   **Task 5.2.3:** Add narrative framing for SlotGame.
*   **Task 5.2.4:** Design and implement "Supply Scramble" (QTE minigame).
*   **Task 5.2.5:** Design and implement "Haggle Master" (Dialogue-Tree Minigame).
*   **Task 5.2.6:** Design and implement "Spot the Snitch/Undercover" (Observation Minigame).
*   **Task 5.2.7:** Develop dedicated logic modules for new minigames, integrated with `Script.js`.

### 5.3 Dynamic Visual Feedback for Game State & Events
*   **Task 5.3.1:** Implement CSS effects for `Heat` (screen glitches, warning icons, reddish tint, frantic messages).
*   **Task 5.3.2:** Implement CSS effects for `Cash` (satisfying gain visuals, empty wallet cues).
*   **Task 5.3.3:** Design and implement visual cues for Rikk's "Stress" or "Health" (screen flicker, battery drain, blurred vision - if mechanic exists).
*   **Task 5.3.4:** Implement visual phone damage mechanics (cracked screen, flickering) after negative events, with potential minor gameplay impact.
*   **Task 5.3.5:** Implement `World Event` visual cues on phone (background changes, app icon badges).
*   **Task 5.3.6:** Implement subtle customer mood/status cues (avatar expression changes, text bubble color changes).
*   **Task 5.3.7:** Modify `GameState.js` to track phone damage state, Rikk's stress/health (if implemented).
*   **Task 5.3.8:** Update `UIManager.js` and CSS for these dynamic effects.

## 6. Technical Considerations

The technical considerations outlined in `Enhancement_Roadmap.md` (Section 6) will be adhered to throughout the project. This includes focusing on the updated Prioritization Strategy, managing Data Structure Modifications carefully, addressing Save/Load Impacts and ensuring Modularity, implementing a robust Testing Strategy (including new test cases for all added mechanics and content), and being mindful of Performance Considerations. New technical considerations such as advanced customer AI, a robust narrative flag system, and a minigame integration framework will be developed as needed.

## 7. Conclusion

This Detailed Project Plan provides a roadmap for the significant enhancement of [Game Name]. By following the phased approach and diligently executing the tasks outlined for each section, the development team will create a more dynamic, immersive, and thematically rich experience for players. Flexibility, iterative development, and continuous testing will be key to successfully realizing the vision laid out in this plan and the preceding roadmap documents.
