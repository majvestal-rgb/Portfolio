/**
 * Optimize PNG/JPEG images in assets/ for faster loading.
 * Compresses in place without changing dimensions. Run: npm run optimize-images
 * Requires: npm install --save-dev sharp
 */

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (_) {
  console.error('Run: npm install --save-dev sharp');
  process.exit(1);
}

const ASSETS = path.join(__dirname, '..', 'assets');
const EXT = /\.(png|jpe?g)$/i;

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
    else if (EXT.test(e.name)) files.push(full);
  }
  return files;
}

async function optimize(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const stat = fs.statSync(filePath);
  const before = stat.size;

  const pipeline = sharp(filePath);

  if (ext === '.png') {
    await pipeline
      .png({ compressionLevel: 9 })
      .toFile(filePath + '.tmp');
  } else {
    await pipeline
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(filePath + '.tmp');
  }

  fs.renameSync(filePath + '.tmp', filePath);
  const after = fs.statSync(filePath).size;
  const saved = ((1 - after / before) * 100).toFixed(1);
  console.log(path.relative(ASSETS, filePath) + '  ' + (after - before < 0 ? '-' + saved + '%' : 'unchanged'));
}

(async () => {
  const files = walk(ASSETS);
  console.log('Optimizing ' + files.length + ' images...');
  for (const f of files) await optimize(f);
  console.log('Done.');
})();
