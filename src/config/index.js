const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3000,
  ADMIN_BASE: process.env.ADMIN_BASE_PATH || '/backoffice',
  ROOT_DIR: path.join(__dirname, '..', '..'),
  PUBLIC_DIR: path.join(__dirname, '..', '..', 'public'),
  VIEWS_DIR: path.join(__dirname, '..', '..', 'views'),
  DATA_DIR: path.join(__dirname, '..', '..', 'data'),
  STORAGE_DIR: path.join(__dirname, '..', '..', 'storage'),
};