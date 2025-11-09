import Phaser from 'phaser';
import { BootMenuScene } from './scenes/BootMenuScene';
import { BootAnimationScene } from './scenes/BootAnimationScene';
import { MenuButtonsScene } from './scenes/MenuButtonsScene';
import { GameScene } from './scenes/GameScene';
import { EditorUIScene } from './scenes/EditorUIScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,  // 32 cols × 32px
    height: 1824, // 57 rows × 32px - 9:16 aspect ratio for mobile
    parent: 'game-container',
    backgroundColor: '#000000', // Black background
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false // Turn off collision box visualization
        }
    },
    scene: [BootMenuScene, BootAnimationScene, MenuButtonsScene, GameScene, EditorUIScene]
};

const game = new Phaser.Game(config);

// Expose game instance globally for map loading from editor
(window as any).phaserGame = game;
