const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const guests = [
  { firstName: 'Saoud', lastName: 'LANDIOUN', whatsappNumber: '+97484124' },
  { firstName: 'Rizkiath', lastName: 'YAYA NADJO', whatsappNumber: '+22995356886' },
  { firstName: 'Célia', lastName: 'AYIVI', whatsappNumber: '+22996121994' },
  { firstName: 'Elom', lastName: 'Tsaklidji', whatsappNumber: '+22997679061' },
  { firstName: 'Ulrich', lastName: 'NAGO', whatsappNumber: '+22997138452' },
  // remplace/complète par tes vrais invités de test
];

async function main() {
  for (const guest of guests) {
    await prisma.guest.upsert({
      where: { whatsappNumber: guest.whatsappNumber },
      update: {},
      create: guest,
    });
  }
  console.log(`${guests.length} invités traités.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });