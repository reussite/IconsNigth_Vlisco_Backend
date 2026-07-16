const express = require('express');
const cors = require('cors');
const path = require('path');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// ---- API ----
app.use('/api', bookingRoutes);
app.use('/api/admin', adminRoutes);

// ---- Frontend statique ----
// Sert les fichiers du dossier frontend/ (landing + admin + assets)
const FRONT_DIR = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(FRONT_DIR));

// Pour toute route non-API, renvoyer index.html
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(FRONT_DIR, 'index.html'));
});

// ---- Gestion des erreurs (toujours en dernier) ----
app.use(errorMiddleware);

module.exports = app;