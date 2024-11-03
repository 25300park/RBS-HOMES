"use client";

import { signOut, useSession } from "next-auth/react";
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";
import { accountSideBarOption } from "@/lib/config/account-options";
import { useRouter } from "next/navigation";
import { UserLevelOptions } from "@/lib/config/account-options";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LuLogOut } from "react-icons/lu";
import MenuCard from "./menu-card";
import MobileAccountMenuList from "./mobile-account-menu-list";

interface AccountMenuListProps {}

export default function AccountMenuList({}: AccountMenuListProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");


  //모바일
  if (isMobile) {
    return <MobileAccountMenuList />;
  }

  const handleNavigation = (link: string) => {
    router.push(link);
  };

  const renderSection = (title: string, items: any[]) => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-1 xl:grid-cols-2">
        {items.map((item) => (
          <MenuCard
            key={item.name}
            icon={item.icon}
            name={item.name}
            description={item.description}
            onClick={() => handleNavigation(item.link)}
          />
        ))}
      </div>
    </div>
  );

  // 옵션들을 섹션별로 분류
  const dashboardItems = accountSideBarOption.filter(
    (item) => item.children.length === 0
  );
  const accountItems = accountSideBarOption.find(
    (item) => item.name === "Account Management"
  )?.children || [];
  const unitItems = accountSideBarOption.find(
    (item) => item.name === "Unit Management"
  )?.children || [];

  return (
    <div className="h-full flex flex-col max-w-[1920px] mx-auto">
      <div className="p-6 ">
        <h1 className="text-2xl font-bold mb-2">Account Setting</h1>
        <div className="flex items-center gap-4 mt-10">
          <Avatar className="w-14 h-14">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>
              <FaRegUser className="text-2xl" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-medium">
              {session?.user?.email || "Guest"}
            </h3>
            <p className="text-sm text-gray-500">
              {UserLevelOptions.find(
                (e) => e.value == String(session?.user?.level)
              )?.label || "Guest"}
            </p>
          <p>welcome, {session?.user?.name || "Guest"}</p>

          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-8">
        {renderSection("Quick Access", dashboardItems)}
        {renderSection("Account Management", accountItems)}
        {renderSection("Unit Management", unitItems)}
      </div>

      <div className="p-6 w-full justify-center flex mt-12">
        <button
          onClick={() => signOut()}
          className="w-fit flex items-center justify-center gap-2 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors p-4"
        >
          <LuLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}