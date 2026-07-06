const { PrismaClient } = require('@prisma/client');

// Instance unique partagée dans toute l'application
const prisma = new PrismaClient();

module.exports = prisma;