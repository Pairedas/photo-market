const { path } = require('../storage/jsonStore');
const { readJSON, writeJSON } = require('../storage/jsonStore');
const { DATA_DIR } = require('../config');
const slugify = require('../utils/slugify');

const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');

function allPublished() {
  return readJSON(PHOTOS_FILE, []).filter(p => p.status === 'published');
}

function all() {
  return readJSON(PHOTOS_FILE, []);
}

function findBySlug(slug) {
  return all().find(p => p.slug === slug);
}

function findById(id) {
  return all().find(p => p.id === id);
}

function create({ title, price, categories = [], preview_path, original_path, status = 'published', currency }) {
  const data = all();
  const id = 'p' + Date.now();
  const slug = slugify(title);
  const entry = {
    id,
    title,
    slug,
    price: Number(price),
    categories,
    preview_path,
    original_path,
    status,
    currency
  };
  data.push(entry);
  writeJSON(PHOTOS_FILE, data);
  return entry;
}

function update(id, patch = {}) {
  const data = all();
  const i = data.findIndex(p => p.id === id);
  if (i < 0) return null;
  const before = data[i];
  const after = { ...before, ...patch };
  if (patch.title && patch.title !== before.title) {
    after.slug = slugify(patch.title);
  }
  data[i] = after;
  writeJSON(PHOTOS_FILE, data);
  return after;
}

function toggleStatus(id) {
  const data = all();
  const i = data.findIndex(p => p.id === id);
  if (i < 0) return null;
  data[i].status = data[i].status === 'published' ? 'draft' : 'published';
  writeJSON(PHOTOS_FILE, data);
  return data[i];
}

function remove(id) {
  const data = all();
  const i = data.findIndex(p => p.id === id);
  if (i < 0) return false;
  data.splice(i, 1);
  writeJSON(PHOTOS_FILE, data);
  return true;
}

module.exports = {
  allPublished,
  all,
  findBySlug,
  findById,
  create,
  update,
  toggleStatus,
  remove
};