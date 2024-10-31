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
];

export const UserLevelOptions = [
  { label: "Tenant/Buyer", value: "1" },
  { label: "Agent", value: "2" },
  { label: "Owner", value: "4" },
];
