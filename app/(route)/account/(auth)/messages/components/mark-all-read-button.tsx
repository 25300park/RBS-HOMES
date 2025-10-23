'use client'

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { markAllNotificationsAsRead } from "@/lib/message-action";

interface MarkAllReadButtonProps {
  unreadCount: number;
}

export default function MarkAllReadButton({ unreadCount }: MarkAllReadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        setIsSuccess(true);
        // 3초 후 성공 메시지 사라지기
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleMarkAllAsRead}
        disabled={isLoading || isSuccess}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
          transition-all duration-200 flex-shrink-0
          ${
            isSuccess
              ? "bg-green-100 text-green-700 border border-green-300"
              : isLoading
              ? "bg-gray-100 text-gray-500 border border-gray-200"
              : "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
          }
        `}
        title={`Mark all ${unreadCount} message${unreadCount !== 1 ? 's' : ''} as read`}
      >
        <CheckCheck className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">
          {isSuccess ? "Done!" : isLoading ? "Processing..." : "Mark all read"}
        </span>
        <span className="sm:hidden">
          {isSuccess ? "✓" : isLoading ? "..." : unreadCount}
        </span>
      </button>
    </div>
  );
}