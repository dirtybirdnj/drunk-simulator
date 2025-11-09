import Phaser from 'phaser';
import { NPCData } from '../types/NPCData';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private playerArrow!: Phaser.GameObjects.Graphics;
    private playerFacingAngle: number = -Math.PI / 2; // Start facing up
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private npcs!: Phaser.Physics.Arcade.Group;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private furniture!: Phaser.Physics.Arcade.StaticGroup;
    private debugText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load the tileset (with cache-busting timestamp)
        this.load.image('tileset', `assets/tileset.png?v=${Date.now()}`);
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

        // Spawn player on the street (bottom grey area) - CENTER of street
        // Street is rows 30-33 (y: 960-1088), spawn at row 32, column 16 (center)
        this.player = this.physics.add.sprite(512, 1050, 'player-sprite');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(100); // Always on top
        this.player.setOrigin(0.5, 0.5); // Ensure proper centering

        // Create directional arrow indicator
        this.playerArrow = this.add.graphics();
        this.playerArrow.setDepth(101); // Above player
        this.updatePlayerArrow();

        // Setup camera - follows player vertically, locked horizontally
        this.cameras.main.setBounds(0, 0, 1024, 1088);
        this.cameras.main.setZoom(1);

        // Follow player smoothly, lerp 0.1 on both axes (but we'll lock X in update)
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Initial camera position at player spawn (bottom of map)
        this.cameras.main.centerOn(512, this.player.y);

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

        // Debug display for player position
        this.debugText = this.add.text(10, 50,
            `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
            {
                fontSize: '14px',
                color: '#00ff00',
                backgroundColor: '#000',
                padding: { x: 8, y: 5 },
                fontFamily: 'monospace'
            }
        );
        this.debugText.setScrollFactor(0);
        this.debugText.setDepth(1000); // Always on top
    }

    private createVersionDisplay() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = now.getFullYear();

        const commitHash = '2ca2bed'; // Current commit ID
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

        // Lock camera horizontally (only follow Y axis)
        this.cameras.main.scrollX = 0;

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

        // Update facing direction based on movement
        if (this.player.body!.velocity.x !== 0 || this.player.body!.velocity.y !== 0) {
            this.playerFacingAngle = Math.atan2(this.player.body!.velocity.y, this.player.body!.velocity.x);
        }

        // Update arrow position and rotation
        this.updatePlayerArrow();

        // Update debug text with player position
        if (this.debugText) {
            this.debugText.setText(`Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)}) | Depth: ${this.player.depth}`);
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
        const MAP_HEIGHT = 34; // 1088px / 32px - compact layout to fit on screen

        // Compact layout (top to bottom):
        // Rows 0-5: Patio (6 rows = 192px)
        // Rows 6-23: Main bar (18 rows = 576px)
        // Rows 24-26: Stairs (3 rows = 96px)
        // Rows 27-29: Entrance (3 rows = 96px)
        // Rows 30-33: Street (4 rows = 128px)
        // Total: 34 rows = 1088px (fits comfortably in 1400px viewport)

        this.drawTiledArea();
    }

    private drawTiledArea() {
        const TILE_SIZE = 32;

        // === PATIO (rows 0-5, top of map) ===
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 32; col++) {
                let tileIndex = 2; // Patio floor
                let collisionType: 'none' | 'structure' | 'furniture' = 'none';

                // Walls
                if (row === 0) {
                    tileIndex = 3; // Top wall
                    collisionType = 'structure';
                }
                if (col === 0 || col === 31) {
                    tileIndex = 4; // Side walls
                    collisionType = 'structure';
                }
                // Bottom wall with door (black, passable)
                if (row === 5) {
                    if (col < 14 || col > 17) {
                        tileIndex = 3; // Brown wall
                        collisionType = 'structure';
                    } else {
                        tileIndex = 5; // Black door (passable)
                        collisionType = 'none';
                    }
                }

                this.addTile(col, row, tileIndex, collisionType);
            }
        }

        // === MAIN BAR ROOM (rows 6-23) ===
        for (let row = 6; row < 24; row++) {
            for (let col = 0; col < 32; col++) {
                let tileIndex = 1; // Tan bar floor
                let collisionType: 'none' | 'structure' | 'furniture' = 'none';

                // Side walls
                if (col === 0 || col === 31) {
                    tileIndex = 4;
                    collisionType = 'structure';
                }

                // Blue bartender zone (staff only) - inside the L-shaped bar
                if (row >= 12 && row <= 20 && col >= 23 && col <= 26) {
                    tileIndex = 10; // Blue bartender floor
                    collisionType = 'none'; // Walkable for staff
                }

                // L-shaped bar counter on RIGHT side (structure - can't walk through)
                // Horizontal part (top)
                if (row >= 9 && row <= 11 && col >= 22 && col <= 29) {
                    tileIndex = 6; // Horizontal bar counter
                    collisionType = 'structure';
                }
                // Vertical part (extends downward)
                if (row >= 9 && row <= 20 && col >= 27 && col <= 29) {
                    tileIndex = 7; // Vertical bar counter
                    collisionType = 'structure';
                }

                this.addTile(col, row, tileIndex, collisionType);
            }
        }

        // === STAIRS (rows 24-26) ===
        for (let row = 24; row < 27; row++) {
            for (let col = 0; col < 32; col++) {
                let tileIndex = 1; // White floor

                // Stairs in center (walkable)
                if (col >= 10 && col <= 22) {
                    tileIndex = 9; // Stairs
                }

                this.addTile(col, row, tileIndex, 'none');
            }
        }

        // === ENTRANCE (rows 27-29) ===
        for (let row = 27; row < 30; row++) {
            for (let col = 0; col < 32; col++) {
                let tileIndex = 1; // White floor
                let collisionType: 'none' | 'structure' | 'furniture' = 'none';

                // Bottom wall with door (black, passable)
                if (row === 29) {
                    if (col < 14 || col > 17) {
                        tileIndex = 3; // Brown wall
                        collisionType = 'structure';
                    } else {
                        tileIndex = 5; // Black door (passable)
                        collisionType = 'none';
                    }
                }

                this.addTile(col, row, tileIndex, collisionType);
            }
        }

        // === STREET (rows 30-33, bottom) ===
        for (let row = 30; row < 34; row++) {
            for (let col = 0; col < 32; col++) {
                this.addTile(col, row, 0, 'none'); // Street tile (walkable)
            }
        }
    }

    private addTile(col: number, row: number, tileIndex: number, collisionType: 'none' | 'structure' | 'furniture') {
        const TILE_SIZE = 32;
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        // Tile colors map
        const tileColors: { [key: number]: number } = {
            0: 0x707070,  // Street - grey asphalt
            1: 0xD2B48C,  // Bar floor - tan wood
            2: 0xA0A0A0,  // Patio - light grey
            3: 0x8B4513,  // Wall horizontal - brown
            4: 0x8B4513,  // Wall vertical - brown
            5: 0x000000,  // Door - black (passable)
            6: 0x654321,  // Bar counter horizontal - dark brown
            7: 0x654321,  // Bar counter vertical - dark brown
            8: 0x654321,  // Table - dark brown
            9: 0x6B5F47,  // Stairs - grey-brown
            10: 0x4169E1  // Bartender zone - blue (staff only)
        };

        // Draw colored rectangle for this tile
        const graphics = this.add.graphics();
        graphics.fillStyle(tileColors[tileIndex] || 0x000000, 1);
        graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Set depth based on collision type
        // Render order: floor (0) -> structures/furniture (10) -> NPCs (50) -> player (100)
        if (collisionType === 'none') {
            graphics.setDepth(0); // Floor tiles at bottom
        } else {
            graphics.setDepth(10); // Structures and furniture above floor
        }

        // Add collision based on type
        if (collisionType === 'structure') {
            // Structures (walls, bar counter) - permanent obstacles
            const collider = this.walls.create(x + 16, y + 16, undefined);  // Center of tile
            collider.setSize(32, 32);
            collider.setOrigin(0.5, 0.5);  // Centered origin
            collider.refreshBody();
            collider.setVisible(false);
        } else if (collisionType === 'furniture') {
            // Furniture (tables, chairs) - interactable obstacles
            const collider = this.furniture.create(x + 16, y + 16, undefined);  // Center of tile
            collider.setSize(32, 32);
            collider.setOrigin(0.5, 0.5);  // Centered origin
            collider.refreshBody();
            collider.setVisible(false);
        }
        // 'none' = no collision (floor tiles)
    }

    // Old layout function removed - using tile-based system now

    private createNPCs() {
        // Create simple NPC visual - just colored circles
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffa500, 1); // Orange for all NPCs (patrons)
        graphics.fillCircle(10, 10, 10);  // Center in 20x20 texture
        graphics.generateTexture('npc-patron', 20, 20);
        graphics.destroy();

        const mainRoomY = 192; // Start of main bar room (row 6)

        // Spawn a few patrons in different areas
        const patronSpots = [
            { x: 300, y: mainRoomY + 150 },  // In main bar
            { x: 550, y: mainRoomY + 250 },  // In main bar
            { x: 700, y: mainRoomY + 350 },  // In main bar
            { x: 850, y: mainRoomY + 200 }   // In main bar
        ];

        patronSpots.forEach(spot => {
            const patron = this.npcs.create(spot.x, spot.y, 'npc-patron') as Phaser.Physics.Arcade.Sprite;
            patron.setCollideWorldBounds(true);
            patron.setDepth(50); // NPCs render above tiles but below player
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
        // New compact layout positions:
        const patioY = 0;        // Rows 0-5 (y: 0-192)
        const mainRoomY = 192;   // Rows 6-23 (y: 192-768)
        const entranceY = 864;   // Rows 27-29 (y: 864-960)

        this.npcs.getChildren().forEach((npcSprite) => {
            const npc = npcSprite as Phaser.Physics.Arcade.Sprite;
            const data = npc.getData('npcData') as NPCData;
            data.stateTimer -= 1;

            // Aimless wandering - pick random targets anywhere in the bar
            if (data.stateTimer <= 0) {
                // Pick a random area to wander to
                const areas = [
                    { minX: 50, maxX: 974, minY: patioY + 40, maxY: patioY + 140 }, // Patio (top)
                    { minX: 50, maxX: 974, minY: mainRoomY + 50, maxY: mainRoomY + 500 }, // Main bar room
                    { minX: 200, maxX: 800, minY: entranceY + 20, maxY: entranceY + 70 } // Entrance area
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

    private updatePlayerArrow() {
        if (!this.playerArrow || !this.player) return;

        // Clear previous arrow
        this.playerArrow.clear();

        // Draw arrow pointing in facing direction
        this.playerArrow.lineStyle(3, 0x00ff00, 1);
        this.playerArrow.fillStyle(0x00ff00, 1);

        // Arrow extends from edge of player circle (radius ~12px)
        const arrowLength = 18;
        const arrowWidth = 8;

        // Calculate arrow tip position
        const tipX = this.player.x + Math.cos(this.playerFacingAngle) * arrowLength;
        const tipY = this.player.y + Math.sin(this.playerFacingAngle) * arrowLength;

        // Calculate arrow base positions (perpendicular to facing direction)
        const perpAngle = this.playerFacingAngle + Math.PI / 2;
        const baseX = this.player.x + Math.cos(this.playerFacingAngle) * 6;
        const baseY = this.player.y + Math.sin(this.playerFacingAngle) * 6;

        const left1X = baseX + Math.cos(perpAngle) * arrowWidth;
        const left1Y = baseY + Math.sin(perpAngle) * arrowWidth;
        const right1X = baseX - Math.cos(perpAngle) * arrowWidth;
        const right1Y = baseY - Math.sin(perpAngle) * arrowWidth;

        // Draw filled triangle
        this.playerArrow.beginPath();
        this.playerArrow.moveTo(tipX, tipY);
        this.playerArrow.lineTo(left1X, left1Y);
        this.playerArrow.lineTo(right1X, right1Y);
        this.playerArrow.closePath();
        this.playerArrow.fillPath();
        this.playerArrow.strokePath();
    }
}
