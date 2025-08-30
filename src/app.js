const path = require('path');
const express = require('express');
const layouts = require('express-ejs-layouts');   // ← AJOUT
const morgan = require('morgan');
const bodyParser = require('body-parser');

const { ADMIN_BASE } = require('./config');
const errors = require('./middlewares/errors');
const webRoutes = require('./routes/web');
const adminRoutes = require('./routes/admin');
const authAdmin = require('./middlewares/authAdmin');

const app = express();

// Vues
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');
app.use(layouts);                                  // ← AJOUT
app.set('layout', 'public/layout');               // ← layout par défaut

// Static
app.use(express.static(path.join(__dirname, '..', 'public')));

// Logs & body
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Locals
app.use((req, res, next) => {
  res.locals.siteName = process.env.SITE_NAME || 'Photo Market';
  res.locals.currency = process.env.CURRENCY || 'XOF';
  next();
});

// Routes publiques
app.use('/', webRoutes);

// Routes admin avec layout admin
app.use(ADMIN_BASE, authAdmin, (req, res, next) => {
  res.locals.isAdmin = true;
  res.locals.adminBase = ADMIN_BASE;
  res.locals.layout = 'admin/layout';            // ← layout admin
  next();
}, adminRoutes);

// Erreurs
app.use(errors.notFound);
app.use(errors.onError);

module.exports = app;