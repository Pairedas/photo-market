require('dotenv').config();
const { PORT } = require('./config');
const app = require('./app');

app.listen(PORT, () => {
  const url = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
  console.log(`✅ Server démarré sur ${url}`);
});