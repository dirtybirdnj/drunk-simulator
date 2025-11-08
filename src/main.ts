import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 1400,
    parent: 'game-container',
    backgroundColor: '#000000', // Black background
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true // Set to false in production
        }
    },
    scene: [GameScene]
};

new Phaser.Game(config);
