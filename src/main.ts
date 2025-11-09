import Phaser from 'phaser';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';

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
            gravity: { y: 0 },
            debug: false // Turn off collision box visualization
        }
    },
    scene: [TitleScene, GameScene]
};

new Phaser.Game(config);
