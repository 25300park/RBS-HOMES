const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('test1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'agent@test.com' },
    update: { level: 2 },
    create: { email: 'agent@test.com', password: hash, name: 'Test Agent', level: 2 }
  });
  console.log('Agent created:', user.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
