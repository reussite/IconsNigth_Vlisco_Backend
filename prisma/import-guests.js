const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ---- Chemin du fichier Excel à importer ----
// Dépose ton fichier dans le dossier backend et mets son nom ici :
const FICHIER = path.join(__dirname, '..', 'invites.xlsx');

// Nettoie un numéro : retire espaces, tirets, points, parenthèses (sécurité)
function normalizePhone(raw) {
  if (raw === null || raw === undefined) return '';
  // Excel peut lire un numéro comme un nombre → on force en texte
  let s = String(raw).trim();
  // retire tout sauf les chiffres et le +
  s = s.replace(/[^\d+]/g, '');
  return s;
}

// Valide le format attendu : + optionnel suivi de 8 à 15 chiffres
function isValidPhone(phone) {
  return /^\+?[0-9]{8,15}$/.test(phone);
}

async function main() {
  // Lecture du fichier Excel
  const workbook = XLSX.readFile(FICHIER);
  const sheetName = workbook.SheetNames[0]; // première feuille
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  console.log(`\nFichier lu : ${rows.length} lignes trouvées.\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const errorDetails = [];
  const seen = new Set(); // pour détecter les doublons dans le fichier lui-même

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const ligne = i + 2; // +2 : ligne 1 = en-têtes, index commence à 0

    const firstName = String(row.firstName || '').trim();
    const lastName = String(row.lastName || '').trim();
    const whatsappNumber = normalizePhone(row.whatsappNumber);

    // Validation
    if (!firstName || !lastName) {
      errors++;
      errorDetails.push(`Ligne ${ligne} : prénom ou nom manquant.`);
      continue;
    }
    if (!isValidPhone(whatsappNumber)) {
      errors++;
      errorDetails.push(`Ligne ${ligne} : numéro invalide ("${row.whatsappNumber}").`);
      continue;
    }

    // Doublon dans le fichier
    if (seen.has(whatsappNumber)) {
      skipped++;
      errorDetails.push(`Ligne ${ligne} : doublon dans le fichier (${whatsappNumber}).`);
      continue;
    }
    seen.add(whatsappNumber);

    // Insertion / mise à jour (upsert : pas de doublon en base)
    try {
      await prisma.guest.upsert({
        where: { whatsappNumber },
        update: { firstName, lastName }, // met à jour le nom si l'invité existe déjà
        create: { firstName, lastName, whatsappNumber },
      });
      imported++;
    } catch (e) {
      errors++;
      errorDetails.push(`Ligne ${ligne} : erreur base (${e.message}).`);
    }
  }

  // Rapport final
  console.log('========== RAPPORT D\'IMPORT ==========');
  console.log(`✅ Importés / mis à jour : ${imported}`);
  console.log(`⚠️  Doublons ignorés     : ${skipped}`);
  console.log(`❌ Erreurs               : ${errors}`);
  console.log('======================================\n');

  if (errorDetails.length > 0) {
    console.log('Détail des lignes à vérifier :');
    errorDetails.slice(0, 50).forEach(d => console.log('  - ' + d));
    if (errorDetails.length > 50) {
      console.log(`  ... et ${errorDetails.length - 50} autres.`);
    }
    console.log('');
  }
}

main()
  .catch((e) => {
    console.error('Erreur fatale :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });