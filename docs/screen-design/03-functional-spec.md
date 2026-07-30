# 화면설계서 — W9 핵심 5화면 기능 명세

> **단계**: 3단계 — 기능 명세 (실제 동작 기준)
> **작성일**: 2026-07-30
> **기준**: page.tsx + API route + 라이브러리 함수 직접 분석 (추측 없음)
> **전 단계**: [02-wireframes.md](02-wireframes.md) — 레이아웃 구조
> **용도**: Google AI Studio 프로토타이핑 참고 자료

---

## ► 로그인 유도 → 대시보드 진입 사용자 여정

```
[랜딩 / 또는 임의 페이지]
        │
        ▼
[글로벌 헤더 우측] — session === null → <HeaderGuestProfile>
   · 프로필 아이콘 + 벨 아이콘 (hover card 트리거)
   · 호버 → HoverCard 팝업: "Welcome to RBS Homes"
        │
        ├─ [LOGIN 버튼] → openModal("login")
        │       → 로그인 모달 (next-auth credentials)
        │       → 인증 성공 → session 생성
        │
        └─ [SIGN UP 버튼] → openModal("signup")
                → 회원가입 모달 → 완료 → session 생성

[로그인 완료 후] — session !== null → <HeaderUserProfile>
   · 벨 아이콘 (알림) + 프로필 아바타 드롭다운
   · 드롭다운 메뉴: MY PROFILE / Account Home / Dashboard /
                    Schedule / Registration / My unit /
                    Favorite Unit / Log-out
        │
        ▼
[Dashboard 클릭] → window.location.href = "/dashboard"
        │  (⚠️ Next.js Link가 아닌 window.location 사용 — 강제 풀 리로드)
        ▼
[app/dashboard/page.tsx] — dashboardByLevel 맵으로 리다이렉트
   level 1 → /dashboard/buyer
   level 2 → /dashboard/agent
   level 3 → /dashboard/agent
   level 4 → /dashboard/landlord
   level 5 → /dashboard/tenant
   기타    → /dashboard/buyer (폴백)
```

**이슈**: Dashboard 클릭 시 `window.location.href` 사용으로 Next.js 클라이언트 라우팅이 아닌 풀 페이지 리로드 발생. SPA 전환 효과 없음.

---

## 1. / — 홈·랜딩

### 데이터 소스

| 데이터 | 소스 | 캐시 |
|---|---|---|
| Featured Properties | `getFeaturedProperties(4)` (서버 컴포넌트) | Next.js 기본 캐시 |
| 검색 히스토리 | `localStorage.getItem("searchHistory")` (클라이언트) | 브라우저 로컬 |
| 알림 | `getNotifications(1, 10)` — 로그인 시만, 30초마다 폴링 | 없음 (폴링) |
| 팝업 | PopupManager (DB 조회) | — |

`FeaturedPropertiesSection`에서 `isLoading`이 `false`로 하드코딩 → 로딩 스켈레톤 코드는 있으나 실제로는 항상 즉시 렌더.

### 섹션별 기능

**HeroSection (데스크톱)**

- 검색바
  - 입력 후 Enter / 리스트 아이콘 클릭 → `/list?search={검색어}`
  - 지도 아이콘 클릭 → `/map?search={검색어}`
  - 포커스 시 드롭다운 표시 (탭 2개)
    - Popular Cities 탭: BGC/Makati/Mandaluyong 등 8개 도시 이미지 카드 → 클릭 시 `/list?search={도시명}`
    - Recent Searches 탭: localStorage 히스토리 최대 5건 → 클릭 시 재검색
  - 검색 실행 시 검색어를 localStorage에 저장 (최대 5건 유지)
  - 외부 클릭 또는 스크롤 시 드롭다운 닫힘

- 카테고리 카드 3개 (7/10 col 영역)
  - Rent (🔥Hot) → `/map?activeTypes=rent`
  - Buy → `/map?activeTypes=sale`
  - Pre-Sale (🆕New) → `/map?activeTypes=preSale`

- 하단 퀵 링크 2개
  - View as List → `/list`
  - View on Map → `/map` (오렌지 그라디언트)

- 우측 홍보 배너 (3/10 col): "Find Your Dream Home" 정적 텍스트 + View All Properties 버튼 (링크 미연결 — `<button>` 태그로만 구현, 클릭 이벤트 없음 ⚠️)

**HeroSection (모바일)**

- 로고 + 검색 아이콘 (데스크톱 검색바 대신 MainSearchBar 컴포넌트)
- 카테고리 카드 3개: 그리드 레이아웃 (Rent 2행, Buy/Pre-Sale 각 1행)
  - 하드코딩 절대 URL (`https://rbs-homes.com/...`) 사용 ⚠️ (개발 환경에서도 운영 URL로 이동)

**FeaturedPropertiesSection**

- 지역 순서: BGC(bonifacio) → Makati → Pasay → Recently Listed
- 각 지역: 최대 6개 ListCard (4열 그리드 → lg:3열 → md:2열)
- 각 ListCard: 이미지, 제목, 가격, 면적, 침실/욕실, 등록일, 즐겨찾기 버튼
- "View All →" 버튼 → `/map` (지역별 필터 없이 전체 지도로 이동)

**YouTubeSection**

- 정적 유튜브 임베드 (별도 데이터 요청 없음)

**ChatWidget**

- 우하단 플로팅 버튼 → 클릭 시 채팅 UI 토글
- 내부적으로 `/api/chatbot/...` 호출 (세션 무관, 비로그인도 사용 가능)

### 역할 분기 로직

없음. 세션 여부에 따라 글로벌 Header의 우측 컴포넌트만 달라짐 (`HeaderGuestProfile` vs `HeaderUserProfile`).

### 알려진 이슈/제약

- 모바일 HeroSection: `href`가 하드코딩 절대 URL (`https://rbs-homes.com/...`) → localhost 개발 환경에서 운영 서버로 이동
- 홍보 배너 "View All Properties" 버튼: `<button>` 태그이나 onClick 없음 (dead button)
- `getFeaturedProperties(4)` 인자(4)가 실제 쿼리에서 어떻게 쓰이는지는 함수 구현에서 확인 필요 (`lib/units/get-featured.ts`)
- 알림 폴링 30초: 탭이 백그라운드여도 계속 동작 (visibility API 미적용)

**참고 파일**:
- [app/(route)/(dashboard)/page.tsx](app/(route)/(dashboard)/page.tsx)
- [app/(route)/(dashboard)/components/hero.tsx](app/(route)/(dashboard)/components/hero.tsx)
- [app/(route)/(dashboard)/components/featured-properties-section.tsx](app/(route)/(dashboard)/components/featured-properties-section.tsx)
- [app/(route)/layout.tsx](app/(route)/layout.tsx)
- [components/header.tsx](components/header.tsx)
- [components/ui/header-guest-profile.tsx](components/ui/header-guest-profile.tsx)
- [components/ui/header-user-profile.tsx](components/ui/header-user-profile.tsx)

---

## 2. /dashboard/tenant — 세입자 대시보드

### 데이터 소스

모든 데이터를 서버 컴포넌트에서 Prisma 직접 호출 (`force-dynamic`, 캐시 없음).

| 데이터 | 쿼리 | 조건 |
|---|---|---|
| 활성 임대 계약 | `leaseContract.findFirst` | `tenantId=userId`, status IN [ACTIVE, EXPIRING_SOON], 최신순 |
| 이번 달 결제 일정 | `paymentSchedule.findMany` | `contractId=leaseId`, 이번 달 시작~끝 |
| 진행 중 케어 요청 | `careServiceRequest.findMany` | `contractId=leaseId`, 완료·취소 제외 상태, 최대 5건 |
| 커뮤니티 게시글 | `communityPost.findMany` | `condoId`, 공지 우선 정렬, 최대 3건 |

### 진입 시 분기

```
activeLease 없음
  → 빈 상태 화면 (Header + EmptyState 메시지 + BottomNav)
  → "You don't have an active lease yet. Please contact us."

activeLease 있음
  → 5개 섹션 + BottomNav 렌더
```

### 섹션별 기능

**[조건부] 임박 배너**
- `endDate <= 지금 + 60일`이면 표시 (노란 경고 박스)
- 클릭 이벤트 없음 (정보 표시만)

**섹션 1: Lease Summary**
- 표시: 매물명, 주소, 임대 상태 뱃지, 임대 기간, 월 임차료
- 상태 뱃지: ACTIVE(녹색) / EXPIRING_SOON(노란색) / EXPIRED(빨간색) / TERMINATED(빨간색)
- 인터랙션: 없음 (정보 표시 전용)

**섹션 2: This Month's Payment**
- 이달 결제 스케줄이 없으면: "No payment scheduled for this month." EmptyState
- 있으면 상태별 UI 분기:

| 상태 | 색상 | 아이콘 | 버튼 |
|---|---|---|---|
| PAID | 녹색 | CheckCircle2 | 없음 |
| AWAITING_APPROVAL | 파란색 | Clock | 없음 |
| OVERDUE | 빨간색 | XCircle | [영수증 업로드] ReceiptUploadButton |
| PENDING | 노란색 | — | [영수증 업로드] ReceiptUploadButton |

**섹션 3: Payment History**
- 카운트·미리보기 없이 "View your full payment history." 텍스트만 표시
- [View All →] → `/dashboard/tenant/payments`

**섹션 4: Care Service**
- 진행 중 요청 목록 (최대 5건): 서비스 타입, 희망일, 상태 뱃지
- 상태: PENDING / PENDING_OWNER_APPROVAL / SCHEDULED / IN_PROGRESS / AWAITING_TENANT_CONFIRMATION (pulse 애니메이션)
- AWAITING_TENANT_CONFIRMATION 상태일 때만 [완료 확인] ConfirmCareCompletionButton 표시 → 클릭 시 케어 요청 상태 업데이트
- [Request Care Service] → `/dashboard/tenant/care`

**섹션 5: Community Board**
- condoId 없으면: 게시글 0건으로 처리 (빈 상태 텍스트 "No posts yet.")
- condoId 있으면: 게시글 수 표시 (개별 내용 미노출)
- [View All →] → `/dashboard/tenant/community?condoId={condoId}` (condoId 없으면 `#community` 앵커)

**BottomNav (모바일 전용, md:hidden, fixed bottom)**
- Home / Payments / Care / Community / Profile 5탭
- 현재 경로와 매칭되는 탭 하이라이트

### 역할 분기 로직

이 경로(`/dashboard/tenant`) 자체는 level 분기 없음 (세션 유무만 체크).  
Care 전용 페이지(`/dashboard/tenant/care`)는 level 4 진입 시 landlord UI로 분기 (→ 3번 landlord 섹션 참고).

### 알려진 이슈/제약

- Payment History 섹션: 카운트나 최근 내역 미리보기 없음, 링크 유도만
- Community Board 섹션: 게시글 제목이 아닌 건수만 표시
- BottomNav: `md:hidden`이므로 태블릿 이상에서는 하단 탭 없음 → 사이드 네비게이션도 없어 세션에서 이탈 방법이 Header 뒤로가기뿐 (이 페이지에는 글로벌 Header 없음)

**참고 파일**:
- [app/dashboard/tenant/page.tsx](app/dashboard/tenant/page.tsx)
- [app/dashboard/tenant/components/bottom-nav.tsx](app/dashboard/tenant/components/bottom-nav.tsx)
- [app/dashboard/tenant/components/receipt-upload-button.tsx](app/dashboard/tenant/components/receipt-upload-button.tsx)
- [app/dashboard/tenant/components/confirm-care-completion-button.tsx](app/dashboard/tenant/components/confirm-care-completion-button.tsx)

---

## 3. /dashboard/landlord — 임대인 대시보드

### 데이터 소스

서버 컴포넌트에서 `getLandlordLeaseData(userId)` 호출 (`force-dynamic`).

```
getLandlordLeaseData(landlordId):
  leaseContract.findMany
    where: landlordId=me, status IN [ACTIVE, EXPIRING_SOON]
    include:
      unit (id, title, fullAddress)
      tenant (id, name, phone)
      paymentSchedules (이번 달 첫 번째 스케줄 1건)
      careRequests (완료·취소 제외 활성 상태, 계약당 최대 3건)
    orderBy: endDate asc

파생 데이터:
  expiringLeases = leases.filter(endDate <= 지금 + 60일)
  allCareRequests = 모든 계약의 careRequests 평탄화 (unit 정보 포함)
  paymentSummary = 계약별 이달 첫 결제 상태 카운트 집계
```

### 섹션별 기능

**[조건부] 만료 임박 배너**
- `expiringLeases.length > 0`이면 표시
- 만료 임박 계약 목록: 매물명 + 만료일 나열
- 인터랙션 없음 (정보 표시만)

**섹션 1: This Month Payment Status**
- PENDING / AWAITING_APPROVAL / PAID / OVERDUE 4가지 상태 카운트 카드 (4열 그리드, md:2열)
- 카운트는 `paymentSummary[status] ?? 0`
- [View All →] → `/dashboard/landlord/payments`
- ⚠️ 카드 클릭 시 이동 없음 (정보 표시만)

**섹션 2: Active Leases**
- 활성 계약 수(건) 단순 카운트 카드
- [View All →] → `/dashboard/landlord/leases`
- ⚠️ 카드에 세입자 명이나 매물명 미표시

**섹션 3: Care Service Status**
- 활성 케어 요청 수(건) 단순 카운트 카드
- [View All →] → `/dashboard/tenant/care` (level 4 진입 시 landlord UI 렌더, 정상 동작)

### 역할 분기 로직

없음. 이 페이지는 세션 유무만 체크. `/dashboard/tenant/care` 공유 페이지가 level 4를 감지해 landlord 케어 목록 표시.

### 알려진 이슈/제약

- 모든 섹션이 카운트 숫자만 표시 — 개별 항목 미리보기 없음
- 세입자 정보(이름/연락처)를 쿼리에서 가져오지만 대시보드에서 미사용 (leases 목록 페이지에서 활용)
- 로그아웃 버튼 없음 (글로벌 Header의 프로필 드롭다운으로만 가능)
- 빈 상태 처리 없음 — 임대 계약이 없으면 카운트 0과 배너 미표시뿐

**참고 파일**:
- [app/dashboard/landlord/page.tsx](app/dashboard/landlord/page.tsx)
- [lib/landlord/get-landlord-leases.ts](lib/landlord/get-landlord-leases.ts)
- [lib/landlord/get-landlord-care-requests.ts](lib/landlord/get-landlord-care-requests.ts)
- [app/dashboard/tenant/care/page.tsx](app/dashboard/tenant/care/page.tsx) — 공유 케어 페이지

---

## 4. /dashboard/agent — 중개인 대시보드

### 데이터 소스

서버 컴포넌트에서 **내부 API를 fetch**로 호출 (`cache: "no-store"`).  
(Prisma 직접 호출이 아닌 API 계층 경유 — 쿠키를 수동으로 forward)

```
GET /api/pms/agent-dashboard
  인증: level 2 또는 3만 허용 (403 otherwise)
  반환:
    units: 본인 agentId의 모든 매물 (status, price 등)
    schedules: 오늘 이후 AgentSchedule 최대 10건
    tourRequests: 취소(3) 제외 Schedule 최대 20건
    todoSummary:
      pendingTourCount: status=0인 투어 요청 수
      upcomingSchedules: 오늘~내일 AgentSchedule
```

### 섹션별 기능

**섹션 1: 지금 할 일**
- Pending Tour Requests: `pendingTourCount` 숫자 뱃지 (> 0 이면 amber 강조)
- 오늘·내일 AgentSchedule: 매물명 + 날짜/시간 목록 (있을 때만 표시)
- 빈 상태: "처리할 항목이 없습니다."
- 인터랙션: 없음 (클릭 이동 없음)

**섹션 2: My Listings**
- 4열 요약 카드: Total / Ongoing(status=0) / Contracted(status=2) / Negotiation(status=3)
- 개별 카드 클릭 이동 없음 (카운트 표시만)
- 버튼 2개:
  - [View All Listings] → `/account/unit/my-list`
  - [+ Register New Listing] → `/account/unit/registration/step-one`

**섹션 3: Tour Requests**
- `pendingTourCount` 텍스트 표시
- [View All →] → `/dashboard/agent/tour-requests`

**섹션 4: My Schedule**
- `upcomingSchedules.length` 텍스트 표시
- [Schedule 바로가기 →] → `/account/schedule`

### 역할 분기 로직

API(`/api/pms/agent-dashboard`)에서 level 2/3 이외 접근 시 403 반환 → 페이지에서 `data?.units ?? []` 폴백으로 빈 배열 처리 (에러 UI 없음 — 조용히 빈 데이터 표시).

### 알려진 이슈/제약

- API 403(level 불일치) 시 사용자에게 에러 메시지 없음 — 빈 대시보드처럼 보임
- 섹션 1 "지금 할 일" 항목들은 클릭 이동 없음 (pendingTourCount를 눌러도 tour-requests로 이동 안 됨)
- 4열 요약 카드도 클릭 이동 없음
- BottomNav 없음 (tenant와 같은 다크 테마이나 하단 탭 미구현)

**참고 파일**:
- [app/dashboard/agent/page.tsx](app/dashboard/agent/page.tsx)
- [app/api/pms/agent-dashboard/route.ts](app/api/pms/agent-dashboard/route.ts)
- [app/dashboard/agent/tour-requests/page.tsx](app/dashboard/agent/tour-requests/page.tsx)

---

## 5. /dashboard/buyer — 구매자 대시보드

### 데이터 소스

서버 컴포넌트에서 Prisma 직접 3개 병렬 쿼리 (`Promise.all`, `force-dynamic`).

| 데이터 | 쿼리 | 반환 |
|---|---|---|
| 즐겨찾기 | `favorite.findMany({ where: { userId } })` | 전체 목록 (페이지네이션 없음) |
| 방문 일정 수 | `schedule.count({ where: { userId, status: 2, date: { not: null } } })` | 확정(status=2) 일정 수 |
| 문의 내역 | `contact.findMany({ where: { userId } })` | 전체 목록 |

### 섹션별 기능

**섹션 1: 즐겨찾기 매물**
- `favorites.length` 건수만 표시
- 매물 카드 미리보기 없음
- [전체 보기 →] → `/account/unit/favorites`

**섹션 2: 예약된 방문 일정**
- `scheduleCount` 건수만 표시 (status=2 확정 일정만 카운트)
- [View All →] → `/account/schedule`

**섹션 3: 내 문의 내역**
- `contacts.length` 건수만 표시
- [View All →] → `/dashboard/buyer/inquiries`

### 하위 페이지: /dashboard/buyer/inquiries

`getBuyerInquiries(userId)` → `contact.findMany({ where: { userId } })`, 최신순 전체

각 문의 항목:
- 문의 내용(message), 등록일
- 상태 뱃지: 0=접수(회색) / 1=처리 중(주황) / 2=완료(녹색)
- 답변 있을 경우: 회색 박스로 답변 내용 + 답변일 표시

빈 상태: "문의 내역이 없습니다." (점선 박스)

### 역할 분기 로직

없음. level 무관, 세션 유무만 체크 (level 1의 기본 대시보드 목적지이기도 함).

### 알려진 이슈/제약

- 메인 대시보드 3개 섹션 전부 카운트 표시만 — 가장 정보량이 적은 대시보드
- 즐겨찾기·문의: 전체 목록을 쿼리하지만 대시보드에서 카운트만 사용 (불필요한 데이터 fetch)
- 빈 상태 처리 없음 (카운트 0만 표시)
- 언어 혼용: 인사말 한국어, 섹션 제목 한국어, View All 버튼 영어 혼재

**참고 파일**:
- [app/dashboard/buyer/page.tsx](app/dashboard/buyer/page.tsx)
- [app/dashboard/buyer/inquiries/page.tsx](app/dashboard/buyer/inquiries/page.tsx)
- [lib/buyer/get-buyer-inquiries.ts](lib/buyer/get-buyer-inquiries.ts)

---

## 6. 빈 상태(Empty State) 처리 비교

| 항목 | tenant | landlord | agent | buyer |
|---|---|---|---|---|
| **진입 시 빈 상태** | ✅ 전체 화면 EmptyState "No active lease" | ❌ 없음 (카운트 0 표시) | ❌ 없음 (API 403도 조용히 빈 화면) | ❌ 없음 (카운트 0 표시) |
| **섹션별 빈 상태** | ✅ 각 섹션별 점선 EmptyState 박스 | ❌ 없음 | 부분적 ("처리할 항목 없음" — 섹션 1만) | ❌ 없음 |
| **빈 상태 메시지 언어** | 영어 | — | 한국어 | — |
| **빈 상태 UX 품질** | 높음 (섹션별 개별 안내) | 낮음 | 중간 | 낮음 |
| **데이터 없을 때 CTA** | "Please contact us" 텍스트 | 없음 | 없음 | 없음 |

> **요약**: tenant만 빈 상태를 체계적으로 처리. 나머지 3개는 카운트 0 또는 빈 목록으로 처리하며
> 사용자에게 다음 행동을 안내하지 않음. W9 개선 시 통일된 EmptyState 컴포넌트 도입 권장.
