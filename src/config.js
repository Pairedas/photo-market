// src/config.js
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, '..', 'storage');

const ADMIN_BASE = process.env.ADMIN_BASE_PATH || '/backoffice';

module.exports = { DATA_DIR, STORAGE_DIR, ADMIN_BASE };