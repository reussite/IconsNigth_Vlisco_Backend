const express = require('express');
const router = express.Router();
const {
  adminLogin,
  adminMe,
  adminStats,
  adminListGuests,
  adminCreateGuest,
  adminUpdateGuest,
  adminDeleteGuest,
} = require('../controllers/admin.controller');
const requireAdmin = require('../middlewares/auth.admin');

// ---- Authentification ----
router.post('/login', adminLogin);              // public
router.get('/me', requireAdmin, adminMe);       // protégé

// ---- Statistiques ----
router.get('/stats', requireAdmin, adminStats); // protégé

// ---- Gestion des invités (toutes protégées) ----
router.get('/guests', requireAdmin, adminListGuests);
router.post('/guests', requireAdmin, adminCreateGuest);
router.put('/guests/:id', requireAdmin, adminUpdateGuest);
router.delete('/guests/:id', requireAdmin, adminDeleteGuest);

module.exports = router;