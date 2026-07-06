const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const guests = [
  { firstName: 'Hairou-Dine', lastName: 'BIAOU', whatsappNumber: '+22961149410' },
  { firstName: 'Jean', lastName: 'Kouassi', whatsappNumber: '+22961149411' },
  { firstName: 'Fatou', lastName: 'Diallo', whatsappNumber: '+22961149412' },
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