# Bar Simulator

A top-down bar simulation game built with Phaser 3 and TypeScript.

## Current State

This is a **prototype/foundation** with minimal features:
- Player can walk around and explore the bar
- NPCs (patrons) wander aimlessly with no AI behavior yet
- Full bar layout: street → entrance → main bar room → back patio

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The game will open in your browser at `http://localhost:3000`

## Controls

- **Arrow Keys**: Move player around
- That's it for now!

## Game Areas

1. **Street** - Starting area at the bottom
2. **Entrance** - Double doors leading into the bar
3. **Main Bar Room** - L-shaped bar on the left, tables on the right
4. **Back Patio** - Green outdoor area at the top

## NPCs

- **Orange circles** - Patrons who wander randomly
- No behaviors implemented yet - this is intentional
- We will add behaviors incrementally

## Development Philosophy

Building features **very deliberately, one at a time**:
1. ✅ Basic map and movement
2. ✅ Simple NPCs with aimless wandering
3. 🔲 Next: TBD - will add behaviors carefully

## Tech Stack

- **Phaser 3.70** - Game engine with Arcade Physics
- **TypeScript** - Type-safe development
- **Vite** - Fast dev server and bundling

## Resources

- **Emoji/ASCII Dictionary**: https://gist.github.com/dkdndes/a224555858f185f1662e3384c6a410d9 (for future use)

BEEP BOOP!