const fs = require('fs');
const path = require('path');

const src = path.join(
  __dirname,
  '../node_modules/html2pdf-skia/node_modules/@rollerbird/canvaskit-wasm-pdf/bin/canvaskit-pdf.wasm',
);
const destDir = path.join(__dirname, '../public');
const dest = path.join(destDir, 'canvaskit-pdf.wasm');

if (!fs.existsSync(src)) {
  console.warn('[copy-wasm] Source WASM not found, skipping.');
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('[copy-wasm] Copied canvaskit-pdf.wasm to public/');
