import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";
import { signOut } from "next-auth/react";

const MENU_LIST = [
  { label: "Dashboard", link: "/account/dashboard" },
  { label: "Schedule", link: "/account/schedule" },
  { label: "Registration", link: "/account/unit/registration/step-one" },
  { label: "My unit", link: "/account/unit/my-list" },
  { label: "Favorite Unit", link: "/account/unit/favorites" },
];

export default function HeaderUserProfile({ session }: any) {
  return (
    <HoverCard openDelay={0.5}>
      <HoverCardTrigger className="cursor-pointer">
        <div className="flex bg-white items-center py-1  px-3 justify-between  border rounded-3xl gap-2">
          <img src="/assets/icons/alarm.png" alt="alarm" />
          <Avatar className="bg-white  flex items-center w-[34px]">
            <AvatarImage
              src={session.user.image}
              className="w-[34px] h-[34px] rounded-full"
            />
            <AvatarFallback className="w-[34px] h-[34px]">
              <FaRegUser className="text-lg " />
            </AvatarFallback>
          </Avatar>
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        align="end"
        className="w-[300px] bg-white shadow-lg rounded-lg p-4"
      >
        {/* 상단 프로필 이미지와 정보 */}
        <div className="flex items-center mb-4">
          <Avatar className="w-12 h-12 rounded-full mr-3">
            <AvatarImage
              src={session.user.image}
              alt="User profile"
              className="w-full h-full object-cover"
            />
            <AvatarFallback>
              <FaRegUser className="text-xl" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{session.user.name}</p>
            <p className="text-sm text-gray-500">{session.user.email}</p>
            <Link href="/account/management?tabs=EditInformation" className="text-sm text-blue-600">
              MY ACCOUNT
            </Link>
          </div>
        </div>

        {/* 기능 버튼 */}
        {/* <div className="flex items-center justify-between bg-gray-100 rounded-md p-3 mb-4">
          <div>
            <p className="text-xs text-gray-500">Registered</p>
            <p className="text-lg font-bold text-orange-500">00</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">function2</p>
            <p className="text-lg font-bold text-orange-500">btn</p>
          </div>
          <button className="bg-white border rounded-full p-2">+</button>
        </div> */}

        {/* 메뉴 항목 */}
        <hr className="my-4" />

        <ul className="space-y-3  text-sm text-gray-700 ">
          {MENU_LIST.map((menu) => (
            <li key={menu.label} className="hover:bg-gray-50 p-2 rounded">
              <Link href={menu.link}>{menu.label}</Link>
            </li>
          ))}
        </ul>

        <hr className="my-4" />

        {/* 로그아웃 버튼 */}
        <button
          className="w-full bg-gray-200 text-gray-700 rounded-md p-2 mt-4"
          onClick={() => signOut()}
        >
          Log-out
        </button>
      </HoverCardContent>
    </HoverCard>
  );
}
