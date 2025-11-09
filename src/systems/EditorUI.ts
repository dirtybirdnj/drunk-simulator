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
    private undoButton!: Phaser.GameObjects.Container;

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

    constructor(scene: GameScene) {
        this.scene = scene;
    }

    create(): void {
        const camera = this.scene.cameras.main;

        // CRITICAL: Use the actual display size, not camera bounds
        const displayWidth = this.scene.scale.displaySize.width;
        const displayHeight = this.scene.scale.displaySize.height;
        const canvasWidth = this.scene.game.canvas.width;
        const canvasHeight = this.scene.game.canvas.height;

        console.log('📐 Creating EditorUI - DEBUGGING DIMENSIONS:');
        console.log('  → Camera size:', camera.width, 'x', camera.height);
        console.log('  → Camera zoom:', camera.zoom);
        console.log('  → Scale size:', this.scene.scale.width, 'x', this.scene.scale.height);
        console.log('  → Display size:', displayWidth, 'x', displayHeight);
        console.log('  → Canvas size:', canvasWidth, 'x', canvasHeight);
        console.log('  → Canvas style:', this.scene.game.canvas.style.width, 'x', this.scene.game.canvas.style.height);

        // Use the SMALLER of camera height and display height
        const width = Math.min(camera.width, displayWidth);
        const height = Math.min(camera.height, displayHeight);

        console.log('  → USING width:', width, 'height:', height);

        // Create bottom bar as fixed UI overlay
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

        // Create undo button
        this.createUndoButton();

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

    private createUndoButton(): void {
        // Position after tile palette
        const startX = 60;
        const tileSize = 40;
        const spacing = 10;
        const paletteWidth = this.FREE_TILES.length * (tileSize + spacing);
        const x = startX + paletteWidth + 20;
        const y = 0; // Relative to container

        this.undoButton = this.scene.add.container(x, y);

        const bg = this.scene.add.rectangle(0, 0, 80, 60, 0x6366f1);
        bg.setStrokeStyle(3, 0xFFFFFF);
        bg.setInteractive({ useHandCursor: true });

        const text = this.scene.add.text(0, 0, '↶ UNDO', {
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

        console.log('✅ Created undo button');
    }

    private createModeButton(): void {
        // Use same width logic as create()
        const displayWidth = this.scene.scale.displaySize.width;
        const cameraWidth = this.scene.cameras.main.width;
        const width = Math.min(cameraWidth, displayWidth);

        const x = width - 120;
        const y = 0; // Relative to bottom bar container

        console.log('🔘 Creating START button at x:', x);

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
        // Use same width logic as create()
        const displayWidth = this.scene.scale.displaySize.width;
        const cameraWidth = this.scene.cameras.main.width;
        const width = Math.min(cameraWidth, displayWidth);

        const centerX = width - 300;
        const y = 0; // Relative to bottom bar container

        this.playbackControls = this.scene.add.container(centerX, y);
        this.playbackControls.setVisible(false);

        console.log('🎮 Created playback controls at x:', centerX);

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
            // Show palette and undo, hide playback controls
            console.log('  → Showing palette tiles and undo button');
            this.paletteTiles.forEach(bg => bg.setVisible(true));
            this.undoButton.setVisible(true);
            this.playbackControls.setVisible(false);

            // Update button
            const modeBtn = this.modeButton.getAt(1) as Phaser.GameObjects.Text;
            modeBtn.setText('▶️ START');

            // Enable grid clicking
            this.enableGridEditing();
            console.log('  → Grid editing enabled');
        } else {
            // Hide palette and undo, show playback controls
            console.log('  → Hiding palette and undo, showing playback controls');
            this.paletteTiles.forEach(bg => bg.setVisible(false));
            this.undoButton.setVisible(false);
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

    public trackEdit(row: number, col: number, oldTile: number, newTile: number): void {
        // Don't track if tile didn't actually change
        if (oldTile === newTile) return;

        // Add to history
        this.editHistory.push({ row, col, oldTile, newTile });

        // Limit history size
        if (this.editHistory.length > this.maxHistorySize) {
            this.editHistory.shift();
        }

        console.log('📝 Edit tracked. History size:', this.editHistory.length);
    }

    private undo(): void {
        if (this.mode !== EditorMode.EDIT) return;
        if (this.editHistory.length === 0) {
            console.log('⚠️ Nothing to undo');
            return;
        }

        // Pop last edit from history
        const lastEdit = this.editHistory.pop()!;

        // Restore old tile
        this.scene.placeTileAt(
            lastEdit.col * this.scene.getTileSize() + this.scene.getTileSize() / 2,
            lastEdit.row * this.scene.getTileSize() + this.scene.getTileSize() / 2,
            lastEdit.oldTile,
            false // Don't track this change
        );

        console.log('↶ Undid edit. History size:', this.editHistory.length);
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
