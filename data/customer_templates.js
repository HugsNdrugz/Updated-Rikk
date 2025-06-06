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
        "dialogue": {
            "greeting": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Eyes wide, whispering, twitching) Rikk? Rikk, man, you gotta help me! The shadows are whispering my PIN number! I need that [ITEM_NAME] before the squirrels start judging my life choices. How much? And tell me that pigeon isn't a cop! It's wearing a tiny earpiece, I swear!",
                        "(Voice trembling) Rikk? You alone? I heard a click on my phone... pretty sure it was the Feds, or maybe just my teeth chattering too loud. Need that [ITEM_NAME], man, my brain's trying to do sudoku with my anxieties. What's the toll, and make it snappy, the streetlights are blinking in Morse code!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "(Grinning ear-to-ear, slightly too loud) RIKK! My savior! You're like a guardian angel, but with better connections! Last batch had me convinced I could talk to cats! Turns out, they're terrible conversationalists. Got more of that magic [ITEM_NAME]? Price is just a number when you're floating! My rent can wait, my sanity can't!",
                        "(Beaming) Woo! Rikk! Feeling like a king today! Or at least a moderately successful duke! That last score? *Chef's kiss*. Got more of that [ITEM_NAME]? I'm ready to solve all the world's problems, starting with my own lack of... this."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "angry"
                        }
                    ],
                    "lines": [
                        "Alright Rikk, enough games! It's me, [CUSTOMER_NAME], and I'm about two seconds from screaming into a traffic cone! I need my [ITEM_NAME], and I need it YESTERDAY! How much, and don't you dare jerk me around!",
                        "Rikk! You see me? Good. Because I'm seeing RED. Need that [ITEM_NAME]. NOW. Price better be right, or I'm gonna start reviewing your \"establishment\" on Yelp, and it won't be pretty."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Rikk! Thank god! It's me, [CUSTOMER_NAME]! My soul is trying to escape through my eyeballs. I'm hurtin' bad, need that [ITEM_NAME]... How much you asking? Don't play hard to get, Rikk, my nerves are doing the Macarena.",
                        "Yo, uh, you Rikk? They said you were the shaman of the streets. I'm hurtin' bad, need that [ITEM_NAME]... How much you asking? Don't play hard to get, Rikk, my nerves are doing the Macarena.",
                        "Rikk, my man! [CUSTOMER_NAME] here! My insides feel like a washing machine full of angry badgers. That [ITEM_NAME], what's the damage? And please, tell me it's the good stuff, my disappointment tolerance is at an all-time low.",
                        "You Rikk? Heard you're the guy. Got that... *medicine*? Specifically the [ITEM_NAME] kind. Price? And be gentle, my wallet's already crying."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "lowCashRikk": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Eyes darting) No cash?! Rikk, the static on the TV is calling me names! You gotta find some, man, before I try to pay with my collection of bottle caps!",
                        "Broke?! Are you trying to make the shadow people win, Rikk?! They feed on disappointment!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "Aww, Rikk, you party pooper! I was about to teach you the secret handshake of the enlightened! Go shake down your couch cushions, I'll wait... and maybe try to levitate.",
                        "No moolah? Come on, Rikk! My chakras were aligning for this! Now they're just... awkwardly bumping into each other."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "You broke, Rikk? Seriously? My dealer being broke is like my therapist needing therapy. Unsettling, man. I'm about to start seeing sound waves.",
                        "No cash? My hope just did a swan dive off a very tall building. You sure you checked under the mattress, Rikk?"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkDeclinesToBuy": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Gasping) You don't want this priceless artifact?! Is it bugged?! Did *they* tell you not to take it?! Just take it, before the gnomes in my cereal box stage an intervention!",
                        "Not buying?! Is this a test, Rikk? Am I being recorded?! This is a perfectly normal, slightly stained... heirloom!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "No dice, huh? Well, more for me! Or, you know, for the pawn shop. Gotta fund my dream of competitive napping.",
                        "Your loss, Rikk! This baby was gonna fund my new career as a professional cloud-watcher! So much potential!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "What, Rikk? This is vintage! Okay, maybe not vintage, but it's definitely... something. My guts are playing the blues, man!",
                        "Seriously? You're passing this up? My cat seemed to like it. And she's got impeccable taste... for a cat."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkDeclinesToSell": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Voice cracking) You holdin' out?! Are you working with the squirrels?! They're organized, Rikk, they have a tiny general! Don't do this to me, my brain feels like a shaken snow globe!",
                        "No sell?! Is this because of that thing I said about your haircut? I take it back! It's... avant-garde! Just gimme the stuff!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "Aww, man! You're harshing my mellow! I was just about to achieve nirvana, or at least find my other sock. Well, back to reality, I guess. It bites.",
                        "No deal? Dang. And I was all set to write a symphony inspired by this exact moment of... not getting what I want. Tragic, really."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Come on, Rikk! You holding out is like a doughnut shop running out of glaze! It's just... wrong. My spirit animal is a deflated bouncy castle right now.",
                        "You serious, Rikk? My disappointment is immeasurable, and my day is ruined. Thought we were boys!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkBuysSuccess": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Snatches cash, looking around wildly) Good. Thanks. Gotta go. The pigeons are deploying their drones. Don't follow me, and if you see a man in a trench coat made of squirrels, run!",
                        "Alright, alright. Cash received. Now I can finally afford that tinfoil upgrade for my windows. They're listening, Rikk. They're always listening."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "Sweet cash! You're a legend, Rikk! Now I can afford that luxury ramen I've been eyeing! Or maybe just more... *this*. Decisions, decisions!",
                        "Woo-hoo! Money! I feel like a millionaire! A very temporary, slightly twitchy millionaire! Thanks, Rikk!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Preciate it, Rikk. You a real one. Gotta go chase that dragon... or maybe just a really good taco.",
                        "Solid. This helps. Now I can stop hearing the voices... or at least, they'll be saying nicer things."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": [
                            {
                                "type": "triggerEvent",
                                "eventName": "publicIncident",
                                "chance": 0.15,
                                "condition": {
                                    "stat": "mood",
                                    "op": "isNot",
                                    "value": "happy"
                                },
                                "heatValue": 3
                            }
                        ]
                    }
                }
            ],
            "rikkSellsSuccess": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Grabs item, hides it immediately) Yeah, that's the ticket. Good lookin'. Now, if you'll excuse me, I think the mailman is trying to read my thoughts. Gotta wear my tinfoil beanie.",
                        "Got it. Safe. Now to find a place where the walls don't have eyes... or mouths. This is harder than it looks, Rikk."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "YES! That's the ambrosia! My brain cells are throwing a party and you're invited, Rikk! Figuratively, of course. Unless you have snacks.",
                        "Oh, sweet relief! It's like my soul just got a spa day! You're the best, Rikk! Like, a five-star dealer!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Yeah, that's the good stuff. Phew... my soul just sighed in relief.",
                        "Nice. This'll do. Now I can finally face... well, probably just another Tuesday. But slightly less horribly."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": [
                            {
                                "type": "triggerEvent",
                                "eventName": "publicIncident",
                                "chance": 0.15,
                                "condition": {
                                    "stat": "mood",
                                    "op": "isNot",
                                    "value": "happy"
                                },
                                "heatValue": 3
                            }
                        ]
                    }
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
        "dialogue": {
            "greeting": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Voice low, impeccably dressed but eyes scanning) Rikk. A word. Is this establishment... secure? One hears whispers. I require absolute discretion for my acquisition of [ITEM_NAME]. A blemish on my reputation is more costly than any bauble you might possess. And my tailor is very judgemental.",
                        "(Adjusts cufflinks, gaze sharp) Rikk. The usual precautions, I trust? My associates value... silence. As do I. The [ITEM_NAME] in question must be... untainted. My patience for complications is famously thin."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "(A charming, yet slightly condescending smile) Ah, Rikk, my purveyor of peccadilloes! I trust your offerings today are as refined as my taste in... well, everything. Life's too short for cheap thrills, or cheap people, for that matter. What delicacy do you have for my discerning palate regarding [ITEM_NAME]? I hope it pairs well with my vintage Bordeaux and impending world domination.",
                        "(Chuckles lightly) Rikk. Always a pleasure. Or, at least, a necessary transaction. The [ITEM_NAME] – I expect nothing less than your finest. Mediocrity is a contagion I actively avoid."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Rikk. The usual standards, if you please. The [ITEM_NAME]. ",
                        "I am given to understand you are the Rikk of renown? One hopes the rumors of quality are not... exaggerated. I am in the market for the most... efficacious [ITEM_NAME] available. Time is a luxury I do not squander on subpar experiences.",
                        "Rikk. Let's not dally. My interest lies in your premium [ITEM_NAME]. ",
                        "You are Rikk, I presume? My sources indicate you may have access to the caliber of [ITEM_NAME] I require. Impress me."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "itemNotGoodEnough": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Scoffs quietly, pushes item back delicately) This is... pedestrian, Rikk. And potentially compromised. Are you attempting to insult my intelligence, or worse, my security?",
                        "Unacceptable. This item lacks... finesse. And frankly, it smells a bit like desperation. Not yours, I hope."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "My dear Rikk, while I appreciate the effort, this simply won't do. It lacks... panache. The je ne sais quoi of true illicit luxury. I was anticipating something to inspire, not merely... exist. My dog has toys of higher quality.",
                        "Charming. But no. I require something that whispers of exclusivity, not shouts from the discount rack."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "This is... unacceptable, Rikk. I deal in excellence, not adequacy. Do you have something that doesn't scream 'bargain bin'?",
                        "Rikk, Rikk, Rikk. Are we playing games? This is amateur hour. Show me what a *professional* has."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkPriceTooHigh": [
                {
                    "conditions": [],
                    "lines": [
                        "An ambitious valuation, Rikk. Particularly for an item of... uncertain provenance. One hopes this price doesn't include a surcharge for unwanted attention. My offer stands.",
                        "An ambitious valuation, Rikk. While I appreciate a spirited attempt, my appraisers would value this differently. I'm generous, not a simpleton. However, for expediency...",
                        "An ambitious valuation, Rikk. I am prepared to offer a fair sum for genuine quality, not subsidize your aspirations. My figure is non-negotiable.",
                        "That price is... theatrical. Particularly for an item of... uncertain provenance. One hopes this price doesn't include a surcharge for unwanted attention. My offer stands.",
                        "That price is... theatrical. While I appreciate a spirited attempt, my appraisers would value this differently. I'm generous, not a simpleton. However, for expediency...",
                        "That price is... theatrical. I am prepared to offer a fair sum for genuine quality, not subsidize your aspirations. My figure is non-negotiable.",
                        "A bold gambit, Rikk. Particularly for an item of... uncertain provenance. One hopes this price doesn't include a surcharge for unwanted attention. My offer stands.",
                        "A bold gambit, Rikk. While I appreciate a spirited attempt, my appraisers would value this differently. I'm generous, not a simpleton. However, for expediency...",
                        "A bold gambit, Rikk. I am prepared to offer a fair sum for genuine quality, not subsidize your aspirations. My figure is non-negotiable.",
                        "Rikk, please. That price is an insult to both my intelligence and my tailor. I have a counter-proposal, if you're wise enough to hear it."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkBuysSuccess": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Secures item, a curt nod) Prudent. Ensure all traces of this transaction are... vaporized. I trust your discretion is as valuable as your wares.",
                        "Acceptable. The less said, the better. For all involved."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "Excellent. A worthy acquisition. Your network is... surprisingly effective for this locale. One might almost consider it a legitimate enterprise. Almost.",
                        "Marvelous. This will serve its purpose admirably. You have a certain... raw talent, Rikk."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Satisfactory. Your service is noted, Rikk. Continue to provide this level of quality, and our association will be mutually beneficial.",
                        "As expected. Keep this standard, Rikk. My associates have... high expectations."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": [
                            {
                                "type": "triggerEvent",
                                "eventName": "highRollerTip",
                                "chance": 0.1,
                                "tipPercentage": 0.05,
                                "credValue": 1
                            }
                        ]
                    }
                }
            ],
            "rikkSellsSuccess": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Accepts item with a discerning glance) Acceptable. See to it that our... interaction remains unrecorded. By any entity.",
                        "Very well. Discretion, Rikk. Above all else."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "Marvelous! This will pair exquisitely with my evening's... *endeavors*. You have a talent, Rikk. A raw, unpolished, slightly illegal talent. Cultivate it.",
                        "Splendid! This is precisely the caliber I've come to expect. Or at least, hope for."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Indeed. This meets the standard. Until our next transaction, Rikk. Maintain the quality.",
                        "Precisely. You may inform your... lesser clients that this level of product is reserved."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": [
                            {
                                "type": "triggerEvent",
                                "eventName": "highRollerTip",
                                "chance": 0.1,
                                "tipPercentage": 0.05,
                                "credValue": 1
                            }
                        ]
                    }
                }
            ]
        }
    },
    "REGULAR_JOE": {
        "key": "REGULAR_JOE",
        "baseName": "Chill Chad",
        "avatarUrl": "https://randomuser.me/api/portraits/women/67.jpg",
        "baseStats": {
            "mood": "chill",
            "loyalty": 0,
            "patience": 3,
            "relationship": 0
        },
        "dialogue": {
            "greeting": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Lowering voice, glancing around) Yo Rikk, quick word. Feel like the squirrels are judging me today, man. And that one dude is definitely not just 'walking his dog'. Just need my usual [ITEM_NAME], nothing too wild. Let's keep it low-pro, yeah? My grandma thinks I'm a youth pastor.",
                        "Rikk, hey. Uh, you see that van parked down the street? Been there for like, an hour. Probably nothing, right? Anyway, got any of that [ITEM_NAME]? Keep it on the DL."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "(Big smile, relaxed posture) Rikk, my dude! What's good? Sun's shining, birds are singing, and I haven't lost my keys yet today – it's a miracle! Got that smooth [ITEM_NAME] for a fair price? Trying to ride this good wave all the way to... well, probably just my couch, but a happy couch!",
                        "Yo Rikk! Feelin' golden today! Just cashed my paycheck – which means I have exactly enough for rent and one good time. You got that [ITEM_NAME] to make it count?"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Yo Rikk, it's [CUSTOMER_NAME]! Good to see ya. Just looking for a chill hookup for some [ITEM_NAME]. No drama, just good vibes and a fair shake, you know?",
                        "Hey, you Rikk? Heard good things. Just looking for a chill hookup for some [ITEM_NAME]. No drama, just good vibes and a fair shake, you know?",
                        "What up, Rikk! [CUSTOMER_NAME] in the house. Or, you know, at your door. Need that [ITEM_NAME]. Keepin' it mellow.",
                        "Yo, Rikk right? My buddy said you're the man for that [ITEM_NAME]. Hoping to just... y'know, chill."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "negotiationSuccess": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "Aight, cool, cool. But let's wrap this up, man, my aura feels... exposed. And I think that car alarm is Morse code for 'bust'.",
                        "Deal. But for real, Rikk, next time we meet in a submarine. Less windows."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "Sweet! That's what I'm talking about! You're a legend, Rikk! High five! Or, like, an air five, if you're not into the whole 'touching' thing.",
                        "Right on! Knew we could work it out! You're like the Gandalf of good deals!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Yeah, that's solid. Good looking out.",
                        "Cool, cool. That works for me. Appreciate it, my dude."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "negotiationFail": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "Nah, man, that's a bit steep. And honestly, this whole block is giving me the heebie-jeebies right now. Think I saw a cop hiding in a trash can.",
                        "Can't do it, Rikk. My spidey-senses are tingling, and not in a fun way. Price is too high for this level of weird."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "Whoa there, Rikk, easy on the wallet! My bank account is already giving me the silent treatment. Maybe next time when I win the lottery, or, you know, find a twenty.",
                        "Oof, that's a bit out of my good-times budget. Gotta save some for pizza, you know? Priorities."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Ah, that's a little rich for my blood, Rikk. Gotta watch the budget, you know? Adulting and all that jazz.",
                        "Nah, that's a bit much for me today, bro. Maybe another time."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkBuysSuccess": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "Nice, needed that. Thanks. Gotta dip, man. Pretty sure that mailman knows my browser history.",
                        "Cool. Cash. Now to vanish like a fart in the wind. A very nervous fart."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "Awesome, thanks Rikk! This'll fund my epic quest for the perfect burrito! Or, like, pay a bill. Probably the bill. Sigh.",
                        "Sweet! You're a lifesaver, man! Or at least a 'don't have to eat instant noodles for a week' saver!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Cool, appreciate it. Keeps the dream alive, or at least the Wi-Fi on.",
                        "Right on. Good deal. Later, Rikk."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkSellsSuccess": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "Sweet. Got it. Later, Rikk. And if anyone asks, we were discussing... sustainable gardening.",
                        "Nice one. Now, if you see me running, try to keep up. Or don't. Probably better if you don't."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "Right on! This is gonna be a good one. Time to go ponder the mysteries of the universe, or just what's for dinner. Big questions, man.",
                        "Excellent! My couch and I have a very important meeting scheduled, and this is the guest of honor!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Nice one, Rikk. Just what the doctor didn't order, but what my soul needed.",
                        "Perfect. Time to kick back and let the good times roll."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ]
        }
    },
    "INFORMANT": {
        "key": "INFORMANT",
        "baseName": "Whiskey Whisper",
        "avatarUrl": "",
        "baseStats": {
            "mood": "cautious",
            "loyalty": 0,
            "patience": 3,
            "relationship": 0
        },
        "dialogue": {
            "greeting": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Hushed, jumpy, clutching a worn notepad) Rikk, keep your voice down! They're listening, man, the walls have ears, and the rats are wearing wires! I got intel, grade-A, but this drop needs to be ghost. My contact lens just transmitted a warning.",
                        "(Looks over both shoulders, pulls hat lower) Rikk. We need to talk. Quietly. I've got something that could fry bigger fish than you... or me. Info's hot. Price is hotter. You in?"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "(A sly, self-satisfied grin) Rikk, my friend! You've caught me on a banner day. The streets are singing to me, and their song is pure profit. I've got a symphony of secrets that'll make your ears tingle and your wallet bulge. This ain't just intel, it's a golden ticket.",
                        "(Leans in conspiratorially) Rikk! Good timing. I just heard something that'll make your jaw drop and your pockets jingle. This is exclusive. Very exclusive. And very, very lucrative for the right buyer."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Rikk. Got a fresh whisper for ya. Hot off the griddle. This stuff ain't free, you know. Knowledge is power, and power's got a price tag.",
                        "You Rikk? Heard you trade in... *information*. I got some prime cuts. This stuff ain't free, you know. Knowledge is power, and power's got a price tag.",
                        "Rikk. Word on the street is you're looking for an edge. I might have just the thing. Information broker, at your service... for a fee.",
                        "They call you Rikk? Good. I hear things. Things people pay to know. Interested?"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkCannotAfford": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "No dough, no show, Rikk! And every second we stand here, the surveillance camera across the street zooms in a little more! Get the green or I'm smoke!",
                        "Can't pay? Then you can't play, Rikk! And this game is getting dangerous!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "Come now, Rikk, don't be thrifty with destiny! This information is champagne, and you're offering beer money. My sources have standards, you know.",
                        "Ah, a budget connoisseur, are we? Pity. This particular vintage of veritas is for the top shelf only."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "This ain't a charity, Rikk. My whispers have value. You want the dirt, you gotta pay for the shovel.",
                        "Look, Rikk. Good intel costs. Bad intel costs more. Your call."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkBuysSuccess": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Slips info quickly, eyes darting) Use it, don't lose it. And burn this conversation from your memory. And maybe your clothes. They know things, Rikk. They know what you had for breakfast.",
                        "There. Now act like we were discussing the weather. Bad weather. Very bad."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "There you go. Pure gold. Handle it with care, Rikk. Some secrets have teeth. Pleasure doing business. Now, if you'll excuse me, I have more... listening to do.",
                        "Excellent choice, Rikk. This little nugget will pay dividends. Or, you know, keep you out of jail. Potato, potahto."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Solid. Use that wisely, it could save your hide. Or make you a mint. Keep my number.",
                        "Good. Remember where you got it. And remember, some doors are best left unopened... unless you have a key. Which I just sold you."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
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
        "dialogue": {
            "greeting": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "(Forced, shaky smile, clutching a \"Neighborhood Watch\" pamphlet) Oh, Rikk! Fancy meeting you here! Just... patrolling. For safety! [ITEM_NAME]? My, that's an... *unusual* brand. Not illegal, I hope? Officer Friendly was just asking about unusual brands...",
                        "Anything... *unusual* happening today, Rikk? Just trying to keep our community... pristine! So many shadows these days!",
                        "(Jumps slightly) Rikk! Oh! You startled me. Just admiring the... architecture. So, uh, any... *news*? [ITEM_NAME] you have... it's not one of those... *things* they talk about on the news, is it?",
                        "Everything... *above board* today?"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "(Beaming, perhaps a little too eagerly) Rikk! Hello there! Just taking in the vibrant tapestry of our neighborhood! So much... activity! [ITEM_NAME]? How... *intriguing*! Always interested in local commerce, you know! For the community newsletter!",
                        "What's the good word, Rikk? Any juicy tidbits for a concerned citizen? Knowledge is power, especially for neighborhood safety!",
                        "(Claps hands) Rikk! Just the man I wanted to see! You always know what's happening on the street. It's like you have a sixth sense for... *events*. Anything I should be... *aware* of?"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Well hello there, Rikk! Such a... *dynamic* street, isn't it? [ITEM_NAME]? My, my, what have we here? Some [ITEM_NAME]? You always have the most... *unique* things. Tell me all about it! For... research, of course!",
                        "Anything exciting happening in your world, Rikk? I just love hearing about what the young entrepreneurs are up to!",
                        "Oh, Rikk! Just out for a stroll. Trying to keep an eye on things, you know. For the good of the community. [ITEM_NAME] looks... *special*. What's its story?",
                        "Any... *interesting developments* I should make a note of?"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkSellsSuccess": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "Oh, lovely. Thank you, Rikk. This will be... cataloged. For... posterity. Yes. Now, I really must be going, I think my petunias need me. And they have excellent hearing.",
                        "Very good. I'll just... file this away. Under 'miscellaneous curiosities'."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "Splendid! Thank you, Rikk! This is just perfect for my... collection. You're such a vital part of the... local color! The police will be so interested... I mean, the historical society!",
                        "Oh, wonderful! This will make an excellent... *exhibit* in my report... I mean, my scrapbook!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Oh, that's... *noted*. Thanks, Rikk. Very... informative.",
                        "Interesting. I'll be sure to... remember this. Thanks."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": [
                            {
                                "type": "triggerEvent",
                                "eventName": "snitchReport",
                                "chance": 0.65,
                                "heatValue": 15,
                                "credValue": -2
                            }
                        ]
                    }
                }
            ],
            "rikkDeclinesToSell": [
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "paranoid"
                        }
                    ],
                    "lines": [
                        "Oh, a pity. No matter. Just... making conversation. One has to be vigilant, you know. So many... *variables* in this neighborhood.",
                        "Not for sale? Understood. Completely understood. No need to elaborate. At all."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [
                        {
                            "stat": "mood",
                            "op": "is",
                            "value": "happy"
                        }
                    ],
                    "lines": [
                        "Oh, that's quite alright, Rikk! Just curious, you know me! Always eager to learn! Perhaps another time. I'll just make a little note... for myself, of course!",
                        "No problem at all! More for others, then! Sharing is caring, after all! Unless it's illegal. Then it's evidence."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                },
                {
                    "conditions": [],
                    "lines": [
                        "Oh, really? Well, alright then. Just trying to be friendly! One never knows what interesting things are about!",
                        "Keeping it to yourself, Rikk? Mysterious! I like a good mystery."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ]
        }
    },
    "STIMULANT_USER": {
        "key": "STIMULANT_USER",
        "baseName": "Motor-Mouth Marty",
        "avatarUrl": "",
        "baseStats": {
            "mood": "manic",
            "loyalty": 0,
            "patience": 3,
            "relationship": 0
        },
        "dialogue": {
            "greeting": [
                {
                    "conditions": [],
                    "lines": [
                        "Rikk! My man! My legend! You will NOT believe the idea I just had! We're talking revolutionary, Rikk, REVOLUTIONARY! It involves pigeons, a thousand tiny jetpacks, and a synchronized aerial ballet that will solve rush hour traffic! PERMANENTLY! Oh, right, yeah, you got any of that [ITEM_NAME]? My brain's going a million miles a minute, and I need to keep up with it! How much for the zoom-zoom juice? And have you ever wondered if squirrels are just tiny, furry spies? Because I have. Extensively.",
                        "Whoa, Rikk, TIMING! I was just explaining to this lamppost here how the entire global economy is secretly controlled by llamas! It's all in the wool, Rikk, the WOOL! They're playing the long game! Anyway, you got that [ITEM_NAME]? I need to, uh, process some very important data. Very, very fast. Price? Don't care, just NEED IT! You ever try to teach a fish to play poker? It's harder than it looks, man, way harder!",
                        "Marty! No, wait, Rikk! It's me, [CUSTOMER_NAME]! Or am I Marty? Doesn't matter! Got any of that [ITEM_NAME]? I'm onto something HUGE! Bigger than breadboxes! Bigger than... than... BIG THINGS! My thoughts are racing like caffeinated cheetahs, Rikk! We should invent a new color! Something... LOUDER! How much for the go-go powder?",
                        "You Rikk? Heard you're the wizard of WHIZZ! The sultan of SPEED! The... uh... guy with the good stuff! Name's [CUSTOMER_NAME], and I'm on a MISSION! A mission fueled by ideas and, hopefully, soon, by that sweet, sweet [ITEM_NAME]! So, what's the word, bird? And why DO birds suddenly appear? Is it a government conspiracy? Let's discuss!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "lowCashRikk": [
                {
                    "conditions": [],
                    "lines": [
                        "NO MONEY?! Rikk, are you KIDDING ME?! My entire plan to build a self-folding laundry empire depended on this transaction! This is a CATASTROPHE! Now the socks will remain unfolded! Think of the CHAOS!",
                        "Broke?! But... but... my hyper-intelligent hamster, Sir Reginald Fluffington III, he predicted this deal would fund our expedition to find the Lost City of Atlantis! He even packed his tiny scuba gear! This is setting back interspecies archaeology by DECADES, Rikk!",
                        "You're out of cash? My brain just screeched to a halt! Well, not really, it's still going pretty fast, but this is a MAJOR roadblock, Rikk! A real spanner in the works of my genius! I was about to patent breathable coffee! BREATHABLE COFFEE, RIKK!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkDeclinesToBuy": [
                {
                    "conditions": [],
                    "lines": [
                        "YOU DON'T WANT IT?! But this blueprint for squirrel-sized battle armor is revolutionary! Think of the acorn defense capabilities! You're missing out, Rikk! This is the future of rodent warfare! Your loss! COMPLETELY YOUR LOSS!",
                        "Not interested in my half-finished perpetual motion machine? It only needs a few more... uh... things! And a LOT more duct tape! This is visionary stuff, Rikk! You'll regret this when I'm accepting my Nobel Prize! FROM THE MOON!",
                        "You're passing on THIS?! This... this THING?! It's a... it's a paradigm shift in... something! I haven't figured out what yet, but it's BIG! You lack vision, Rikk! VISION!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkDeclinesToSell": [
                {
                    "conditions": [],
                    "lines": [
                        "NO DEAL?! But I can feel my ideas slowing down, Rikk! It's like watching a Ferrari run out of gas in slow motion! Tragic! Utterly tragic! Don't you understand the URGENCY?! I'm on the verge of discovering why cats purr! THE WORLD NEEDS TO KNOW!",
                        "You're cutting me off?! Rikk, I'm like a rocket ship, and you're withholding the fuel! My trajectory was set for GENIUS! Now I'm just... orbiting mediocrity! This is NOT GOOD!",
                        "Can't sell?! But I was about to write a seven-act opera about the philosophical implications of cheese! This is a major setback for the arts, Rikk! A MAJOR SETBACK!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkBuysSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "YES! Cash money! Fuel for the fire! Now I can finally buy that industrial-sized vat of glitter I need for my pigeon communication system! It's all about visual signaling, Rikk! THEY'LL SEE IT FROM SPACE! Thanks, you're a lifesaver! Or at least, an idea-saver!",
                        "BRILLIANT! This is perfect! This will fund my research into why donuts have holes! Is it a metaphor? Are they portals? I NEED ANSWERS, RIKK! You're the best! The absolute BEST! Like, top-tier human!",
                        "SOLD! Excellent transaction, my friend! With this, I can acquire the necessary components for my plan to teach squirrels interpretive dance! It'll be bigger than Broadway! BIGGER! Gotta go, ideas are COOKING! Smell ya later, innovator!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkSellsSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "YES! THE GOOD STUFF! My brain is already thanking you! Ideas are POPPING like corn in a microwave, Rikk! Gotta go, gotta invent, gotta... DO ALL THE THINGS! You're a national treasure! Or at least a neighborhood one!",
                        "FANTASTIC! This is the nectar of the gods of innovation! I can feel the breakthroughs coming! Prepare for a paradigm shift, Rikk! Or at least a very enthusiastic PowerPoint presentation! Later!",
                        "ACQUIRED! The precious! Now my thoughts can achieve MAXIMUM VELOCITY! Thanks, Rikk! You're not just a dealer, you're a muse! A very helpful, slightly shady muse! TO THE LABORATORY! (Which is my kitchen table)."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "itemNotGoodEnough": [
                {
                    "conditions": [],
                    "lines": [
                        "This? Rikk, this is... this is like putting regular gas in a rocket ship! I need the high-octane stuff! The brain-blasters! This ain't gonna cut it for my plan to teach dolphins astrophysics! They have standards, you know!",
                        "Nah, Rikk, this won't do. My ideas are thoroughbreds, and this is pony fuel! I'm talking warp speed, Rikk, WARP SPEED! This is... this is dial-up modem speed! In my brain! The horror!",
                        "Not quite right, my friend. I need something that ZINGS! Something that ZAPS! Something that makes my neurons do the cha-cha! This is more of a slow waltz. Next!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkPriceTooHigh": [
                {
                    "conditions": [],
                    "lines": [
                        "WHOA! That price, Rikk! That's... that's astronomical! Are the numbers themselves on stimulants?! My budget is screaming! It's a very loud, very agitated scream! Can we... recalibrate those digits? For the sake of innovation!",
                        "Ouch, Rikk! That stings the old wallet-erino! I'm trying to fund groundbreaking discoveries here, not buy a small island! Though a small island would be nice... Focus, Marty, FOCUS! How about a price that doesn't make my bank account cry?",
                        "Yikes! That's a bit steep, even for a visionary like myself! My ideas are priceless, Rikk, but my cash is definitely not! Let's haggle like two very energetic... uh... hagglers!"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "generalBanter": [
                {
                    "conditions": [],
                    "lines": [
                        "You ever think about how, like, pigeons are just government drones, Rikk? But they're, like, *organic* drones? Makes you think. Oh, right, the 'Tina's Turbo Tabs', how much for those speed demons?",
                        "So I was thinking, we could replace all the city buses with, like, giant catapults! Think of the efficiency! Less traffic, more... airborne commuters. Anyway, got any of that 'White Pony'?",
                        "(If deal fails) This is a disaster! A travesty! My whole plan to reorganize the city's stray cat population by alphabetical order depended on this! Now what am I gonna do? They'll be so confused! THIS IS YOUR FAULT, RIKK!",
                        "Rikk, my man, you ever stare at a lightbulb for, like, an hour? The secrets it holds! The STORIES! Oh, yeah, almost forgot, need to re-up on the brain-boosters. Whatcha got that screams 'EUREKA!'?",
                        "I've got it! A new system for dog walking! We attach tiny parachutes to them and launch them from rooftops! They'll love it! It's efficient! It's... probably illegal. Damn. Anyway, how about those 'Zoomer Boomers'?",
                        "Okay, hear me out: squirrels with tiny top hats and monocles. Why? WHY NOT, RIKK? It's called FASHION! Also, I need some 'Fast Forward Flakes'. My brain's buffering."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ]
        }
    },
    "PSYCHEDELIC_EXPLORER": {
        "key": "PSYCHEDELIC_EXPLORER",
        "baseName": "Cosmic Connie",
        "avatarUrl": "",
        "baseStats": {
            "mood": "dreamy",
            "loyalty": 0,
            "patience": 3,
            "relationship": 0
        },
        "dialogue": {
            "greeting": [
                {
                    "conditions": [],
                    "lines": [
                        "Greetings, fellow traveler! Rikk, is it? Or are you just, like, a reflection of Rikk? Whoa. Heavy. I was just pondering the interconnectedness of all things, you know? Like, what if this sidewalk is actually, like, the eyebrow of a giant? Anyway, you got any of [ITEM_NAME]? My soul is trying to dial into the cosmic modem.",
                        "Rikk, my dude! I had this epiphany! What if, like, colors are just, like, opinions, man? And we all see them differently? Mind blown, right? So, about that [ITEM_NAME]... I'm trying to paint a sound, and I think that's the missing ingredient. You feel me? The universe is singing, Rikk, but I think it's off-key.",
                        "Connie! No, wait, that's me. You're Rikk! Or are we all Rikk? Lost in the cosmic sauce again, man. Got any of that [ITEM_NAME]? The patterns in my ceiling are telling me it's time for a spiritual tune-up. They speak in, like, very insistent paisley, you know?",
                        "Hey... are you Rikk? The name vibes with my aura. I'm [CUSTOMER_NAME], or maybe I'm just a collection of stardust experiencing itself. Pretty wild, huh? I'm on a quest for some [ITEM_NAME]. My spirit guide, a talking badger named Bartholomew, said you'd have the good stuff. He's usually right about these things. Especially after three cups of herbal tea."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "lowCashRikk": [
                {
                    "conditions": [],
                    "lines": [
                        "Oh, bummer, man. The money spirits aren't with you today. *It's like, the financial chi is all blocked up.* Maybe try, like, meditating on abundance? Or checking under the couch cushions. The universe provides, Rikk, eventually.",
                        "No green vibrations, huh? That's cool, that's cool. *Everything is transient, especially, like, paper rectangles we assign value to.* This just means the cosmic transaction isn't aligned right now. Maybe later, the cash flow will... flow.",
                        "*Aw, man, your wallet's feeling light?* That's okay. The real currency is, like, kindness, you know? And maybe good vibes. But yeah, also money for the good stuff. *Catch you on the flip side of the fiscal spectrum, Rikk.*"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkDeclinesToBuy": [
                {
                    "conditions": [],
                    "lines": [
                        "No worries, this *Sentient Dust Bunny* probably wasn't meant for your vibrational frequency anyway. It told me it's looking for a home with more... *existential angst*. You're probably too well-adjusted, Rikk.",
                        "It's cool, man. This *Perfectly Normal Rock* that also happens to be a *Portal Key to the Hamster Dimension* isn't for everyone. *It chooses the holder, you know?* Maybe it senses you're more of a... *cat person*. No judgment.",
                        "*All good, Rikk.* This clump of moss that whispers secrets of forgotten civilizations needs a special kind of caretaker. *Someone who speaks 'lichen', you know?* It's a niche market."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkDeclinesToSell": [
                {
                    "conditions": [],
                    "lines": [
                        "It's cool, Rikk. The universe will provide the 'Lucy's Sky Diamonds' when the time is right... or maybe that pigeon outside has some. *It looked like it had shifty eyes. And really colorful feathers.*",
                        "No worries, my dude. *The path to enlightenment is, like, totally winding.* If the 'Magic Mushies' aren't flowing today, maybe it's a sign I should try to, like, *photosynthesize my own high*. Worth a shot, right?",
                        "*That's alright, Rikk.* The cosmic flow is just redirecting my journey. Perhaps I'm meant to find clarity in, like, a really good cup of tea. Or by staring at my own hands for an hour. *They're like... maps, man! Maps of... hands!*"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkBuysSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "Radical, Rikk! This *Cosmic Pebble* will be, like, so stoked to join your collection of earthly treasures! *It says it's happy to be appreciated for its inner truth, not just its pebble-ness.*",
                        "Far out, man! This *Whispering Pinecone* is gonna love its new home. *It has so many stories to tell, mostly about squirrels, but some are pretty profound.* Thanks for, like, being its new guardian.",
                        "*Righteous!* This *Slightly-Used Aura* I found will really benefit from your... *grounded energy*, Rikk. May it bring you visions of, like, really cool screensavers."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkSellsSuccess": [
                {
                    "conditions": [],
                    "lines": [
                        "Far out, man! These 'Magic Mushrooms' are gonna take me on a journey to the very fabric of reality... or at least to the corner store for snacks. *It's all connected, you know?* Thanks, Rikk!",
                        "*Cosmic!* This 'Astral LSD' is just what my third eye was craving. Time to go explore the space between thoughts. *Wish me luck, or, like, don't. Time is an illusion anyway.* Peace!",
                        "Beautiful, Rikk. These 'Blotters of Enlightenment' feel... *correct*. My spirit animal, which is currently a mildly confused sloth, thanks you. *He says you have good vibes. For a carbon-based biped.*"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "itemNotGoodEnough": [
                {
                    "conditions": [],
                    "lines": [
                        "Hmm, this 'Afghan Gold' feels a bit too... *square*, you know? My third eye is looking for something more... *spherical*. Or maybe, like, *fractal-shaped*. Yeah, that's the ticket.",
                        "Nah, Rikk, this 'Green Crack' is giving me, like, *jagged vibes*. I'm looking for something more... *flowy*. Like a gentle stream of consciousness, not a caffeinated waterfall, you feel me?",
                        "This particular batch of 'Wonder Pills' doesn't quite resonate with my current chakra alignment. *It's a bit too... beige.* I need something that sings in the key of *purple*, my friend."
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "rikkPriceTooHigh": [
                {
                    "conditions": [],
                    "lines": [
                        "Whoa, heavy price, man. Does it come with, like, a map to the Astral Plane for that much? *Or maybe a user manual for the universe?* My spirit guide says my wallet is feeling a bit... *deflated* right now.",
                        "Oof, Rikk, that's a lot of Earth credits. *Are these, like, artisanally mined from the moon by enlightened gnomes or something?* My pockets are feeling a bit too... *Newtonian* for that price.",
                        "*That's a cosmic number, my friend!* For that much, I'd expect these 'Reality Ripples' to also, like, do my dishes and tell me the meaning of life. *Can we find a more... harmonious price point?*"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ],
            "generalBanter": [
                {
                    "conditions": [],
                    "lines": [
                        "Rikk, my dude, I just realized that, like, shoes are just foot-prisons, you know? We should all let our feet be free! Anyway, got any 'Psychedelic Sunshine'?",
                        "I was talking to a squirrel earlier, and it told me the secrets of the universe... but then I forgot them. Think some 'Special K-Os Cereal' will help me remember? *Or maybe it was a pigeon... they all look so wise.*",
                        "What if, like, trees are just Earth's antennas, Rikk? And they're, like, picking up signals from other planets? *Makes you think, huh?* Oh, yeah, need some 'Cosmic Comets'.",
                        "I think my cat is a reincarnated philosopher. *He just stares at walls with such... understanding.* It's profound. Anyway, you got those 'Reality-Bending Blisscuits'?",
                        "Sometimes I wonder if we're all just, like, characters in a giant cosmic play, Rikk. And the script is written in, like, stardust. *Heavy, right?* Speaking of stars, any 'Galaxy Gliders' in stock?",
                        "This reality, man... it's like, *so* realistic. Almost *too* realistic, you know? Makes me crave some 'Dream Weaver Deluxe'. You holding?"
                    ],
                    "payload": {
                        "type": "EFFECT",
                        "effects": []
                    }
                }
            ]
        }
    }
};