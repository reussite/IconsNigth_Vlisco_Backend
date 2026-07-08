const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHandler');

// Protège les routes admin : exige un token JWT valide dans l'en-tête Authorization
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return errorResponse(res, 401, "Accès non autorisé : token manquant.");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      return errorResponse(res, 403, "Accès refusé.");
    }
    req.admin = payload; // disponible pour les contrôleurs suivants
    next();
  } catch (err) {
    return errorResponse(res, 401, "Session expirée ou token invalide.");
  }
}

module.exports = requireAdmin;