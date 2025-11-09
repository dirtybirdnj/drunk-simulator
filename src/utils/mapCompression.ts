/**
 * Map Compression Utility for QR Code Sharing
 *
 * Compresses 40×70 tile maps (2,800 tiles) into QR-compatible format:
 * - Each tile is 0-15 (4 bits)
 * - Pack 2 tiles per byte
 * - Encode as Base64 for QR code compatibility
 * - Result: ~1,900 bytes (fits comfortably in QR code)
 */

export interface MapData {
    grid: number[][];
    width: number;
    height: number;
}

/**
 * Compress a map grid into a Base64 string for QR code encoding
 */
export function compressMap(grid: number[][]): string {
    const height = grid.length;
    const width = grid[0]?.length || 0;

    if (height === 0 || width === 0) {
        throw new Error('Invalid grid dimensions');
    }

    // Flatten grid into 1D array
    const tiles: number[] = [];
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const tileValue = grid[row][col];
            if (tileValue < 0 || tileValue > 15) {
                throw new Error(`Invalid tile value ${tileValue} at (${row}, ${col}). Must be 0-15.`);
            }
            tiles.push(tileValue);
        }
    }

    // Pack two 4-bit tiles into each byte
    const bytes: number[] = [];
    for (let i = 0; i < tiles.length; i += 2) {
        const tile1 = tiles[i];
        const tile2 = tiles[i + 1] || 0; // Pad with 0 if odd number of tiles
        const packed = (tile1 << 4) | tile2; // High nibble = tile1, low nibble = tile2
        bytes.push(packed);
    }

    // Prepend width and height (2 bytes each, max 255×255)
    const header = [width, height];
    const fullData = [...header, ...bytes];

    // Convert to Base64
    const binaryString = String.fromCharCode(...fullData);
    const base64 = btoa(binaryString);

    return base64;
}

/**
 * Decompress a Base64 string back into a map grid
 */
export function decompressMap(base64: string): MapData {
    try {
        // Decode Base64
        const binaryString = atob(base64);
        const bytes: number[] = [];
        for (let i = 0; i < binaryString.length; i++) {
            bytes.push(binaryString.charCodeAt(i));
        }

        // Extract header (width, height)
        if (bytes.length < 2) {
            throw new Error('Invalid compressed data: too short');
        }
        const width = bytes[0];
        const height = bytes[1];
        const dataBytes = bytes.slice(2);

        // Unpack tiles (2 tiles per byte)
        const tiles: number[] = [];
        for (const byte of dataBytes) {
            const tile1 = (byte >> 4) & 0x0F; // High nibble
            const tile2 = byte & 0x0F;        // Low nibble
            tiles.push(tile1, tile2);
        }

        // Trim to exact grid size
        const expectedTiles = width * height;
        tiles.length = expectedTiles;

        // Reconstruct 2D grid
        const grid: number[][] = [];
        for (let row = 0; row < height; row++) {
            const rowData: number[] = [];
            for (let col = 0; col < width; col++) {
                const index = row * width + col;
                rowData.push(tiles[index]);
            }
            grid.push(rowData);
        }

        return { grid, width, height };
    } catch (error) {
        throw new Error(`Failed to decompress map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Get the compressed size in bytes for a given grid
 */
export function getCompressedSize(grid: number[][]): number {
    const height = grid.length;
    const width = grid[0]?.length || 0;
    const totalTiles = width * height;
    const packedBytes = Math.ceil(totalTiles / 2);
    const headerBytes = 2; // width + height
    return headerBytes + packedBytes;
}

/**
 * Estimate if a grid will fit in a QR code
 * QR Code Version 40 with Medium error correction: ~2,331 bytes
 * Base64 encoding adds ~33% overhead, so practical limit is ~1,750 binary bytes
 */
export function willFitInQRCode(grid: number[][]): boolean {
    const compressedSize = getCompressedSize(grid);
    const base64Size = Math.ceil(compressedSize * 4 / 3); // Base64 expansion
    const QR_LIMIT = 2331; // Version 40, Medium error correction
    return base64Size <= QR_LIMIT;
}
