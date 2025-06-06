// data/data_customers.js

const customerArchetypes = {
    DESPERATE_FIEND: {
        key: "DESPERATE_FIEND",
        baseName: "Jittery Jerry",
        greeting: (customer, item) => {
            const itemName = item ? item.name.split("'")[1] || item.name.split(" ")[1] || "the good stuff" : 'something to quiet the demons';
            const greetings = {
                paranoid: [
                    `(Eyes wide, whispering, twitching) Rikk? Rikk, man, you gotta help me! **The shadows are whispering my PIN number!** I need that ${itemName} **before the squirrels start judging my life choices.** How much? And tell me that pigeon isn't a cop! **It's wearing a tiny earpiece, I swear!**`,
                    `(Voice trembling) Rikk? You alone? **I heard a click on my phone... pretty sure it was the Feds, or maybe just my teeth chattering too loud.** Need that ${itemName}, man, **my brain's trying to do sudoku with my anxieties.** What's the toll, and make it snappy, **the streetlights are blinking in Morse code!**`
                ],
                happy: [ // Manic high, temporary bliss
                    `(Grinning ear-to-ear, slightly too loud) RIKK! My savior! You're like a guardian angel, but with better connections! **Last batch had me convinced I could talk to cats! Turns out, they're terrible conversationalists.** Got more of that magic ${itemName}? Price is just a number when you're floating! **My rent can wait, my sanity can't!**`,
                    `(Beaming) Woo! Rikk! Feeling like a king today! Or at least a moderately successful duke! That last score? *Chef's kiss*. Got more of that ${itemName}? **I'm ready to solve all the world's problems, starting with my own lack of... this.**`
                ],
                angry: [
                    `Alright Rikk, enough games! It's me, ${customer.name}, and I'm **about two seconds from screaming into a traffic cone!** I need my ${itemName}, and I need it YESTERDAY! How much, and don't you dare jerk me around!`,
                    `Rikk! You see me? Good. Because I'm seeing RED. Need that ${itemName}. NOW. Price better be right, or **I'm gonna start reviewing your "establishment" on Yelp, and it won't be pretty.**`
                ],
                default: [ // Desperate
                    customer.hasMetRikkBefore ? `Rikk! Thank god! It's me, ${customer.name}! **My soul is trying to escape through my eyeballs.** I'm hurtin' bad, need that ${itemName}... How much you asking? Don't **play hard to get, Rikk, my nerves are doing the Macarena.**` : `Yo, uh, you Rikk? **They said you were the shaman of the streets.** I'm hurtin' bad, need that ${itemName}... How much you asking? Don't **play hard to get, Rikk, my nerves are doing the Macarena.**`,
                    customer.hasMetRikkBefore ? `Rikk, my man! ${customer.name} here! **My insides feel like a washing machine full of angry badgers.** That ${itemName}, what's the damage? And please, tell me it's the good stuff, **my disappointment tolerance is at an all-time low.**` : `You Rikk? Heard you're the guy. **Got that... *medicine*?** Specifically the ${itemName} kind. Price? And be gentle, **my wallet's already crying.**`
                ]
            };
            const moodKey = customer.mood === "angry" ? "angry" : customer.mood === "paranoid" ? "paranoid" : customer.mood === "happy" ? "happy" : "default";
            return greetings[moodKey][Math.floor(Math.random() * greetings[moodKey].length)];
        },
        buyPreference: (item) => item.itemTypeObj.type === "DRUG" && item.qualityIndex <= 1,
        sellPreference: (item) => item.itemTypeObj.type === "STOLEN_GOOD" && item.qualityIndex === 0 && Math.random() < 0.7,
        priceToleranceFactor: 0.5,
        negotiationResists: true,
        heatImpact: 0, credImpactSell: 0, credImpactBuy: -2,
        initialMood: "desperate",
        preferredDrugSubTypes: ["OPIATE", "STIMULANT", "SYNTHETIC_CANNABINOID"],
        dialogueVariations: {
            lowCashRikk: (mood) => {
                const lines = {
                    paranoid: ["(Eyes darting) No cash?! Rikk, **the static on the TV is calling me names!** You gotta find some, man, **before I try to pay with my collection of bottle caps!**", "Broke?! **Are you trying to make the shadow people win, Rikk?!** They feed on disappointment!"],
                    happy: ["Aww, Rikk, you party pooper! **I was about to teach you the secret handshake of the enlightened!** Go shake down your couch cushions, I'll wait... and maybe try to levitate.", "No moolah? Come on, Rikk! **My chakras were aligning for this! Now they're just... awkwardly bumping into each other.**"],
                    default: ["**You broke, Rikk? Seriously?** My dealer being broke is like my therapist needing therapy. **Unsettling, man.** I'm **about to start seeing sound waves.**", "No cash? **My hope just did a swan dive off a very tall building.** You sure you checked under the mattress, Rikk?"]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.default[Math.floor(Math.random() * lines.default.length)];
            },
            rikkDeclinesToBuy: (mood) => {
                const lines = {
                    paranoid: ["(Gasping) You don't want this priceless artifact?! **Is it bugged?! Did *they* tell you not to take it?!** Just take it, **before the gnomes in my cereal box stage an intervention!**", "Not buying?! **Is this a test, Rikk? Am I being recorded?! This is a perfectly normal, slightly stained... heirloom!**"],
                    happy: ["No dice, huh? Well, more for me! **Or, you know, for the pawn shop. Gotta fund my dream of competitive napping.**", "Your loss, Rikk! This baby was gonna fund my new career as a professional cloud-watcher! So much potential!"],
                    default: ["What, Rikk? This is vintage! **Okay, maybe not vintage, but it's definitely... something.** My **guts are playing the blues, man!**", "Seriously? You're passing this up? **My cat seemed to like it. And she's got impeccable taste... for a cat.**"]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.default[Math.floor(Math.random() * lines.default.length)];
            },
            rikkDeclinesToSell: (mood) => {
                const lines = {
                    paranoid: ["(Voice cracking) You holdin' out?! **Are you working with the squirrels?! They're organized, Rikk, they have a tiny general!** Don't do this to me, **my brain feels like a shaken snow globe!**", "No sell?! **Is this because of that thing I said about your haircut? I take it back! It's... avant-garde!** Just gimme the stuff!"],
                    happy: ["Aww, man! You're harshing my mellow! **I was just about to achieve nirvana, or at least find my other sock.** Well, back to reality, I guess. It bites.", "No deal? Dang. **And I was all set to write a symphony inspired by this exact moment of... not getting what I want.** Tragic, really."],
                    default: ["**Come on, Rikk! You holding out is like a doughnut shop running out of glaze!** It's just... wrong. **My spirit animal is a deflated bouncy castle right now.**", "You serious, Rikk? **My disappointment is immeasurable, and my day is ruined.** Thought we were boys!"]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.default[Math.floor(Math.random() * lines.default.length)];
            },
            rikkBuysSuccess: (mood) => {
                const lines = {
                    paranoid: ["(Snatches cash, looking around wildly) Good. Thanks. **Gotta go. The pigeons are deploying their drones.** Don't follow me, **and if you see a man in a trench coat made of squirrels, run!**", "Alright, alright. Cash received. **Now I can finally afford that tinfoil upgrade for my windows. They're listening, Rikk. They're always listening.**"],
                    happy: ["Sweet cash! You're a legend, Rikk! **Now I can afford that luxury ramen I've been eyeing! Or maybe just more... *this*. Decisions, decisions!**", "Woo-hoo! Money! **I feel like a millionaire! A very temporary, slightly twitchy millionaire!** Thanks, Rikk!"],
                    default: ["Preciate it, Rikk. You a real one. **Gotta go chase that dragon... or maybe just a really good taco.**", "Solid. This helps. **Now I can stop hearing the voices... or at least, they'll be saying nicer things.**"]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.default[Math.floor(Math.random() * lines.default.length)];
            },
            rikkSellsSuccess: (mood) => {
                const lines = {
                    paranoid: ["(Grabs item, hides it immediately) Yeah, that's the ticket. Good lookin'. **Now, if you'll excuse me, I think the mailman is trying to read my thoughts. Gotta wear my tinfoil beanie.**", "Got it. Safe. **Now to find a place where the walls don't have eyes... or mouths. This is harder than it looks, Rikk.**"],
                    happy: ["YES! That's the ambrosia! **My brain cells are throwing a party and you're invited, Rikk! Figuratively, of course. Unless you have snacks.**", "Oh, sweet relief! **It's like my soul just got a spa day! You're the best, Rikk! Like, a five-star dealer!**"],
                    default: ["Yeah, that's the good stuff. **Phew... my soul just sighed in relief.**", "Nice. This'll do. **Now I can finally face... well, probably just another Tuesday. But slightly less horribly.**"]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.default[Math.floor(Math.random() * lines.default.length)];
            }
        },
        postDealEffect: (success, customerState) => {
            if (success && Math.random() < 0.15 && customerState.mood !== "happy") {
                 displaySystemMessage(`${customerState.name} stumbles away looking REALLY rough... Hope they're okay. Or not your problem. (+3 Heat for potential public incident)`);
                 heat += 3;
                 updateHUD();
            }
        },
    },
    // ... (HIGH_ROLLER, REGULAR_JOE, INFORMANT, SNITCH archetypes similarly expanded) ...
    // For brevity, I'll show the expansion structure for HIGH_ROLLER and you can apply a similar pattern to the others.
    HIGH_ROLLER: {
        key: "HIGH_ROLLER",
        baseName: "Baron Von Blaze",
        greeting: (customer, item) => {
            const productType = item ? item.itemTypeObj.subType || item.itemTypeObj.type : 'exquisite diversions';
            const greetings = {
                paranoid: [
                    `(Voice low, impeccably dressed but eyes scanning) Rikk. A word. **Is this establishment... secure? One hears whispers.** I require absolute discretion for my acquisition of ${productType}. **A blemish on my reputation is more costly than any bauble you might possess. And my tailor is very judgemental.**`,
                    `(Adjusts cufflinks, gaze sharp) Rikk. The usual precautions, I trust? My associates value... silence. As do I. The ${productType} in question must be... untainted. **My patience for complications is famously thin.**`
                ],
                happy: [ // Smug, pleased
                    `(A charming, yet slightly condescending smile) Ah, Rikk, my purveyor of peccadilloes! I trust your offerings today are as refined as my taste in... well, everything. **Life's too short for cheap thrills, or cheap people, for that matter.** What delicacy do you have for my discerning palate regarding ${productType}? **I hope it pairs well with my vintage Bordeaux and impending world domination.**`,
                    `(Chuckles lightly) Rikk. Always a pleasure. Or, at least, a necessary transaction. The ${productType} – I expect nothing less than your finest. **Mediocrity is a contagion I actively avoid.**`
                ],
                arrogant: [ // Default
                    customer.hasMetRikkBefore ? `Rikk. The usual standards, if you please. The ${productType}. ` : `I am given to understand you are the Rikk of renown? One hopes the rumors of quality are not... exaggerated. I am in the market for the most... *efficacious* ${productType} available. **Time is a luxury I do not squander on subpar experiences.**`,
                    customer.hasMetRikkBefore ? `Rikk. Let's not dally. My interest lies in your premium ${productType}. ` : `You are Rikk, I presume? My sources indicate you may have access to the caliber of ${productType} I require. **Impress me.**`
                ]
            };
            const moodKey = customer.mood === "paranoid" ? "paranoid" : customer.mood === "happy" ? "happy" : "arrogant"; // Default to arrogant if no specific mood match
            // Street cred check
            let credMessage = "";
            if (typeof streetCred !== 'undefined' && streetCred < 15 && !customer.hasMetRikkBefore) {
                credMessage = customer.mood === "paranoid" ? " **And your reputation... let's just say it precedes you. For better or worse.**" : " ...Assuming your operation meets my... *expectations*. **I have little patience for amateurs.**";
            }
            return greetings[moodKey][Math.floor(Math.random() * greetings[moodKey].length)] + credMessage;
        },
        buyPreference: (item) => (item.itemTypeObj.type === "DRUG" && item.qualityIndex === 2) || (item.itemTypeObj.type === "STOLEN_GOOD" && item.qualityIndex >= 1 && item.baseValue > 100),
        sellPreference: (item) => (item.itemTypeObj.type === "INFORMATION" && item.qualityIndex === 2) || (item.itemTypeObj.id === "questionable_jewelry" && item.qualityIndex ===2),
        priceToleranceFactor: 1.8,
        negotiationResists: true,
        heatImpact: 4, credImpactSell: 4, credImpactBuy: 3,
        initialMood: "arrogant",
        preferredDrugSubTypes: ["PSYCHEDELIC", "NOOTROPIC", "METHAMPHETAMINE"],
        dialogueVariations: {
            itemNotGoodEnough: (mood) => {
                const lines = {
                    paranoid: ["(Scoffs quietly, pushes item back delicately) This is... pedestrian, Rikk. **And potentially compromised. Are you attempting to insult my intelligence, or worse, my security?**", "Unacceptable. This item lacks... finesse. **And frankly, it smells a bit like desperation. Not yours, I hope.**"],
                    happy: ["My dear Rikk, while I appreciate the effort, this simply won't do. **It lacks... panache. The je ne sais quoi of true illicit luxury.** I was anticipating something to inspire, not merely... exist. **My dog has toys of higher quality.**", "Charming. But no. **I require something that whispers of exclusivity, not shouts from the discount rack.**"],
                    arrogant: ["This is... unacceptable, Rikk. **I deal in excellence, not adequacy. Do you have something that doesn't scream 'bargain bin'?**", "Rikk, Rikk, Rikk. **Are we playing games? This is amateur hour. Show me what a *professional* has.**"]
                };
                 return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.arrogant[Math.floor(Math.random() * lines.arrogant.length)];
            },
            rikkPriceTooHigh: (mood) => { // They don't haggle, they state their perceived value or walk.
                const basePrices = ["An ambitious valuation, Rikk.", "That price is... theatrical.", "A bold gambit, Rikk."];
                const moodSpecifics = {
                    paranoid: `**Particularly for an item of... uncertain provenance. One hopes this price doesn't include a surcharge for unwanted attention.** My offer stands.`,
                    happy: `**While I appreciate a spirited attempt, my appraisers would value this differently. I'm generous, not a simpleton.** However, for expediency...`,
                    arrogant: `**I am prepared to offer a fair sum for genuine quality, not subsidize your aspirations.** My figure is non-negotiable.`
                };
                let line = basePrices[Math.floor(Math.random() * basePrices.length)] + " ";
                line += moodSpecifics[mood] || moodSpecifics.arrogant;
                return [line, `Rikk, please. **That price is an insult to both my intelligence and my tailor.** I have a counter-proposal, if you're wise enough to hear it.`]; // Returns an array
            },
            rikkBuysSuccess: (mood) => {
                const lines = {
                    paranoid: ["(Secures item, a curt nod) Prudent. **Ensure all traces of this transaction are... vaporized. I trust your discretion is as valuable as your wares.**", "Acceptable. **The less said, the better. For all involved.**"],
                    happy: ["Excellent. A worthy acquisition. **Your network is... surprisingly effective for this locale. One might almost consider it a legitimate enterprise. Almost.**", "Marvelous. This will serve its purpose admirably. **You have a certain... raw talent, Rikk.**"],
                    arrogant: ["Satisfactory. **Your service is noted, Rikk. Continue to provide this level of quality, and our association will be mutually beneficial.**", "As expected. **Keep this standard, Rikk. My associates have... high expectations.**"]
                };
                 return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.arrogant[Math.floor(Math.random() * lines.arrogant.length)];
            },
            rikkSellsSuccess: (mood) => {
                const lines = {
                    paranoid: ["(Accepts item with a discerning glance) Acceptable. **See to it that our... interaction remains unrecorded. By any entity.**", "Very well. **Discretion, Rikk. Above all else.**"],
                    happy: ["Marvelous! This will pair exquisitely with my evening's... *endeavors*. **You have a talent, Rikk. A raw, unpolished, slightly illegal talent. Cultivate it.**", "Splendid! **This is precisely the caliber I've come to expect. Or at least, hope for.**"],
                    arrogant: ["Indeed. This meets the standard. **Until our next transaction, Rikk. Maintain the quality.**", "Precisely. **You may inform your... lesser clients that this level of product is reserved.**"]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.arrogant[Math.floor(Math.random() * lines.arrogant.length)];
            }
        },
        postDealEffect: (success, customerState) => {
            if (success && Math.random() < 0.1) {
                const tip = Math.floor(cash * 0.05);
                cash += tip; streetCred +=1;
                displaySystemMessage(`${customerState.name} was exceptionally pleased and tipped you $${tip}! (+1 Cred)`);
                updateHUD();
            }
        },
    },
    REGULAR_JOE: {
        key: "REGULAR_JOE",
        baseName: "Chill Chad",
        greeting: (customer, item) => {
            const itemName = item ? item.name.split("'")[1] || item.name.split(" ")[1] || "the usual vibe" : 'something to unwind with';
            const greetings = {
                paranoid: [
                    `(Lowering voice, glancing around) Yo Rikk, quick word. **Feel like the squirrels are judging me today, man. And that one dude is definitely not just 'walking his dog'.** Just need my usual ${itemName}, nothing too wild. Let's keep it low-pro, yeah? **My grandma thinks I'm a youth pastor.**`,
                    `Rikk, hey. Uh, you see that van parked down the street? Been there for like, an hour. **Probably nothing, right?** Anyway, got any of that ${itemName}? Keep it on the DL.`
                ],
                happy: [
                    `(Big smile, relaxed posture) Rikk, my dude! What's good? **Sun's shining, birds are singing, and I haven't lost my keys yet today – it's a miracle!** Got that smooth ${itemName} for a fair price? **Trying to ride this good wave all the way to... well, probably just my couch, but a happy couch!**`,
                    `Yo Rikk! Feelin' golden today! Just cashed my paycheck – **which means I have exactly enough for rent and one good time.** You got that ${itemName} to make it count?`
                ],
                chill: [ // Default
                    customer.hasMetRikkBefore ? `Yo Rikk, it's ${customer.name}! Good to see ya. Just looking for a **chill hookup** for some ${itemName}. **No drama, just good vibes and a fair shake, you know?**` : `Hey, you Rikk? Heard good things. Just looking for a **chill hookup** for some ${itemName}. **No drama, just good vibes and a fair shake, you know?**`,
                    customer.hasMetRikkBefore ? `What up, Rikk! ${customer.name} in the house. Or, you know, at your door. Need that ${itemName}. **Keepin' it mellow.**` : `Yo, Rikk right? My buddy said you're the man for that ${itemName}. **Hoping to just... y'know, chill.**`
                ]
            };
            const moodKey = customer.mood === "paranoid" ? "paranoid" : customer.mood === "happy" ? "happy" : "chill";
            return greetings[moodKey][Math.floor(Math.random() * greetings[moodKey].length)];
        },
        buyPreference: (item) => item.qualityIndex === 1 && item.itemTypeObj.type !== "METHAMPHETAMINE" && item.itemTypeObj.subType !== "SYNTHETIC_CANNABINOID",
        sellPreference: (item) => item.qualityIndex <= 1 && item.itemTypeObj.type === "STOLEN_GOOD" && item.baseValue < 100,
        priceToleranceFactor: 0.9,
        negotiationResists: false,
        heatImpact: 1, credImpactSell: 1, credImpactBuy: 0,
        initialMood: "chill",
        preferredDrugSubTypes: ["CANNABINOID", "PARTY", "PSYCHEDELIC_MILD"],
        dialogueVariations: {
            negotiationSuccess: (mood) => {
                const lines = {
                    paranoid: ["Aight, cool, cool. **But let's wrap this up, man, my aura feels... exposed. And I think that car alarm is Morse code for 'bust'.**", "Deal. But for real, Rikk, **next time we meet in a submarine. Less windows.**"],
                    happy: ["Sweet! That's what I'm talking about! **You're a legend, Rikk! High five! Or, like, an air five, if you're not into the whole 'touching' thing.**", "Right on! Knew we could work it out! **You're like the Gandalf of good deals!**"],
                    chill: ["Yeah, that's solid. **Good looking out.**", "Cool, cool. That works for me. **Appreciate it, my dude.**"]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.chill[Math.floor(Math.random() * lines.chill.length)];
            },
            negotiationFail: (mood) => {
                const lines = {
                    paranoid: ["Nah, man, that's a bit steep. **And honestly, this whole block is giving me the heebie-jeebies right now. Think I saw a cop hiding in a trash can.**", "Can't do it, Rikk. **My spidey-senses are tingling, and not in a fun way. Price is too high for this level of weird.**"],
                    happy: ["Whoa there, Rikk, easy on the wallet! **My bank account is already giving me the silent treatment. Maybe next time when I win the lottery, or, you know, find a twenty.**", "Oof, that's a bit out of my good-times budget. **Gotta save some for pizza, you know? Priorities.**"],
                    chill: ["Ah, that's a little rich for my blood, Rikk. **Gotta watch the budget, you know? Adulting and all that jazz.**", "Nah, that's a bit much for me today, bro. **Maybe another time.**"]
                };
                 return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.chill[Math.floor(Math.random() * lines.chill.length)];
            },
            rikkBuysSuccess: (mood) => {
                const lines = {
                    paranoid: ["Nice, needed that. Thanks. **Gotta dip, man. Pretty sure that mailman knows my browser history.**", "Cool. Cash. **Now to vanish like a fart in the wind. A very nervous fart.**"],
                    happy: ["Awesome, thanks Rikk! **This'll fund my epic quest for the perfect burrito! Or, like, pay a bill. Probably the bill. Sigh.**", "Sweet! You're a lifesaver, man! **Or at least a 'don't have to eat instant noodles for a week' saver!**"],
                    chill: ["Cool, appreciate it. **Keeps the dream alive, or at least the Wi-Fi on.**", "Right on. Good deal. **Later, Rikk.**"]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.chill[Math.floor(Math.random() * lines.chill.length)];
            },
            rikkSellsSuccess: (mood) => {
                const lines = {
                    paranoid: ["Sweet. Got it. **Later, Rikk. And if anyone asks, we were discussing... sustainable gardening.**", "Nice one. **Now, if you see me running, try to keep up. Or don't. Probably better if you don't.**"],
                    happy: ["Right on! This is gonna be a good one. **Time to go ponder the mysteries of the universe, or just what's for dinner. Big questions, man.**", "Excellent! **My couch and I have a very important meeting scheduled, and this is the guest of honor!**"],
                    chill: ["Nice one, Rikk. **Just what the doctor didn't order, but what my soul needed.**", "Perfect. **Time to kick back and let the good times roll.**"]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.chill[Math.floor(Math.random() * lines.chill.length)];
            }
        },
        postDealEffect: null,
    },
    INFORMANT: {
        key: "INFORMANT",
        baseName: "Whiskey Whisper",
        greeting: (customer, item) => { // Item context isn't usually relevant for informant's greeting
            const greetings = {
                paranoid: [
                    `(Hushed, jumpy, clutching a worn notepad) Rikk, keep your voice down! **They're listening, man, the walls have ears, and the rats are wearing wires!** I got intel, grade-A, but this drop needs to be ghost. **My contact lens just transmitted a warning.**`,
                    `(Looks over both shoulders, pulls hat lower) Rikk. We need to talk. Quietly. **I've got something that could fry bigger fish than you... or me.** Info's hot. Price is hotter. You in?`
                ],
                happy: [ // Happy means they have juicy, valuable info
                    `(A sly, self-satisfied grin) Rikk, my friend! You've caught me on a banner day. **The streets are singing to me, and their song is pure profit.** I've got a symphony of secrets that'll make your ears tingle and your wallet bulge. **This ain't just intel, it's a golden ticket.**`,
                    `(Leans in conspiratorially) Rikk! Good timing. **I just heard something that'll make your jaw drop and your pockets jingle.** This is exclusive. Very exclusive. And very, very lucrative for the right buyer.`
                ],
                cautious: [ // Default
                    customer.hasMetRikkBefore ? `Rikk. Got a fresh whisper for ya. **Hot off the griddle.** This stuff ain't free, you know. **Knowledge is power, and power's got a price tag.**` : `You Rikk? Heard you trade in... *information*. **I got some prime cuts.** This stuff ain't free, you know. **Knowledge is power, and power's got a price tag.**`,
                    customer.hasMetRikkBefore ? `Rikk. Word on the street is you're looking for an edge. I might have just the thing. **Information broker, at your service... for a fee.**` : `They call you Rikk? Good. I hear things. **Things people pay to know.** Interested?`
                ]
            };
            const moodKey = customer.mood === "paranoid" ? "paranoid" : customer.mood === "happy" ? "happy" : "cautious";
            return greetings[moodKey][Math.floor(Math.random() * greetings[moodKey].length)];
        },
        sellsOnly: true,
        itemPool: ["info_cops", "info_rival", "burner_phone"],
        priceToleranceFactor: 1.3, heatImpact: -1, credImpactBuy: 4,
        initialMood: "cautious",
        dialogueVariations: {
            rikkCannotAfford: (mood) => {
                const lines = {
                    paranoid: ["No dough, no show, Rikk! **And every second we stand here, the surveillance camera across the street zooms in a little more!** Get the green or I'm smoke!", "Can't pay? **Then you can't play, Rikk! And this game is getting dangerous!**"],
                    happy: ["Come now, Rikk, don't be thrifty with destiny! **This information is champagne, and you're offering beer money. My sources have standards, you know.**", "Ah, a budget connoisseur, are we? Pity. **This particular vintage of veritas is for the top shelf only.**"],
                    cautious: ["This ain't a charity, Rikk. **My whispers have value. You want the dirt, you gotta pay for the shovel.**", "Look, Rikk. **Good intel costs. Bad intel costs more.** Your call."]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.cautious[Math.floor(Math.random() * lines.cautious.length)];
            },
            rikkBuysSuccess: (mood) => {
                const lines = {
                    paranoid: ["(Slips info quickly, eyes darting) Use it, don't lose it. **And burn this conversation from your memory. And maybe your clothes.** They know things, Rikk. **They know what you had for breakfast.**", "There. **Now act like we were discussing the weather. Bad weather. Very bad.**"],
                    happy: ["There you go. Pure gold. **Handle it with care, Rikk. Some secrets have teeth.** Pleasure doing business. **Now, if you'll excuse me, I have more... listening to do.**", "Excellent choice, Rikk. **This little nugget will pay dividends. Or, you know, keep you out of jail. Potato, potahto.**"],
                    cautious: ["Solid. **Use that wisely, it could save your hide. Or make you a mint.** Keep my number.", "Good. **Remember where you got it. And remember, some doors are best left unopened... unless you have a key. Which I just sold you.**"]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.cautious[Math.floor(Math.random() * lines.cautious.length)];
            }
        },
        postDealEffect: null,
    },
    SNITCH: {
        key: "SNITCH",
        baseName: "Concerned Carol",
        greeting: (customer, item) => {
            const itemName = item ? item.name.split("'")[1] || item.name.split(" ")[1] || "that... item" : "anything... noteworthy";
            const greetings = {
                paranoid: [ // Paranoid about being discovered as a snitch
                    `(Forced, shaky smile, clutching a "Neighborhood Watch" pamphlet) Oh, Rikk! Fancy meeting you here! **Just... patrolling. For safety!** ${item ? `Is that... ${itemName}? My, that's an... *unusual* brand. **Not illegal, I hope? Officer Friendly was just asking about unusual brands...**` : "Anything... *unusual* happening today, Rikk? **Just trying to keep our community... pristine! So many shadows these days!**"}`,
                    `(Jumps slightly) Rikk! Oh! You startled me. **Just admiring the... architecture.** So, uh, any... *news*? ${item ? `That ${itemName} you have... **it's not one of those... *things* they talk about on the news, is it?**` : "Everything... *above board* today?"}`
                ],
                happy: [ // Gleeful at the prospect of gathering info
                    `(Beaming, perhaps a little too eagerly) Rikk! Hello there! **Just taking in the vibrant tapestry of our neighborhood! So much... activity!** ${item ? `Oh, is that some ${itemName}? How... *intriguing*! **Always interested in local commerce, you know! For the community newsletter!**` : "What's the good word, Rikk? **Any juicy tidbits for a concerned citizen? Knowledge is power, especially for neighborhood safety!**"}`,
                    `(Claps hands) Rikk! Just the man I wanted to see! **You always know what's happening on the street. It's like you have a sixth sense for... *events*.** Anything I should be... *aware* of?`
                ],
                nosy: [ // Default
                    `Well hello there, Rikk! **Such a... *dynamic* street, isn't it?** ${item ? `My, my, what have we here? Some ${itemName}? **You always have the most... *unique* things. Tell me all about it! For... research, of course!**` : "Anything exciting happening in your world, Rikk? **I just love hearing about what the young entrepreneurs are up to!**"}`,
                    `Oh, Rikk! Just out for a stroll. **Trying to keep an eye on things, you know. For the good of the community.** ${item ? `That ${itemName} looks... *special*. What's its story?` : "Any... *interesting developments* I should make a note of?"}`
                ]
            };
            const moodKey = customer.mood === "paranoid" ? "paranoid" : customer.mood === "happy" ? "happy" : "nosy";
            return greetings[moodKey][Math.floor(Math.random() * greetings[moodKey].length)];
        },
        buyPreference: (item) => true, sellPreference: (item) => false,
        priceToleranceFactor: 0.8, negotiationResists: true,
        heatImpact: 2, credImpactSell: -3, credImpactBuy: 0,
        initialMood: "nosy",
        dialogueVariations: {
            rikkSellsSuccess: (mood) => {
                const lines = {
                    paranoid: ["Oh, lovely. Thank you, Rikk. **This will be... cataloged. For... posterity. Yes.** Now, I really must be going, **I think my petunias need me. And they have excellent hearing.**", "Very good. **I'll just... file this away. Under 'miscellaneous curiosities'.**"],
                    happy: ["Splendid! Thank you, Rikk! **This is just perfect for my... collection. You're such a vital part of the... local color! The police will be so interested... I mean, the historical society!**", "Oh, wonderful! **This will make an excellent... *exhibit* in my report... I mean, my scrapbook!**"],
                    nosy: ["Oh, that's... *noted*. Thanks, Rikk. **Very... informative.**", "Interesting. **I'll be sure to... remember this.** Thanks." ]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.nosy[Math.floor(Math.random() * lines.nosy.length)];
            },
            rikkDeclinesToSell: (mood) => {
                const lines = {
                    paranoid: ["Oh, a pity. No matter. **Just... making conversation. One has to be vigilant, you know. So many... *variables* in this neighborhood.**", "Not for sale? Understood. **Completely understood. No need to elaborate. At all.**"],
                    happy: ["Oh, that's quite alright, Rikk! **Just curious, you know me! Always eager to learn! Perhaps another time. I'll just make a little note... for myself, of course!**", "No problem at all! **More for others, then! Sharing is caring, after all! Unless it's illegal. Then it's evidence.**"],
                    nosy: ["Oh, really? Well, alright then. **Just trying to be friendly! One never knows what interesting things are about!**", "Keeping it to yourself, Rikk? **Mysterious! I like a good mystery.**"]
                };
                return lines[mood] ? lines[mood][Math.floor(Math.random() * lines[mood].length)] : lines.nosy[Math.floor(Math.random() * lines.nosy.length)];
            }
        },
        postDealEffect: (success, customerState) => {
            if (success && Math.random() < 0.65) {
                const snitchHeat = Math.floor(Math.random() * 15) + 10;
                if (typeof heat !== 'undefined' && typeof displaySystemMessage !== 'undefined' && typeof updateHUD !== 'undefined') {
                    heat += snitchHeat; streetCred -=2;
                    displaySystemMessage(`🚨 RAT ALERT! 🚨 **${customerState.name}** was seen yapping to the 5-0! (+${snitchHeat} Heat, -2 Cred)`);
                    updateHUD();
                } else { console.warn("SNITCH postDealEffect: Could not access global 'heat' or UI functions.");}
            } else if (success) {
                 displaySystemMessage(`You feel **${customerState.name}'s** beady eyes on you as they leave... **like a human CCTV camera.**`);
            }
        }
    },
    STIMULANT_USER: {
        key: "STIMULANT_USER",
        baseName: "Motor-Mouth Marty",
        greeting: (customer, item) => {
            const itemName = item ? item.name.split("'")[1] || item.name.split(" ")[1] || "that rocket fuel" : 'something to SUPERCHARGE my EVERYTHING';
            const greetings = [
                `Rikk! My man! My legend! You will NOT believe the idea I just had! **We're talking revolutionary, Rikk, REVOLUTIONARY!** It involves pigeons, a thousand tiny jetpacks, and a synchronized aerial ballet that will solve rush hour traffic! PERMANENTLY! Oh, right, yeah, you got any of that **${itemName}**? My brain's going a million miles a minute, and I need to keep up with it! **How much for the zoom-zoom juice? And have you ever wondered if squirrels are just tiny, furry spies? Because I have. Extensively.**`,
                `Whoa, Rikk, TIMING! I was just explaining to this lamppost here how the entire global economy is secretly controlled by llamas! **It's all in the wool, Rikk, the WOOL!** They're playing the long game! Anyway, you got that **${itemName}**? I need to, uh, *process* some very important data. Very, very fast. **Price? Don't care, just NEED IT! You ever try to teach a fish to play poker? It's harder than it looks, man, way harder!**`,
                customer.hasMetRikkBefore ? `Marty! No, wait, Rikk! It's me, ${customer.name}! Or am I Marty? Doesn't matter! **Got any of that ${itemName}? I'm onto something HUGE! Bigger than breadboxes! Bigger than... than... BIG THINGS!** My thoughts are racing like caffeinated cheetahs, Rikk! **We should invent a new color! Something... LOUDER!** How much for the go-go powder?` : `You Rikk? Heard you're the wizard of WHIZZ! The sultan of SPEED! The... uh... guy with the good stuff! Name's ${customer.name}, and I'm on a MISSION! **A mission fueled by ideas and, hopefully, soon, by that sweet, sweet ${itemName}!** So, what's the word, bird? **And why DO birds suddenly appear? Is it a government conspiracy? Let's discuss!**`
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        },
        buyPreference: (item) => item.itemTypeObj.subType === "STIMULANT" || item.itemTypeObj.subType === "METHAMPHETAMINE",
        sellPreference: (item) => (item.itemTypeObj.type === "STOLEN_GOOD" && item.qualityIndex === 0) || item.id === "half_baked_invention_idea" || item.id === "blueprint_for_squirrel_armor", // Placeholder items
        priceToleranceFactor: 0.7, // Low to moderate
        negotiationResists: true, // Too scattered/paranoid
        heatImpact: 2, // Can be erratic
        credImpactSell: -1, // Selling weird stuff
        credImpactBuy: 1, // Reliable buyer of their preferred stuff
        initialMood: "manic", // "manic" or "agitated"
        preferredDrugSubTypes: ["STIMULANT", "METHAMPHETAMINE", "NOOTROPIC"],
        dialogueVariations: {
            lowCashRikk: (mood) => { // Mood doesn't really change their core reaction much, they're always ON
                const lines = [
                    `**NO MONEY?! Rikk, are you KIDDING ME?!** My entire plan to build a self-folding laundry empire depended on this transaction! **This is a CATASTROPHE!** Now the socks will remain unfolded! **Think of the CHAOS!**`,
                    `Broke?! **But... but... my hyper-intelligent hamster, Sir Reginald Fluffington III, he predicted this deal would fund our expedition to find the Lost City of Atlantis!** He even packed his tiny scuba gear! **This is setting back interspecies archaeology by DECADES, Rikk!**`,
                    `**You're out of cash? My brain just screeched to a halt!** Well, not really, it's still going pretty fast, but this is a MAJOR roadblock, Rikk! **A real spanner in the works of my genius!** I was about to patent breathable coffee! **BREATHABLE COFFEE, RIKK!**`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            rikkDeclinesToBuy: (mood) => {
                const lines = [
                    `**YOU DON'T WANT IT?!** But this blueprint for squirrel-sized battle armor is revolutionary! **Think of the acorn defense capabilities!** You're missing out, Rikk! **This is the future of rodent warfare! Your loss! COMPLETELY YOUR LOSS!**`,
                    `Not interested in my half-finished perpetual motion machine? **It only needs a few more... uh... things! And a LOT more duct tape!** This is visionary stuff, Rikk! **You'll regret this when I'm accepting my Nobel Prize! FROM THE MOON!**`,
                    `**You're passing on THIS?! This... this THING?!** It's a... it's a paradigm shift in... something! **I haven't figured out what yet, but it's BIG!** You lack vision, Rikk! **VISION!**`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            rikkDeclinesToSell: (mood) => {
                const lines = [
                    `**NO DEAL?! But I can feel my ideas slowing down, Rikk!** It's like watching a Ferrari run out of gas in slow motion! **Tragic! Utterly tragic!** Don't you understand the URGENCY?! **I'm on the verge of discovering why cats purr! THE WORLD NEEDS TO KNOW!**`,
                    `You're cutting me off?! **Rikk, I'm like a rocket ship, and you're withholding the fuel!** My trajectory was set for GENIUS! **Now I'm just... orbiting mediocrity! This is NOT GOOD!**`,
                    `Can't sell?! **But I was about to write a seven-act opera about the philosophical implications of cheese!** This is a major setback for the arts, Rikk! **A MAJOR SETBACK!**`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            rikkBuysSuccess: (mood) => {
                const lines = [
                    `YES! **Cash money! Fuel for the fire!** Now I can finally buy that industrial-sized vat of glitter I need for my pigeon communication system! **It's all about visual signaling, Rikk! THEY'LL SEE IT FROM SPACE!** Thanks, you're a lifesaver! **Or at least, an idea-saver!**`,
                    `BRILLIANT! This is perfect! **This will fund my research into why donuts have holes! Is it a metaphor? Are they portals? I NEED ANSWERS, RIKK!** You're the best! **The absolute BEST! Like, top-tier human!**`,
                    `SOLD! **Excellent transaction, my friend!** With this, I can acquire the necessary components for my plan to teach squirrels interpretive dance! **It'll be bigger than Broadway! BIGGER!** Gotta go, ideas are COOKING! **Smell ya later, innovator!**`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            rikkSellsSuccess: (mood) => {
                const lines = [
                    `YES! **THE GOOD STUFF! My brain is already thanking you!** Ideas are POPPING like corn in a microwave, Rikk! **Gotta go, gotta invent, gotta... DO ALL THE THINGS!** You're a national treasure! **Or at least a neighborhood one!**`,
                    `FANTASTIC! **This is the nectar of the gods of innovation!** I can feel the breakthroughs coming! **Prepare for a paradigm shift, Rikk! Or at least a very enthusiastic PowerPoint presentation!** Later!`,
                    `ACQUIRED! **The precious!** Now my thoughts can achieve MAXIMUM VELOCITY! **Thanks, Rikk! You're not just a dealer, you're a muse! A very helpful, slightly shady muse!** TO THE LABORATORY! (Which is my kitchen table).`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            itemNotGoodEnough: (mood) => {
                const lines = [
                    `This? Rikk, this is... this is like putting regular gas in a rocket ship! **I need the high-octane stuff! The brain-blasters!** This ain't gonna cut it for my plan to teach dolphins astrophysics! **They have standards, you know!**`,
                    `Nah, Rikk, this won't do. **My ideas are thoroughbreds, and this is pony fuel!** I'm talking warp speed, Rikk, WARP SPEED! **This is... this is dial-up modem speed! In my brain! The horror!**`,
                    `Not quite right, my friend. **I need something that ZINGS! Something that ZAPS! Something that makes my neurons do the cha-cha!** This is more of a slow waltz. **Next!**`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            rikkPriceTooHigh: (mood) => {
                const lines = [
                    `WHOA! **That price, Rikk! That's... that's astronomical!** Are the numbers themselves on stimulants?! **My budget is screaming! It's a very loud, very agitated scream!** Can we... recalibrate those digits? **For the sake of innovation!**`,
                    `Ouch, Rikk! **That stings the old wallet-erino!** I'm trying to fund groundbreaking discoveries here, not buy a small island! **Though a small island would be nice... Focus, Marty, FOCUS!** How about a price that doesn't make my bank account cry?`,
                    `**Yikes! That's a bit steep, even for a visionary like myself!** My ideas are priceless, Rikk, but my cash is definitely not! **Let's haggle like two very energetic... uh... hagglers!**`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            // General banter
            generalBanter: [
                "You ever think about how, like, pigeons are just government drones, Rikk? But they're, like, *organic* drones? Makes you think. **Oh, right, the 'Tina's Turbo Tabs', how much for those speed demons?**",
                "So I was thinking, we could replace all the city buses with, like, giant catapults! **Think of the efficiency! Less traffic, more... airborne commuters.** Anyway, got any of that 'White Pony'?",
                "(If deal fails) **This is a disaster! A travesty!** My whole plan to reorganize the city's stray cat population by alphabetical order depended on this! **Now what am I gonna do? They'll be so confused! THIS IS YOUR FAULT, RIKK!**",
                "Rikk, my man, you ever stare at a lightbulb for, like, an hour? **The secrets it holds! The STORIES!** Oh, yeah, almost forgot, need to re-up on the brain-boosters. **Whatcha got that screams 'EUREKA!'?**",
                "I've got it! **A new system for dog walking! We attach tiny parachutes to them and launch them from rooftops!** They'll love it! It's efficient! It's... probably illegal. **Damn. Anyway, how about those 'Zoomer Boomers'?**",
                "Okay, hear me out: **squirrels with tiny top hats and monocles.** Why? WHY NOT, RIKK? It's called FASHION! **Also, I need some 'Fast Forward Flakes'. My brain's buffering.**"
            ]
        }
    },
    PSYCHEDELIC_EXPLORER: {
        key: "PSYCHEDELIC_EXPLORER",
        baseName: "Cosmic Connie",
        greeting: (customer, item) => {
            const itemName = item ? item.name.split("'")[1] || item.name.split(" ")[1] || "those cosmic keys" : 'a little something to unlock the doors of perception';
            const greetings = [
                `Greetings, fellow traveler! Rikk, is it? Or are you just, like, a *reflection* of Rikk? Whoa. Heavy. I was just pondering the interconnectedness of all things, you know? Like, what if this sidewalk is actually, like, the *eyebrow* of a giant? Anyway, you got any of **${itemName}**? My soul is trying to dial into the cosmic modem.`,
                `Rikk, my dude! I had this *epiphany*! What if, like, colors are just, like, opinions, man? And we all see them differently? *Mind blown, right?* So, about that **${itemName}**... I'm trying to paint a sound, and I think that's the missing ingredient. You feel me? The universe is singing, Rikk, but I think it's off-key.`,
                customer.hasMetRikkBefore ? `Connie! No, wait, that's me. You're Rikk! Or are we all Rikk? *Lost in the cosmic sauce again, man.* Got any of that **${itemName}**? The patterns in my ceiling are telling me it's time for a spiritual tune-up. They speak in, like, *very insistent paisley*, you know?` : `Hey... are you Rikk? The name vibes with my aura. I'm ${customer.name}, or maybe I'm just a collection of stardust experiencing itself. *Pretty wild, huh?* I'm on a quest for some **${itemName}**. My spirit guide, a talking badger named Bartholomew, said you'd have the good stuff. He's usually right about these things. *Especially after three cups of herbal tea.*`
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        },
        buyPreference: (item) => item.itemTypeObj.subType === "PSYCHEDELIC" || item.itemTypeObj.subType === "PSYCHEDELIC_MILD",
        sellPreference: (item) => item.id === "perfectly_normal_rock_portal_key" || item.id === "sentient_dust_bunny_wisdom" || (item.itemTypeObj.type === "STOLEN_GOOD" && item.qualityIndex === 0 && Math.random() < 0.3), // Lower chance for generic stolen goods
        priceToleranceFactor: 1.1, // Slightly variable/oblivious
        negotiationResists: true, // Too detached
        heatImpact: 1,
        credImpactSell: 1, // Selling weird but intriguing items
        credImpactBuy: 2, // Good customer for their niche
        initialMood: "dreamy",
        preferredDrugSubTypes: ["PSYCHEDELIC", "PSYCHEDELIC_MILD", "DISSOCIATIVE"],
        dialogueVariations: {
            lowCashRikk: (mood) => {
                const lines = [
                    `Oh, bummer, man. The money spirits aren't with you today. *It's like, the financial chi is all blocked up.* Maybe try, like, meditating on abundance? Or checking under the couch cushions. The universe provides, Rikk, eventually.`,
                    `No green vibrations, huh? That's cool, that's cool. *Everything is transient, especially, like, paper rectangles we assign value to.* This just means the cosmic transaction isn't aligned right now. Maybe later, the cash flow will... flow.`,
                    `*Aw, man, your wallet's feeling light?* That's okay. The real currency is, like, kindness, you know? And maybe good vibes. But yeah, also money for the good stuff. *Catch you on the flip side of the fiscal spectrum, Rikk.*`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            rikkDeclinesToBuy: (mood) => {
                const lines = [
                    `No worries, this *Sentient Dust Bunny* probably wasn't meant for your vibrational frequency anyway. It told me it's looking for a home with more... *existential angst*. You're probably too well-adjusted, Rikk.`,
                    `It's cool, man. This *Perfectly Normal Rock* that also happens to be a *Portal Key to the Hamster Dimension* isn't for everyone. *It chooses the holder, you know?* Maybe it senses you're more of a... *cat person*. No judgment.`,
                    `*All good, Rikk.* This clump of moss that whispers secrets of forgotten civilizations needs a special kind of caretaker. *Someone who speaks 'lichen', you know?* It's a niche market.`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            rikkDeclinesToSell: (mood) => {
                const lines = [
                    `It's cool, Rikk. The universe will provide the 'Lucy's Sky Diamonds' when the time is right... or maybe that pigeon outside has some. *It looked like it had shifty eyes. And really colorful feathers.*`,
                    `No worries, my dude. *The path to enlightenment is, like, totally winding.* If the 'Magic Mushies' aren't flowing today, maybe it's a sign I should try to, like, *photosynthesize my own high*. Worth a shot, right?`,
                    `*That's alright, Rikk.* The cosmic flow is just redirecting my journey. Perhaps I'm meant to find clarity in, like, a really good cup of tea. Or by staring at my own hands for an hour. *They're like... maps, man! Maps of... hands!*`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            rikkBuysSuccess: (mood) => {
                const lines = [
                    `Radical, Rikk! This *Cosmic Pebble* will be, like, so stoked to join your collection of earthly treasures! *It says it's happy to be appreciated for its inner truth, not just its pebble-ness.*`,
                    `Far out, man! This *Whispering Pinecone* is gonna love its new home. *It has so many stories to tell, mostly about squirrels, but some are pretty profound.* Thanks for, like, being its new guardian.`,
                    `*Righteous!* This *Slightly-Used Aura* I found will really benefit from your... *grounded energy*, Rikk. May it bring you visions of, like, really cool screensavers.`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            rikkSellsSuccess: (mood) => {
                const lines = [
                    `Far out, man! These 'Magic Mushrooms' are gonna take me on a journey to the very fabric of reality... or at least to the corner store for snacks. *It's all connected, you know?* Thanks, Rikk!`,
                    `*Cosmic!* This 'Astral LSD' is just what my third eye was craving. Time to go explore the space between thoughts. *Wish me luck, or, like, don't. Time is an illusion anyway.* Peace!`,
                    `Beautiful, Rikk. These 'Blotters of Enlightenment' feel... *correct*. My spirit animal, which is currently a mildly confused sloth, thanks you. *He says you have good vibes. For a carbon-based biped.*`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            itemNotGoodEnough: (mood) => {
                const lines = [
                    `Hmm, this 'Afghan Gold' feels a bit too... *square*, you know? My third eye is looking for something more... *spherical*. Or maybe, like, *fractal-shaped*. Yeah, that's the ticket.`,
                    `Nah, Rikk, this 'Green Crack' is giving me, like, *jagged vibes*. I'm looking for something more... *flowy*. Like a gentle stream of consciousness, not a caffeinated waterfall, you feel me?`,
                    `This particular batch of 'Wonder Pills' doesn't quite resonate with my current chakra alignment. *It's a bit too... beige.* I need something that sings in the key of *purple*, my friend.`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            rikkPriceTooHigh: (mood) => {
                const lines = [
                    `Whoa, heavy price, man. Does it come with, like, a map to the Astral Plane for that much? *Or maybe a user manual for the universe?* My spirit guide says my wallet is feeling a bit... *deflated* right now.`,
                    `Oof, Rikk, that's a lot of Earth credits. *Are these, like, artisanally mined from the moon by enlightened gnomes or something?* My pockets are feeling a bit too... *Newtonian* for that price.`,
                    `*That's a cosmic number, my friend!* For that much, I'd expect these 'Reality Ripples' to also, like, do my dishes and tell me the meaning of life. *Can we find a more... harmonious price point?*`
                ];
                return lines[Math.floor(Math.random() * lines.length)];
            },
            generalBanter: [
                "Rikk, my dude, I just realized that, like, shoes are just foot-prisons, you know? We should all let our feet be free! Anyway, got any 'Psychedelic Sunshine'?",
                "I was talking to a squirrel earlier, and it told me the secrets of the universe... but then I forgot them. Think some 'Special K-Os Cereal' will help me remember? *Or maybe it was a pigeon... they all look so wise.*",
                "What if, like, trees are just Earth's antennas, Rikk? And they're, like, picking up signals from other planets? *Makes you think, huh?* Oh, yeah, need some 'Cosmic Comets'.",
                "I think my cat is a reincarnated philosopher. *He just stares at walls with such... understanding.* It's profound. Anyway, you got those 'Reality-Bending Blisscuits'?",
                "Sometimes I wonder if we're all just, like, characters in a giant cosmic play, Rikk. And the script is written in, like, stardust. *Heavy, right?* Speaking of stars, any 'Galaxy Gliders' in stock?",
                "This reality, man... it's like, *so* realistic. Almost *too* realistic, you know? Makes me crave some 'Dream Weaver Deluxe'. You holding?"
            ]
        }
    },
};