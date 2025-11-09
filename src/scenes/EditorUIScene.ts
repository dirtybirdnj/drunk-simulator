import Phaser from 'phaser';
import { TILES, COLORS } from '../systems/TileTypes';
import type { GameScene } from './GameScene';

export enum EditorMode {
    EDIT = 'EDIT',     // Can place tiles, game paused
    ACTIVE = 'ACTIVE'  // Simulation running, can't edit
}

export class EditorUIScene extends Phaser.Scene {
    private mode: EditorMode = EditorMode.EDIT;
    private selectedTile: number = TILES.BAR_FLOOR;

    // UI elements
    private bottomBar!: Phaser.GameObjects.Container;
    private paletteTiles: Map<number, Phaser.GameObjects.Rectangle> = new Map();
    private modeButton!: Phaser.GameObjects.Container;
    private undoButton!: Phaser.GameObjects.Container;
    private playbackControls!: Phaser.GameObjects.Container;

    // Undo history
    private editHistory: Array<{row: number, col: number, oldTile: number, newTile: number}> = [];
    private maxHistorySize = 50;

    // Tile palette for free game (limited set)
    private readonly FREE_TILES = [
        TILES.BAR_FLOOR,
        TILES.WALL,
        TILES.BAR_COUNTER,
        TILES.BEER_TAP,
        TILES.CASH_REGISTER,
        TILES.DOOR,
        TILES.CHAIR,
        TILES.PATRON_SPAWN,
        TILES.EMPLOYEE_SPAWN
    ];

    constructor() {
        super({ key: 'EditorUIScene' });
    }

    create() {
        // This scene renders on top of GameScene
        // Use actual screen/canvas dimensions for positioning
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        console.log('🎨 Creating EditorUIScene overlay');
        console.log('  → Scene size:', width, 'x', height);

        // Create bottom bar (100px tall, at bottom of screen)
        const barHeight = 100;
        const barY = height - (barHeight / 2);

        this.bottomBar = this.add.container(0, barY);
        this.bottomBar.setDepth(10000);

        // Black background bar
        const barBg = this.add.rectangle(width / 2, 0, width, barHeight, 0x000000, 0.95);
        this.bottomBar.add(barBg);

        console.log('  → Bottom bar at y:', barY);

        // Create UI elements
        this.createTilePalette();
        this.createUndoButton();
        this.createModeButton();
        this.createPlaybackControls();

        // Start in EDIT mode
        this.setMode(EditorMode.EDIT);
    }

    private createTilePalette(): void {
        const startX = 60;
        const tileSize = 40;
        const spacing = 10;
        const y = 0; // Relative to bottomBar container

        this.FREE_TILES.forEach((tileType, index) => {
            const x = startX + (index * (tileSize + spacing));

            // Tile background
            const bg = this.add.rectangle(x, y, tileSize, tileSize, 0x333333);
            bg.setStrokeStyle(2, 0x666666);
            bg.setInteractive({ useHandCursor: true });

            // Tile color
            const tile = this.add.rectangle(x, y, tileSize - 4, tileSize - 4, COLORS[tileType] || 0xFF00FF);

            // Store reference
            this.paletteTiles.set(tileType, bg);

            // Click handler
            bg.on('pointerdown', () => {
                if (this.mode === EditorMode.EDIT) {
                    this.selectTile(tileType);
                }
            });

            // Hover effect
            bg.on('pointerover', () => {
                if (this.mode === EditorMode.EDIT) {
                    bg.setStrokeStyle(2, 0xFFFFFF);
                }
            });
            bg.on('pointerout', () => {
                if (this.selectedTile !== tileType) {
                    bg.setStrokeStyle(2, 0x666666);
                }
            });

            this.bottomBar.add([bg, tile]);
        });

        // Select first tile by default
        this.selectTile(this.FREE_TILES[0]);
        console.log('  → Created', this.paletteTiles.size, 'palette tiles');
    }

    private createUndoButton(): void {
        const startX = 60;
        const tileSize = 40;
        const spacing = 10;
        const paletteWidth = this.FREE_TILES.length * (tileSize + spacing);
        const x = startX + paletteWidth + 20;
        const y = 0;

        this.undoButton = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 80, 60, 0x6366f1);
        bg.setStrokeStyle(3, 0xFFFFFF);
        bg.setInteractive({ useHandCursor: true });

        const text = this.add.text(0, 0, '↶ UNDO', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);

        bg.on('pointerdown', () => this.undo());
        bg.on('pointerover', () => bg.setFillStyle(0x4f46e5));
        bg.on('pointerout', () => bg.setFillStyle(0x6366f1));

        this.undoButton.add([bg, text]);
        this.bottomBar.add(this.undoButton);

        console.log('  → Created undo button');
    }

    private createModeButton(): void {
        const width = this.cameras.main.width;
        const x = width - 120;
        const y = 0;

        this.modeButton = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 200, 60, 0x10b981);
        bg.setStrokeStyle(3, 0xFFFFFF);
        bg.setInteractive({ useHandCursor: true });

        const text = this.add.text(0, 0, '▶️ START', {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);

        bg.on('pointerdown', () => this.toggleMode());
        bg.on('pointerover', () => bg.setFillStyle(0x059669));
        bg.on('pointerout', () => bg.setFillStyle(0x10b981));

        this.modeButton.add([bg, text]);
        this.bottomBar.add(this.modeButton);

        console.log('  → Created START button');
    }

    private createPlaybackControls(): void {
        const width = this.cameras.main.width;
        const centerX = width - 300;
        const y = 0;

        this.playbackControls = this.add.container(centerX, y);
        this.playbackControls.setVisible(false);

        const buttonData = [
            { x: -120, label: '🐌 Slow', scale: 0.5 },
            { x: -40, label: '⏸️ Pause', scale: 1.0 },
            { x: 40, label: '⏩ Fast', scale: 2.0 },
            { x: 120, label: '🔄 Restart', scale: 0 }
        ];

        buttonData.forEach(({ x, label, scale }) => {
            const bg = this.add.rectangle(x, 0, 70, 50, 0x3b82f6);
            bg.setStrokeStyle(2, 0xFFFFFF);
            bg.setInteractive({ useHandCursor: true });

            const text = this.add.text(x, 0, label, {
                fontSize: '16px',
                color: '#FFFFFF',
                fontFamily: 'Arial'
            });
            text.setOrigin(0.5);

            bg.on('pointerdown', () => {
                if (scale === 0) {
                    this.restartEditor();
                } else {
                    this.setTimeScale(scale);
                }
            });

            bg.on('pointerover', () => bg.setFillStyle(0x2563eb));
            bg.on('pointerout', () => bg.setFillStyle(0x3b82f6));

            this.playbackControls.add([bg, text]);
        });

        this.bottomBar.add(this.playbackControls);
        console.log('  → Created playback controls');
    }

    private selectTile(tileType: number): void {
        this.paletteTiles.forEach((bg, type) => {
            bg.setStrokeStyle(2, type === tileType ? 0xFFFF00 : 0x666666);
        });
        this.selectedTile = tileType;
    }

    private toggleMode(): void {
        if (this.mode === EditorMode.EDIT) {
            this.setMode(EditorMode.ACTIVE);
            // Tell GameScene to start
            const gameScene = this.scene.get('GameScene') as GameScene;
            gameScene.startGame();
        }
    }

    private setMode(mode: EditorMode): void {
        this.mode = mode;

        if (mode === EditorMode.EDIT) {
            this.paletteTiles.forEach(bg => bg.setVisible(true));
            this.undoButton.setVisible(true);
            this.playbackControls.setVisible(false);

            const modeBtn = this.modeButton.getAt(1) as Phaser.GameObjects.Text;
            modeBtn.setText('▶️ START');
        } else {
            this.paletteTiles.forEach(bg => bg.setVisible(false));
            this.undoButton.setVisible(false);
            this.playbackControls.setVisible(true);
        }
    }

    private setTimeScale(scale: number): void {
        const gameScene = this.scene.get('GameScene') as GameScene;
        gameScene.physics.world.timeScale = scale;
    }

    private restartEditor(): void {
        this.setMode(EditorMode.EDIT);
        const gameScene = this.scene.get('GameScene') as GameScene;
        gameScene.restartLevel();
    }

    private undo(): void {
        if (this.mode !== EditorMode.EDIT) return;
        if (this.editHistory.length === 0) return;

        const lastEdit = this.editHistory.pop()!;
        const gameScene = this.scene.get('GameScene') as GameScene;
        const tileSize = gameScene.getTileSize();

        gameScene.placeTileAt(
            lastEdit.col * tileSize + tileSize / 2,
            lastEdit.row * tileSize + tileSize / 2,
            lastEdit.oldTile,
            false
        );
    }

    public trackEdit(row: number, col: number, oldTile: number, newTile: number): void {
        if (oldTile === newTile) return;
        this.editHistory.push({ row, col, oldTile, newTile });
        if (this.editHistory.length > this.maxHistorySize) {
            this.editHistory.shift();
        }
    }

    public getMode(): EditorMode {
        return this.mode;
    }

    public getSelectedTile(): number {
        return this.selectedTile;
    }
}
