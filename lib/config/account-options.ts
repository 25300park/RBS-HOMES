export const accountSideBarOption = [
  {
    name: "Dashboard",
    link: "/account",
    children: [],
  },
  {
    name: "Account Management",
    children: [
      {
        name: "Edit Information",
        link: "/account/management?tabs=EditInformation",
        isTab: true,
      },
      {
        name: "Register as Professional Broker",
        link: "/account/management?tabs=RegisterBroker",
        isTab: true,
      },
    ],
  },
  {
    name: "Unit Management",
    children: [
      {
        name: "Registration",
        link: "/account/unit/registration/step-one",
        isTab: false,
      },
      {
        name: "My Unit List",
        link: "/account/unit/my-list",
        isTab: false,
      },
      {
        name: "Favorite Unit List",
        link: "/account/unit/favorites",
        isTab: false,
      },
    ],
  },
  {
    name: "상품판매등록/내 상품수정 / 즐찾상품리스트 등등 / 쪽지/ 공지사항 등등등 설정 기획필요/ 대시보드에서 자기 유닛 조회수, 프리미엄등록? 등등 기획필요",
    children: [],
  },
];
