#!/usr/bin/env node

/**
 * Generate beer emoji icons for Electron app
 * Creates PNG files at various sizes for different platforms
 */

const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for various platforms
const sizes = [
  16,   // Windows small
  32,   // Windows medium
  48,   // Windows medium-large
  64,   // Windows large
  128,  // Windows extra large
  256,  // macOS, Windows, Linux
  512,  // macOS, Linux high-res
  1024  // macOS Retina
];

const iconsDir = path.join(__dirname, 'build', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
console.log('🍺 Generating beer emoji icons...\n');

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Clear background (transparent)
  ctx.clearRect(0, 0, size, size);

  // Draw beer emoji
  ctx.font = `${size * 0.875}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍺', size / 2, size / 2);

  // Save PNG
  const filename = `icon_${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);

  console.log(`✅ Created ${filename}`);
});

// Create a copy named icon.png (1024x1024 as the master)
fs.copyFileSync(
  path.join(iconsDir, 'icon_1024x1024.png'),
  path.join(iconsDir, 'icon.png')
);
console.log('✅ Created icon.png (master 1024x1024)');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✨ Icon generation complete!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\nIcons created in: build/icons/');
console.log('\nNext steps:');
console.log('1. Icons are configured in package.json');
console.log('2. electron-builder will auto-generate .icns and .ico');
console.log('3. Run your Electron app to see the beer icon!');
console.log('');
