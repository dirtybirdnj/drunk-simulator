# 🍺 Drunk Simulator

A top-down bar simulation game where you create chaos, build custom maps, and share them with friends.

**Available on:**
- [itch.io](https://itch.io) - Play instantly in your browser
- **Right here** - Full developer access (you found the secret tier!)

---

## 🎮 Three Ways to Play

### 1. itch.io Base ($2.99)
- Play the game
- Scan QR codes to load custom maps
- Pure gaming experience

### 2. itch.io Premium ($7.99)
- Everything in Base
- **Map Editor** - Create custom bar layouts
- **QR Code Sharing** - Export and share your creations
- Save up to 10 custom maps

### 3. GitHub Developer (FREE)
- **Everything unlocked**
- Full source code access
- Modify the game however you want
- Learn real web development skills
- NO LIMITATIONS

**You're in tier 3.** Welcome to the developer path. 🎓

---

## 🚀 Quick Start (The Real Game Begins)

If you can run these commands, you unlock EVERYTHING:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/drunk-simulator.git
cd drunk-simulator

# Install dependencies
npm install

# Run the game locally
npm run dev
```

The game opens at `http://localhost:3000`

**Congratulations!** You just:
- Used the terminal
- Installed a Node.js project
- Ran a development server
- Unlocked unlimited access

---

## 🧠 What You'll Learn

By running this game from source, you're learning:

### Terminal Skills
- `git clone` - How to download code repositories
- `npm install` - Package management
- `npm run dev` - Running development servers
- Basic command-line navigation

### Web Development
- **TypeScript** - Modern JavaScript with types
- **Phaser 3** - Professional game engine
- **Vite** - Lightning-fast build tool
- **HTML5 Canvas** - Graphics rendering

### Game Development
- Scene management (Title, Game, Editor)
- Sprite physics and collision
- Map editing and persistence
- QR code generation and scanning

### Software Engineering
- Project structure and organization
- Build systems and deployment
- Version control with git
- Multi-platform deployment (Web, Electron, Mobile)

**This is the real unlock.** Skills, not features.

---

## 📂 Project Structure

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
├── vite.config.ts           # Build configuration
├── build-itchio.sh          # itch.io base build
└── build-itchio-premium.sh  # itch.io premium build
```

---

## 🎨 How to Modify the Game

### Change the Map

Edit the default map in `src/main.ts`:

```typescript
const ROWS = 64;
const COLS = 32;

// Modify the default grid
function getDefaultGrid(): number[][] {
    // Your custom map here
}
```

### Add New Tile Types

Add to the legend in `map-editor.html` and update rendering in `GameScene.ts`.

### Change Game Physics

Edit `src/scenes/GameScene.ts`:

```typescript
// Player speed
this.physics.world.gravity.y = 0;
player.setMaxVelocity(200, 200);

// Drunk effect
player.setDamping(true);
player.setDrag(0.7);
```

### Create Custom Behaviors

Add NPC behaviors, bar interactions, or scoring systems in `GameScene.ts`.

---

## 🔧 Available Build Commands

```bash
# Development
npm run dev              # Run dev server

# Production Builds
npm run build            # Standard web build

# itch.io Builds
./build-itchio.sh        # Base version (no editor)
./build-itchio-premium.sh # Premium (with editor)

# Electron Desktop
npm run electron:dev     # Run desktop app

# Mobile (Capacitor)
npm run cap:init         # Initialize Capacitor
npm run cap:add:ios      # Add iOS platform
npm run cap:add:android  # Add Android platform
```

---

## 🎯 The Philosophy

This project uses a **three-tier learning funnel**:

**Tier 1: Players** pay $2.99 to play instantly
- No friction, just fun
- Support the game's development

**Tier 2: Creators** pay $7.99 for map editor
- Unlock creative tools
- Share creations with community

**Tier 3: Developers** learn for free
- Full source code access
- Unlimited modifications
- Real programming skills

**The catch?** To unlock Tier 3, you have to learn:
- How to use the terminal
- What `git`, `npm`, and `node` are
- How to read documentation
- How to debug errors

**That's the real game.** We're teaching you to code by making you want to unlock features badly enough to learn.

Welcome to the developer tier. You earned it. 🎓

---

## 🐛 Troubleshooting

### "command not found: npm"

You need Node.js installed:
- Download from [nodejs.org](https://nodejs.org)
- Install version 18 or higher
- Restart your terminal

### "command not found: git"

You need Git installed:
- Mac: `xcode-select --install`
- Windows: Download from [git-scm.com](https://git-scm.com)
- Linux: `sudo apt install git`

### "Cannot find module"

Dependencies not installed:
```bash
rm -rf node_modules
npm install
```

### Port 3000 already in use

Change the port in `vite.config.ts`:
```typescript
server: {
    port: 3001,  // Use different port
    open: true
}
```

---

## 🤝 Contributing

Found a bug? Want to add features?

1. Fork the repo
2. Create a branch: `git checkout -b my-feature`
3. Make changes and commit: `git commit -m "Add feature"`
4. Push: `git push origin my-feature`
5. Open a Pull Request

---

## 📜 License

This project is open source. Learn from it, modify it, break it, fix it.

The code is free. The skills you gain are priceless.

---

## 🎓 What's Next?

Now that you've unlocked the developer tier:

1. **Modify the game** - Change colors, physics, behaviors
2. **Create new features** - Add scoring, multiplayer, new mechanics
3. **Learn the stack** - Dive into TypeScript, Phaser, Vite
4. **Build your own game** - Use this as a template
5. **Share your knowledge** - Help others unlock this tier

**You just learned to code by wanting to play a game.**

That was the whole point. 🎮→🎓

---

## 📞 Support

- **Issues**: Found a bug? [Open an issue](https://github.com/YOUR_USERNAME/drunk-simulator/issues)
- **Questions**: Learning something new? Ask in discussions
- **itch.io**: Want the easy version? [Buy it here](https://itch.io)

---

**Remember:** The players who paid on itch.io are supporting this free education. They're subsidizing your learning path. Consider buying the itch.io version too to support continued development.

BEEP BOOP! 🤖
