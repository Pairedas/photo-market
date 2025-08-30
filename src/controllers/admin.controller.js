const photos = require('../services/photo.service');
const orders = require('../services/order.service');
const links  = require('../services/link.service');
const dayjs  = require('dayjs');
const path   = require('path');
const uploadPhoto = require('../middlewares/uploadPhoto'); // <-- ajout

/* ===================== COMMANDES ===================== */
exports.ordersList = (req,res)=>{
  const list = orders.all().sort((a,b)=> new Date(b.created_at)-new Date(a.created_at));
  res.render('admin/orders', { title: 'Admin – Commandes', orders: list, photos: photos.all() });
};

exports.orderDetail = (req,res)=>{
  const order = orders.findById(req.params.id);
  if(!order) return res.status(404).send('Commande introuvable');
  const photo = photos.all().find(p=>p.id===order.photo_id);
  res.render('admin/order_detail', { title: 'Admin – Détail commande', order, photo });
};

exports.markPaid = (req,res)=>{
  const o = orders.setStatus(req.params.id, 'PAID', { paid_at: new Date().toISOString() });
  if(!o) return res.status(404).send('Commande introuvable');
  res.redirect(req.baseUrl + '/orders/' + o.id);
};

exports.generateLink = (req,res)=>{
  const order = orders.findById(req.params.id);
  if(!order) return res.status(404).send('Commande introuvable');
  links.createDownloadLink({ order_id: order.id, photo_id: order.photo_id });
  res.redirect(req.baseUrl + '/orders/' + order.id);
};

exports.sendLink = async (req,res)=>{
  const order = orders.findById(req.params.id);
  if(!order) return res.status(404).send('Commande introuvable');
  const link = links.getValidLink(order.id);
  if(!link) return res.status(400).send('Générez d’abord un lien.');
  const downloadUrl = (process.env.BASE_URL || 'http://127.0.0.1:3000') +
    `/download/${order.id}/${order.photo_id}?token=${encodeURIComponent(link.token)}`;
  const expires_at = dayjs(link.expires_at).format('DD/MM/YYYY HH:mm');

  try{
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT||'587',10),
      secure: String(process.env.SMTP_SECURE||'false')==='true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'no-reply@example.com',
      to: order.buyer_email,
      subject: `Votre photo est prête – ${order.order_ref}`,
      text: `Bonjour ${order.buyer_name || ''},

Voici votre lien de téléchargement (valide jusqu'au ${expires_at}) :
${downloadUrl}

— ${process.env.SITE_NAME || 'Photo Market'}`
    });
    orders.setStatus(order.id, 'FULFILLED', { fulfilled_at: new Date().toISOString() });
  }catch(e){
    return res.status(500).send('Erreur envoi email: '+e.message);
  }
  res.redirect(req.baseUrl + '/orders/' + order.id);
};

exports.reject = (req,res)=>{
  const o = orders.setStatus(req.params.id, 'REJECTED');
  if(!o) return res.status(404).send('Commande introuvable');
  res.redirect(req.baseUrl + '/orders/' + o.id);
};

exports.viewProof = (req,res)=>{
  const o = orders.findById(req.params.orderId);
  if(!o || !o.proof_path) return res.status(404).send('Preuve non trouvée');
  res.sendFile(path.resolve(o.proof_path));
};

/* ===================== PHOTOS (ADMIN) ===================== */
exports.photosList = (req,res)=>{
  res.render('admin/photos', {
    title: 'Admin – Photos',
    photos: photos.all()
  });
};

exports.photoNewForm = (req,res)=>{
  res.render('admin/photo_new', {
    title: 'Admin – Nouvelle photo'
  });
};

exports.photoCreate = async (req,res)=>{   // <-- async
  const body = req.body || {};
  const files = req.files || {};
  const preview = (files.preview_file && files.preview_file[0]) ? files.preview_file[0] : null;
  const original = (files.original_file && files.original_file[0]) ? files.original_file[0] : null;

  if (!preview || !original) {
    return res.status(400).send('Fichiers manquants (preview et original requis).');
  }

  // Optimise la vignette preview
  if (preview && preview.path) {
    try { await uploadPhoto.optimizePreview(preview.path); } catch (e) { console.warn(e.message); }
  }

  const categories = (body.categories || '')
    .split(',')
    .map(s=>s.trim())
    .filter(Boolean);

  photos.create({
    title: body.title,
    price: Number(body.price || 0),
    categories,
    preview_path: '/previews/' + preview.filename, // public
    original_path: original.filename,              // privé (storage/originals)
    status: body.status || 'published',
    currency: process.env.CURRENCY || 'XOF'
  });

  return res.redirect(req.baseUrl + '/photos');
};

exports.photoEditForm = (req,res)=>{
  const photo = photos.findById(req.params.id);
  if (!photo) return res.status(404).send('Photo introuvable');
  res.render('admin/photo_edit', {
    title: 'Admin – Éditer photo',
    photo
  });
};

exports.photoUpdate = async (req,res)=>{   // <-- async
  const body = req.body || {};
  const files = req.files || {};
  const preview = (files.preview_file && files.preview_file[0]) ? files.preview_file[0] : null;
  const original = (files.original_file && files.original_file[0]) ? files.original_file[0] : null;

  const patch = {
    title: body.title,
    price: Number(body.price || 0),
    categories: (body.categories || '').split(',').map(s=>s.trim()).filter(Boolean),
    status: body.status || 'draft'
  };
  if (preview)  patch.preview_path  = '/previews/' + preview.filename;
  if (original) patch.original_path = original.filename;

  // Optimise la nouvelle preview si remplacée
  if (preview && preview.path) {
    try { await uploadPhoto.optimizePreview(preview.path); } catch (e) { console.warn(e.message); }
  }

  const updated = photos.update(req.params.id, patch);
  if (!updated) return res.status(404).send('Photo introuvable');

  return res.redirect(req.baseUrl + '/photos');
};

exports.photoToggle = (req,res)=>{
  const p = photos.toggleStatus(req.params.id);
  if (!p) return res.status(404).send('Photo introuvable');
  return res.redirect(req.baseUrl + '/photos');
};

exports.photoDelete = (req,res)=>{
  const ok = photos.remove(req.params.id);
  if (!ok) return res.status(404).send('Photo introuvable');
  return res.redirect(req.baseUrl + '/photos');
};