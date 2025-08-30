// src/middlewares/uploadProof.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { STORAGE_DIR } = require('../config');

// Dossier où l’on stocke les preuves de paiement
const proofsDir = path.join(STORAGE_DIR, 'proofs');
// Crée le sous-dossier si besoin (et seulement le sous-dossier, pas /data)
if (!fs.existsSync(proofsDir)) {
  fs.mkdirSync(proofsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, proofsDir);
  },
  filename: (req, file, cb) => {
    const stamp = Date.now();
    const ext = (file.originalname && path.extname(file.originalname)) || '';
    cb(null, `proof-${stamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo
  fileFilter: (req, file, cb) => {
    const ok = /^image\//i.test(file.mimetype) || /pdf$/i.test(file.mimetype);
    if (!ok) return cb(new Error('Formats autorisés: images ou PDF'));
    cb(null, true);
  }
});

module.exports = upload;