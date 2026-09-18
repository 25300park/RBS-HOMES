/**
 * QA 테스트 계정 생성 스크립트
 * 실행: node prisma/seed-test-users.js
 *
 * 생성 계정:
 *   buyer@test.com  / test1234  (level 1 - Buyer)
 *   seller@test.com / test1234  (level 4 - Owner/Seller, owner@test.com과 동일 권한)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TEST_ACCOUNTS = [
  {
    email: 'buyer@test.com',
    name: 'Test Buyer',
    level: 1,
    phone: '09000000180',
  },
  {
    email: 'seller@test.com',
    name: 'Test Seller',
    level: 4,
    phone: '09000000183',
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash('test1234', 10);

  for (const account of TEST_ACCOUNTS) {
    const existing = await prisma.user.findUnique({ where: { email: account.email } });

    if (existing) {
      console.log(`⏭  SKIP — ${account.email} already exists (id: ${existing.id})`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: account.email,
        name: account.name,
        password: hashedPassword,
        level: account.level,
        phone: account.phone,
        status: -1,
        regdate: new Date(),
      },
    });

    console.log(`✅ Created ${account.email} — id: ${user.id}, level: ${user.level}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
