const { BookingError } = require('../services/booking.service');
const { AdminError } = require('../services/admin.service');
const { errorResponse } = require('../utils/responseHandler');

function errorMiddleware(err, req, res, next) {
  if (err instanceof BookingError) {
    return errorResponse(res, err.statusCode, err.message, err.data);
  }
  if (err instanceof AdminError) {
    return errorResponse(res, err.statusCode, err.message);
  }

  console.error(err);
  return errorResponse(res, 500, "Une erreur interne est survenue.");
}

module.exports = errorMiddleware;