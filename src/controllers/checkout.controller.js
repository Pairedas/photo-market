const photos = require('../services/photo.service');
const orders = require('../services/order.service');

exports.checkoutForm = (req,res)=>{
  const photo = photos.findBySlug(req.params.slug);
  if (!photo || photo.status!=='published') return res.status(404).send('Photo introuvable');
  const orderRef = 'CMD-' + Date.now();
  res.render('public/checkout', {
    title: 'Achat',
    photo,
    orderRef,
    momoNumber: process.env.PAYMENT_MOMO_NUMBER || '—',
    momoName: process.env.PAYMENT_MOMO_NAME || '—',
    paymentDelayHours: process.env.PAYMENT_DELAY_HOURS || 24
  });
};

exports.submitProof = (req,res)=>{
  const photo = photos.findBySlug(req.params.slug);
  if (!photo || photo.status!=='published') return res.status(404).send('Photo introuvable');
  const { order_ref, buyer_email, buyer_name, payment_method, payment_reference_client, accept_cgv } = req.body;
  if (!buyer_email || !order_ref || !payment_reference_client || !accept_cgv) {
    return res.status(400).send('Champs manquants.');
  }
  orders.create({
    photo_id: photo.id,
    buyer_email, buyer_name,
    amount: photo.price, currency: photo.currency || process.env.CURRENCY || 'XOF',
    payment_method, payment_reference_client,
    proof_path: req.file ? req.file.path : null,
    order_ref
  });
  res.render('public/thanks', { title: 'Merci', orderRef: order_ref, contact: process.env.PAYMENT_CONTACT || '' });
};