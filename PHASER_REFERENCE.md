# Phaser 3 Quick Reference for Bar Simulator

This document provides quick reference for Phaser 3 features used in this top-down bar simulator game.

## Project Setup

### CDN Import (in HTML)
```html
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
```

### Game Configuration
```javascript
const config = {
    type: Phaser.AUTO,              // WebGL or Canvas (auto-detect)
    width: 1024,                     // Game width in pixels
    height: 768,                     // Game height in pixels
    parent: 'game-container',        // DOM element ID
    backgroundColor: '#2a2a2a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },       // Top-down = no gravity
            debug: true              // Shows physics bodies (set false for production)
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
```

---

## Tilemap Integration (Tiled Editor)

### Tiled Export Requirements
1. **Tile Layer Format**: Use CSV or Base64 (uncompressed) - NOT compressed!
2. **Tileset**: Check "Embed in Map" option
3. **Export**: File > Export As > JSON map files (*.json)
4. **File Structure**:
   ```
   assets/
     ├── tileset.png         (your tileset image)
     ├── bar-map.json        (exported Tiled JSON)
   ```

### Loading Tilemap Assets
```javascript
function preload() {
    // Load the tileset image
    this.load.image('tiles', 'assets/tileset.png');

    // Load the exported Tiled JSON
    this.load.tilemapTiledJSON('bar-map', 'assets/bar-map.json');
}
```

### Creating Tilemap and Layers
```javascript
function create() {
    // Create tilemap from loaded JSON
    const map = this.make.tilemap({ key: 'bar-map' });

    // Add tileset image to map
    // First param: name in Tiled, Second param: loaded image key
    const tileset = map.addTilesetImage('tileset', 'tiles');

    // Create layers (order matters for rendering)
    const floorLayer = map.createLayer('Floor', tileset, 0, 0);
    const wallsLayer = map.createLayer('Walls', tileset, 0, 0);
    const furnitureLayer = map.createLayer('Furniture', tileset, 0, 0);

    // Set collision for specific layers
    // In Tiled, add custom property "collides: true" to tiles
    wallsLayer.setCollisionByProperty({ collides: true });
    furnitureLayer.setCollisionByProperty({ collides: true });
}
```

---

## Sprites and Spritesheets

### Loading Spritesheets
```javascript
function preload() {
    // Load spritesheet with frame dimensions
    this.load.spritesheet('player', 'assets/player.png', {
        frameWidth: 32,      // Width of each frame
        frameHeight: 32,     // Height of each frame
        // Optional: endFrame: 12  (if you want to limit frames)
    });

    this.load.spritesheet('npc', 'assets/npc-sprites.png', {
        frameWidth: 32,
        frameHeight: 32
    });
}
```

### Creating Animated Sprite
```javascript
function create() {
    // Create sprite with physics
    const player = this.physics.add.sprite(400, 300, 'player');

    // Create animations
    this.anims.create({
        key: 'walk-down',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1           // -1 = loop forever
    });

    this.anims.create({
        key: 'walk-up',
        frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk-left',
        frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk-right',
        frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'idle',
        frames: [{ key: 'player', frame: 0 }],
        frameRate: 1
    });
}
```

### Playing Animations
```javascript
function update() {
    if (cursors.left.isDown) {
        player.anims.play('walk-left', true);
    } else if (cursors.right.isDown) {
        player.anims.play('walk-right', true);
    } else {
        player.anims.play('idle', true);
    }
}
```

---

## Arcade Physics

### Creating Physics Sprites
```javascript
// Single sprite
const player = this.physics.add.sprite(x, y, 'sprite-key');
player.setCollideWorldBounds(true);  // Don't leave game bounds

// Physics group (for multiple similar objects)
const npcs = this.physics.add.group();
const npc1 = npcs.create(100, 100, 'npc');
const npc2 = npcs.create(200, 200, 'npc');
```

### Movement (Top-Down)
```javascript
// Set velocity directly
player.setVelocity(0);              // Stop
player.setVelocityX(160);           // Move right
player.setVelocityY(-160);          // Move up

// Or using physics body
player.body.velocity.x = 160;
player.body.velocity.y = 0;

// Normalize diagonal movement
player.body.velocity.normalize().scale(speed);
```

### Collision Detection

**Two Types:**
1. **Collider**: Objects bounce/separate when they touch
2. **Overlap**: Objects pass through but trigger callback

```javascript
function create() {
    // COLLIDER - objects will separate (bounce off each other)
    this.physics.add.collider(
        player,              // Object A
        wallsLayer,          // Object B
        null,                // collideCallback (optional)
        null,                // processCallback (optional)
        this                 // callback context
    );

    // OVERLAP - objects pass through, callback fires
    this.physics.add.overlap(
        player,              // Object A
        npcs,                // Object B or Group
        handleInteraction,   // callback when overlap detected
        null,                // processCallback (optional, can return false to cancel)
        this                 // callback context
    );
}

function handleInteraction(player, npc) {
    console.log('Player overlapping with NPC!');
    // Your interaction logic here
}
```

### Common Physics Properties
```javascript
sprite.body.velocity.x          // Current X velocity
sprite.body.velocity.y          // Current Y velocity
sprite.body.acceleration        // Acceleration
sprite.body.drag               // Drag/friction
sprite.body.maxVelocity        // Max velocity limit
sprite.body.immovable = true   // Won't move on collision
sprite.body.enable = false     // Disable physics temporarily
```

---

## Input Handling

### Keyboard
```javascript
function create() {
    // Cursor keys (arrow keys)
    cursors = this.input.keyboard.createCursorKeys();

    // Individual keys
    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const wKey = this.input.keyboard.addKey('W');

    // Key press events
    spaceKey.on('down', () => {
        console.log('Space pressed!');
    });
}

function update() {
    // Check if key is currently down
    if (cursors.left.isDown) {
        // Move left
    }

    // Check if key was just pressed this frame
    if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        // Interact
    }
}
```

---

## Groups

Groups are collections of game objects that can be manipulated together.

```javascript
function create() {
    // Create physics group
    const npcs = this.physics.add.group();

    // Add existing sprite to group
    npcs.add(existingSprite);

    // Create new sprite in group
    const npc = npcs.create(x, y, 'npc-sprite');

    // Set properties for all group members
    npcs.setVelocityX(100);
    npcs.children.iterate((npc) => {
        npc.customProperty = 'value';
    });

    // Iterate over group
    npcs.children.entries.forEach(npc => {
        // Do something with each npc
    });
}
```

---

## Camera

### Following Player
```javascript
function create() {
    // Set camera bounds to match map size
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Follow player
    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    // Zoom
    this.cameras.main.setZoom(1.5);
}
```

---

## Scene Management

### Multiple Scenes
```javascript
// Define multiple scenes
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Load assets
    }

    create() {
        this.scene.start('GameScene');  // Switch to game scene
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    // ... game logic
}

// Game config
const config = {
    // ... other config
    scene: [PreloadScene, GameScene]
};
```

---

## Common Patterns for Top-Down Games

### 8-Direction Movement with Animation
```javascript
function update() {
    const speed = 160;
    player.setVelocity(0);

    let moving = false;

    if (cursors.left.isDown) {
        player.setVelocityX(-speed);
        player.anims.play('walk-left', true);
        moving = true;
    } else if (cursors.right.isDown) {
        player.setVelocityX(speed);
        player.anims.play('walk-right', true);
        moving = true;
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-speed);
        if (!moving) player.anims.play('walk-up', true);
        moving = true;
    } else if (cursors.down.isDown) {
        player.setVelocityY(speed);
        if (!moving) player.anims.play('walk-down', true);
        moving = true;
    }

    // Normalize diagonal movement
    if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
        player.body.velocity.normalize().scale(speed);
    }

    if (!moving) {
        player.anims.play('idle', true);
    }
}
```

### Distance-Based Interaction
```javascript
function checkNearbyNPCs() {
    const interactionRange = 50;
    let nearestNPC = null;
    let minDistance = interactionRange;

    npcs.children.entries.forEach(npc => {
        const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            npc.x, npc.y
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearestNPC = npc;
        }
    });

    return nearestNPC;
}
```

### Simple AI Movement
```javascript
function updateNPC(npc) {
    const speed = 80;
    const distance = Phaser.Math.Distance.Between(
        npc.x, npc.y,
        npc.targetX, npc.targetY
    );

    if (distance > 5) {
        const angle = Phaser.Math.Angle.Between(
            npc.x, npc.y,
            npc.targetX, npc.targetY
        );
        npc.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    } else {
        npc.setVelocity(0);
        // Pick new random target
        npc.targetX = Phaser.Math.Between(0, mapWidth);
        npc.targetY = Phaser.Math.Between(0, mapHeight);
    }
}
```

---

## Best Practices

1. **Use `this.load` only in `preload()`** - Asset loading should happen before game starts
2. **Create game objects in `create()`** - Initialize sprites, groups, etc. once
3. **Update logic goes in `update()`** - Called every frame (~60fps)
4. **Always check for null/undefined** - Before accessing game objects
5. **Use groups for similar objects** - NPCs, bullets, collectibles, etc.
6. **Set `collideWorldBounds: true`** - For top-down games to keep entities in view
7. **Normalize diagonal velocity** - Prevents faster diagonal movement
8. **Use `setScrollFactor(0)`** - For UI elements that should stay on screen
9. **Check Tiled export settings** - Uncompressed CSV/Base64, embedded tilesets
10. **Test PNG paths independently** - Ensure browser can access asset files directly

---

## Debug Tips

### Enable Physics Debug Rendering
```javascript
const config = {
    physics: {
        arcade: {
            debug: true  // Shows collision boxes
        }
    }
};
```

### Console Logging
```javascript
console.log('Player position:', player.x, player.y);
console.log('Velocity:', player.body.velocity);
```

### Visual Debugging
```javascript
// Draw collision boxes
const graphics = this.add.graphics();
graphics.lineStyle(2, 0xff0000);
graphics.strokeRect(sprite.x, sprite.y, sprite.width, sprite.height);
```

---

## Asset Organization

Recommended folder structure:
```
drunk-simulator/
├── index.html
├── game.js
├── assets/
│   ├── tileset.png
│   ├── bar-map.json
│   ├── player.png
│   ├── npc-sprites.png
│   ├── beer.png
│   ├── pizza.png
│   └── ui/
│       ├── panel.png
│       └── icons.png
└── PHASER_REFERENCE.md
```
