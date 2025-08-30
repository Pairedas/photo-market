const router = require('express').Router();
const admin = require('../controllers/admin.controller');
const uploadPhoto = require('../middlewares/uploadPhoto');

/* Commandes (déjà en place) */
router.get('/orders', admin.ordersList);
router.get('/orders/:id', admin.orderDetail);
router.get('/proof/:orderId', admin.viewProof);
router.post('/orders/:id/mark-paid', admin.markPaid);
router.post('/orders/:id/generate-link', admin.generateLink);
router.post('/orders/:id/send-link', admin.sendLink);
router.post('/orders/:id/reject', admin.reject);

/* Photos */
router.get('/photos', admin.photosList);
router.get('/photos/new', admin.photoNewForm);
router.post('/photos', uploadPhoto.fields([
  { name: 'preview_file', maxCount: 1 },
  { name: 'original_file', maxCount: 1 },
]), admin.photoCreate);

router.get('/photos/:id/edit', admin.photoEditForm);
router.post('/photos/:id', uploadPhoto.fields([
  { name: 'preview_file', maxCount: 1 },
  { name: 'original_file', maxCount: 1 },
]), admin.photoUpdate);

router.post('/photos/:id/toggle', admin.photoToggle);
router.post('/photos/:id/delete', admin.photoDelete);

module.exports = router;