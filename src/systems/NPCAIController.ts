import Phaser from 'phaser';
import type { GameScene } from '../scenes/GameScene';

export class NPCAIController {
    private scene: GameScene;
    private npcs: Phaser.Physics.Arcade.Group;
    private player: Phaser.Physics.Arcade.Sprite;
    private walls: Phaser.Physics.Arcade.StaticGroup;
    private TILE_SIZE: number;
    private beerTaps: Array<{x: number, y: number}>;
    private pois: Array<{x: number, y: number}>;
    private barServiceZones: Array<{x: number, y: number, width: number, height: number, tapIndex: number}>;
    private chairs: Array<{x: number, y: number, occupied: boolean, occupant: any}>;
    private cashRegisters: Array<{x: number, y: number}>;
    private smokeParticles: Array<{x: number, y: number, alpha: number, vx: number, vy: number, life: number}>;
    private moneyParticles: Array<{x: number, y: number, alpha: number, vy: number, life: number}>;
    private bartenderLineGraphics: Phaser.GameObjects.Graphics;
    private pouringBarGraphics: Phaser.GameObjects.Graphics;
    private conversationGraphics: Phaser.GameObjects.Graphics;
    private visionConeGraphics: Phaser.GameObjects.Graphics;
    private playerBeerIcon: Phaser.GameObjects.Sprite;
    private MAP_COLS: number;
    private MAP_ROWS: number;

    constructor(
        scene: GameScene,
        npcs: Phaser.Physics.Arcade.Group,
        player: Phaser.Physics.Arcade.Sprite,
        walls: Phaser.Physics.Arcade.StaticGroup,
        tileSize: number,
        beerTaps: Array<{x: number, y: number}>,
        pois: Array<{x: number, y: number}>,
        barServiceZones: Array<{x: number, y: number, width: number, height: number, tapIndex: number}>,
        chairs: Array<{x: number, y: number, occupied: boolean, occupant: any}>,
        cashRegisters: Array<{x: number, y: number}>,
        smokeParticles: Array<{x: number, y: number, alpha: number, vx: number, vy: number, life: number}>,
        moneyParticles: Array<{x: number, y: number, alpha: number, vy: number, life: number}>,
        bartenderLineGraphics: Phaser.GameObjects.Graphics,
        pouringBarGraphics: Phaser.GameObjects.Graphics,
        conversationGraphics: Phaser.GameObjects.Graphics,
        visionConeGraphics: Phaser.GameObjects.Graphics,
        playerBeerIcon: Phaser.GameObjects.Sprite,
        mapCols: number,
        mapRows: number
    ) {
        this.scene = scene;
        this.npcs = npcs;
        this.player = player;
        this.walls = walls;
        this.TILE_SIZE = tileSize;
        this.beerTaps = beerTaps;
        this.pois = pois;
        this.barServiceZones = barServiceZones;
        this.chairs = chairs;
        this.cashRegisters = cashRegisters;
        this.smokeParticles = smokeParticles;
        this.moneyParticles = moneyParticles;
        this.bartenderLineGraphics = bartenderLineGraphics;
        this.pouringBarGraphics = pouringBarGraphics;
        this.conversationGraphics = conversationGraphics;
        this.visionConeGraphics = visionConeGraphics;
        this.playerBeerIcon = playerBeerIcon;
        this.MAP_COLS = mapCols;
        this.MAP_ROWS = mapRows;
    }

    updateNPCAI() {
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
                        // Find closest available bar service zone (not crowded)
                        let closestZone: {x: number, y: number, width: number, height: number} | null = null;
                        let closestDist = Infinity;

                        this.barServiceZones.forEach(zone => {
                            const zoneCenterX = zone.x + zone.width / 2;
                            const zoneCenterY = zone.y + zone.height / 2;
                            const dx = zoneCenterX - npc.x;
                            const dy = zoneCenterY - npc.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            // Check if zone is crowded - count patrons within 1 tile (32px)
                            let patronsNearby = 0;

                            // Check player
                            if (this.player.getData('state') === 'waiting' || this.player.getData('state') === 'thirsty') {
                                const playerDx = this.player.x - zoneCenterX;
                                const playerDy = this.player.y - zoneCenterY;
                                const playerDist = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
                                if (playerDist < 32) patronsNearby++;
                            }

                            // Check other patrons
                            this.npcs.children.entries.forEach((other: any) => {
                                if (other === npc) return;
                                if (other.getData('type') !== 'patron') return;
                                const otherState = other.getData('state');
                                if (otherState !== 'waiting' && otherState !== 'thirsty') return;

                                const otherDx = other.x - zoneCenterX;
                                const otherDy = other.y - zoneCenterY;
                                const otherDist = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
                                if (otherDist < 32) patronsNearby++;
                            });

                            // Skip crowded zones (more than 1 patron already there)
                            if (patronsNearby > 1) return;

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

                            // Reduce separation force significantly when heading to bar
                            // This prevents jiggling when approaching service zones
                            const separation = this.getSeparationForce(npc, drunkLevel);
                            dx += separation.x * 0.2;  // Only 20% of separation force
                            dy += separation.y * 0.2;

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
                        } else {
                            // All service zones are crowded - wander around and try again
                            console.log('😤 Patron found all bars crowded, wandering...');
                            let wanderTarget = npc.getData('wanderTarget');

                            if (!wanderTarget || Math.abs(npc.x - wanderTarget.x) < 30 && Math.abs(npc.y - wanderTarget.y) < 30) {
                                // Pick random spot in bar area
                                wanderTarget = {
                                    x: (2 + Math.random() * 18) * this.TILE_SIZE + 16,
                                    y: (8 + Math.random() * 13) * this.TILE_SIZE + 16
                                };
                                npc.setData('wanderTarget', wanderTarget);
                            }

                            const dx = wanderTarget.x - npc.x;
                            const dy = wanderTarget.y - npc.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist > 0.1) {
                                const separation = this.getSeparationForce(npc, drunkLevel);
                                const moveX = (dx / dist) * npcSpeed + separation.x;
                                const moveY = (dy / dist) * npcSpeed + separation.y;
                                npc.setVelocity(moveX, moveY);
                            }
                        }
                    } else {
                        // Done drinking - just stand around
                        npc.setVelocity(0, 0);
                    }
                } else if (state === 'waiting') {
                    // Check if this patron is sharing a tile with others
                    let patronsAtSameTile = 0;
                    this.npcs.children.entries.forEach((other: any) => {
                        if (other === npc) return;
                        if (other.getData('type') !== 'patron') return;
                        const otherState = other.getData('state');
                        if (otherState !== 'waiting') return;

                        // Check if within same tile (32px)
                        const dx = other.x - npc.x;
                        const dy = other.y - npc.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 32) patronsAtSameTile++;
                    });

                    // If sharing a tile, try to migrate to an empty tile
                    if (patronsAtSameTile > 0) {
                        // Find empty service zone tiles
                        let emptyZone: {x: number, y: number, width: number, height: number} | null = null;
                        let closestDist = Infinity;

                        this.barServiceZones.forEach(zone => {
                            const zoneCenterX = zone.x + zone.width / 2;
                            const zoneCenterY = zone.y + zone.height / 2;

                            // Count patrons in this zone
                            let patronsInZone = 0;
                            this.npcs.children.entries.forEach((other: any) => {
                                if (other.getData('type') !== 'patron') return;
                                const otherState = other.getData('state');
                                if (otherState !== 'waiting' && otherState !== 'thirsty') return;

                                const otherDx = other.x - zoneCenterX;
                                const otherDy = other.y - zoneCenterY;
                                const otherDist = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
                                if (otherDist < 32) patronsInZone++;
                            });

                            // Only consider empty zones
                            if (patronsInZone === 0) {
                                const dx = zoneCenterX - npc.x;
                                const dy = zoneCenterY - npc.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);

                                if (dist < closestDist) {
                                    closestDist = dist;
                                    emptyZone = zone;
                                }
                            }
                        });

                        // Migrate to empty zone if found
                        if (emptyZone) {
                            console.log(`🚶 Patron migrating from crowded tile to empty zone`);
                            npc.setData('state', 'thirsty');
                            npc.setData('waitStartTime', 0);
                            return;
                        }
                    }

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

                        // Must be on adjacent tiles to start conversation
                        if (closestTarget && closestDist < 48) {
                            // Check if on adjacent tiles (touching)
                            const npcGridX = Math.floor(npc.x / this.TILE_SIZE);
                            const npcGridY = Math.floor(npc.y / this.TILE_SIZE);
                            const targetGridX = Math.floor(closestTarget.x / this.TILE_SIZE);
                            const targetGridY = Math.floor(closestTarget.y / this.TILE_SIZE);

                            const gridDistX = Math.abs(npcGridX - targetGridX);
                            const gridDistY = Math.abs(npcGridY - targetGridY);

                            // Must be on adjacent tiles (touching), not diagonal
                            const isAdjacent = (gridDistX <= 1 && gridDistY <= 1) && (gridDistX + gridDistY <= 1);

                            if (isAdjacent) {
                                // Close enough and on adjacent tiles - start talking
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
                            } else {
                                // Move toward target to get on adjacent tile
                                const dx = closestTarget.x - npc.x;
                                const dy = closestTarget.y - npc.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);

                                // Apply separation force
                                const separation = this.getSeparationForce(npc, drunkLevel);
                                const moveX = (dx / dist) * npcSpeed + separation.x;
                                const moveY = (dy / dist) * npcSpeed + separation.y;

                                npc.setVelocity(moveX, moveY);
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

                    // Check if patrons are still on adjacent tiles
                    if (socialTarget && socialTarget.active) {
                        const npcGridX = Math.floor(npc.x / this.TILE_SIZE);
                        const npcGridY = Math.floor(npc.y / this.TILE_SIZE);
                        const targetGridX = Math.floor(socialTarget.x / this.TILE_SIZE);
                        const targetGridY = Math.floor(socialTarget.y / this.TILE_SIZE);

                        const gridDistX = Math.abs(npcGridX - targetGridX);
                        const gridDistY = Math.abs(npcGridY - targetGridY);

                        // Must be on adjacent tiles (touching), not diagonal
                        const isAdjacent = (gridDistX <= 1 && gridDistY <= 1) && (gridDistX + gridDistY <= 1);

                        if (!isAdjacent) {
                            console.log('💔 Patrons moved apart, breaking conversation');

                            // Calculate partial beer consumption based on time elapsed
                            const elapsed = Date.now() - socialStartTime;
                            const percentComplete = Math.min(1, elapsed / 10000);
                            const beerConsumed = 25 * percentComplete;

                            const currentBeer = npc.getData('beerAmount');
                            npc.setData('beerAmount', Math.max(0, currentBeer - beerConsumed));

                            // Reset both participants
                            npc.setData('state', 'has_beer');
                            npc.setData('socialTarget', null);

                            if (socialTarget.getData('socialTarget') === npc) {
                                const targetBeer = socialTarget.getData('beerAmount');
                                socialTarget.setData('beerAmount', Math.max(0, targetBeer - beerConsumed));
                                socialTarget.setData('state', 'has_beer');
                                socialTarget.setData('socialTarget', null);
                            }

                            return; // Exit early
                        }
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
                } else if (state === 'going_to_patio') {
                    // Patron heading to patio to smoke - look for an available chair
                    let targetChair = npc.getData('targetChair');

                    // If no target chair assigned yet, find one
                    if (!targetChair) {
                        // Find closest unoccupied chair
                        let closestChair = null;
                        let closestDist = Infinity;

                        this.chairs.forEach((chair) => {
                            if (!chair.occupied) {
                                const dx = chair.x - npc.x;
                                const dy = chair.y - npc.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);

                                if (dist < closestDist) {
                                    closestDist = dist;
                                    closestChair = chair;
                                }
                            }
                        });

                        if (closestChair) {
                            // Found an available chair
                            targetChair = closestChair;
                            npc.setData('targetChair', targetChair);
                            console.log(`🪑 Patron found chair at (${targetChair.x}, ${targetChair.y})`);
                        } else {
                            // No chairs available - give up and smoke in place
                            console.log('😤 No chairs available, smoking in place');
                            npc.setVelocity(0, 0);
                            npc.setData('state', 'smoking');
                            npc.setData('puffCount', 0);
                            npc.setData('puffTimer', Date.now());
                            return;
                        }
                    }

                    // Move toward target chair
                    const dx = targetChair.x - npc.x;
                    const dy = targetChair.y - npc.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 16) {
                        // Arrived at chair - occupy it and start smoking
                        npc.setVelocity(0, 0);
                        targetChair.occupied = true;
                        targetChair.occupant = npc;
                        npc.setData('occupiedChair', targetChair);
                        npc.setData('state', 'smoking');
                        npc.setData('puffCount', 0);
                        npc.setData('puffTimer', Date.now());
                        console.log('🚬 Patron sat in chair, starting to smoke');
                    } else {
                        // Move toward chair with reduced separation force
                        const separation = this.getSeparationForce(npc, drunkLevel);
                        const moveX = (dx / dist) * npcSpeed + separation.x * 0.2;
                        const moveY = (dy / dist) * npcSpeed + separation.y * 0.2;
                        npc.setVelocity(moveX, moveY);
                    }
                } else if (state === 'smoking') {
                    // Patron is smoking - stand still and puff cigarette
                    npc.setVelocity(0, 0);

                    const puffCount = npc.getData('puffCount');
                    const puffTimer = npc.getData('puffTimer');
                    const exhaling = npc.getData('exhaling');
                    const totalPuffs = 10 + Math.floor(Math.random() * 3); // 10-12 puffs

                    const now = Date.now();
                    const timeSincePuff = now - puffTimer;

                    if (puffCount >= totalPuffs) {
                        // Done smoking - release chair and return to has_beer behavior
                        const occupiedChair = npc.getData('occupiedChair');
                        if (occupiedChair) {
                            occupiedChair.occupied = false;
                            occupiedChair.occupant = null;
                            npc.setData('occupiedChair', null);
                            npc.setData('targetChair', null);
                            console.log('🪑 Patron vacated chair');
                        }
                        npc.setData('state', 'has_beer');
                        npc.setData('puffCount', 0);
                        console.log('🚬 Patron finished smoking, going back inside');
                    } else if (exhaling) {
                        // Exhaling phase (1-2 seconds)
                        const exhaleTime = 1000 + Math.random() * 1000;
                        if (timeSincePuff > exhaleTime) {
                            // Done exhaling, wait before next puff
                            npc.setData('exhaling', false);
                            npc.setData('puffTimer', now);
                        } else {
                            // Create smoke particles while exhaling
                            if (Math.random() < 0.3) { // 30% chance each frame
                                // Randomly choose left or right direction
                                const direction = Math.random() < 0.5 ? -1 : 1;
                                this.smokeParticles.push({
                                    x: npc.x + (Math.random() - 0.5) * 10,
                                    y: npc.y - 15,
                                    alpha: 0.6,
                                    vx: direction * (40 + Math.random() * 30), // 40-70px/s horizontal
                                    vy: (Math.random() - 0.5) * 10, // Minimal vertical drift
                                    life: 1.0
                                });
                            }
                        }
                    } else {
                        // Waiting between puffs (2-3 seconds)
                        const waitTime = 2000 + Math.random() * 1000;
                        if (timeSincePuff > waitTime) {
                            // Take next puff
                            npc.setData('puffCount', puffCount + 1);
                            npc.setData('exhaling', true);
                            npc.setData('puffTimer', now);

                            // Consume beer while smoking (similar to conversations)
                            const currentBeerAmount = npc.getData('beerAmount');
                            const beerPerPuff = 100 / totalPuffs; // Distribute beer consumption across puffs
                            const newBeerAmount = Math.max(0, currentBeerAmount - beerPerPuff);
                            npc.setData('beerAmount', newBeerAmount);
                        }
                    }

                    // Allow socializing while smoking - look for nearby smokers
                    const socialTarget = npc.getData('socialTarget');
                    if (!socialTarget && Math.random() < 0.01) { // Occasionally look for smoking buddy
                        this.npcs.children.entries.forEach((other: any) => {
                            if (other === npc) return;
                            if (other.getData('type') !== 'patron') return;
                            if (other.getData('state') !== 'smoking') return;

                            const dx = other.x - npc.x;
                            const dy = other.y - npc.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            // Talk to smokers within 2 tiles
                            if (dist < 64) {
                                npc.setData('socialTarget', other);
                                other.setData('socialTarget', npc);
                                console.log('💬 Smokers started chatting on patio');
                            }
                        });
                    }
                } else if (state === 'migrating') {
                    // Patron is migrating away from bar after getting beer
                    const migrationStartTime = npc.getData('migrationStartTime');
                    const migrationDuration = 3000; // 3 seconds

                    // Check if migration period is over
                    if (Date.now() - migrationStartTime > migrationDuration) {
                        npc.setData('state', 'has_beer');
                        console.log('✅ Patron finished migrating, now has_beer');
                        return;
                    }

                    // Find direction away from nearest service zone
                    let nearestZoneDist = Infinity;
                    let nearestZoneX = 0;
                    let nearestZoneY = 0;

                    this.barServiceZones.forEach(zone => {
                        const zoneCenterX = zone.x + zone.width / 2;
                        const zoneCenterY = zone.y + zone.height / 2;
                        const dx = zoneCenterX - npc.x;
                        const dy = zoneCenterY - npc.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < nearestZoneDist) {
                            nearestZoneDist = dist;
                            nearestZoneX = zoneCenterX;
                            nearestZoneY = zoneCenterY;
                        }
                    });

                    // Move away from nearest service zone
                    const awayDx = npc.x - nearestZoneX;
                    const awayDy = npc.y - nearestZoneY;
                    const awayDist = Math.sqrt(awayDx * awayDx + awayDy * awayDy);

                    if (awayDist > 0.1) {
                        const separation = this.getSeparationForce(npc, drunkLevel);
                        const moveX = (awayDx / awayDist) * npcSpeed + separation.x;
                        const moveY = (awayDy / awayDist) * npcSpeed + separation.y;
                        npc.setVelocity(moveX, moveY);
                    }
                }
            }
        });

        // Bartender AI - iterate through all bartenders
        this.npcs.children.entries.forEach((bartender: any) => {
            if (bartender.getData('type') !== 'staff') return;

            const bartenderState = bartender.getData('state');

            // Debug: Log bartender state every 2 seconds
            const lastLogTime = bartender.getData('lastLogTime') || 0;
            if (Date.now() - lastLogTime > 2000) {
                console.log(`👔 Bartender state: ${bartenderState}, facingAngle: ${(bartender.getData('facingAngle') * 180 / Math.PI).toFixed(0)}°`);
                bartender.setData('lastLogTime', Date.now());
            }

            if (bartenderState === 'idle') {
                // Bartenders sweep their vision cone left/right to scan for customers
                const scanDirection = bartender.getData('scanDirection') || 1;
                const currentFacing = bartender.getData('facingAngle') || 0;
                const sweepCount = bartender.getData('sweepCount') || 0;

                // Get base direction toward service zones
                const nearbyZones = this.barServiceZones.filter(zone => {
                    const dx = (zone.x + zone.width / 2) - bartender.x;
                    const dy = (zone.y + zone.height / 2) - bartender.y;
                    return Math.sqrt(dx * dx + dy * dy) < 200;
                });

                let baseDirection = currentFacing;
                if (nearbyZones.length > 0) {
                    let avgX = 0;
                    let avgY = 0;
                    nearbyZones.forEach(zone => {
                        avgX += zone.x + zone.width / 2;
                        avgY += zone.y + zone.height / 2;
                    });
                    avgX /= nearbyZones.length;
                    avgY /= nearbyZones.length;
                    baseDirection = Math.atan2(avgY - bartender.y, avgX - bartender.x);
                }

                // Sweep vision cone 45 degrees left and right of base direction
                const sweepRange = Math.PI / 4; // 45 degrees
                const scanSpeed = Math.PI / 60; // Rotate ~3 degrees per frame at 60fps
                const newFacing = currentFacing + (scanSpeed * scanDirection);

                // Reverse direction if reached sweep limits
                const angleDiff = newFacing - baseDirection;
                if (angleDiff > sweepRange) {
                    bartender.setData('scanDirection', -1);
                    bartender.setData('sweepCount', sweepCount + 1); // Count complete sweeps
                } else if (angleDiff < -sweepRange) {
                    bartender.setData('scanDirection', 1);
                    bartender.setData('sweepCount', sweepCount + 1); // Count complete sweeps
                } else {
                    bartender.setData('facingAngle', newFacing);
                }

                // Find closest waiting customer in bartender's vision cone
                const allWaitingCustomers: any[] = [];

                // Check player in vision cone
                if (this.player.getData('state') === 'waiting') {
                    const inVisionCone = this.isPointInVisionCone(this.player.x, this.player.y, bartender);

                    // Also check if player is in a service zone (light blue tiles)
                    const inServiceZone = this.barServiceZones.some(zone =>
                        this.player.x >= zone.x && this.player.x < zone.x + zone.width &&
                        this.player.y >= zone.y && this.player.y < zone.y + zone.height
                    );

                    console.log(`🔍 Player waiting - inVisionCone: ${inVisionCone}, inServiceZone: ${inServiceZone}`);

                    if (inVisionCone && inServiceZone) {
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
                            console.log(`👁️ Bartender sees Player in vision cone @ (${Math.round(this.player.x)},${Math.round(this.player.y)})`);
                        }
                    }
                }

                // Check patrons in bartender's vision cone
                this.npcs.children.entries.forEach((npc: any) => {
                    if (npc.getData('type') !== 'patron') return;
                    if (npc.getData('state') !== 'waiting') return;

                    const inVisionCone = this.isPointInVisionCone(npc.x, npc.y, bartender);

                    // Also check if patron is in a service zone (light blue tiles)
                    const inServiceZone = this.barServiceZones.some(zone =>
                        npc.x >= zone.x && npc.x < zone.x + zone.width &&
                        npc.y >= zone.y && npc.y < zone.y + zone.height
                    );

                    if (inVisionCone && inServiceZone) {
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

                // Serve closest customer in vision cone
                if (allWaitingCustomers.length > 0) {
                    allWaitingCustomers.sort((a, b) => a.dist - b.dist);
                    const closestCustomer = allWaitingCustomers[0].entity;

                    const customerType = closestCustomer.getData('type');
                    const custX = Math.round(closestCustomer.x);
                    const custY = Math.round(closestCustomer.y);
                    const dist = Math.round(allWaitingCustomers[0].dist);
                    console.log(`🎯 Bartender serving closest: ${customerType} @ (${custX},${custY}) dist=${dist}px`);
                    bartender.setVelocity(0, 0);
                    bartender.setData('state', 'going_to_tap');
                    bartender.setData('target', closestCustomer);
                    bartender.setData('sweepCount', 0); // Reset sweep count when customer found
                } else {
                    // No customers in vision cone
                    if (sweepCount >= 5) {
                        // After 5 sweeps with no target, move to adjacent tile
                        const moveTarget = bartender.getData('moveTarget');

                        if (!moveTarget) {
                            // Pick a random adjacent tile
                            const offsetX = (Math.random() > 0.5 ? 1 : -1) * this.TILE_SIZE;
                            const offsetY = (Math.random() > 0.5 ? 1 : -1) * this.TILE_SIZE;
                            bartender.setData('moveTarget', {
                                x: bartender.x + offsetX,
                                y: bartender.y + offsetY
                            });
                            console.log(`🚶 Bartender moving to adjacent tile after ${sweepCount} sweeps`);
                        } else {
                            // Move toward target
                            const dx = moveTarget.x - bartender.x;
                            const dy = moveTarget.y - bartender.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < 10) {
                                // Reached target - stop and reset
                                bartender.setVelocity(0, 0);
                                bartender.setData('moveTarget', null);
                                bartender.setData('sweepCount', 0);
                                console.log(`📍 Bartender reached new position, resuming sweep`);
                            } else {
                                // Keep moving
                                const speed = 60;
                                bartender.setVelocity((dx / dist) * speed, (dy / dist) * speed);
                            }
                        }
                    } else {
                        // Continue sweeping
                        bartender.setVelocity(0, 0);
                    }
                }
            } else if (bartenderState === 'going_to_tap') {
                // Find closest available (unreserved) beer tap
                let closestTapIndex = -1;
                let closestDist = Infinity;

                this.beerTaps.forEach((tap, index) => {
                    // Check if this tap is already reserved by another bartender
                    const tapReserved = this.npcs.children.entries.some((b: any) => {
                        return b !== bartender &&
                               b.getData('type') === 'staff' &&
                               b.getData('reservedTapIndex') === index;
                    });

                    if (!tapReserved) {
                        const dist = Math.sqrt(
                            Math.pow(tap.x - bartender.x, 2) +
                            Math.pow(tap.y - bartender.y, 2)
                        );
                        if (dist < closestDist) {
                            closestDist = dist;
                            closestTapIndex = index;
                        }
                    }
                });

                // If no available tap, wait
                if (closestTapIndex === -1) {
                    bartender.setVelocity(0, 0);
                    console.log('⏰ No available taps, bartender waiting...');
                    return;
                }

                // Reserve this tap
                bartender.setData('reservedTapIndex', closestTapIndex);

                // Move to closest available tap
                const closestTap = this.beerTaps[closestTapIndex];
                const dx = closestTap.x - bartender.x;
                const dy = closestTap.y - bartender.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 30) {
                    bartender.setVelocity(
                        (dx / dist) * npcSpeed,
                        (dy / dist) * npcSpeed
                    );
                    // Update facing angle while moving
                    bartender.setData('facingAngle', Math.atan2(dy, dx));
                } else {
                    // Close enough to tap
                    bartender.setVelocity(0, 0);
                    bartender.setData('state', 'pouring');
                    bartender.setData('pourTimer', Date.now() + 4000);
                    console.log(`🍺 Bartender reached tap ${closestTapIndex}, starting to pour (4 seconds)`);
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

                    // Update facing angle to look at target
                    bartender.setData('facingAngle', Math.atan2(dy, dx));

                    // Check if within 3 tiles (96px) to hand over beer
                    const maxServeDistance = this.TILE_SIZE * 3; // 96 pixels

                    if (dist <= maxServeDistance) {
                        // Within range - check if bartender is touching a counter tile
                        const bartenderGridX = Math.floor(bartender.x / this.TILE_SIZE);
                        const bartenderGridY = Math.floor(bartender.y / this.TILE_SIZE);

                        // Check adjacent tiles for counter
                        const isTouchingCounter = this.walls.children.entries.some((wall: any) => {
                            const wallGridX = Math.floor(wall.x / this.TILE_SIZE);
                            const wallGridY = Math.floor(wall.y / this.TILE_SIZE);

                            // Check if wall is adjacent (1 tile away in any direction)
                            const gridDistX = Math.abs(wallGridX - bartenderGridX);
                            const gridDistY = Math.abs(wallGridY - bartenderGridY);

                            return (gridDistX <= 1 && gridDistY <= 1) && (gridDistX + gridDistY > 0);
                        });

                        // Can serve if touching counter and within range
                        if (isTouchingCounter) {
                            bartender.setVelocity(0, 0);
                            target.setData('beerAmount', 100);
                            target.setData('waitStartTime', 0); // Reset wait timer!

                        // Show beer icon
                        if (target === this.player) {
                            this.playerBeerIcon.setVisible(true);
                            target.setData('state', 'has_beer');
                            console.log('🍺 Bartender delivered beer to PLAYER!');
                        } else {
                            const beerIcon = target.getData('beerIcon');
                            if (beerIcon) {
                                beerIcon.setVisible(true);
                            }

                            // Smokers go to patio, non-smokers migrate away from bar first
                            const isSmoker = target.getData('isSmoker');
                            if (isSmoker) {
                                target.setData('state', 'going_to_patio');
                                console.log('🚬 Patron going to patio for a smoke!');
                            } else {
                                target.setData('state', 'migrating');
                                target.setData('migrationStartTime', Date.now());
                                console.log('🚶 Patron migrating away from bar!');
                            }
                        }

                            bartender.setData('hasBeer', false);
                            bartender.setData('target', null);
                            bartender.setData('state', 'going_to_register');
                            bartender.setData('reservedTapIndex', -1); // Release tap reservation
                            console.log('💰 Bartender going to ring up sale');
                        } else {
                            // Not touching counter yet - move closer to counter
                            // Find nearest counter tile
                            let closestCounter: any = null;
                            let closestDist = Infinity;

                            this.walls.children.entries.forEach((wall: any) => {
                                const wallDist = Math.sqrt(
                                    Math.pow(wall.x - bartender.x, 2) +
                                    Math.pow(wall.y - bartender.y, 2)
                                );

                                if (wallDist < closestDist) {
                                    closestDist = wallDist;
                                    closestCounter = wall;
                                }
                            });

                            if (closestCounter) {
                                const counterDx = closestCounter.x - bartender.x;
                                const counterDy = closestCounter.y - bartender.y;
                                const counterDist = Math.sqrt(counterDx * counterDx + counterDy * counterDy);

                                if (counterDist > 0.1) {
                                    bartender.setVelocity(
                                        (counterDx / counterDist) * npcSpeed,
                                        (counterDy / counterDist) * npcSpeed
                                    );
                                }
                            }
                        }
                    } else {
                        // Too far from patron (>3 tiles) - follow them as they find empty service tile
                        console.log(`👣 Bartender following patron (dist: ${Math.round(dist)}px)`);
                        if (dist > 10) {
                            bartender.setVelocity(
                                (dx / dist) * npcSpeed,
                                (dy / dist) * npcSpeed
                            );
                        } else {
                            bartender.setVelocity(0, 0);
                        }
                    }
                } else {
                    bartender.setData('state', 'idle');
                    bartender.setData('reservedTapIndex', -1); // Release tap reservation
                }
            } else if (bartenderState === 'going_to_register') {
                // Bartender going to cash register after serving
                if (this.cashRegisters.length === 0) {
                    // No cash register - skip and return to idle
                    bartender.setData('state', 'idle');
                    return;
                }

                // Find closest cash register
                let closestRegister = this.cashRegisters[0];
                let closestDist = Infinity;
                this.cashRegisters.forEach(register => {
                    const dist = Math.sqrt(
                        Math.pow(register.x - bartender.x, 2) +
                        Math.pow(register.y - bartender.y, 2)
                    );
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestRegister = register;
                    }
                });

                // Check if bartender is adjacent to register (within 1.5 tiles)
                const dx = closestRegister.x - bartender.x;
                const dy = closestRegister.y - bartender.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.TILE_SIZE * 1.5) {
                    // Close enough to register - create $ animation and return to idle
                    bartender.setVelocity(0, 0);

                    // Create $ particle animation
                    this.moneyParticles.push({
                        x: closestRegister.x,
                        y: closestRegister.y,
                        alpha: 1.0,
                        vy: -40, // Rise upward
                        life: 1.5 // 1.5 seconds
                    });

                    // Add cash to game state - $5 per drink
                    this.scene.addCash(5);

                    // Immediately return to idle - sweeping code will handle facing
                    bartender.setData('state', 'idle');
                    console.log('💰 Ka-ching! +$5 - Sale registered, back to idle');
                } else {
                    // Move toward register
                    bartender.setVelocity(
                        (dx / dist) * npcSpeed,
                        (dy / dist) * npcSpeed
                    );
                    bartender.setData('facingAngle', Math.atan2(dy, dx));
                }
            }
        });

        // Visual feedback for bartenders
        this.bartenderLineGraphics.clear();
        this.pouringBarGraphics.clear();
        this.visionConeGraphics.clear();

        this.npcs.children.entries.forEach((bartender: any) => {
            if (bartender.getData('type') !== 'staff') return;

            const bartenderState = bartender.getData('state');
            const facingAngle = bartender.getData('facingAngle');

            // Draw vision cone for bartenders
            const coneRange = 160;  // 5 tiles - larger scanning range
            const coneAngle = Math.PI / 2.5;  // ~72 degrees - wider cone

            this.visionConeGraphics.fillStyle(0xFFFF00, 0.15);  // Yellow, 15% opacity
            this.visionConeGraphics.beginPath();
            this.visionConeGraphics.moveTo(bartender.x, bartender.y);
            this.visionConeGraphics.arc(
                bartender.x,
                bartender.y,
                coneRange,
                facingAngle - coneAngle / 2,
                facingAngle + coneAngle / 2,
                false
            );
            this.visionConeGraphics.closePath();
            this.visionConeGraphics.fillPath();

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

            // Draw progress bar above player (matching beer pour style)
            const elapsed = Date.now() - socialStartTime;
            const progress = Math.min(1, elapsed / 10000);

            const barWidth = 60;
            const barHeight = 8;
            const barX = this.player.x - barWidth / 2;
            const barY = this.player.y - 30;

            // Background (grey)
            this.conversationGraphics.fillStyle(0x555555, 1);
            this.conversationGraphics.fillRect(barX, barY, barWidth, barHeight);

            // Progress (bright red for conversation)
            this.conversationGraphics.fillStyle(0xFF0000, 1);
            this.conversationGraphics.fillRect(barX, barY, barWidth * progress, barHeight);

            // Border (white)
            this.conversationGraphics.lineStyle(2, 0xFFFFFF, 1);
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

        // Update and render smoke particles
        this.smokeParticles.splice(0, this.smokeParticles.length, ...this.smokeParticles.filter(particle => {
            // Update particle position
            particle.x += particle.vx * 0.016;  // Assume ~60fps
            particle.y += particle.vy * 0.016;
            particle.life -= 0.016;  // Fade over 1 second
            particle.alpha = particle.life * 0.6;

            // Slow down horizontal movement
            particle.vx *= 0.95;
            particle.vy *= 0.98;

            // Draw particle if still alive
            if (particle.life > 0) {
                this.conversationGraphics.fillStyle(0xCCCCCC, particle.alpha);
                // Bigger smoke particles: start at 6px, expand to 10px as they fade
                this.conversationGraphics.fillCircle(particle.x, particle.y, 6 + (1 - particle.life) * 4);
                return true;
            }
            return false;
        }));

        // Update and render money particles ($)
        this.moneyParticles.splice(0, this.moneyParticles.length, ...this.moneyParticles.filter(particle => {
            // Update particle position - rise upward
            particle.y += particle.vy * 0.016;  // Assume ~60fps
            particle.life -= 0.016;  // Fade over 1.5 seconds
            particle.alpha = Math.min(1.0, particle.life / 1.5);

            // Draw $ symbol if still alive
            if (particle.life > 0) {
                this.conversationGraphics.fillStyle(0x228B22, particle.alpha);  // Money green
                this.conversationGraphics.lineStyle(2, 0x228B22, particle.alpha);

                // Draw $ symbol using text (simple approach)
                const fontSize = 24;
                const tempText = this.scene.add.text(particle.x, particle.y, '$', {
                    fontSize: `${fontSize}px`,
                    color: '#228B22',
                    fontStyle: 'bold'
                });
                tempText.setAlpha(particle.alpha);
                tempText.setOrigin(0.5, 0.5);
                tempText.setDepth(1000);

                // Schedule destruction for next frame
                this.scene.time.delayedCall(0, () => {
                    tempText.destroy();
                });

                return true;
            }
            return false;
        }));
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

    private isPointInVisionCone(
        pointX: number,
        pointY: number,
        bartender: any
    ): boolean {
        const facingAngle = bartender.getData('facingAngle');
        const bartenderX = bartender.x;
        const bartenderY = bartender.y;

        // Vision cone parameters - larger scanning range
        const coneRange = 160;  // 5 tiles = 160 pixels
        const coneAngle = Math.PI / 2.5;  // ~72 degrees cone width

        // Vector from bartender to point
        const dx = pointX - bartenderX;
        const dy = pointY - bartenderY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if point is within range
        if (distance > coneRange) return false;

        // Calculate angle to point
        const angleToPoint = Math.atan2(dy, dx);

        // Calculate angle difference
        let angleDiff = angleToPoint - facingAngle;

        // Normalize angle difference to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // Check if point is within cone angle
        return Math.abs(angleDiff) <= coneAngle / 2;
    }
}
