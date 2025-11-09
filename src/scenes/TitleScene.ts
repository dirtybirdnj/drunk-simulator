import Phaser from 'phaser';
import confetti from 'canvas-confetti';

export class TitleScene extends Phaser.Scene {
    private selectedMap: string | null = null;

    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Auto-select default map so game is ready to play immediately
        this.selectedMap = null; // null = default map

        // Background color (dark)
        this.cameras.main.setBackgroundColor('#1a1a1a');

        // First emoji - tropical drink 🍹 (far left)
        const beer1 = this.add.text(width / 2 - 200, 372, '🍹', {
            fontSize: '400px',
            align: 'center'
        });
        beer1.setOrigin(0.5);
        beer1.setAlpha(0.8);

        // Add bokeh effect to beer1
        const beer1Bokeh = beer1.postFX.addBokeh(0);

        // Second emoji - party face 🥳 (left)
        const beer2 = this.add.text(width / 2 - 100, 340, '🥳', {
            fontSize: '400px',
            align: 'center'
        });
        beer2.setOrigin(0.5);
        beer2.setAlpha(0.6);

        // Add bokeh effect to beer2
        const beer2Bokeh = beer2.postFX.addBokeh(0);

        // Third emoji - vomiting face 🤮 (center-left)
        const beer3 = this.add.text(width / 2 + 20, 390, '🤮', {
            fontSize: '400px',
            align: 'center'
        });
        beer3.setOrigin(0.5);
        beer3.setAlpha(0.7);

        // Add bokeh effect to beer3
        const beer3Bokeh = beer3.postFX.addBokeh(0);

        // Fourth emoji - beer mug 🍺 (center-right)
        const beer4 = this.add.text(width / 2 + 140, 360, '🍺', {
            fontSize: '400px',
            align: 'center'
        });
        beer4.setOrigin(0.5);
        beer4.setAlpha(0.65);

        // Add bokeh effect to beer4
        const beer4Bokeh = beer4.postFX.addBokeh(0);

        // Fifth emoji - beer mug 🍺 (right)
        const beer5 = this.add.text(width / 2 + 220, 380, '🍺', {
            fontSize: '400px',
            align: 'center'
        });
        beer5.setOrigin(0.5);
        beer5.setAlpha(0.55);

        // Add bokeh effect to beer5
        const beer5Bokeh = beer5.postFX.addBokeh(0);

        // Sixth emoji - beer mug 🍺 (far right)
        const beer6 = this.add.text(width / 2 - 50, 350, '🍺', {
            fontSize: '400px',
            align: 'center'
        });
        beer6.setOrigin(0.5);
        beer6.setAlpha(0.6);

        // Add bokeh effect to beer6
        const beer6Bokeh = beer6.postFX.addBokeh(0);

        // Second "DRUNK" text - Open Sans (background layer)
        const drunk2 = this.add.text(width / 2, 276, 'DRUNK', {
            fontSize: '200px',
            color: '#FFD700',
            fontFamily: 'Open Sans, sans-serif',
            fontStyle: '700',
            align: 'center'
        });
        drunk2.setOrigin(0.5);
        drunk2.setAlpha(0.65);

        // Add bokeh effect to drunk2
        const drunk2Bokeh = drunk2.postFX.addBokeh(0);

        // Third "DRUNK" text - Noto Sans Japanese (酔った = yotta = drunk)
        const drunk3 = this.add.text(width / 2, 276, '酔った', {
            fontSize: '200px',
            color: '#FFD700',
            fontFamily: 'Noto Sans JP, sans-serif',
            fontStyle: '700',
            align: 'center'
        });
        drunk3.setOrigin(0.5);
        drunk3.setAlpha(0.7);

        // Add bokeh effect to drunk3
        const drunk3Bokeh = drunk3.postFX.addBokeh(0);

        // Fourth "DRUNK" text - Montserrat Thin (thinnest)
        const drunk4 = this.add.text(width / 2, 276, 'DRUNK', {
            fontSize: '200px',
            color: '#FFD700',
            fontFamily: 'Montserrat, sans-serif',
            fontStyle: '100',
            align: 'center'
        });
        drunk4.setOrigin(0.5);
        drunk4.setAlpha(0.6);

        // Add bokeh effect to drunk4
        const drunk4Bokeh = drunk4.postFX.addBokeh(0);

        // "SIMULATOR" text - static below (moved down 2 inches = 192px)
        const simulator = this.add.text(width / 2, 632, 'SIMULATOR', {
            fontSize: '64px',
            color: '#FFD700',
            fontFamily: 'Pixelify Sans, sans-serif',
            fontStyle: 'bold',
            align: 'center'
        });
        simulator.setOrigin(0.5);

        // First "DRUNK" text - Roboto Black (TOP LAYER - no bokeh for readability)
        const drunk1 = this.add.text(width / 2, 276, 'DRUNK', {
            fontSize: '200px',
            color: '#FFD700',
            fontFamily: 'Roboto, sans-serif',
            fontStyle: '900',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        });
        drunk1.setOrigin(0.5);
        drunk1.setAlpha(1.0); // Full opacity for readability
        // NO bokeh effect on this layer for clarity

        // Description text (moved down 2 inches = ~192px total)
        const description = this.add.text(width / 2, 780, 'A simulation game to experiment\nwith crowd dynamics by making a bar', {
            fontSize: '28px',
            color: '#FFD700',
            fontFamily: 'Pixelify Sans, sans-serif',
            fontStyle: 'italic',
            align: 'center',
            lineSpacing: 10
        });
        description.setOrigin(0.5);

        // Credit text at bottom
        const credits = this.add.text(width / 2, height - 30, 'A game by Mat Gilbert / mat@vtapi.co', {
            fontSize: '18px',
            color: '#FFD700',
            fontFamily: 'Pixelify Sans, sans-serif',
            fontStyle: 'italic',
            align: 'center'
        });
        credits.setOrigin(0.5);

        // Wobble animation for first DRUNK text
        this.tweens.add({
            targets: drunk1,
            angle: { from: -3, to: 3 },
            x: { from: width / 2 - 5, to: width / 2 + 5 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Fade in/out for first DRUNK text
        this.tweens.add({
            targets: drunk1,
            alpha: { from: 0.6, to: 1.0 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Grow/shrink for first DRUNK text
        this.tweens.add({
            targets: drunk1,
            scaleX: { from: 0.95, to: 1.05 },
            scaleY: { from: 0.95, to: 1.05 },
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Wobble animation for first beer emoji - larger drift
        this.tweens.add({
            targets: beer1,
            angle: { from: -3, to: 3 },
            x: { from: width / 2 - 280, to: width / 2 - 120 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Vertical drift for first beer
        this.tweens.add({
            targets: beer1,
            y: { from: 372 - 60, to: 372 + 60 },
            duration: 2400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Fade in/out for first beer emoji
        this.tweens.add({
            targets: beer1,
            alpha: { from: 0.6, to: 1.0 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Grow/shrink for first beer emoji
        this.tweens.add({
            targets: beer1,
            scaleX: { from: 0.95, to: 1.05 },
            scaleY: { from: 0.95, to: 1.05 },
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Wobble animation for second DRUNK text - different rate, delayed start
        this.time.delayedCall(700, () => {
            this.tweens.add({
                targets: drunk2,
                angle: { from: -4, to: 4 },
                x: { from: width / 2 - 7, to: width / 2 + 7 },
                duration: 2700, // Different duration for desync
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Fade in/out for second DRUNK text - different rate
            this.tweens.add({
                targets: drunk2,
                alpha: { from: 0.4, to: 0.9 },
                duration: 2100, // Different duration for desync
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Grow/shrink for second DRUNK text - different rate
            this.tweens.add({
                targets: drunk2,
                scaleX: { from: 0.92, to: 1.08 },
                scaleY: { from: 0.92, to: 1.08 },
                duration: 2300, // Different duration for desync
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Wobble animation for third DRUNK text (Japanese) - delayed start
        this.time.delayedCall(1400, () => {
            this.tweens.add({
                targets: drunk3,
                angle: { from: -3.5, to: 3.5 },
                x: { from: width / 2 - 6, to: width / 2 + 6 },
                duration: 2400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Fade in/out for third DRUNK text
            this.tweens.add({
                targets: drunk3,
                alpha: { from: 0.45, to: 0.95 },
                duration: 2600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Grow/shrink for third DRUNK text
            this.tweens.add({
                targets: drunk3,
                scaleX: { from: 0.93, to: 1.07 },
                scaleY: { from: 0.93, to: 1.07 },
                duration: 2200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Wobble animation for fourth DRUNK text (Montserrat thin) - delayed start
        this.time.delayedCall(2100, () => {
            this.tweens.add({
                targets: drunk4,
                angle: { from: -5, to: 5 },
                x: { from: width / 2 - 8, to: width / 2 + 8 },
                duration: 2900,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Fade in/out for fourth DRUNK text
            this.tweens.add({
                targets: drunk4,
                alpha: { from: 0.35, to: 0.85 },
                duration: 2400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Grow/shrink for fourth DRUNK text
            this.tweens.add({
                targets: drunk4,
                scaleX: { from: 0.90, to: 1.10 },
                scaleY: { from: 0.90, to: 1.10 },
                duration: 2700,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Wobble animation for second beer emoji - different rate, larger drift
        this.time.delayedCall(700, () => {
            this.tweens.add({
                targets: beer2,
                angle: { from: -4, to: 4 },
                x: { from: width / 2 - 200, to: width / 2 },
                duration: 2700,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Vertical drift for second beer
            this.tweens.add({
                targets: beer2,
                y: { from: 340 - 70, to: 340 + 70 },
                duration: 2200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Fade in/out for second beer emoji
            this.tweens.add({
                targets: beer2,
                alpha: { from: 0.4, to: 0.9 },
                duration: 2100,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Grow/shrink for second beer emoji
            this.tweens.add({
                targets: beer2,
                scaleX: { from: 0.92, to: 1.08 },
                scaleY: { from: 0.92, to: 1.08 },
                duration: 2300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Third beer - opposite horizontal drift with vertical movement (delayed 1200ms)
            this.time.delayedCall(1200, () => {
                // Opposite horizontal drift (right to left)
                this.tweens.add({
                    targets: beer3,
                    angle: { from: -5, to: 5 },
                    x: { from: width / 2 + 90, to: width / 2 - 90 },
                    duration: 2400,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                // Vertical drift (up and down)
                this.tweens.add({
                    targets: beer3,
                    y: { from: 372 - 40, to: 372 + 40 },
                    duration: 1900,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                // Fade for third beer
                this.tweens.add({
                    targets: beer3,
                    alpha: { from: 0.5, to: 0.95 },
                    duration: 2200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                // Grow/shrink for third beer
                this.tweens.add({
                    targets: beer3,
                    scaleX: { from: 0.9, to: 1.1 },
                    scaleY: { from: 0.9, to: 1.1 },
                    duration: 2500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                // Fourth beer animation - delayed 2800ms
                this.time.delayedCall(2800, () => {
                    // Wobble animation for fourth beer
                    this.tweens.add({
                        targets: beer4,
                        angle: { from: -6, to: 6 },
                        x: { from: width / 2 - 110, to: width / 2 + 110 },
                        duration: 3200,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });

                    // Vertical drift for fourth beer
                    this.tweens.add({
                        targets: beer4,
                        y: { from: 372 - 50, to: 372 + 50 },
                        duration: 2100,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });

                    // Fade for fourth beer
                    this.tweens.add({
                        targets: beer4,
                        alpha: { from: 0.4, to: 0.95 },
                        duration: 2600,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });

                    // Grow/shrink for fourth beer
                    this.tweens.add({
                        targets: beer4,
                        scaleX: { from: 0.88, to: 1.12 },
                        scaleY: { from: 0.88, to: 1.12 },
                        duration: 2800,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });

                    // Fifth beer animation - delayed 3400ms
                    this.time.delayedCall(3400, () => {
                        // Wobble animation for fifth beer
                        this.tweens.add({
                            targets: beer5,
                            angle: { from: -4, to: 4 },
                            x: { from: width / 2 - 70, to: width / 2 + 70 },
                            duration: 2900,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });

                        // Fade for fifth beer
                        this.tweens.add({
                            targets: beer5,
                            alpha: { from: 0.35, to: 0.85 },
                            duration: 3100,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });

                        // Grow/shrink for fifth beer
                        this.tweens.add({
                            targets: beer5,
                            scaleX: { from: 0.92, to: 1.08 },
                            scaleY: { from: 0.92, to: 1.08 },
                            duration: 2700,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });

                        // Sixth beer animation - delayed 4000ms
                        this.time.delayedCall(4000, () => {
                            // Wobble animation for sixth beer
                            this.tweens.add({
                                targets: beer6,
                                angle: { from: -5, to: 5 },
                                x: { from: width / 2 - 95, to: width / 2 + 95 },
                                duration: 3400,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Sine.easeInOut'
                            });

                            // Vertical drift for sixth beer
                            this.tweens.add({
                                targets: beer6,
                                y: { from: 372 - 30, to: 372 + 30 },
                                duration: 2300,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Sine.easeInOut'
                            });

                            // Fade for sixth beer
                            this.tweens.add({
                                targets: beer6,
                                alpha: { from: 0.45, to: 0.9 },
                                duration: 2900,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Sine.easeInOut'
                            });

                            // Grow/shrink for sixth beer
                            this.tweens.add({
                                targets: beer6,
                                scaleX: { from: 0.91, to: 1.09 },
                                scaleY: { from: 0.91, to: 1.09 },
                                duration: 2600,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Sine.easeInOut'
                            });
                        });
                    });
                });
            });
        });

        // ============================================================
        // BOKEH EFFECTS - Subtle fade in/out on different intervals for drunk effect
        // ============================================================

        // Beer 1 bokeh - fade every 3 seconds (subtle)
        this.tweens.add({
            targets: beer1Bokeh,
            radius: { from: 0, to: 0.8 },
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Beer 2 bokeh - fade every 3.5 seconds (offset start, subtle)
        this.time.delayedCall(800, () => {
            this.tweens.add({
                targets: beer2Bokeh,
                radius: { from: 0, to: 1.0 },
                duration: 3500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Beer 3 bokeh - fade every 4 seconds (offset start, subtle)
        this.time.delayedCall(1600, () => {
            this.tweens.add({
                targets: beer3Bokeh,
                radius: { from: 0, to: 0.9 },
                duration: 4000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Beer 4 bokeh - fade every 3.8 seconds (offset start, subtle)
        this.time.delayedCall(2400, () => {
            this.tweens.add({
                targets: beer4Bokeh,
                radius: { from: 0, to: 0.85 },
                duration: 3800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Beer 5 bokeh - fade every 3.3 seconds (offset start, subtle)
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: beer5Bokeh,
                radius: { from: 0, to: 0.75 },
                duration: 3300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Beer 6 bokeh - fade every 4.2 seconds (offset start, subtle)
        this.time.delayedCall(3600, () => {
            this.tweens.add({
                targets: beer6Bokeh,
                radius: { from: 0, to: 0.95 },
                duration: 4200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Drunk 1 - NO bokeh effect for readability (top layer)

        // Drunk 2 bokeh - fade every 2.8 seconds (offset start, subtle)
        this.time.delayedCall(500, () => {
            this.tweens.add({
                targets: drunk2Bokeh,
                radius: { from: 0, to: 0.7 },
                duration: 2800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Drunk 3 bokeh - fade every 3.2 seconds (offset start, subtle)
        this.time.delayedCall(1100, () => {
            this.tweens.add({
                targets: drunk3Bokeh,
                radius: { from: 0, to: 0.75 },
                duration: 3200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Drunk 4 bokeh - fade every 2.6 seconds (offset start, subtle)
        this.time.delayedCall(1700, () => {
            this.tweens.add({
                targets: drunk4Bokeh,
                radius: { from: 0, to: 0.65 },
                duration: 2600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Start button (always visible) - positioned below the title
        const buttonSpacing = 170; // Consistent spacing between buttons
        const startY = height / 2 + 150; // Moved up another inch (96px)
        const startBg = this.add.rectangle(width / 2, startY, 900, 140, 0x228B22);
        startBg.setStrokeStyle(6, 0xFFFFFF);

        const startText = this.add.text(width / 2, startY, '🍻 START 🍹', {
            fontSize: '60px',
            color: '#FFD700',
            fontFamily: 'Pixelify Sans, sans-serif',
            fontStyle: '900'
        });
        startText.setOrigin(0.5);

        startBg.setInteractive({ useHandCursor: true });
        startBg.on('pointerover', () => {
            startBg.setFillStyle(0x32CD32);
            startBg.setScale(1.05);
            startText.setScale(1.05);
        });
        startBg.on('pointerout', () => {
            startBg.setFillStyle(0x228B22);
            startBg.setScale(1);
            startText.setScale(1);
        });
        startBg.on('pointerdown', () => {
            console.log(`🎮 Starting game with map: ${this.selectedMap || 'Default'}`);

            // Trigger confetti celebration!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // Start game scene after a brief delay for confetti effect
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene', { selectedMap: this.selectedMap });
            });
        });

        // SCAN button - positioned below START button (always visible)
        const scanY = startY + buttonSpacing;
        const scanBg = this.add.rectangle(width / 2, scanY, 900, 140, 0xFF6B35);
        scanBg.setStrokeStyle(6, 0xFFFFFF);

        const scanText = this.add.text(width / 2, scanY, '📸 SCAN', {
            fontSize: '50px',
            color: '#FFD700',
            fontFamily: 'Pixelify Sans, sans-serif',
            fontStyle: '700'
        });
        scanText.setOrigin(0.5);

        scanBg.setInteractive({ useHandCursor: true });
        scanBg.on('pointerover', () => {
            scanBg.setFillStyle(0xFF8C42);
            scanBg.setScale(1.05);
            scanText.setScale(1.05);
        });
        scanBg.on('pointerout', () => {
            scanBg.setFillStyle(0xFF6B35);
            scanBg.setScale(1);
            scanText.setScale(1);
        });
        scanBg.on('pointerdown', () => {
            this.startQRScanner();
        });

        // Editor button (desktop only) - positioned below SCAN button
        const isDesktop = window.innerWidth >= 1024;
        if (isDesktop) {
            const editorY = scanY + buttonSpacing;
            const editorBg = this.add.rectangle(width / 2, editorY, 900, 140, 0x667eea);
            editorBg.setStrokeStyle(6, 0xFFFFFF);

            const editorText = this.add.text(width / 2, editorY, '🛠️ Editor', {
                fontSize: '50px',
                color: '#FFD700',
                fontFamily: 'Pixelify Sans, sans-serif',
                fontStyle: '700'
            });
            editorText.setOrigin(0.5);

            editorBg.setInteractive({ useHandCursor: true });
            editorBg.on('pointerover', () => {
                editorBg.setFillStyle(0x764ba2);
                editorBg.setScale(1.05);
                editorText.setScale(1.05);
            });
            editorBg.on('pointerout', () => {
                editorBg.setFillStyle(0x667eea);
                editorBg.setScale(1);
                editorText.setScale(1);
            });
            editorBg.on('pointerdown', () => {
                (window as any).showEditor();
            });
        }
    }

    startQRScanner() {
        const overlay = document.getElementById('camera-overlay');
        const video = document.getElementById('camera-video') as HTMLVideoElement;
        const canvas = document.getElementById('camera-canvas') as HTMLCanvasElement;
        const statusEl = document.getElementById('scan-status');
        const closeBtn = document.getElementById('close-camera');

        if (!overlay || !video || !canvas || !statusEl || !closeBtn) {
            console.error('Camera overlay elements not found');
            return;
        }

        let stream: MediaStream | null = null;
        let scanning = false;

        const stopScanning = () => {
            scanning = false;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            overlay.style.display = 'none';
            video.srcObject = null;
        };

        closeBtn.onclick = stopScanning;

        // Request camera access
        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' } // Use back camera on mobile
        })
        .then((mediaStream) => {
            stream = mediaStream;
            video.srcObject = stream;
            overlay.style.display = 'flex';
            scanning = true;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const scanFrame = () => {
                if (!scanning) return;

                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height);

                    if (code) {
                        console.log('QR Code detected:', code.data);
                        statusEl.textContent = '✅ QR Code detected! Loading map...';

                        // Import the map
                        try {
                            const mapData = code.data;
                            stopScanning();

                            // Store in localStorage and start game
                            localStorage.setItem('scannedMap', mapData);
                            this.scene.start('GameScene', { scannedMapData: mapData });
                        } catch (error) {
                            console.error('Failed to import map:', error);
                            statusEl.textContent = '❌ Invalid QR code';
                            setTimeout(() => {
                                statusEl.textContent = '📸 Point camera at QR code...';
                            }, 2000);
                        }
                    }
                }

                requestAnimationFrame(scanFrame);
            };

            scanFrame();
        })
        .catch((error) => {
            console.error('Camera access denied:', error);
            statusEl.textContent = '❌ Camera access denied';
            setTimeout(() => stopScanning(), 2000);
        });
    }

}
