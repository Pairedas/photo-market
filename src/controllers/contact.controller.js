const dayjs = require('dayjs');
const { readJSON, writeJSON } = require('../storage/jsonStore');
const { DATA_DIR } = require('../config');
const path = require('path');

const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

exports.contactGet = (req, res) => {
  res.render('public/contact', { title: 'Contact' });
};

exports.contactPost = async (req, res) => {
  try {
    // Honeypot anti-spam
    if (req.body && req.body.company) {
      return res.status(400).send('Spam détecté');
    }

    const { email, message } = req.body || {};
    if (!email || !message) {
      return res.status(400).send('Champs requis.');
    }

    // Sauvegarde JSON
    const list = readJSON(CONTACTS_FILE, []);
    const entry = {
      id: 'c' + Date.now(),
      email,
      message,
      created_at: new Date().toISOString()
    };
    list.push(entry);
    writeJSON(CONTACTS_FILE, list);

    // Envoi email si SMTP configuré
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT, 10),
          secure: String(process.env.SMTP_SECURE || 'false') === 'true',
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        await transporter.sendMail({
          from: process.env.FROM_EMAIL || SMTP_USER,
          to: process.env.FROM_EMAIL || SMTP_USER,
          replyTo: email,
          subject: `[Contact] ${process.env.SITE_NAME || 'Site'} – ${dayjs().format('DD/MM HH:mm')}`,
          text: `De: ${email}\n\n${message}`,
        });
      } catch (e) {
        console.warn('[CONTACT] e-mail non envoyé :', e.message);
        // On ne bloque pas l'utilisateur pour autant
      }
    } else {
      console.log('[CONTACT] (sans SMTP)', entry);
    }

    // Merci
    res.render('public/contact_thanks', {
      title: 'Merci',
      email
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur.');
  }
};