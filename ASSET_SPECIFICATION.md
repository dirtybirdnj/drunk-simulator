# Asset Specification for Bar Simulator

This document outlines all bitmap graphics needed for the bar simulator game. Create these assets and place them in the `assets/` folder.

---

## 1. Tileset for Tiled Map Editor

**File:** `assets/tileset.png`

**Tile Size:** 32x32 pixels (recommended) or 64x64 pixels

**Required Tiles:**

### Floor Tiles
- [ ] Wood floor planks (horizontal orientation)
- [ ] Wood floor planks (vertical orientation)
- [ ] Dark tile floor
- [ ] Carpet/rug pattern (optional, for VIP area)

### Wall Tiles
- [ ] Brick wall (full tile)
- [ ] Wood paneling
- [ ] Window (for exterior walls)
- [ ] Door/entrance

### Bar Counter (Top View)
- [ ] Bar counter - left end cap
- [ ] Bar counter - middle section (repeatable)
- [ ] Bar counter - right end cap
- [ ] Bar counter - back section (where bottles are)

### Furniture
- [ ] Round table (top view)
- [ ] Square table (top view)
- [ ] Bar stool
- [ ] Chair - facing down
- [ ] Chair - facing up
- [ ] Chair - facing left
- [ ] Chair - facing right

### Decorative Items
- [ ] Potted plant
- [ ] Dart board
- [ ] Jukebox
- [ ] Pool table (2x3 tiles)
- [ ] Booth seating - top
- [ ] Booth seating - bottom
- [ ] Booth seating - left
- [ ] Booth seating - right

### Props
- [ ] Empty beer glass on table
- [ ] Full beer glass on table
- [ ] Pizza box on table
- [ ] Bottle (on shelf or bar)

**Layout Suggestion:**
Organize tiles in a grid. Example for 32x32 tiles at 256x256px total:
```
Row 1: Floor variations (8 tiles)
Row 2: Walls and doors (8 tiles)
Row 3: Bar counter parts (8 tiles)
Row 4: Tables and chairs (8 tiles)
Row 5: Decorative items (8 tiles)
Row 6: Props and items (8 tiles)
```

**Tiled Setup Notes:**
- In Tiled, create custom property on wall/furniture tiles: `collides: true`
- This allows Phaser to detect collision automatically
- Export with "Embed in Map" checked
- Export format: JSON (uncompressed)

---

## 2. Player Character Spritesheet

**File:** `assets/player.png`

**Frame Size:** 32x32 pixels per frame

**Animation Layout:** 4 rows (directions) × 4 columns (walk cycle frames)

**Total Size:** 128px wide × 128px tall (4×4 grid)

**Layout:**
```
Row 1 (frames 0-3):   Walking DOWN  (facing camera)
Row 2 (frames 4-7):   Walking UP    (facing away)
Row 3 (frames 8-11):  Walking LEFT  (facing left)
Row 4 (frames 12-15): Walking RIGHT (facing right)
```

**Frame Details per Direction:**
- Frame 0: Standing/idle pose
- Frame 1: Left foot forward
- Frame 2: Standing/idle pose (or slight variation)
- Frame 3: Right foot forward

**Character Design Notes:**
- Should be distinguishable from NPCs
- Consider outfit: casual clothes (jeans, t-shirt)
- Clear silhouette for readability at small size
- Optional: Add subtle drunk visual effect (swaying pixels?)

---

## 3. NPC Spritesheets

**File:** `assets/npc-customer.png` (Regular customer)

**Frame Size:** 32x32 pixels per frame

**Layout:** Same as player (4×4 grid)

**Variations Needed:**
1. **Regular Customer 1** - Casual outfit (different from player)
2. **Regular Customer 2** - Business casual
3. **Bartender** - Distinct outfit (vest, bow tie, or apron)

You can create separate files for each:
- `assets/npc-customer1.png`
- `assets/npc-customer2.png`
- `assets/npc-bartender.png`

**OR** create one large sheet with all variations:
- `assets/npc-sprites.png` (128px × 384px for 3 characters)

**Animation Layout:** Same as player sprite (4 directions, 4 frames each)

---

## 4. Interactive Objects

### Beer Glass
**File:** `assets/beer.png`

**Size:** 32x32 pixels (or 24x24 centered in 32x32)

**Design:**
- Top-down view of beer mug/glass
- Golden liquid visible
- Optional foam on top

---

### Pizza
**File:** `assets/pizza.png`

**Size:** 32x32 pixels

**Design:**
- Single pizza slice OR small pizza box (top view)
- Clear, recognizable even at small size
- Bright colors (red sauce, yellow cheese)

---

### Speech Bubble / Interaction Indicator
**File:** `assets/speech-bubble.png`

**Size:** 24x24 pixels (or 32x32)

**Design:**
- Classic speech bubble shape
- White with black outline
- Will appear above NPC heads when they can be interacted with

**Variations (optional):**
- `assets/exclamation.png` - For NPCs needing service
- `assets/question.png` - For NPCs with quests/dialogue

---

### Interaction Prompt
**File:** `assets/prompt-space.png`

**Size:** 64x32 pixels (wider rectangle)

**Design:**
- "PRESS SPACE" text or space bar icon
- Semi-transparent background
- Clear, readable font

---

## 5. UI Elements

### Objective Panel Background
**File:** `assets/ui/panel-bg.png`

**Size:** 320x200 pixels (scalable)

**Design:**
- Dark semi-transparent panel
- Optional border/frame
- Can be 9-slice scaled

---

### Icons for Objectives
**File:** `assets/ui/icons.png` (icon sheet)

**Frame Size:** 24x24 pixels per icon

**Icons Needed:**
1. Beer mug icon (for "serve beer" objective)
2. Chat bubble icon (for "talk to customer")
3. Pizza slice icon (for "buy pizza")
4. Checkmark icon (for completed objectives)

**Layout:** 4 icons in a row (96px × 24px total)

---

## 6. Optional Polish Assets

### Particle Effects (Optional)
**File:** `assets/particles.png`

**Contents:**
- Small star/sparkle (8x8px) - for successful interactions
- Heart shape (16x16px) - for happy customers
- Money icon (16x16px) - for transactions

---

### Floor Effects (Optional)
**File:** `assets/spill.png`

**Size:** 32x32 or 48x48

**Design:**
- Beer spill puddle (liquid on floor)
- Used for environmental storytelling/obstacles

---

## Asset Creation Guidelines

### General Requirements:
1. **Pixel Art Style** - Clean, readable pixels
2. **Consistent Palette** - Use limited color palette across all assets
3. **High Contrast** - Ensure readability on various backgrounds
4. **Transparent Background** - Use PNG with alpha channel
5. **No Anti-aliasing** - Pure pixel art (or minimal AA if scaling)

### Color Palette Suggestions:
- **Wood tones:** #8B4513, #D2691E, #CD853F
- **Stone/walls:** #696969, #808080, #A9A9A9
- **Player character:** #4169E1 (blue shirt), #8B4513 (brown pants)
- **NPCs:** Varied but distinct (red, green, purple outfits)
- **Beer:** #FFD700 (golden), #FFFFFF (foam)
- **Pizza:** #FF6347 (sauce), #FFD700 (cheese)

### Tool Recommendations:
- **Aseprite** - Professional pixel art editor
- **Piskel** - Free online pixel art tool
- **GraphicsGale** - Free pixel art tool
- **Photoshop/GIMP** - With pencil tool and no anti-aliasing

---

## Map Layout Suggestion

When creating the bar map in Tiled, consider this layout:

```
┌─────────────────────────────────────────┐
│  [ENTRANCE]                    [WINDOW] │
│                                          │
│  [TABLE] [TABLE]           ┌────────┐   │
│                            │        │   │
│  [TABLE] [TABLE]           │  BAR   │   │
│                            │COUNTER │   │
│  ░░░░░░░                   │        │   │
│  ░POOL░░  [JUKE            └────────┘   │
│  ░TABLE░   BOX]                [STOOLS] │
│  ░░░░░░░                                 │
│                                          │
│  [DART]                    [BOOTH]      │
│  [BOARD]                   [SEATING]    │
│                                          │
└─────────────────────────────────────────┘
```

**Recommended Map Size:** 40×30 tiles (1280×960 pixels at 32px tiles)

**Layers in Tiled:**
1. **Background/Floor** - Floor tiles (no collision)
2. **Walls** - Outer walls, windows (collision: true)
3. **Furniture** - Tables, bar counter, pool table (collision: true)
4. **Decoration** - Plants, dartboard, jukebox (collision: optional)
5. **Objects** - Spawn points, interaction zones (invisible in game)

---

## Asset Checklist Summary

### Critical (Game Won't Work Without These):
- [ ] `tileset.png` - Complete tileset with floor, walls, furniture
- [ ] `bar-map.json` - Tiled exported map
- [ ] `player.png` - Player character spritesheet (4×4 grid)
- [ ] `npc-customer1.png` - At least one NPC spritesheet

### Important (Game Will Work But Limited):
- [ ] `beer.png` - Beer object
- [ ] `pizza.png` - Pizza object
- [ ] `speech-bubble.png` - Interaction indicator
- [ ] `npc-bartender.png` - Bartender NPC

### Nice to Have (Polish):
- [ ] `ui/panel-bg.png` - UI panel background
- [ ] `ui/icons.png` - Objective icons
- [ ] `prompt-space.png` - Interaction prompt
- [ ] Additional NPC variations
- [ ] Decorative effects/particles

---

## Testing Your Assets

1. Place all assets in `assets/` folder
2. Open `index.html` in browser with local server
3. Check browser console for loading errors
4. Verify tileset displays correctly in Tiled before exporting
5. Ensure sprite animations look smooth (test in Phaser)

**Test Server Command:**
```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

---

## Next Steps After Creating Assets

1. Create basic tileset with minimal tiles (floor, wall, table, chair)
2. Build simple bar layout in Tiled (20×15 tiles to start)
3. Export Tiled map as JSON
4. Create simple player sprite (even just 1 frame per direction to start)
5. Test loading in Phaser
6. Iterate and add more detailed assets

**Start simple, test early, iterate!**
