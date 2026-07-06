const express = require('express');
const router = express.Router();
const { createReservation, downloadInvitationCard } = require('../controllers/booking.controller');

router.post('/reservations', createReservation);
router.get('/reservations/:invitationCode/card', downloadInvitationCard);

module.exports = router;