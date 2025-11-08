// Run this in the browser console on the generate-ascii-tileset.html page
// to download the tileset directly

const canvas = document.getElementById('tileset');
const link = document.createElement('a');
link.download = 'tileset.png';
link.href = canvas.toDataURL('image/png');
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
console.log('Tileset downloaded!');
