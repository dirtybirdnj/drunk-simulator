# Drunk Simulator - Dual Editor Architecture

**CRITICAL**: This project has TWO separate map editors that must remain synchronized.

## Two Editor Systems

### 1. Premium Desktop Editor (`map-editor.html`)
- **Platform**: Desktop only (HTML/DOM-based)
- **Access**: Premium version ($15 on itch.io) or GitHub developer build
- **Features**:
  - Full-featured visual editor
  - Larger grid support (up to 40×70)
  - QR code generation and export
  - Save/load up to 10 maps
  - Advanced controls (fill tool, undo, zoom)
- **UI**: Standalone HTML page with sidebar palette
- **Location**: `map-editor.html`

### 2. Free Mobile Editor (Phaser-based)
- **Platform**: Mobile-first (iOS/Android/Web)
- **Access**: Free game version (included in all builds)
- **Features**:
  - In-game tile placement
  - Bottom bar tile palette
  - Edit/Active mode switching
  - Limited to free game world sizes (10×18, 15×27, 20×36)
  - Auto-save to localStorage
- **UI**: Phaser scene overlay (EditorUI component)
- **Location**: `src/scenes/GameScene.ts` (EditorUI class)

## Shared Components

Both editors MUST use identical:

### Map Format
- 2D array of numbers: `number[][]`
- Each cell represents a tile type (0-15)
- Serialization: `src/utils/grid.ts`

### Tile Types (0-15)
```typescript
0 = Empty/Black
1 = Floor (white)
2 = Wall (brown)
3 = Bartop (orange)
4 = Cash Register
5 = Door/Entrance
6 = Beer Tap
7 = Staff Spawn
8 = Patron Spawn
9 = Chair
10 = Table
11 = Patio/Outdoor
12 = Grass
13 = Reserved (future)
14 = Reserved (future)
15 = Reserved (future)
```

### Color Palette
Both editors use identical colors defined in:
- Premium: `map-editor.html` (COLORS array)
- Free: `src/scenes/GameScene.ts` (TILE_COLORS object)

**CRITICAL**: When adding new tile types, update BOTH locations.

### LocalStorage Keys
- `drunkSimMaps` - Saved maps from premium editor
- `drunkSimCompletedLevels` - Level progression tracking
- `drunkSimCurrentLayout` - Auto-saved layout from free editor

## Editor Mode States

### Free Mobile Editor (Phaser)

**EDIT Mode**:
- Game simulation paused
- Bottom bar shows tile palette
- Click/tap grid to place tiles
- Can switch tiles via palette
- Can clear/restart layout
- Button: "Start Game" → transitions to ACTIVE mode

**ACTIVE Mode**:
- Game simulation running
- Bottom bar shows playback controls
- Grid is locked (no editing)
- Controls: Pause, Fast Forward, Slow Down
- Button: "Restart" → clears simulation, returns to EDIT mode

**Rule**: Once ACTIVE mode starts, player CANNOT edit tiles without restarting.

## When Modifying Editors

### Adding a New Tile Type

1. **Choose next available ID** (13, 14, or 15)
2. **Update Premium Editor** (`map-editor.html`):
   - Add to `COLORS` array
   - Add palette tile in HTML
3. **Update Free Editor** (`src/scenes/GameScene.ts`):
   - Add to `TILE_COLORS` object
   - Add to EditorUI palette rendering
4. **Update Rendering** (`src/scenes/GameScene.ts`):
   - Add case in `renderGrid()` or `createWorld()`
5. **Document Here**: Update tile type list above

### Changing Map Format

If you need to change serialization format:
1. Update `src/utils/grid.ts` (compression/decompression)
2. Test with BOTH editors
3. Ensure backward compatibility with saved maps
4. Update QR code generation (if applicable)

### Modifying Tile Colors

1. Update `COLORS` array in `map-editor.html`
2. Update `TILE_COLORS` in `src/scenes/GameScene.ts`
3. Keep them synchronized!

## Testing Checklist

When making editor changes, test:
- ✅ Premium editor can create and save maps
- ✅ Free editor can load and edit maps
- ✅ Maps created in premium work in free version
- ✅ Maps created in free work when loaded via QR code
- ✅ Tile colors match between both editors
- ✅ LocalStorage serialization works correctly

## Future Considerations

### V3 Features (Bathrooms + Bladder System)
When adding bathrooms, consider:
- New tile type for bathroom/toilet (use ID 13?)
- Patron bladder pressure system (not part of map editor)
- Vomit/mess mechanics (not part of map editor)
- These are SIMULATION features, not editor features

### Premium Features (Future)
May include tile types that are premium-only:
- Pool tables
- Pizza ovens
- Jukeboxes
- Dance floors

These would be:
- Disabled in free editor palette
- Full access in premium editor
- Rendered as "locked" in free game if present

## Notes for Future Agents

- **Map data is the source of truth** - Editors are just different UIs for the same data structure
- **Keep it simple** - Free editor should be minimal, premium can be fancy
- **Mobile first** - Free editor must work on touch screens
- **Backward compatible** - Don't break existing saved maps
- **Document changes** - Update this file when adding features
