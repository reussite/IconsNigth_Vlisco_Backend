const bcrypt = require('bcryptjs');

// Mot de passe à hasher
const password = 'IcOn1c@l2026';

const hash = bcrypt.hashSync(password, 10);
console.log('Copie cette ligne dans ton .env :');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);