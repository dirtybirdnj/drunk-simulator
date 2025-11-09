# Drunk Simulator

A top-down bar simulation game built with Phaser 3 and TypeScript. Create custom bar layouts, simulate crowd dynamics, and share your creations with friends via QR codes.

## Features

- **Physics-based simulation** - Realistic drunk movement with damping and drag
- **Custom map editor** - Design your own bar layouts with a visual editor
- **QR code sharing** - Export and share maps with friends
- **Multi-platform** - Web, Desktop (Electron), and Mobile (iOS/Android via Capacitor)
- **Built with modern web tech** - TypeScript, Phaser 3, Vite

## Quick Start

```bash
# Clone the repository
git clone https://github.com/dirtybirdnj/drunk-simulator.git
cd drunk-simulator

# Install dependencies
npm install

# Run development server
npm run dev
```

The game will open in your browser at `http://localhost:3000`

## Controls

- **Arrow Keys** - Move player
- **START** - Play the default map
- **SCAN** - Scan QR codes to load custom maps
- **EDITOR** - Open map editor (desktop only)

## Project Structure

```
drunk-simulator/
├── src/
│   ├── main.ts              # Game entry point
│   ├── scenes/
│   │   ├── TitleScene.ts    # Main menu
│   │   ├── GameScene.ts     # Core gameplay
│   │   └── MenuButtonsScene.ts
│   ├── types/
│   │   └── grid.ts          # Map format definitions
│   └── utils/
│       ├── grid.ts          # Map serialization
│       └── qrcode.ts        # QR code generation
├── map-editor.html          # Visual map editor
├── index.html               # Game HTML
└── vite.config.ts           # Build configuration
```

## Development

### Available Commands

```bash
# Development
npm run dev              # Run dev server with hot reload

# Production Builds
npm run build            # Standard web build

# itch.io Builds
./build-itchio.sh        # Base version (play only)
./build-itchio-premium.sh # Premium (with editor)

# Electron Desktop
npm run electron:dev     # Run desktop app in development mode

# Mobile (Capacitor)
npm run cap:init         # Initialize Capacitor
npm run cap:add:ios      # Add iOS platform
npm run cap:add:android  # Add Android platform
```

### Tech Stack

- **Phaser 3.70** - Game engine with Arcade Physics
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Electron** - Desktop app packaging
- **Capacitor** - Mobile app packaging

## How to Modify

### Change the Default Map

Edit `src/main.ts`:

```typescript
const ROWS = 64;
const COLS = 32;

function getDefaultGrid(): number[][] {
    // Modify default bar layout here
}
```

### Add New Tile Types

1. Add tile to legend in `map-editor.html`
2. Update rendering in `src/scenes/GameScene.ts`

### Customize Physics

Edit `src/scenes/GameScene.ts`:

```typescript
// Player movement
player.setMaxVelocity(200, 200);

// Drunk effect (damping)
player.setDamping(true);
player.setDrag(0.7);
```

## Building for Distribution

### Web (itch.io)

Two versions are available:

**Base Version** ($5) - Play only:
```bash
./build-itchio.sh
# Creates drunk-simulator-html5.zip
```

**Premium Version** ($15) - Includes map editor:
```bash
./build-itchio-premium.sh
# Creates drunk-simulator-premium-html5.zip
```

### Desktop (Electron)

```bash
ELECTRON=true npm run build
# Package with electron-builder
```

### Mobile (iOS/Android)

```bash
npm run cap:init
npm run cap:add:ios
npm run cap:add:android
# Build with Xcode/Android Studio
```

## Map Editor

The map editor allows you to:
- Design custom bar layouts
- Add walls, floors, patios, and furniture
- Test maps instantly
- Export as QR codes for sharing
- Save up to 10 maps locally

Open the editor from the main menu (desktop only) or run `map-editor.html` directly.

## Contributing

This is a paid game, but It's also a tool to teach people to get curious and start digging into code.  If you found this repo, I want to reward you with the ability to edit the code yourself.

I can't pay you for your help, but contributions are welcome. Please feel free to submit a PR if you have an idea for a new feature.

1. Fork the repository
2. Create a feature branch: `git checkout -b my-feature`
3. Make your changes
4. Commit: `git commit -m "Add my feature"`
5. Push: `git push origin my-feature`
6. Open a Pull Request

## Troubleshooting

### "command not found: npm"

Install Node.js from [nodejs.org](https://nodejs.org) (version 18 or higher)

### "command not found: git"

Install Git:
- **Mac**: `xcode-select --install`
- **Windows**: Download from [git-scm.com](https://git-scm.com)
- **Linux**: `sudo apt install git`

### "Cannot find module"

Delete and reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

### Port 3000 already in use

Change the port in `vite.config.ts`:
```typescript
server: {
    port: 3001,
    open: true
}
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

If you build upon this project, please provide attribution to the original author.

## Links

- **Play on itch.io**: [Coming soon]
- **Report bugs**: [GitHub Issues](https://github.com/dirtybirdnj/drunk-simulator/issues)
- **Source code**: [GitHub](https://github.com/dirtybirdnj/drunk-simulator)

## Credits

Created by Mat Gilbert

Built with Phaser 3, TypeScript, and Vite. Claude helped too.
