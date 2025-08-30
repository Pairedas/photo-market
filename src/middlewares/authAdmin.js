const basicAuth = require('express-basic-auth');

module.exports = basicAuth({
  users: { [process.env.ADMIN_USER || 'admin']: process.env.ADMIN_PASS || 'admin' },
  challenge: true,
  realm: 'Admin Area'
});