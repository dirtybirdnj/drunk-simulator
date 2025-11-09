const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const TILE_SIZE = 32;

// Color palette
const COLORS = {
    street: '#707070',      // Grey asphalt
    bar: '#D2B48C',         // Tan wood floor
    patio: '#A0A0A0',       // Light grey concrete
    wall: '#8B4513',        // Brown
    counter: '#654321',     // Dark brown
    table: '#654321',       // Dark brown
    stairs: '#6B5F47'       // Grey-brown
};

// ASCII tile designs (16x16 chars each, will render to 32x32 pixels)
const tiles = {
    0: { // Street
        color: COLORS.street,
        ascii: [
            '░░░░░░░░░░░░░░░░',
            '░░▓▓░░░░░░░░░░░░',
            '░░░░░░░░░░░░▓▓░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░▓▓░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░▓▓░░░░░░░░░░░░',
            '░░░░░░░░░░▓▓░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░▓▓░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░▓▓░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░'
        ]
    },
    1: { // Bar floor (tan wood)
        color: COLORS.bar,
        ascii: [
            '                ',
            '                ',
            '                ',
            '                ',
            '                ',
            '                ',
            '                ',
            '                ',
            '                ',
            '                ',
            '                ',
            '                ',
            '                ',
            '                ',
            '                ',
            '                '
        ]
    },
    2: { // Patio
        color: COLORS.patio,
        ascii: [
            '░░░░░░░░░░░░░░░░',
            '░ ░ ░ ░ ░ ░ ░ ░',
            '░░░░░░░░░░░░░░░░',
            ' ░ ░ ░ ░ ░ ░ ░ ',
            '░░░░░░░░░░░░░░░░',
            '░ ░ ░ ░ ░ ░ ░ ░',
            '░░░░░░░░░░░░░░░░',
            ' ░ ░ ░ ░ ░ ░ ░ ',
            '░░░░░░░░░░░░░░░░',
            '░ ░ ░ ░ ░ ░ ░ ░',
            '░░░░░░░░░░░░░░░░',
            ' ░ ░ ░ ░ ░ ░ ░ ',
            '░░░░░░░░░░░░░░░░',
            '░ ░ ░ ░ ░ ░ ░ ░',
            '░░░░░░░░░░░░░░░░',
            ' ░ ░ ░ ░ ░ ░ ░ '
        ]
    },
    3: { // Wall horizontal
        color: COLORS.wall,
        ascii: [
            '████████████████',
            '████████████████',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓'
        ]
    },
    4: { // Wall vertical
        color: COLORS.wall,
        ascii: [
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '██▓▓▓▓▓▓▓▓▓▓▓▓▓▓'
        ]
    },
    5: { // Door
        color: COLORS.wall,
        ascii: [
            '██▓▓▓▓▓▓▓▓▓▓▓▓██',
            '██▓▓▓▓▓▓▓▓▓▓▓▓██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██',
            '██░░░░░░░░░░░░██'
        ]
    },
    6: { // Bar counter horizontal
        color: COLORS.counter,
        ascii: [
            '████████████████',
            '████████████████',
            '████████████████',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░'
        ]
    },
    7: { // Bar counter vertical
        color: COLORS.counter,
        ascii: [
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░',
            '███▓▓▓░░░░░░░░░░'
        ]
    },
    8: { // Table
        color: COLORS.table,
        ascii: [
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░██████████░░',
            '░░░░██████████░░',
            '░░░░██▓▓▓▓▓▓██░░',
            '░░░░██▓▓▓▓▓▓██░░',
            '░░░░██▓▓▓▓▓▓██░░',
            '░░░░██▓▓▓▓▓▓██░░',
            '░░░░██████████░░',
            '░░░░██████████░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░',
            '░░░░░░░░░░░░░░░░'
        ]
    },
    9: { // Stairs
        color: COLORS.stairs,
        ascii: [
            '░░░░░░░░▓▓▓▓▓▓▓▓',
            '░░░░░░░░▓▓▓▓▓▓▓▓',
            '░░░░▓▓▓▓▓▓▓▓▓▓▓▓',
            '░░░░▓▓▓▓▓▓▓▓▓▓▓▓',
            '░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
            '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓'
        ]
    }
};

function adjustBrightness(color, factor) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    const nr = Math.max(0, Math.min(255, Math.round(r * factor)));
    const ng = Math.max(0, Math.min(255, Math.round(g * factor)));
    const nb = Math.max(0, Math.min(255, Math.round(b * factor)));

    return `rgb(${nr}, ${ng}, ${nb})`;
}

function drawTile(ctx, tileData, x, y) {
    const baseColor = tileData.color;
    const ascii = tileData.ascii;

    for (let row = 0; row < 16; row++) {
        for (let col = 0; col < 16; col++) {
            const char = ascii[row][col];
            let color;

            // Map ASCII chars to brightness levels
            if (char === ' ') {
                color = baseColor;
            } else if (char === '░') {
                color = adjustBrightness(baseColor, 0.9);
            } else if (char === '▓') {
                color = adjustBrightness(baseColor, 0.7);
            } else if (char === '█') {
                color = adjustBrightness(baseColor, 0.5);
            } else {
                color = baseColor;
            }

            ctx.fillStyle = color;
            ctx.fillRect(x + col * 2, y + row * 2, 2, 2);
        }
    }
}

// Create 256x256 canvas (8x8 tiles of 32x32 each)
const canvas = createCanvas(256, 256);
const ctx = canvas.getContext('2d');

// Clear canvas
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, 256, 256);

// Draw tiles in 8x8 grid
let tileIndex = 0;
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        if (tiles[tileIndex]) {
            const x = col * 32;
            const y = row * 32;
            drawTile(ctx, tiles[tileIndex], x, y);
        }
        tileIndex++;
    }
}

// Save to file
const outputPath = path.join(__dirname, 'public', 'assets', 'tileset.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log(`Tileset generated: ${outputPath}`);
