# 브리프: B-20261111-02 비밀번호 재설정 흐름 수정

- ID: B-20261111-02
- 승인 등급: 3 (인증, 발송)
- 저장소: rbs-homes
- 브랜치: feat/B-20261111-02-password-reset
- 상태: 승인됨 (조사 후 계획 승인 대기)

## 1. 목표
비밀번호 재설정에서 사용자가 쓸 수 없는 비밀번호를 받는 일이 없게 한다.

## 2. 문제
- lib/action.ts의 resetPassword()가 prisma.$transaction 안에서 sendEmail()을 호출한다. 메일이 나간 뒤 트랜잭션이 되돌려지면 사용자는 저장되지 않은 비밀번호를 받는다.
- EMAIL_MODE가 off이면 sendEmail()이 성공(skipped)을 돌려준다. 비밀번호만 바뀌고 메일은 안 나간다.

## 3. 범위 안
- DB 변경(비밀번호 해시 갱신, 재설정 기록)은 트랜잭션 안에서, 메일 발송은 커밋 후에 한다.
- 메일 발송이 예외를 던지거나 skipped이면 비밀번호를 이전 해시로 되돌리고, 사용자에게 고정 문구의 오류를 돌려준다. (원본 에러 노출 금지, apiError 패턴)
- 모든 경로에서 로그에 비밀번호, 해시, 토큰, 전체 이메일을 남기지 않는다.
- 위 동작을 검증하는 vitest 테스트 추가 (prisma와 sendEmail은 모킹)

## 4. 범위 밖
- 재설정 방식 자체 변경(링크 토큰 등), 스키마 변경, admin 저장소, EMAIL_MODE 로직, 화면 변경, 비밀번호 정책

## 5. 사전 조사 (읽기 전용. 결과를 10번에 쓰고 멈춘다. 코드 수정 금지)
1. resetPassword()의 현재 흐름을 줄 번호와 함께 (순서, 새 비밀번호가 메일 본문에 들어가는지)
2. 이 함수의 모든 호출처와 호출자의 에러 처리
3. 재설정 기록 테이블(PasswordResetLog 등)에 무엇을 쓰는지. 비밀번호나 해시를 저장하면 값은 출력하지 말고 저장 사실만 보고한다.
4. 계정 존재 여부가 응답으로 드러나는지 (현재 동작 기록만)
5. 수정 계획 (되돌림 방식, 변경 파일 목록)

## 6. 수용 기준
- [ ] AC-1: 트랜잭션 콜백 안에 sendEmail 호출이 없다. (검색 결과와 테스트)
- [ ] AC-2: 성공 시 해시가 갱신되고 메일은 커밋 후 한 번 호출된다.
- [ ] AC-3: 메일 발송이 예외를 던지면 해시가 이전 값으로 복원되고, 사용자 응답은 고정 오류 문구다.
- [ ] AC-4: sendEmail이 skipped를 돌려주면 AC-3과 같이 처리한다.
- [ ] AC-5: 모든 경로에서 로그에 비밀번호, 해시, 토큰, 전체 이메일이 없다.
- [ ] AC-6: CI / verify 통과, 기존 테스트 통과

## 7. 테스트
- AC-2~5를 vitest로 검증한다. 운영 DB와 실제 메일 발송은 쓰지 않는다.
- 영향받는 핵심 흐름: 1번 (로그인)

## 8. 롤백
PR 되돌리기. 환경변수 변경 없음.

## 10. 완료 보고 (에이전트가 채움)

### 사전 조사 결과 (읽기 전용, 코드 수정 없음)

**1. resetPassword() 현재 흐름 (`lib/action.ts:25-83`)**

- `:26` 폼에서 `email` 추출.
- `:29` `prisma.$transaction` 시작, 전체 로직이 이 콜백 안에 있다.
  - `:30-32` `tx.user.findUnique({ where: { email } })`
  - `:34-39` 계정 없으면 `{ status: 404, message: "No account found with this email address." }` 반환 (트랜잭션 안에서 바로 return, DB 쓰기 없음).
  - `:41-42` `generateTemporaryPassword()`로 평문 임시 비밀번호 생성, `hash()`로 해시.
  - `:45-51` `tx.user.update()`로 비밀번호 해시와 `lastUpdate` 갱신. **이전 해시는 조회하지 않고 버림** — 지금 코드에는 롤백에 쓸 이전 값이 없다.
  - `:54-59` `tx.passwordResetLog.create()`로 `email`, `ip`만 기록.
  - `:62-66` **트랜잭션 콜백 안에서 `sendEmail()` 호출.** `getPasswordResetEmailTemplate(tempPassword)` (`lib/email.ts:67-94`)가 평문 임시 비밀번호를 HTML 본문에 그대로 넣는다 (`lib/email.ts:80`). 이 자체는 문제가 아니다 — 메일 발송이 트랜잭션 "안"에 있다는 게 문제다.
  - `:68-71` 성공 시 `{ status: 200, ... }` 반환.
- `:74` 트랜잭션 결과를 그대로 반환.
- `:75-82` catch에서 `console.error("Reset password error:", error)` 후 고정 문구 500 반환. 원본 에러는 서버 로그에만, 사용자에게는 노출 안 됨 — 이 부분은 이미 올바르다.

**문제 재확인**: Prisma의 `$transaction` 콜백 안에서 외부 네트워크 호출(Resend API)을 하면, Prisma는 이 콜백이 끝나야 커밋한다. 즉 지금 코드는 "메일 발송 성공 → 그 다음 커밋"이 아니라 "콜백 함수가 끝까지 실행돼야 커밋"이라서, 메일 발송 자체가 트랜잭션의 지속시간을 늘리고 커밋 전에 외부 I/O가 끝나길 기다리는 구조다. 메일 발송이 느리거나 실패하면 전체 트랜잭션(비밀번호 갱신 포함)이 롤백된다 — 이 경우는 오히려 안전(둘 다 안 됨)하다. **진짜 문제는 반대 방향**: Resend가 API 호출을 받아 발송을 성공시킨 뒤 함수가 성공을 반환했는데, 그 이후 같은 트랜잭션 안의 다른 이유(예: DB 커넥션 끊김, 커밋 자체 실패)로 트랜잭션이 롤백되면 — 비밀번호 DB 값은 이전 그대로인데 사용자는 이미 새 임시 비밀번호를 메일로 받은 상태가 된다. 이게 브리프 2번이 말하는 "저장 안 된 비밀번호를 받는" 경우다.

**2. 호출처 (`lib/action.ts:25` 전체 검색 결과)**

- 서버 액션 자체: `lib/action.ts:25` (정의)
- 유일한 호출처: `components/modals/auth-modal.tsx:9` import, `:41` `useFormState(..., resetPassword, ...)`의 액션으로 연결.
  - `:45-50` `state.message`를 그대로 toast로 띄움. `state.status === 200`이면 `default`, 아니면 `destructive` variant.
  - `:52-55` `status === 200`이고 `authMode === "reset"`이면 모달을 로그인 모드로 바꾸고 닫음. (reset 성공 시 로그인 자동 시도 안 함 — signIn 블록은 login/signup 전용.)
  - 에러 처리: 별도 try/catch 없음. `resetPassword()`가 던지는 예외가 없고(이미 내부에서 catch) 항상 `{status, message}` 객체를 반환하므로 클라이언트는 항상 `state.message`를 보여주기만 한다.
  - 다른 호출처는 없음 (grep 결과 brief 파일 2개 + 이 두 파일뿐).

**3. PasswordResetLog 테이블 (`prisma/schema.prisma:425-435`)**

- 컬럼: `id`, `email` (VarChar 300), `createdAt` (기본 now()), `ip` (VarChar 100, nullable).
- **비밀번호나 해시는 저장하지 않는다.** `:429` 줄 위에 `/// 변경 전 비밀번호`라는 주석이 있지만 실제로는 다음 컬럼(`createdAt`)에 대한 설명이 아니라 끼어든 stale 주석으로 보인다 — 어떤 컬럼도 비밀번호 값을 담지 않는다. 저장되는 값은 이메일, 생성시각, IP뿐. (값 자체는 출력하지 않음, 스키마 구조만 확인.)

**4. 계정 존재 여부 노출 (현재 동작 기록, 수정 범위 밖)**

- `lib/action.ts:34-39`에서 계정이 없으면 `"No account found with this email address."`를 **그대로** 반환한다.
- `auth-modal.tsx:46-50`이 이 메시지를 가감 없이 toast로 보여준다.
- 즉 현재 동작은 이메일 존재 여부를 응답 메시지로 그대로 드러낸다. 브리프 4번 범위 밖(재설정 방식 변경)에 해당하는 부분이라 이번 수정에서 그대로 둔다. (별도 브리프 대상으로 기록해 둘 만함.)

**5. 수정 계획**

- **되돌림 방식**: 트랜잭션 콜백 안에서는 `sendEmail()`을 호출하지 않는다. 트랜잭션은 (a) 이전 해시 조회·보관, (b) 새 해시로 `user.update`, (c) `passwordResetLog.create`까지만 하고 커밋한다. 커밋이 끝난 뒤 트랜잭션 밖에서 `sendEmail()`을 호출한다.
  - `sendEmail()`이 예외를 던지거나(`{success:true, skipped:true}` 포함, `lib/email.ts:33,46,54`에서 EMAIL_MODE가 off/미설정/알수없음/live인데 production 아님/redirect인데 대상 없음일 때 전부 `skipped:true`를 반환) 성공(`skipped` 없는 `{success:true}`)이 아니면, **별도의 단일 `prisma.user.update()`**로 비밀번호를 조회해 둔 이전 해시로 되돌린다. (이미 커밋된 트랜잭션을 되돌릴 수 없으므로 새 쓰기로 "보정"하는 방식 — 되돌림 자체도 실패할 수 있는 좁은 동시성 틈이 있으나, 이번 범위에서는 되돌림 쓰기 실패 시 서버 로그에 (마스킹된 이메일로) 남기고 고정 오류 문구를 반환하는 선까지만 한다. 완전한 2단계 커밋 보장은 범위 밖으로 둔다.)
  - `passwordResetLog` 행은 되돌리지 않고 그대로 둔다 — "재설정 시도가 있었다"는 사실 자체는 유효한 기록이라고 보고, 수용 기준에도 로그 삭제 요구가 없음.
  - 성공/실패 모두 사용자에게 보여줄 메시지는 지금처럼 고정 문구 두 종류(성공 200, 실패 500 "An error occurred while resetting your password. Please try again.")를 유지한다. `lib/api-response.ts`의 `apiError`는 `NextResponse`를 반환하는 라우트 전용 헬퍼라 서버 액션인 `resetPassword()`에는 그대로 쓸 수 없다 — 대신 **같은 패턴**(원본 에러는 `console.error`로 서버에만, 클라이언트에는 고정 문구만)을 유지한다.
  - 로그: 임시 비밀번호, 새/이전 해시, 토큰성 값은 어떤 경로에서도 `console.error`/`console.log`에 넣지 않는다. 이메일을 로그에 남길 필요가 있는 지점(예: 되돌림 실패)에는 `lib/email.ts`의 `maskEmail()`을 재사용한다 — 현재 `lib/email.ts`에서 `export` 안 되어 있어 **`export function maskEmail`로 가시성만 변경**(로직 변경 없음) 예정.
- **변경 파일 목록 (예상)**:
  1. `lib/action.ts` — `resetPassword()` 재구성 (트랜잭션 범위 축소, 커밋 후 발송, 실패 시 되돌림).
  2. `lib/email.ts` — `maskEmail` 함수를 `export`로 변경 (한 줄, 로직 불변).
  3. `lib/action.test.ts` (신규) — AC-2~5 검증. `@/lib/prisma`와 `@/lib/email`을 `vi.mock`으로 모킹. 패턴은 기존 `lib/email.test.ts`를 따른다.
  4. `vitest.config.ts` — **추가로 필요한 변경**: 현재 `resolve.alias` 설정이 없어 `@/*` import(`lib/action.ts`가 쓰는 `@/lib/prisma`, `@/lib/email`, `@/lib/auth`, `@/lib/utils`, `@/types/schema` 등)가 vitest에서 해석되지 않는다 (tsconfig의 `paths`는 TypeScript 타입체크에만 쓰이고 vitest/vite 번들링에는 적용되지 않음, 별도 플러그인 없음). `lib/action.ts`를 테스트에서 직접 import하려면 `vitest.config.ts`에 `resolve: { alias: { "@": path.resolve(__dirname, ".") } }`를 추가해야 한다. 이 변경이 없으면 AC-6(기존 테스트 포함 CI 통과)도 새 테스트 자체가 모듈 해석 오류로 실패한다.
- **AC-5(로그 무노출) 확인 방법**: 코드 리뷰(그렙으로 `console.` 호출 전부 확인) + 테스트에서 `console.error`/`console.log` spy를 걸어 호출 인자에 평문 비밀번호·해시·전체 이메일 문자열이 없는지 assert.

위 계획대로 코드를 수정해도 될지 확인 부탁합니다. 승인 전까지 `lib/action.ts`, `lib/email.ts`, `vitest.config.ts`, 테스트 파일 중 아무것도 바꾸지 않았습니다.

## 11. 승인 기록 (사람이 채움)
(작성 대기)
