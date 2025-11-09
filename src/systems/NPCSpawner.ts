import Phaser from 'phaser';

export class NPCSpawner {
    private scene: Phaser.Scene;
    private npcs: Phaser.Physics.Arcade.Group;
    private walls: Phaser.Physics.Arcade.StaticGroup;
    private TILE_SIZE: number;
    private barServiceZones: Array<{x: number, y: number, width: number, height: number, tapIndex: number}>;

    constructor(
        scene: Phaser.Scene,
        npcs: Phaser.Physics.Arcade.Group,
        walls: Phaser.Physics.Arcade.StaticGroup,
        tileSize: number,
        barServiceZones: Array<{x: number, y: number, width: number, height: number, tapIndex: number}>
    ) {
        this.scene = scene;
        this.npcs = npcs;
        this.walls = walls;
        this.TILE_SIZE = tileSize;
        this.barServiceZones = barServiceZones;
    }

    createNPCs(employeeSpawns: Array<{x: number, y: number}>) {
        // Orange patrons
        const patronGraphics = this.scene.add.graphics();
        patronGraphics.fillStyle(0xffa500, 1);
        patronGraphics.fillCircle(10, 10, 10);
        patronGraphics.generateTexture('patron-sprite', 20, 20);
        patronGraphics.destroy();

        // Red staff
        const staffGraphics = this.scene.add.graphics();
        staffGraphics.fillStyle(0xff0000, 1);
        staffGraphics.fillCircle(10, 10, 10);
        staffGraphics.generateTexture('staff-sprite', 20, 20);
        staffGraphics.destroy();

        // Patrons will now spawn dynamically via timer

        // Spawn bartenders at employee spawn locations - one bartender per spawn point
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

                // Find center of nearest service zones to determine initial facing direction
                const nearbyZones = this.barServiceZones.filter(zone => {
                    const dx = (zone.x + zone.width / 2) - spawn.x;
                    const dy = (zone.y + zone.height / 2) - spawn.y;
                    return Math.sqrt(dx * dx + dy * dy) < 150;  // Within ~4-5 tiles
                });

                let initialFacing = 0;  // Default: face right
                if (nearbyZones.length > 0) {
                    // Calculate average position of nearby service zones
                    let avgX = 0;
                    let avgY = 0;
                    nearbyZones.forEach(zone => {
                        avgX += zone.x + zone.width / 2;
                        avgY += zone.y + zone.height / 2;
                    });
                    avgX /= nearbyZones.length;
                    avgY /= nearbyZones.length;

                    // Face toward service zones
                    initialFacing = Math.atan2(avgY - spawn.y, avgX - spawn.x);
                }

                bartender.setData('facingAngle', initialFacing);  // Direction bartender faces
                bartender.setData('scanTimer', 0);  // Timer for scanning behavior
                bartender.setData('scanDirection', 1);  // 1 = clockwise, -1 = counterclockwise
                bartender.setData('barIndex', index);  // Which bar this bartender works at
                bartender.setData('reservedTapIndex', -1);  // No tap reserved initially
                console.log(`👔 Bartender ${index} spawned at (${Math.round(spawn.x)}, ${Math.round(spawn.y)}), facing ${(initialFacing * 180 / Math.PI).toFixed(0)}°`);
            });
            console.log(`👔 Spawned ${employeeSpawns.length} bartenders total`);
        } else {
            console.warn('⚠️ No employee spawn points found!');
        }

        // Add collision between NPCs and walls
        this.scene.physics.add.collider(this.npcs, this.walls);
    }

    spawnPatron(patronSpawns: Array<{x: number, y: number}>) {
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
        npc.setData('isSmoker', Math.random() < 0.5); // 50% chance of being a smoker
        npc.setData('puffCount', 0);          // Number of puffs taken
        npc.setData('puffTimer', 0);          // Timer for smoking
        npc.setData('exhaling', false);       // Currently exhaling

        // Add beer icon (hidden initially)
        const beerIcon = this.scene.add.sprite(npc.x, npc.y - 20, 'beer-sprite');
        beerIcon.setDepth(51);
        beerIcon.setVisible(false);
        npc.setData('beerIcon', beerIcon);

        console.log(`🚶 New patron spawned at (${Math.round(spawn.x)}, ${Math.round(spawn.y)})`);
    }
}
