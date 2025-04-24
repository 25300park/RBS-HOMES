"use client";

import { signOut, useSession } from "next-auth/react";
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";
import { accountSideBarOption } from "@/lib/config/account-options";
import { useRouter } from "next/navigation";
import { UserLevelUIOptions } from "@/lib/config/account-options";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LuLogOut } from "react-icons/lu";
import MenuCard from "./menu-card";
import MobileAccountMenuList from "./mobile-account-menu-list";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/store/use-modal-store";
import DotLoader from "@/components/ui/dot-loader";
import { useState, useEffect } from "react";
import LogoutButton from "@/components/ui/logout-btn";

interface AccountMenuListProps {}

export default function AccountMenuList({}: AccountMenuListProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { openModal } = useModalStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Guest UI
  if (!session) {
    return (
      <div className="flex flex-col min-h-[calc(100dvh-80px)]">
        {/* Guest Profile Section */}
        <div className="p-4 flex flex-col items-center text-center border-b">
          <Avatar className="w-20 h-20 mb-3">
            <AvatarFallback>
              <FaRegUser className="text-2xl" />
            </AvatarFallback>
          </Avatar>
          <h2 className="font-medium">Guest</h2>
          <p className="text-sm text-gray-500">
            Please Login to access account features
          </p>
        </div>

        {/* Banner Section for Guests */}
        <div className="p-4 bg-white">
          <div className="rounded-xl border p-4 flex flex-col items-center text-center">
            <h3 className="font-medium">Welcome to RBS</h3>
            <p className="text-orange-500 text-sm mt-2">
              Login to access all features
            </p>
            <div className="mt-4 space-x-3">
              <Button
                onClick={() => openModal("login")}
                variant="default"
                className="px-8"
              >
                Login
              </Button>
              <Button
                onClick={() => openModal("signup")}
                variant="outline"
                className="px-8"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 모바일
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
  const accountItems =
    accountSideBarOption.find((item) => item.name === "Account Management")
      ?.children || [];
  const unitItems =
    accountSideBarOption.find((item) => item.name === "Unit Management")
      ?.children || [];

  return (
    <div className="h-full flex flex-col max-w-[1128px] mx-auto relative">
      {isLoading && (
        <div className="relative w-screen h-screen bg-white z-50">
          <DotLoader isLoading={isLoading} />
        </div>
      )}
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
              {UserLevelUIOptions.find(
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

      <div className=" w-full justify-center flex mt-2">
        <LogoutButton />
      </div>
    </div>
  );
}
