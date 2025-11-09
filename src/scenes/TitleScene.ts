import Phaser from 'phaser';

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

        // Title text
        const title = this.add.text(width / 2, 150, 'DRUNK SIMULATOR', {
            fontSize: '64px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            align: 'center'
        });
        title.setOrigin(0.5);

        // Start button (always visible) - centered vertically
        const startY = height / 2;
        const startBg = this.add.rectangle(width / 2, startY, 500, 90, 0x228B22);
        startBg.setStrokeStyle(6, 0xFFFFFF);

        const startText = this.add.text(width / 2, startY, 'START GAME', {
            fontSize: '42px',
            color: '#FFFFFF',
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
            this.scene.start('GameScene', { selectedMap: this.selectedMap });
        });
    }

}
