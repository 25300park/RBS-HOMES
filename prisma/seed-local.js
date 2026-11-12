// 로컬 전용 가짜 데이터 시드. 운영/원격 DB에서는 절대 실행하지 않는다
// (실행은 항상 scripts/with-local-db.js를 거쳐서 DATABASE_URL 호스트 가드를 통과한 뒤에만 된다).
// 두 번 실행해도 안전하도록, 이 스크립트가 만든 레코드는 전부 SEED_MARKER로
// 표시해 두고 재실행 시 그 표시가 있는 레코드만 지우고 다시 만든다.

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { isAllowedLocalHost } = require("../scripts/guard-local-db");

const prisma = new PrismaClient();

const SEED_MARKER = "[RBS_LOCAL_SEED]";
// 로컬 전용 고정 비밀번호. docs/local-dev.md에도 동일하게 기재되어 있다.
// 운영에는 존재하지 않는 계정이므로 노출돼도 위험하지 않다.
const LOCAL_PASSWORD = "LocalDev!2026";

const UNIT_TYPES = ["Condominium", "TownHouse", "House", "Apartment"];
const SELL_TYPES = ["Rent", "Sale"];
// Unit.status: 0 Ongoing(공개), 1 Completed(공개), 2 Contracted(계약됨=숨김),
// 3 UnderNegotiation(공개), 4 Suspended(비활성화=숨김, app/api/sync-unit/route.ts:141)
const UNIT_STATUSES = [0, 1, 2, 3, 4];
const UNIT_COUNT = 30;

async function upsertUser({ email, name, level }) {
  const hashedPassword = await bcrypt.hash(LOCAL_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, level, status: -1 },
    create: {
      email,
      name,
      level,
      status: -1,
      password: hashedPassword,
      regdate: new Date(),
      lastUpdate: new Date(),
    },
  });
}

async function seedUsers() {
  const specs = [
    { email: "admin@example.invalid", name: "Local Admin", level: 0 },
    { email: "user@example.invalid", name: "Local User", level: 1 },
    { email: "agent@example.invalid", name: "Local Agent", level: 2 },
    { email: "broker@example.invalid", name: "Local Broker", level: 3 },
    { email: "owner@example.invalid", name: "Local Owner", level: 4 },
    { email: "tenant@example.invalid", name: "Local Tenant", level: 5 },
    { email: "presale-agent@example.invalid", name: "Local Presale Agent", level: 20 },
    { email: "presale-broker@example.invalid", name: "Local Presale Broker", level: 30 },
  ];

  const users = {};
  for (const spec of specs) {
    users[spec.email] = await upsertUser(spec);
  }
  return users;
}

async function clearPreviousSeed() {
  // FK 제약 때문에 자식(LeaseContract, 거기에 cascade로 걸린 CareServiceRequest)을
  // 먼저 지우고 Unit을 지운다. Schedule은 Unit에 대한 Prisma 관계가 없어 순서 제약이 없다.
  await prisma.leaseContract.deleteMany({
    where: { notes: { contains: SEED_MARKER } },
  });
  await prisma.schedule.deleteMany({
    where: { message: { contains: SEED_MARKER } },
  });
  await prisma.unit.deleteMany({
    where: { note: { contains: SEED_MARKER } },
  });
}

async function seedUnits(users) {
  const admin = users["admin@example.invalid"];
  const agent = users["agent@example.invalid"];
  const broker = users["broker@example.invalid"];

  const units = [];
  for (let i = 0; i < UNIT_COUNT; i++) {
    const status = UNIT_STATUSES[i % UNIT_STATUSES.length];
    const type = UNIT_TYPES[i % UNIT_TYPES.length];
    const sellType = SELL_TYPES[i % SELL_TYPES.length];
    // 2명 중 1명꼴로 에이전트 배정, 나머지는 관리자 직접 관리(agentId 없음)
    const agentId = i % 3 === 0 ? null : i % 2 === 0 ? agent.id : broker.id;

    const unit = await prisma.unit.create({
      data: {
        adminId: admin.id,
        agentId,
        title: `${SEED_MARKER} Local Sample Unit ${i + 1}`,
        type,
        sellType,
        address1: `LOCAL-${String(i + 1).padStart(3, "0")}`,
        address2: "Local City",
        address3: "Local District",
        address4: `Unit ${i + 1}`,
        addressSelf: "Local seed data",
        ownerName: `Local Owner ${i + 1}`,
        ownerMobile: "09000000000",
        area: 40 + (i % 60),
        floor: (i % 20) + 1,
        bed: (i % 4) + 1,
        bath: (i % 2) + 1,
        parking: i % 2,
        furniture: "unfurnished",
        interiored: "Contemporary",
        petPolicy: "none",
        amenity: ["Gym", "Pool"],
        yearCompletion: "2020",
        price: 20000 + i * 100,
        note: `${SEED_MARKER} seed unit`,
        images: [],
        status,
        lastUpdate: new Date(),
        regdate: new Date(),
      },
    });
    units.push(unit);
  }
  return units;
}

async function seedLeaseAndCare(users, units) {
  const owner = users["owner@example.invalid"];
  const tenant = users["tenant@example.invalid"];
  const admin = users["admin@example.invalid"];

  const contractedUnit = units.find((u) => u.status === 2) ?? units[0];

  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  const contract = await prisma.leaseContract.create({
    data: {
      unitId: contractedUnit.id,
      landlordId: owner.id,
      tenantId: tenant.id,
      startDate,
      endDate,
      monthlyRent: 25000,
      paymentType: "MONTHLY_TRANSFER",
      status: "ACTIVE",
      notes: `${SEED_MARKER} seed contract`,
      createdById: admin.id,
    },
  });

  const preferredDate = new Date();
  preferredDate.setDate(preferredDate.getDate() + 3);

  await prisma.careServiceRequest.create({
    data: {
      contractId: contract.id,
      serviceType: "AIRCON",
      preferredDate,
      status: "PENDING",
      description: `${SEED_MARKER} seed care request`,
    },
  });

  return contract;
}

async function seedSchedule(users, units) {
  const tenant = users["tenant@example.invalid"];
  const publicUnit = units.find((u) => u.status === 0) ?? units[0];

  const requestDate = new Date();
  requestDate.setDate(requestDate.getDate() + 2);

  await prisma.schedule.create({
    data: {
      unitId: publicUnit.id,
      status: 0,
      email: tenant.email,
      message: `${SEED_MARKER} seed tour request`,
      requestDate,
    },
  });
}

async function main() {
  if (!isAllowedLocalHost(process.env.DATABASE_URL)) {
    console.error(
      "[guard-local-db] 거부: DATABASE_URL 호스트가 로컬이 아닙니다. localhost, 127.0.0.1, host.docker.internal만 허용됩니다. 시드를 중단합니다."
    );
    process.exit(1);
  }

  const users = await seedUsers();
  await clearPreviousSeed();
  const units = await seedUnits(users);
  await seedLeaseAndCare(users, units);
  await seedSchedule(users, units);

  console.log(`시드 완료: 사용자 ${Object.keys(users).length}명, 매물 ${units.length}건, 투어 1건, 케어 1건, 계약 1건.`);
  console.log(`로컬 계정 비밀번호: ${LOCAL_PASSWORD} (문서: docs/local-dev.md)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
