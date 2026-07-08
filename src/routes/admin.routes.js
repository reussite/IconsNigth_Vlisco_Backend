const express = require('express');
const router = express.Router();
const { adminLogin, adminMe, adminStats, adminListGuests, adminCreateGuest, adminUpdateGuest, adminDeleteGuest } = require('../controllers/admin.controller');
const requireAdmin = require('../middlewares/auth.admin');

// Route publique : connexion
router.post('/login', adminLogin);

// Route protégée : vérifie que le token est valide (utile au chargement du dashboard)
router.get('/me', requireAdmin, adminMe);
router.get('/stats', requireAdmin, adminStats);
router.get('/guests', requireAdmin, adminListGuests);
router.post('/guests', requireAdmin, adminCreateGuest);
router.put('/guests/:id', requireAdmin, adminUpdateGuest);
router.delete('/guests/:id', requireAdmin, adminDeleteGuest);

module.exports = router;