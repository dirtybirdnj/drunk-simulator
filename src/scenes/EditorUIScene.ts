import Phaser from 'phaser';
import { TILES, COLORS } from '../systems/TileTypes';
import type { GameScene } from './GameScene';
import { compressMap } from '../utils/mapCompression';
import QRCode from 'qrcode';

export enum EditorMode {
    EDIT = 'EDIT',     // Can place tiles, game paused
    ACTIVE = 'ACTIVE'  // Simulation running, can't edit
}

export class EditorUIScene extends Phaser.Scene {
    private mode: EditorMode = EditorMode.EDIT;
    private selectedTile: number = TILES.WALL; // Default to wall for easier building

    // UI elements
    private bottomBar!: Phaser.GameObjects.Container;
    private paletteTiles: Map<number, Phaser.GameObjects.Rectangle> = new Map();
    private modeButton!: Phaser.GameObjects.Container;
    private undoButton!: Phaser.GameObjects.Container;
    private clearAllButton!: Phaser.GameObjects.Container;
    private fillButton!: Phaser.GameObjects.Container;
    private qrCodeButton!: Phaser.GameObjects.Container;
    private playbackControls!: Phaser.GameObjects.Container;
    private selectedTileText!: Phaser.GameObjects.Text;

    // Undo history
    private editHistory: Array<{row: number, col: number, oldTile: number, newTile: number}> = [];
    private maxHistorySize = 50;

    // Clear all warning state
    private clearAllWarning: boolean = false;

    // Fill mode state
    private fillMode: boolean = false;
    private fillStartRow: number = -1;
    private fillStartCol: number = -1;
    private fillPreview: Phaser.GameObjects.Rectangle | null = null;

    // Double-tap detection for fill mode toggle
    private lastTappedTile: number = -1;
    private lastTapTime: number = 0;
    private doubleTapDelay: number = 300; // milliseconds

    // Tile palette for free game (limited set)
    private readonly FREE_TILES = [
        TILES.STREET,          // Grey
        TILES.BAR_FLOOR,       // Tan
        TILES.PATIO,           // Light grey - outdoor smoking area
        TILES.WALL,            // Brown
        TILES.BAR_COUNTER,     // Dark brown
        TILES.BEER_TAP,        // Yellow
        TILES.CASH_REGISTER,   // Money green
        TILES.DOOR,            // Black
        TILES.STAFF_ZONE,      // Blue - behind the bar area
        TILES.CHAIR,           // Dark forest green
        TILES.PATRON_SPAWN,    // Orange
        TILES.EMPLOYEE_SPAWN,  // Red
        TILES.PLAYER_START,    // Bright green (neon green)
        TILES.CAMERA_START,    // Cyan
        TILES.POI              // Purple
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

        // Create bottom bar (180px tall, at bottom of screen - matches BOTTOM_BAR_HEIGHT in GameScene)
        const barHeight = 180;
        const barY = height - (barHeight / 2);

        this.bottomBar = this.add.container(0, barY);
        this.bottomBar.setDepth(10000);

        // Black background bar
        const barBg = this.add.rectangle(width / 2, 0, width, barHeight, 0x000000, 0.95);
        this.bottomBar.add(barBg);

        console.log('  → Bottom bar at y:', barY);

        // Create top stats bar
        this.createStatsBar();

        // Create selected tile name display (above palette)
        this.selectedTileText = this.add.text(this.cameras.main.width / 2, -82, 'Street', {
            fontSize: '20px',
            color: '#FFFF00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        this.selectedTileText.setOrigin(0.5);
        this.selectedTileText.setDepth(10001);
        this.bottomBar.add(this.selectedTileText);

        // Create UI elements
        this.createTilePalette();
        this.createQRCodeButton();
        this.createFillButton();
        this.createUndoButton();
        this.createClearAllButton();
        this.createModeButton();
        this.createPlaybackControls();

        // Start in EDIT mode
        this.setMode(EditorMode.EDIT);
    }

    private createStatsBar(): void {
        const width = this.cameras.main.width;
        const barHeight = 60;
        const barY = barHeight / 2;

        // Semi-transparent black background at top
        const bg = this.add.rectangle(width / 2, barY, width, barHeight, 0x000000, 0.8);
        bg.setDepth(10000);

        // TIME label and value - moved down and right from corner
        const timeLabel = this.add.text(50, barY + 8, 'TIME: 00:00', {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        timeLabel.setOrigin(0, 0.5);
        timeLabel.setDepth(10001);

        // PROFIT label and value - moved down and left from corner
        const profitLabel = this.add.text(width - 50, barY + 8, 'PROFIT: $0', {
            fontSize: '24px',
            color: '#00FF00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        profitLabel.setOrigin(1, 0.5);
        profitLabel.setDepth(10001);

        console.log('  → Created stats bar at top');
    }

    private createTilePalette(): void {
        const startX = 41; // Moved left another 8px
        const tileSize = 60;
        const spacing = 8;
        const y = -27; // Moved up another 1/8 inch (9px) total 3/8 inch up

        console.log('🎨 Creating palette. TILES.DOOR =', TILES.DOOR, 'COLORS[TILES.DOOR] =', COLORS[TILES.DOOR]);
        console.log('🎨 FREE_TILES:', this.FREE_TILES);

        this.FREE_TILES.forEach((tileType, index) => {
            const x = startX + (index * (tileSize + spacing));

            // Tile background with WHITE border (so black tiles are visible)
            const bg = this.add.rectangle(x, y, tileSize, tileSize, 0x333333);
            bg.setStrokeStyle(3, 0xFFFFFF); // White border, not grey
            bg.setInteractive({ useHandCursor: true });

            // Tile color
            const color = COLORS[tileType];
            if (color === undefined) {
                console.error('❌ Missing color for tile type:', tileType);
            }
            // Use !== undefined check instead of || because 0x000000 (black) equals 0 which is falsy
            const tile = this.add.rectangle(x, y, tileSize - 6, tileSize - 6, color !== undefined ? color : 0xFF00FF);

            // Store reference
            this.paletteTiles.set(tileType, bg);

            // Click handler with double-tap detection for fill mode
            bg.on('pointerdown', () => {
                if (this.mode === EditorMode.EDIT) {
                    const now = Date.now();
                    const timeSinceLastTap = now - this.lastTapTime;

                    // Check if this is a double-tap on the same tile
                    if (this.lastTappedTile === tileType && timeSinceLastTap < this.doubleTapDelay) {
                        // Double-tap detected - toggle fill mode
                        this.toggleFillMode();
                        console.log(`🎨 Double-tap on ${this.getTileName(tileType)} - Fill mode: ${this.fillMode ? 'ON' : 'OFF'}`);
                        this.lastTappedTile = -1; // Reset to prevent triple-tap
                        this.lastTapTime = 0;
                    } else {
                        // Single tap - select tile and turn off fill mode if tapping different tile
                        if (this.lastTappedTile !== tileType && this.fillMode) {
                            this.toggleFillMode(); // Turn off fill mode when selecting different tile
                            console.log('🎨 Different tile selected - Fill mode OFF');
                        }
                        this.selectTile(tileType);
                        this.lastTappedTile = tileType;
                        this.lastTapTime = now;
                    }
                }
            });

            // Hover effect
            bg.on('pointerover', () => {
                if (this.mode === EditorMode.EDIT && this.selectedTile !== tileType) {
                    bg.setStrokeStyle(4, 0xFFFFFF); // Thicker white border on hover
                }
            });
            bg.on('pointerout', () => {
                if (this.selectedTile !== tileType) {
                    bg.setStrokeStyle(3, 0xFFFFFF); // Back to normal white border
                }
            });

            this.bottomBar.add([bg, tile]);
        });

        // Select WALL tile by default (TILES.WALL)
        this.selectTile(TILES.WALL);
        console.log('  → Created', this.paletteTiles.size, 'palette tiles (default: WALL)');
    }

    private createQRCodeButton(): void {
        const width = this.cameras.main.width;
        const x = width - 860; // Leftmost button in horizontal layout
        const y = 50; // Below palette

        this.qrCodeButton = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 140, 50, 0x2563eb); // Blue color
        bg.setStrokeStyle(3, 0xFFFFFF);
        bg.setInteractive({ useHandCursor: true });

        const text = this.add.text(0, 0, '📱 QR CODE', {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);

        bg.on('pointerdown', () => this.showQRCode());
        bg.on('pointerover', () => bg.setFillStyle(0x1d4ed8)); // Darker blue
        bg.on('pointerout', () => bg.setFillStyle(0x2563eb)); // Back to normal blue

        this.qrCodeButton.add([bg, text]);
        this.bottomBar.add(this.qrCodeButton);

        console.log('  → Created QR CODE button (leftmost)');
    }

    private createFillButton(): void {
        const width = this.cameras.main.width;
        const x = width - 700; // Second button in horizontal layout
        const y = 50; // Below palette

        this.fillButton = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 140, 50, 0x8b5cf6); // Purple color
        bg.setStrokeStyle(3, 0xFFFFFF);
        bg.setInteractive({ useHandCursor: true });

        const text = this.add.text(0, 0, '🎨 FILL', {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);

        bg.on('pointerdown', () => this.toggleFillMode());
        bg.on('pointerover', () => {
            if (!this.fillMode) {
                bg.setFillStyle(0x7c3aed); // Darker purple
            }
        });
        bg.on('pointerout', () => {
            if (!this.fillMode) {
                bg.setFillStyle(0x8b5cf6); // Back to normal purple
            }
        });

        this.fillButton.add([bg, text]);
        this.bottomBar.add(this.fillButton);

        console.log('  → Created FILL button (leftmost)');
    }

    private createUndoButton(): void {
        const width = this.cameras.main.width;
        const x = width - 540; // Second button in horizontal layout (moved left 72px / 1 inch)
        const y = 50; // Below palette (moved down from buttons area)

        this.undoButton = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 140, 50, 0x6366f1); // Narrower for horizontal layout
        bg.setStrokeStyle(3, 0xFFFFFF);
        bg.setInteractive({ useHandCursor: true });

        const text = this.add.text(0, 0, '↶ UNDO', {
            fontSize: '18px',
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

        console.log('  → Created undo button (above START)');
    }

    private createClearAllButton(): void {
        const width = this.cameras.main.width;
        const x = width - 380; // Middle button in horizontal layout (moved left 72px / 1 inch)
        const y = 50; // Below palette (same y as other buttons)

        this.clearAllButton = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 140, 50, 0xf59e0b); // Orange color, narrower for horizontal layout
        bg.setStrokeStyle(3, 0xFFFFFF);
        bg.setInteractive({ useHandCursor: true });

        const text = this.add.text(0, 0, '🗑️ CLEAR ALL', {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);

        bg.on('pointerdown', () => {
            if (!this.clearAllWarning) {
                // First tap - turn red and warn
                this.clearAllWarning = true;
                bg.setFillStyle(0xef4444); // Red
                text.setText('⚠️ TAP AGAIN');

                // Reset warning after 3 seconds
                this.time.delayedCall(3000, () => {
                    this.clearAllWarning = false;
                    bg.setFillStyle(0xf59e0b); // Back to orange
                    text.setText('🗑️ CLEAR ALL');
                });
            } else {
                // Second tap - clear all
                this.clearAll();
                this.clearAllWarning = false;
                bg.setFillStyle(0xf59e0b); // Back to orange
                text.setText('🗑️ CLEAR ALL');
            }
        });

        bg.on('pointerover', () => {
            if (!this.clearAllWarning) {
                bg.setFillStyle(0xd97706); // Darker orange
            }
        });
        bg.on('pointerout', () => {
            if (!this.clearAllWarning) {
                bg.setFillStyle(0xf59e0b); // Back to normal orange
            }
        });

        this.clearAllButton.add([bg, text]);
        this.bottomBar.add(this.clearAllButton);

        console.log('  → Created CLEAR ALL button (center)');
    }

    private createModeButton(): void {
        const width = this.cameras.main.width;
        const x = width - 220; // Right button in horizontal layout (moved left 72px / 1 inch)
        const y = 50; // Below palette (same y as other buttons)

        this.modeButton = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 140, 50, 0x10b981); // Narrower for horizontal layout
        bg.setStrokeStyle(3, 0xFFFFFF);
        bg.setInteractive({ useHandCursor: true });

        const text = this.add.text(0, 0, '▶️ START', {
            fontSize: '20px',
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

        console.log('  → Created START button (below UNDO)');
    }

    private createPlaybackControls(): void {
        const width = this.cameras.main.width;
        const y = 50; // Same y as other buttons

        // Create individual button containers instead of one grouped container
        // This allows us to position them individually in a horizontal line
        this.playbackControls = this.add.container(0, 0);
        this.playbackControls.setVisible(false);

        const buttonData = [
            { x: width - 700, label: '🐌 Slow', scale: 0.5 },
            { x: width - 560, label: '⏸️ Pause', scale: 1.0 },
            { x: width - 420, label: '⏩ Fast', scale: 2.0 },
            { x: width - 280, label: '🔄 Restart', scale: 0 },
            { x: width - 140, label: '⏹️ Stop', scale: -1 } // Stop returns to EDIT mode
        ];

        buttonData.forEach(({ x, label, scale }) => {
            const container = this.add.container(x, y);

            const bg = this.add.rectangle(0, 0, 120, 50, 0x3b82f6);
            bg.setStrokeStyle(3, 0xFFFFFF);
            bg.setInteractive({ useHandCursor: true });

            const text = this.add.text(0, 0, label, {
                fontSize: '18px',
                color: '#FFFFFF',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            });
            text.setOrigin(0.5);

            bg.on('pointerdown', () => {
                if (scale === -1) {
                    // Stop button - return to EDIT mode
                    this.setMode(EditorMode.EDIT);
                    const gameScene = this.scene.get('GameScene') as GameScene;
                    gameScene.restartLevel();
                } else if (scale === 0) {
                    this.restartEditor();
                } else {
                    this.setTimeScale(scale);
                }
            });

            bg.on('pointerover', () => bg.setFillStyle(0x2563eb));
            bg.on('pointerout', () => bg.setFillStyle(0x3b82f6));

            container.add([bg, text]);
            this.playbackControls.add(container);
        });

        this.bottomBar.add(this.playbackControls);
        console.log('  → Created playback controls (5 buttons in horizontal line)');
    }

    private selectTile(tileType: number): void {
        this.paletteTiles.forEach((bg, type) => {
            bg.setStrokeStyle(3, type === tileType ? 0xFFFF00 : 0xFFFFFF); // Yellow when selected, white when not
        });
        this.selectedTile = tileType;

        // Update tile name display
        if (this.selectedTileText) {
            this.selectedTileText.setText(this.getTileName(tileType));
        }
    }

    private getTileName(tileType: number): string {
        const names: { [key: number]: string } = {
            [TILES.STREET]: 'Street',
            [TILES.BAR_FLOOR]: 'Bar Floor',
            [TILES.PATIO]: 'Patio',
            [TILES.WALL]: 'Wall',
            [TILES.BAR_COUNTER]: 'Counter',
            [TILES.BEER_TAP]: 'Beer Tap',
            [TILES.CASH_REGISTER]: 'Cash Register',
            [TILES.DOOR]: 'Door',
            [TILES.STAFF_ZONE]: 'Staff Zone',
            [TILES.CHAIR]: 'Chair',
            [TILES.PATRON_SPAWN]: 'Patron Spawn',
            [TILES.EMPLOYEE_SPAWN]: 'Employee Spawn',
            [TILES.PLAYER_START]: 'Player Start',
            [TILES.CAMERA_START]: 'Camera Start',
            [TILES.POI]: 'Point of Interest'
        };
        return names[tileType] || 'Unknown';
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
            // Show edit mode UI
            this.paletteTiles.forEach(bg => bg.setVisible(true));
            this.selectedTileText.setVisible(true);
            this.qrCodeButton.setVisible(true);
            this.fillButton.setVisible(true);
            this.undoButton.setVisible(true);
            this.clearAllButton.setVisible(true);
            this.modeButton.setVisible(true);
            this.playbackControls.setVisible(false);

            const modeBtn = this.modeButton.getAt(1) as Phaser.GameObjects.Text;
            modeBtn.setText('▶️ START');
        } else {
            // Hide edit mode UI, show playback controls
            this.paletteTiles.forEach(bg => bg.setVisible(false));
            this.selectedTileText.setVisible(false);
            this.qrCodeButton.setVisible(false);
            this.fillButton.setVisible(false);
            this.undoButton.setVisible(false);
            this.clearAllButton.setVisible(false);
            this.modeButton.setVisible(false);
            this.playbackControls.setVisible(true);
        }
    }

    private toggleFillMode(): void {
        if (this.mode !== EditorMode.EDIT) return;

        this.fillMode = !this.fillMode;

        const bg = this.fillButton.getAt(0) as Phaser.GameObjects.Rectangle;
        const text = this.fillButton.getAt(1) as Phaser.GameObjects.Text;

        if (this.fillMode) {
            // Entering fill mode
            bg.setFillStyle(0x22c55e); // Green when active
            text.setText('✓ FILL');
            this.fillStartRow = -1;
            this.fillStartCol = -1;
            console.log('🎨 Fill mode ENABLED - click first corner');
        } else {
            // Exiting fill mode
            bg.setFillStyle(0x8b5cf6); // Back to purple
            text.setText('🎨 FILL');
            this.fillStartRow = -1;
            this.fillStartCol = -1;
            if (this.fillPreview) {
                this.fillPreview.destroy();
                this.fillPreview = null;
            }
            console.log('🎨 Fill mode DISABLED');
        }
    }

    private async showQRCode(): Promise<void> {
        if (this.mode !== EditorMode.EDIT) return;

        try {
            console.log('📱 Generating QR code for current map...');

            // Get current grid from GameScene
            const gameScene = this.scene.get('GameScene') as GameScene;
            const grid = gameScene.getCurrentGrid();

            if (!grid || grid.length === 0) {
                console.error('❌ No grid data available');
                return;
            }

            // Compress the map
            const compressed = compressMap(grid);
            console.log(`✅ Compressed map: ${compressed.length} characters`);

            // Generate QR code as data URL
            const qrDataURL = await QRCode.toDataURL(compressed, {
                errorCorrectionLevel: 'L', // Low error correction for max data capacity
                margin: 2,
                width: 512,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            console.log('✅ QR code generated successfully');

            // Show the QR code modal via global function
            (window as any).showQRModal(qrDataURL);

        } catch (error) {
            console.error('❌ Failed to generate QR code:', error);
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

    private clearAll(): void {
        if (this.mode !== EditorMode.EDIT) return;

        const gameScene = this.scene.get('GameScene') as GameScene;
        gameScene.clearAllTiles();

        // Clear undo history since we're starting fresh
        this.editHistory = [];
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

    public isFillMode(): boolean {
        return this.fillMode;
    }

    public handleFillClick(row: number, col: number): void {
        if (!this.fillMode || this.mode !== EditorMode.EDIT) return;

        if (this.fillStartRow === -1 || this.fillStartCol === -1) {
            // First click - set start coordinates
            this.fillStartRow = row;
            this.fillStartCol = col;
            console.log(`🎨 Fill start: (${row}, ${col}) - click second corner`);
        } else {
            // Second click - perform fill
            const gameScene = this.scene.get('GameScene') as GameScene;
            gameScene.fillRectangle(
                this.fillStartRow,
                this.fillStartCol,
                row,
                col,
                this.selectedTile
            );

            // Exit fill mode after completing fill
            this.toggleFillMode();
            console.log(`🎨 Fill complete: (${this.fillStartRow}, ${this.fillStartCol}) to (${row}, ${col})`);
        }
    }

    public updateFillPreview(row: number, col: number): void {
        if (!this.fillMode || this.fillStartRow === -1 || this.fillStartCol === -1) {
            if (this.fillPreview) {
                this.fillPreview.destroy();
                this.fillPreview = null;
            }
            return;
        }

        const gameScene = this.scene.get('GameScene') as GameScene;
        const tileSize = gameScene.getTileSize();

        // Calculate rectangle bounds
        const minRow = Math.min(this.fillStartRow, row);
        const maxRow = Math.max(this.fillStartRow, row);
        const minCol = Math.min(this.fillStartCol, col);
        const maxCol = Math.max(this.fillStartCol, col);

        const x = minCol * tileSize;
        const y = minRow * tileSize;
        const width = (maxCol - minCol + 1) * tileSize;
        const height = (maxRow - minRow + 1) * tileSize;

        const color = COLORS[this.selectedTile] !== undefined ? COLORS[this.selectedTile] : 0xFF00FF;

        if (this.fillPreview) {
            this.fillPreview.setPosition(x + width / 2, y + height / 2);
            this.fillPreview.setSize(width, height);
            this.fillPreview.setFillStyle(color, 0.3); // 30% transparency for preview
        } else {
            this.fillPreview = gameScene.add.rectangle(x + width / 2, y + height / 2, width, height, color, 0.3);
            this.fillPreview.setDepth(998); // Below hover preview but above tiles
        }
    }
}
