// Tile type constants and color mappings for the game map

export const TILES = {
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
    POI: 13,  // Point of Interest - attracts patrons
    CHAIR: 14,  // Dark forest green - smoking chairs
    CASH_REGISTER: 15  // Money green - bartenders ring up sales
};

export const COLORS = {
    [TILES.STREET]: 0x707070,      // Grey street
    [TILES.BAR_FLOOR]: 0xD2B48C,  // Tan floor
    [TILES.PATIO]: 0xA0A0A0,      // Light grey patio
    [TILES.WALL]: 0x8B4513,        // Brown walls
    [TILES.DOOR]: 0x000000,        // Black doors (passable)
    [TILES.BAR_COUNTER]: 0x654321, // Dark brown counter
    [TILES.STAFF_ZONE]: 0x4169E1,  // Blue staff area
    [TILES.STAIRS]: 0x6B5F47,      // Grey-brown stairs
    [TILES.BEER_TAP]: 0xFFFF00,    // Yellow beer tap
    [TILES.EMPLOYEE_SPAWN]: 0xFF6B6B,  // Salmon red - employee spawn point
    [TILES.PATRON_SPAWN]: 0xFFA500,    // Orange - patron spawn point
    [TILES.CAMERA_START]: 0x9370DB,    // Medium purple - camera position
    [TILES.POI]: 0x00CED1,            // Dark turquoise - point of interest
    [TILES.CHAIR]: 0x2C5F2D,       // Dark forest green - smoking chairs
    [TILES.CASH_REGISTER]: 0x228B22  // Money green - cash register
};
