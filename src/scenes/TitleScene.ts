import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background color (dark)
        this.cameras.main.setBackgroundColor('#1a1a1a');

        // Title text
        const title = this.add.text(width / 2, height / 2 - 100, 'DRUNK SIMULATOR', {
            fontSize: '64px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            align: 'center'
        });
        title.setOrigin(0.5);

        // Create start button
        const buttonWidth = 300;
        const buttonHeight = 80;
        const buttonX = width / 2;
        const buttonY = height / 2 + 100;

        // Button background
        const buttonBg = this.add.rectangle(
            buttonX,
            buttonY,
            buttonWidth,
            buttonHeight,
            0x4169E1
        );
        buttonBg.setStrokeStyle(4, 0xFFFFFF);

        // Button text
        const buttonText = this.add.text(buttonX, buttonY, 'START', {
            fontSize: '36px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);

        // Make button interactive
        buttonBg.setInteractive({ useHandCursor: true });

        // Hover effects
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x5179F1);
            buttonBg.setScale(1.05);
            buttonText.setScale(1.05);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x4169E1);
            buttonBg.setScale(1);
            buttonText.setScale(1);
        });

        // Click to start game
        buttonBg.on('pointerdown', () => {
            console.log('🎮 Starting game...');
            this.scene.start('GameScene');
        });

        // Subtitle for future features
        const subtitle = this.add.text(width / 2, height - 50, 'Press START to enter the bar', {
            fontSize: '18px',
            color: '#888888',
            fontFamily: 'Arial, sans-serif',
            align: 'center'
        });
        subtitle.setOrigin(0.5);
    }
}
