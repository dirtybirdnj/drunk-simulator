import Phaser from 'phaser';
import { NPCData } from '../types/NPCData';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private playerArrow!: Phaser.GameObjects.Graphics;
    private playerFacingAngle: number = -Math.PI / 2;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private playerBeerIcon!: Phaser.GameObjects.Sprite;
    private targetPosition: { x: number, y: number } | null = null;
    private targetMarker!: Phaser.GameObjects.Graphics;
    private npcs!: Phaser.Physics.Arcade.Group;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private debugText!: Phaser.GameObjects.Text;
    private beerTaps: Array<{x: number, y: number}> = [];
    private pois: Array<{x: number, y: number}> = []; // Points of Interest
    private barServiceZones: Array<{x: number, y: number, width: number, height: number, tapIndex: number}> = [];
    private bartender!: Phaser.Physics.Arcade.Sprite;
    private bartenderLineGraphics!: Phaser.GameObjects.Graphics;
    private pouringBarGraphics!: Phaser.GameObjects.Graphics;
    private conversationGraphics!: Phaser.GameObjects.Graphics;

    // Map dimensions
    private readonly MAP_COLS = 32;
    private readonly MAP_ROWS = 57;
    private readonly TILE_SIZE = 32;

    // Tile types
    private readonly TILES = {
        STREET: 0,
        BAR_FLOOR: 1,
        PATIO: 2,
        WALL: 3,
        DOOR: 4,
        BAR_COUNTER: 5,
        STAFF_ZONE: 6,
        STAIRS: 7,
        BEER_TAP: 9,
        EMPLOYEE_SPAWN: 10,
        PATRON_SPAWN: 11,
        CAMERA_START: 12,
        POI: 13  // Point of Interest - attracts patrons
    };

    private patronSpawnTimer!: Phaser.Time.TimerEvent;

    private readonly COLORS = {
        [this.TILES.STREET]: 0x707070,      // Grey street
        [this.TILES.BAR_FLOOR]: 0xD2B48C,  // Tan floor
        [this.TILES.PATIO]: 0xA0A0A0,      // Light grey patio
        [this.TILES.WALL]: 0x8B4513,        // Brown walls
        [this.TILES.DOOR]: 0x000000,        // Black doors (passable)
        [this.TILES.BAR_COUNTER]: 0x654321, // Dark brown counter
        [this.TILES.STAFF_ZONE]: 0x4169E1,  // Blue staff area
        [this.TILES.STAIRS]: 0x6B5F47,      // Grey-brown stairs
        [this.TILES.BEER_TAP]: 0xFFFF00     // Yellow beer tap
    };

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // No assets needed - all procedural
    }

    create() {
        // Create static wall group
        this.walls = this.physics.add.staticGroup();

        // Build the entire map
        this.buildMap();

        // Create player sprite (green circle)
        const graphics = this.add.graphics();
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircle(12, 12, 12);
        graphics.generateTexture('player-sprite', 24, 24);
        graphics.destroy();

        // Spawn player at position marked in map (type 8 = player start)
        const startX = (this as any).playerStartX || 512;
        const startY = (this as any).playerStartY || 1008;
        this.player = this.physics.add.sprite(startX, startY, 'player-sprite');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(100);

        // Initialize player data (same as patrons)
        this.player.setData('type', 'player');
        this.player.setData('state', 'idle');  // idle, waiting, has_beer, socializing
        this.player.setData('beerAmount', 0);
        this.player.setData('drinksConsumed', 0);
        this.player.setData('drunkLevel', 0);
        this.player.setData('socialTarget', null);
        this.player.setData('socialStartTime', 0);

        // Player beer icon
        this.playerBeerIcon = this.add.sprite(this.player.x, this.player.y - 20, 'beer-sprite');
        this.playerBeerIcon.setDepth(101);
        this.playerBeerIcon.setVisible(false);

        // Directional arrow
        this.playerArrow = this.add.graphics();
        this.playerArrow.setDepth(101);
        this.updatePlayerArrow();

        // Camera setup - follows player vertically, locked horizontally
        this.cameras.main.setBounds(0, 0, this.MAP_COLS * this.TILE_SIZE, this.MAP_ROWS * this.TILE_SIZE);
        this.cameras.main.startFollow(this.player, false, 0.08, 0.08);

        // Center camera horizontally on the map, vertically on player
        this.cameras.main.scrollX = 0;
        console.log(`📷 Camera following player - starts at player position (${this.player.x}, ${this.player.y})`);

        // Collision
        this.physics.add.collider(this.player, this.walls);

        // Input
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Click/tap target marker
        this.targetMarker = this.add.graphics();
        this.targetMarker.setDepth(99);

        // Click/tap to move
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Convert screen coordinates to world coordinates
            const worldX = pointer.worldX;
            const worldY = pointer.worldY;

            // Set target position
            this.targetPosition = { x: worldX, y: worldY };

            // Draw target marker
            this.drawTargetMarker(worldX, worldY);

            console.log(`🎯 Moving to (${Math.round(worldX)}, ${Math.round(worldY)})`);
        });

        // NPCs
        this.npcs = this.physics.add.group();
        this.physics.add.collider(this.npcs, this.walls);
        this.physics.add.collider(this.npcs, this.npcs);
        this.createNPCs();

        // UI - Instructions removed for cleaner interface
        // const instructions = this.add.text(10, 10, 'ARROWS/CLICK: Move | SPACE: Order Beer | STAFF=Red | PATRONS=Orange', {
        //     fontSize: '14px',
        //     color: '#fff',
        //     backgroundColor: '#000',
        //     padding: { x: 8, y: 5 }
        // });
        // instructions.setScrollFactor(0);

        // Debug text - disabled for production
        // this.debugText = this.add.text(10, 50, '', {
        //     fontSize: '12px',
        //     color: '#00ff00',
        //     backgroundColor: '#000',
        //     padding: { x: 8, y: 5 },
        //     fontFamily: 'monospace'
        // });
        // this.debugText.setScrollFactor(0);
        // this.debugText.setDepth(1000);

        // Graphics for bartender line and pouring bar
        this.bartenderLineGraphics = this.add.graphics();
        this.bartenderLineGraphics.setDepth(500);

        this.pouringBarGraphics = this.add.graphics();
        this.pouringBarGraphics.setDepth(500);

        // Graphics for patron conversations
        this.conversationGraphics = this.add.graphics();
        this.conversationGraphics.setDepth(500);

        // Spawn initial patrons immediately
        for (let i = 0; i < 3; i++) {
            this.spawnPatron();
        }

        // Start patron spawning timer - spawn every 2 seconds
        this.patronSpawnTimer = this.time.addEvent({
            delay: 2000,  // Reduced from 5000
            callback: this.spawnPatron,
            callbackScope: this,
            loop: true
        });
    }

    private buildMap() {
        // ============================================================
        // HOW TO UPDATE THIS MAP:
        // 1. Open http://localhost:3000/map-editor.html
        // 2. Design your map using the visual editor
        // 3. Click the blue "Copy Map" button
        // 4. Search for "PASTE MAP HERE" in this file
        // 5. Select the entire map array and paste
        // 6. Save - Vite will auto-reload!
        // ============================================================

        // PASTE MAP HERE - Replace this entire array with map editor output
const map: number[][] = [
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,2,2,2,2,5,6,6,9,5,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
    [3,2,2,2,2,5,6,6,6,5,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
    [3,2,2,2,2,5,5,5,5,5,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
    [3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
    [3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
    [3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
    [3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
    [3,3,3,3,3,3,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [3,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [3,6,6,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [9,6,6,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,5,5,5,5,5,5,5,5,3],
    [3,6,10,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,6,6,6,6,6,6,6,6,3],
    [3,6,6,5,1,1,1,1,1,1,1,1,1,1,13,1,1,1,1,1,1,1,5,6,10,6,6,6,6,6,6,3],
    [3,6,6,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,6,6,3,3,9,3,3,3,3],
    [9,6,10,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,6,6,3,3,3,3,3,3,3],
    [3,6,6,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,6,6,3,3,3,3,3,3,3],
    [3,6,6,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,6,6,3,3,3,3,3,3,3],
    [3,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,6,6,3,3,3,3,3,3,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,10,6,6,3,3,3,3,3,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,6,6,6,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,7,7,7,7,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,3,7,7,7,7,3,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,3,7,7,7,7,3,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,3,7,7,7,7,3,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,13,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
    [0,0,0,0,0,0,0,0,11,0,0,0,0,0,11,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0],
    [11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

        // Find player start position (marked with 8)
        let playerStartCol = 16;
        let playerStartRow = 31;
        let foundMarker = false;

        for (let row = 0; row < this.MAP_ROWS; row++) {
            for (let col = 0; col < this.MAP_COLS; col++) {
                if (map[row][col] === 8) {
                    playerStartCol = col;
                    playerStartRow = row;
                    foundMarker = true;
                    console.log(`🟢 Found player start marker at row ${row}, col ${col}`);
                }
            }
        }

        if (!foundMarker) {
            console.warn('⚠️ No player start marker (8) found in map! Using default position.');
        }

        // Store for player spawn
        (this as any).playerStartX = playerStartCol * this.TILE_SIZE + 16;
        (this as any).playerStartY = playerStartRow * this.TILE_SIZE + 16;

        console.log(`🎯 Player will spawn at pixel (${(this as any).playerStartX}, ${(this as any).playerStartY})`);
        console.log(`📍 That's grid position (${playerStartCol}, ${playerStartRow})`);

        // Render the map
        for (let row = 0; row < this.MAP_ROWS; row++) {
            for (let col = 0; col < this.MAP_COLS; col++) {
                let tileType = map[row][col];

                // Store beer tap locations (can be multiple)
                if (tileType === this.TILES.BEER_TAP) {
                    this.beerTaps.push({
                        x: col * this.TILE_SIZE + 16,
                        y: row * this.TILE_SIZE + 16
                    });
                }

                // Store employee spawn locations
                if (tileType === this.TILES.EMPLOYEE_SPAWN) {
                    if (!(this as any).employeeSpawns) {
                        (this as any).employeeSpawns = [];
                    }
                    (this as any).employeeSpawns.push({
                        x: col * this.TILE_SIZE + 16,
                        y: row * this.TILE_SIZE + 16
                    });
                }

                // Store patron spawn locations
                if (tileType === this.TILES.PATRON_SPAWN) {
                    if (!(this as any).patronSpawns) {
                        (this as any).patronSpawns = [];
                    }
                    (this as any).patronSpawns.push({
                        x: col * this.TILE_SIZE + 16,
                        y: row * this.TILE_SIZE + 16
                    });
                }

                // Store camera start location
                if (tileType === this.TILES.CAMERA_START) {
                    (this as any).cameraStartX = col * this.TILE_SIZE + 16;
                    (this as any).cameraStartY = row * this.TILE_SIZE + 16;
                    console.log(`📷 Camera start marker found at (${col * this.TILE_SIZE + 16}, ${row * this.TILE_SIZE + 16})`);
                }

                // Store POI locations
                if (tileType === this.TILES.POI) {
                    this.pois.push({
                        x: col * this.TILE_SIZE + 16,
                        y: row * this.TILE_SIZE + 16
                    });
                    console.log(`🎯 POI #${this.pois.length - 1} at (${col * this.TILE_SIZE + 16}, ${row * this.TILE_SIZE + 16})`);
                }

                // Detect bar counters and create service zones (patrons stand adjacent to counter)
                if (tileType === this.TILES.BAR_COUNTER) {
                    // Check if there's a floor tile to the left (service zone)
                    if (col > 0 && map[row][col - 1] === this.TILES.BAR_FLOOR) {
                        this.barServiceZones.push({
                            x: (col - 1) * this.TILE_SIZE,
                            y: row * this.TILE_SIZE,
                            width: this.TILE_SIZE,
                            height: this.TILE_SIZE,
                            tapIndex: -1  // Will be assigned in second pass
                        });
                    }
                    // Check if there's a floor tile to the right
                    if (col < this.MAP_COLS - 1 && map[row][col + 1] === this.TILES.BAR_FLOOR) {
                        this.barServiceZones.push({
                            x: (col + 1) * this.TILE_SIZE,
                            y: row * this.TILE_SIZE,
                            width: this.TILE_SIZE,
                            height: this.TILE_SIZE,
                            tapIndex: -1  // Will be assigned in second pass
                        });
                    }
                }

                // Render special markers as their base tiles
                if (tileType === 8) tileType = 0;  // Player start renders as street
                if (tileType === 10) tileType = 6; // Employee spawn renders as staff zone
                if (tileType === 11) tileType = 0; // Patron spawn renders as street
                if (tileType === 12) tileType = 0; // Camera start renders as street
                if (tileType === 13) tileType = 1; // POI renders as bar floor
                this.addTile(col, row, tileType);
            }
        }

        // Second pass: Assign each service zone to its nearest beer tap
        this.barServiceZones.forEach((zone) => {
            let closestTapIndex = 0;
            let closestDist = Infinity;

            this.beerTaps.forEach((tap, index) => {
                const dx = (zone.x + zone.width / 2) - tap.x;
                const dy = (zone.y + zone.height / 2) - tap.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < closestDist) {
                    closestDist = dist;
                    closestTapIndex = index;
                }
            });

            zone.tapIndex = closestTapIndex;
        });

        console.log(`📍 Created ${this.barServiceZones.length} bar service zones:`);
        this.barServiceZones.forEach((zone, i) => {
            const gridX = zone.x / this.TILE_SIZE;
            const gridY = zone.y / this.TILE_SIZE;
            console.log(`  Zone ${i}: Grid(${gridX},${gridY}) Pixel(${zone.x},${zone.y}) → Tap ${zone.tapIndex}`);
        });
    }

    private addTile(col: number, row: number, tileType: number) {
        const x = col * this.TILE_SIZE;
        const y = row * this.TILE_SIZE;

        // Draw tile
        const graphics = this.add.graphics();
        graphics.fillStyle(this.COLORS[tileType], 1);
        graphics.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
        graphics.setDepth(0);

        // Add collision for walls, bar counter, and beer taps
        if (tileType === this.TILES.WALL || tileType === this.TILES.BAR_COUNTER || tileType === this.TILES.BEER_TAP) {
            const collider = this.walls.create(x + 16, y + 16, undefined);
            collider.setSize(32, 32);
            collider.setOrigin(0.5, 0.5);
            collider.refreshBody();
            collider.setVisible(false);
        }
    }

    private createNPCs() {
        // Orange patrons
        const patronGraphics = this.add.graphics();
        patronGraphics.fillStyle(0xffa500, 1);
        patronGraphics.fillCircle(10, 10, 10);
        patronGraphics.generateTexture('patron-sprite', 20, 20);
        patronGraphics.destroy();

        // Red staff
        const staffGraphics = this.add.graphics();
        staffGraphics.fillStyle(0xff0000, 1);
        staffGraphics.fillCircle(10, 10, 10);
        staffGraphics.generateTexture('staff-sprite', 20, 20);
        staffGraphics.destroy();

        // Beer emoji 🍺
        const beerGraphics = this.add.graphics();
        beerGraphics.fillStyle(0xFFD700, 1); // Gold
        beerGraphics.fillRect(0, 2, 12, 10);
        beerGraphics.fillStyle(0xFFFFFF, 0.8); // Foam
        beerGraphics.fillRect(0, 0, 12, 3);
        beerGraphics.generateTexture('beer-sprite', 12, 12);
        beerGraphics.destroy();

        // Patrons will now spawn dynamically via timer

        // Spawn bartenders at employee spawn locations - one bartender per spawn point
        const employeeSpawns = (this as any).employeeSpawns || [];
        if (employeeSpawns.length > 0) {
            employeeSpawns.forEach((spawn: {x: number, y: number}, index: number) => {
                const bartender = this.npcs.create(spawn.x, spawn.y, 'staff-sprite');
                bartender.setDepth(50);
                bartender.setCollideWorldBounds(true);
                bartender.setData('type', 'staff');
                bartender.setData('state', 'idle');  // idle, pouring, serving
                bartender.setData('hasBeer', false);
                bartender.setData('pourTimer', 0);
                bartender.setData('target', null);
                bartender.setData('facingAngle', 0);  // Direction bartender faces
                bartender.setData('barIndex', index);  // Which bar this bartender works at
                console.log(`👔 Bartender ${index} spawned at (${Math.round(spawn.x)}, ${Math.round(spawn.y)})`);
            });
            console.log(`👔 Spawned ${employeeSpawns.length} bartenders total`);
        } else {
            console.warn('⚠️ No employee spawn points found!');
        }

        // Add collision between NPCs and walls
        this.physics.add.collider(this.npcs, this.walls);
    }

    private spawnPatron() {
        const patronSpawns = (this as any).patronSpawns || [];

        if (patronSpawns.length === 0) {
            console.warn('⚠️ No patron spawn points found! Add patron spawn tile (type 11) to the map.');
            return;
        }

        // Pick a random spawn point
        const spawn = patronSpawns[Math.floor(Math.random() * patronSpawns.length)];

        const npc = this.npcs.create(spawn.x, spawn.y, 'patron-sprite');
        npc.setDepth(50);
        npc.setCollideWorldBounds(true);
        npc.setData('type', 'patron');
        npc.setData('drinksWanted', 3);       // Want 3 beers total
        npc.setData('drinksConsumed', 0);     // Haven't drunk any yet
        npc.setData('drunkLevel', 0);         // 0-100+ scale (0 = sober, 100+ = very drunk)
        npc.setData('state', 'following_poi'); // following_poi, thirsty, waiting, has_beer, socializing
        npc.setData('beerAmount', 0);         // 0-100 (100 = full beer)
        npc.setData('socialTarget', null);    // Which patron they're talking to
        npc.setData('socialStartTime', 0);    // When they started talking
        npc.setData('wanderTarget', null);    // Wander destination
        npc.setData('visitedPois', []);       // Array of visited POI indices
        npc.setData('waitStartTime', 0);      // When started waiting for bartender

        // Add beer icon (hidden initially)
        const beerIcon = this.add.sprite(npc.x, npc.y - 20, 'beer-sprite');
        beerIcon.setDepth(51);
        beerIcon.setVisible(false);
        npc.setData('beerIcon', beerIcon);

        console.log(`🚶 New patron spawned at (${Math.round(spawn.x)}, ${Math.round(spawn.y)})`);
    }

    update() {
        if (!this.player) return;

        // Lock camera horizontally
        this.cameras.main.scrollX = 0;

        const playerState = this.player.getData('state');
        const socialTarget = this.player.getData('socialTarget');

        // Player movement
        const speed = 220;  // Increased from 160
        this.player.setVelocity(0);

        // Check if using keyboard controls
        const usingKeyboard = this.cursors.left.isDown || this.cursors.right.isDown ||
                             this.cursors.up.isDown || this.cursors.down.isDown;

        if (usingKeyboard) {
            // Keyboard controls - cancel any click target
            this.targetPosition = null;
            this.targetMarker.clear();

            if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
            if (this.cursors.right.isDown) this.player.setVelocityX(speed);
            if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
            if (this.cursors.down.isDown) this.player.setVelocityY(speed);

            // Normalize diagonal
            if (this.player.body!.velocity.x !== 0 && this.player.body!.velocity.y !== 0) {
                this.player.body!.velocity.normalize().scale(speed);
            }
        } else if (this.targetPosition) {
            // Click/tap movement - move toward target
            const dx = this.targetPosition.x - this.player.x;
            const dy = this.targetPosition.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Check if reached target (within 10px)
            if (dist < 10) {
                this.targetPosition = null;
                this.targetMarker.clear();
                this.player.setVelocity(0);
            } else {
                // Move toward target
                this.player.setVelocity(
                    (dx / dist) * speed,
                    (dy / dist) * speed
                );
            }
        }

        // Check if player moved during conversation - break it
        if (playerState === 'socializing' && (this.player.body!.velocity.x !== 0 || this.player.body!.velocity.y !== 0)) {
            console.log('💔 Player moved, breaking conversation');

            // Calculate partial beer consumption based on time elapsed
            const socialStartTime = this.player.getData('socialStartTime');
            const elapsed = Date.now() - socialStartTime;
            const percentComplete = Math.min(1, elapsed / 10000);
            const beerConsumed = 25 * percentComplete;

            const currentBeer = this.player.getData('beerAmount');
            this.player.setData('beerAmount', Math.max(0, currentBeer - beerConsumed));

            console.log(`🍺 Conversation ${Math.round(percentComplete * 100)}% complete, consumed ${beerConsumed.toFixed(1)}% beer`);

            // Reset both player and patron
            this.player.setData('state', 'has_beer');
            this.player.setData('socialTarget', null);

            if (socialTarget && socialTarget.active) {
                socialTarget.setData('state', 'has_beer');
                socialTarget.setData('socialTarget', null);
            }
        }

        // Update facing direction based on movement or conversation
        if (playerState === 'socializing' && socialTarget && socialTarget.active) {
            // Point toward conversation partner
            const dx = socialTarget.x - this.player.x;
            const dy = socialTarget.y - this.player.y;
            this.playerFacingAngle = Math.atan2(dy, dx);
        } else if (this.player.body!.velocity.x !== 0 || this.player.body!.velocity.y !== 0) {
            // Point in movement direction
            this.playerFacingAngle = Math.atan2(this.player.body!.velocity.y, this.player.body!.velocity.x);
        }

        this.updatePlayerArrow();

        // Update player beer icon position
        if (this.playerBeerIcon) {
            this.playerBeerIcon.setPosition(this.player.x, this.player.y - 20);
        }

        // Space key to order drink
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (playerState === 'idle') {
                this.player.setData('state', 'waiting');
                console.log('🙋 Player is waiting for a drink');
            }
        }

        // Check if player's beer is empty
        const beerAmount = this.player.getData('beerAmount');
        if (beerAmount <= 0 && playerState === 'has_beer') {
            this.playerBeerIcon.setVisible(false);
            this.player.setData('state', 'idle');
            const drinksConsumed = this.player.getData('drinksConsumed') + 1;
            const drunkLevel = this.player.getData('drunkLevel') + 6;
            this.player.setData('drinksConsumed', drinksConsumed);
            this.player.setData('drunkLevel', drunkLevel);
            console.log(`🍻 Player finished beer #${drinksConsumed}! Drunk level: ${drunkLevel}%`);
        }

        // Debug - disabled for production
        // const col = Math.floor(this.player.x / 32);
        // const row = Math.floor(this.player.y / 32);
        // this.debugText.setText(`Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)}) | Grid: (${col}, ${row}) | State: ${playerState} | Beer: ${Math.round(beerAmount)}%`);

        // NPC AI
        this.updateNPCAI();
    }

    private updateNPCAI() {
        const npcSpeed = 140;     // Increased from 80
        const BEER_ABV = 6;  // 6% alcohol by volume (standard beer)
        const DRINK_TIME_MS = 30000;  // 30 seconds to drink a beer

        // Patron AI - move thirsty patrons toward bar
        this.npcs.children.entries.forEach((npc: any) => {
            if (npc.getData('type') === 'patron') {
                const state = npc.getData('state');
                const drinksWanted = npc.getData('drinksWanted');
                const drinksConsumed = npc.getData('drinksConsumed');
                const drunkLevel = npc.getData('drunkLevel');

                // Update beer icon position to follow patron
                const beerIcon = npc.getData('beerIcon');
                if (beerIcon) {
                    beerIcon.setPosition(npc.x, npc.y - 20);
                }

                if (state === 'following_poi') {
                    const visitedPois = npc.getData('visitedPois') || [];

                    // Visit at least 2 POIs (or all if less than 2)
                    const requiredVisits = Math.min(2, this.pois.length);
                    if (visitedPois.length >= requiredVisits) {
                        npc.setData('state', 'thirsty');
                        console.log(`✅ Patron visited ${visitedPois.length} POIs, now thirsty`);
                        return;
                    }

                    // Find closest unvisited POI
                    let closestPoi: {x: number, y: number} | null = null;
                    let closestDist = Infinity;
                    let closestIndex = -1;

                    this.pois.forEach((poi, index) => {
                        if (!visitedPois.includes(index)) {
                            const dx = poi.x - npc.x;
                            const dy = poi.y - npc.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < closestDist) {
                                closestDist = dist;
                                closestPoi = {x: poi.x, y: poi.y};
                                closestIndex = index;
                            }
                        }
                    });

                    if (!closestPoi) {
                        npc.setData('state', 'thirsty');
                        return;
                    }

                    // Move toward closest unvisited POI
                    const poi = closestPoi as {x: number, y: number};
                    const poiX = poi.x;
                    const poiY = poi.y;
                    const dx = poiX - npc.x;
                    const dy = poiY - npc.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    const separation = this.getSeparationForce(npc, drunkLevel);
                    const moveX = (dx / dist) * npcSpeed + separation.x;
                    const moveY = (dy / dist) * npcSpeed + separation.y;

                    // Check if reached POI (within 64px)
                    if (dist < 64) {
                        visitedPois.push(closestIndex);
                        npc.setData('visitedPois', visitedPois);
                        console.log(`🎯 Patron reached POI ${closestIndex}`);
                    } else {
                        npc.setVelocity(moveX, moveY);
                    }
                } else if (state === 'thirsty') {
                    // Only go to bar if they want more drinks
                    if (drinksConsumed < drinksWanted) {
                        // Find closest bar service zone
                        let closestZone: {x: number, y: number, width: number, height: number} | null = null;
                        let closestDist = Infinity;

                        this.barServiceZones.forEach(zone => {
                            const zoneCenterX = zone.x + zone.width / 2;
                            const zoneCenterY = zone.y + zone.height / 2;
                            const dx = zoneCenterX - npc.x;
                            const dy = zoneCenterY - npc.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < closestDist) {
                                closestDist = dist;
                                closestZone = {x: zone.x, y: zone.y, width: zone.width, height: zone.height};
                            }
                        });

                        if (closestZone) {
                            const zone = closestZone as {x: number, y: number, width: number, height: number};
                            const zoneX = zone.x;
                            const zoneY = zone.y;
                            const zoneWidth = zone.width;
                            const zoneHeight = zone.height;
                            const zoneCenterX = zoneX + zoneWidth / 2;
                            const zoneCenterY = zoneY + zoneHeight / 2;

                            let dx = zoneCenterX - npc.x;
                            let dy = zoneCenterY - npc.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            // Apply separation force
                            const separation = this.getSeparationForce(npc, drunkLevel);
                            dx += separation.x;
                            dy += separation.y;

                            // Normalize and apply speed
                            const newDist = Math.sqrt(dx * dx + dy * dy);
                            if (newDist > 0.1) {
                                dx = (dx / newDist) * npcSpeed;
                                dy = (dy / newDist) * npcSpeed;
                            }

                            // Check if actually inside service zone boundaries
                            const inServiceZone = this.barServiceZones.some(zone =>
                                npc.x >= zone.x && npc.x < zone.x + zone.width &&
                                npc.y >= zone.y && npc.y < zone.y + zone.height
                            );

                            if (inServiceZone) {
                                npc.setVelocity(0, 0);
                                npc.setData('state', 'waiting');
                                npc.setData('waitStartTime', Date.now());
                                const patronX = Math.round(npc.x);
                                const patronY = Math.round(npc.y);
                                console.log(`🚶 Patron entered service zone @ (${patronX},${patronY}), now waiting`);
                            } else {
                                npc.setVelocity(dx, dy);
                            }
                        }
                    } else {
                        // Done drinking - just stand around
                        npc.setVelocity(0, 0);
                    }
                } else if (state === 'waiting') {
                    // Patrons waiting for service must stand STILL in service zone
                    npc.setVelocity(0, 0);

                    // Check if waited too long (10 seconds)
                    const waitStartTime = npc.getData('waitStartTime');
                    if (!waitStartTime) {
                        npc.setData('waitStartTime', Date.now());
                    } else if (Date.now() - waitStartTime > 10000) {
                        console.log('⏰ Patron waited 10s, seeking another bar');
                        npc.setData('state', 'thirsty');
                        npc.setData('waitStartTime', 0);
                        return;
                    }
                } else if (state === 'has_beer') {
                    // Patron has beer - wander around looking for other patrons to talk to
                    const beerAmount = npc.getData('beerAmount');

                    // Check if beer is empty
                    if (beerAmount <= 0) {
                        // Hide beer icon
                        if (beerIcon) {
                            beerIcon.setVisible(false);
                        }

                        // Increment drinks consumed and drunk level
                        const newDrinksConsumed = drinksConsumed + 1;
                        const newDrunkLevel = drunkLevel + BEER_ABV;
                        npc.setData('drinksConsumed', newDrinksConsumed);
                        npc.setData('drunkLevel', newDrunkLevel);

                        console.log(`🍻 Patron finished beer #${newDrinksConsumed}! Drunk level: ${newDrunkLevel}%`);

                        // Check if they want more drinks
                        if (newDrinksConsumed < drinksWanted) {
                            console.log(`🍺 Patron wants more! (${newDrinksConsumed}/${drinksWanted} beers) → Going to bar`);
                            npc.setData('state', 'thirsty');
                        } else {
                            console.log(`✅ Patron satisfied! (${newDrinksConsumed}/${drinksWanted} beers complete)`);
                            npc.setData('state', 'satisfied');
                        }
                    } else {
                        // Look for player or other patrons to socialize with
                        let closestTarget: any = null;
                        let closestDist = Infinity;

                        // Check if player has beer and is available for conversation
                        const playerState = this.player.getData('state');
                        if (playerState === 'has_beer' || playerState === 'idle') {
                            const dx = this.player.x - npc.x;
                            const dy = this.player.y - npc.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            // Only target player within 5 tiles (160px)
                            if (dist < 160) {
                                closestDist = dist;
                                closestTarget = this.player;
                            }
                        }

                        // Also check other patrons
                        this.npcs.children.entries.forEach((other: any) => {
                            if (other === npc) return;
                            if (other.getData('type') !== 'patron') return;
                            if (other.getData('state') === 'thirsty') return;
                            if (other.getData('state') === 'waiting') return;

                            const dx = other.x - npc.x;
                            const dy = other.y - npc.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            // Only target other patrons within 5 tiles (160px)
                            if (dist < closestDist && dist < 160) {
                                closestDist = dist;
                                closestTarget = other;
                            }
                        });

                        // Must be within 1.5 tiles (48px) to start conversation
                        if (closestTarget && closestDist < 48) {
                            // Close enough to start talking
                            npc.setVelocity(0, 0);
                            npc.setData('state', 'socializing');
                            npc.setData('socialTarget', closestTarget);
                            npc.setData('socialStartTime', Date.now());

                            // If talking to player, set player to socializing too
                            if (closestTarget === this.player) {
                                this.player.setData('state', 'socializing');
                                this.player.setData('socialTarget', npc);
                                this.player.setData('socialStartTime', Date.now());
                                console.log(`💬 Patron started conversation with PLAYER! Both beers will drain over 10 seconds`);
                            } else {
                                console.log(`💬 Patron started conversation! Beer: ${beerAmount}% → Will consume 25% over 10 seconds`);
                            }
                        } else if (closestTarget) {
                            // Move toward target to talk
                            const dx = closestTarget.x - npc.x;
                            const dy = closestTarget.y - npc.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            // Apply separation force
                            const separation = this.getSeparationForce(npc, drunkLevel);
                            const moveX = (dx / dist) * npcSpeed + separation.x;
                            const moveY = (dy / dist) * npcSpeed + separation.y;

                            npc.setVelocity(moveX, moveY);
                        } else {
                            // No patron nearby - wander around
                            let wanderTarget = npc.getData('wanderTarget');

                            // Create or check wander target
                            if (!wanderTarget || Math.abs(npc.x - wanderTarget.x) < 30 && Math.abs(npc.y - wanderTarget.y) < 30) {
                                // Pick random spot near the bar area (limited range)
                                // Bar main area: rows 6-22, cols 1-21 (stay near the bar, not far corners)
                                wanderTarget = {
                                    x: (2 + Math.random() * 18) * this.TILE_SIZE + 16,
                                    y: (8 + Math.random() * 13) * this.TILE_SIZE + 16
                                };
                                npc.setData('wanderTarget', wanderTarget);
                            }

                            // Move toward wander target
                            const dx = wanderTarget.x - npc.x;
                            const dy = wanderTarget.y - npc.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist > 0.1) {
                                // Apply separation force
                                const separation = this.getSeparationForce(npc, drunkLevel);
                                const moveX = (dx / dist) * npcSpeed + separation.x;
                                const moveY = (dy / dist) * npcSpeed + separation.y;

                                npc.setVelocity(moveX, moveY);
                            }
                        }
                    }
                } else if (state === 'socializing') {
                    npc.setVelocity(0, 0);
                    const socialStartTime = npc.getData('socialStartTime');
                    const socialTarget = npc.getData('socialTarget');

                    // Check if conversation partner moved away (only applies to player)
                    if (socialTarget === this.player && this.player.getData('state') !== 'socializing') {
                        console.log('💔 Player broke conversation');
                        npc.setData('state', 'has_beer');
                        npc.setData('socialTarget', null);
                        return; // Exit early
                    }

                    // Check if 10 seconds have passed
                    if (Date.now() - socialStartTime > 10000) {
                        // Consume 1/4 of drink (25%)
                        const currentBeerAmount = npc.getData('beerAmount');
                        const newBeerAmount = Math.max(0, currentBeerAmount - 25);
                        npc.setData('beerAmount', newBeerAmount);

                        console.log(`💬 Conversation ended! Beer: ${currentBeerAmount}% → ${newBeerAmount}% (consumed 25%)`);

                        if (newBeerAmount <= 0) {
                            console.log('🍺 Beer is now empty! Will return to thirsty state.');
                        }

                        // If talking to player, reset player too
                        if (socialTarget === this.player) {
                            const playerBeer = this.player.getData('beerAmount');
                            this.player.setData('beerAmount', Math.max(0, playerBeer - 25));
                            this.player.setData('state', 'has_beer');
                            this.player.setData('socialTarget', null);
                            console.log(`🍺 Player's beer: ${playerBeer}% → ${Math.max(0, playerBeer - 25)}%`);
                        }

                        // Return to has_beer state to find another patron or go get more beer
                        npc.setData('state', 'has_beer');
                        npc.setData('socialTarget', null);
                    }
                }
            }
        });

        // Bartender AI - iterate through all bartenders
        this.npcs.children.entries.forEach((bartender: any) => {
            if (bartender.getData('type') !== 'staff') return;

            const bartenderState = bartender.getData('state');

            if (bartenderState === 'idle') {
                // Get this bartender's bar index (which tap they work at)
                const bartenderBarIndex = bartender.getData('barIndex');

                // Find closest waiting customer in THIS bartender's service zones only
                const allWaitingCustomers: any[] = [];
                let totalWaiting = 0;

                // Check player
                if (this.player.getData('state') === 'waiting') {
                    totalWaiting++;
                    // Check if player is in a service zone that belongs to THIS bartender
                    const inServiceZone = this.barServiceZones.some(zone =>
                        zone.tapIndex === bartenderBarIndex &&
                        this.player.x >= zone.x && this.player.x < zone.x + zone.width &&
                        this.player.y >= zone.y && this.player.y < zone.y + zone.height
                    );

                    if (inServiceZone) {
                        const dx = this.player.x - bartender.x;
                        const dy = this.player.y - bartender.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        const alreadyBeingServed = this.npcs.children.entries.some((b: any) =>
                            b.getData('type') === 'staff' &&
                            b.getData('target') === this.player &&
                            b !== bartender
                        );

                        if (!alreadyBeingServed) {
                            allWaitingCustomers.push({ entity: this.player, dist });
                            console.log(`✓ Bartender ${bartenderBarIndex}: Player in my service zone @ (${Math.round(this.player.x)},${Math.round(this.player.y)})`);
                        }
                    }
                }

                // Check patrons in THIS bartender's service zones
                this.npcs.children.entries.forEach((npc: any) => {
                    if (npc.getData('type') !== 'patron') return;
                    if (npc.getData('state') !== 'waiting') return;

                    totalWaiting++;
                    // Check if patron is in a service zone that belongs to THIS bartender
                    const inServiceZone = this.barServiceZones.some(zone =>
                        zone.tapIndex === bartenderBarIndex &&
                        npc.x >= zone.x && npc.x < zone.x + zone.width &&
                        npc.y >= zone.y && npc.y < zone.y + zone.height
                    );

                    if (inServiceZone) {
                        const dx = npc.x - bartender.x;
                        const dy = npc.y - bartender.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        const alreadyBeingServed = this.npcs.children.entries.some((b: any) =>
                            b.getData('type') === 'staff' &&
                            b.getData('target') === npc &&
                            b !== bartender
                        );

                        if (!alreadyBeingServed) {
                            allWaitingCustomers.push({ entity: npc, dist });
                        }
                    }
                });

                if (totalWaiting > 0) {
                    console.log(`🔍 Bartender found ${totalWaiting} total waiting, ${allWaitingCustomers.length} in service zones`);
                }

                // Serve closest customer in service zone
                if (allWaitingCustomers.length > 0) {
                    allWaitingCustomers.sort((a, b) => a.dist - b.dist);
                    const closestCustomer = allWaitingCustomers[0].entity;

                    const customerType = closestCustomer.getData('type');
                    const custX = Math.round(closestCustomer.x);
                    const custY = Math.round(closestCustomer.y);
                    const dist = Math.round(allWaitingCustomers[0].dist);
                    console.log(`🎯 Bartender serving closest: ${customerType} @ (${custX},${custY}) dist=${dist}px`);
                    bartender.setData('state', 'going_to_tap');
                    bartender.setData('target', closestCustomer);
                }
            } else if (bartenderState === 'going_to_tap') {
                // Find closest beer tap
                let closestTap = this.beerTaps[0];
                let closestDist = Infinity;
                this.beerTaps.forEach(tap => {
                    const dist = Math.sqrt(
                        Math.pow(tap.x - bartender.x, 2) +
                        Math.pow(tap.y - bartender.y, 2)
                    );
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestTap = tap;
                    }
                });

                // Move to closest tap
                const dx = closestTap.x - bartender.x;
                const dy = closestTap.y - bartender.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 30) {
                    bartender.setVelocity(
                        (dx / dist) * npcSpeed,
                        (dy / dist) * npcSpeed
                    );
                } else {
                    // Close enough to tap
                    bartender.setVelocity(0, 0);
                    bartender.setData('state', 'pouring');
                    bartender.setData('pourTimer', Date.now() + 4000);
                    console.log('🍺 Bartender reached tap, starting to pour (4 seconds)');
                }
            } else if (bartenderState === 'pouring') {
                bartender.setVelocity(0, 0);
                if (Date.now() > bartender.getData('pourTimer')) {
                    bartender.setData('state', 'serving');
                    bartender.setData('hasBeer', true);
                    console.log('🍺 Bartender finished pouring, now serving');
                }
            } else if (bartenderState === 'serving') {
                const target = bartender.getData('target');
                if (target && target.active && target.getData('state') === 'waiting') {
                    const dx = target.x - bartender.x;
                    const dy = target.y - bartender.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Bartenders can serve patrons up to 2 tiles away (64px)
                    if (dist <= 64) {
                        bartender.setVelocity(0, 0);
                        target.setData('state', 'has_beer');
                        target.setData('beerAmount', 100);
                        target.setData('waitStartTime', 0); // Reset wait timer!

                        // Show beer icon
                        if (target === this.player) {
                            this.playerBeerIcon.setVisible(true);
                            console.log('🍺 Bartender delivered beer to PLAYER!');
                        } else {
                            const beerIcon = target.getData('beerIcon');
                            if (beerIcon) {
                                beerIcon.setVisible(true);
                                console.log('🍺 Bartender delivered beer to patron!');
                            }
                        }

                        bartender.setData('hasBeer', false);
                        bartender.setData('target', null);
                        bartender.setData('state', 'idle');
                    } else {
                        // Move closer to patron
                        const separation = this.getSeparationForce(bartender, 0);
                        bartender.setVelocity(
                            (dx / dist) * npcSpeed + separation.x,
                            (dy / dist) * npcSpeed + separation.y
                        );
                    }
                } else {
                    bartender.setData('state', 'idle');
                }
            }
        });

        // Visual feedback for bartenders
        this.bartenderLineGraphics.clear();
        this.pouringBarGraphics.clear();

        this.npcs.children.entries.forEach((bartender: any) => {
            if (bartender.getData('type') !== 'staff') return;

            const bartenderState = bartender.getData('state');

            if (bartenderState === 'pouring' || bartenderState === 'serving') {
                const target = bartender.getData('target');
                if (target && target.active) {
                    // Draw orange line from bartender to patron
                    this.bartenderLineGraphics.lineStyle(3, 0xFF8C00, 1);
                    this.bartenderLineGraphics.beginPath();
                    this.bartenderLineGraphics.moveTo(bartender.x, bartender.y);
                    this.bartenderLineGraphics.lineTo(target.x, target.y);
                    this.bartenderLineGraphics.strokePath();
                }
            }

            if (bartenderState === 'pouring') {
                const pourTimer = bartender.getData('pourTimer');
                const progress = Math.max(0, Math.min(1, (4000 - (pourTimer - Date.now())) / 4000));

                // Draw progress bar above bartender
                const barWidth = 60;
                const barHeight = 8;
                const barX = bartender.x - barWidth / 2;
                const barY = bartender.y - 30;

                // Background (grey)
                this.pouringBarGraphics.fillStyle(0x555555, 1);
                this.pouringBarGraphics.fillRect(barX, barY, barWidth, barHeight);

                // Progress (gold for beer)
                this.pouringBarGraphics.fillStyle(0xFFD700, 1);
                this.pouringBarGraphics.fillRect(barX, barY, barWidth * progress, barHeight);

                // Border (white)
                this.pouringBarGraphics.lineStyle(2, 0xFFFFFF, 1);
                this.pouringBarGraphics.strokeRect(barX, barY, barWidth, barHeight);
            }
        });

        // Visual feedback for patron conversations
        this.conversationGraphics.clear();

        // Draw player conversations
        const playerState = this.player.getData('state');
        const playerSocialTarget = this.player.getData('socialTarget');

        if (playerState === 'socializing' && playerSocialTarget && playerSocialTarget.active) {
            const socialStartTime = this.player.getData('socialStartTime');

            // Draw dark red line from player to patron
            this.conversationGraphics.lineStyle(3, 0x8B0000, 1);
            this.conversationGraphics.beginPath();
            this.conversationGraphics.moveTo(this.player.x, this.player.y);
            this.conversationGraphics.lineTo(playerSocialTarget.x, playerSocialTarget.y);
            this.conversationGraphics.strokePath();

            // Draw progress bar above player
            const elapsed = Date.now() - socialStartTime;
            const progress = Math.min(1, elapsed / 10000);

            const barWidth = 50;
            const barHeight = 6;
            const barX = this.player.x - barWidth / 2;
            const barY = this.player.y - 25;

            this.conversationGraphics.fillStyle(0x333333, 1);
            this.conversationGraphics.fillRect(barX, barY, barWidth, barHeight);

            this.conversationGraphics.fillStyle(0x8B0000, 1);
            this.conversationGraphics.fillRect(barX, barY, barWidth * progress, barHeight);

            this.conversationGraphics.lineStyle(1, 0xFFFFFF, 1);
            this.conversationGraphics.strokeRect(barX, barY, barWidth, barHeight);
        }

        // Draw patron conversations
        this.npcs.children.entries.forEach((npc: any) => {
            if (npc.getData('type') === 'patron' && npc.getData('state') === 'socializing') {
                const socialTarget = npc.getData('socialTarget');
                const socialStartTime = npc.getData('socialStartTime');

                if (socialTarget && (socialTarget.active || socialTarget === this.player)) {
                    // Draw dark red line between talking entities
                    this.conversationGraphics.lineStyle(3, 0x8B0000, 1);
                    this.conversationGraphics.beginPath();
                    this.conversationGraphics.moveTo(npc.x, npc.y);
                    this.conversationGraphics.lineTo(socialTarget.x, socialTarget.y);
                    this.conversationGraphics.strokePath();

                    // Draw progress bar above patron showing conversation progress
                    const elapsed = Date.now() - socialStartTime;
                    const progress = Math.min(1, elapsed / 10000);

                    const barWidth = 50;
                    const barHeight = 6;
                    const barX = npc.x - barWidth / 2;
                    const barY = npc.y - 25;

                    this.conversationGraphics.fillStyle(0x333333, 1);
                    this.conversationGraphics.fillRect(barX, barY, barWidth, barHeight);

                    this.conversationGraphics.fillStyle(0x8B0000, 1);
                    this.conversationGraphics.fillRect(barX, barY, barWidth * progress, barHeight);

                    this.conversationGraphics.lineStyle(1, 0xFFFFFF, 1);
                    this.conversationGraphics.strokeRect(barX, barY, barWidth, barHeight);
                }
            }
        });
    }

    private getSeparationForce(npc: any, drunkLevel: number): {x: number, y: number} {
        // Personal space radius decreases as drunk level increases
        // Sober (drunkLevel 0): 60px personal space
        // Drunk (drunkLevel 18): 20px personal space
        const basePersonalSpace = 60;
        const minPersonalSpace = 20;
        const personalSpaceRadius = Math.max(
            minPersonalSpace,
            basePersonalSpace - (drunkLevel * 2)
        );

        let separationX = 0;
        let separationY = 0;
        let neighborCount = 0;

        // Check all other NPCs
        this.npcs.children.entries.forEach((other: any) => {
            if (other === npc) return; // Skip self

            const dx = npc.x - other.x;
            const dy = npc.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // If too close, add repulsion force
            if (dist < personalSpaceRadius && dist > 0) {
                // Stronger push when very close
                const strength = (personalSpaceRadius - dist) / personalSpaceRadius;
                separationX += (dx / dist) * strength * 100;
                separationY += (dy / dist) * strength * 100;
                neighborCount++;
            }
        });

        // Average the forces
        if (neighborCount > 0) {
            separationX /= neighborCount;
            separationY /= neighborCount;
        }

        return { x: separationX, y: separationY };
    }

    private updatePlayerArrow() {
        if (!this.playerArrow || !this.player) return;
        this.playerArrow.clear();

        this.playerArrow.fillStyle(0x00ff00, 1);
        const arrowLength = 18;
        const arrowWidth = 8;

        const tipX = this.player.x + Math.cos(this.playerFacingAngle) * arrowLength;
        const tipY = this.player.y + Math.sin(this.playerFacingAngle) * arrowLength;

        const perpAngle = this.playerFacingAngle + Math.PI / 2;
        const baseX = this.player.x + Math.cos(this.playerFacingAngle) * 6;
        const baseY = this.player.y + Math.sin(this.playerFacingAngle) * 6;

        const left1X = baseX + Math.cos(perpAngle) * arrowWidth;
        const left1Y = baseY + Math.sin(perpAngle) * arrowWidth;
        const right1X = baseX - Math.cos(perpAngle) * arrowWidth;
        const right1Y = baseY - Math.sin(perpAngle) * arrowWidth;

        this.playerArrow.beginPath();
        this.playerArrow.moveTo(tipX, tipY);
        this.playerArrow.lineTo(left1X, left1Y);
        this.playerArrow.lineTo(right1X, right1Y);
        this.playerArrow.closePath();
        this.playerArrow.fillPath();
    }

    private drawTargetMarker(x: number, y: number) {
        this.targetMarker.clear();

        // Draw pulsing circle at target
        this.targetMarker.lineStyle(3, 0x00ff00, 0.8);
        this.targetMarker.strokeCircle(x, y, 16);

        this.targetMarker.lineStyle(2, 0x00ff00, 0.5);
        this.targetMarker.strokeCircle(x, y, 24);
    }
}
