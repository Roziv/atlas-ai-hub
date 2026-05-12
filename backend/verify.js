const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const count = await prisma.model.count();
  console.log('Model Count:', count);
  const orgs = await prisma.organization.findMany();
  console.log('Orgs:', orgs.map(o => o.name));
}
run().finally(() => prisma.$disconnect());
