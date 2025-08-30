// src/server.js
const http = require('http');
const app = require('./app');

const PORT = Number(process.env.PORT) || 3000; // Render injecte ce PORT
const HOST = '0.0.0.0';                        // écouter sur toutes les interfaces

app.set('port', PORT);

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server démarré sur http://${HOST}:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  process.exit(1);
});

module.exports = server;