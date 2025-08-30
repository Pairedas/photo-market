const path = require('path');

module.exports = {
  SITE_NAME: process.env.SITE_NAME || 'Photo Market',
  CURRENCY: process.env.CURRENCY || 'XOF',
  ADMIN_USER: process.env.ADMIN_USER || 'admin',
  ADMIN_PASS: process.env.ADMIN_PASS || 'admin',
  ADMIN_BASE_PATH: process.env.ADMIN_BASE_PATH || '/backoffice',

  // IMPORTANT: si pas de disque, fallback sur /tmp
  DATA_DIR: process.env.DATA_DIR || path.join('/tmp', 'data'),
  STORAGE_DIR: process.env.STORAGE_DIR || path.join('/tmp', 'storage'),

  DOWNLOAD_TTL_HOURS: process.env.DOWNLOAD_TTL_HOURS || 24,
  DOWNLOAD_MAX_USES: process.env.DOWNLOAD_MAX_USES || 3,

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@example.com'
};