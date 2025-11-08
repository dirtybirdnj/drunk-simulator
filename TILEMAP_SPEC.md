# Tilemap Asset Specification for Bar Simulator

This document specifies the exact tiles you need to create for the bar game world.

## Tile Size
**32x32 pixels per tile**

## Tileset Image: `tileset.png`

Create a PNG image with all tiles arranged in a grid. Recommended size: **256x256px** (8 tiles × 8 tiles)

---

## Required Tiles (Minimum Viable Set)

### Row 1: Floor Tiles (8 tiles)
1. **Dark grey asphalt** - Street surface (`#404040`)
2. **White tile** - Bar interior floor (`#FFFFFF`)
3. **Light grey concrete** - Patio floor (`#A0A0A0`)
4. **Wood floor 1** - Entrance area (`#8B6F47`)
5. **Wood floor 2** - Stairs (`#6B5F47`)
6. **Wood floor 3** - Variation
7. **Blank/unused**
8. **Blank/unused**

### Row 2: Walls (8 tiles)
9. **Brown wall - horizontal** - Top/bottom walls (`#8B4513`)
10. **Brown wall - vertical** - Left/right walls (`#8B4513`)
11. **Brown wall - top-left corner**
12. **Brown wall - top-right corner**
13. **Brown wall - bottom-left corner**
14. **Brown wall - bottom-right corner**
15. **Door frame** - Entrance door
16. **Blank/unused**

### Row 3: Bar Counter (8 tiles)
17. **Bar counter - horizontal left end** (dark brown `#654321`)
18. **Bar counter - horizontal middle** (repeatable)
19. **Bar counter - horizontal right end**
20. **Bar counter - vertical top end** (for L-shape)
21. **Bar counter - vertical middle** (repeatable)
22. **Bar counter - vertical bottom end**
23. **Bar counter - corner piece** (L-shape corner)
24. **Blank/unused**

### Row 4: Furniture (8 tiles)
25. **Table - square** (brown `#654321`)
26. **Table - round**
27. **Chair - top view**
28. **Stool - top view**
29. **Blank/unused**
30. **Blank/unused**
31. **Blank/unused**
32. **Blank/unused**

### Rows 5-8: Reserved for Future Use
- Decorations (plants, dartboard, etc.)
- Props (glasses, bottles, etc.)
- Effects (spills, etc.)

---

## Color Palette Reference

```
Street:         #404040 (dark grey)
Bar Interior:   #FFFFFF (white)
Patio:          #A0A0A0 (light grey)
Walls:          #8B4513 (brown)
Bar Counter:    #654321 (dark brown)
Wood Floor:     #8B6F47 (tan/brown)
Furniture:      #654321 (dark brown)
```

---

## Map Layout Plan

**Map Size:** 32 tiles wide × 44 tiles tall (1024×1408 pixels)

### Layers in Tiled (from bottom to top):
1. **Floor** - All floor tiles (no collision)
2. **Walls** - Outer walls and doors (collision on walls)
3. **Furniture** - Bar counter, tables, chairs (collision enabled)
4. **Objects** - Spawn points, interaction zones (invisible in game)

### Area Breakdown:

```
STREET (0-4 tiles from top)
├─ Dark grey asphalt floor
└─ No walls

ENTRANCE (tiles 5-8)
├─ White/wood floor
├─ Walls on left and right (with door gap in middle)
└─ Two door frames

STAIRS (tiles 9-12)
├─ Wood floor tiles going up
└─ No walls on sides (shows white floor)

MAIN BAR ROOM (tiles 13-34)
├─ White floor throughout
├─ Walls on left and right sides
├─ L-shaped bar counter in upper-left
│  ├─ Horizontal section: ~11 tiles wide
│  └─ Vertical section: ~12 tiles tall
└─ 4 tables scattered on right side

PATIO (tiles 35-43)
├─ Light grey concrete floor
├─ Walls on left, right, and back
├─ Door opening at top (connecting to bar)
└─ No furniture (empty for now)
```

---

## Tiled Editor Setup Instructions

### 1. Create New Tileset
1. Open Tiled
2. File → New → New Tileset
3. Name: `bar-tileset`
4. Type: Based on Tileset Image
5. Image: Browse to your `tileset.png`
6. Tile width: 32px
7. Tile height: 32px
8. Margin: 0
9. Spacing: 0

### 2. Create New Map
1. File → New → New Map
2. Orientation: Orthogonal
3. Tile layer format: CSV (or Base64 uncompressed)
4. Map size: 32 tiles wide × 44 tiles tall
5. Tile size: 32×32 pixels

### 3. Add Collision Properties
For tiles that should block movement:
1. Select the tile in the Tileset panel
2. In Properties panel (bottom-left), click "+"
3. Add custom property: `collides` (type: bool, value: true)
4. Apply to: all wall tiles, bar counter tiles, furniture tiles

### 4. Create Layers
Create these layers in order (bottom to top):
1. **Floor** - all floor tiles
2. **Walls** - all wall tiles (mark with collides=true)
3. **Furniture** - bar, tables, chairs (mark with collides=true)
4. **Objects** - (optional) spawn points, etc.

### 5. Export Settings
1. File → Export As → JSON
2. **IMPORTANT**: Check "Embed tileset"
3. Save as `bar-map.json` in `/public/assets/`

---

## Quick Start Drawing Guide

If you're using a pixel art tool (Aseprite, Piskel, etc.):

### Simple Version (Start Here):
1. Create 256×256px canvas
2. Enable grid: 32×32px
3. Draw these essential tiles first:
   - Dark grey square (street)
   - White square (bar floor)
   - Light grey square (patio)
   - Brown rectangle (wall)
   - Dark brown rectangle (bar counter)
   - Dark brown square (table)

### Detailed Version (Optional):
- Add texture to floors (wood grain, tile patterns)
- Add shading to walls (3D depth)
- Add details to furniture (table legs, counter edge)
- Add corner pieces for walls (rounded or beveled)

---

## File Organization

```
drunk-simulator/
├── public/
│   └── assets/
│       ├── tileset.png       ← Your drawn tileset (256×256px)
│       └── bar-map.json      ← Exported from Tiled
└── src/
    └── scenes/
        └── GameScene.ts      ← Will load the tilemap
```

---

## Testing Your Tileset

1. Create `tileset.png` with at least the essential tiles
2. Open Tiled and create the map following the layout plan
3. Export as JSON with "Embed tileset" checked
4. Place both files in `/public/assets/`
5. We'll update the game code to load your tilemap

---

## What to Create RIGHT NOW (Minimal Set):

To get started immediately, you only need **6 tiles**:

1. **Tile 0**: Dark grey square (street)
2. **Tile 1**: White square (bar floor)
3. **Tile 2**: Light grey square (patio)
4. **Tile 3**: Brown bar (wall - can use same for horizontal/vertical)
5. **Tile 4**: Dark brown bar (bar counter)
6. **Tile 5**: Dark brown square (table)

That's it! Draw these 6 tiles in a 64×96px image (2 tiles wide × 3 tiles tall) and we can start building in Tiled.

---

## Next Steps After Creating Tileset

1. ✅ Draw tileset.png
2. ✅ Install Tiled (if not already): https://www.mapeditor.org/
3. ✅ Create map in Tiled following the layout plan
4. ✅ Export as JSON with embedded tileset
5. ✅ Tell me when ready and I'll update the game code to load it

Let me know when you have the tileset ready and I'll help integrate it!
