const router = require('express').Router();
const gallery = require('../controllers/gallery.controller');
const checkout = require('../controllers/checkout.controller');
const uploadProof = require('../middlewares/uploadProof');
const photos = require('../services/photo.service');
const contact = require('../controllers/contact.controller');

// Accueil + pages
router.get('/', gallery.home);
router.get('/catalogue', gallery.catalog);
router.get('/about', gallery.about);
router.get('/faq', gallery.faq);

// Contact
router.get('/contact', contact.contactGet);
router.post('/contact', contact.contactPost);

// Fiche produit
router.get('/photo/:slug', (req,res)=>{
  const photo = photos.findBySlug(req.params.slug);
  if(!photo || photo.status!=='published') return res.status(404).send('Photo introuvable');

  res.locals.og = {
    title: photo.title,
    description: `${photo.title} – ${photo.price} ${photo.currency || res.locals.currency}`,
    image: photo.preview_path,
    url: (process.env.BASE_URL || 'http://127.0.0.1:' + (process.env.PORT || 3000)) + '/photo/' + photo.slug
  };

  res.render('public/photo', { title: photo.title, photo });
});

// Checkout (preuve)
router.get('/checkout/:slug', checkout.checkoutForm);
router.post('/checkout/:slug', uploadProof.single('proof_file'), checkout.submitProof);

module.exports = router;