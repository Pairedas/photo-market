const { path, readJSON, writeJSON } = require('../storage/jsonStore');
const { DATA_DIR } = require('../config');
const { v4: uuidv4 } = require('uuid');

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const LINKS_FILE  = path.join(DATA_DIR, 'links.json');

function all() { return readJSON(ORDERS_FILE, []); }
function save(list){ writeJSON(ORDERS_FILE, list); }
function findById(id){ return all().find(o => o.id === id); }

function create({ photo_id, buyer_email, buyer_name, amount, currency, payment_method, payment_reference_client, proof_path, order_ref }) {
  const list = all();
  const entry = {
    id: uuidv4(),
    order_ref,
    photo_id,
    buyer_email,
    buyer_name: buyer_name || null,
    amount,
    currency,
    payment_method: payment_method || 'mobile_money',
    payment_reference_client,
    proof_path: proof_path || null,
    status: 'UNDER_REVIEW',
    created_at: new Date().toISOString(),
    paid_at: null,
    fulfilled_at: null
  };
  list.push(entry);
  save(list);
  return entry;
}

function setStatus(id, status, extra={}) {
  const list = all();
  const i = list.findIndex(o => o.id === id);
  if (i === -1) return null;
  list[i] = { ...list[i], status, ...extra };
  save(list);
  return list[i];
}

/* === Links (download) === */
function allLinks(){ return readJSON(LINKS_FILE, []); }
function saveLinks(arr){ writeJSON(LINKS_FILE, arr); }

module.exports = { all, save, findById, create, setStatus, allLinks, saveLinks, ORDERS_FILE, LINKS_FILE };