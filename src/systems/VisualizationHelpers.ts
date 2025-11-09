import Phaser from 'phaser';

export class VisualizationHelpers {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    updatePlayerArrow(
        playerArrow: Phaser.GameObjects.Graphics,
        player: Phaser.Physics.Arcade.Sprite,
        playerFacingAngle: number
    ) {
        if (!playerArrow || !player) return;
        playerArrow.clear();

        playerArrow.fillStyle(0x00ff00, 1);
        const arrowLength = 18;
        const arrowWidth = 8;

        const tipX = player.x + Math.cos(playerFacingAngle) * arrowLength;
        const tipY = player.y + Math.sin(playerFacingAngle) * arrowLength;

        const perpAngle = playerFacingAngle + Math.PI / 2;
        const baseX = player.x + Math.cos(playerFacingAngle) * 6;
        const baseY = player.y + Math.sin(playerFacingAngle) * 6;

        const left1X = baseX + Math.cos(perpAngle) * arrowWidth;
        const left1Y = baseY + Math.sin(perpAngle) * arrowWidth;
        const right1X = baseX - Math.cos(perpAngle) * arrowWidth;
        const right1Y = baseY - Math.sin(perpAngle) * arrowWidth;

        playerArrow.beginPath();
        playerArrow.moveTo(tipX, tipY);
        playerArrow.lineTo(left1X, left1Y);
        playerArrow.lineTo(right1X, right1Y);
        playerArrow.closePath();
        playerArrow.fillPath();
    }

    drawTargetMarker(targetMarker: Phaser.GameObjects.Graphics, x: number, y: number) {
        targetMarker.clear();

        // Draw pulsing circle at target
        targetMarker.lineStyle(3, 0x00ff00, 0.8);
        targetMarker.strokeCircle(x, y, 16);

        targetMarker.lineStyle(2, 0x00ff00, 0.5);
        targetMarker.strokeCircle(x, y, 24);
    }

    drawServiceZones(
        serviceZoneGraphics: Phaser.GameObjects.Graphics,
        barServiceZones: Array<{x: number, y: number, width: number, height: number, tapIndex: number}>
    ) {
        serviceZoneGraphics.clear();

        // Draw light blue overlay on all service zone tiles
        barServiceZones.forEach(zone => {
            serviceZoneGraphics.fillStyle(0x87CEEB, 0.3);  // Light blue, 30% opacity
            serviceZoneGraphics.fillRect(zone.x, zone.y, zone.width, zone.height);
        });
    }
}
