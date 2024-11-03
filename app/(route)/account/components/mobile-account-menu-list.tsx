"use client";

import { useSession } from "next-auth/react";
import { accountSideBarOption } from "@/lib/config/account-options";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import LogoutButton from "@/components/ui/logout-btn";

export default function MobileAccountMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  // 화면 전환 핸들러
  const handleNavigation = (link: string) => {
    setIsAnimating(true);
    setTimeout(() => {
      router.push(link);
      window.scrollTo(0, 0); // 페이지 이동 후 스크롤 위치 초기화
    }, 300);
  };

  return (
    <div
      className={`flex flex-col min-h-[calc(100dvh-80px)] py-6 px-4 transition-transform duration-300 transform ${
        isAnimating ? "-translate-x-full" : "translate-x-0"
      }`}
    >
      {/* 프로필 섹션 */}
      <div className="p-4 flex flex-col items-center text-center">
        <Avatar className="w-20 h-20 mb-3">
          <AvatarImage src={session?.user?.image || ""} />
          <AvatarFallback>
            <FaRegUser className="text-2xl" />
          </AvatarFallback>
        </Avatar>
        <h2 className="font-medium">{session?.user?.name}</h2>
        <p className="text-sm text-gray-500">{session?.user?.email}</p>
      </div>

      {/* 배너 섹션 */}
      <div
        className="bg-white my-4 cursor-pointer"
        onClick={() => handleNavigation("/account/unit/registration/step-one")}
      >
        <div className="rounded-xl border px-4 py-6 flex items-center justify-between gap-4 shadow-lg flex-col">
          <img src="/assets/images/house-img.png" alt="House" />
          <div className="text-xs w-full">
            <h3 className="font-medium text-sm">
              List Your Property with Ease
            </h3>
            <p className="text-orange-500 text-sm">
              Connect with eager buyers today
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Register your listings and reach more clients effortlessly
            </p>
          </div>
        </div>
      </div>

      {/* 설정 메뉴 */}
      <div className="p-2 pb-16">
        <h3 className="text-lg font-semibold mb-4">Settings</h3>
        <div className="space-y-2">
          {accountSideBarOption.map((option) => (
            <div key={option.name}>
              {option.children.length === 0 && option.link ? (
                <button
                  onClick={() => handleNavigation(option.link)}
                  className="w-full flex items-center justify-between py-4 border-b "
                >
                  <div className="flex items-center gap-3">
                    <option.icon className="w-6 h-6 text-gray-500" />
                    <span>{option.name}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ) : (
                <>
                  {option.children.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.link)}
                      className="w-full flex items-center justify-between py-4 border-b "
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-6 h-6 text-gray-500" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mx-auto w-fit h-32 mt-10">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
