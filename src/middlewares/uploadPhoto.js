const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PUBLIC_DIR, STORAGE_DIR } = require('../config');

// sharp peut être indisponible sur Node <18 → on le charge en optionnel
let sharp = null;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('[sharp désactivé]', e.message);
}

// dossiers: previews (public) & originals (privé)
const previewsDir = path.join(PUBLIC_DIR, 'previews');
const originalsDir = path.join(STORAGE_DIR, 'originals');
[previewsDir, originalsDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'preview_file') return cb(null, previewsDir);
    if (file.fieldname === 'original_file') return cb(null, originalsDir);
    cb(null, originalsDir);
  },
  filename: (req, file, cb) => {
    const stamp = Date.now();
    const ext = (file.originalname && path.extname(file.originalname)) || '';
    cb(null, `${file.fieldname}-${stamp}${ext}`);
  }
});

const uploader = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 Mo
  fileFilter: (req, file, cb) => {
    const ok = /^image\//i.test(file.mimetype);
    if (!ok) return cb(new Error('Seules les images sont autorisées.'));
    cb(null, true);
  }
});

// ===== Optimisation de la preview via sharp (optionnelle) =====
async function optimizePreview(filePath) {
  if (!sharp) return; // Node trop ancien ou sharp non installé
  try {
    const tmp = filePath + '.tmp';
    await sharp(filePath)
      .resize({ width: 1400, withoutEnlargement: true }) // max 1400px
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(tmp);
    await fs.promises.rename(tmp, filePath);
  } catch (e) {
    console.warn('[preview optimize failed]', e.message);
  }
}

uploader.optimizePreview = optimizePreview;

module.exports = uploader;