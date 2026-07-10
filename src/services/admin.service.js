const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

class AdminError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// ==========================================================
//  AUTHENTIFICATION
// ==========================================================

// Vérifie les identifiants et renvoie un token JWT si corrects
function login(username, password) {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUser || !expectedHash) {
    throw new AdminError("Configuration admin manquante côté serveur.", 500);
  }

  const userOk = username === expectedUser;
  const passOk = bcrypt.compareSync(password, expectedHash);

  // Message générique volontaire (ne révèle pas ce qui est faux)
  if (!userOk || !passOk) {
    throw new AdminError("Identifiants incorrects.", 401);
  }

  const token = jwt.sign(
    { role: 'admin', username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );

  return { token };
}

// ==========================================================
//  STATISTIQUES
// ==========================================================

async function getStats() {
  const [totalGuests, totalBookings] = await Promise.all([
    prisma.guest.count(),
    prisma.booking.count(),
  ]);

  const notBooked = Math.max(totalGuests - totalBookings, 0);
  const rate = totalGuests > 0 ? Math.round((totalBookings / totalGuests) * 100) : 0;

  // 10 réservations les plus récentes, avec les infos de l'invité lié
  const recent = await prisma.booking.findMany({
    orderBy: { confirmedAt: 'desc' },
    take: 10,
    select: {
      invitationCode: true,
      firstName: true,
      lastName: true,
      confirmedAt: true,
      guest: { select: { whatsappNumber: true } },
    },
  });

  return {
    totals: {
      guests: totalGuests,
      booked: totalBookings,
      notBooked,
      rate,
    },
    recent: recent.map(b => ({
      invitationCode: b.invitationCode,
      firstName: b.firstName,
      lastName: b.lastName,
      whatsappNumber: b.guest?.whatsappNumber || '',
      confirmedAt: b.confirmedAt,
    })),
  };
}

// ==========================================================
//  GESTION DES INVITÉS (CRUD)
// ==========================================================

// Liste des invités avec leur statut de réservation
async function listGuests() {
  const guests = await prisma.guest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { booking: { select: { invitationCode: true, confirmedAt: true } } },
  });

  return guests.map(g => ({
    id: g.id,
    firstName: g.firstName,
    lastName: g.lastName,
    whatsappNumber: g.whatsappNumber,
    hasBooked: !!g.booking,
    invitationCode: g.booking?.invitationCode || null,
    confirmedAt: g.booking?.confirmedAt || null,
  }));
}

// Ajouter un invité
async function createGuest({ firstName, lastName, whatsappNumber }) {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  const phone = (whatsappNumber || '').trim();

  if (first.length < 2 || last.length < 2) {
    throw new AdminError("Prénom et nom sont requis (2 caractères minimum).", 400);
  }
  if (!/^\+?[0-9]{8,15}$/.test(phone)) {
    throw new AdminError("Format du numéro WhatsApp invalide.", 400);
  }

  const existing = await prisma.guest.findUnique({ where: { whatsappNumber: phone } });
  if (existing) {
    throw new AdminError("Un invité avec ce numéro WhatsApp existe déjà.", 409);
  }

  const guest = await prisma.guest.create({
    data: { firstName: first, lastName: last, whatsappNumber: phone },
  });
  return guest;
}

// Modifier un invité
async function updateGuest(id, { firstName, lastName, whatsappNumber }) {
  const guestId = parseInt(id, 10);
  if (Number.isNaN(guestId)) throw new AdminError("Identifiant invalide.", 400);

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { booking: true },
  });
  if (!guest) throw new AdminError("Invité introuvable.", 404);

  const data = {};

  if (firstName !== undefined) {
    if (firstName.trim().length < 2) throw new AdminError("Prénom invalide.", 400);
    data.firstName = firstName.trim();
  }
  if (lastName !== undefined) {
    if (lastName.trim().length < 2) throw new AdminError("Nom invalide.", 400);
    data.lastName = lastName.trim();
  }

  // Le numéro n'est modifiable que si l'invité n'a pas encore réservé
  if (whatsappNumber !== undefined && whatsappNumber.trim() !== guest.whatsappNumber) {
    if (guest.booking) {
      throw new AdminError(
        "Impossible de modifier le numéro : cet invité a déjà réservé.",
        409
      );
    }
    const phone = whatsappNumber.trim();
    if (!/^\+?[0-9]{8,15}$/.test(phone)) {
      throw new AdminError("Format du numéro WhatsApp invalide.", 400);
    }
    const dup = await prisma.guest.findUnique({ where: { whatsappNumber: phone } });
    if (dup && dup.id !== guestId) {
      throw new AdminError("Un autre invité utilise déjà ce numéro.", 409);
    }
    data.whatsappNumber = phone;
  }

  const updated = await prisma.guest.update({ where: { id: guestId }, data });
  return updated;
}

// Supprimer un invité (refusé s'il a déjà réservé)
async function deleteGuest(id) {
  const guestId = parseInt(id, 10);
  if (Number.isNaN(guestId)) throw new AdminError("Identifiant invalide.", 400);

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { booking: true },
  });
  if (!guest) throw new AdminError("Invité introuvable.", 404);

  if (guest.booking) {
    throw new AdminError(
      "Impossible de supprimer : cet invité a déjà réservé sa place.",
      409
    );
  }

  await prisma.guest.delete({ where: { id: guestId } });
  return { id: guestId };
}

module.exports = {
  login,
  getStats,
  listGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  AdminError,
};