const prisma = require('../config/database');
const generateInvitationCode = require('../utils/generateInvitationCode');

class BookingError extends Error {
  // 3e paramètre optionnel : données additionnelles à renvoyer au client
  constructor(message, statusCode, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

async function createBooking({ whatsappNumber, firstName, lastName }) {
  const guest = await prisma.guest.findUnique({
    where: { whatsappNumber: whatsappNumber.trim() },
    include: { booking: true },
  });

  if (!guest) {
    throw new BookingError("Ce numéro WhatsApp n'est associé à aucune invitation.", 404);
  }

  // Doublon : on renvoie aussi le code de la réservation existante
  if (guest.booking) {
    throw new BookingError(
      'Une réservation existe déjà pour cet invité.',
      409,
      { invitationCode: guest.booking.invitationCode }
    );
  }

  let invitationCode;
  let isUnique = false;

  while (!isUnique) {
    invitationCode = generateInvitationCode();
    const existingCode = await prisma.booking.findUnique({ where: { invitationCode } });
    if (!existingCode) isUnique = true;
  }

  const booking = await prisma.booking.create({
    data: {
      invitationCode,
      guestId: guest.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    },
  });

  const notificationPayload = {
    channel: 'whatsapp',
    recipient: guest.whatsappNumber,
    guestFullName: `${booking.firstName} ${booking.lastName}`,
    invitationCode: booking.invitationCode,
  };

  return {
    booking: {
      invitationCode: booking.invitationCode,
      status: booking.status,
      confirmedAt: booking.confirmedAt,
    },
    invitationCard: {
      firstName: booking.firstName,
      lastName: booking.lastName,
      invitationCode: booking.invitationCode,
    },
    notification: notificationPayload,
  };
}

async function getBookingByInvitationCode(invitationCode) {
  const booking = await prisma.booking.findUnique({
    where: { invitationCode },
  });

  if (!booking) {
    throw new BookingError('Aucune réservation trouvée pour ce code.', 404);
  }

  return booking;
}

module.exports = { createBooking, getBookingByInvitationCode, BookingError };