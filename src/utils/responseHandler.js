function successResponse(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function errorResponse(res, statusCode, message, data = null) {
  const payload = {
    success: false,
    message,
  };

  // N'ajoute "data" que s'il y a réellement une donnée à transmettre
  if (data !== null) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
}

module.exports = { successResponse, errorResponse };