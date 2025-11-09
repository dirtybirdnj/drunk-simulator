import Phaser from 'phaser';
import confetti from 'canvas-confetti';

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

        // Start button (always visible) - positioned below the title
        const buttonSpacing = 170; // Consistent spacing between buttons
        const startY = height / 2 + 150; // Moved up another inch (96px)
        const startBg = this.add.rectangle(width / 2, startY, 900, 140, 0x228B22);
        startBg.setStrokeStyle(6, 0xFFFFFF);

        const startText = this.add.text(width / 2, startY, '🍻 START 🍹', {
            fontSize: '60px',
            color: '#FFD700',
            fontFamily: 'Pixelify Sans, sans-serif',
            fontStyle: '900'
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
            console.log(`🎮 Starting game with map: ${this.selectedMap || 'Default'}`);

            // Trigger confetti celebration!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // Start game scene after a brief delay for confetti effect
            this.time.delayedCall(500, () => {
                // Stop boot animation scene before starting game
                this.scene.stop('BootAnimationScene');
                this.scene.start('GameScene', { selectedMap: this.selectedMap });
            });
        });

        // SCAN button - positioned below START button (always visible)
        const scanY = startY + buttonSpacing;
        const scanBg = this.add.rectangle(width / 2, scanY, 900, 140, 0xFF6B35);
        scanBg.setStrokeStyle(6, 0xFFFFFF);

        const scanText = this.add.text(width / 2, scanY, '📸 SCAN', {
            fontSize: '50px',
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

        // Editor button (desktop only) - positioned below SCAN button
        const isDesktop = window.innerWidth >= 1024;
        const editorEnabled = !(window as any).DISABLE_EDITOR;
        if (isDesktop && editorEnabled) {
            const editorY = scanY + buttonSpacing;
            const editorBg = this.add.rectangle(width / 2, editorY, 900, 140, 0x667eea);
            editorBg.setStrokeStyle(6, 0xFFFFFF);

            const editorText = this.add.text(width / 2, editorY, '🛠️ Editor', {
                fontSize: '50px',
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
}
