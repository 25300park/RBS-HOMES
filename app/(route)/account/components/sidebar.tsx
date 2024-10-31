"use client";

import { signOut, useSession } from "next-auth/react";
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";
import { accountSideBarOption } from "@/lib/config/account-options";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { UserLevelOptions } from "@/lib/config/account-options";
import { LuSettings, LuBell, LuHome, LuHeart, LuLayoutDashboard, LuClipboard } from "react-icons/lu";

interface SidebarProps {}

const getIconForName = (name: string) => {
  switch (name) {
    case "Dashboard":
      return <LuLayoutDashboard className="w-5 h-5" />;
    case "Edit Information":
      return <LuSettings className="w-5 h-5" />;
    case "Registration":
      return <LuHome className="w-5 h-5" />;
    case "My Unit List":
      return <LuClipboard className="w-5 h-5" />;
    case "Favorite Unit List":
      return <LuHeart className="w-5 h-5" />;
    default:
      return <LuSettings className="w-5 h-5" />;
  }
};

export default function Sidebar({}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

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
      if (link === "/account/unit/registration/step-one") {
        return pathname.startsWith("/account/unit/registration");
      }
      return pathname.includes(link);
    }
  };

  return (
    <div className="h-full flex flex-col border-r min-h-[calc(100dvh-80px)]">
      {/* Header */}
      {/* <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-medium">Profile</h2>
        <button className="p-2">
          <LuBell className="w-6 h-6" />
        </button>
      </div> */}

      {/* Profile Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14">
            <AvatarImage src={session?.user.image || ""} />
            <AvatarFallback>
              <FaRegUser className="text-2xl" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-medium">{session?.user?.name || "Guest"}</h3>
            <p className="text-sm text-gray-500">{UserLevelOptions.find(e => e.value == String(session?.user?.level))?.label || "Guest"}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        {accountSideBarOption.map((option) => {
          if (option.children.length === 0 && option.link) {
            const isActive = pathname === option.link;
            return (
              <div key={option.name} className="p-6 border-b">
                <button
                  onClick={() => handleNavigation(option.link, false)}
                  className={`w-full flex items-center gap-3 py-2 hover:bg-gray-100 rounded-lg transition-colors ${
                    isActive ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getIconForName(option.name)}
                  </div>
                  <span className="font-medium">{option.name}</span>
                </button>
              </div>
            );
          }

          return (
            <div key={option.name} className="p-6 border-b">
              <h3 className="text-lg font-medium mb-4">{option.name}</h3>
              <div className="space-y-4">
                {option.children.map((child) => {
                  const isActive = isActiveCheck(child.isTab, child.link);
                  return (
                    <button
                      key={child.name}
                      onClick={() => handleNavigation(child.link, child.isTab)}
                      className={`w-full flex items-center gap-3 py-2 hover:bg-gray-100 rounded-lg transition-colors ${
                        isActive ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getIconForName(child.name)}
                      </div>
                      <span>{child.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-6">
        <button 
          onClick={() => signOut()}
          className="w-full py-3 text-center hover:bg-gray-100 rounded-lg transition-colors border"
        >
          Logout
        </button>
      </div>
    </div>
  );
}