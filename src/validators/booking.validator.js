function validateBookingInput(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push('Le corps de la requête est invalide.');
    return errors;
  }

  const { whatsappNumber, firstName, lastName } = data;

  if (!whatsappNumber || typeof whatsappNumber !== 'string') {
    errors.push('Le numéro WhatsApp est requis.');
  } else if (!/^\+?[0-9]{8,15}$/.test(whatsappNumber.trim())) {
    errors.push('Le format du numéro WhatsApp est invalide.');
  }

  if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
    errors.push('Le prénom est requis.');
  }

  if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
    errors.push('Le nom est requis.');
  }

  return errors;
}

module.exports = validateBookingInput;