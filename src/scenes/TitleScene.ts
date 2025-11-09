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

        // First beer emoji - layered behind text (moved down 1 inch = ~96px from original position)
        const beer1 = this.add.text(width / 2, 372, '🍺', {
            fontSize: '400px',
            align: 'center'
        });
        beer1.setOrigin(0.5);
        beer1.setAlpha(0.8);

        // Second beer emoji - offset animation
        const beer2 = this.add.text(width / 2, 372, '🍺', {
            fontSize: '400px',
            align: 'center'
        });
        beer2.setOrigin(0.5);
        beer2.setAlpha(0.6);

        // Third beer emoji - opposite direction with vertical drift
        const beer3 = this.add.text(width / 2, 372, '🍺', {
            fontSize: '400px',
            align: 'center'
        });
        beer3.setOrigin(0.5);
        beer3.setAlpha(0.7);

        // First "DRUNK" text - wobbles and fades (moved down 1 inch = ~96px)
        const drunk1 = this.add.text(width / 2, 276, 'DRUNK', {
            fontSize: '200px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            align: 'center'
        });
        drunk1.setOrigin(0.5);
        drunk1.setAlpha(0.8);

        // Second "DRUNK" text - offset animation, different rate
        const drunk2 = this.add.text(width / 2, 276, 'DRUNK', {
            fontSize: '200px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            align: 'center'
        });
        drunk2.setOrigin(0.5);
        drunk2.setAlpha(0.6);

        // "SIMULATOR" text - static below
        const simulator = this.add.text(width / 2, 440, 'SIMULATOR', {
            fontSize: '64px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            align: 'center'
        });
        simulator.setOrigin(0.5);

        // Description text (moved down 1 inch = ~96px)
        const description = this.add.text(width / 2, 684, 'A simulation game to experiment\nwith crowd dynamics by making a bar', {
            fontSize: '28px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'italic',
            align: 'center',
            lineSpacing: 10
        });
        description.setOrigin(0.5);

        // Credit text at bottom
        const credits = this.add.text(width / 2, height - 30, 'A game by Mat Gilbert / mat@vtapi.co', {
            fontSize: '18px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
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
            x: { from: width / 2 - 80, to: width / 2 + 80 },
            duration: 2000,
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

            // Wobble animation for second beer emoji - different rate, larger drift
            this.tweens.add({
                targets: beer2,
                angle: { from: -4, to: 4 },
                x: { from: width / 2 - 100, to: width / 2 + 100 },
                duration: 2700, // Different duration for desync
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Fade in/out for second beer emoji - different rate
            this.tweens.add({
                targets: beer2,
                alpha: { from: 0.4, to: 0.9 },
                duration: 2100, // Different duration for desync
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Grow/shrink for second beer emoji - different rate
            this.tweens.add({
                targets: beer2,
                scaleX: { from: 0.92, to: 1.08 },
                scaleY: { from: 0.92, to: 1.08 },
                duration: 2300, // Different duration for desync
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
            });
        });

        // Start button (always visible) - positioned below the title
        const startY = height / 2 + 150;
        const startBg = this.add.rectangle(width / 2, startY, 900, 250, 0x228B22);
        startBg.setStrokeStyle(10, 0xFFFFFF);

        const startText = this.add.text(width / 2, startY, '🍻 START 🍹', {
            fontSize: '120px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
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
    }

}
