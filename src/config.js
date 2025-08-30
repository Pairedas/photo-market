// src/config.js
const path = require('path');

// Si DATA_DIR / STORAGE_DIR ne sont pas fournis par l'env (Render Free),
// on bascule automatiquement sur /tmp (volatile mais accessible).
const DATA_DIR = process.env.DATA_DIR || path.join('/tmp', 'data');
const STORAGE_DIR = process.env.STORAGE_DIR || path.join('/tmp', 'storage');

const ADMIN_BASE = process.env.ADMIN_BASE_PATH || '/backoffice';

module.exports = {
  DATA_DIR,
  STORAGE_DIR,
  ADMIN_BASE
};