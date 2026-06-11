"use client";

import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { getNotifications, markNotificationAsRead } from "@/lib/message-action";

const MENU_LIST = [
  { label: "Account Home", link: "/account" },
  { label: "Dashboard", link: "/dashboard" },
  { label: "Schedule", link: "/account/schedule" },
  { label: "Registration", link: "/account/unit/registration/step-one" },
  { label: "My unit", link: "/account/unit/my-list" },
  { label: "Favorite Unit", link: "/account/unit/favorites" },
];

interface Notification {
  id: number;
  messageId: number;
  userId: number;
  isRead: boolean;
  type: number;
  readAt: Date | null;
  createdAt: Date;
  message: {
    id: number;
    title: string;
    content: string;
    type: number;
    priority: number;
    sentAt: Date;
    sender: {
      id: number;
      name: string | null;
      image: string | null;
    };
  };
}

export default function HeaderUserProfile({ session }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // 알림 조회 (30초마다 자동 업데이트)
  useEffect(() => {
    const fetchNotifications = async () => {
      const result = await getNotifications(1, 10);
      if (result.success) {
        setNotifications(result.notifications || []);
      } else {
        console.error("[CLIENT] Failed to fetch notifications:", result.error);
        setNotifications([]);
      }
    };

    fetchNotifications();

    // 30초마다 업데이트
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // 알림 열기 시
  const handleNotificationOpenChange = (open: boolean) => {
    setIsNotificationOpen(open);
  };

  // 알림 클릭 시 읽음 처리
  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    // 알림 목록 새로고침
    const result = await getNotifications(1, 10);
    if (result.success) {
      setNotifications(result.notifications || []);
    }
  };

  // 미읽음 알림 개수 (파생 데이터)
  const unreadCount = notifications.length;

  return (
    <div className="flex gap-2">
      {/* Notification Bell */}
      <DropdownMenu
        open={isNotificationOpen}
        onOpenChange={handleNotificationOpenChange}
      >
        <DropdownMenuTrigger asChild>
          <button
            className="cursor-pointer border rounded-full p-2 hover:bg-gray-50 relative flex items-center justify-center w-10 h-10 focus:outline-none transition-colors"
            aria-label="notifications"
          >
            <img
              src="/assets/icons/alarm.png"
              alt="notification"
              className="w-5 h-5"
            />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[420px] max-h-[500px] overflow-y-auto p-0"
        >
          <div className="px-4 py-3 sticky top-0 bg-white border-b z-10">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-16 text-center flex flex-col items-center justify-center">
              <div className="mb-4 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full w-16 h-16 flex items-center justify-center">
                <img
                  src="/assets/icons/alarm.png"
                  alt="no notifications"
                  className="w-8 h-8 opacity-50"
                />
              </div>
              <p className="font-semibold text-gray-900 mb-2 text-base">All caught up!</p>
              <p className="text-sm text-gray-500">You don&apos;t have any notifications right now</p>
            </div>
          ) : (
            <div className="space-y-0">
              {notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className={`p-3 cursor-pointer flex flex-col gap-2 rounded-none border-b ${
                    notif.isRead ? "bg-white" : "bg-orange-50"
                  }`}
                  onClick={() =>
                    !notif.isRead && handleNotificationClick(notif.id)
                  }
                >
                  <div className="flex items-start gap-3 w-full">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage
                        src={notif.message.sender.image || ""}
                        alt={notif.message.sender.name || "Sender"}
                        className="object-contain"
                      />
                      <AvatarFallback className="bg-gray-200">
                        <FaRegUser className="text-xs text-gray-600" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {notif.message.title}
                        </p>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 mb-1">
                        {notif.message.sender.name || "Unknown"}
                      </p>

                      <div
                        className=""
                        style={{
                          fontSize: "14px",
                          lineHeight: "1.4",
                          color: "#374151",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: notif.message.content,
                        }}
                      />

                      <p className="text-xs text-gray-400">
                        {new Date(notif.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}

          <DropdownMenuSeparator className="m-0" />

          <DropdownMenuItem
            asChild
            className="flex justify-center py-3 text-sm text-orange-600 hover:text-orange-700 rounded-none border-0 cursor-pointer"
          >
            <Link href="/account/messages" className="w-full text-center">
              View all messages
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="cursor-pointer border rounded-full p-1 hover:bg-gray-50 flex items-center justify-center w-10 h-10 focus:outline-none transition-colors">
            <div className="flex items-center justify-center gap-2 relative w-full h-full">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={session.user.image || ""}
                  alt={session.user.name || "Profile"}
                  className="object-contain"
                />
                <AvatarFallback className="bg-gray-200">
                  <FaRegUser className="text-sm text-gray-600" />
                </AvatarFallback>
              </Avatar>
              <span className="w-2 h-2 rounded-full bg-green-500 absolute right-0 bottom-0 ring-2 ring-white"></span>
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[320px] p-0">
          {/* Profile Info */}
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={session.user.image || ""}
                  alt={session.user.name || "Profile"}
                  className="object-contain"
                />
                <AvatarFallback className="bg-gray-200">
                  <FaRegUser className="text-sm text-gray-600" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">{session.user.name}</p>
                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="my-0" />

          {/* MY PROFILE Link */}
          <DropdownMenuItem asChild>
            <Link
              href="/account/management?tabs=EditInformation"
              className="text-sm cursor-pointer px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-gray-700">MY PROFILE</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-0" />

          {/* Menu Items */}
          {MENU_LIST.map((menu) => {
            const getIcon = (label: string) => {
              switch (label) {
                case "Account Home":
                  return (
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l-7-4m0 0V5m16 12l7-4m0 0V5m0 0l-7-4" />
                    </svg>
                  );
                case "Dashboard":
                  return (
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  );
                case "Schedule":
                  return (
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  );
                case "Registration":
                  return (
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  );
                case "My unit":
                  return (
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  );
                case "Favorite Unit":
                  return (
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  );
                default:
                  return null;
              }
            };

            if (menu.label === "Dashboard") {
              return (
                <DropdownMenuItem
                  key={menu.label}
                  className="text-sm cursor-pointer px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => (window.location.href = menu.link)}
                >
                  <span>{getIcon(menu.label)}</span>
                  <span>{menu.label}</span>
                </DropdownMenuItem>
              );
            }

            return (
              <DropdownMenuItem key={menu.label} asChild>
                <Link
                  href={menu.link}
                  className="text-sm cursor-pointer px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span>{getIcon(menu.label)}</span>
                  <span>{menu.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator className="my-0" />

          {/* Logout Button */}
          <DropdownMenuItem
            className="text-sm cursor-pointer px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            onClick={() => signOut()}
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-gray-700">Log-out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}