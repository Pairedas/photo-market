const photosSvc = require('../services/photo.service');

function uniqueCategories(list){
  return Array.from(new Set(list.flatMap(p => p.categories || []))).filter(Boolean).sort();
}

exports.home = (req,res)=>{
  const all = photosSvc.allPublished();
  const latest = all.slice(-6).reverse(); // 6 dernières
  res.render('public/index', {
    title: 'Accueil',
    latest,
    categories: uniqueCategories(all)
  });
};

exports.catalog = (req,res)=>{
  const all = photosSvc.allPublished();
  res.render('public/catalog', {
    title: 'Catalogue',
    photos: all,
    categories: uniqueCategories(all)
  });
};

exports.about = (req,res)=> res.render('public/about', { title: 'À propos' });
exports.faq   = (req,res)=> res.render('public/faq',   { title: 'FAQ' });

exports.contactGet = (req,res)=> res.render('public/contact', { title: 'Contact' });
exports.contactPost = async (req,res)=>{
  const { email, message } = req.body || {};
  if(!email || !message) return res.status(400).send('Champs requis.');
  // Essai d’envoi email si SMTP configuré
  try{
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT||'587',10),
      secure: String(process.env.SMTP_SECURE||'false')==='true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    });
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@example.com',
      to: process.env.FROM_EMAIL || process.env.SMTP_USER || 'owner@example.com',
      subject: `[Contact] ${process.env.SITE_NAME || 'Site'}`,
      text: `De: ${email}\n\n${message}`
    });
    res.send('Merci, votre message a été envoyé.');
  }catch(e){
    // fallback si SMTP non configuré
    console.log('[CONTACT]', { email, message });
    res.send('Merci, votre message a été enregistré.');
  }
};