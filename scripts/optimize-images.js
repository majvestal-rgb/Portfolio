/**
 * Optimize PNG/JPEG/GIF images in assets/ for faster loading.
 * PNG/JPEG: re-encodes in place. GIF: lossy re-encode; capped at MAX_GIF_BYTES.
 * Run: npm run optimize-images (all assets) or npm run optimize-images-misc (misc only).
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

const ASSETS_ROOT = path.join(__dirname, '..', 'assets');
const ASSETS = process.argv[2] === 'misc' ? path.join(ASSETS_ROOT, 'misc') : ASSETS_ROOT;
const MISCMODE = process.argv[2] === 'misc';
const EXT = /\.(png|jpe?g|gif)$/i;
const MAX_GIF_BYTES = 200 * 1024 * 1024; // 200 MB max per GIF

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
    else if (EXT.test(e.name)) files.push(full);
  }
  return files;
}

async function optimizeGifOverCap(filePath) {
  const before = fs.statSync(filePath).size;
  const tmpPath = filePath + '.tmp';
  let scale = 1;
  const meta = await sharp(filePath, { animated: true }).metadata();
  const w = meta.width || 800;
  const h = meta.height || 600;

  for (let pass = 0; pass < 6; pass++) {
    const newW = Math.max(200, Math.round(w * scale));
    const newH = Math.max(200, Math.round(h * scale));
    const pipeline = scale < 1
      ? sharp(filePath, { animated: true }).resize(newW, newH)
      : sharp(filePath, { animated: true });
    await pipeline
      .gif({
        interFrameMaxError: 10 + pass * 2,
        effort: 10,
        colours: pass >= 2 ? 128 : undefined,
      })
      .toFile(tmpPath);

    const after = fs.statSync(tmpPath).size;
    if (after <= MAX_GIF_BYTES) {
      fs.renameSync(tmpPath, filePath);
      const saved = ((1 - after / before) * 100).toFixed(1);
      console.log(path.relative(ASSETS_ROOT, filePath) + '  under 200 MB  ' + (after / 1024 / 1024).toFixed(1) + ' MB  (-' + saved + '%)');
      return;
    }
    scale *= 0.6;
  }

  const newW = Math.max(200, Math.round(w * 0.25));
  const newH = Math.max(200, Math.round(h * 0.25));
  await sharp(filePath, { animated: true })
    .resize(newW, newH)
    .gif({ interFrameMaxError: 14, effort: 10, colours: 128 })
    .toFile(tmpPath);
  fs.renameSync(tmpPath, filePath);
  const after = fs.statSync(filePath).size;
  const saved = ((1 - after / before) * 100).toFixed(1);
  console.log(path.relative(ASSETS_ROOT, filePath) + '  resized to fit cap  ' + (after / 1024 / 1024).toFixed(1) + ' MB  (-' + saved + '%)');
}

async function optimize(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const stat = fs.statSync(filePath);
  const before = stat.size;

  if (ext === '.gif') {
    if (before <= MAX_GIF_BYTES) {
      await sharp(filePath, { animated: true })
        .gif({ interFrameMaxError: 10, effort: 10 })
        .toFile(filePath + '.tmp');
      fs.renameSync(filePath + '.tmp', filePath);
      const after = fs.statSync(filePath).size;
      const saved = ((1 - after / before) * 100).toFixed(1);
      console.log(path.relative(ASSETS_ROOT, filePath) + '  ' + (after < before ? '-' + saved + '%' : 'unchanged'));
    } else {
      await optimizeGifOverCap(filePath);
    }
    return;
  }

  const pipeline = sharp(filePath);
  if (ext === '.png') {
    await pipeline
      .png({ compressionLevel: 9 })
      .toFile(filePath + '.tmp');
  } else {
    const quality = MISCMODE ? 80 : 88;
    await pipeline
      .jpeg({ quality, mozjpeg: true })
      .toFile(filePath + '.tmp');
  }
  fs.renameSync(filePath + '.tmp', filePath);
  const after = fs.statSync(filePath).size;
  const saved = ((1 - after / before) * 100).toFixed(1);
  console.log(path.relative(ASSETS_ROOT, filePath) + '  ' + (after - before < 0 ? '-' + saved + '%' : 'unchanged'));
}

(async () => {
  if (!fs.existsSync(ASSETS)) {
    console.error('Directory not found:', ASSETS);
    process.exit(1);
  }
  const files = walk(ASSETS);
  console.log('Optimizing ' + files.length + ' images' + (MISCMODE ? ' (misc, stronger compression)' : '') + '...');
  for (const f of files) await optimize(f);
  console.log('Done.');
})();
