/**
 * lib/auth.ts의 signIn 콜백(Google 로그인 시 이메일 기준 유저 조회/생성) 로직을
 * 브라우저 OAuth 없이 DB 레벨에서 검증하는 임시 스크립트.
 *
 * 실행: npx tsx scripts/test-google-signin-logic.ts
 *
 * 확인 항목:
 *   1) 최초 호출 시 유저가 생성되고, id가 숫자(auto-increment)인지
 *   2) 동일 이메일로 재호출 시 새 레코드가 생기지 않고 기존 id를 재사용하는지
 *   3) 종료 시 테스트 유저 정리
 */
import prisma from "../lib/prisma";

const TEST_EMAIL = "test-google-user@example.com";

// lib/auth.ts의 signIn 콜백과 동일한 핵심 로직 재현
async function simulateGoogleSignIn(fakeGoogleUser: {
  email: string;
  name: string | null;
  image: string | null;
}) {
  let dbUser = await prisma.user.findUnique({
    where: { email: fakeGoogleUser.email },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: fakeGoogleUser.email,
        name: fakeGoogleUser.name,
        image: fakeGoogleUser.image,
        level: 1,
      },
    });
  }

  return dbUser;
}

async function main() {
  console.log("=== signIn 콜백 로직 검증 시작 ===");
  console.log(`테스트 이메일: ${TEST_EMAIL}\n`);

  // 사전 정리 (이전 실행 잔여물 제거)
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });

  // 1차 호출: 신규 생성 기대
  const first = await simulateGoogleSignIn({
    email: TEST_EMAIL,
    name: "Test Google User",
    image: null,
  });

  console.log("[1차 호출 결과]");
  console.log("  id:", first.id, "| typeof:", typeof first.id);
  console.log("  Number.isInteger(id):", Number.isInteger(first.id));
  console.log("  level:", first.level);
  console.log("  password:", first.password, "(null이면 정상 — 소셜 로그인 유저)");

  // 2차 호출: 같은 이메일 → 기존 레코드 재사용 기대
  const second = await simulateGoogleSignIn({
    email: TEST_EMAIL,
    name: "Test Google User",
    image: null,
  });

  console.log("\n[2차 호출 결과]");
  console.log("  id:", second.id);

  const sameId = first.id === second.id;
  const totalCount = await prisma.user.count({ where: { email: TEST_EMAIL } });

  console.log("\n=== 검증 결과 ===");
  console.log(
    `[${typeof first.id === "number" && Number.isInteger(first.id) ? "PASS" : "FAIL"}] id가 정수(number)인가`
  );
  console.log(`[${sameId ? "PASS" : "FAIL"}] 1차/2차 호출의 id가 동일한가 (자동 연결)`);
  console.log(`[${totalCount === 1 ? "PASS" : "FAIL"}] 같은 이메일로 레코드가 1개만 존재하는가`);

  // 테스트 유저 정리
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  console.log("\n테스트 유저 삭제 완료 (email:", TEST_EMAIL, ")");
}

main()
  .catch((e) => {
    console.error("검증 스크립트 실행 중 오류:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
