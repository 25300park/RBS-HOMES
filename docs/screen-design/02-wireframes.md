# 와이어프레임 — W9 핵심 5개 화면 (얕은 버전)

> **단계**: 2단계 — 블록 레이아웃 와이어프레임
> **작성일**: 2026-07-29
> **기준**: 실제 page.tsx + 컴포넌트 코드 직접 분석 (추측 없음)
> **용도**: Google AI Studio 프로토타이핑 참고 자료
> **다음 단계**: 3단계 화면설계서 (각 화면 상세 기능·인터랙션 명세)

---

## ► 핵심 진입 동선 (W9 개선 대상)

```
[랜딩 /]
  → (비로그인) 검색/카테고리 클릭 → /list 또는 /map
  → (로그인 버튼) → /auth/login → 인증 완료
      → /dashboard (라우터 페이지)
          → level 1  →  /dashboard/buyer
          → level 2  →  /dashboard/agent
          → level 3  →  /dashboard/agent
          → level 4  →  /dashboard/landlord
          → level 5  →  /dashboard/tenant
          → 기타     →  /dashboard/buyer (폴백)
```

> ⚠️ **W9 개선 핵심**: `/dashboard` 진입 시 level별 자동 리다이렉트 → 각 대시보드 도착.
> 4개 대시보드 간 진입 동선이 동일하지만 도착 후 UI 구조·테마가 제각각 (아래 비교표 참고).

---

## 1. / — 홈·랜딩

```
┌─────────────────────────────────────────────────────────┐
│ [HEADER]  로고 · 네비(List/Map/Sell) · 로그인 버튼      │
│           + PopupManager (팝업 오버레이)                 │
├─────────────────────────────────────────────────────────┤
│ [HERO SECTION — HeroSection.tsx]                        │
│  데스크톱:                                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🔍 검색바 (지역명 입력 · 리스트/지도 버튼)        │   │
│  │   ↳ 드롭다운: [Popular Cities 탭] [Recent 탭]    │   │
│  ├────────────────────────────────────┬─────────────┤   │
│  │ 카테고리 카드 3개 (7/10 col)       │ 홍보 배너   │   │
│  │  [Rent 🔥Hot] [Buy] [Pre-Sale 🆕] │ (3/10 col)  │   │
│  ├──────────────────┬─────────────────┤             │   │
│  │ View as List     │ View on Map 🗺️  │             │   │
│  └──────────────────┴─────────────────┴─────────────┘   │
│  모바일:                                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 로고              검색 아이콘                    │   │
│  ├──────────┬───────────────────────────────────────┤   │
│  │ Rent     │  Buy                                  │   │
│  │ (2행)    ├───────────────────────────────────────┤   │
│  │          │  Pre-Sale                             │   │
│  ├──────────┴───────────────────────────────────────┤   │
│  │ View as List  /  View on Map                     │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ [FEATURED PROPERTIES — FeaturedPropertiesSection.tsx]   │
│  지역별 섹션 반복 (BGC → Makati → Pasay → Recently)     │
│  각 섹션:                                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🏢 지역명 (h3)                    View All →    │   │
│  │ [ListCard] [ListCard] [ListCard] [ListCard] ···  │   │
│  │  4열 그리드 (lg:3열 / md:2열)                   │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ [YOUTUBE SECTION — YouTubeSection.tsx]                  │
│  유튜브 임베드 영역                                     │
├─────────────────────────────────────────────────────────┤
│ [FOOTER]  + [MobileFooterNav] (모바일 하단 고정)        │
│ [ChatWidget] (우하단 플로팅 챗봇 버튼)                  │
└─────────────────────────────────────────────────────────┘
```

**참고 파일**:
- [app/(route)/(dashboard)/page.tsx](app/(route)/(dashboard)/page.tsx)
- [app/(route)/(dashboard)/components/hero.tsx](app/(route)/(dashboard)/components/hero.tsx)
- [app/(route)/(dashboard)/components/featured-properties-section.tsx](app/(route)/(dashboard)/components/featured-properties-section.tsx)
- [app/(route)/(dashboard)/components/youtube-section.tsx](app/(route)/(dashboard)/components/youtube-section.tsx)
- [app/(route)/layout.tsx](app/(route)/layout.tsx) — Header, Footer, ChatWidget, PopupManager, MobileFooterNav

---

## 2. /dashboard/tenant — 세입자 대시보드

> 테마: 다크 (`bg-[#0F172A]` / `text-[#F8FAFC]`) · 모바일 최적화 (max-w-640px)

```
┌─────────────────────────────────────────────────────────┐
│ [HEADER 인라인]  "My Dashboard"   사용자명  [로그아웃]  │
├─────────────────────────────────────────────────────────┤
│ [임박 배너 — 조건부]                                    │
│ ⚠️ "Your lease is expiring soon." (60일 이내 시)       │
├─────────────────────────────────────────────────────────┤
│ [섹션 1] Lease Summary                                  │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 매물명 (truncate)              [상태 뱃지]       │   │
│ │ 주소                                              │   │
│ │ ─────────────────────────────────────────────    │   │
│ │ Lease Period (2열)   │  Monthly Rent             │   │
│ └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ [섹션 2] This Month's Payment                           │
│ → 상태별 카드 (PAID / AWAITING_APPROVAL / OVERDUE /     │
│   PENDING) — 색상·아이콘·버튼 분기                      │
│   PENDING/OVERDUE: [영수증 업로드 버튼 — ReceiptUploadButton] │
├─────────────────────────────────────────────────────────┤
│ [섹션 3] Payment History   [View All →]                 │
│ → /dashboard/tenant/payments 링크                       │
├─────────────────────────────────────────────────────────┤
│ [섹션 4] Care Service      [Request Care Service]       │
│ → 진행 중 케어 요청 목록 (최대 5건)                     │
│   상태 뱃지 + AWAITING_TENANT_CONFIRMATION 시           │
│   [완료 확인 버튼 — ConfirmCareCompletionButton]        │
│ → /dashboard/tenant/care 링크                           │
├─────────────────────────────────────────────────────────┤
│ [섹션 5] Community Board   [View All →]                 │
│ → 최근 공지 3건 요약                                    │
│ → /dashboard/tenant/community?condoId=xxx 링크          │
├─────────────────────────────────────────────────────────┤
│ [BOTTOM NAV — BottomNav.tsx] (모바일 fixed, md:hidden)  │
│  Home │ Payments │ Care │ Community │ Profile           │
└─────────────────────────────────────────────────────────┘
```

**빈 상태 (활성 임대 없음)**: Header + EmptyState 메시지 + BottomNav만 표시

**참고 파일**:
- [app/dashboard/tenant/page.tsx](app/dashboard/tenant/page.tsx)
- [app/dashboard/tenant/components/bottom-nav.tsx](app/dashboard/tenant/components/bottom-nav.tsx)
- [app/dashboard/tenant/components/receipt-upload-button.tsx](app/dashboard/tenant/components/receipt-upload-button.tsx)
- [app/dashboard/tenant/components/confirm-care-completion-button.tsx](app/dashboard/tenant/components/confirm-care-completion-button.tsx)
- [app/dashboard/tenant/components/logout-button.tsx](app/dashboard/tenant/components/logout-button.tsx)

---

## 3. /dashboard/landlord — 임대인 대시보드

> 테마: 라이트 (`bg-white` / `text-gray-800`) · 데스크톱 최적화 (max-w-1140px)

```
┌─────────────────────────────────────────────────────────┐
│ [(route)/layout.tsx의 Header — 글로벌 헤더]             │
├─────────────────────────────────────────────────────────┤
│ [인사말]  "Hello, {name}"  / "Check your units..."     │
├─────────────────────────────────────────────────────────┤
│ [만료 임박 배너 — 조건부]                               │
│ ⚠️ Lease Expiring Soon — N건 (매물명 + 만료일 목록)    │
├─────────────────────────────────────────────────────────┤
│ [섹션 1] This Month Payment Status  [View All →]        │
│ ┌──────────┬──────────────┬────────┬──────────────┐    │
│ │ Pending  │ Awaiting     │ Paid   │ Overdue      │    │
│ │   N건    │ Approval N건 │  N건   │    N건       │    │
│ └──────────┴──────────────┴────────┴──────────────┘    │
│  4열 요약 카드 그리드 (md:2열)                          │
├─────────────────────────────────────────────────────────┤
│ [섹션 2] Active Leases  [View All →]                    │
│ ┌──────────────────────────────────────────────────┐   │
│ │  Active Leases: N건 (단순 카운트 카드)           │   │
│ └──────────────────────────────────────────────────┘   │
│ → /dashboard/landlord/leases 링크                       │
├─────────────────────────────────────────────────────────┤
│ [섹션 3] Care Service Status  [View All →]              │
│ ┌──────────────────────────────────────────────────┐   │
│ │  Active Requests: N건 (단순 카운트 카드)         │   │
│ └──────────────────────────────────────────────────┘   │
│ → /dashboard/tenant/care 링크 (level 4 접속 시 landlord UI 렌더)   │
└─────────────────────────────────────────────────────────┘
```

> ℹ️ **참고**: `/dashboard/tenant/care`는 level 분기 공유 페이지.
> level 4(landlord) 접근 시 → 소유 매물 케어 목록 + ApproveCareButton 표시.
> tenant 접근 시 → 케어 요청 폼 표시. URL명은 misleading이나 기능상 정상.

**참고 파일**:
- [app/dashboard/landlord/page.tsx](app/dashboard/landlord/page.tsx)
- [lib/landlord/get-landlord-leases.ts](lib/landlord/get-landlord-leases.ts)

---

## 4. /dashboard/agent — 중개인 대시보드

> 테마: 다크 (`bg-[#0f172a]`) · 중간 폭 (max-w-3xl) · 데스크톱+모바일 혼용

```
┌─────────────────────────────────────────────────────────┐
│ [HEADER 인라인]  "Agent Dashboard"  사용자명  [로그아웃]│
├─────────────────────────────────────────────────────────┤
│ [섹션 1] 🔔 지금 할 일                                  │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Pending Tour Requests           N건 뱃지         │   │
│ │ ─────────────────────────────────────────        │   │
│ │ Today / Tomorrow (조건부)                        │   │
│ │   · 매물명 ·············· 날짜/시간              │   │
│ │   · 매물명 ·············· 날짜/시간              │   │
│ └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ [섹션 2] 🏢 My Listings                                 │
│ ┌──────────┬──────────┬──────────────┬───────────┐     │
│ │  Total   │ Ongoing  │  Contracted  │Negotiation│     │
│ │    N     │    N     │      N       │     N     │     │
│ └──────────┴──────────┴──────────────┴───────────┘     │
│  4열 요약 카드                                          │
│ ┌──────────────────────┬──────────────────────────┐    │
│ │ [View All Listings]  │ [+ Register New Listing] │    │
│ └──────────────────────┴──────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│ [섹션 3] 🔔 Tour Requests                               │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 대기 중인 투어 요청 N건          View All →      │   │
│ └──────────────────────────────────────────────────┘   │
│ → /dashboard/agent/tour-requests                        │
├─────────────────────────────────────────────────────────┤
│ [섹션 4] 📅 My Schedule                                 │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 다가오는 일정 N건                Schedule →      │   │
│ └──────────────────────────────────────────────────┘   │
│ → /account/schedule                                     │
└─────────────────────────────────────────────────────────┘
```

**참고 파일**:
- [app/dashboard/agent/page.tsx](app/dashboard/agent/page.tsx)
- [app/dashboard/agent/components/logout-button.tsx](app/dashboard/agent/components/logout-button.tsx)
- [app/api/pms/agent-dashboard/route.ts](app/api/pms/agent-dashboard/route.ts) (데이터 소스)

---

## 5. /dashboard/buyer — 구매자 대시보드

> 테마: 라이트 (`bg-white`) · 데스크톱 최적화 (max-w-1140px)
> level 1 사용자의 `/dashboard` 기본 목적지

```
┌─────────────────────────────────────────────────────────┐
│ [(route)/layout.tsx의 Header — 글로벌 헤더]             │
├─────────────────────────────────────────────────────────┤
│ [인사말]  "안녕하세요, {name}님"                        │
│           "나의 활동 현황을 확인하세요."                 │
├─────────────────────────────────────────────────────────┤
│ [섹션 1] ❤️ 즐겨찾기 매물  [전체 보기 →]               │
│ ┌──────────────────────────────────────────────────┐   │
│ │  즐겨찾기 N건 (단순 카운트 표시)                 │   │
│ └──────────────────────────────────────────────────┘   │
│ → /account/unit/favorites                               │
├─────────────────────────────────────────────────────────┤
│ [섹션 2] 📅 예약된 방문 일정  [View All →]              │
│ ┌──────────────────────────────────────────────────┐   │
│ │  예약된 방문 일정 N건 (단순 카운트 표시)         │   │
│ └──────────────────────────────────────────────────┘   │
│ → /account/schedule                                     │
├─────────────────────────────────────────────────────────┤
│ [섹션 3] 💬 내 문의 내역  [View All →]                  │
│ ┌──────────────────────────────────────────────────┐   │
│ │  문의 내역 N건 (단순 카운트 표시)                │   │
│ └──────────────────────────────────────────────────┘   │
│ → /dashboard/buyer/inquiries                            │
└─────────────────────────────────────────────────────────┘
```

**참고 파일**:
- [app/dashboard/buyer/page.tsx](app/dashboard/buyer/page.tsx)
- [app/dashboard/buyer/inquiries/page.tsx](app/dashboard/buyer/inquiries/page.tsx)

---

## 6. 4개 대시보드 레이아웃 비교표

> W9 개선 근거 자료 — "역할별 일관성 부족"의 구체적 증거

| 항목 | tenant | landlord | agent | buyer |
|---|---|---|---|---|
| **배경 테마** | 다크 `#0F172A` | 라이트 `white` | 다크 `#0f172a` | 라이트 `white` |
| **최대 너비** | 640px (모바일) | 1140px (데스크톱) | 768px (중간) | 1140px (데스크톱) |
| **글로벌 Header** | ❌ 없음 (인라인 자체 헤더) | ✅ (route layout) | ❌ 없음 (인라인 자체 헤더) | ✅ (route layout) |
| **로그아웃 버튼** | ✅ 헤더 우측 (LogoutButton) | ❌ 없음 | ✅ 헤더 우측 (LogoutButton) | ❌ 없음 |
| **ChatWidget** | ❌ 없음 | ✅ (route layout) | ❌ 없음 | ✅ (route layout) |
| **하단 네비** | ✅ BottomNav (모바일 fixed) | ❌ 없음 | ❌ 없음 | ❌ 없음 |
| **언급된 만료 배너** | ✅ (60일 이내 임박 경고) | ✅ (만료 임박 목록) | ❌ 없음 | ❌ 없음 |
| **섹션 카드 수** | 5개 섹션 | 3개 섹션 | 4개 섹션 | 3개 섹션 |
| **카드 상세도** | 높음 (상태별 UI 분기, 인터랙티브 버튼) | 낮음 (카운트만) | 중간 (목록+카운트) | 낮음 (카운트만) |
| **데이터 소스** | Prisma 직접 | 라이브러리 함수 | 내부 API fetch | Prisma 직접 |
| **인사말 표기** | 영문 "My Dashboard" | 영문 "Hello, {name}" | 영문 "Agent Dashboard" | 한국어 "안녕하세요, {name}님" |
| **언어 일관성** | 영문 UI | 영문 UI | 영·한국어 혼용 | 한국어 UI |

> **요약**: tenant(다크·모바일·자체헤더)와 landlord/buyer(라이트·데스크톱·글로벌헤더)가
> 완전히 다른 디자인 시스템으로 구현되어 있으며, agent는 테마는 tenant와 동일하나
> BottomNav가 없고 너비가 다름. W9에서 공통 레이아웃 컴포넌트 도입을 검토할 것.
