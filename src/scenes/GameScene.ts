import Phaser from 'phaser';
import { NPCData } from '../types/NPCData';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private npcs!: Phaser.Physics.Arcade.Group;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private furniture!: Phaser.Physics.Arcade.StaticGroup;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load the tileset
        this.load.image('tileset', 'assets/tileset.png');
    }

    create() {
        // Create static groups for walls and furniture
        this.walls = this.physics.add.staticGroup();
        this.furniture = this.physics.add.staticGroup();

        // Build the map using tileset
        this.buildMapFromTiles();

        // Create player sprite
        const graphics = this.add.graphics();
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircle(12, 12, 12);  // Center the circle in the 24x24 texture
        graphics.generateTexture('player-sprite', 24, 24);
        graphics.destroy();

        // Spawn player on the street (bottom of screen)
        this.player = this.physics.add.sprite(512, 1300, 'player-sprite');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(100); // Always on top
        this.player.setOrigin(0.5, 0.5); // Ensure proper centering

        // Setup camera
        this.cameras.main.setBounds(0, 0, 1024, 1400);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1);

        // Immediately center camera on player
        this.cameras.main.centerOn(this.player.x, this.player.y);

        // Setup collisions
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.furniture);

        // Input
        this.cursors = this.input.keyboard!.createCursorKeys();

        // Initialize NPC group
        this.npcs = this.physics.add.group();

        // Add collisions for NPCs
        this.physics.add.collider(this.npcs, this.walls);
        this.physics.add.collider(this.npcs, this.furniture);
        this.physics.add.collider(this.npcs, this.npcs);

        // Create NPCs
        this.createNPCs();

        // Display instructions
        const instructions = this.add.text(10, 10,
            'ARROW KEYS: Move around and explore the bar',
            {
                fontSize: '16px',
                color: '#fff',
                backgroundColor: '#000',
                padding: { x: 10, y: 10 }
            }
        );
        instructions.setScrollFactor(0);

        // Display version info (top right)
        this.createVersionDisplay();
    }

    private createVersionDisplay() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = now.getFullYear();

        const commitHash = 'ec685f2'; // Current commit ID
        const timeStamp = `${hours}:${minutes}:${seconds} ${month}/${day}/${year}`;

        const versionText = this.add.text(
            1014, 10,
            `${commitHash} | ${timeStamp}`,
            {
                fontSize: '12px',
                color: '#00ff00',
                backgroundColor: '#000',
                padding: { x: 8, y: 5 },
                fontFamily: 'monospace'
            }
        );
        versionText.setOrigin(1, 0);
        versionText.setScrollFactor(0);
    }

    update() {
        if (!this.player) return;

        // Player movement
        const speed = 160;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }

        // Normalize diagonal movement
        if (this.player.body!.velocity.x !== 0 && this.player.body!.velocity.y !== 0) {
            this.player.body!.velocity.normalize().scale(speed);
        }

        // Update NPCs (basic wandering only)
        this.updateNPCs();
    }

    private buildMapFromTiles() {
        // Tile indices from our tileset:
        // 0=street, 1=bar floor (white), 2=patio, 3=wall horiz, 4=wall vert
        // 5=door, 6=bar counter horiz, 7=bar counter vert, 8=table, 9=stairs

        const TILE_SIZE = 32;
        const MAP_WIDTH = 32;  // 1024px / 32px
        const MAP_HEIGHT = 44; // 1400px / 32px (approx)

        // Simple tile map - we'll build it row by row
        // Using tile indices from our tileset
        this.drawTiledArea();
    }

    private drawTiledArea() {
        const TILE_SIZE = 32;

        // === PATIO (rows 0-7, top of map) ===
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 32; col++) {
                let tileIndex = 2; // Patio floor

                // Walls
                if (row === 0) tileIndex = 3; // Top wall
                if (col === 0 || col === 31) tileIndex = 4; // Side walls
                if (row === 7 && (col < 12 || col > 19)) tileIndex = 3; // Bottom wall with door gap

                this.addTile(col, row, tileIndex, row === 0 || col === 0 || col === 31 || (row === 7 && (col < 12 || col > 19)));
            }
        }

        // === MAIN BAR ROOM (rows 8-29) ===
        for (let row = 8; row < 30; row++) {
            for (let col = 0; col < 32; col++) {
                let tileIndex = 1; // White bar floor
                let hasCollision = false;

                // Side walls
                if (col === 0 || col === 31) {
                    tileIndex = 4;
                    hasCollision = true;
                }

                // L-shaped bar (top-left)
                if (row >= 11 && row <= 13 && col >= 3 && col <= 13) {
                    tileIndex = 6; // Horizontal bar counter
                    hasCollision = true;
                }
                if (row >= 11 && row <= 23 && col >= 3 && col <= 5) {
                    tileIndex = 7; // Vertical bar counter
                    hasCollision = true;
                }

                // Tables (right side)
                if ((row === 12 || row === 13) && (col === 19 || col === 20)) tileIndex = 8; // Table 1
                if ((row === 12 || row === 13) && (col === 24 || col === 25)) tileIndex = 8; // Table 2
                if ((row === 18 || row === 19) && (col === 19 || col === 20)) tileIndex = 8; // Table 3
                if ((row === 18 || row === 19) && (col === 24 || col === 25)) tileIndex = 8; // Table 4

                if (tileIndex === 8) hasCollision = true;

                this.addTile(col, row, tileIndex, hasCollision);
            }
        }

        // === STAIRS (rows 30-33) ===
        for (let row = 30; row < 34; row++) {
            for (let col = 0; col < 32; col++) {
                let tileIndex = 1; // White floor

                // Stairs in center
                if (col >= 10 && col <= 22) {
                    tileIndex = 9; // Stairs
                }

                this.addTile(col, row, tileIndex, false);
            }
        }

        // === ENTRANCE (rows 34-37) ===
        for (let row = 34; row < 38; row++) {
            for (let col = 0; col < 32; col++) {
                let tileIndex = 1; // White floor
                let hasCollision = false;

                // Walls with door gaps
                if (row === 37 && (col < 11 || col > 21)) {
                    tileIndex = 3;
                    hasCollision = true;
                }

                this.addTile(col, row, tileIndex, hasCollision);
            }
        }

        // === STREET (rows 38-43, bottom) ===
        for (let row = 38; row < 44; row++) {
            for (let col = 0; col < 32; col++) {
                this.addTile(col, row, 0, false); // Street tile
            }
        }
    }

    private addTile(col: number, row: number, tileIndex: number, hasCollision: boolean) {
        const TILE_SIZE = 32;
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;

        // Create tile sprite
        const tile = this.add.sprite(x, y, 'tileset');

        // Calculate frame position in tileset (8 tiles per row)
        const frameX = (tileIndex % 8) * 32;
        const frameY = Math.floor(tileIndex / 8) * 32;

        tile.setCrop(frameX, frameY, 32, 32);
        tile.setOrigin(0.5, 0.5);
        tile.setDisplaySize(32, 32);

        // Add collision
        if (hasCollision) {
            const collider = this.walls.create(x, y, undefined);
            collider.setSize(32, 32);
            collider.refreshBody();
            collider.setVisible(false);
        }
    }

    private drawBarLayout_OLD() {
        const graphics = this.add.graphics();

        // === PATIO (top/back area - "out back") ===
        const patioY = 0;

        // Patio floor - lighter grey background
        graphics.fillStyle(0xa0a0a0, 1);
        graphics.fillRect(0, patioY, 1024, 250);

        // Back wall (top)
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(0, patioY, 1024, 20);
        this.walls.create(512, patioY + 10, undefined).setSize(1024, 20).refreshBody();

        // Patio side walls
        graphics.fillRect(0, patioY, 20, 250);
        this.walls.create(10, patioY + 125, undefined).setSize(20, 250).refreshBody();

        graphics.fillRect(1004, patioY, 20, 250);
        this.walls.create(1014, patioY + 125, undefined).setSize(20, 250).refreshBody();

        // Patio door opening (bottom of patio, leading to bar)
        graphics.fillRect(0, patioY + 230, 400, 20);
        this.walls.create(200, patioY + 240, undefined).setSize(400, 20).refreshBody();

        graphics.fillRect(624, patioY + 230, 400, 20);
        this.walls.create(824, patioY + 240, undefined).setSize(400, 20).refreshBody();

        this.add.text(512, patioY + 100, 'PATIO (OUT BACK)', { fontSize: '20px', color: '#333' }).setOrigin(0.5);

        // === MAIN BAR ROOM ===
        const mainRoomY = patioY + 250;

        // Floor - WHITE background for the bar interior
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, mainRoomY, 1024, 700);

        // Outer walls
        graphics.fillStyle(0x8B4513, 1);
        // Left wall
        graphics.fillRect(0, mainRoomY, 20, 700);
        this.walls.create(10, mainRoomY + 350, undefined).setSize(20, 700).refreshBody();
        // Right wall
        graphics.fillRect(1004, mainRoomY, 20, 700);
        this.walls.create(1014, mainRoomY + 350, undefined).setSize(20, 700).refreshBody();

        // === L-SHAPED BAR (⅃ shape - vertically flipped) ===
        const barX = 100;
        const barY = mainRoomY + 100;

        // Horizontal part of L (top part)
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(barX, barY, 350, 80);
        this.furniture.create(barX + 175, barY + 40, undefined).setSize(350, 80).refreshBody();

        // Vertical part of L (extends downward)
        graphics.fillRect(barX, barY, 80, 400);
        this.furniture.create(barX + 40, barY + 200, undefined).setSize(80, 400).refreshBody();

        // Bar counter edge (darker)
        graphics.fillStyle(0x654321, 1);
        graphics.fillRect(barX, barY + 76, 350, 4);
        graphics.fillRect(barX + 76, barY, 4, 400);

        this.add.text(barX + 175, barY + 40, 'BAR', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);

        // === TABLES IN MAIN ROOM ===
        graphics.fillStyle(0x654321, 1);

        // Table 1
        graphics.fillRect(600, mainRoomY + 150, 80, 80);
        this.furniture.create(640, mainRoomY + 190, undefined).setSize(80, 80).refreshBody();

        // Table 2
        graphics.fillRect(750, mainRoomY + 150, 80, 80);
        this.furniture.create(790, mainRoomY + 190, undefined).setSize(80, 80).refreshBody();

        // Table 3
        graphics.fillRect(600, mainRoomY + 300, 80, 80);
        this.furniture.create(640, mainRoomY + 340, undefined).setSize(80, 80).refreshBody();

        // Table 4
        graphics.fillRect(750, mainRoomY + 300, 80, 80);
        this.furniture.create(790, mainRoomY + 340, undefined).setSize(80, 80).refreshBody();

        // === STAIRS ===
        const stairsY = mainRoomY + 700;
        const stairWidth = 400;
        const stairX = (1024 - stairWidth) / 2;

        // White background for stairs area
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, stairsY, 1024, 120);

        // Draw 15 stairs (reversed - going down now)
        for (let i = 0; i < 15; i++) {
            const y = stairsY + (i * 8);
            const shade = 0xaaaaaa - (i * 0x040404); // Reversed shading
            graphics.fillStyle(shade, 1);
            graphics.fillRect(stairX, y, stairWidth, 8);
        }
        this.add.text(512, stairsY + 60, 'STAIRS', { fontSize: '16px', color: '#333' }).setOrigin(0.5);

        // === ENTRANCE AREA ===
        const entranceY = stairsY + 120;

        // White background for entrance area
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, entranceY, 1024, 120);

        // Left wall before entrance
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(0, entranceY + 100, 350, 20);
        this.walls.create(175, entranceY + 110, undefined).setSize(350, 20).refreshBody();

        // Right wall before entrance
        graphics.fillRect(674, entranceY + 100, 350, 20);
        this.walls.create(849, entranceY + 110, undefined).setSize(350, 20).refreshBody();

        // Two door frames
        graphics.fillStyle(0x654321, 1);
        graphics.fillRect(350, entranceY + 80, 10, 40);
        graphics.fillRect(450, entranceY + 80, 10, 40);
        graphics.fillRect(564, entranceY + 80, 10, 40);
        graphics.fillRect(664, entranceY + 80, 10, 40);

        // === STREET (bottom area) ===
        const streetY = entranceY + 120;
        graphics.fillStyle(0x404040, 1);
        graphics.fillRect(0, streetY, 1024, 150);
        this.add.text(512, streetY + 75, 'STREET', { fontSize: '20px', color: '#888' }).setOrigin(0.5);

        graphics.destroy();
    }

    private createNPCs() {
        // Create simple NPC visual - just colored circles
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffa500, 1); // Orange for all NPCs (patrons)
        graphics.fillCircle(0, 0, 10);
        graphics.generateTexture('npc-patron', 20, 20);
        graphics.destroy();

        const mainRoomY = 250; // Start of main bar room

        // Spawn a few patrons in different areas
        const patronSpots = [
            { x: 300, y: mainRoomY + 300 },
            { x: 550, y: mainRoomY + 400 },
            { x: 700, y: mainRoomY + 500 },
            { x: 850, y: mainRoomY + 350 }
        ];

        patronSpots.forEach(spot => {
            const patron = this.npcs.create(spot.x, spot.y, 'npc-patron') as Phaser.Physics.Arcade.Sprite;
            patron.setCollideWorldBounds(true);
            patron.setData('npcData', {
                type: 'patron',
                state: 'wandering',
                targetX: spot.x,
                targetY: spot.y,
                stateTimer: Phaser.Math.Between(60, 180)
            } as NPCData);
        });
    }

    private updateNPCs() {
        const patioY = 0;
        const mainRoomY = 250;
        const entranceY = 1070;

        this.npcs.getChildren().forEach((npcSprite) => {
            const npc = npcSprite as Phaser.Physics.Arcade.Sprite;
            const data = npc.getData('npcData') as NPCData;
            data.stateTimer -= 1;

            // Aimless wandering - pick random targets anywhere in the bar
            if (data.stateTimer <= 0) {
                // Pick a random area to wander to
                const areas = [
                    { minX: 100, maxX: 900, minY: patioY + 50, maxY: patioY + 200 }, // Patio (top)
                    { minX: 300, maxX: 900, minY: mainRoomY + 100, maxY: mainRoomY + 600 }, // Main bar room
                    { minX: 200, maxX: 800, minY: entranceY, maxY: entranceY + 80 } // Entrance area
                ];
                const area = Phaser.Math.RND.pick(areas);
                data.targetX = Phaser.Math.Between(area.minX, area.maxX);
                data.targetY = Phaser.Math.Between(area.minY, area.maxY);
                data.state = 'wandering';
                data.stateTimer = Phaser.Math.Between(120, 300);
            }

            // Move towards target
            const speed = 50;
            const distance = Phaser.Math.Distance.Between(npc.x, npc.y, data.targetX, data.targetY);

            if (distance > 5) {
                const angle = Phaser.Math.Angle.Between(npc.x, npc.y, data.targetX, data.targetY);
                npc.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            } else {
                npc.setVelocity(0, 0);
            }

            npc.setData('npcData', data);
        });
    }
}
