# Quick Start: Create Your First Tileset

## Absolute Minimum to Get Started

You need **ONE image file** with just **6 tiles** to get this working.

---

## Create `tileset.png`

### Canvas Setup:
- **Size**: 64px wide × 96px tall
- **Grid**: 32×32 pixels
- **Format**: PNG with transparency (or solid background)

### Draw These 6 Tiles:

```
[0: Street]  [1: Bar Floor]
[2: Patio]   [3: Wall]
[4: Counter] [5: Table]
```

### Tile Details:

**Tile 0 (0,0) - Street**
- 32×32px square
- Fill with dark grey: `#404040`

**Tile 1 (32,0) - Bar Interior Floor**
- 32×32px square
- Fill with white: `#FFFFFF`

**Tile 2 (0,32) - Patio Floor**
- 32×32px square
- Fill with light grey: `#A0A0A0`

**Tile 3 (32,32) - Wall**
- 32×32px rectangle
- Fill with brown: `#8B4513`

**Tile 4 (0,64) - Bar Counter**
- 32×32px rectangle
- Fill with dark brown: `#654321`

**Tile 5 (32,64) - Table**
- 32×32px square
- Fill with dark brown: `#654321`

---

## Template ASCII Art Reference:

```
+--------+--------+
| STREET |  BAR   |  <- Row 0 (y=0)
| #404040| #FFFFFF|
+--------+--------+
| PATIO  |  WALL  |  <- Row 1 (y=32)
| #A0A0A0| #8B4513|
+--------+--------+
|COUNTER | TABLE  |  <- Row 2 (y=64)
| #654321| #654321|
+--------+--------+
```

---

## Tools You Can Use:

### Online (Free):
- **Piskel** - https://www.piskelapp.com/
- **Pixilart** - https://www.pixilart.com/draw

### Desktop (Free):
- **GIMP** - Use pencil tool, disable anti-aliasing
- **Paint** (Windows) - Set to 1px brush
- **Preview** (Mac) - Markup tools

### Paid:
- **Aseprite** - Best for pixel art
- **Photoshop** - Use pencil tool

---

## Piskel Quick Guide:

1. Go to https://www.piskelapp.com/
2. Click "Create Sprite"
3. Set canvas to 64×96
4. Enable grid (32×32)
5. Use fill tool to create solid color squares
6. Export as PNG
7. Save as `tileset.png`

---

## Where to Put the File:

```
drunk-simulator/
└── public/
    └── assets/
        └── tileset.png  ← Put your file here
```

Create the folders if they don't exist:
```bash
mkdir -p public/assets
```

---

## Once You Have `tileset.png`:

**Option A: Skip Tiled for now (fastest)**
Tell me you have the tileset and I can hardcode a simple map layout in the game to test it immediately.

**Option B: Use Tiled (proper way)**
1. Download Tiled: https://www.mapeditor.org/
2. Follow TILEMAP_SPEC.md to create the full map
3. Export as JSON
4. I'll integrate it into the game

---

## Example: Create with Command Line (macOS/Linux)

If you have ImageMagick installed:

```bash
# Create 6 solid color tiles
convert -size 32x32 xc:'#404040' tile0.png
convert -size 32x32 xc:'#FFFFFF' tile1.png
convert -size 32x32 xc:'#A0A0A0' tile2.png
convert -size 32x32 xc:'#8B4513' tile3.png
convert -size 32x32 xc:'#654321' tile4.png
convert -size 32x32 xc:'#654321' tile5.png

# Combine into tileset
montage tile0.png tile1.png tile2.png tile3.png tile4.png tile5.png \
  -tile 2x3 -geometry 32x32+0+0 public/assets/tileset.png

# Clean up
rm tile*.png
```

---

## What Happens Next:

1. You create `tileset.png` (6 colored squares)
2. Put it in `public/assets/tileset.png`
3. Tell me it's ready
4. I'll either:
   - Hardcode a quick map layout (fast test), OR
   - Help you use Tiled to design the full map (proper way)

Let me know when you're ready!
