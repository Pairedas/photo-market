const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { STORAGE_DIR } = require('../config');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(STORAGE_DIR, 'originals');
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, dir);
    });
  },
  filename: (req, file, cb) => {
    const stamp = Date.now();
    const ext = (file.originalname && path.extname(file.originalname)) || '';
    cb(null, `original-${stamp}${ext}`);
  }
});

module.exports = multer({ storage });