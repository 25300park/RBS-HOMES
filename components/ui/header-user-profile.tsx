import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";
import Image from "next/image"; 

export default function HeaderUserProfile({ session }: any) {
  return (
    <HoverCard openDelay={0.5}>
      <HoverCardTrigger className="cursor-pointer">
        <div className="flex bg-white items-center py-1 w-[146px] justify-evenly shadow-lg rounded-[20px]">
          <img src="/assets/icons/alarm.png" alt="alarm" />
          {/* <img src="/assets/icons/alarm_on.png" alt="alarm"/> */}
          <Avatar className="bg-white  flex items-center">
            <AvatarImage
              src={session.user.image}
              className="w-[34px] h-[34px]"
            />
            <AvatarFallback className="w-[34px] h-[34px]">
              <FaRegUser className="text-lg " />
            </AvatarFallback>
          </Avatar>
        </div>
      </HoverCardTrigger>

      <HoverCardContent className="w-[300px] bg-white shadow-lg rounded-lg p-4">
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
            <Link href="/account" className="text-sm text-blue-600">
              MY ACCOUNT
            </Link>
          </div>
        </div>

        {/* 기능 버튼 */}
        <div className="flex items-center justify-between bg-gray-100 rounded-md p-3 mb-4">
          <div>
            <p className="text-xs text-gray-500">Registered</p>
            <p className="text-lg font-bold text-orange-500">00</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">function2</p>
            <p className="text-lg font-bold text-orange-500">btn</p>
          </div>
          <button className="bg-white border rounded-full p-2">
            +
          </button>
        </div>

        {/* 메뉴 항목 */}
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <Link href="#">Property Search</Link>
          </li>
          <li>
            <Link href="#">Buy & Sell</Link>
          </li>
          <li>
            <Link href="#">Rentals</Link>
          </li>
          <li>
            <Link href="#">New Construction</Link>
          </li>
        </ul>

        <hr className="my-4" />

        {/* 하단 기능 */}
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <Link href="#">function1</Link>
          </li>
          <li>
            <Link href="#">function2</Link>
          </li>
          <li>
            <Link href="#">function3</Link>
          </li>
        </ul>

        {/* 로그아웃 버튼 */}
        <button className="w-full bg-gray-200 text-gray-700 rounded-md p-2 mt-4">
          Log-out
        </button>
      </HoverCardContent>
    </HoverCard>
  );
}
