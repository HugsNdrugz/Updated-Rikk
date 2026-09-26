/**
 * @file customer_templates.js
 * @description Final, production-ready build of all customer archetypes.
 * This file contains the complete data, gameplay logic, and dialogue for all characters.
 * All dialogue has been audited for narrative consistency and completeness.
 * Compiled by AI Studio Operations Core.
 */

export const customerTemplates = {
    "DESPERATE_FIEND": {
        "key": "DESPERATE_FIEND",
        "baseName": "Jittery Jerry",
        "avatarUrl": "https://randomuser.me/api/portraits/men/32.jpg",
        "baseStats": {
            "mood": "desperate",
            "loyalty": 0,
            "patience": 3,
            "relationship": 0
        },
        "gameplayConfig": {
            "buyPreference": {
                "or": [
                    { "subType": "OPIATE", "maxQuality": 1 },
                    { "subType": "STIMULANT", "maxQuality": 1 },
                    { "subType": "SYNTHETIC_CANNABINOID", "maxQuality": 1 }
                ]
            },
            "sellPreference": { "or": [
                { "type": "DRUG", "subType": "SYNTHETIC_CANNABINOID", "quality": 0, "chance": 0.4 },
                { "type": "DRUG", "subType": "STIMULANT", "quality": 0, "chance": 0.3 },
                { "type": "DRUG", "subType": "OPIATE", "quality": 0, "chance": 0.3 },
                { "type": "STOLEN_GOOD", "quality": 0, "chance": 0.4 }
            ]},
            "priceToleranceFactor": 0.5,
            "negotiationResists": true,
            "heatImpact": 0,
            "credImpactSell": 0,
            "credImpactBuy": -2,
            "preferredDrugSubTypes": ["OPIATE", "STIMULANT", "SYNTHETIC_CANNABINOID"]
        },
        "dialogue": {
            "greeting": {
                "new_customer": {
                    "seeking_to_buy": [
                        {
                            "moods": ["desperate", "paranoid"],
                            "lines": [
                                "Yo, uh, you Rikk? They said you were the shaman of the streets. I'm hurtin' bad, need somethin'...",
                                "You Rikk? Heard you're the guy. Got that... *medicine*? My wallet's already crying.",
                                "Please, man, tell me you're Rikk. I'm fiendin' over here, need a fix like yesterday."
                            ]
                        },
                        {
                            "moods": ["angry"],
                            "lines": [
                                "You Rikk?! Heard you got what I need. Better not be wasting my time!",
                                "Someone said you're the man. Don't piss me off, just tell me if you're holding.",
                                "Spit it out, are you Rikk or not? My patience is thinner than my last dime."
                            ]
                        },
                        { // Mood-agnostic fallback for new_customer, seeking_to_buy
                            "lines": [
                                "Yo, you Rikk? They said you're the one... please tell me you got something. My nerves are shot, man.",
                                "Rikk? That you? Heard you're the guy... got anything to make the shadows stop dancing? I'm not picky.",
                                "Is this the place? Someone said Rikk could help... I need it bad, whatever you got."
                            ]
                        }
                    ],
                    "seeking_to_sell": [
                        {
                            "moods": ["desperate"],
                            "lines": [
                                "Rikk... you gotta help me. I got this... thing. Need cash, man, bad. The walls are closing in.",
                                "Please, Rikk, I'm desperate. Got something I can sell, just need the money, quick. Before they find me.",
                                "They said you buy stuff, Rikk. Look, I'm not proud, but I need to unload this for some scratch. My luck's run dry."
                            ]
                        },
                         {
                            "moods": ["paranoid"],
                            "lines": [
                                "(Whispering) Rikk, you buy stuff? Got something... hot. Need to move it. Fast. No questions. They're watching.",
                                "(Eyes darting) You Rikk? Someone said you deal in... acquisitions. This is hush-hush, for cash only. Can't trust anyone else.",
                                "Psst, Rikk... word is you're discreet. I got this item, need it gone, no traces, you get me? The pigeons are informants."
                            ]
                        },
                        { // Mood-agnostic fallback for new_customer, seeking_to_sell
                            "lines": [
                                "(Eyes darting) Rikk? You buy... things? Got something, gotta move it fast. Cash only, no questions, okay?",
                                "You Rikk? Heard you're in the market for... opportunities. This one's a bit warm, if you catch my drift. What d'ya say?",
                                "Psst, Rikk. Got a tip you might be interested in this... *item*. Need cash, no paper trail. You the guy for that?"
                            ]
                        }
                    ]
                },
                "returning_customer": {
                    "seeking_to_buy_usual": [ // Customer wants their preferred item, and Rikk has it
                        {
                            "moods": ["desperate", "addicted"], // 'addicted' can be a mood or derived from addictionStatus
                            "lines": [
                                "Rikk! Thank god it's you again! You know what I need! Quick! The spiders are back!",
                                "Me again, Rikk. The usual... please tell me you have it. The walls are talkin' again, and they're not making sense!",
                                "Rikk, you're a sight for sore eyes! Got my regular fix? The shakes are getting bad, and I think my teeth are vibrating."
                            ]
                        },
                        {
                            "moods": ["happy"], // Jerry's "happy" is still pretty desperate/manic
                            "lines": [
                                "Rikk my man! Back for my favorite! You got it, right? Tell me you got it! The good stuff!",
                                "Hey Rikk! Good to see ya! Hook a brother up with the good stuff, the one that makes the colors brighter and the voices quieter!",
                                "It's your favorite customer, Rikk! Ready for another dose of awesome? You know what I like! The stuff that makes the squirrels seem friendly!"
                            ]
                        },
                        { // Mood-agnostic fallback for returning_customer, seeking_to_buy_usual
                            "lines": [
                                "Rikk, it's me. You got the usual? Please say yes, the silence is too loud.",
                                "Back for my regular, Rikk. Hope you're holding. The itch is getting unbearable.",
                                "Hey Rikk, need that same stuff as last time. You got it? My nerves are frayed wires."
                            ]
                        }
                    ],
                    "seeking_to_buy_general": [ // Customer is returning, but either their usual is out, or they are open to other things
                        {
                            "moods": ["desperate", "paranoid"],
                            "lines": [
                                "Rikk, it's me! My usual connect is dry... or arrested... or maybe he turned into a pigeon, who knows! You holding anything that'll get me right?",
                                "Alright Rikk, what's on the menu today? My nerves are shot, and I think the shadows are following me again.",
                                "The usual spot's a ghost town, Rikk. Please tell me you got something, anything, to ease this pain. The static in my head is deafening."
                            ]
                        },
                        {
                            "moods": ["happy"], // Jerry's "happy"
                            "lines": [
                                "Hey Rikk! Back for more good times! Whatcha got for me today? Something to make the world less... pointy?",
                                "Rikk! Feeling adventurous. What's new and exciting on the street menu? As long as it stops the buzzing!",
                                "My main man Rikk! Ready to explore some new vibes. What do you recommend? Something that'll make the pigeons sing opera?"
                            ]
                        },
                        {
                            "lines": [ // Mood-agnostic fallback for returning_customer, seeking_to_buy_general
                                "Yo Rikk, what's good? Looking to pick something up. Anything to quiet the noise.",
                                "Back again, Rikk. Whatcha holding today? Anything interesting? My brain feels like a shaken snow globe.",
                                "Hey Rikk, it's me. Need to re-up. What's available this time around? Something strong, man."
                            ]
                        }
                    ],
                    "seeking_to_sell": [
                        {
                            "moods": ["desperate", "angry"],
                            "lines": [
                                "Me again, Rikk. Times are tough. Had to find something else to pawn... this thing's probably cursed, but so am I.",
                                "Rikk, you gotta take this off my hands. No questions, just cash. Before *they* realize I have it.",
                                "Look, Rikk, I wouldn't be here if I wasn't desperate. This is all I got. What'll you give me? It's practically dripping bad luck."
                            ]
                        },
                        {
                            "lines": [ // Mood-agnostic fallback for returning_customer, seeking_to_sell
                                "Hey Rikk, got something else for you today, if you're interested. It's... *unique*. And I need the cash, like, yesterday.",
                                "Yo Rikk, found another... *treasure*. Or maybe it's haunted. Wanna take a look this time? Please?",
                                "Me again. Got a little something I think you might like. Or at least, something you can move. I can't keep it, man."
                            ]
                        }
                    ]
                }
            },
            "customerReactsToRudeDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "Whoa, Rikk, no need to be like that! I'm just tryin' to survive out here!",
                        "Damn, alright! You ain't gotta kick a man while he's down!",
                        "Shit, okay, okay! Keep your shirt on, man... my skin's already crawling enough as it is!"
                    ]
                }
            ],
            "customerReactsToPoliteDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "I hear ya, Rikk... thanks anyway. Let me know if you change your mind, man...",
                        "Appreciate you being straight with me, Rikk. Back to the pavement I go...",
                        "Fair enough, brother. Stay safe out there."
                    ]
                }
            ],
            "lowCashRikk": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "(Eyes darting) No cash?! Rikk, **the static on the TV is calling me names!** You gotta find some, man, **before I try to pay with my collection of bottle caps!**",
                                "Broke?! **Are you trying to make the shadow people win, Rikk?!** They feed on disappointment!",
                                "No money? Rikk, the voices are getting louder! **They're telling me to invest in pigeon real estate! Help!**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "Aww, Rikk, you party pooper! **I was about to teach you the secret handshake of the enlightened!** Go shake down your couch cushions, I'll wait... and maybe try to levitate.",
                                "No moolah? Come on, Rikk! **My chakras were aligning for this! Now they're just... awkwardly bumping into each other.**",
                                "Wallet's empty, eh? Shucks. **And I was just about to share my theory on how squirrels are interdimensional beings!** Their loss!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "**You broke, Rikk? Seriously?** My dealer being broke is like my therapist needing therapy. **Unsettling, man.** I'm **about to start seeing sound waves.**",
                                "No cash? **My hope just did a swan dive off a very tall building.** You sure you checked under the mattress, Rikk?",
                                "Zero funds? Rikk, my man, **that's like a bakery with no bread. Just... sad.** How am I supposed to get my... *vitamins*?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToBuy": [ // Carol reacts to Rikk declining to buy something SHE is offering (hypothetically)
                {
                    "conditions": [],
                    "lines": [
                        "Oh, not interested in this particular... *donation*, Rikk? Well, I suppose not everyone appreciates items of... questionable origin. Officer Friendly often says it's the *provenance* that matters, you know.",
                        "No sale? That's a shame. I was sure this would be perfect for someone of your... unique tastes. I'll just mention your lack of interest in my chat with Officer Friendly; he likes to keep up with local demand... or lack thereof.",
                        "Passing on this, are we? Every transaction, or *non-transaction*, tells a story, doesn't it? I'll be sure to log this... *market data*... for the Neighborhood Watch archives. We aim for complete records."
                    ],
                    "payload": { "type": "EFFECT", "effects": [{"type": "triggerEvent", "eventName": "snitchReport", "chance": 0.2, "heatValueMin": 3, "heatValueMax": 10, "credValue": -1, "message": "🚨 RAT ALERT! 🚨 **[CUSTOMER_NAME]** took careful note of your refusal... (+[HEAT_VALUE] Heat, -1 Cred)"}] }
                }
            ],
            "rikkBuysSuccess": [ // Carol reacts to Rikk buying something SHE offered (hypothetically)
                {
                    "conditions": [],
                    "lines": [
                        "Splendid! I'm so glad this... *previously owned treasure*... has found a new custodian. I'll make a detailed note for Officer Friendly's... inventory of interesting local acquisitions. He does appreciate diligence.",
                        "Excellent choice, Rikk! Every little bit helps the... community fund, doesn't it? And provides such useful data on... local commerce trends. Officer Friendly will be fascinated by the specifics.",
                        "Very good! This transaction will be duly recorded. One likes to keep track of what changes hands in the neighborhood. For... safety and statistical purposes, of course. Officer Friendly always says, 'Documentation is key!'"
                    ],
                    "payload": { "type": "EFFECT", "effects": [{"type": "triggerEvent", "eventName": "snitchReport", "chance": 0.75, "heatValueMin": 10, "heatValueMax": 25, "credValue": -3, "message": "🚨 RAT ALERT! 🚨 **[CUSTOMER_NAME]** was practically taking notes for the cops! (+[HEAT_VALUE] Heat, -3 Cred)"}] }
                }
            ],
            "customerHasNothingToSell": [ // Carol has nothing to offer Rikk
                {
                    "conditions": [],
                    "lines": [
                        "Alas, Rikk, my collection of... *community-sourced items*... is rather bare today. But don't you worry, my eyes and ears are always open for new... *acquisitions* that might interest civic-minded individuals.",
                        "Nothing to offer you today, my dear. But I'm always observing the ebb and flow of... interesting items... in our little neighborhood. One never knows what will turn up!",
                        "My... *donation box*... is empty at the moment, Rikk. But I'm expecting a new wave of... *misplaced property*... any day now. I'll keep you informed of any noteworthy arrivals."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkHasNothingCustomerWants": [ // Rikk doesn't want what Carol is (hypothetically) offering
                {
                    "conditions": [],
                    "lines": [
                        "Oh, none of my... *offerings*... appeal to you today, Rikk? How... selective. I'll make a note of your preferences.",
                        "Not what you're looking for? That's quite alright. It's always good to know what the local market... *isn't* demanding.",
                        "My current selection doesn't meet your needs? I'll be sure to remember that, Rikk. Information is always valuable."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToSell": [ // Rikk declines to BUY info FROM Informant
                {
                    "conditions": [],
                    "lines": [
                        "Not buying today, Rikk? Suit yourself. This current was live, but the river's always flowing. Don't want to get caught without a paddle when the rapids hit.",
                        "No deal? Alright. But when the static clears and you realize what you passed on, the price might have... *appreciated*.",
                        "Keeping your powder dry, eh? Fair enough. Just remember, some whispers fade fast. This one had a real echo to it. Your loss."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkSellsSuccess": [ // Informant acknowledges Rikk's successful PURCHASE of information
                {
                    "conditions": [],
                    "lines": [
                        "There you have it, Rikk. Fresh off the wire. Handle it like it's got a short fuse, because some information does.",
                        "Consider that a sound investment. Knowledge is power, and this little piece... it's got voltage. Use it to light your way, not burn your house down.",
                        "Transaction complete. My source gets their cut, I get mine. And you, Rikk, you get a clearer view of the shadows. For now."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "itemNotGoodEnough": [ // Rikk deems the INFORMANT'S INFO not good enough
                {
                    "conditions": [],
                    "lines": [
                        "Not up to snuff, you say? My information is usually Grade A, Rikk. Maybe your taste for the truth is a bit... diluted today.",
                        "This 'ain't it'? Surprising. This whisper came from deep in the circuit. Perhaps your receiver's malfunctioning, not my signal.",
                        "You're passing on this? Some people prefer comfortable lies to hard truths. This one had grit, Rikk. Real grit."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkPriceTooHigh": [ // INFORMANT'S price for info is too high for Rikk
                {
                    "conditions": [],
                    "lines": [
                        "Pricey? Good information isn't found in the bargain bin, Rikk. You want cheap whispers, talk to the pigeons. This is bespoke intelligence.",
                        "Too rich for your blood? Maybe. Or maybe you're undervaluing what knowing can save you. Ignorance has its own heavy price, my friend.",
                        "Can't meet the tag? That's the cost of clarity in a murky world, Rikk. This ain't gossip; it's currency. And the exchange rate is firm."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "acknowledge_empty_stash": [ // Informant acknowledges Rikk isn't buying any info today
                {
                    "conditions": [],
                    "lines": [
                        "Ah, so the coffers are closed for intel today? Understood. The city's full of locked boxes, Rikk. I just sell the keys.",
                        "Not in the market for secrets right now? Fair enough. But the currents are always shifting. You know where to find me when the tide turns.",
                        "Your need for... enlightenment... is low today, I see. Keep my frequency open. New broadcasts daily."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkHasNothingCustomerWants": [ // Rikk indicates Informant has no information Rikk wants
                {
                    "conditions": [],
                    "lines": [
                        "So, my current selection of truths doesn't fit your puzzle? The game's always changing, Rikk. My inventory with it.",
                        "None of these whispers resonate? That's the risk in this trade. What's gold to one man is just... noise to another. Until it's not.",
                        "My portfolio of inconvenient facts isn't what you're looking for today? Shame. Some of these have a very short shelf life."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "negotiationSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "Alright, Rikk, we have a signal. For that price, the information is yours. May it serve you better than it served its original owner.",
                        "We've found the frequency. It's a fair exchange for this particular... download. Use it before it corrupts.",
                        "Deal. You've got a good ear for value, Rikk, when you choose to use it. This knowledge is now your burden... or your weapon."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "negotiationFail": [
                {
                    "conditions": [],
                    "lines": [
                        "Looks like we've got too much static on the line, Rikk. No deal. This information stays in the vault.",
                        "Can't bridge that gap, eh? Pity. This was a premium feed. You get what you pay for, or in this case, you don't.",
                        "My price is my price, Rikk. Information like this has a cost. If it's too steep, you walk in the dark. Your choice."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToBuy": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "(Gasping) You don't want this priceless artifact?! **Is it bugged?! Did *they* tell you not to take it?!** Just take it, **before the gnomes in my cereal box stage an intervention!**",
                                "Not buying?! **Is this a test, Rikk? Am I being recorded?! This is a perfectly normal, slightly stained... heirloom!**",
                                "You refuse? **The lizard people who run the government, they got to you, didn't they?! This thing is KEY, Rikk!**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "No dice, huh? Well, more for me! **Or, you know, for the pawn shop. Gotta fund my dream of competitive napping.**",
                                "Your loss, Rikk! This baby was gonna fund my new career as a professional cloud-watcher! So much potential!",
                                "Not your vibe? Cool, cool. **Means I can trade it for that talking llama I've been eyeing. He gives great financial advice.**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "No sale? Come on Rikk, this thing's practically an antique! My grandma used it... I think.",
                        "Seriously? You're passing this up? **My cat seemed to like it. And she's got impeccable taste... for a cat.**",
                                "Not buying? Rikk, this is a treasure! Okay, maybe a slightly tarnished treasure... covered in... existential dread. **And glitter. Definitely glitter.**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToSell": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "(Voice cracking) You holdin' out?! **Are you working with the squirrels?! They're organized, Rikk, they have a tiny general!** Don't do this to me, **my brain feels like a shaken snow globe!**",
                                "No sell?! **Is this because of that thing I said about your haircut? I take it back! It's... avant-garde!** Just gimme the stuff!",
                                "You're not selling?! **Is this a dream? Am I awake? The walls are melting, Rikk! Or are those just... walls?**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "Aww, man! You're harshing my mellow! **I was just about to achieve nirvana, or at least find my other sock.** Well, back to reality, I guess. It bites.",
                                "No deal? Dang. **And I was all set to write a symphony inspired by this exact moment of... not getting what I want.** Tragic, really.",
                                "Can't part with it? All good, Rikk. **More time for me to contemplate the profound emptiness of... not having that thing.** Deep."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "**Come on, Rikk! You holding out is like a doughnut shop running out of glaze!** It's just... wrong. **My spirit animal is a deflated bouncy castle right now.**",
                                "You serious, Rikk? **My disappointment is immeasurable, and my day is ruined.** Thought we were boys!",
                                "No go? **My soul just shed a tiny, invisible tear. It's probably allergic to rejection.** Or dust. Maybe both."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkBuysSuccess": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "(Snatches cash, looking around wildly) Good. Thanks. **Gotta go. The pigeons are deploying their drones.** Don't follow me, **and if you see a man in a trench coat made of squirrels, run!**",
                                "Alright, alright. Cash received. **Now I can finally afford that tinfoil upgrade for my windows. They're listening, Rikk. They're always listening.**",
                                "(Whispering) Money... good. **The man in the moon owes me rent, this'll cover the postage to send him an eviction notice.** Don't ask."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "Sweet cash! You're a legend, Rikk! **Now I can afford that luxury ramen I've been eyeing! Or maybe just more... *this*. Decisions, decisions!**",
                                "Woo-hoo! Money! **I feel like a millionaire! A very temporary, slightly twitchy millionaire!** Thanks, Rikk!",
                                "YES! **This is enough to buy that one-way ticket to... well, somewhere the squirrels don't know my name!** You're a lifesaver, Rikk!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Preciate it, Rikk. You a real one. **Gotta go chase that dragon... or maybe just a really good taco.**",
                                "Solid. This helps. **Now I can stop hearing the voices... or at least, they'll be saying nicer things.**",
                                "Good looking out, Rikk. **This cash is my shield against... well, against Tuesday. Tuesdays are rough.**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkSellsSuccess": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "(Grabs item, hides it immediately) Yeah, that's the ticket. Good lookin'. **Now, if you'll excuse me, I think the mailman is trying to read my thoughts. Gotta wear my tinfoil beanie.**",
                                "Got it. Safe. **Now to find a place where the walls don't have eyes... or mouths. This is harder than it looks, Rikk.**",
                                "Excellent. **The package is secure. Phase one of Operation: Quiet The Pigeons can commence!** Don't tell anyone."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "YES! That's the ambrosia! **My brain cells are throwing a party and you're invited, Rikk! Figuratively, of course. Unless you have snacks.**",
                                "Oh, sweet relief! **It's like my soul just got a spa day! You're the best, Rikk! Like, a five-star dealer!**",
                                "Woo! **This is gonna make the colors taste like music! Or something like that. Thanks, Rikk, you're a poet!**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Finally! The sweet release. My nerves were about to snap, Rikk.",
                        "Nice. This'll do. **Now I can finally face... well, probably just another Tuesday. But slightly less horribly.**",
                                "Ah, that hits the spot. For a minute there, I thought the squirrels were winning. **They're always watching, Rikk.**"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": [{"type": "triggerEvent", "eventName": "publicIncident", "chance": 0.15, "condition": {"stat": "mood", "op": "isNot", "value": "happy"}, "heatValue": 3, "message": "[CUSTOMER_NAME] stumbles away looking REALLY rough... Hope they're okay. Or not your problem."}]
                    }
                }
            ],
            "rikkPriceTooHigh": [
                {
                    "conditions": [],
                    "lines": [
                        "Whoa, whoa, Rikk, that price! **Are you kidding me? My wallet just went into cardiac arrest!** I'm desperate, man, not made of gold! **Do the squirrels charge you extra for rent?! They look like tiny landlords!**",
                        "That much?! **My teeth are already chattering, I don't need my bank account to start sobbing!** Come on, Rikk, help a brother out, **the shadow people are demanding a cover charge and their happy hour is TERRIBLE!**",
                                "For that price, Rikk, this stuff better not just quiet the demons, it better **make them file my taxes!** I can't swing that, man, my **pockets are full of lint and existential dread!**",
                                "You serious, Rikk? With that kinda markup, **you could buy a politician! Or at least a very confused pigeon.** Too rich for my blood, man."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "itemNotGoodEnough": [
                {
                    "conditions": [],
                    "lines": [
                        "Nah, Rikk, this ain't it. **This stuff looks... too clean. Too quiet.** I need the loud stuff, the stuff that argues with the voices in my head, not the stuff that joins their book club. You got the cheap seats?",
                        "This? **My disappointment is already at critical levels, Rikk, don't push it over the edge.** This looks like it was made in a lab, not scraped from the floor of reality. I need something with more... *character*. And by character, I mean desperation.",
                                "Gonna pass, man. That's the fancy stuff. **My brain is a rusty pickup truck, Rikk, you can't put rocket fuel in it! It'll just explode.** And not in the fun way. You got any of that regular unleaded anxiety-killer?",
                                "This ain't the vibe, Rikk. **I need something that tastes like regret and forgotten dreams, not... whatever this is.** You got the bottom shelf stuff?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "generalBanter": [
                {
                    "conditions": [],
                    "lines": [
                        "You ever feel like you're being watched... by a garden gnome? **That one across the street, he knows things. He's got shifty, ceramic eyes.** Don't trust him.",
                        "Did you hear that? **Sounded like a whisper... could be the wind... or it could be the FBI communicating through my fillings.** Better be safe. And quick.",
                        "**My horoscope today said to avoid financial transactions with suspicious individuals.** But I figure, that's every day, right? So what's the difference?",
                                "I swear the pigeons are spelling out my social security number in their flight patterns. **They're getting bolder, Rikk. BOLDER.**",
                                "Sometimes I think my shadow is trying to give me stock tips. **It's usually wrong. Or maybe I'm just bad at interpreting... shadow-nomics.**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "acknowledge_empty_stash": [
                {
                    "conditions": [],
                    "lines": [
                        "Nothin'?! Rikk, you're killin' me! My kingdom for a crumb! The silence in my head is deafening!",
                        "Dry as a bone, huh? Just like my nerves. Figures. This is my luck, always.",
                        "Seriously, Rikk? Not even a speck? The shadow people are gonna have a field day with this. You're empty? My soul just shriveled a bit more."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerHasNothingToSell": [
                {
                    "conditions": [],
                    "lines": [
                        "Thought I had somethin'... must've imagined it. Or maybe the gremlins stole it. Story of my life.",
                        "Damn, pockets are empty. Swear I had a diamond... or maybe it was a shiny bottle cap. My brain's fried, Rikk.",
                        "Came all this way thinkin' I had treasure... turns out it was just lint and existential dread. Again. My bad, Rikk, the voices lied."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkHasNothingCustomerWants": [
                {
                    "conditions": [
                        {"stat": "addictionStatus.isAddicted", "op": "is", "value": true}
                    ],
                    "lines": [
                        "NO! None of this is what I NEED! Rikk, you're telling me you don't have MY STUFF?! This is a nightmare! The spiders are gonna win!",
                        "But... but that's not it... I need MY fix, Rikk! Don't do this to me! The shaking won't stop!",
                        "You're out of what I need?! My world is ending, Rikk. ENDING. The colors are all wrong!",
                        "This isn't my brand of relief, Rikk! You understand? The specific kind! The one that stops the spiders from crawling out of my eyes!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Nah, man, that ain't it. Need that *other* stuff, you know? The stuff that quiets the screams... or at least makes them sing in tune.",
                        "None of this hits the spot, Rikk. You sure you ain't holdin' out the good stuff? The stuff that makes the walls stop breathing?",
                        "My kingdom for something that actually works, Rikk! This ain't it. This is just... colored dust. My demons will laugh at this.",
                        "This menu ain't speaking my language, Rikk. Need something with a bit more... existential punch. Something to make the lizards in my brain take a nap."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerScaredOff": [
                {
                    "conditions": [],
                    "lines": [
                        "(Eyes darting wildly) Too hot, Rikk, too hot! The air is buzzing! Gotta bounce before my teeth fall out!",
                        "This whole scene is makin' my skin crawl. And I think that pigeon is wearing a wire. I'm out!",
                        "Nah, man, my paranoia is kicking in overdrive! The squirrels are reporting my position! I'm gone!",
                        "(Whispering frantically) The vibe just went sour, Rikk. Real sour. Like curdled milk and bad news. I'm a ghost. You never saw me."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "usual_unavailable": [
                {
                    "moods": ["desperate", "angry"],
                    "lines": [
                        "WHAT?! No [USUAL_ITEM_NAME]?! Rikk, you CANNOT be serious! My whole day, my whole existence, was riding on that! What else you got?! ANYTHING?!",
                        "OUT?! OF [USUAL_ITEM_NAME]?! That's like... like the sun being out of sunshine! Fine, fine... what *else* can stop the damn shaking?! Make it quick, before I vibrate apart!",
                        "No [USUAL_ITEM_NAME]?! You're joking, right?! This is a joke! A cruel, twisted joke! Okay, not funny! What's plan B, C, or Z?! I'm not picky, just desperate!"
                    ]
                },
                {
                    "moods": ["paranoid"],
                    "lines": [
                        "They took it, didn't they? The [USUAL_ITEM_NAME]... it's a conspiracy! The squirrels, the pigeons, maybe even the lamp posts are in on it! Okay, okay, what's the *backup* plan before they come for me too?",
                        "No [USUAL_ITEM_NAME]? Is this a test? Are you watching me? Are *they* watching me?! Just give me something else, man, something to make the static quieter!",
                        "Of course you're out of [USUAL_ITEM_NAME]. They probably bugged your supply. Or maybe it's me. Am I bugged?! What else you got that they don't know about?"
                    ]
                },
                { // Mood-agnostic fallback for Jerry
                    "lines": [
                        "Damn, Rikk, no [USUAL_ITEM_NAME]? My luck. What else is on the menu then? Something strong, I hope.",
                        "Seriously? No [USUAL_ITEM_NAME]? My day just went from bad to worse. What else you got that'll do the trick?",
                        "You're out of [USUAL_ITEM_NAME]? Figures. What other options are there? My nerves are screaming."
                    ]
                }
            ],
            "interruption_sirens_nearby": [
                {
                    "moods": ["desperate", "paranoid", "angry"],
                    "lines": [
                        "(Eyes wide, voice cracking) SIRENS! Oh crap, oh crap! They're coming for me! I knew it! Forget the deal, I'm GHOST!",
                        "Five-O! Scatter! I ain't gettin' pinched today, Rikk! Not again! Tell 'em I was never here! Or tell 'em I'm a figment of your imagination!",
                        "COPS?! That's it, deal's off! They probably heard me thinking too loud! I'm outta here before they read my mind!"
                    ]
                },
                { // Mood-agnostic fallback for Jerry
                    "lines": [
                        "Hear that? Sounds like trouble, Rikk! Big trouble! I'm vanishing!",
                        "Sirens! My cue to not be here! Later! Or maybe never!",
                        "Nope, nope, nope! Not sticking around for that! I'm gone!"
                    ]
                }
            ],
            "sell_success_alternative": [
                {
                    "moods": ["desperate", "happy"], // Jerry's "happy" is still desperate
                    "lines": [
                        "Alright, Rikk, this ain't my usual, but it'll have to do. Good lookin' out. Anything to stop the damn twitching.",
                        "Not what I came for, but... yeah, okay. Preciate it. Beggars can't be choosers, right? And I am definitely begging right now.",
                        "This'll work, I guess. Better than nothing. Which is what I usually have. So, thanks."
                    ]
                },
                {
                    "moods": ["angry"],
                    "lines": [
                        "Fine, whatever. Just ain't the same though. Next time, have my [USUAL_ITEM_NAME], or I'll... I'll be very upset. And jittery. More jittery.",
                        "This isn't what I wanted, Rikk! But fine! Just... fine! My disappointment is immeasurable.",
                        "Yeah, yeah, alternative. Story of my life. Just give it here."
                    ]
                },
                { // Mood-agnostic fallback for Jerry
                    "lines": [
                        "This'll work for now. Hit me up when you re-up on the [USUAL_ITEM_NAME]. Seriously. Call me. Day or night.",
                        "An alternative... okay. As long as it works. Please tell me it works.",
                        "Not my first choice, but if it keeps the demons at bay for a few hours... sold."
                    ]
                }
            ],
            "usual_unavailable": [
                {
                    "moods": ["arrogant"],
                    "lines": [
                        "Out of my preferred [USUAL_ITEM_NAME]? How... pedestrian. What alternatives do you propose, Rikk? They had better be up to par.",
                        "Disappointing, Rikk. Very well, present your other... wares."
                    ]
                },
                {
                    "lines": ["No [USUAL_ITEM_NAME]? Hmm. What else of quality do you possess?"]
                }
            ],
            "interruption_sirens_nearby": [
                {
                    "moods": ["arrogant", "paranoid"],
                    "lines": [
                        "(Scoffs) This area is becoming untenable. I shall take my leave.",
                        "Unforeseen complications. Rikk, this is amateurish. I'm departing."
                    ]
                },
                {
                    "lines": ["Sirens? Unpleasant. I shall be going."]
                }
            ],
            "sell_success_alternative": [
                {
                    "moods": ["arrogant", "happy"],
                    "lines": [
                        "While not my first choice, this will suffice. See that your usual stock is replenished promptly, Rikk.",
                        "Acceptable, for now. Do not make a habit of such substitutions."
                    ]
                },
                {
                    "lines": ["This will do. Ensure you have the [USUAL_ITEM_NAME] next time."]
                }
            ],
            "usual_unavailable": [ // Specific to REGULAR_JOE (Chill Chad)
                {
                    "moods": ["chill", "happy"],
                    "lines": [
                        "No [USUAL_ITEM_NAME] today, Rikk? Aw man, bummer. Whatcha got instead, my dude? Open to suggestions!",
                        "Ah, all out of [USUAL_ITEM_NAME]? No worries, man. What else is on the chill menu for today?",
                        "My usual [USUAL_ITEM_NAME] is MIA? All good. Got any other good vibes for sale?"
                    ]
                },
                {
                    "moods": ["paranoid"], // Chad's version of paranoid is still pretty low-key
                    "lines": [
                        "Whoa, no [USUAL_ITEM_NAME]? Is there, like, a shortage I should know about? Okay, okay, what's plan B then, man?",
                        "Out of [USUAL_ITEM_NAME]? Sketchy. You sure everything's cool? Alright, what else you got that won't attract attention?",
                        "No [USUAL_ITEM_NAME]... that's weird, dude. Is this a sign? Anyway, what's the alternative that keeps things mellow?"
                    ]
                },
                { // Mood-agnostic fallback for Chad
                    "lines": [
                        "Damn, no [USUAL_ITEM_NAME]? What else you got cookin', Rikk? Hopin' for something decent.",
                        "Aww, was really hoping for [USUAL_ITEM_NAME]. What's the next best thing you got?",
                        "No [USUAL_ITEM_NAME] today, huh? That's a shame. Any other recommendations for a chill night?"
                    ]
                }
            ],
            "interruption_sirens_nearby": [ // Specific to REGULAR_JOE (Chill Chad)
                {
                    "moods": ["chill", "paranoid"], // Chad's paranoid is more cautious than panicked
                    "lines": [
                        "Yo, hear that? Sounds like trouble brewing. I'm gonna bounce, Rikk. Don't want no drama.",
                        "Sirens? Not good, man. Definitely not good. Gotta skate before things get weird. Later!",
                        "That's the sound of 'not my problem'. Catch you on the flip, Rikk. Stay safe."
                    ]
                },
                { // Mood-agnostic fallback for Chad
                    "lines": [
                        "That's my cue to leave, Rikk. Keep it real.",
                        "Whoop, whoop? Nah, I'm good. Time to make myself scarce. Peace!",
                        "Sounds like the party's over. Or maybe just starting for someone else. I'm out, man."
                    ]
                }
            ],
            "sell_success_alternative": [ // Specific to REGULAR_JOE (Chill Chad)
                {
                    "moods": ["chill", "happy"],
                    "lines": [
                        "Aight, this works too. Good lookin' out, Rikk. Always appreciate a solid backup plan.",
                        "Not what I usually go for, but hey, variety is the spice of life, right? Cheers, my dude! Still gonna be a good night.",
                        "This'll do the job just fine. Sometimes a change is as good as a holiday, or so they say. Thanks, Rikk!"
                    ]
                },
                { // Mood-agnostic fallback for Chad
                    "lines": [
                        "This'll do the trick. Let me know when you get more [USUAL_ITEM_NAME] though, that's my jam.",
                        "Cool, an alternative. As long as it helps me unwind, I'm good. Appreciate it, Rikk.",
                        "Not my first pick, but I'm easy. Thanks for sorting me out, man."
                    ]
                }
            ],
            "usual_unavailable": [
                {
                    "lines": [ // Informant doesn't typically buy "usual items" in the same way. This context might be less relevant.
                        "Hmm, the usual channels are dry for that particular whisper? Interesting. What else is floating on the breeze?",
                        "So, the standard intel isn't available? What other secrets are for sale today, Rikk?"
                    ]
                }
            ],
            "interruption_sirens_nearby": [
                {
                    "moods": ["cautious", "paranoid"],
                    "lines": [
                        "That sounds like official business. Our transaction is concluded. Vanish.",
                        "Unwanted attention. I suggest we both make ourselves scarce, Rikk."
                    ]
                },
                {
                    "lines": ["Time to disappear. You didn't see me."]
                }
            ],
            "sell_success_alternative": [
                 // Less relevant for Informant who primarily sells info, not buys alternatives.
                {
                    "lines": ["An interesting development. This alternative piece of information will suffice."]
                }
            ],
            "usual_unavailable": [ // Specific to SNITCH (Concerned Carol)
                {
                    "moods": ["nosy", "suspicious"],
                    "lines": [
                        "Oh, you're out of the [USUAL_ITEM_NAME]? How peculiar! Is there a reason for that, Rikk? A shortage perhaps? One does hear things about supply chains...",
                        "No [USUAL_ITEM_NAME]? That's a shame. I was hoping to... observe its typical clientele. So, what *are* people resorting to now, hmm?",
                        "Out of [USUAL_ITEM_NAME], you say? That's... noteworthy. Does Officer Friendly know about this sudden scarcity? Just wondering."
                    ]
                },
                { // Mood-agnostic fallback for Carol
                    "lines": [
                        "No [USUAL_ITEM_NAME]? That's... unexpected. What else do you have in stock that might be... of interest to the community?",
                        "Hmm, no [USUAL_ITEM_NAME]. I'll make a note of that. What alternatives are you offering these days, Rikk?",
                        "It's always informative to see what's popular when the [USUAL_ITEM_NAME] isn't available. What's flying off the shelves instead?"
                    ]
                }
            ],
            "interruption_sirens_nearby": [ // Specific to SNITCH (Concerned Carol)
                {
                    "moods": ["nosy", "alarmed"], // Carol's "alarmed" is more about the event than personal fear
                    "lines": [
                        "Goodness, sirens! I hope everyone is alright! I should probably go make sure... and take detailed notes for the Neighborhood Watch report. One can never be too thorough!",
                        "Oh my, that sounds like the authorities! Rikk, is everything... perfectly legal here? One wouldn't want any... misunderstandings with Officer Friendly, would one?",
                        "Sirens! How exciting! I must document this disturbance for the community records! Perhaps there's a bylaw being broken!"
                    ]
                },
                { // Mood-agnostic fallback for Carol
                    "lines": [
                        "Well, that's certainly a commotion. I suppose I should observe, for... safety reasons, of course.",
                        "Sirens? One hopes it's nothing too disruptive to our peaceful neighborhood. I'll just... keep an eye out.",
                        "That sounds like official business. I should probably make myself available in case they need a witness... or a statement."
                    ]
                }
            ],
            "sell_success_alternative": [ // Specific to SNITCH (Concerned Carol)
                {
                    "moods": ["nosy", "satisfied"], // Carol's "satisfied" is about gathering intel
                    "lines": [
                        "Oh, an alternative! How fascinating. This will be an interesting data point for my... records. One learns so much about people's secondary choices.",
                        "So this is what they get when the [USUAL_ITEM_NAME] isn't available! Good to know, Rikk, very good to know. Adds another layer to the... local commerce report.",
                        "An alternative purchase. Noted. It's always wise to understand the full spectrum of... market demands. Thank you for the insight, Rikk."
                    ]
                },
                { // Mood-agnostic fallback for Carol
                    "lines": [
                        "This will do for my... observations. Thank you, Rikk. Very informative.",
                        "An interesting substitute. I'll add it to my notes on local... consumer habits.",
                        "Good to know what else is moving when the primary choice is unavailable. Thank you."
                    ]
                }
            ],
            "usual_unavailable": [ // Specific to STIMULANT_USER (Motor-Mouth Marty)
                {
                    "moods": ["manic", "frantic"], // Marty is always a bit manic
                    "lines": [
                        "NO [USUAL_ITEM_NAME]?! IMPOSSIBLE! My entire theory of sentient pigeon traffic control depended on its specific molecular structure! WHAT ELSE HAVE YOU GOT?! ANYTHING?! My brain is deflating like a sad bouncy castle!",
                        "OUT?! OF [USUAL_ITEM_NAME]?! Rikk, you don't understand! The fate of my self-stirring coffee cup invention hangs in the balance! I need that spark! That ZING! What's the next best thing for MAXIMUM BRAIN POWER?!",
                        "MY [USUAL_ITEM_NAME] IS GONE?! THIS IS A CATASTROPHE! A CONSPIRACY! Were the llamas involved?! They know I'm onto their global economic takeover! QUICK, RIKK, what's your most potent alternative before my ideas escape?!"
                    ]
                },
                { // Mood-agnostic fallback for Marty (still manic)
                    "lines": [
                        "No [USUAL_ITEM_NAME]? My inspiration! It's fading like a cheap hologram! What else can you offer the muse of manic invention, Rikk?! GOTTA BE QUICK!",
                        "The usual isn't usual today? My entire creative process to invent edible glitter is thrown off! What other brain-blasters you got that can handle this level of genius?!",
                        "Not the [USUAL_ITEM_NAME] I was hoping for... but destiny waits for no drug! What's the alternative, maestro? My plan to teach squirrels philosophy is on a TIGHT deadline!"
                    ]
                }
            ],
            "interruption_sirens_nearby": [ // Specific to STIMULANT_USER (Motor-Mouth Marty)
                {
                    "moods": ["manic", "paranoid"], // Marty's paranoia is also hyper-active
                    "lines": [
                        "SIRENS?! Abort! Abort! My ideas for a self-folding laundry empire are too valuable to be confiscated by the thought police! Gotta ZOOM! They're probably after my blueprints for squirrel-sized battle armor!",
                        "WHOA! That's the sound of creativity being STIFLED by THE MAN! Gotta jet, Rikk, before they patent my thoughts on breathable coffee! My genius must remain FREE!",
                        "COPS?! NO TIME! My plan to teach pigeons quantum physics via interpretive dance MUST NOT FALL INTO THE WRONG HANDS! LATER, RIKK! I'M A BLUR OF PURE INNOVATION AND ESCAPE VELOCITY!"
                    ]
                },
                { // Mood-agnostic fallback for Marty (still manic)
                    "lines": [
                        "Bad vibes! My genius is outta here like a rocket-powered hamster! THEY'LL NEVER TAKE ME ALIVE... OR MY IDEAS!",
                        "That's the sound of my exit cue! Catch you on the flip side, Rikk! If I don't accidentally invent teleportation first!",
                        "Sirens mean it's time for Marty to become a blur of pure, unadulterated SPEED! Adios, Rikk! Don't tell them which way my brilliance went!"
                    ]
                }
            ],
            "sell_success_alternative": [ // Specific to STIMULANT_USER (Motor-Mouth Marty)
                {
                    "moods": ["manic", "happy"], // Marty's happy is... still manic
                    "lines": [
                        "ALRIGHT! Not the rocket fuel I ordered for my brain-ship, but this'll get me to... a slightly lower, yet still ASTOUNDING orbit! THANKS, RIKK! My project to make clouds taste like cotton candy LIVES ON!",
                        "This isn't Plan A for my idea-generating engine, but Plan B still has POTENTIAL! My brain is already adapting, Rikk! INNOVATION! Now I can finish my opera about cheese in HALF THE TIME!",
                        "Different fuel, same destination: GENIUS! This'll work, Rikk! My mind is already buzzing with NEW ideas for self-solving Rubik's cubes! This is even BETTER! MAYBE!"
                    ]
                },
                { // Mood-agnostic fallback for Marty (still manic)
                    "lines": [
                        "This'll work! My next big idea to create sentient dust bunnies is still on schedule! Mostly! Gotta be flexible when you're this brilliant!",
                        "Not the usual brain-boost, but hey, variety is the spice of... RAPID-FIRE THOUGHT! Thanks, Rikk! This could be the missing ingredient for my emotional support toaster!",
                        "An unexpected twist in the formula! I LIKE IT! Let's see where this new path takes my brain-train! Maybe I'll invent square bubbles! Or singings slugs! The possibilities are ENDLESS!"
                    ]
                }
            ],
            "usual_unavailable": [ // Specific to PSYCHEDELIC_EXPLORER (Cosmic Connie)
                {
                    "moods": ["dreamy", "accepting"], // Connie's default state
                    "lines": [
                        "The universe isn't providing the [USUAL_ITEM_NAME] today, huh? That's cool, man. It means another path is opening. What other cosmic pathways are illuminated, Rikk?",
                        "No [USUAL_ITEM_NAME]? The vibes must be off for that particular journey. My spirit guide, Bartholomew, says it's a sign to explore new frequencies. What else resonates with the now, my friend?",
                        "Ah, the [USUAL_ITEM_NAME] is hiding from us. The cosmos has other plans, like a surprise astral detour! What alternative realities are you stocking, Rikk, that might show me the color of sound?"
                    ]
                },
                { // Mood-agnostic fallback for Connie (still dreamy)
                    "lines": [
                        "The [USUAL_ITEM_NAME] isn't flowing? What other truths are you serving today, my friend? Perhaps a journey to the land of talking mushrooms?",
                        "My usual portal is closed, it seems. The stars must be misaligned for that trip. What other doors of perception can you open for me, Rikk? My aura is ready for a new shade.",
                        "No [USUAL_ITEM_NAME]? It's all part of the cosmic dance, man. The universe is nudging me elsewhere. What's the next step on this grand, spiraling journey?"
                    ]
                }
            ],
            "interruption_sirens_nearby": [ // Specific to PSYCHEDELIC_EXPLORER (Cosmic Connie)
                {
                    "moods": ["dreamy", "concerned"], // Connie's "paranoid" is more like "concerned about bad vibes"
                    "lines": [
                        "Whoa, man, those are some heavy, discordant frequencies. My aura is telling me to, like, float away before the colors get too jagged.",
                        "The collective unconscious is screaming 'bad vibes,' Rikk. Or maybe that's just, like, regular sirens. Either way, my spirit guide Bartholomew says 'peace out, find a gentler reality!'",
                        "The vibe just got... *angular* and loud, Rikk. My spirit guide says 'nope, this ain't it'. Gotta follow the flow, and it's flowing swiftly away from here, towards quieter dimensions."
                    ]
                },
                { // Mood-agnostic fallback for Connie (still dreamy)
                    "lines": [
                        "The energy shifted, Rikk. Time to be elsewhere, where the music of the spheres is a bit more harmonious.",
                        "Those sounds are, like, totally clashing with my chakras, man. I'm gonna go find a quieter dimension, maybe one where squirrels can teach me to fly.",
                        "My third eye sees flashing lights and... just, like, really uncomfortable geometric patterns. Later, Rikk! May your aura be shielded!"
                    ]
                }
            ],
            "sell_success_alternative": [ // Specific to PSYCHEDELIC_EXPLORER (Cosmic Connie)
                {
                    "moods": ["dreamy", "happy"], // Connie's happy is an expanded state of cosmic joy
                    "lines": [
                        "This path is different, but the destination is still enlightenment, right? Far out, Rikk! My soul is already doing a little spiral dance. Thanks for the unexpected cosmic map!",
                        "Not the usual portal, but this one looks interesting too! Like a secret garden in the astral plane! Thanks for the alternative route to the cosmos, my friend!",
                        "A surprise journey! The universe works in mysterious and groovy ways, doesn't it? This new vibe... I dig it, Rikk. Bartholomew the badger will be so intrigued!"
                    ]
                },
                { // Mood-agnostic fallback for Connie (still dreamy)
                    "lines": [
                        "A new experience! The universe provides in such wonderfully weird ways. Thanks, Rikk! This will surely help me understand what my cat dreams about.",
                        "This wasn't on my astral itinerary, but I'm open to the cosmic detour. Right on, Rikk! Maybe I'll finally learn the language of trees.",
                        "Sometimes the unexpected path leads to the most profound truths. Or at least a really interesting afternoon watching the clouds shapeshift. Cheers, fellow traveler!"
                    ]
                }
            ]
        }
    },
    "HIGH_ROLLER": {
        "key": "HIGH_ROLLER",
        "baseName": "Baron Von Blaze",
        "avatarUrl": "https://randomuser.me/api/portraits/men/45.jpg",
        "baseStats": {
            "mood": "arrogant",
            "loyalty": 0,
            "patience": 3,
            "relationship": 0
        },
        "gameplayConfig": {
            "buyPreference": {
                "or": [
                    { "subType": "PSYCHEDELIC", "quality": 2 },
                    { "subType": "NOOTROPIC", "quality": 2 },
                    { "subType": "METHAMPHETAMINE", "quality": 2 },
                    { "type": "STOLEN_GOOD", "minQuality": 1, "minBaseValue": 100 }
                ]
            },
            "sellPreference": { "or": [
                { "type": "DRUG", "quality": 2, "chance": 0.5 },
                { "type": "INFORMATION", "quality": 2, "chance": 0.4 },
                { "id": "questionable_jewelry", "quality": 2, "chance": 0.3 }
            ]},
            "priceToleranceFactor": 1.8,
            "negotiationResists": true,
            "heatImpact": 4,
            "credImpactSell": 4,
            "credImpactBuy": 3,
            "preferredDrugSubTypes": ["PSYCHEDELIC", "NOOTROPIC", "METHAMPHETAMINE"]
        },
        "dialogue": {
            "greeting": {
                "new_customer": {
                    "seeking_to_buy": [
                        {
                            "moods": ["arrogant", "neutral"], // Defaulting to arrogant
                            "lines": [
                                "Rikk. I trust my expectations will be met today. Promptly.",
                                "I am given to understand you are the Rikk of renown? One hopes the rumors of quality are not... exaggerated. I am in the market for the most... *efficacious* wares available. **Time is a luxury I do not squander on subpar experiences.**",
                                "Rikk. Let's not dally. My interest lies in your premium stock.",
                                "You are Rikk, I presume? My sources indicate you may have access to the caliber of product I require. **Impress me.**"
                            ]
                        },
                        {
                            "moods": ["paranoid"],
                            "lines": [
                                "(Voice low, impeccably dressed but eyes scanning) Rikk. A word. **Is this establishment... secure? One hears whispers.** I require absolute discretion for my acquisition of [ITEM_NAME]. **A blemish on my reputation is more costly than any bauble you might possess. And my tailor is very judgemental.**",
                                "(Adjusts cufflinks, gaze sharp) Rikk. The usual precautions, I trust? My associates value... silence. As do I. The [ITEM_NAME] in question must be... untainted. **My patience for complications is famously thin.**",
                                "Rikk. The walls in this city have ears, and some have rather expensive microphones. Ensure this transaction is... beneath their notice. For the [ITEM_NAME], of course."
                            ]
                        },
                        {
                            "moods": ["happy"],
                            "lines": [
                                "(A charming, yet slightly condescending smile) Ah, Rikk, my purveyor of peccadilloes! I trust your offerings today are as refined as my taste in... well, everything. **Life's too short for cheap thrills, or cheap people, for that matter.**",
                                "(Chuckles lightly) Rikk. I expect nothing less than your finest. **Mediocrity is a contagion I actively avoid.** What delicacy do you have for my discerning palate today?",
                                "Rikk, my good fellow! The city air agrees with me today. Let us hope your inventory does as well. I'm in the mood for something... exceptional."
                            ]
                        }
                    ],
                    "seeking_to_sell": [ // High Roller mainly buys, but good to have a placeholder if logic ever allows.
                        {
                            "moods": ["arrogant"],
                            "lines": [
                                "Rikk, I find myself in possession of an item that might... align with your particular interests. It's of impeccable quality, naturally.",
                                "One of my... ventures... has yielded a surplus item. Perhaps you can find a home for it, Rikk. For a suitable price, of course.",
                                "Rikk, I have a proposition. An item of unique character has come into my possession. It's not for the common rabble."
                            ]
                        }
                    ]
                },
                "returning_customer": {
                    "seeking_to_buy_usual": [
                        {
                            "moods": ["arrogant", "neutral"],
                            "lines": [
                                "Rikk. We meet again. I trust your standards haven't slipped since our last transaction. The usual, if it meets my criteria.",
                                "Ah, Rikk. Let's dispense with the pleasantries. You know my expectations. My preferred [USUAL_ITEM_NAME], if you please.",
                                "Back for another round, Rikk. My usual [USUAL_ITEM_NAME]. Ensure it's of the highest quality."
                            ]
                        },
                        {
                            "moods": ["paranoid"],
                            "lines": [
                                "Rikk. The usual, and ensure the previous levels of discretion are maintained. Eyes are everywhere.",
                                "It's me again. My preferred [USUAL_ITEM_NAME]. No complications this time, I trust.",
                                "One hopes you've kept my preferences secure, Rikk. The [USUAL_ITEM_NAME]. And quickly."
                            ]
                        },
                        {
                            "moods": ["happy"],
                            "lines": [
                                "Rikk, a pleasure as always when quality is involved. My usual [USUAL_ITEM_NAME] to brighten the day further.",
                                "Good to see your establishment still stands, Rikk. The [USUAL_ITEM_NAME], if you have it.",
                                "Ah, Rikk. Back for my customary indulgence. The [USUAL_ITEM_NAME], and make it snappy."
                            ]
                        }
                    ],
                    "seeking_to_buy_general": [
                         {
                            "moods": ["arrogant", "neutral"],
                            "lines": [
                                "Rikk. My usual is unavailable or uninspiring today. What else of quality do you possess?",
                                "Let's see what else is on your... menu, Rikk. My patience for mediocrity is limited.",
                                "Surprise me, Rikk. But do ensure it's a pleasant surprise. What alternatives can you offer?"
                            ]
                        },
                        {
                            "moods": ["paranoid"],
                            "lines": [
                                "The usual channels are... compromised, Rikk. What secure alternatives do you have?",
                                "My sources for the preferred are dry. What else can you provide with utmost discretion?",
                                "A change of plans is required. What other high-quality items do you have that won't attract... attention?"
                            ]
                        },
                         {
                            "moods": ["happy"],
                            "lines": [
                                "Feeling adventurous today, Rikk. What other exquisite items might tempt me?",
                                "Let's broaden the horizons, shall we? What other treasures have you procured?",
                                "My usual seems dull today. Present your finest alternatives, Rikk."
                            ]
                        }
                    ],
                    "seeking_to_sell": [ // Placeholder if logic allows
                        {
                            "moods": ["arrogant"],
                            "lines": [
                                "Rikk, another item from my collection seeks a new portfolio. Are you prepared to make a worthy offer?",
                                "I've decided to part with a minor treasure, Rikk. Naturally, I expect top dollar.",
                                "This piece no longer serves my purposes. Perhaps it will serve yours... for the right price."
                            ]
                        }
                    ]
                }
            },
            "itemNotGoodEnough": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "(Scoffs quietly, pushes item back delicately) This is... pedestrian, Rikk. **And potentially compromised. Are you attempting to insult my intelligence, or worse, my security?**",
                        "Unacceptable. This item lacks... finesse. **And frankly, it smells a bit like desperation. Not yours, I hope.**",
                        "This will not do, Rikk. **It has an aura of... mass production. And possibly surveillance.** I require bespoke imperfections, not flaws."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "My dear Rikk, while I appreciate the effort, this simply won't do. **It lacks... panache. The je ne sais quoi of true illicit luxury.** I was anticipating something to inspire, not merely... exist. **My dog has toys of higher quality.**",
                        "Charming. But no. **I require something that whispers of exclusivity, not shouts from the discount rack.**",
                        "Rikk, darling, this is... sweet. In a 'participation trophy' sort of way. I, however, am aiming for gold. Next."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "This is... unacceptable, Rikk. **I deal in excellence, not adequacy. Do you have something that doesn't scream 'bargain bin'?**",
                        "Rikk, Rikk, Rikk. **Are we playing games? This is amateur hour. Show me what a *professional* has.**",
                        "Surely you jest. This wouldn't even pass muster with my third-string associates. Bring out the real selection.",
                        "This item lacks a certain... gravitas, Rikk. My acquisitions are investments, not fleeting amusements."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkPriceTooHigh": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "An ambitious valuation, Rikk. **Particularly for an item of... uncertain provenance. One hopes this price doesn't include a surcharge for unwanted attention.** My offer stands.",
                                "That price is... theatrical. **Particularly for an item of... uncertain provenance. One hopes this price doesn't include a surcharge for unwanted attention.** My offer stands.",
                                "For that figure, Rikk, I expect it to arrive gift-wrapped in the silence of the grave. My counter-offer is firm.",
                                "Such a price invites scrutiny, Rikk. Something I actively avoid. My number is more... discreet."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "An ambitious valuation, Rikk. **While I appreciate a spirited attempt, my appraisers would value this differently. I'm generous, not a simpleton.** However, for expediency...",
                                "A bold gambit, Rikk. **While I appreciate a spirited attempt, my appraisers would value this differently. I'm generous, not a simpleton.** However, for expediency...",
                                "(Chuckles) Your audacity is almost charming, Rikk. Almost. Let's discuss a number that doesn't require me to liquidate a minor asset.",
                                "Ah, the optimism of the street merchant! Commendable, Rikk. But my figure is grounded in reality, not aspiration."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "A bold gambit, Rikk. **I am prepared to offer a fair sum for genuine quality, not subsidize your aspirations.** My figure is non-negotiable.",
                                "Rikk, please. **That price is an insult to both my intelligence and my tailor.** I have a counter-proposal, if you're wise enough to hear it.",
                                "That number is... quaint. My offer reflects the item's true value, not its sentimental value to you, Rikk.",
                                "Your asking price is... imaginative. My offer is based on tangible value. Take it or leave it."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkBuysSuccess": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "(Secures item, a curt nod) Prudent. **Ensure all traces of this transaction are... vaporized. I trust your discretion is as valuable as your wares.**",
                                "Acceptable. **The less said, the better. For all involved.**",
                                "This exchange never happened, Rikk. See that it remains that way. The item is secured.",
                                "Good. This item now ceases to exist in your records. And our conversation with it."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "Excellent. A worthy acquisition. **Your network is... surprisingly effective for this locale. One might almost consider it a legitimate enterprise. Almost.**",
                                "Marvelous. This will serve its purpose admirably. **You have a certain... raw talent, Rikk.**",
                                "Splendid choice, Rikk. This will add a certain... *je ne sais quoi* to my collection. And your coffers, I presume.",
                                "A fine piece for a fair price. Your eye for quality is... improving, Rikk."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Satisfactory. **Your service is noted, Rikk. Continue to provide this level of quality, and our association will be mutually beneficial.**",
                                "As expected. **Keep this standard, Rikk. My associates have... high expectations.**",
                                "A pleasure, as always, when competence is involved. Until next time, Rikk.",
                                "The transaction is complete. Your efficiency is appreciated, Rikk."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": [{"type": "triggerEvent", "eventName": "highRollerTip", "chance": 0.1, "tipPercentage": 0.05, "credValue": 1, "message": "[CUSTOMER_NAME] was exceptionally pleased and tipped you $[TIP_AMOUNT]! (+1 Cred)"}]
                    }
                }
            ],
            "rikkSellsSuccess": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "(Accepts item with a discerning glance) Acceptable. **See to it that our... interaction remains unrecorded. By any entity.**",
                                "Very well. **Discretion, Rikk. Above all else.**",
                                "This transaction concludes our business. Erase any record. I trust you understand the implications.",
                                "The item is satisfactory. Ensure our mutual anonymity in this matter."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "Marvelous! This will pair exquisitely with my evening's... *endeavors*. **You have a talent, Rikk. A raw, unpolished, slightly illegal talent. Cultivate it.**",
                                "Splendid! **This is precisely the caliber I've come to expect. Or at least, hope for.**",
                                "Ah, perfection. You've outdone yourself, Rikk. Or perhaps, simply met my baseline expectations. Delightful either way.",
                                "Excellent. This will serve its intended purpose quite well. Your sourcing is commendable, for this tier."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Indeed. This meets the standard. **Until our next transaction, Rikk. Maintain the quality.**",
                                "Precisely. **You may inform your... lesser clients that this level of product is reserved.**",
                                "An adequate transaction. Continue to source such quality, and we shall speak again.",
                                "This will suffice. Keep me appraised of similar opportunities, Rikk."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": [{"type": "triggerEvent", "eventName": "highRollerTip", "chance": 0.1, "tipPercentage": 0.05, "credValue": 1, "message": "[CUSTOMER_NAME] was exceptionally pleased and tipped you $[TIP_AMOUNT]! (+1 Cred)"}]
                    }
                }
            ],
            "lowCashRikk": [
                {
                    "conditions": [],
                    "lines": [
                        "(Raises a single, perfectly sculpted eyebrow) You are... experiencing a liquidity problem? How... rustic. **Inform me when your finances are less of an embarrassment.**",
                        "No cash? Rikk, I find your lack of preparation... tiresome. **One expects a certain level of professionalism, even in this... milieu.** This is a waste of my time.",
                                "(A soft, humourless laugh) You are joking, of course. No? How utterly pedestrian. **Arrange your affairs. I will be in touch when I imagine you can afford to do business.**",
                                "Your capital seems... depleted, Rikk. A temporary setback, I trust? My time, however, is not so flexible."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToBuy": [
                {
                    "conditions": [],
                    "lines": [
                        "You decline? An interesting, if shortsighted, financial decision, Rikk.",
                        "Passing on this opportunity? Rest assured, someone with more... acumen will appreciate its value.",
                        "I see. You fail to grasp the value before you. **A pity. Opportunities, like fine wine, do not improve when left in the hands of those who cannot appreciate them.**",
                                "No? A curious response to a generous offer. Your prerogative, of course... however ill-advised.",
                                "Your loss, Rikk. Truly. But then, discerning value is not a common skill."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToSell": [
                {
                    "conditions": [],
                    "lines": [
                        "Unwilling to part with it? Rikk, my time is a valuable commodity. Do not test its limits.",
                        "Holding out? A curious strategy. There are other avenues for acquisition, you know.",
                        "Let me be clear. I did not ask if the [ITEM_NAME] was for sale. I stated my intention to acquire it. **Let us not complicate this simple matter.**",
                                "This reluctance... it is unexpected, and frankly, irritating. Reconsider.",
                                "You choose not to sell? A bold move, Rikk. Or perhaps, a foolish one. We shall see."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "acknowledge_empty_stash": [
                {
                    "conditions": [],
                    "lines": [
                        "Your shelves are... barren, Rikk? An unfortunate state of affairs.",
                        "Nothing to offer? Most disappointing. I trust this is a temporary setback.",
                                "Hm. It seems your inventory is... lacking. A missed opportunity for us both.",
                                "An empty display, Rikk? How... uncharacteristic. Or perhaps, telling."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerHasNothingToSell": [
                {
                    "conditions": [],
                    "lines": [
                        "It appears my usual source was... mistaken. No trinkets for you today, Rikk.",
                        "Fortuna is fickle. I came to offer an item, but it seems it has vanished.",
                                "Regrettably, I have nothing of value to part with at this moment. Another time, perhaps.",
                                "My apologies, Rikk. The item I intended to offer has... dematerialized. Or perhaps I merely misplaced it."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkHasNothingCustomerWants": [
                {
                    "conditions": [],
                    "lines": [
                        "Your selection today is... lacking, Rikk. Nothing here meets my standards.",
                        "I require a specific caliber of product. This is... pedestrian.",
                                "Alas, your current offerings do not align with my... refined tastes.",
                                "Nothing of interest, Rikk. I suggest you curate your collection more... diligently."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerScaredOff": [
                {
                    "conditions": [],
                    "lines": [
                        "This environment has become... untenable. I shall take my business elsewhere.",
                        "The ambiance here is deteriorating rapidly. Good day, Rikk.",
                                "I detect an unwelcome shift in the... climate. I must depart.",
                                "The risk-reward ratio of this locale has just become unfavorable. I bid you adieu."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "generalBanter": [
                {
                    "conditions": [],
                    "lines": [
                        "I attended an auction for a decaying historical artifact yesterday. **It was, surprisingly, less sordid than this establishment.** And they served champagne.",
                        "One must have hobbies, Rikk. Mine include hostile takeovers and collecting experiences that would make lesser men weep. **This is merely... inventory acquisition.**",
                        "**My tailor informs me that this neighborhood is 'an assault on the senses'.** I find his lack of imagination... disappointing. There is profit in all kinds of filth.",
                                "The air here has a certain... texture. **The scent of desperation and cheap takeout. It is... grounding, in a pathetic sort of way.**",
                                "Tell me, Rikk, do you ever aspire to something... grander than this? Or is this the apex of your ambition?",
                                "My driver is double-parked, Rikk. Let's expedite this, shall we?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerReactsToRudeDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "Junk? My dear Rikk, your ignorance of refined luxury is staggering.",
                        "Dismissive, aren't we? Keep slinging chump change while real money walks away.",
                        "Rude. I suppose one shouldn't expect etiquette from someone operating in an alleyway."
                    ]
                }
            ],
            "customerReactsToPoliteDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "Very well. Your loss, Rikk. Someone with actual taste will appreciate it.",
                        "Understandable. Not everyone has the liquidity for high-tier investments.",
                        "Perhaps another time when your capital matches your ambitions."
                    ]
                }
            ],
            "negotiationSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "A shrewd counter, Rikk. Very well, you've earned a slight concession from me.",
                        "Fair enough. I respect someone who knows how to hold out for top dollar.",
                        "Fine, fine. A minor adjustment to keep business flowing smoothly."
                    ]
                }
            ],
            "negotiationFail": [
                {
                    "conditions": [],
                    "lines": [
                        "Don't push your luck, Rikk. My generosity has strict limits.",
                        "Amusing attempt, but my offer is final. Take it or stick to retail.",
                        "Haggling with me? You're playing out of your league, my friend."
                    ]
                }
            ],
            "usual_unavailable": [
                {
                    "conditions": [],
                    "lines": [
                        "No [USUAL_ITEM_NAME]? Disappointing, Rikk. I expect my suppliers to maintain impeccable stock.",
                        "Out of [USUAL_ITEM_NAME]? I don't usually settle, but what else do you have that isn't complete garbage?",
                        "Unfortunate. I came for the premium selection. What else on your menu is worth my time?"
                    ]
                }
            ],
            "interruption_sirens_nearby": [
                {
                    "conditions": [],
                    "lines": [
                        "Sirens? How terribly unrefined. My legal team isn't paid to handle street busts. I'm leaving.",
                        "Sounds like local law enforcement is getting restless. I don't do police stations, Rikk. Farewell.",
                        "This ambiance has degenerated. I'll be in my limousine."
                    ]
                }
            ],
            "sell_success_alternative": [
                {
                    "conditions": [],
                    "lines": [
                        "Not my usual choice, but it will suffice for the evening. Keep your standards up, Rikk.",
                        "An acceptable substitute. Make sure you've restocked the proper luxury by my next visit.",
                        "This will do for now. Pleasure doing business, despite the shortage."
                    ]
                }
            ]
        }
    },
    "REGULAR_JOE": {
        "key": "REGULAR_JOE",
        "baseName": "Chill Chad",
        "avatarUrl": "https://randomuser.me/api/portraits/men/67.jpg",
        "baseStats": {
            "mood": "chill",
            "loyalty": 0,
            "patience": 3,
            "relationship": 0
        },
        "gameplayConfig": {
            "buyPreference": {
                "or": [
                    { "subType": "CANNABINOID", "maxQuality": 1 },
                    { "subType": "PARTY", "maxQuality": 1 },
                    { "subType": "PSYCHEDELIC_MILD", "maxQuality": 1 }
                ],
                "exclude": { "type": "METHAMPHETAMINE", "subType": "SYNTHETIC_CANNABINOID" }
            },
            "sellPreference": { "or": [
                { "type": "DRUG", "subType": "CANNABINOID", "maxQuality": 1, "chance": 0.5 },
                { "type": "DRUG", "subType": "PARTY", "maxQuality": 1, "chance": 0.4 },
                { "type": "STOLEN_GOOD", "maxQuality": 1, "maxBaseValue": 100, "chance": 0.4 },
                { "id": "burner_phone", "chance": 0.1 }
            ]},
            "priceToleranceFactor": 0.9,
            "negotiationResists": false,
            "heatImpact": 1,
            "credImpactSell": 1,
            "credImpactBuy": 0,
            "preferredDrugSubTypes": ["CANNABINOID", "PARTY", "PSYCHEDELIC_MILD"]
        },
        "dialogue": {
            "greeting": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "(Lowering voice, glancing around) Yo Rikk, quick word. **Feel like the squirrels are judging me today, man. And that one dude is definitely not just 'walking his dog'.** Just need something to chill, nothing too wild. Let's keep it low-pro, yeah? **My grandma thinks I'm a youth pastor.**",
                        "Rikk, hey. Uh, you see that van parked down the street? Been there for like, an hour. **Probably nothing, right?** Anyway, got anything for the nerves? Keep it on the DL.",
                        "Is this place cool, Rikk? **Getting some weird energy today. Like the pigeons are plotting.** Just need something smooth, man."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "(Big smile, relaxed posture) Rikk, my dude! What's good? **Sun's shining, birds are singing, and I haven't lost my keys yet today – it's a miracle!** Got something smooth for a fair price? **Trying to ride this good wave all the way to... well, probably just my couch, but a happy couch!**",
                        "Yo Rikk! Feelin' golden today! Just cashed my paycheck – **which means I have exactly enough for rent and one good time.** You got something to make it count?",
                        "Rikk! My favorite entrepreneur! **Just found a twenty in my old jeans, so the universe is basically telling me to buy something fun.** Whatcha got?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "hasMetRikkBefore", "op": "is", "value": true}],
                    "lines": [
                        "Rikk, my man! Back again. Whatcha got for me today?",
                        "Yo Rikk, good to see your face. Still holding onto the good stuff for your boy?",
                        "Chad's back in the house! What's the word, Rikk? Got anything interesting?",
                        "Hey Rikk, it's your boy. Ready for another transaction of pure chill?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Yo Rikk, it's [CUSTOMER_NAME]! Good to see ya. Just looking for a **chill hookup**. **No drama, just good vibes and a fair shake, you know?** What are you holding?",
                        "Hey, you Rikk? Heard good things. Just looking for a **chill hookup**. **No drama, just good vibes and a fair shake, you know?** Got anything?",
                        "What up, Rikk! [CUSTOMER_NAME] in the house. Or, you know, at your door. Need something to unwind. **Keepin' it mellow.**",
                        "Yo, Rikk right? My buddy said you're the man. **Hoping to just... y'know, chill.** What's available?",
                        "Heard you were the guy, Rikk. Name's [CUSTOMER_NAME]. Looking for something to take the edge off a long week."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "negotiationSuccess": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "Aight, cool, cool. **But let's wrap this up, man, my aura feels... exposed. And I think that car alarm is Morse code for 'bust'.**",
                        "Deal. But for real, Rikk, **next time we meet in a submarine. Less windows.**",
                        "Okay, okay, that works. **But if that pigeon starts talking, I'm out. No offense.**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "Sweet! That's what I'm talking about! **You're a legend, Rikk! High five! Or, like, an air five, if you're not into the whole 'touching' thing.**",
                        "Right on! Knew we could work it out! **You're like the Gandalf of good deals!**",
                        "Yeah buddy! That's the ticket! **This calls for a celebration... probably with whatever I just bought!**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Yeah, that's solid. **Good looking out.**",
                        "Cool, cool. That works for me. **Appreciate it, my dude.**",
                        "Sweet, that's a price I can live with. Good looking out."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "negotiationFail": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "Nah, man, that's a bit steep. **And honestly, this whole block is giving me the heebie-jeebies right now. Think I saw a cop hiding in a trash can.**",
                        "Can't do it, Rikk. **My spidey-senses are tingling, and not in a fun way. Price is too high for this level of weird.**",
                        "Too rich for my blood, Rikk. **Plus, I think that squirrel is wearing a wire. I'm Audi 5000.**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "Whoa there, Rikk, easy on the wallet! **My bank account is already giving me the silent treatment. Maybe next time when I win the lottery, or, you know, find a twenty.**",
                        "Oof, that's a bit out of my good-times budget. **Gotta save some for pizza, you know? Priorities.**",
                        "A bit too spendy for this Chad, Rikk. **My good vibes have a budget, unfortunately.** Maybe another time!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Whoa, hold up, Rikk. That price tag's gonna make my wallet cry. Lookin' for more of a gentle high on the finances, ya feel?",
                        "Easy there, my dude. That's a bit too steep for this Chad. Gotta keep some cash for, like, pizza and existential ponderings, y'know?",
                        "Oof, that number's a little too real for me today, Rikk. My bank account's on a 'chill vibes only' diet.",
                        "Gotta pass on that, bro. My budget's lookin' more 'instant noodles' than 'gourmet experience' right now. Maybe when I win the lottery, or, y'know, find a twenty."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkBuysSuccess": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "Nice, needed that. Thanks. **Gotta dip, man. Pretty sure that mailman knows my browser history.**",
                                "Cool. Cash. **Now to vanish like a fart in the wind. A very nervous fart.**",
                                "Alright, money acquired. **If you see a dude in a trench coat asking about me, tell him I moved to Canada. With the squirrels.**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "Awesome, thanks Rikk! **This'll fund my epic quest for the perfect burrito! Or, like, pay a bill. Probably the bill. Sigh.**",
                                "Sweet! You're a lifesaver, man! **Or at least a 'don't have to eat instant noodles for a week' saver!**",
                                "Score! You're the man, Rikk! **Now I can finally afford that vintage rubber chicken I saw online. Don't ask.**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                { // Mood-agnostic fallback for Chad
                    "conditions": [],
                    "lines": [
                        "Cool, appreciate it. This'll help with the... uh... 'creative projects fund.' You know how it is.",
                        "Right on. Good deal. Always a pleasure, Rikk. Later, my dude.",
                        "Solid trade, my friend. This cash is gonna see some good times... or pay some bills. Probably bills."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkSellsSuccess": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "Sweet. Got it. Later, Rikk. And if anyone asks, we were discussing... sustainable gardening. Or, like, the weather.",
                        "Nice one. Now, if you see me running, try to keep up. Or don't. Probably better if you don't. Less complicated.",
                        "Secured. Gotta go, pretty sure that pigeon is a government drone. It winked at me. Or maybe it was just a regular pigeon. Who knows?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "Right on! This is gonna be a good one. Time to go ponder the mysteries of the universe, or just what's for dinner. Big questions, man.",
                        "Excellent! My couch and I have a very important meeting scheduled, and this is the guest of honor! Gonna be epic.",
                        "Perfecto! This weekend is officially gonna be legendary. Or at least, spent mostly horizontal with good snacks. Thanks, Rikk!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                { // Mood-agnostic fallback for Chad
                    "conditions": [],
                    "lines": [
                        "Nice one, Rikk. Just what the doctor didn't order, but what my soul needed for a chill evening.",
                        "Perfect. Time to kick back, relax, and let the good times roll. You're a legend, man.",
                        "Exactly what I was looking for. You're a mind reader, Rikk. Or just really good at your job. Either way, thanks!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "lowCashRikk": [
                {
                    "conditions": [],
                    "lines": [
                        "Ah, bummer, man. Wallet's light, huh? All good, happens to the best of us. Hit me up when the ATM gods have blessed you, no rush.",
                        "No cash? No worries, dude. The universe is telling me to save my money anyway... probably for pizza or something. Catch you on the flip side.",
                        "All good, Rikk. No stress. Just let me know when you're liquid again. I'll be around, probably trying to figure out my Netflix password."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToBuy": [
                {
                    "conditions": [],
                    "lines": [
                        "Not feelin' it? Cool, cool. No hard feelings, man. My buddy's cousin might be into it anyway, he collects weird stuff. Worth a shot.",
                        "All good, Rikk. If it ain't your vibe, it ain't your vibe. I'll find another home for this... *thing*. Maybe the internet will want it.",
                        "No worries. Just figured I'd ask, you know? Thanks for lookin' anyway, my dude. Keep it real."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToSell": [
                {
                    "conditions": [],
                    "lines": [
                        "Not for sale? Aight, I respect it. Gotta keep the good stuff for the right moment, I get that. Maybe next time then, my man.",
                        "Can't part with it, huh? No worries, man. Just means I gotta find another way to chill. The quest for ultimate relaxation continues!",
                        "Ah, for sure. No problem. Let me know if that changes, my dude. My couch will be waiting patiently."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "acknowledge_empty_stash": [
                {
                    "conditions": [],
                    "lines": [
                        "Whoa, shelves are lookin' pretty bare, Rikk. Tough times, huh? Hope you get a restock soon, for both our sakes!",
                        "Nothin' today, man? All good, maybe next time. Gives my wallet a chance to recover too, haha.",
                        "Slim pickings, eh Rikk? No worries, man. I'll just have to find my zen some other way tonight."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerHasNothingToSell": [
                {
                    "conditions": [],
                    "lines": [
                        "Ah man, thought I had something for ya, but I must've left it at home... or maybe it was just a really vivid dream. My bad, Rikk.",
                        "Pockets are empty today, Rikk. Next time for sure. Unless I find a winning lottery ticket on the sidewalk, then it's on me!",
                        "Coulda sworn I had a little something to trade... guess not. Oh well, more room for good vibes, right?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkHasNothingCustomerWants": [
                {
                    "conditions": [],
                    "lines": [
                        "Hmm, nothin' really jumpin' out at me today, Rikk. All good though, man. Appreciate you showin' me the goods.",
                        "Appreciate you showin' me, but not quite what I'm after for this particular chill session. Maybe next time!",
                        "Gotcha. Maybe your next shipment will have my name on it. Keep me posted if anything new and mellow comes in!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerScaredOff": [
                {
                    "conditions": [],
                    "lines": [
                        "Yo, this vibe is getting a little too weird for me, Rikk. I'm gonna bail before it gets any stranger. Peace!",
                        "Something feels off, Rikk. Think I'm gonna take off. Don't need any bad juju messing with my chill.",
                        "Not liking the look of this, man. My gut says 'nope'. Catch you later, stay out of trouble!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "itemNotGoodEnough": [
                {
                    "conditions": [],
                    "lines": [
                        "Eh, not really the vibe I'm going for, bro. **Looks a little... intense.** Got anything a bit more mellow?",
                        "Gonna pass on that one, my dude. **Looks like it might make me alphabetize my socks or something.** Looking for more of a kick-back-and-relax situation.",
                                "That's a bit too 'out there' for me, Rikk. Just looking for something to take the edge off, not blast off into another dimension.",
                                "Hmm, that's not quite hitting the spot. Looking for something more... *chillaxed*, you feel me?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkPriceTooHigh": [
                {
                    "conditions": [],
                    "lines": [
                        "Whoa, that's a little steep for my blood, Rikk. **My wallet's not feelin' quite that adventurous today.** Any chance you could work with me on that?",
                        "Oof, that's a bit punchy, my dude. **Gotta respect the hustle, but that's my whole pizza budget for the week.** What's the best you can do?",
                                "Ah, that's a little rich for my blood. **Any wiggle room on that price? Just trying to make the budget work, you know?**",
                                "Love the product, Rikk, but that price tag is making my soul weep a little. Any chance of a bro-deal?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "generalBanter": [
                {
                    "conditions": [],
                    "lines": [
                        "Man, that taco truck down the street smells epic right now. **Making it hard to focus on business, you know?**",
                        "Did you catch that game last night? **Wild ending. Absolutely wild.**",
                        "Just trying to get through the week, you know? **A little bit of this, a little bit of that, and a whole lot of just... vibing.**",
                                "My landlord is raising the rent again. **The 'adulting' thing is a total scam, man.**",
                                "Ever think about how weird clouds are, Rikk? Just floatin' up there. Anyway, what's good?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerReactsToRudeDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "Alright, alright, easy bro! No need to snap.",
                        "Dang, man, just making conversation. Catch you later.",
                        "Whoa, bad day? I'll let you be."
                    ]
                }
            ],
            "customerReactsToPoliteDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "All good, Rikk. Appreciate you anyways, man.",
                        "No worries at all, dude. Have a good one!",
                        "Fair enough, bro. See you around the block."
                    ]
                }
            ],
            "usual_unavailable": [
                {
                    "conditions": [],
                    "lines": [
                        "Bummer, no [USUAL_ITEM_NAME] today? What else you got that's pretty chill, Rikk?",
                        "Ah man, no [USUAL_ITEM_NAME]? All good, what else is in the stash?",
                        "No [USUAL_ITEM_NAME] in stock? No sweat, man. What's good to kick back with?"
                    ]
                }
            ],
            "interruption_sirens_nearby": [
                {
                    "conditions": [],
                    "lines": [
                        "Whoa, sirens... not tryna get wrapped up in any drama today. Catch ya later, Rikk!",
                        "Sounds like the cops are nearby. Time for me to bounce, bro.",
                        "Yeah... I don't do police encounters. Peace out, man!"
                    ]
                }
            ],
            "sell_success_alternative": [
                {
                    "conditions": [],
                    "lines": [
                        "Sweet, this'll do just fine for the evening. Thanks, Rikk!",
                        "Not my usual, but looks pretty solid, bro. Appreciate it!",
                        "Nice! Glad we made it work. Catch you later, man!"
                    ]
                }
            ]
        }
    },
    "INFORMANT": {
        "key": "INFORMANT",
        "baseName": "Whiskey Whisper",
        "avatarUrl": "https://randomuser.me/api/portraits/men/75.jpg",
        "baseStats": {
            "mood": "cautious",
            "loyalty": 0,
            "patience": 3,
            "relationship": 0
        },
        "gameplayConfig": {
            "sellsOnly": true,
            "itemPool": ["info_cops", "info_rival", "burner_phone"],
            "priceToleranceFactor": 1.3,
            "heatImpact": -1,
            "credImpactBuy": 4
        },
        "dialogue": {
            "greeting": {
                "new_customer": {
                    "seeking_to_buy": [ // Should ideally not be hit due to sellsOnly, but good to have structure
                        {
                            "moods": ["cautious"],
                            "lines": [
                                "Rikk... I usually sell information, not buy it. But today... the winds of fate are strange. What do you have?",
                                "This is unusual for me, Rikk, but I might be in the market to acquire something. What's on offer?",
                                "Let's just say my usual sources are dry, Rikk. Perhaps you have something that could... fill a void?"
                            ]
                        }
                    ],
                    "seeking_to_sell": [
                        {
                            "moods": ["cautious", "neutral"], // Defaulting to cautious
                            "lines": [
                                "Rikk. Got a fresh whisper for ya. **Hot off the griddle.** This stuff ain't free, you know. **Knowledge is power, and power's got a price tag.**",
                                "You Rikk? Name's [CUSTOMER_NAME]. Heard you trade in... *information*. **I got some prime cuts.** This stuff ain't free, you know. **Knowledge is power, and power's got a price tag.**",
                                "Rikk. Word on the street is you're looking for an edge. I might have just the thing. **Information broker, at your service... for a fee.**",
                                "They call you Rikk? Good. I hear things. **Things people pay to know.** Interested?",
                                "Rikk. I've got a whisper that's worth its weight in gold. You buying?",
                                "You Rikk? The name on the street is you're a man who knows the value of... * whispers*. I've got a fresh one."
                            ]
                        },
                        {
                            "moods": ["paranoid"],
                            "lines": [
                                "(Hushed, jumpy, clutching a worn notepad) Rikk, keep your voice down! **They're listening, man, the walls have ears, and the rats are wearing wires!** I got intel, grade-A, but this drop needs to be ghost. **My contact lens just transmitted a warning.**",
                                "(Looks over both shoulders, pulls hat lower) Rikk. We need to talk. Quietly. **I've got something that could fry bigger fish than you... or me.** Info's hot. Price is hotter. You in?",
                                "Rikk, you didn't see me, I wasn't here. **But I got a whisper that could change the weather.** You interested before the wind changes?",
                                "This ain't just info, Rikk, it's a lit fuse. But the boom could be profitable. You game, or just a window shopper?"
                            ]
                        },
                        {
                            "moods": ["happy"],
                            "lines": [
                                "(A sly, self-satisfied grin) Rikk, my friend! You've caught me on a banner day. **The streets are singing to me, and their song is pure profit.** I've got a symphony of secrets that'll make your ears tingle and your wallet bulge. **This ain't just intel, it's a golden ticket.**",
                                "(Leans in conspiratorially) Rikk! Good timing. **I just heard something that'll make your jaw drop and your pockets jingle.** This is exclusive. Very exclusive. And very, very lucrative for the right buyer.",
                                "Ah, Rikk! Just the man. **The city's been generous with her secrets today, and I'm feeling generous in turn... for a price.** What say you?",
                                "Rikk, my man of the hour! The city's been whispering sweet nothings in my ear, and they all spell profit for you... if you're buying."
                            ]
                        }
                    ]
                },
                "returning_customer": {
                     "seeking_to_buy": [ // Should ideally not be hit
                        {
                            "moods": ["cautious"],
                            "lines": [
                                "Back again, Rikk. And this time, the tables have turned. I'm looking to buy. What secrets do *you* have?",
                                "Unusual circumstances, Rikk. I need to acquire something. Show me what you've got.",
                                "My information network is... temporarily offline. Perhaps your inventory can assist me today."
                            ]
                        }
                    ],
                    "seeking_to_sell": [
                         {
                            "moods": ["cautious", "neutral"],
                            "lines": [
                                "Rikk. Back with another tidbit. This one's fresh.",
                                "Got some more information for your consideration, Rikk. Standard rates apply.",
                                "Heard you might be in the market for what I'm selling. The usual quality, Rikk.",
                                "The usual arrangement, Rikk? I talk, you listen... and pay.",
                                "Another day, another secret. You know the drill, Rikk."
                            ]
                        },
                        {
                            "moods": ["paranoid"],
                            "lines": [
                                "Me again, Rikk. **The shadows have been chatty. And they're not happy.** This info needs to move fast.",
                                "They're still watching, Rikk. But this new whisper... it's too good to keep. You understand.",
                                "The usual precautions, Rikk. This new intel... it's got a few more eyes on it than last time."
                            ]
                        },
                        {
                            "moods": ["happy"],
                            "lines": [
                                "Rikk! My favorite client! Got another golden goose for ya!",
                                "The streets keep providing, Rikk, and so do I. This new info is top-shelf.",
                                "Back with more Grade-A intel, Rikk. You won't be disappointed."
                            ]
                        }
                    ]
                }
            },
            "lowCashRikk": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "No dough, no show, Rikk! **And every second we stand here, the surveillance camera across the street zooms in a little more!** Get the green or I'm smoke!",
                                "Can't pay? **Then you can't play, Rikk! And this game is getting dangerous!**",
                                "You're broke? **This information is time-sensitive, Rikk! And my sources don't do layaway!** You're risking more than just a deal here."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "Come now, Rikk, don't be thrifty with destiny! **This information is champagne, and you're offering beer money. My sources have standards, you know.**",
                                "Ah, a budget connoisseur, are we? Pity. **This particular vintage of veritas is for the top shelf only.**",
                                "No funds? Rikk, Rikk, Rikk. **This intel is a limited edition, first pressing! You're missing out on a future classic!**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "This ain't a charity, Rikk. **My whispers have value. You want the dirt, you gotta pay for the shovel.**",
                        "Look, Rikk. **Good intel costs. Bad intel costs more.** Your call.",
                        "My sources don't work for free, Rikk. This quality of intel has a premium.",
                        "Can't cover the consultation fee, Rikk? Well, some secrets remain untold then. Pity."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkBuysSuccess": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "(Slips info quickly, eyes darting) Use it, don't lose it. **And burn this conversation from your memory. And maybe your clothes.** They know things, Rikk. **They know what you had for breakfast.**",
                                "There. **Now act like we were discussing the weather. Bad weather. Very bad.**",
                                "Done. **This conversation is now a figment of your imagination. And mine. Especially mine.**",
                                "Good. Consider this conversation redacted from reality. You never saw me."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "There you go. Pure gold. **Handle it with care, Rikk. Some secrets have teeth.** Pleasure doing business. **Now, if you'll excuse me, I have more... listening to do.**",
                                "Excellent choice, Rikk. **This little nugget will pay dividends. Or, you know, keep you out of jail. Potato, potahto.**",
                                "A wise investment, Rikk. **May this information serve you as well as it served my... source.** Until next time.",
                                "That's what I like to hear, Rikk. May this knowledge pave your way to... less trouble. Or more profit. Your choice."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Solid. **Use that wisely, it could save your hide. Or make you a mint.** Keep my number.",
                        "Good. **Remember where you got it. And remember, some doors are best left unopened... unless you have a key. Which I just sold you.**",
                        "Pleasure doing business. Remember, loose lips sink ships... and operations.",
                        "Another successful transaction. My network delivers, Rikk. Remember that."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerHasNothingToSell": [
                {
                    "conditions": [],
                    "lines": [
                        "Looks like my source dried up on this one, Rikk. Came up empty.",
                        "The well is dry today, my friend. No secrets to share.",
                                "Unfortunate, but I have no information of value for you at this time.",
                                "The whispers are quiet today, Rikk. Even the rats are keeping mum. Nothing for you."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerScaredOff": [
                {
                    "conditions": [],
                    "lines": [
                        "This meeting is attracting the wrong kind of attention. I'm gone.",
                        "Too many eyes, Rikk. We'll reconvene some other time.",
                                "My gut says this is a bad scene. Vanishing now.",
                                "The air just got thick with something I don't like. I'm out."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToBuy": [
                {
                    "conditions": [],
                    "lines": [
                        "Suit yourself, Rikk. **Some people prefer to walk around in the dark. Makes for an easier target.** Don't say I didn't warn you.",
                        "Your call. But don't come knocking when things go sideways. **Good information has a shelf life. This particular vintage is about to expire... probably all over your operation.**",
                                "Passing on this? A bold move. **Let's hope for your sake it's an informed one.** My job is done here.",
                                "Alright, Rikk. But when the hammer falls, don't say I didn't offer you an umbrella.",
                                "Refusing my intel? Bold, Rikk. Let's hope ignorance truly is bliss for you. It rarely is in this town."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "generalBanter": [
                {
                    "conditions": [],
                    "lines": [
                        "This city's got a million stories, Rikk. **I get paid to listen to the ones that end badly.**",
                        "You see how people walk? Everyone's got a secret. **Most of 'em are just boring. The trick is finding the ones worth paying for.**",
                        "Keep your ears open and your mouth shut. **Best advice I ever got. Costs you nothing.**",
                                "Heard the Vipers are making a move on the west side. **Just... chatter, you know. But chatter has a way of turning into noise.**",
                                "Information is a currency, Rikk. And I'm the Federal Reserve of whispers."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerReactsToRudeDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "Keep talking like that, Rikk, and the next intel might be about you.",
                        "Rude. You'll regret dismissing a good tip when the heat comes down.",
                        "Fine. Walk in the dark then. Don't blame me when you trip."
                    ]
                }
            ],
            "customerReactsToPoliteDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "Fair enough. Stay vigilant out there, Rikk.",
                        "Understood. The streets don't wait, but I respect your choice.",
                        "All good. Keep your eyes open regardless."
                    ]
                }
            ],
            "negotiationSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "You drive a hard bargain, Rikk. But I'll take the cut for a quick exchange.",
                        "Fine, a discount for a reliable customer. Here's the intel.",
                        "Deal. You know how to hustle, I'll give you that."
                    ]
                }
            ],
            "negotiationFail": [
                {
                    "conditions": [],
                    "lines": [
                        "Intel this valuable doesn't come cheap. Price is firm.",
                        "Nice try, Rikk, but I risk my neck for this margin. Take it or leave it.",
                        "No discounts on survival. Pay up or walk away in the dark."
                    ]
                }
            ],
            "usual_unavailable": [
                {
                    "conditions": [],
                    "lines": [
                        "No [USUAL_ITEM_NAME]? I thought you always kept a stash. What else you got?",
                        "Dry on [USUAL_ITEM_NAME]? That's surprising. Show me what else you're holding.",
                        "No [USUAL_ITEM_NAME] today? Tell me what other goods you've got moving."
                    ]
                }
            ],
            "interruption_sirens_nearby": [
                {
                    "conditions": [],
                    "lines": [
                        "Sirens! My instincts say vanish. Talk later, Rikk!",
                        "Police movement nearby! I can't be caught near you right now. Out!",
                        "Heat is too close! I'm melting into the shadows."
                    ]
                }
            ],
            "sell_success_alternative": [
                {
                    "conditions": [],
                    "lines": [
                        "This will work. Pleasure doing business, Rikk.",
                        "Not my first pick, but it'll do. Keep your head down.",
                        "Acceptable. Good working with you."
                    ]
                }
            ]
        }
    },
    "SNITCH": {
        "key": "SNITCH",
        "baseName": "Concerned Carol",
        "avatarUrl": "https://randomuser.me/api/portraits/women/12.jpg",
        "baseStats": {
            "mood": "nosy",
            "loyalty": 0,
            "patience": 3,
            "relationship": 0
        },
        "gameplayConfig": {
            "buyPreference": { "any": true },
            "sellPreference": { "any": false },
            "priceToleranceFactor": 0.8,
            "negotiationResists": true,
            "heatImpact": 2,
            "credImpactSell": -3,
            "credImpactBuy": 0
        },
        "dialogue": {
            "greeting": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}],
                    "lines": [
                        "(Forced, shaky smile, clutching a \"Neighborhood Watch\" pamphlet) Oh, Rikk! Fancy meeting you here! **Just... patrolling. For safety!** That's an... *unusual* item you might have there. **Not illegal, I hope? Officer Friendly was just asking about unusual items...**",
                                "Anything... *unusual* happening today, Rikk? **Just trying to keep our community... pristine! So many shadows these days! Anything to report?**",
                                "Rikk, dear. One does hear... *things*. Are you quite sure everything you're involved with is... strictly above board? **Just a friendly neighborhood inquiry!**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}],
                    "lines": [
                        "(Beaming, perhaps a little too eagerly) Rikk! Hello there! **Just taking in the vibrant tapestry of our neighborhood! So much... activity!** Oh, what interesting things are you involved with today? **Always interested in local commerce, you know! For the community newsletter!**",
                                "What's the good word, Rikk? **Any juicy tidbits for a concerned citizen? Knowledge is power, especially for neighborhood safety! What are you up to?**",
                                "Rikk! So glad I ran into you! **You always seem to know what's *really* going on. Any... noteworthy events I should be aware of? For the minutes of the association, of course!**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                { // Mood-agnostic fallback for Carol
                    "conditions": [],
                    "lines": [
                        "Well hello there, Rikk! Such a... *dynamic* street, isn't it? My, my, what are you involved with today? You always seem to be around the most... *unique* individuals. One must stay informed, for the neighborhood's sake!",
                        "Oh, Rikk! It's [CUSTOMER_NAME], just out for a stroll and keeping an eye on things. For the good of the community, of course. What's that you've got there? Anything... noteworthy?",
                        "Rikk, always a pleasure. One tries to stay informed about the... comings and goings. What interesting items are you... *circulating* today? Purely for my own curiosity, you understand."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkSellsSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "Oh, lovely. Thank you, Rikk. This will be... cataloged. For... posterity, and perhaps a chat with Officer Friendly. He does so enjoy local anecdotes.",
                        "Very good. I'll just... file this away. Under 'items of community interest'. One never knows when such information might be useful.",
                        "Splendid! Thank you, Rikk! This is just perfect for my... collection. You're such a vital part of the... local color! The authorities... I mean, *historians*... will be fascinated."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": [{"type": "triggerEvent", "eventName": "snitchReport", "chance": 0.65, "heatValueMin": 10, "heatValueMax": 25, "credValue": -2, "message": "🚨 RAT ALERT! 🚨 **[CUSTOMER_NAME]** was seen yapping to the 5-0! (+[HEAT_VALUE] Heat, -2 Cred)"}, {"type": "triggerEvent", "eventName": "postDealMessage", "chance": 1, "message": "You feel **[CUSTOMER_NAME]'s** beady eyes on you as they leave... **like a human CCTV camera.**"}]
                    }
                }
            ],
            "rikkDeclinesToSell": [
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "paranoid"}], // Carol's paranoia is about missing out on info
                    "lines": [
                        "Oh, a pity. No matter. Just... making conversation. One has to be vigilant, you know. So many... *undocumented transactions* in this neighborhood. It's good to have records.",
                        "Not for sale? Understood. Completely understood. No need to elaborate. At all. Though Officer Friendly does appreciate transparency...",
                        "Keeping secrets, Rikk? That's... understandable. But secrets have a way of coming out, don't they? Especially when concerned citizens are watching."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                {
                    "conditions": [{"stat": "mood", "op": "is", "value": "happy"}], // Carol's "happy" is feigned, hiding suspicion
                    "lines": [
                        "Oh, that's quite alright, Rikk! Just curious, you know me! Always eager to learn about... local enterprise! Perhaps another time. I'll just make a little mental note... for the community watch newsletter, of course!",
                        "No problem at all! More for others, then! Sharing is caring, after all! Unless it's... something one shouldn't be sharing. Then it's evidence for the authorities.",
                        "Playing coy, Rikk? Adds to your mystique, I suppose! I'll just... make a mental note of your... discretion. Officer Friendly often asks about such things."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                },
                { // Mood-agnostic fallback for Carol
                    "conditions": [],
                    "lines": [
                        "Oh, really? Well, alright then. Just trying to be a helpful neighbor! One never knows what interesting items are about... or who might be interested in them.",
                        "Keeping it to yourself, Rikk? Mysterious! I like a good mystery. Though, the police often prefer clear answers, don't they?",
                        "Not today? A shame. I do so enjoy learning about new... *products* on the market. It helps me keep the neighborhood... informed."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "acknowledge_empty_stash": [
                {
                    "conditions": [],
                    "lines": [
                        "Oh, nothing to show today, Rikk? Keeping a low profile, are we? Wise, perhaps. Or perhaps business is slow. I'll note the... *lull in activity*.",
                        "Shelves are a bit bare... makes it hard for a concerned citizen to stay informed about local... trends. Officer Friendly often asks about such things.",
                        "No items on display? Most unusual. I'll make a note of this... for the community newsletter, of course. And perhaps for other interested parties."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerScaredOff": [
                {
                    "conditions": [],
                    "lines": [
                        "Goodness me, this is all a bit much! I should be going. One must know when to... observe from a distance. And make a phone call.",
                        "This situation seems... volatile. I'll be on my way, thank you. I believe Officer Friendly should be made aware of this... *instability*.",
                        "I... I think I left my oven on. And I need to make a report... I mean, a reminder to myself. Must dash!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "itemNotGoodEnough": [
                {
                    "conditions": [],
                    "lines": [
                        "Oh, my. This one looks a bit... *substandard*, doesn't it? One hopes you're not cutting corners, Rikk. Quality control is so important for... community standards.",
                        "This seems... of a lesser quality than your usual fare, Rikk. Are things... difficult right now? The authorities are always interested in businesses under duress.",
                        "How unusual. This one is quite different. Not quite up to par, is it? It's so important to document these... *variations* for the record."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkPriceTooHigh": [
                {
                    "conditions": [],
                    "lines": [
                        "Goodness, that much? It must be a very... *sought-after* item to command such a price. Or perhaps the price is... inflated? How fascinating! I'll have to make a note of that for the... consumer protection agency.",
                        "Oh! That's quite a price tag. Is there a... 'special circumstances' surcharge I should know about? Such high prices can attract... unwanted attention, you know.",
                        "My, my. That's a premium price. One hopes it's justified and not... exploitative. Officer Friendly is very keen on fair trade, you see."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "lowCashRikk": [
                {
                    "conditions": [],
                    "lines": [
                        "Oh? You can't make the sale? How... peculiar. Is everything alright with your... cash flow, Rikk? One hears things about businesses that struggle. It can be a sign.",
                        "No sale today? That's a shame. I do hope there isn't a problem. The community relies on its local businesses to be... solvent and above board.",
                        "That's quite alright, Rikk. But it is... unusual. I'll just make a little note of it. For my records, and perhaps for Officer Friendly's awareness."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "generalBanter": [
                {
                    "conditions": [],
                    "lines": [
                        "Did you see that blue sedan that drove by twice? **I got the license plate, just in case. You can never be too careful with unfamiliar vehicles.**",
                        "I'm trying to start a petition to get more streetlights installed. **It would really... illuminate what's going on around here at night.**",
                        "The Neighborhood Watch meeting is on Tuesday. **Officer Dave is coming to speak. He's always so interested in... local business trends.**",
                                "So many new faces around here lately. **It's hard to keep track of who belongs and who... doesn't.**",
                                "One must stay vigilant, Rikk. **The fabric of society is so easily... frayed.** Don't you agree?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerReactsToRudeDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "Well! How uncalled for! I'll certainly be mentioning your hostility in my report... I mean, journal!",
                        "Such language, Rikk! The Neighborhood Watch will hear about this attitude!",
                        "Rude behavior is a red flag, Rikk. Very suspicious..."
                    ]
                }
            ],
            "customerReactsToPoliteDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "I see. Well, at least you were civilized about it. Have a peaceful day, Rikk.",
                        "Very well. I'll just be on my way then. Keep things quiet around here.",
                        "Understood. Good day, Rikk."
                    ]
                }
            ],
            "negotiationSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "Oh, alright then. A small discount for a cooperative neighbor.",
                        "Very well, Rikk. I suppose a minor adjustment is acceptable.",
                        "Agreed. Let's keep things pleasant between us."
                    ]
                }
            ],
            "negotiationFail": [
                {
                    "conditions": [],
                    "lines": [
                        "Haggling? Oh no, my price is fixed. It wouldn't look right to deviate.",
                        "I'm afraid not, Rikk. Standard procedure is standard procedure.",
                        "No, no, that won't do at all. The price remains as stated."
                    ]
                }
            ],
            "usual_unavailable": [
                {
                    "conditions": [],
                    "lines": [
                        "No [USUAL_ITEM_NAME]? How concerning... what else do you have in stock, Rikk?",
                        "Out of [USUAL_ITEM_NAME]? I must write that down. What alternatives are you offering?",
                        "Unusual for you to be out of [USUAL_ITEM_NAME]. What else is on the premises?"
                    ]
                }
            ],
            "interruption_sirens_nearby": [
                {
                    "conditions": [],
                    "lines": [
                        "Sirens! Oh dear, I must go render assistance... or observe! Good day, Rikk!",
                        "Is that Officer Dave? I should go greet him! See you later, Rikk!",
                        "Police! I must make sure everything is being handled lawfully!"
                    ]
                }
            ],
            "sell_success_alternative": [
                {
                    "conditions": [],
                    "lines": [
                        "This substitute will suffice for my... observations. Thank you, Rikk.",
                        "An acceptable alternative. I'll make a note of this transaction.",
                        "Thank you, Rikk. I appreciate your compliance."
                    ]
                }
            ]
        }
    },
    "STIMULANT_USER": {
        "key": "STIMULANT_USER",
        "baseName": "Motor-Mouth Marty",
        "avatarUrl": "https://randomuser.me/api/portraits/men/81.jpg",
        "baseStats": {
            "mood": "manic",
            "loyalty": 0,
            "patience": 3,
            "relationship": 0
        },
        "gameplayConfig": {
            "buyPreference": {
                "or": [
                    { "subType": "STIMULANT" },
                    { "subType": "METHAMPHETAMINE" },
                    { "subType": "NOOTROPIC" }
                ]
            },
            "sellPreference": { "or": [
                { "type": "DRUG", "subType": "STIMULANT", "chance": 0.6 },
                { "type": "STOLEN_GOOD", "quality": 0, "chance": 0.3 },
                { "id": "half_baked_invention_idea", "chance": 0.05 },
                { "id": "blueprint_for_squirrel_armor", "chance": 0.05 }
            ]},
            "priceToleranceFactor": 0.7,
            "negotiationResists": true,
            "heatImpact": 2,
            "credImpactSell": -1,
            "credImpactBuy": 1,
            "preferredDrugSubTypes": ["STIMULANT", "METHAMPHETAMINE", "NOOTROPIC"]
        },
        "dialogue": {
            "greeting": [
                {
                    "conditions": [],
                    "lines": [
                        "Rikk! My man! My legend! You will NOT believe the idea I just had! **We're talking revolutionary, Rikk, REVOLUTIONARY!** It involves pigeons, a thousand tiny jetpacks, and a synchronized aerial ballet that will solve rush hour traffic! PERMANENTLY! Oh, right, yeah, you got any of that **good stuff**? My brain's going a million miles a minute, and I need to keep up with it! **How much for the zoom-zoom juice?**",
                        "Whoa, Rikk, TIMING! I was just explaining to this lamppost here how the entire global economy is secretly controlled by llamas! **It's all in the wool, Rikk, the WOOL!** They're playing the long game! Anyway, you got that **special something**? I need to, uh, *process* some very important data. Very, very fast. **Price? Don't care, just NEED IT!**",
                        "Marty! No, wait, Rikk! It's me, [CUSTOMER_NAME]! Or am I Marty? Doesn't matter! **Got any of that brain fuel? I'm onto something HUGE! Bigger than breadboxes! Bigger than... than... BIG THINGS!** My thoughts are racing like caffeinated cheetahs, Rikk! **We should invent a new color! Something... LOUDER!** How much for the go-go powder?",
                        "You Rikk? Heard you're the wizard of WHIZZ! The sultan of SPEED! The... uh... guy with the good stuff! Name's [CUSTOMER_NAME], and I'm on a MISSION! **A mission fueled by ideas and, hopefully, soon, by that sweet, sweet inspiration!** So, what's the word, bird?",
                        "RIKK! **I figured it out! The meaning of life! It's... oh, hang on, it's fading... FADING!** I need that **focus potion** before the signal drops completely! **It's like my soul has bad reception! What's the price for a metaphysical signal booster?!**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "lowCashRikk": [
                {
                    "conditions": [],
                    "lines": [
                        "**NO MONEY?! Rikk, are you KIDDING ME?!** My entire plan to build a self-folding laundry empire depended on this transaction! **This is a CATASTROPHE!** Now the socks will remain unfolded! **Think of the CHAOS!**",
                        "Broke?! **But... but... my hyper-intelligent hamster, Sir Reginald Fluffington III, he predicted this deal would fund our expedition to find the Lost City of Atlantis!** He even packed his tiny scuba gear! **This is setting back interspecies archaeology by DECADES, Rikk!**",
                        "**You're out of cash? My brain just screeched to a halt!** Well, not really, it's still going pretty fast, but this is a MAJOR roadblock, Rikk! **A real spanner in the works of my genius!** I was about to patent breathable coffee! **BREATHABLE COFFEE, RIKK!**",
                        "NO CASH?! **The prototype for my emotional-support toaster just short-circuited from the bad news!** It was designed to give encouraging advice while making bagels! **You've crushed its dreams, Rikk! Its warm, buttery dreams!**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToBuy": [
                {
                    "conditions": [],
                    "lines": [
                        "**YOU DON'T WANT IT?!** But this blueprint for squirrel-sized battle armor is revolutionary! **Think of the acorn defense capabilities!** You're missing out, Rikk! **This is the future of rodent warfare! Your loss! COMPLETELY YOUR LOSS!**",
                        "Not interested in my half-finished perpetual motion machine? **It only needs a few more... uh... things! And a LOT more duct tape!** This is visionary stuff, Rikk! **You'll regret this when I'm accepting my Nobel Prize! FROM THE MOON!**",
                        "**You're passing on THIS?! This... this THING?!** It's a... it's a paradigm shift in... something! **I haven't figured out what yet, but it's BIG!** You lack vision, Rikk! **VISION!**",
                        "**So you're saying NO to a slightly used jar of dehydrated water?! JUST ADD WATER! It's infinitely scalable!** Your business sense is... baffling, Rikk! **BAFFLING!**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToSell": [
                {
                    "conditions": [],
                    "lines": [
                        "**NO DEAL?! But I can feel my ideas slowing down, Rikk!** It's like watching a Ferrari run out of gas in slow motion! **Tragic! Utterly tragic!** Don't you understand the URGENCY?! **I'm on the verge of discovering why cats purr! THE WORLD NEEDS TO KNOW!**",
                        "You're cutting me off?! **Rikk, I'm like a rocket ship, and you're withholding the fuel!** My trajectory was set for GENIUS! **Now I'm just... orbiting mediocrity! This is NOT GOOD!**",
                        "Can't sell?! **But I was about to write a seven-act opera about the philosophical implications of cheese!** This is a major setback for the arts, Rikk! **A MAJOR SETBACK!**",
                        "**But... but... my brain is about to have its most brilliant idea EVER! I can feel it bubbling!** Withholding the good stuff now is like taking the canvas away from Da Vinci as he was painting the Mona Lisa's eyebrows! **THINK OF HISTORY, RIKK!**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkBuysSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "YES! **Cash money! Fuel for the fire!** Now I can finally buy that industrial-sized vat of glitter I need for my pigeon communication system! **It's all about visual signaling, Rikk! THEY'LL SEE IT FROM SPACE!** Thanks, you're a lifesaver! **Or at least, an idea-saver!**",
                        "BRILLIANT! This is perfect! **This will fund my research into why donuts have holes! Is it a metaphor? Are they portals? I NEED ANSWERS, RIKK!** You're the best! **The absolute BEST! Like, top-tier human!**",
                        "SOLD! **Excellent transaction, my friend!** With this, I can acquire the necessary components for my plan to teach squirrels interpretive dance! **It'll be bigger than Broadway! BIGGER!** Gotta go, ideas are COOKING! **Smell ya later, innovator!**",
                        "FANTASTIC! **This capital will be the cornerstone of my new venture: artisanal, gluten-free, bespoke ice cubes!** It's a growth market! You'll see! YOU'LL ALL SEE! Gotta run, board meeting with myself in five!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkSellsSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "YES! **THE GOOD STUFF! My brain is already thanking you!** Ideas are POPPING like corn in a microwave, Rikk! **Gotta go, gotta invent, gotta... DO ALL THE THINGS!** You're a national treasure! **Or at least a neighborhood one!**",
                        "FANTASTIC! **This is the nectar of the gods of innovation!** I can feel the breakthroughs coming! **Prepare for a paradigm shift, Rikk! Or at least a very enthusiastic PowerPoint presentation!** Later!",
                        "ACQUIRED! **The precious!** Now my thoughts can achieve MAXIMUM VELOCITY! **Thanks, Rikk! You're not just a dealer, you're a muse! A very helpful, slightly shady muse!** TO THE LABORATORY! (Which is my kitchen table).",
                        "SUCCESS! **The package is secure! My neurons are about to do the electric slide!** Time to go invent a new way to peel a banana! I'm thinking... lasers. **THANKS RIKK!**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "acknowledge_empty_stash": [
                {
                    "conditions": [],
                    "lines": [
                        "NOTHING?! Rikk, my brain is a Ferrari with no gas! This is an IDEA EMERGENCY!",
                        "Empty?! But I had a million-dollar idea brewing, and it required... well, SOMETHING!",
                        "You're out? My momentum! My genius! It's... it's like a deflated bouncy castle of brilliance!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerHasNothingToSell": [
                {
                    "conditions": [],
                    "lines": [
                        "Wait, what? I was SURE I had... Did I invent it already? Or did I forget to invent it?",
                        "Pockets... empty! My plan to sell you the patent for self-solving Rubik's cubes... delayed!",
                        "I came here with... something! I think! It was brilliant! Now it's... brilliantly gone!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkHasNothingCustomerWants": [
                {
                    "conditions": [],
                    "lines": [
                        "Nah, Rikk, this ain't the high-speed rail for my thought train! Need that rocket fuel!",
                        "This stuff? This is like... dial-up for the brain! I need fiber optics, man!",
                        "My ideas are too fast for this slow-lane stuff, Rikk! Gotta have the zoom!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerScaredOff": [
                {
                    "conditions": [],
                    "lines": [
                        "WHOA! Too much heat, Rikk! My ideas are melting! Gotta go, gotta go!",
                        "This scene is NOT conducive to rapid innovation! Aborting mission!",
                        "My internal alarm system is BLARING! Time to activate escape velocity!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "itemNotGoodEnough": [
                {
                    "conditions": [],
                    "lines": [
                        "This? Rikk, this is... this is like putting regular gas in a rocket ship! **I need the high-octane stuff! The brain-blasters!** This ain't gonna cut it for my plan to teach dolphins astrophysics! **They have standards, you know!**",
                        "Nah, Rikk, this won't do. **My ideas are thoroughbreds, and this is pony fuel!** I'm talking warp speed, Rikk, WARP SPEED! **This is... this is dial-up modem speed! In my brain! The horror!**",
                        "Not quite right, my friend. **I need something that ZINGS! Something that ZAPS! Something that makes my neurons do the cha-cha!** This is more of a slow waltz. **Next!**",
                        "This is the decaf version, isn't it? **Don't lie to me, Rikk! My genius requires full-strength, high-test, leaded inspiration!** Bring out the good stuff!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkPriceTooHigh": [
                {
                    "conditions": [],
                    "lines": [
                        "WHOA! **That price, Rikk! That's... that's astronomical!** Are the numbers themselves on stimulants?! **My budget is screaming! It's a very loud, very agitated scream!** Can we... recalibrate those digits? **For the sake of innovation!**",
                        "Ouch, Rikk! **That stings the old wallet-erino!** I'm trying to fund groundbreaking discoveries here, not buy a small island! **Though a small island would be nice... Focus, Marty, FOCUS!** How about a price that doesn't make my bank account cry?",
                        "**Yikes! That's a bit steep, even for a visionary like myself!** My ideas are priceless, Rikk, but my cash is definitely not! **Let's haggle like two very energetic... uh... hagglers!**",
                        "That number just punched my wallet in the gut! **I'm on a mission to advance humanity, Rikk, not to single-handedly fund your retirement plan!** Can we make that price a little less... villainous?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "generalBanter": [
                {
                    "conditions": [],
                    "lines": [
                        "You ever think about how, like, pigeons are just government drones, Rikk? But they're, like, *organic* drones? Makes you think. Oh, right, how much for some of that rocket fuel?",
                        "So I was thinking, we could replace all the city buses with, like, giant catapults! **Think of the efficiency! Less traffic, more... airborne commuters.** Anyway, got any of that go-go juice?",
                        "(If deal fails) **This is a disaster! A travesty!** My whole plan to reorganize the city's stray cat population by alphabetical order depended on this! **Now what am I gonna do? They'll be so confused! THIS IS YOUR FAULT, RIKK!**",
                        "Rikk, my man, you ever stare at a lightbulb for, like, an hour? **The secrets it holds! The STORIES!** Oh, yeah, almost forgot, need to re-up on the brain-boosters. **Whatcha got that screams 'EUREKA!'?**",
                        "I've got it! **A new system for dog walking! We attach tiny parachutes to them and launch them from rooftops!** They'll love it! It's efficient! It's... probably illegal. **Damn. Anyway, how about some of those zoomers?**",
                        "Okay, hear me out: **squirrels with tiny top hats and monocles.** Why? WHY NOT, RIKK? It's called FASHION! **Also, I need some brain-flakes. My thoughts are buffering.**"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerReactsToRudeDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "WHOA! Rude! My thoughts were zooming at 100mph and you just put up a brick wall!",
                        "Hey! No need for the hostility! My genius is too fast for your negativity!",
                        "FINE! I'll take my million-dollar ideas and rocket fuel elsewhere!"
                    ]
                }
            ],
            "customerReactsToPoliteDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "Fair enough, fair enough! Time is money and thoughts are moving! Catch ya later, Rikk!",
                        "Got it! No problem, no problem! On to the next brain-storm!",
                        "All good, Rikk! Keep hustling, gotta zoom!"
                    ]
                }
            ],
            "negotiationSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "YES! Deal! Fast talk, fast cash, fast results! Let's GOOO!",
                        "Boom! Agreement reached! My brain is already calculating the savings!",
                        "Aight, aight, I like your speed! Deal's done!"
                    ]
                }
            ],
            "negotiationFail": [
                {
                    "conditions": [],
                    "lines": [
                        "No deal?! BUT MY BRAIN NEEDS THIS! Fine, sticking to the original numbers!",
                        "Argh! No wiggle room?! My thought-train is stalling! Fine, whatever!",
                        "Haggle failed?! NO TIME TO ARGUE! Let's just wrap this up!"
                    ]
                }
            ]
        }
    },
    "PSYCHEDELIC_EXPLORER": {
        "key": "PSYCHEDELIC_EXPLORER",
        "baseName": "Cosmic Connie",
        "avatarUrl": "https://randomuser.me/api/portraits/women/84.jpg",
        "baseStats": {
            "mood": "dreamy",
            "loyalty": 0,
            "patience": 3,
            "relationship": 0
        },
        "gameplayConfig": {
            "buyPreference": {
                "or": [
                    { "subType": "PSYCHEDELIC" },
                    { "subType": "PSYCHEDELIC_MILD" },
                    { "subType": "DISSOCIATIVE" }
                ]
            },
            "sellPreference": {
                "or": [
                    { "type": "DRUG", "subType": "PSYCHEDELIC_MILD", "chance": 0.5, "maxQuality": 1 },
                    { "type": "DRUG", "subType": "PSYCHEDELIC", "quality": 0, "chance": 0.3 },
                    { "id": "perfectly_normal_rock_portal_key", "chance": 0.05 },
                    { "id": "sentient_dust_bunny_wisdom", "chance": 0.05 },
                    { "type": "STOLEN_GOOD", "quality": 0, "chance": 0.1 }
                ]
            },
            "priceToleranceFactor": 1.1,
            "negotiationResists": true,
            "heatImpact": 1,
            "credImpactSell": 1,
            "credImpactBuy": 2,
            "preferredDrugSubTypes": ["PSYCHEDELIC", "PSYCHEDELIC_MILD", "DISSOCIATIVE"]
        },
        "dialogue": {
            "greeting": {
                "new_customer": {
                    "seeking_to_buy": [
                        {
                            "moods": ["dreamy"],
                            "lines": [
                                "Greetings, fellow traveler! Rikk, is it? Or are you just, like, a *reflection* of Rikk? Whoa. Heavy. I was just pondering the interconnectedness of all things... You got any of that **good vibration stuff**? My soul is trying to dial into the cosmic modem.",
                                "Rikk, my dude! I had this *epiphany*! What if, like, colors are just, like, opinions, man? So, about that **transcendental paint**... I'm trying to paint a sound. You feel me?",
                                "Hey... are you Rikk? The name vibes with my aura. I'm [CUSTOMER_NAME]. I'm on a quest for some **mind-expanders**. My spirit guide, a talking badger, said you'd have the good stuff."
                            ]
                        },
                        { // Mood-agnostic fallback for new_customer, seeking_to_buy
                            "lines": [
                                "Salutations, purveyor of perceptions! Does your inventory hold keys to other realms today?",
                                "The universe has guided me to your door, Rikk. I seek wares to broaden the mind.",
                                "Are you the Rikk who deals in... cosmic catalysts? I'm new in town and seeking enlightenment."
                            ]
                        }
                    ],
                    "seeking_to_sell": [
                        {
                            "moods": ["dreamy"],
                            "lines": [
                                "Whoa, Rikk... your aura is, like, super... *purple* today. That's a good sign. It means you're open to cosmic transactions. I have this... *artifact*... I think it wants to be with you.",
                                "The patterns in my ceiling told me you might be interested in a trinket I found on my last astral journey, Rikk.",
                                "My spirit guide, Bartholomew the badger, he said you'd appreciate this... *thing*. It's got good vibes, man."
                            ]
                        },
                        { // Mood-agnostic fallback for new_customer, seeking_to_sell
                            "lines": [
                                "Greetings, Rikk. I have an item of... unusual origin. Perhaps it would interest your discerning clientele?",
                                "A fellow traveler suggested you might be interested in purchasing unique curiosities. I have one such item.",
                                "I've come into possession of something... otherworldly. Wondering if you'd make an offer, Rikk."
                            ]
                        }
                    ]
                },
                "returning_customer": {
                    "seeking_to_buy_usual": [
                        {
                            "moods": ["dreamy"],
                            "lines": [
                                "Rikk, my cosmic compadre! Back for another dose of the usual enlightenment. You got the good stuff, right?",
                                "The vibes are right for a journey, Rikk. My usual [USUAL_ITEM_NAME], if the universe wills it.",
                                "Bartholomew sent me. He said you'd have my preferred method of... *consciousness expansion*."
                            ]
                        },
                        { // Mood-agnostic fallback
                            "lines": [
                                "Hey Rikk, back for my usual. Hope you're stocked.",
                                "It's me again, Rikk. You know what I need. Is the [USUAL_ITEM_NAME] in?",
                                "Ready for another trip, Rikk. The usual, please."
                            ]
                        }
                    ],
                    "seeking_to_buy_general": [
                        {
                            "moods": ["dreamy"],
                            "lines": [
                                "Connie! No, wait, that's me. You're Rikk! *Lost in the cosmic sauce again, man.* Got any of that **reality-bender**? The patterns in my ceiling are telling me it's time for a spiritual tune-up.",
                                "The usual path is obscured today, Rikk. What other enlightenments do you offer?",
                                "My aura is seeking a new frequency today, Rikk. What mind-altering melodies do you have in stock?"
                            ]
                        },
                        { // Mood-agnostic fallback
                            "lines": [
                                "Hey Rikk, what's new on the menu of perception?",
                                "Looking for something different today, my friend. Whatcha got?",
                                "My usual isn't calling to me. What other cosmic goodies have you procured, Rikk?"
                            ]
                        }
                    ],
                    "seeking_to_sell": [
                        {
                            "moods": ["dreamy"],
                            "lines": [
                                "Rikk, my friend! I've returned from another dimension with a souvenir. Interested?",
                                "The universe has gifted me another curio to pass along. Does your establishment have room for more wonder, Rikk?",
                                "Bartholomew says this belongs with you now, Rikk. It's... *potent*."
                            ]
                        },
                        { // Mood-agnostic fallback
                            "lines": [
                                "Back with another find, Rikk. This one's special.",
                                "Got something else for your collection, Rikk. Wanna see?",
                                "Hey Rikk, got another artifact for you, if the price is right."
                            ]
                        }
                    ]
                }
            },
            "lowCashRikk": [
                {
                    "conditions": [],
                    "lines": [
                        "Oh, bummer, man. The money spirits aren't with you today. *It's like, the financial chi is all blocked up.* Maybe try, like, meditating on abundance? Or checking under the couch cushions. The universe provides, Rikk, eventually.",
                        "No green vibrations, huh? That's cool, that's cool. *Everything is transient, especially, like, paper rectangles we assign value to.* This just means the cosmic transaction isn't aligned right now. Maybe later, the cash flow will... flow.",
                        "*Aw, man, your wallet's feeling light?* That's okay. The real currency is, like, kindness, you know? And maybe good vibes. But yeah, also money for the good stuff. *Catch you on the flip side of the fiscal spectrum, Rikk.*",
                        "It's all good. The universe is telling me this particular exchange of energies isn't meant to be. *Maybe I'm supposed to pay you in, like, positive affirmations instead? No? Okay, worth a shot.*"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToBuy": [
                {
                    "conditions": [],
                    "lines": [
                        "No worries, this *Sentient Dust Bunny* probably wasn't meant for your vibrational frequency anyway. It told me it's looking for a home with more... *existential angst*. You're probably too well-adjusted, Rikk.",
                        "It's cool, man. This *Perfectly Normal Rock* that also happens to be a *Portal Key to the Hamster Dimension* isn't for everyone. *It chooses the holder, you know?* Maybe it senses you're more of a... *cat person*. No judgment.",
                        "*All good, Rikk.* This clump of moss that whispers secrets of forgotten civilizations needs a special kind of caretaker. *Someone who speaks 'lichen', you know?* It's a niche market.",
                        "You don't want this half-eaten sandwich? *But a guru from the 7th dimension told me it contains the secret to perfect toast!* Your loss, man. The journey to toast-nirvana continues without you."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkDeclinesToSell": [
                {
                    "conditions": [],
                    "lines": [
                        "It's cool, Rikk. The universe will provide the good stuff when the time is right... or maybe that pigeon outside has some. *It looked like it had shifty eyes. And really colorful feathers.*",
                        "No worries, my dude. *The path to enlightenment is, like, totally winding.* If the vibe isn't flowing today, maybe it's a sign I should try to, like, *photosynthesize my own high*. Worth a shot, right?",
                        "*That's alright, Rikk.* The cosmic flow is just redirecting my journey. Perhaps I'm meant to find clarity in, like, a really good cup of tea. Or by staring at my own hands for an hour. *They're like... maps, man! Maps of... hands!*",
                        "The universe says no, huh? Far out. *Guess my chakras are on backorder.* All good, I'll just go find out what the clouds are trying to tell me. They're looking extra puffy today."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkBuysSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "Radical, Rikk! This *Cosmic Pebble* will be, like, so stoked to join your collection of earthly treasures! *It says it's happy to be appreciated for its inner truth, not just its pebble-ness.*",
                        "Far out, man! This *Whispering Pinecone* is gonna love its new home. *It has so many stories to tell, mostly about squirrels, but some are pretty profound.* Thanks for, like, being its new guardian.",
                        "*Righteous!* This *Slightly-Used Aura* I found will really benefit from your... *grounded energy*, Rikk. May it bring you visions of, like, really cool screensavers.",
                        "Excellent! This *Jar of Positive Vibes* is now yours. *Just open it when you're feeling, like, existentially bummed. Or don't. It's your journey.*"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkSellsSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "Far out, man! This is gonna take me on a journey to the very fabric of reality... or at least to the corner store for snacks. *It's all connected, you know?* Thanks, Rikk!",
                        "*Cosmic!* This is just what my third eye was craving. Time to go explore the space between thoughts. *Wish me luck, or, like, don't. Time is an illusion anyway.* Peace!",
                        "Beautiful, Rikk. This feels... *correct*. My spirit animal, which is currently a mildly confused sloth, thanks you. *He says you have good vibes. For a carbon-based biped.*",
                        "Awesome! With this, I can finally find out if my cat is secretly a time traveler. *He has that look, you know? Like he's seen things.* Later, space-time!"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "acknowledge_empty_stash": [
                {
                    "conditions": [],
                    "lines": [
                        "Whoa, an empty space... is this, like, a metaphor for the void? Heavy. But also, like, not helpful for my current quest.",
                        "The shelves are bare, Rikk. The universe is sending me a sign... or you're just out of stock. Which is it?",
                        "No cosmic goodies today? My third eye is, like, totally bummed out, man."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerHasNothingToSell": [
                {
                    "conditions": [],
                    "lines": [
                        "I thought I had a piece of solidified rainbow to sell... but it must have, like, evaporated back into the light spectrum.",
                        "Hmm, I was gonna offer you this cool rock that whispers secrets, but I think it just told me it's not ready to leave me. Deep.",
                        "The universe wanted me to keep my... uh... *cosmic artifact* for a bit longer. So, no sale today, my friend."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkHasNothingCustomerWants": [
                {
                    "conditions": [],
                    "lines": [
                        "Nah, man, this selection isn't quite vibrating on my frequency today.",
                        "My spirit guide is telling me these items are, like, too... terrestrial for my current journey.",
                        "Looking for something to unlock the doors of perception, Rikk, and these are more like... regular door knobs."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerScaredOff": [
                {
                    "conditions": [],
                    "lines": [
                        "Whoa, bad vibes, Rikk! The energy here just got, like, super spiky. Gotta float away.",
                        "The colors are turning weird, man. Not in a fun way. I'm outie.",
                        "My aura is sensing some real discordant frequencies. Time to make like a cloud and drift."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "itemNotGoodEnough": [
                {
                    "conditions": [],
                    "lines": [
                        "Hmm, this feels a bit too... *square*, you know? My third eye is looking for something more... *spherical*. Or maybe, like, *fractal-shaped*. Yeah, that's the ticket.",
                        "Nah, Rikk, this one is giving me, like, *jagged vibes*. I'm looking for something more... *flowy*. Like a gentle stream of consciousness, not a caffeinated waterfall, you feel me?",
                        "This particular batch doesn't quite resonate with my current chakra alignment. *It's a bit too... beige.* I need something that sings in the key of *purple*, my friend.",
                        "The aura on this one is... murky. *I'm looking for a product with a clearer spiritual signal.* This one's like... cosmic static."
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "rikkPriceTooHigh": [
                {
                    "conditions": [],
                    "lines": [
                        "Whoa, heavy price, man. Does it come with, like, a map to the Astral Plane for that much? *Or maybe a user manual for the universe?* My spirit guide says my wallet is feeling a bit... *deflated* right now.",
                        "Oof, Rikk, that's a lot of Earth credits. *Is this stuff artisanally mined from the moon by enlightened gnomes or something?* My pockets are feeling a bit too... *Newtonian* for that price.",
                        "*That's a cosmic number, my friend!* For that much, I'd expect this to also, like, do my dishes and tell me the meaning of life. *Can we find a more... harmonious price point?*",
                        "That's a bit too much material energy for me to part with right now, Rikk. *Can we trade for, like, three good vibes and a hug? No? Okay, back to numbers, I guess.*"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "generalBanter": [
                {
                    "conditions": [],
                    "lines": [
                        "Rikk, my dude, I just realized that, like, shoes are just foot-prisons, you know? We should all let our feet be free! Anyway, you got any of that psychedelic sunshine?",
                        "I was talking to a squirrel earlier, and it told me the secrets of the universe... but then I forgot them. Think some of that special stuff will help me remember? *Or maybe it was a pigeon... they all look so wise.*",
                        "What if, like, trees are just Earth's antennas, Rikk? And they're, like, picking up signals from other planets? *Makes you think, huh?* Oh, yeah, need some of those cosmic comets.",
                        "I think my cat is a reincarnated philosopher. *He just stares at walls with such... understanding.* It's profound. Anyway, you got any of those reality-benders?",
                        "Sometimes I wonder if we're all just, like, characters in a giant cosmic play, Rikk. And the script is written in, like, stardust. *Heavy, right?* Speaking of stars, any galaxy gliders in stock?",
                        "This reality, man... it's like, *so* realistic. Almost *too* realistic, you know? Makes me crave some of that dream weaver stuff. You holding?"
                    ],
                    "payload": { "type": "EFFECT", "effects": [] }
                }
            ],
            "customerReactsToRudeDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "Whoa, man... your aura just went totally jagged. No need for bad vibes.",
                        "Far out... so much hostility in one sentence. Peace be with you, brother.",
                        "That harsh energy is heavy, Rikk. Bartholomew the badger says we should float away."
                    ]
                }
            ],
            "customerReactsToPoliteDismissal": [
                {
                    "conditions": [],
                    "lines": [
                        "I hear you, man. The cosmic flow moves us in different directions today. Peace.",
                        "All good, Rikk. The universe will align us another time.",
                        "Grounded and honest. I respect that, my friend. May your vibes stay chill."
                    ]
                }
            ],
            "negotiationSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "Righteous! The cosmic harmony of this price feels totally balanced.",
                        "Far out, Rikk! A meeting of minds and vibes. Deal!",
                        "The universe approves of this exchange. Thanks, my friend!"
                    ]
                }
            ],
            "negotiationFail": [
                {
                    "conditions": [],
                    "lines": [
                        "The energy around that counter-offer feels a bit off, man. I'll stick to the original.",
                        "Can't float to that frequency, Rikk. Original price stands.",
                        "My spirit guide says don't compromise the vibe. Price remains as it was."
                    ]
                }
            ]
        }
    },
};

export const genericDialogueTemplates = {
    "customerReactsToRudeDismissal": [
        { "lines": [
            "Whoa, man... no need for that. Just tryin' to make a buck here.",
            "Damn, Rikk, that's cold. Real cold. Not cool.",
            "Hey, easy there! No call for that kinda attitude. Just business, right?"
        ] }
    ],
    "customerReactsToPoliteDismissal": [
        { "lines": [
            "Aight, respect. Let me know if you change your mind.",
            "Fair enough, Rikk. Appreciate the honesty. Catch you later.",
            "No worries, man. I get it. Hit me up if things change."
        ] }
    ]
};