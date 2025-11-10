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

        // First emoji - tropical drink 🍹 (far left) - moved down 1/2 inch
        const beer1 = this.add.text(width / 2 - 200, 408, '🍹', {
            fontSize: '400px',
            align: 'center'
        });
        beer1.setOrigin(0.5);
        beer1.setAlpha(0.8);
        beer1.setPadding(50); // Add padding to prevent clipping

        // Second emoji - party face 🥳 (left) - moved down 1/2 inch
        const beer2 = this.add.text(width / 2 - 100, 376, '🥳', {
            fontSize: '400px',
            align: 'center'
        });
        beer2.setOrigin(0.5);
        beer2.setAlpha(0.6);
        beer2.setPadding(50); // Add padding to prevent clipping

        // Third emoji - vomiting face 🤮 (center-left) - moved down 1/2 inch
        const beer3 = this.add.text(width / 2 + 20, 426, '🤮', {
            fontSize: '400px',
            align: 'center'
        });
        beer3.setOrigin(0.5);
        beer3.setAlpha(0.7);
        beer3.setPadding(50); // Add padding to prevent clipping

        // Fourth emoji - beer mug 🍺 (center-right) - moved down 1/2 inch
        const beer4 = this.add.text(width / 2 + 140, 396, '🍺', {
            fontSize: '400px',
            align: 'center'
        });
        beer4.setOrigin(0.5);
        beer4.setAlpha(0.65);
        beer4.setPadding(50); // Add padding to prevent clipping

        // Removed beer5 and beer6 to improve performance

        // Second "DRUNK" text - Open Sans (background layer) - moved down 1/2 inch
        const drunk2 = this.add.text(width / 2, 312, 'DRUNK', {
            fontSize: '200px',
            color: '#FFD700',
            fontFamily: 'Open Sans, sans-serif',
            fontStyle: '700',
            align: 'center'
        });
        drunk2.setOrigin(0.5);
        drunk2.setAlpha(0.65);

        // Third "DRUNK" text - Noto Sans Japanese (酔った = yotta = drunk) - moved down 1/2 inch
        const drunk3 = this.add.text(width / 2, 312, '酔った', {
            fontSize: '200px',
            color: '#FFD700',
            fontFamily: 'Noto Sans JP, sans-serif',
            fontStyle: '700',
            align: 'center'
        });
        drunk3.setOrigin(0.5);
        drunk3.setAlpha(0.7);

        // Fourth "DRUNK" text - Montserrat Thin (thinnest) - moved down 1/2 inch
        const drunk4 = this.add.text(width / 2, 312, 'DRUNK', {
            fontSize: '200px',
            color: '#FFD700',
            fontFamily: 'Montserrat, sans-serif',
            fontStyle: '100',
            align: 'center'
        });
        drunk4.setOrigin(0.5);
        drunk4.setAlpha(0.6);

        // "SIMULATOR" text - static below - moved down 1/2 inch
        const simulator = this.add.text(width / 2, 644, 'SIMULATOR', {
            fontSize: '64px',
            color: '#FFD700',
            fontFamily: 'Pixelify Sans, sans-serif',
            fontStyle: 'bold',
            align: 'center'
        });
        simulator.setOrigin(0.5);

        // First "DRUNK" text - Roboto Black (TOP LAYER - no bokeh for readability) - moved down 1/2 inch
        const drunk1 = this.add.text(width / 2, 312, 'DRUNK', {
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

        // Description text (moved up 1/4 inch more, bigger font)
        const description = this.add.text(width / 2, 804, 'A simulation game to experiment\nwith crowd dynamics by making a bar', {
            fontSize: '42px',
            color: '#FFD700',
            fontFamily: 'Pixelify Sans, sans-serif',
            fontStyle: 'italic',
            align: 'center',
            lineSpacing: 10
        });
        description.setOrigin(0.5);

        // Credit text at bottom (moved up 1/2 inch, larger font)
        const credits = this.add.text(width / 2, height - 66, 'A game by Mat Gilbert / mat@vtapi.co', {
            fontSize: '36px',
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

                    // Removed beer5 and beer6 animations for performance
                });
            });
        });

        // Bokeh effects removed for performance optimization
    }
}
