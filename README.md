# [my nigha ricc]

Yo, listen up. This ain't no fairytale. This is 'bout that life. The grit, the grind, the come-up. You're out here navigatin' a world of hustlers, fiends, and every shade in between. They ain't just 'customers'; they're your network, your headaches, your bread and butter. It's 'bout trustin' your gut, movin' your product, and makin' sure you ain't the one gettin' played. 'Cause out here, every move is a gamble, and the streets? They don't pick favorites.

The whole damn thing is orchestrated by a piece of code called `CustomerManager` – that’s your main connect, the plug for every new face, every new problem, every opportunity. It’s all built on 'templates' – think of 'em as profiles, the DNA of the hitters and schemers you're gonna be dealin' with. You wanna add a new player to the game, a new type of score? That's your starting block. This README? This is your survival guide, your map to the underbelly, showin' you how to wire things up your way. Keep it tight, 'cause loose talk costs more than money around here. We speak in code, and only the real ones catch the drift. You feel me?
## Gettin' Set Up: The Lab

So you wanna get under the hood, huh? Tinker with the works? Aight, here’s the lowdown on gettin' this thing runnin' on your own machine. No fancy footwork needed, just the basics.

1.  **Snatch the Code:** First thing’s first, you gotta grab the source. Clone it, download it, whatever your style. Get it on your box.
2.  **Browser Up:** Make sure you got a decent web browser. Chrome, Firefox, one of them new joints. This ain't 1999.
3.  **Kick It Off:** Find that `index.html` file in the main folder. Pop that open in your browser. Boom, you're in.

That’s it. No complicated setups, no installin' a million things. This ain't that kinda party. Just pure, raw code ready to go. If you can open a webpage, you can run this hustle.
## Cookin' Up New Clientele: The Who's Who of the Streets

Wanna add some new faces to your hustle? Fresh blood to deal with, or maybe some new drama to stir the pot? This is where you learn to craft 'em. Every character archetype, every type of mark, fiend, or high roller, lives in the `data/customer_templates.js` file. That's the black book. The `CustomerManager` (you'll find its code in `classes/CustomerManager.js`) is the brains that takes these profiles and brings 'em to life, makin' sure the encounters pop off right.

### Anatomy of a Street Figure: Customer Archetype Structure

So, each player on the street you cook up? They're an object in the `customerTemplates` in that `customer_templates.js` file. Here's the lowdown on their stats and papers:

*   **`key` (String):** Their street name, basically. A unique tag the `CustomerManager` uses to know who's who. Keep it `UPPER_SNAKE_CASE`, like a proper code name.
    *   *Example:* `"LOWRIDER_LENNY"`
*   **`baseName` (String):** What they go by on the street before the system tacks on a number. Like their crew name or a handle.
    *   *Example:* `"Jittery Jerry"`
*   **`avatarUrl` (String):** Mugshot. Link to their face. Use somethin' like `https://randomuser.me/api/portraits/` if you ain't got your own rogues' gallery. Or better yet, get some custom art that fits the vibe.
    *   *Example:* `"https://randomuser.me/api/portraits/men/32.jpg"`
*   **`baseStats` (Object):** Their starting stats. How they roll when they first show up.
    *   `mood` (String): How they feelin' default? `"chill"`, `"desperate"`, `"paranoid"`, `"arrogant"`? This dictates how they talk and act.
    *   `loyalty` (Number): How much they ride for you, from the jump.
    *   `patience` (Number): How long before they bounce or flip out.
    *   `relationship` (Number): Your starting rep with them.
*   **`gameplayConfig` (Object):** This is the real meat. How they play the game, what they're about.
    *   `buyPreference` (Object): What kinda product are they lookin' to score off you?
        *   Specify by `type` (like `"DRUG"`), `subType`, `quality` (0 for trash, 2 for top-shelf), `minQuality`, `maxQuality`, `minBaseValue`, or even a specific `id` if it's unique.
        *   Use `exclude` if there's stuff they won't touch.
        *   `or` lets you give 'em a shopping list with options: `[{ "type": "WEAPON" }, { "id": "burner_phone" }]`.
    *   `sellPreference` (Object): What they tryna offload on you? Same kinda rules as `buyPreference`. Can throw in a `chance` to see if they even got it.
        *   *Example:* `{ "type": "STOLEN_GOOD", "quality": 0, "chance": 0.7 }` (70% chance they offer you some low-grade stolen merch).
    *   `priceToleranceFactor` (Number): How much they willing to bend on price. Under 1, they're a cheapskate or a hard bargainer. Over 1, they might be flush or a sucker. Think of it like how much they'll overpay or undercharge.
        *   *Example:* `0.8` (They'll try to get it for 80% of its worth, or sell to you for 120%).
    *   `negotiationResists` (Boolean): `true` if they ain't about that haggle life. Some folks just ain't built for back-and-forth.
    *   `heatImpact` (Number): How much attention this character brings. High numbers mean more heat from the 5-0.
    *   `credImpactSell` (Number): Your street cred change when you sell *to* them. Some deals boost your rep, others might make you look like a chump.
    *   `credImpactBuy` (Number): Your cred change when you buy *from* them.
    *   `preferredDrugSubTypes` (Array of Strings, Optional): If they mess with `"DRUG"` type items, what's their poison? (e.g. `["OPIATE", "STIMULANT"]`). This helps 'em ask for what they really want.
    *   `sellsOnly` (Boolean, Optional): `true` if they *only* sling, never score. They're suppliers, not users.
    *   `itemPool` (Array of Strings, Optional): If they're `sellsOnly` or you wanna limit what they might have, list the item `id`s here. This is their stash.

### How They Talk: Dialogue Structure

The `dialogue` object is where you give your character a voice. Each key in here is a situation, a trigger for a certain type of chat. This is how you make 'em sound like they're really from the streets, not some stiff.

*   **Context Keys (e.g., `greeting`, `rikkBuysSuccess`):** Each one of these holds an array of dialogue blocks. It's like a script for different scenes in the hustle.
*   **Dialogue Blocks (Array of Objects):** The game picks one of these when the context hits. Keeps it fresh, so they ain't soundin' like a broken record.
    *   `conditions` (Array of Objects, Optional): The setup. What needs to be true for them to say this line?
        *   `stat` (String): What part of their sheet are we checkin'? `"mood"`, `"loyalty"`, maybe somethin' nested like `"addictionStatus.isAddicted"`.
        *   `op` (String): How we comparin' it? `"is"`, `"isNot"`, `"gt"` (greater than), `"lte"` (less than or equal to), etc.
        *   `value`: The thing we're checkin' against.
        *   No `conditions`? That's the default line if nothin' else fits, the go-to script.
    *   `lines` (Array of Strings): The actual words comin' outta their mouth. Game picks one at random if the conditions are met. Keep it authentic, use that street slang we talked about.
        *   **Placeholders:** These get filled in with game info:
            *   `[CUSTOMER_NAME]`: Their generated street name, so it feels personal.
            *   `[ITEM_NAME]`: The item they're talkin' 'bout, keeps it relevant.
    *   `payload` (Object, Optional): Wanna make somethin' happen when they say this? This is where you trigger game effects, like a rival showing up or a deal going south.
        *   *Example:* `{ "type": "EFFECT", "effects": [{"type": "triggerEvent", "eventName": "police_raid", "chance": 0.1}] }` (10% chance this line calls the cops, so watch what you make 'em say!)

### Makin' a New Street Legend: Step-by-Step

Alright, so you wanna add a new player to the game? Here's the rundown, keep it on the low:

1.  **Hit Up `data/customer_templates.js`:** This is where all the profiles are stashed. Your little black book of characters.
2.  **Jack a Template (Smart Play):** Don't start from scratch unless you're a masochist. Find a character kinda like the one you're picturing, copy their whole section. `REGULAR_JOE` is a decent base if you're stuck.
3.  **Give 'Em a Tag (`key`):** This is their unique ID, how the game knows 'em. Make it `UPPER_SNAKE_CASE`, like `BIG_SPENDER_TONY`.
4.  **Set Their Street Creds:**
    *   `baseName`: What everyone calls 'em, e.g., `"Tony Two-Times"`.
    *   `avatarUrl`: Their face. Find a pic or make one.
5.  **Define Their Vibe (`baseStats`):** What's their starting `mood`? How `loyal` are they? How much `patience` they got before they walk? What's your `relationship` with them from the jump?
6.  **Lay Out Their Hustle (`gameplayConfig`):** This is how they operate.
    *   What do they buy (`buyPreference`)? What do they sell (`sellPreference`)? What kinda quality they lookin' for or pushin'?
    *   How loose are they with cash (`priceToleranceFactor`)? Do they haggle, or is it take-it-or-leave-it (`negotiationResists`)?
    *   How much heat they bring (`heatImpact`)? How do they mess with your rep (`credImpactSell`, `credImpactBuy`)?
    *   If they only sling product, set `sellsOnly: true` and list what's in their `itemPool`.
7.  **Script Their Lines (Make 'Em Real):** This is where you give 'em soul.
    *   Go through all the `dialogue` situations (`greeting`, what happens when you buy, when you sell, when you piss 'em off, etc.).
    *   Write lines that sound like *them*. Use the slang, the attitude. Make 'em feel like real people you'd meet on the block.
    *   Use `conditions` so they react to shit. A paranoid cat ain't gonna greet you the same as some chill dude.
    *   Remember `[CUSTOMER_NAME]` and `[ITEM_NAME]` to make it personal.
    *   If their words got consequences, use `payload` to trigger game events.
8.  **Add 'Em to the Roster:** Slot your new character into the `customerTemplates` object. Make sure you put a comma after the last character if you're adding to the end.

### Example: Sketchin' Out 'Whisper' - The Info Broker


Say you need a character who deals in secrets, not just stuff. Here's a quick look at how you might start 'Whisper':

```javascript
// Inside data/customer_templates.js, within the customerTemplates object:

"WHISPER_THE_INFORMANT": {
    "key": "WHISPER_THE_INFORMANT",
    "baseName": "Whisper",
    "avatarUrl": "path/to/your/image_of_a_shady_looking_person.png", // Get a good pic
    "baseStats": {
        "mood": "cautious",
        "loyalty": 0, // Trust is earned, not given
        "patience": 4,
        "relationship": 0
    },
    "gameplayConfig": {
        "sellsOnly": true, // Whisper only sells info
        "itemPool": ["info_rival_gang_plans", "info_cop_patrol_routes", "info_hidden_stash"], // What kind of intel?
        "priceToleranceFactor": 1.5, // Info ain't cheap
        "negotiationResists": true, // Price is the price
        "heatImpact": -1, // Good info can lower heat
        "credImpactSell": 0, // No cred change for buying info
        "credImpactBuy": 3 // Selling info to Whisper? That's a power move, boosts cred.
    },
    "dialogue": {
        "greeting": [
            {
                "conditions": [],
                "lines": [
                    "They say you're Rikk. I hear things. Things you might wanna know. For a price, of course.",
                    "Word on the street is you're looking for an edge, [CUSTOMER_NAME]. I got whispers that can turn into shouts... if your pockets are deep enough."
                ]
            }
        ],
        "rikkCannotAfford": [
            {
                "conditions": [],
                "lines": [
                    "My information ain't free, Rikk. Come back when you're serious.",
                    "Looks like your pockets are light. This kind of intel? It costs."
                ]
            }
        ],
        "rikkBuysSuccess": [ // This is when Rikk BUYS from Whisper (buys info)
            {
                "conditions": [],
                "lines": [
                    "Pleasure doin' business, Rikk. Use that wisely. And remember where you got it.",
                    "There you go. Don't say I never did nothin' for ya. Now, we never had this conversation."
                ],
                "payload": { "type": "EFFECT", "effects": [{"type": "revealSecret", "secretId": "some_game_secret"}] }
            }
        ],
        // ... Add more dialogue: rikkDeclinesToBuy, generalBanter specific to an informant, etc.
        // Think about how an informant would react in different situations.
        "customerHasNothingToSell": [ // This context is for when the CUSTOMER tries to sell to Rikk. For a sellsOnly character, this might not be used much, but good to have.
             {
                "conditions": [],
                "lines": [
                    "I'm the one with the info, Rikk. You got somethin' for me instead?"
                ]
            }
        ]
    }
}, // Don't forget that comma!

```

### Street Smarts for Cookin' Up Characters:

*   **Run Your Game:** Once you got a basic version, see how they play out. Does their talk match their game? Tweak their lines and `gameplayConfig` 'til it's tight.
*   **Keep it Fresh:** Don't have 'em all soundin' like clones. Different slang, different attitudes. More lines means they ain't repeating themselves like a stuck record.
*   **Make 'Em React:** Use them `conditions` to make 'em smart. A paranoid cat ain't gonna greet you the same as some happy-go-lucky type. They should react to their `mood`, how tight you are with them (`relationship`), all that.
*   **Learn From the OG's:** Peep `customer_templates.js`. That's your bible. See how the other characters are built – the fiends, the ballers, the everyday joes. Get a feel for their dialogue, their setups.
*   **Tag 'Em Right:** `[CUSTOMER_NAME]` and `[ITEM_NAME]` – use these tags in the dialogue so it fits who they are and what you're slingin'.
*   **Stay True to the Character:** Their words, their stats, how they roll – it all needs to tell the same story. A shy dude shouldn't be talkin' like a shot-caller.
*   **Cover Your Angles:** What if you're broke? What if your stash is empty? Make sure your new character knows what to say when shit hits the fan or when there's nothin' doin'.
## Pimpin' Your Ride: CSS & Styling

Alright, so you wanna change how this whole joint looks? Give it your own flavor, that custom paint job? That's all handled by CSS, found in the `assets/css/` folder. If you wanna make this game look slick, or grimy, or whatever your style is, this is where you get your hands dirty.

### Where the Style Sheets Live (CSS File Organization)

*   **`variables.css`**: This is your main connect for colors, fonts, how far apart things are – all that basic style DNA. Change somethin' here, and it can change the whole look. Smart, right?
*   **`base.css`**: This lays down the law for the basic look of things. Think of it as the primer coat before you get fancy.
*   **`layout.css`**: This one's about how the main parts of the screen are set up – where shit goes, basically.
*   **`components.css`**: Got buttons, pop-up boxes, little bits and pieces you see all over? Their style rules are probably in here.
*   **Specific Joints:**
    *   `main_menu.css`: For that first screen everyone sees.
    *   `phone.css`: For tweakin' how that burner phone interface looks.
    *   `hud.css`: All the on-screen info, health bars, cash display – that's here.
    *   `apps.css`: Potentially for specific "app" like features within the game.
    *   `settings_ui.css`: Styles for the settings menu.

### How to Spray Paint Your Changes (Making Style Changes)

1.  **Spot Your Target:** What you tryna change the look of? A button? A whole screen?
2.  **Scope it Out:** Use your browser's dev tools (usually F12, then 'Inspect Element') to see what CSS is already hittin' that spot. It'll tell you the files and line numbers.
3.  **Tweak Existing Gear:**
    *   Most of the time, you'll be jumpin' into one of the files listed above. If it's a button, check `components.css`. If it's the phone, `phone.css`. You get the picture.
    *   **Rule #1: Use the variables from `variables.css` first!** Wanna change a color? See if there's a variable for it. Keeps everything lookin' like it belongs together. Like `var(--main-text-color)` or somethin'.
4.  **Addin' New Flash:**
    *   Got a whole new piece of the UI? If it's somethin' you'll use in a few places, drop its style rules into `components.css`.
    *   If it's a big new part of the game, maybe it needs its own CSS file in `assets/css/` directory. If you do that, don't forget to link it up in the main `index.html` so the browser knows where to find it.
5.  **Keep it Clean, Not Cluttered:** Don't go too crazy with selectors that are a mile long. Make 'em specific enough to hit your target, but if it's a reusable part, keep it general enough to reuse. Check how the OGs did it and try to match the style.

### Pro Tips for a Smooth Paint Job (Tips for CSS)

*   **Variables Are Your Best Friend:** Seriously, use `variables.css`. It's like havin' a master color palette. Change it there, changes everywhere. Easy money.
*   **Don't Get Too Wild with Selectors:** Keep 'em simple enough to understand. If you gotta write a novel to target one button, you're doin' it wrong.
*   **Dev Tools Are Your X-Ray Specs:** Use 'em. Constantly. See what's happenin', test changes on the fly before you even save the file.
*   **Think About All Screens (If That's Your Hustle):** If this game's gotta look good on a phone and a big screen, keep that in mind. That's called responsive design, make sure your changes don't break it on other sizes.
## Wanna Pitch In? (Contributing)

So you think you got what it takes to add to the hustle, huh? You wanna make this game even realer? Aight, here's the lowdown on how to slide in your mods and new ideas without messing up the whole operation.

**The Basic Flow:**

1.  **Fork It Like It's Hot:** First, you gotta fork the main repo. That's like getting your own corner to work on, separate from the main turf.
2.  **Branch Out:** Don't just start slingin' code in your main fork. Create a new branch for every new feature, customer, or fix you're cookin' up. Name it something that makes sense, like `new-customer-slim-jim` or `fix-map-glitch`. Keeps things clean, see?
3.  **Do Your Thing:** This is where you drop your genius. Write that code, design that customer, fix that bug. Make sure it's tight.
4.  **Test Your Product:** Before you push it out, make sure your stuff works. Don't be that person who breaks the game for everyone else. If you added a new customer, for example, make sure their dialogue flows and their deals make sense.
5.  **Push It to Your Fork:** Get your changes saved up on your fork on GitHub.
6.  **Holler with a Pull Request (PR):** When your work is solid, send a Pull Request from your branch to the main project's `main` branch (or whatever the primary branch is). This is you tellin' the OGs, "Yo, check out this fire I cooked up!"
7.  **Explain Yourself:** In your PR, break down what you did, why you did it, and how it makes the game better. If you're closin' an issue someone else reported, mention that too. The clearer you are, the faster your stuff might get merged.
8.  **Stay Frosty for Feedback:** Someone might have questions or ask you to tweak a few things. That's cool, it's part of the game. Work with them, make the changes, and keep it movin'.

**A Few Extra Tips from the Streets:**

*   **Keep it Clean:** Write code that others can understand. Comment your stuff if it's complicated. No one likes tryin' to decipher spaghetti code.
*   **Update the Docs (Yeah, This README!):** If you add something big, like a new way customers work or a new system, give a shout in here or other docs. Help the next hustler understand your genius.
*   **Small Hustles are Good:** Don't try to change the whole world in one PR. Smaller, focused changes are easier to review and get in.
*   **Respect the Hustle:** This project's got its own flow. Peep how things are done before you jump in. Match the style, match the vibe.

Stick to these rules, and you'll be a valuable player in this game. We're all tryna make something dope, so let's keep it smooth.
