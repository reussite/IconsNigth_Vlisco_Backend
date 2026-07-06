const { BookingError } = require('../services/booking.service');
const { errorResponse } = require('../utils/responseHandler');

function errorMiddleware(err, req, res, next) {
  if (err instanceof BookingError) {
    // Si l'erreur porte des données additionnelles (ex: invitationCode existant), on les transmet
    return errorResponse(res, err.statusCode, err.message, err.data);
  }

  console.error(err);
  return errorResponse(res, 500, 'Une erreur interne est survenue.');
}

module.exports = errorMiddleware;