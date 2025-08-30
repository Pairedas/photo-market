const multer = require('multer');
const path = require('path');
const { STORAGE_DIR } = require('../config');

module.exports = multer({
  dest: path.join(STORAGE_DIR, 'proofs'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter: (req, file, cb) => {
    const ok = /^image\//i.test(file.mimetype) || file.mimetype === 'application/pdf';
    if (!ok) return cb(new Error('Type de fichier non autorisé (image ou PDF).'));
    cb(null, true);
  }
});