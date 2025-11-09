import Phaser from 'phaser';
import { NPCData } from '../types/NPCData';
import { decompressMap } from '../utils/mapCompression';
import { MapBuilder } from '../systems/MapBuilder';
import { NPCSpawner } from '../systems/NPCSpawner';
import { NPCAIController } from '../systems/NPCAIController';
import { VisualizationHelpers } from '../systems/VisualizationHelpers';

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
    private chairs: Array<{x: number, y: number, occupied: boolean, occupant: any}> = [];
    private cashRegisters: Array<{x: number, y: number}> = [];
    private moneyParticles: Array<{x: number, y: number, alpha: number, vy: number, life: number}> = [];
    private bartender!: Phaser.Physics.Arcade.Sprite;
    private bartenderLineGraphics!: Phaser.GameObjects.Graphics;
    private pouringBarGraphics!: Phaser.GameObjects.Graphics;
    private conversationGraphics!: Phaser.GameObjects.Graphics;
    private serviceZoneGraphics!: Phaser.GameObjects.Graphics;
    private visionConeGraphics!: Phaser.GameObjects.Graphics;
    private smokeParticles: Array<{x: number, y: number, alpha: number, vx: number, vy: number, life: number}> = [];

    // Map dimensions (40×70 = 2,800 tiles - optimized for QR code compression)
    private MAP_COLS = 40;
    private MAP_ROWS = 70;
    private readonly TILE_SIZE = 32;

    private patronSpawnTimer!: Phaser.Time.TimerEvent;

    private selectedMapData: number[][] | null = null;

    // System controllers
    private mapBuilder!: MapBuilder;
    private npcSpawner!: NPCSpawner;
    private npcAIController!: NPCAIController;
    private visualizationHelpers!: VisualizationHelpers;
    private employeeSpawns: Array<{x: number, y: number}> = [];
    private patronSpawns: Array<{x: number, y: number}> = [];

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: { selectedMap?: string | null; scannedMapData?: string }) {
        // Priority 1: Check for scannedMapData (from QR code or editor)
        if (data.scannedMapData) {
            try {
                const decompressed = decompressMap(data.scannedMapData);
                this.selectedMapData = decompressed.grid;
                console.log(`📍 Loaded compressed map: ${decompressed.width}×${decompressed.height}`);
                return;
            } catch (error) {
                console.error('❌ Failed to decompress map:', error);
            }
        }

        // Priority 2: Load selected map from localStorage if provided
        if (data.selectedMap) {
            const savedMapsStr = localStorage.getItem('drunkSimMaps') || '[]';
            const savedMaps = JSON.parse(savedMapsStr);
            const mapData = savedMaps.find((m: any) => m.name === data.selectedMap);

            if (mapData && mapData.grid) {
                this.selectedMapData = mapData.grid;
                console.log(`📍 Loaded map: ${data.selectedMap}`);
            } else {
                console.warn(`⚠️ Map "${data.selectedMap}" not found, using default`);
                this.selectedMapData = null;
            }
        } else {
            console.log('📍 Using default map');
            this.selectedMapData = null;
        }
    }

    preload() {
        // No assets needed - all procedural
    }

    create() {
        // Create static wall group
        this.walls = this.physics.add.staticGroup();

        // Initialize system controllers
        this.mapBuilder = new MapBuilder(this, this.walls, this.TILE_SIZE);
        this.visualizationHelpers = new VisualizationHelpers(this);

        // Build the entire map
        const mapResult = this.mapBuilder.buildMap(
            this.selectedMapData,
            this.MAP_ROWS,
            this.MAP_COLS,
            this.beerTaps,
            this.pois,
            this.chairs,
            this.cashRegisters,
            this.barServiceZones
        );

        // Update map dimensions from builder
        this.MAP_ROWS = mapResult.MAP_ROWS;
        this.MAP_COLS = mapResult.MAP_COLS;
        this.employeeSpawns = mapResult.employeeSpawns;
        this.patronSpawns = mapResult.patronSpawns;

        // Create player sprite (green circle)
        const graphics = this.add.graphics();
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircle(12, 12, 12);
        graphics.generateTexture('player-sprite', 24, 24);
        graphics.destroy();

        // Create beer sprite texture (must be before playerBeerIcon)
        const beerGraphics = this.add.graphics();
        beerGraphics.fillStyle(0xFFD700, 1); // Gold
        beerGraphics.fillRect(0, 2, 12, 10);
        beerGraphics.fillStyle(0xFFFFFF, 0.8); // Foam
        beerGraphics.fillRect(0, 0, 12, 3);
        beerGraphics.generateTexture('beer-sprite', 12, 12);
        beerGraphics.destroy();

        // Spawn player at position marked in map (type 8 = player start)
        this.player = this.physics.add.sprite(mapResult.playerStartX, mapResult.playerStartY, 'player-sprite');
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

        // Player beer icon (texture created above)
        this.playerBeerIcon = this.add.sprite(this.player.x, this.player.y - 20, 'beer-sprite');
        this.playerBeerIcon.setDepth(101);
        this.playerBeerIcon.setVisible(false);

        // Directional arrow
        this.playerArrow = this.add.graphics();
        this.playerArrow.setDepth(101);
        this.visualizationHelpers.updatePlayerArrow(this.playerArrow, this.player, this.playerFacingAngle);

        // Camera setup - follows player vertically, locked horizontally
        this.cameras.main.setBounds(0, 0, this.MAP_COLS * this.TILE_SIZE, this.MAP_ROWS * this.TILE_SIZE);

        // Calculate zoom to fill viewport with smaller maps
        const gameWidth = 1024;  // Canvas width from config
        const gameHeight = 1824; // Canvas height from config
        const mapPixelWidth = this.MAP_COLS * this.TILE_SIZE;
        const mapPixelHeight = this.MAP_ROWS * this.TILE_SIZE;

        // Calculate zoom factors for width and height
        const zoomX = gameWidth / mapPixelWidth;
        const zoomY = gameHeight / mapPixelHeight;

        // Use the smaller zoom to ensure entire map fits
        // Small maps (zoom > 1): tiles appear BIGGER
        // Large maps (zoom < 1): tiles appear SMALLER
        const zoom = Math.min(zoomX, zoomY);

        this.cameras.main.setZoom(zoom);
        console.log(`📷 Camera zoom set to ${zoom.toFixed(2)}x (map: ${this.MAP_COLS}×${this.MAP_ROWS}, pixels: ${mapPixelWidth}×${mapPixelHeight})`);

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
            this.visualizationHelpers.drawTargetMarker(this.targetMarker, worldX, worldY);

            console.log(`🎯 Moving to (${Math.round(worldX)}, ${Math.round(worldY)})`);
        });

        // NPCs
        this.npcs = this.physics.add.group();
        this.physics.add.collider(this.npcs, this.walls);
        this.physics.add.collider(this.npcs, this.npcs);

        // Initialize NPC spawner
        this.npcSpawner = new NPCSpawner(this, this.npcs, this.walls, this.TILE_SIZE, this.barServiceZones);
        this.npcSpawner.createNPCs(this.employeeSpawns);

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

        // Graphics for service zone overlays (light blue)
        this.serviceZoneGraphics = this.add.graphics();
        this.serviceZoneGraphics.setDepth(5);  // Above floor, below NPCs
        this.visualizationHelpers.drawServiceZones(this.serviceZoneGraphics, this.barServiceZones);

        // Graphics for bartender vision cones
        this.visionConeGraphics = this.add.graphics();
        this.visionConeGraphics.setDepth(10);  // Above zones, below NPCs

        // Initialize NPC AI Controller
        this.npcAIController = new NPCAIController(
            this,
            this.npcs,
            this.player,
            this.walls,
            this.TILE_SIZE,
            this.beerTaps,
            this.pois,
            this.barServiceZones,
            this.chairs,
            this.cashRegisters,
            this.smokeParticles,
            this.moneyParticles,
            this.bartenderLineGraphics,
            this.pouringBarGraphics,
            this.conversationGraphics,
            this.visionConeGraphics,
            this.playerBeerIcon,
            this.MAP_COLS,
            this.MAP_ROWS
        );

        // Spawn initial patrons immediately
        for (let i = 0; i < 3; i++) {
            this.npcSpawner.spawnPatron(this.patronSpawns);
        }

        // Start patron spawning timer - spawn every 2 seconds
        this.patronSpawnTimer = this.time.addEvent({
            delay: 2000,  // Reduced from 5000
            callback: () => this.npcSpawner.spawnPatron(this.patronSpawns),
            callbackScope: this,
            loop: true
        });
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

        this.visualizationHelpers.updatePlayerArrow(this.playerArrow, this.player, this.playerFacingAngle);

        // Update player beer icon position
        if (this.playerBeerIcon) {
            this.playerBeerIcon.setPosition(this.player.x, this.player.y - 20);
        }

        // Auto-order when player is idle and in a service zone
        if (playerState === 'idle') {
            const inServiceZone = this.barServiceZones.some(zone =>
                this.player.x >= zone.x && this.player.x < zone.x + zone.width &&
                this.player.y >= zone.y && this.player.y < zone.y + zone.height
            );

            if (inServiceZone) {
                this.player.setData('state', 'waiting');
                console.log('🙋 Player entered service zone, waiting for a drink');
            }
        }

        // Space key to manually order drink (if not in a service zone)
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (playerState === 'idle') {
                this.player.setData('state', 'waiting');
                console.log('🙋 Player manually requested a drink');
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
        this.npcAIController.updateNPCAI();
    }
}
