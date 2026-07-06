const validateBookingInput = require('../validators/booking.validator');
const { createBooking, getBookingByInvitationCode } = require('../services/booking.service');
const generateInvitationPdf = require('../services/pdf.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

async function createReservation(req, res, next) {
  try {
    const errors = validateBookingInput(req.body);
    if (errors.length > 0) {
      return errorResponse(res, 400, errors.join(' '));
    }

    const { whatsappNumber, firstName, lastName } = req.body;
    const result = await createBooking({ whatsappNumber, firstName, lastName });

    return successResponse(res, 201, 'Réservation confirmée avec succès.', {
      booking: result.booking,
      guest: {
        firstName: result.invitationCard.firstName,
        lastName: result.invitationCard.lastName,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function downloadInvitationCard(req, res, next) {
  try {
    const { invitationCode } = req.params;
    const booking = await getBookingByInvitationCode(invitationCode);

    const pdfBuffer = await generateInvitationPdf({
      firstName: booking.firstName,
      lastName: booking.lastName,
      invitationCode: booking.invitationCode,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invitation-${booking.invitationCode}.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

module.exports = { createReservation, downloadInvitationCard };