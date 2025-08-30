// src/services/order.service.js
const path = require('path');
const { readJSON, writeJSON } = require('../storage/jsonStore');
const { DATA_DIR } = require('../config');

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function all() {
  return readJSON(ORDERS_FILE, []);
}

function findById(id) {
  return all().find(o => o.id === id);
}

function create(order) {
  const orders = all();
  const id = 'o' + Date.now();
  const entry = { id, ...order, status: 'pending' };
  orders.push(entry);
  writeJSON(ORDERS_FILE, orders);
  return entry;
}

function update(id, patch = {}) {
  const orders = all();
  const i = orders.findIndex(o => o.id === id);
  if (i < 0) return null;
  const before = orders[i];
  const after = { ...before, ...patch };
  orders[i] = after;
  writeJSON(ORDERS_FILE, orders);
  return after;
}

module.exports = {
  all,
  findById,
  create,
  update,
};