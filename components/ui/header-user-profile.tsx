'use client'

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
  { label: "Dashboard", link: "/account/dashboard" },
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
      <DropdownMenu open={isNotificationOpen} onOpenChange={handleNotificationOpenChange}>
        <DropdownMenuTrigger asChild>
          <button
            className="cursor-pointer border rounded-full p-2 hover:bg-gray-50 relative flex items-center justify-center w-10 h-10 focus:outline-none"
            aria-label="notifications"
          >
            <img src="/assets/icons/alarm.png" alt="notification" className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[420px] max-h-[500px] overflow-y-auto p-0">
          <div className="px-4 py-3 sticky top-0 bg-white border-b z-10">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-0">
              {notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className={`p-3 cursor-pointer flex flex-col gap-2 rounded-none border-b ${
                    notif.isRead ? "bg-white" : "bg-blue-50"
                  }`}
                  onClick={() => !notif.isRead && handleNotificationClick(notif.id)}
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
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 mb-1">
                        {notif.message.sender.name || "Unknown"}
                      </p>

                      <p className="text-xs text-gray-700 line-clamp-2 mb-2">
                        {notif.message.content}
                      </p>

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

          <DropdownMenuItem asChild className="flex justify-center py-3 text-sm text-blue-600 hover:text-blue-700 rounded-none border-0 cursor-pointer">
            <Link href="/account/messages" className="w-full text-center">
              View all messages
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="cursor-pointer border rounded-full p-1 hover:bg-gray-50 flex items-center justify-center w-10 h-10 focus:outline-none">
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

        <DropdownMenuContent align="end" className="w-[300px]">
          {/* Profile Info */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={session.user.image || ""}
                  alt={session.user.name || "Profile"}
                  className="object-contain"
                />
                <AvatarFallback className="bg-gray-200">
                  <FaRegUser className="text-sm text-gray-600" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{session.user.name}</p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* MY PROFILE Link */}
          <DropdownMenuItem asChild>
            <Link href="/account/management?tabs=EditInformation" className="text-sm cursor-pointer">
              MY PROFILE
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Menu Items */}
          {MENU_LIST.map((menu) => (
            <DropdownMenuItem key={menu.label} asChild>
              <Link href={menu.link} className="text-sm cursor-pointer">
                {menu.label}
              </Link>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* Logout Button */}
          <DropdownMenuItem
            className="text-sm text-red-600 cursor-pointer"
            onClick={() => signOut()}
          >
            Log-out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}