"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";
import { accountSideBarOption } from "@/lib/config/account-options";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface SidebarProps {
  session: any;
}

export default function Sidebar({ session }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleNavigation = (link: string, isTab: boolean) => {
    if (isTab) {
      router.push(`${link}`);
    } else {
      router.push(link);
    }
  };
  const isActiveCheck = (isTab: boolean, link: string) => {
    if (isTab) {
      return pathname + "?" + searchParams === link;
    } else {
      return pathname.includes(link);
    }
  };
  return (
    <aside className="h-[calc(100vh-5rem)] w-64 bg-white shadow-sm border-r">
      <div className="flex flex-col h-full">
        {/* 유저 간단 프로필 */}
        <div className="flex justify-start w-full gap-2 py-6 px-4">
          <Avatar className="w-16 h-16 cursor-pointer">
            <AvatarImage src={session.user.image} />
            <AvatarFallback>
              <FaRegUser className="text-3xl" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold mt-2">
              {session?.user?.name || "Guest"}
            </h3>
            <p className="text-sm text-gray-500">유저 인증단계 설정</p>
          </div>
        </div>

        <div className="flex flex-col h-full justify-between py-4 ">
          <nav className="flex flex-col flex-1 ">
            {accountSideBarOption.map((option) => (
              <div key={option.name} className="py-2">
                <h3 className="text-lg font-bold mb-2">{option.name}</h3>
                {option.children.map((child) => {
                  const isActive = isActiveCheck(child.isTab, child.link)
                  return (
                    <button
                      key={child.name}
                      className={`text-left w-full text-gray-700 hover:text-black border-l-4 ${
                        isActive
                          ? "font-bold text-black border-blue-500"
                          : "border-transparent"
                      }`}
                      onClick={() => handleNavigation(child.link, child.isTab)}
                    >
                      {child.name}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <Button
            variant="outline"
            className="mt-6 w-full flex"
            onClick={() => signOut()}
          >
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
