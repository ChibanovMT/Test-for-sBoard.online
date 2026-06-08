const fs = require('fs');
const path = require('path');

// Минимальный PNG 128x128 (синий квадрат с оранжевым центром) без внешних зависимостей
const { createCanvas } = (() => {
  try {
    return require('canvas');
  } catch {
    return { createCanvas: null };
  }
})();

const outDir = path.join(__dirname, '../public/assets');
const outFile = path.join(outDir, 'logo.png');

fs.mkdirSync(outDir, { recursive: true });

if (createCanvas) {
  const canvas = createCanvas(128, 128);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(64, 64, 40, 0, Math.PI * 2);
  ctx.fill();
  fs.writeFileSync(outFile, canvas.toBuffer('image/png'));
} else {
  // Fallback: 1x1 PNG, достаточно для загрузки Texture
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  fs.writeFileSync(outFile, Buffer.from(pngBase64, 'base64'));
}

console.log('[generate-logo] Created', outFile);
