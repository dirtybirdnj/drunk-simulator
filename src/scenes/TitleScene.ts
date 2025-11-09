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

        // Load saved maps from localStorage
        const savedMapsStr = localStorage.getItem('drunkSimMaps') || '[]';
        const savedMaps = JSON.parse(savedMapsStr);

        // Map selection area
        const mapListY = 300;
        const mapListLabel = this.add.text(width / 2, mapListY - 40, 'Select a Map:', {
            fontSize: '28px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        mapListLabel.setOrigin(0.5);

        if (savedMaps.length === 0) {
            // No maps - show message
            const noMaps = this.add.text(width / 2, mapListY + 100, 'No saved maps.\nUse the Map Editor to create one!', {
                fontSize: '20px',
                color: '#888888',
                fontFamily: 'Arial, sans-serif',
                align: 'center'
            });
            noMaps.setOrigin(0.5);

            // Show default map button - centered vertically
            this.createMapButton(width / 2, height / 2 + 100, 'Default Map', null);
        } else {
            // Show list of saved maps
            savedMaps.forEach((map: any, index: number) => {
                const yPos = mapListY + (index * 100);
                this.createMapButton(width / 2, yPos, map.name, map.name);
            });

            // Also show default map option at the end
            const defaultMapY = mapListY + (savedMaps.length * 100);
            this.createMapButton(width / 2, defaultMapY, 'Default Map', null);
        }

        // Start button (always visible) - centered vertically
        const startY = height / 2 + 250;
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

    private createMapButton(x: number, y: number, mapName: string, mapKey: string | null) {
        const buttonBg = this.add.rectangle(x, y, 500, 90, 0x4169E1);
        buttonBg.setStrokeStyle(4, 0x888888);

        const buttonText = this.add.text(x, y, mapName, {
            fontSize: '32px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif'
        });
        buttonText.setOrigin(0.5);

        buttonBg.setInteractive({ useHandCursor: true });

        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x5179F1);
        });

        buttonBg.on('pointerout', () => {
            if (this.selectedMap === mapKey) {
                buttonBg.setFillStyle(0x32CD32); // Green if selected
            } else {
                buttonBg.setFillStyle(0x4169E1);
            }
        });

        buttonBg.on('pointerdown', () => {
            this.selectedMap = mapKey;
            console.log(`📍 Selected map: ${mapName}`);

            // Update all buttons to show selection
            this.updateMapSelection();
        });

        // Store reference for later updates
        (buttonBg as any).mapKey = mapKey;
        (buttonBg as any).isMapButton = true;

        // Auto-select Default Map on load
        if (mapKey === null) {
            this.time.delayedCall(0, () => {
                this.updateMapSelection();
            });
        }
    }

    private updateMapSelection() {
        // Update all map buttons to show which is selected
        this.children.list.forEach((child: any) => {
            if (child.isMapButton) {
                if (child.mapKey === this.selectedMap) {
                    child.setFillStyle(0x32CD32); // Green for selected
                    child.setStrokeStyle(3, 0xFFFF00); // Yellow border
                } else {
                    child.setFillStyle(0x4169E1);
                    child.setStrokeStyle(3, 0x888888);
                }
            }
        });
    }
}
