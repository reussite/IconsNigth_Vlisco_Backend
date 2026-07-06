const crypto = require('crypto');

// Génère un code au format VIP-XXXXXX (6 caractères alphanumériques majuscules)
function generateInvitationCode() {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `VIP-${random}`;
}

module.exports = generateInvitationCode;