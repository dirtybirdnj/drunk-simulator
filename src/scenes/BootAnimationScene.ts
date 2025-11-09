import Phaser from 'phaser';

export class BootAnimationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootAnimationScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

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

        // "SIMULATOR" text - static below (moved down 2.5 inches = 240px)
        const simulator = this.add.text(width / 2, 680, 'SIMULATOR', {
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

        // Description text (moved down 3 inches = 288px total)
        const description = this.add.text(width / 2, 876, 'A simulation game to experiment\nwith crowd dynamics by making a bar', {
            fontSize: '36px',
            color: '#FFD700',
            fontFamily: 'Pixelify Sans, sans-serif',
            fontStyle: 'italic',
            align: 'center',
            lineSpacing: 10
        });
        description.setOrigin(0.5);

        // Credit text at bottom
        const credits = this.add.text(width / 2, height - 30, 'A game by Mat Gilbert / mat@vtapi.co', {
            fontSize: '28px',
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
    }
}
