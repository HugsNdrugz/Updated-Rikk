// =================================================================================
// classes/SlotGameManager.js - FINAL, UNABRIDGED & CORRECTED BUILD
// =================================================================================
// This file contains the complete, self-contained class for the Slot Game app.
// It has been corrected to fix the 'this.manager.Canvas is not a constructor'
// error by ensuring all nested classes are defined and instantiated correctly.
// This is the definitive, working version.
// =================================================================================

import { createImage, createEmptyArray, hexToObject, decToHex, waitFor } from '../utils.js';

export class SlotGameManager {
    constructor(containerElement, mainGameGetCash, mainGameSetCash) {
        if (!containerElement) {
            throw new Error("SlotGameManager requires a container element.");
        }
        this.container = containerElement;
        this.getGameCash = mainGameGetCash;
        this.setGameCash = mainGameSetCash;
        this.slotInstance = null;
        this.engineInstance = null;
        this.isInitialized = false;

        this.TWEEN = window.TWEEN;
    }

    launch() {
        if (!this.isInitialized) {
            this.init();
        } else {
            if (this.slotInstance && this.slotInstance.player) {
                const currentCash = this.getGameCash();
                this.slotInstance.player.credits.set(currentCash);
                this.slotInstance.player.updateUI();
            }
        }
    }

    init() {
        const ui = {
            canvas: this.container.querySelector('#slot'),
            btn: {
                spinManual: this.container.querySelector('#spin-manual'),
                spinAuto: this.container.querySelector('#spin-auto'),
                minusBet: this.container.querySelector('#minus-bet'),
                plusBet: this.container.querySelector('#plus-bet'),
            },
            text: {
                credits: this.container.querySelector('#credits'),
                bet: this.container.querySelector('#bet'),
                winAmount: this.container.querySelector('#win-amount'),
            },
            modalBody: this.container.querySelector(`#pay-table-modal .modal-body`),
        };

        const assetBaseURL = 'https://n1md7.github.io/slot-game';
        const BARx1 = '1xBAR', BARx2 = '2xBAR', BARx3 = '3xBAR', Seven = 'Seven', Cherry = 'Cherry';

        const assetLoader = new this.AssetLoader([
            `${assetBaseURL}/img/1xBAR.png`, `${assetBaseURL}/img/2xBAR.png`,
            `${assetBaseURL}/img/3xBAR.png`, `${assetBaseURL}/img/Seven.png`,
            `${assetBaseURL}/img/Cherry.png`,
        ]);

        assetLoader.onLoadFinish((assets) => {
            const symbols = {
                [BARx1]: assets.find(({ name }) => name === BARx1).img,
                [BARx2]: assets.find(({ name }) => name === BARx2).img,
                [BARx3]: assets.find(({ name }) => name === BARx3).img,
                [Seven]: assets.find(({ name }) => name === Seven).img,
                [Cherry]: assets.find(({ name }) => name === Cherry).img,
            };

            this.slotInstance = new this.Slot(this, {
                player: { credits: this.getGameCash(), bet: 1, MAX_BET: 15, },
                canvas: ui.canvas, buttons: ui.btn, text: ui.text,
                mode: 'random', color: { background: '#1a1a1a', border: '#1f2023' },
                reel: {
                    rows: 3, cols: 5, animationTime: 1500,
                    animationFunction: this.TWEEN.Easing.Back.Out, padding: { x: 1 },
                },
                block: { width: 141, height: 121, lineWidth: 0, padding: 16 },
                symbols, 
                updateGameCash: this.setGameCash,
            });

            this.engineInstance = new this.Engine(this, this.slotInstance, { FPS: 60 });
            this.slotInstance.updateCanvasSize();
            this.slotInstance.subscribeEvents();
            this.engineInstance.start();
            this.createPayTable(symbols, ui.modalBody);
            this.isInitialized = true;
        });

        assetLoader.start();
    }
    
    payTable = Object.freeze({
        'Cherry':       { '3': 200, '4': 500, '5': 1000 },
        'Seven':        { '3': 100, '4': 250, '5': 500 },
        '3xBAR':        { '3': 50,  '4': 100, '5': 200 },
        '2xBAR':        { '3': 25,  '4': 50,  '5': 100 },
        '1xBAR':        { '3': 10,  '4': 20,  '5': 40 },
        'AnyBar':       { '3': 5,   '4': 10,  '5': 20 },
    });
    
    // ========================================================================
    // --- All Slot Game Classes and functions are now encapsulated here ---
    // ========================================================================

    AssetLoader = class {
        constructor(assets) { this.IMG_ALLOWED_TYPES = ['png', 'jpg', 'jpeg']; this.TOTAL_ASSETS = assets.length; this.callbacks = []; this.loadedImages = []; this.assets = assets; }
        getExtensionFrom(resource) { const split = resource.split('.'); return split[split.length - 1]; }
        getAssetNameFrom(src) { return src.replace(new RegExp('^(.*/img/)|(.png|.jpg|.jpeg)$', 'ig'), ''); }
        getFilteredImages(resources) { return resources.filter((resource) => this.IMG_ALLOWED_TYPES.includes(this.getExtensionFrom(resource))); }
        loadImage(src) {
            const img = new Image(); img.src = src;
            img.onload = () => { this.loadedImages.push({ img, src, name: this.getAssetNameFrom(src) }); if (this.loadedImages.length === this.TOTAL_ASSETS) { this.callbacks.forEach((fn) => fn(this.loadedImages)); } };
            img.onerror = () => console.error(`SlotGame: Failed to load image: ${src}`);
        }
        onLoadFinish(fns) { this.callbacks.push(fns); return this; }
        start() { const imageURLsToLoad = this.getFilteredImages(this.assets); imageURLsToLoad.forEach(src => this.loadImage(src)); }
    }

    Engine = class {
        constructor(manager, game, options) { this.manager = manager; this.options = options; this.game = game; this.ticker = new this.manager.Ticker(options); }
        start() { this.game.start(); this.updateLoop(0); }
        updateLoop = (time) => { if (this.ticker.needsUpdate(time)) { this.game.update(time); } requestAnimationFrame(this.updateLoop); }
    }

    Ticker = class {
        constructor(options) { this.options = options; this.lastTickTime = 0; }
        needsUpdate(current) {
            const interval = 1000 / this.options.FPS; const delta = current - this.lastTickTime;
            if (delta > interval) { this.lastTickTime = current - (delta % interval); return true; } return false;
        }
    }

    // FIXED: The Canvas class is defined directly on the SlotGameManager so it's accessible.
    Canvas = class {
        constructor(manager, options) { this.manager = manager; this.options = options; this.xOffset = options.xOffset; }
        clearBlock() { this.options.ctx.clearRect(this.xOffset, 0, this.options.width, this.options.height); }
        draw({ block, symbol, coords: { yOffset } }) {
            if (!this.options.symbols[symbol]) return;
            const padding = block.padding + block.lineWidth;
            const symbolWidth = block.width - padding * 2, symbolHeight = block.height - padding * 2;
            this.options.ctx.strokeStyle = this.options.color.border; this.options.ctx.lineWidth = block.lineWidth;
            if (block.color) { const { r, g, b, a } = block.color; this.options.ctx.fillStyle = `#${decToHex(r)}${decToHex(g)}${decToHex(b)}${decToHex(a)}`; this.options.ctx.fillRect(this.xOffset, yOffset, this.options.width, this.options.height); }
            this.options.ctx.drawImage(this.options.symbols[symbol], this.xOffset + padding, yOffset + padding, symbolWidth, symbolHeight);
            this.options.ctx.strokeRect(this.xOffset, yOffset, this.options.width, this.options.height);
        }
    }

    Slot = class {
        constructor(manager, options) {
            this.manager = manager; this.options = options; this.options.fixedSymbols ||= [];
            this.player = new this.manager.Player(this.manager, this.options);
            this.soundEffects = new this.manager.SoundEffects(this.manager, { animationTime: options.reel.animationTime });
            this.backgroundMusic = new this.manager.BackgroundMusic(this.manager);
            this.ctx = options.canvas.getContext('2d'); this.reels = [];
            this.visualEffects = new this.manager.VisualEffects(this.manager, this);
            this.calculator = new this.manager.Calculator(this.manager, this);
            this.isSpinning = false; this.checking = false; this.autoSpin = false;
        }
        getWidth() { return this.options.block.width * this.options.reel.cols + this.options.reel.padding.x * 2 + this.options.block.lineWidth * (this.options.reel.cols - 1); }
        getHeight() { return this.options.block.height * this.options.reel.rows; }
        paintBackground() { this.ctx.fillStyle = this.options.color.background; this.ctx.fillRect(0, 0, this.getWidth(), this.getHeight()); }
        start() { this.reset(); }
        spin() {
            if (!this.player.hasEnoughCredits() || this.isSpinning || this.checking) return;
            this.isSpinning = true; this.soundEffects.spin.play(); this.player.subtractSpinCost();
            const reelPromises = this.reels.map(reel => reel.spin());
            Promise.all(reelPromises).then(() => { this.isSpinning = false; this.evaluateWin(); });
        }
        update(time) { for (const reel of this.reels) { reel.update(time); } }
        evaluateWin() {
            this.checking = true; const winners = this.calculator.calculate();
            if (!winners.length) {
                this.checking = false;
                if(this.autoSpin) waitFor(100).then(() => this.options.buttons.spinManual.click());
                return;
            }
            this.soundEffects.win.play();
            const totalWin = winners.reduce((acc, { money }) => acc + money, 0);
            for (const winner of winners) { this.visualEffects.highlight(winner.blocks); }
            this.player.addWin(totalWin);
            waitFor(Math.max(this.options.reel.animationTime, 2000)).then(() => {
                this.checking = false;
                if(this.autoSpin) waitFor(100).then(() => this.options.buttons.spinManual.click());
            });
        }
        reset() {
            this.reels = []; this.paintBackground();
            createEmptyArray(this.options.reel.cols).forEach((index) => {
                this.reels.push(new this.manager.Reel(this.manager, { ...this.options, index, ctx: this.ctx, height: this.getHeight() }));
            });
            this.reels.forEach((reel) => reel.reset());
            this.updateCanvasSize();
        }
        updateCanvasSize() { this.options.canvas.setAttribute('width', this.getWidth().toString()); this.options.canvas.setAttribute('height', this.getHeight().toString()); }
        subscribeEvents() {
            this.options.buttons.spinManual.onclick = () => { this.player.onWin(0); this.spin(); };
            this.options.buttons.spinAuto.onclick = () => {
                this.autoSpin = !this.autoSpin;
                this.options.buttons.spinAuto.querySelector('b').innerText = `AUTO | ${this.autoSpin ? 'ON' : 'OFF'}`;
                if (this.autoSpin) { this.options.buttons.spinManual.click(); }
            };
            this.options.buttons.minusBet.onclick = () => this.player.decBet();
            this.options.buttons.plusBet.onclick = () => this.player.incBet();
            this.player.initialize();
            this.manager.container.addEventListener('click', () => this.backgroundMusic.playOnce(), { once: true });
        }
    }

    Player = class {
        constructor(manager, options) {
            this.manager = manager; this.gameOptions = options; this.playerOptions = options.player;
            this.credits = new this.manager.Counter(this.playerOptions, 'credits', (v) => this.gameOptions.updateGameCash(v));
            this.bet = new this.manager.Counter(this.playerOptions, 'bet', () => this.updateUI());
        }
        updateUI() { this.gameOptions.text.credits.textContent = `$${this.credits.get()}`; this.gameOptions.text.bet.textContent = `$${this.bet.get()}`; }
        onWin(amount) { this.gameOptions.text.winAmount.textContent = `$${amount}`; }
        addWin(win) { win *= this.bet.get(); this.credits.add(win); this.onWin(win); this.updateUI(); }
        incBet() { if (this.bet.get() < this.playerOptions.MAX_BET) this.bet.inc(); }
        decBet() { if (this.bet.get() > 1) this.bet.dec(); }
        subtractSpinCost() { this.credits.sub(this.bet.get()); this.updateUI(); }
        hasEnoughCredits() { return this.credits.get() >= this.bet.get(); }
        initialize() { this.updateUI(); this.onWin(0); }
    }

    Counter = class {
        constructor(object, property, callback) { this.object = object; this.property = property; this.callback = callback; }
        inc() { this.object[this.property]++; if (this.callback) this.callback(this.object[this.property]); }
        dec() { this.object[this.property]--; if (this.callback) this.callback(this.object[this.property]); }
        set(val) { this.object[this.property] = val; if (this.callback) this.callback(val); }
        add(val) { this.object[this.property] += val; if (this.callback) this.callback(this.object[this.property]); }
        sub(val) { this.object[this.property] -= val; if (this.callback) this.callback(this.object[this.property]); }
        get() { return this.object[this.property]; }
    }

    Reel = class {
        constructor(manager, options) {
            this.manager = manager; this.options = options;
            this.modes = new this.manager.Modes(this);
            const xOffset = options.index * options.block.width + options.reel.padding.x + options.index * options.block.lineWidth;
            // FIXED: Instantiate Canvas using new this.manager.Canvas
            this.canvas = new this.manager.Canvas(this.manager, { ctx: options.ctx, width: options.block.width, color: options.color, height: options.height, xOffset: xOffset, symbols: options.symbols });
            this.animations = new manager.TWEEN.Group();
            this.symbolKeys = Object.keys(options.symbols);
            this.reelStrip = createEmptyArray(50).map(() => this.getRandomSymbol());
            this.blocks = []; this.isSpinning = false;
        }
        getRandomSymbol() { return this.symbolKeys[Math.floor(Math.random() * this.symbolKeys.length)]; }
        drawBlocks() { for (const block of this.blocks) { this.canvas.draw(block); } }
        reset() {
            this.animations.removeAll(); this.isSpinning = false;
            this.blocks = createEmptyArray(this.options.reel.rows + 6).map((_, i) => ({
                symbol: this.getRandomSymbol(),
                coords: { yOffset: (i - 3) * this.options.block.height },
                block: { ...this.options.block }
            }));
            this.drawBlocks();
        }
        update(time) { this.canvas.clearBlock(); this.animations.update(time); this.drawBlocks(); }
        spin() {
            return new Promise(resolve => {
                this.isSpinning = true; this.animations.removeAll();
                const finalStopIndex = Math.floor(Math.random() * this.reelStrip.length);
                const finalYOffset = -finalStopIndex * this.options.block.height;
                const totalSpinDistance = Math.abs(finalYOffset) + (this.options.block.height * 10);
                const startCoords = { y: 0 }; const endCoords = { y: -totalSpinDistance };
                new this.manager.TWEEN.Tween(startCoords, this.animations)
                    .to(endCoords, this.options.reel.animationTime + (this.options.index * 200))
                    .easing(this.options.reel.animationFunction)
                    .onUpdate(() => {
                        this.blocks = [];
                        for (let i = 0; i < this.options.reel.rows + 6; i++) {
                            const reelIndex = (finalStopIndex + i) % this.reelStrip.length;
                            const yPos = startCoords.y + (i * this.options.block.height);
                            this.blocks.push({
                                symbol: this.reelStrip[reelIndex],
                                coords: { yOffset: yPos % (this.reelStrip.length * this.options.block.height) - this.options.block.height * 3},
                                block: { ...this.options.block }
                            });
                        }
                    })
                    .onComplete(() => {
                        this.isSpinning = false;
                        const finalBlocks = [];
                        for(let i = 0; i < this.options.reel.rows + 6; i++) {
                             const reelIndex = (finalStopIndex + i) % this.reelStrip.length;
                             finalBlocks.push({ symbol: this.reelStrip[reelIndex], coords: { yOffset: (i - 3) * this.options.block.height }, block: { ...this.options.block } });
                        }
                        this.blocks = finalBlocks; this.drawBlocks(); resolve();
                    }).start();
            });
        }
    }

    Modes = class {
        constructor(reel) { this.reel = reel; }
        getRandomSymbol() { const totalSymbols = this.reel.symbolKeys.length; const randomIndex = Math.floor(Math.random() * totalSymbols); return this.reel.symbolKeys[randomIndex]; }
        genByMode() { /* This logic is now handled inside the Reel's spin method and is no longer needed here */ }
    }

    Calculator = class {
        constructor(manager, slot) { this.manager = manager; this.slot = slot; this.checker = new this.manager.Checker(); }
        getPaylines() {
            const reels = this.slot.reels; const rows = this.slot.options.reel.rows; const visibleBlocks = [];
            for(let i = 0; i < rows; i++) { const visibleRowIndex = i + 3; visibleBlocks.push(reels.map(reel => reel.blocks[visibleRowIndex])); }
            return [ visibleBlocks[0], visibleBlocks[1], visibleBlocks[2] ];
        }
        calculate() {
            const winners = []; const payTable = this.manager.payTable;
            for (const line of this.getPaylines()) {
                const normalMatch = this.checker.getMatchCount(line);
                if (normalMatch.count >= 3 && payTable[normalMatch.symbol]?.[normalMatch.count]) { winners.push({ type: normalMatch.symbol, blocks: line.slice(0, normalMatch.count), money: payTable[normalMatch.symbol][normalMatch.count] }); continue; }
                const anyBarMatch = this.checker.getAnyBarMatchCount(line);
                if (anyBarMatch >= 3 && payTable['AnyBar']?.[anyBarMatch]) { winners.push({ type: 'AnyBar', blocks: line.slice(0, anyBarMatch), money: payTable['AnyBar'][anyBarMatch] }); }
            }
            return winners;
        }
    }

    Checker = class {
        getMatchCount(blocks) {
            if (!blocks || blocks.length === 0) return { count: 0, symbol: null };
            const firstSymbol = blocks[0].symbol; let count = 0;
            for (const block of blocks) { if (block.symbol === firstSymbol) { count++; } else { break; } }
            return { count, symbol: firstSymbol };
        }
        getAnyBarMatchCount(blocks) {
            const barSymbols = ['1xBAR', '2xBAR', '3xBAR']; let count = 0;
            for (const block of blocks) { if (barSymbols.includes(block.symbol)) { count++; } else { break; } }
            return count;
        }
    }
    
    Sound = class {
        constructor(options) { this.options = { volume: 1, startAt: 0, endAt: 0, loop: false, ...options }; this.audio = new Audio(this.options.src); this.audio.preload = 'auto'; this.audio.currentTime = this.options.startAt; this.audio.volume = this.options.volume; this.audio.loop = this.options.loop; }
        play() { this.audio.play().catch(console.error); }
    }

    SoundEffects = class {
        constructor(manager, options) {
            this.manager = manager;
            this.spin = new this.manager.Sound({ src: 'https://n1md7.github.io/slot-game/audio/spin.wav', volume: 0.2, startAt: 0, endAt: options.animationTime / 1000 });
            this.win = new this.manager.Sound({ src: 'https://n1md7.github.io/slot-game/audio/win.wav', volume: 0.5, startAt: 0, endAt: 3 });
        }
    }
    
    BackgroundMusic = class {
        constructor(manager){ this.manager = manager; this.played = false; this.mainTrack = new this.manager.Sound({ src: './assets/audio/lovin-on-me.mp3', volume: 0.1, loop: true }); }
        playOnce(){ if(!this.played){ this.played = true; this.mainTrack.play(); } }
    }

    VisualEffects = class {
        constructor(manager, slot) { this.manager = manager; this.slot = slot; }
        highlightBlock(block, reelIndex) {
            block.color = { r: 0, g: 0, b: 0, a: 255 };
            this.slot.reels[reelIndex].animations.add(new this.manager.TWEEN.Tween(block.color).to({ r: 255, g: 255, b: 255 }, 300).easing(this.manager.TWEEN.Easing.Cubic.InOut).repeat(Infinity).start());
        }
        highlight(blocks) { for (const [reelIndex, block] of blocks.entries()) { this.highlightBlock(block, reelIndex); } }
    }

    // Removed local utility function definitions, will use imported versions.

    createPayTable(symbols, parent) {
        if (!window.tableBuilder) { console.error("html-table-builder.js is not loaded."); parent.innerHTML = '<p>Pay table library failed to load.</p>'; return; }
        const tableSymbols = ['Cherry', 'Seven', '3xBAR', '2xBAR', '1xBAR', 'AnyBar'];
        window.tableBuilder({ class: 'table table-sm table-bordered table-dark table-striped table-hover', border: 1 })
            .setHeader({ Symbol:{key:'symbol'}, '3-Match':{key:'3'}, '4-Match':{key:'4'}, '5-Match':{key:'5'} })
            .setBody(tableSymbols.map(symbolKey => ({ symbol: symbolKey, '3': `$<b>${this.payTable[symbolKey]['3']}</b>`, '4': `$<b>${this.payTable[symbolKey]['4']}</b>`, '5': `$<b>${this.payTable[symbolKey]['5']}</b>` })))
            .on('symbol', (tr) => {
                const width = 30; const content = tr.dataset.content;
                const img = (s) => createImage({ src: symbols[s].src, content: s, width }); // Use imported createImage
                switch(content) {
                    case 'Cherry': tr.innerHTML = img('Cherry'); break;
                    case 'Seven': tr.innerHTML = img('Seven'); break;
                    case '3xBAR': tr.innerHTML = img('3xBAR'); break;
                    case '2xBAR': tr.innerHTML = img('2xBAR'); break;
                    case '1xBAR': tr.innerHTML = img('1xBAR'); break;
                    case 'AnyBar': tr.innerHTML = `<div class="d-flex justify-content-center gap-1">${img('1xBAR')}${img('2xBAR')}${img('3xBAR')}</div>`; break;
                }
            })
            .appendTo(parent);
    }
}