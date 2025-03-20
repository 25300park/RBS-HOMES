import { LuSettings, LuBell, LuHome, LuHeart, LuLayoutDashboard, LuClipboard, LuUserCircle, LuCalendarCheck } from "react-icons/lu";

export const accountSideBarOption = [
  {
    name: "Dashboard",
    link: "/account/dashboard",
    description: "Check your account overview and status",
    icon: LuLayoutDashboard,
    children: [],
  },
  {
    name: "Schedule",
    link: "/account/schedule",
    description: "View and manage your appointments and reservations",
    icon: LuCalendarCheck,
    children: [],
  },
  {
    name: "Account Management",
    children: [
      {
        name: "Edit Information",
        description: "Enter your personal information and contact details",
        link: "/account/management?tabs=EditInformation",
        icon: LuUserCircle,
        isTab: true,
      },
    ],
  },
  {
    name: "Unit Management",
    children: [
      {
        name: "Registration",
        description: "Register and manage new properties",
        link: "/account/unit/registration/step-one",
        icon: LuHome,
        isTab: false,
      },
      {
        name: "My Unit List",
        description: "View and manage your registered properties",
        link: "/account/unit/my-list",
        icon: LuClipboard,
        isTab: false,
      },
      {
        name: "Favorite Unit List",
        description: "Check your saved favorite properties",
        link: "/account/unit/favorites",
        icon: LuHeart,
        isTab: false,
      },
    ],
  },
];

export const UserLevelOptions = [
  { label: "Tenant/Buyer", value: "1" },
  { label: "Agent", value: "2" },
  { label: "Broker", value: "3" },
  { label: "Owner", value: "4" },
];
