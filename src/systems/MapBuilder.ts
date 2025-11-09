import Phaser from 'phaser';
import { TILES, COLORS } from './TileTypes';

export class MapBuilder {
    private scene: Phaser.Scene;
    private walls: Phaser.Physics.Arcade.StaticGroup;
    private TILE_SIZE: number;

    constructor(scene: Phaser.Scene, walls: Phaser.Physics.Arcade.StaticGroup, tileSize: number) {
        this.scene = scene;
        this.walls = walls;
        this.TILE_SIZE = tileSize;
    }

    buildMap(
        selectedMapData: number[][] | null,
        MAP_ROWS: number,
        MAP_COLS: number,
        beerTaps: Array<{x: number, y: number}>,
        pois: Array<{x: number, y: number}>,
        chairs: Array<{x: number, y: number, occupied: boolean, occupant: any}>,
        cashRegisters: Array<{x: number, y: number}>,
        barServiceZones: Array<{x: number, y: number, width: number, height: number, tapIndex: number}>
    ): {
        map: number[][],
        MAP_ROWS: number,
        MAP_COLS: number,
        playerStartX: number,
        playerStartY: number,
        employeeSpawns: Array<{x: number, y: number}>,
        patronSpawns: Array<{x: number, y: number}>
    } {
        // ============================================================
        // HOW TO UPDATE THIS MAP:
        // 1. Open http://localhost:3000/map-editor.html
        // 2. Design your map using the visual editor
        // 3. Click the blue "Copy Map" button or "Save Map"
        // 4. Use the boot menu to load your saved map!
        // ============================================================

        // Use selected map if available, otherwise use default
        let map: number[][];

        if (selectedMapData) {
            // Use the loaded map from editor or saved maps
            map = selectedMapData;
            // Update map dimensions to match loaded map
            MAP_ROWS = map.length;
            MAP_COLS = map[0]?.length || 40;
            console.log(`📍 Building map from loaded data: ${MAP_COLS}×${MAP_ROWS}`);
        } else {
            // Blank 40×70 placeholder map - design your new base map in the map editor!
            // All tiles start as street (0). Use map-editor.html to design and save your map.
            map = Array(70).fill(null).map(() => Array(40).fill(0));
            MAP_ROWS = 70;
            MAP_COLS = 40;
            console.log('📍 Using default map');
        }

        // Find player start position (marked with 8)
        let playerStartCol = 16;
        let playerStartRow = 31;
        let foundMarker = false;

        for (let row = 0; row < MAP_ROWS; row++) {
            for (let col = 0; col < MAP_COLS; col++) {
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
        const playerStartX = playerStartCol * this.TILE_SIZE + 16;
        const playerStartY = playerStartRow * this.TILE_SIZE + 16;

        console.log(`🎯 Player will spawn at pixel (${playerStartX}, ${playerStartY})`);
        console.log(`📍 That's grid position (${playerStartCol}, ${playerStartRow})`);

        const employeeSpawns: Array<{x: number, y: number}> = [];
        const patronSpawns: Array<{x: number, y: number}> = [];

        // Render the map
        for (let row = 0; row < MAP_ROWS; row++) {
            for (let col = 0; col < MAP_COLS; col++) {
                let tileType = map[row][col];

                // Store beer tap locations (can be multiple)
                if (tileType === TILES.BEER_TAP) {
                    beerTaps.push({
                        x: col * this.TILE_SIZE + 16,
                        y: row * this.TILE_SIZE + 16
                    });
                }

                // Store employee spawn locations
                if (tileType === TILES.EMPLOYEE_SPAWN) {
                    employeeSpawns.push({
                        x: col * this.TILE_SIZE + 16,
                        y: row * this.TILE_SIZE + 16
                    });
                }

                // Store patron spawn locations
                if (tileType === TILES.PATRON_SPAWN) {
                    patronSpawns.push({
                        x: col * this.TILE_SIZE + 16,
                        y: row * this.TILE_SIZE + 16
                    });
                }

                // Store camera start location - not used in return value, but logged
                if (tileType === TILES.CAMERA_START) {
                    const cameraStartX = col * this.TILE_SIZE + 16;
                    const cameraStartY = row * this.TILE_SIZE + 16;
                    console.log(`📷 Camera start marker found at (${cameraStartX}, ${cameraStartY})`);
                }

                // Store POI locations
                if (tileType === TILES.POI) {
                    pois.push({
                        x: col * this.TILE_SIZE + 16,
                        y: row * this.TILE_SIZE + 16
                    });
                    console.log(`🎯 POI #${pois.length - 1} at (${col * this.TILE_SIZE + 16}, ${row * this.TILE_SIZE + 16})`);
                }

                // Store chair locations
                if (tileType === TILES.CHAIR) {
                    chairs.push({
                        x: col * this.TILE_SIZE + 16,
                        y: row * this.TILE_SIZE + 16,
                        occupied: false,
                        occupant: null
                    });
                    console.log(`🪑 Chair #${chairs.length - 1} at (${col * this.TILE_SIZE + 16}, ${row * this.TILE_SIZE + 16})`);
                }

                // Store cash register locations
                if (tileType === TILES.CASH_REGISTER) {
                    cashRegisters.push({
                        x: col * this.TILE_SIZE + 16,
                        y: row * this.TILE_SIZE + 16
                    });
                    console.log(`💰 Cash register at (${col * this.TILE_SIZE + 16}, ${row * this.TILE_SIZE + 16})`);
                }

                // Detect bar counters and create service zones (patrons stand adjacent to counter)
                if (tileType === TILES.BAR_COUNTER) {
                    // Check if there's a floor tile to the left (service zone)
                    if (col > 0 && map[row][col - 1] === TILES.BAR_FLOOR) {
                        barServiceZones.push({
                            x: (col - 1) * this.TILE_SIZE,
                            y: row * this.TILE_SIZE,
                            width: this.TILE_SIZE,
                            height: this.TILE_SIZE,
                            tapIndex: -1  // Will be assigned in second pass
                        });
                    }
                    // Check if there's a floor tile to the right
                    if (col < MAP_COLS - 1 && map[row][col + 1] === TILES.BAR_FLOOR) {
                        barServiceZones.push({
                            x: (col + 1) * this.TILE_SIZE,
                            y: row * this.TILE_SIZE,
                            width: this.TILE_SIZE,
                            height: this.TILE_SIZE,
                            tapIndex: -1  // Will be assigned in second pass
                        });
                    }
                    // Check if there's a floor tile above
                    if (row > 0 && map[row - 1][col] === TILES.BAR_FLOOR) {
                        barServiceZones.push({
                            x: col * this.TILE_SIZE,
                            y: (row - 1) * this.TILE_SIZE,
                            width: this.TILE_SIZE,
                            height: this.TILE_SIZE,
                            tapIndex: -1  // Will be assigned in second pass
                        });
                    }
                    // Check if there's a floor tile below
                    if (row < MAP_ROWS - 1 && map[row + 1][col] === TILES.BAR_FLOOR) {
                        barServiceZones.push({
                            x: col * this.TILE_SIZE,
                            y: (row + 1) * this.TILE_SIZE,
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
        barServiceZones.forEach((zone) => {
            let closestTapIndex = 0;
            let closestDist = Infinity;

            beerTaps.forEach((tap, index) => {
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

        console.log(`📍 Created ${barServiceZones.length} bar service zones:`);
        barServiceZones.forEach((zone, i) => {
            const gridX = zone.x / this.TILE_SIZE;
            const gridY = zone.y / this.TILE_SIZE;
            console.log(`  Zone ${i}: Grid(${gridX},${gridY}) Pixel(${zone.x},${zone.y}) → Tap ${zone.tapIndex}`);
        });

        return {
            map,
            MAP_ROWS,
            MAP_COLS,
            playerStartX,
            playerStartY,
            employeeSpawns,
            patronSpawns
        };
    }

    private addTile(col: number, row: number, tileType: number) {
        const x = col * this.TILE_SIZE;
        const y = row * this.TILE_SIZE;

        // Draw tile
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(COLORS[tileType], 1);
        graphics.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
        graphics.setDepth(0);

        // Add collision for walls, bar counter, and beer taps
        if (tileType === TILES.WALL || tileType === TILES.BAR_COUNTER || tileType === TILES.BEER_TAP) {
            const collider = this.walls.create(x + 16, y + 16, undefined);
            collider.setSize(32, 32);
            collider.setOrigin(0.5, 0.5);
            collider.refreshBody();
            collider.setVisible(false);
        }
    }
}
