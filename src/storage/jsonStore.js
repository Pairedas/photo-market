// src/storage/jsonStore.js
const fs = require('fs');
const path = require('path');

function ensureDirFor(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function readJSON(filePath, fallback = null) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    if (e.code === 'ENOENT') return fallback;
    console.error('[jsonStore] read error', filePath, e.message);
    return fallback;
  }
}

function writeJSON(filePath, data) {
  try {
    ensureDirFor(filePath);
    const txt = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, txt, 'utf8');
  } catch (e) {
    console.error('[jsonStore] write error', filePath, e.message);
    throw e;
  }
}

module.exports = { readJSON, writeJSON };
