import Phaser from 'phaser';
import confetti from 'canvas-confetti';
import { LevelSize, LEVEL_CONFIGS } from '../types/GameState';

export class MenuButtonsScene extends Phaser.Scene {
    private selectedMap: string | null = null;

    constructor() {
        super({ key: 'MenuButtonsScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Make this scene transparent so the animation scene shows through
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');

        // Auto-select default map so game is ready to play immediately
        this.selectedMap = null; // null = default map

        // Check which levels are unlocked
        const unlockedLevels = this.getUnlockedLevels();

        // === LEVEL SELECTION (no header) ===
        const sectionY = height / 2 + 100;

        // Level buttons (3 in a row)
        const levelButtonWidth = 280;
        const levelButtonHeight = 120;
        const levelButtonSpacing = 20;
        const totalWidth = (levelButtonWidth * 3) + (levelButtonSpacing * 2);
        const startX = width / 2 - totalWidth / 2 + levelButtonWidth / 2;
        const levelY = sectionY + 50;

        const levels = [
            { size: LevelSize.MINI, label: 'Level 1', color: 0x10b981, requiredLevel: null },
            { size: LevelSize.SMALL, label: 'Level 2', color: 0x3b82f6, requiredLevel: LevelSize.MINI },
            { size: LevelSize.MEDIUM, label: 'Level 3', color: 0xf59e0b, requiredLevel: LevelSize.SMALL }
        ];

        levels.forEach((level, index) => {
            const x = startX + (index * (levelButtonWidth + levelButtonSpacing));
            const config = LEVEL_CONFIGS[level.size];
            const isUnlocked = level.requiredLevel === null || unlockedLevels.includes(level.requiredLevel);

            const bg = this.add.rectangle(x, levelY, levelButtonWidth, levelButtonHeight, isUnlocked ? level.color : 0x555555);
            bg.setStrokeStyle(4, isUnlocked ? 0xFFFFFF : 0x888888);

            const text = this.add.text(x, levelY - 15, isUnlocked ? level.label : '🔒 Locked', {
                fontSize: '32px',
                color: isUnlocked ? '#FFFFFF' : '#999999',
                fontFamily: 'Pixelify Sans, sans-serif',
                fontStyle: '700'
            });
            text.setOrigin(0.5);

            const subtext = this.add.text(x, levelY + 20, `$${config.cashThreshold}`, {
                fontSize: '20px',
                color: isUnlocked ? '#FFFF00' : '#666666',
                fontFamily: 'Pixelify Sans, sans-serif'
            });
            subtext.setOrigin(0.5);

            if (isUnlocked) {
                bg.setInteractive({ useHandCursor: true });
                bg.on('pointerover', () => {
                    bg.setScale(1.05);
                    text.setScale(1.05);
                    subtext.setScale(1.05);
                });
                bg.on('pointerout', () => {
                    bg.setScale(1);
                    text.setScale(1);
                    subtext.setScale(1);
                });
                bg.on('pointerdown', () => {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });

                    this.time.delayedCall(500, () => {
                        this.scene.stop('BootAnimationScene');
                        this.registry.set('selectedLevel', level.size);
                        this.scene.start('GameScene', { selectedLevel: level.size });
                    });
                });
            }
        });

        // === BUTTONS ===
        const buttonsY = levelY + 180;

        // START button (custom maps)
        const startY = buttonsY;
        const startBg = this.add.rectangle(width / 2, startY, 700, 100, 0x228B22);
        startBg.setStrokeStyle(4, 0xFFFFFF);

        const startText = this.add.text(width / 2, startY, '🍻 Custom Map 🍹', {
            fontSize: '40px',
            color: '#FFD700',
            fontFamily: 'Pixelify Sans, sans-serif',
            fontStyle: '700'
        });
        startText.setOrigin(0.5);

        startBg.setInteractive({ useHandCursor: true });
        startBg.on('pointerover', () => {
            startBg.setFillStyle(0x32CD32);
            startBg.setScale(1.05);
            startText.setScale(1.05);
        });
        startBg.on('pointerout', () => {
            startBg.setFillStyle(0x228B22);
            startBg.setScale(1);
            startText.setScale(1);
        });
        startBg.on('pointerdown', () => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            this.time.delayedCall(500, () => {
                this.scene.stop('BootAnimationScene');
                this.scene.start('GameScene', { selectedMap: this.selectedMap });
            });
        });

        // SCAN button
        const scanY = startY + 120;
        const scanBg = this.add.rectangle(width / 2, scanY, 700, 100, 0xFF6B35);
        scanBg.setStrokeStyle(4, 0xFFFFFF);

        const scanText = this.add.text(width / 2, scanY, '📸 SCAN QR 📱', {
            fontSize: '36px',
            color: '#FFD700',
            fontFamily: 'Pixelify Sans, sans-serif',
            fontStyle: '700'
        });
        scanText.setOrigin(0.5);

        scanBg.setInteractive({ useHandCursor: true });
        scanBg.on('pointerover', () => {
            scanBg.setFillStyle(0xFF8C42);
            scanBg.setScale(1.05);
            scanText.setScale(1.05);
        });
        scanBg.on('pointerout', () => {
            scanBg.setFillStyle(0xFF6B35);
            scanBg.setScale(1);
            scanText.setScale(1);
        });
        scanBg.on('pointerdown', () => {
            this.startQRScanner();
        });

        // Editor button (desktop only) - smaller size
        const isDesktop = window.innerWidth >= 1024;
        const editorEnabled = !(window as any).DISABLE_EDITOR;
        if (isDesktop && editorEnabled) {
            const editorY = scanY + 120;
            const editorBg = this.add.rectangle(width / 2, editorY, 700, 80, 0x667eea);
            editorBg.setStrokeStyle(4, 0xFFFFFF);

            const editorText = this.add.text(width / 2, editorY, '🛠️ Map Editor', {
                fontSize: '32px',
                color: '#FFD700',
                fontFamily: 'Pixelify Sans, sans-serif',
                fontStyle: '700'
            });
            editorText.setOrigin(0.5);

            editorBg.setInteractive({ useHandCursor: true });
            editorBg.on('pointerover', () => {
                editorBg.setFillStyle(0x764ba2);
                editorBg.setScale(1.05);
                editorText.setScale(1.05);
            });
            editorBg.on('pointerout', () => {
                editorBg.setFillStyle(0x667eea);
                editorBg.setScale(1);
                editorText.setScale(1);
            });
            editorBg.on('pointerdown', () => {
                (window as any).showEditor();
            });
        }
    }

    startQRScanner() {
        const overlay = document.getElementById('camera-overlay');
        const video = document.getElementById('camera-video') as HTMLVideoElement;
        const canvas = document.getElementById('camera-canvas') as HTMLCanvasElement;
        const statusEl = document.getElementById('scan-status');
        const closeBtn = document.getElementById('close-camera');

        if (!overlay || !video || !canvas || !statusEl || !closeBtn) {
            console.error('Camera overlay elements not found');
            return;
        }

        let stream: MediaStream | null = null;
        let scanning = false;

        const stopScanning = () => {
            scanning = false;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            overlay.style.display = 'none';
            video.srcObject = null;
        };

        closeBtn.onclick = stopScanning;

        // Request camera access
        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' } // Use back camera on mobile
        })
        .then((mediaStream) => {
            stream = mediaStream;
            video.srcObject = stream;
            overlay.style.display = 'flex';
            scanning = true;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const scanFrame = () => {
                if (!scanning) return;

                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height);

                    if (code) {
                        console.log('QR Code detected:', code.data);
                        statusEl.textContent = '✅ QR Code detected! Loading map...';

                        // Import the map
                        try {
                            const mapData = code.data;
                            stopScanning();

                            // Store in localStorage and start game
                            localStorage.setItem('scannedMap', mapData);
                            this.scene.stop('BootAnimationScene');
                            this.scene.start('GameScene', { scannedMapData: mapData });
                        } catch (error) {
                            console.error('Failed to import map:', error);
                            statusEl.textContent = '❌ Invalid QR code';
                            setTimeout(() => {
                                statusEl.textContent = '📸 Point camera at QR code...';
                            }, 2000);
                        }
                    }
                }

                requestAnimationFrame(scanFrame);
            };

            scanFrame();
        })
        .catch((error) => {
            console.error('Camera access denied:', error);
            statusEl.textContent = '❌ Camera access denied';
            setTimeout(() => stopScanning(), 2000);
        });
    }

    private getUnlockedLevels(): LevelSize[] {
        // Get completed levels from localStorage
        const completedStr = localStorage.getItem('drunkSimCompletedLevels') || '[]';
        try {
            return JSON.parse(completedStr) as LevelSize[];
        } catch (error) {
            console.error('Failed to parse completed levels:', error);
            return [];
        }
    }
}
