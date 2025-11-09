// In-game map editor UI for free mobile version
// See EDITOR_ARCHITECTURE.md for details on dual-editor system

import { TILES, COLORS } from './TileTypes';
import type { GameScene } from '../scenes/GameScene';

export enum EditorMode {
    EDIT = 'EDIT',     // Can place tiles, game paused
    ACTIVE = 'ACTIVE'  // Simulation running, can't edit
}

export class EditorUI {
    private scene: GameScene;
    private mode: EditorMode = EditorMode.EDIT;
    private selectedTile: number = TILES.BAR_FLOOR;

    // UI elements
    private bottomBar!: Phaser.GameObjects.Container;
    private paletteTiles: Map<number, Phaser.GameObjects.Rectangle> = new Map();
    private modeButton!: Phaser.GameObjects.Container;
    private playbackControls!: Phaser.GameObjects.Container;

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

    constructor(scene: GameScene) {
        this.scene = scene;
    }

    create(): void {
        // Use camera display dimensions for positioning UI
        const camera = this.scene.cameras.main;
        const width = camera.width;
        const height = camera.height;

        console.log('📐 Creating EditorUI');
        console.log('  → Camera size:', camera.width, 'x', camera.height);
        console.log('  → Camera zoom:', camera.zoom);
        console.log('  → Camera bounds:', camera.x, camera.y, camera.width, camera.height);
        console.log('  → Game scale:', this.scene.scale.width, 'x', this.scene.scale.height);

        // Create bottom bar as fixed UI overlay
        // Position at bottom of camera viewport
        const barHeight = 100;
        const barY = height - (barHeight / 2);

        console.log('  → Positioning bar at y:', barY, 'height:', barHeight);

        // Create container at (0, barY) for bottom bar
        this.bottomBar = this.scene.add.container(0, barY);
        this.bottomBar.setScrollFactor(0);
        this.bottomBar.setDepth(10000);

        // Black background bar - centered at (0, 0) within container
        const barBg = this.scene.add.rectangle(width / 2, 0, width, barHeight, 0x000000, 0.95);
        this.bottomBar.add(barBg);

        console.log('✅ Created bottom bar');

        // Create tile palette
        this.createTilePalette();

        // Create mode button (Start Game / Restart)
        this.createModeButton();

        // Create playback controls (hidden initially)
        this.createPlaybackControls();

        // Start in EDIT mode
        this.setMode(EditorMode.EDIT);
    }

    private createTilePalette(): void {
        const startX = 60;
        const tileSize = 40;
        const spacing = 10;
        const y = 0; // Relative to container

        console.log('🎨 Creating tile palette with', this.FREE_TILES.length, 'tiles');

        this.FREE_TILES.forEach((tileType, index) => {
            const x = startX + (index * (tileSize + spacing));

            // Tile background
            const bg = this.scene.add.rectangle(x, y, tileSize, tileSize, 0x333333);
            bg.setStrokeStyle(2, 0x666666);
            bg.setInteractive({ useHandCursor: true });

            // Tile color
            const tile = this.scene.add.rectangle(x, y, tileSize - 4, tileSize - 4, COLORS[tileType] || 0xFF00FF);

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

        console.log('✅ Created', this.paletteTiles.size, 'palette tiles');
    }

    private createModeButton(): void {
        const camera = this.scene.cameras.main;
        const x = camera.width - 120;
        const y = 0; // Relative to bottom bar container

        console.log('🔘 Creating START button');

        this.modeButton = this.scene.add.container(x, y);

        const bg = this.scene.add.rectangle(0, 0, 200, 60, 0x10b981);
        bg.setStrokeStyle(3, 0xFFFFFF);
        bg.setInteractive({ useHandCursor: true });

        const text = this.scene.add.text(0, 0, '▶️ START', {
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
    }

    private createPlaybackControls(): void {
        const camera = this.scene.cameras.main;
        const centerX = camera.width - 300;
        const y = 0; // Relative to bottom bar container

        this.playbackControls = this.scene.add.container(centerX, y);
        this.playbackControls.setVisible(false);

        console.log('🎮 Created playback controls');

        const buttonData = [
            { x: -120, label: '🐌 Slow', scale: 0.5 },
            { x: -40, label: '⏸️ Pause', scale: 1.0 },
            { x: 40, label: '⏩ Fast', scale: 2.0 },
            { x: 120, label: '🔄 Restart', scale: 0 } // 0 = restart action
        ];

        buttonData.forEach(({ x, label, scale }) => {
            const bg = this.scene.add.rectangle(x, 0, 70, 50, 0x3b82f6);
            bg.setStrokeStyle(2, 0xFFFFFF);
            bg.setInteractive({ useHandCursor: true });

            const text = this.scene.add.text(x, 0, label, {
                fontSize: '16px',
                color: '#FFFFFF',
                fontFamily: 'Arial'
            });
            text.setOrigin(0.5);

            bg.on('pointerdown', () => {
                if (scale === 0) {
                    // Restart button
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
    }

    private selectTile(tileType: number): void {
        // Deselect previous
        this.paletteTiles.forEach((bg, type) => {
            bg.setStrokeStyle(2, type === tileType ? 0xFFFF00 : 0x666666);
        });

        this.selectedTile = tileType;
    }

    private toggleMode(): void {
        if (this.mode === EditorMode.EDIT) {
            this.setMode(EditorMode.ACTIVE);
            this.scene.startGame();
        }
    }

    private setMode(mode: EditorMode): void {
        console.log('🔄 Switching to mode:', mode);
        this.mode = mode;

        if (mode === EditorMode.EDIT) {
            // Show palette, hide playback controls
            console.log('  → Showing palette tiles');
            this.paletteTiles.forEach(bg => bg.setVisible(true));
            this.playbackControls.setVisible(false);

            // Update button
            const modeBtn = this.modeButton.getAt(1) as Phaser.GameObjects.Text;
            modeBtn.setText('▶️ START');

            // Enable grid clicking
            this.enableGridEditing();
            console.log('  → Grid editing enabled');
        } else {
            // Hide palette, show playback controls
            console.log('  → Hiding palette, showing playback controls');
            this.paletteTiles.forEach(bg => bg.setVisible(false));
            this.playbackControls.setVisible(true);

            // Disable grid editing
            this.disableGridEditing();
            console.log('  → Grid editing disabled');
        }
    }

    private enableGridEditing(): void {
        this.scene.input.on('pointerdown', this.handleGridClick, this);
    }

    private disableGridEditing(): void {
        this.scene.input.off('pointerdown', this.handleGridClick, this);
    }

    private handleGridClick(pointer: Phaser.Input.Pointer): void {
        if (this.mode !== EditorMode.EDIT) return;

        // Convert screen coordinates to world coordinates
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;

        // Pass to GameScene to handle tile placement
        this.scene.placeTileAt(worldX, worldY, this.selectedTile);
    }

    private setTimeScale(scale: number): void {
        this.scene.physics.world.timeScale = scale;

        // Visual feedback - highlight active button
        const buttons = this.playbackControls.getAll() as Phaser.GameObjects.Rectangle[];
        buttons.forEach((obj, index) => {
            if (obj.type === 'Rectangle') {
                const bg = obj as Phaser.GameObjects.Rectangle;
                if (index === 0 && scale === 0.5) bg.setFillStyle(0x059669);
                else if (index === 2 && scale === 1.0) bg.setFillStyle(0x059669);
                else if (index === 4 && scale === 2.0) bg.setFillStyle(0x059669);
                else bg.setFillStyle(0x3b82f6);
            }
        });
    }

    private restartEditor(): void {
        // Return to EDIT mode and reset
        this.setMode(EditorMode.EDIT);
        this.scene.restartLevel();
    }

    getMode(): EditorMode {
        return this.mode;
    }

    destroy(): void {
        this.disableGridEditing();
        this.bottomBar.destroy();
    }
}
