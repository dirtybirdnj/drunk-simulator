import Phaser from 'phaser';

export class BootMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootMenuScene' });
    }

    create() {
        // Launch both child scenes in parallel
        // BootAnimationScene handles the visual effects and branding
        // MenuButtonsScene handles user interaction
        this.scene.launch('BootAnimationScene');
        this.scene.launch('MenuButtonsScene');
    }
}
