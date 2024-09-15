export const accountSideBarOption = [
  {
    name: "Account Management",
    children: [
      {
        name: "Edit Information", // 탭 이름
        link: "/account/management?tabs=EditInformation", // 탭 링크
        isTab: true, // 탭으로 작동하도록 설정
      },
      {
        name: "Register as Professional Broker", // 탭 이름
        link: "/account/management?tabs=RegisterBroker", // 탭 링크
        isTab: true, // 탭으로 작동하도록 설정
      },
    ],
  },
  {
    name: "상품판매등록/내 상품수정 / 즐찾상품리스트 등등 / 쪽지/ 공지사항 등등등 설정 기획필요",
    children: [],
  },
];
