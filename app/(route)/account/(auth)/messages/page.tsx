import React, { useState } from "react";
import { getReceivedMessages, markAllNotificationsAsRead } from "@/lib/message-action";
import { Calendar, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import MarkAllReadButton from "./components/mark-all-read-button";
import MessageCard from "./components/message-card";

interface Message {
  id: number;
  title: string;
  content: string;
  sender: {
    id: number;
    name: string | null;
    email: string;
    image: string | null;
  };
  sentAt: Date;
  status: number;
  isReadByUser: boolean;
  userReadAt: Date | null;
  recipientId?: number;
  senderId?: number;
}

// 필리핀 시간대로 현재 시간 반환
function getPhilippineTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
}

export default async function MessageHome() {
  const result = await getReceivedMessages(1, 50);

  if (!result.success) {
    return (
      <div className="px-4 max-w-[1440px] mx-auto mb-12 md:mb-0">
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load messages</p>
        </div>
      </div>
    );
  }

  const messages = (result.messages || []) as Message[];
  const unreadCount = messages.filter(msg => !msg.isReadByUser).length;

  // 날짜별 그룹화
  const groupedMessages = messages.reduce(
    (acc, msg) => {
      const dateKey = format(new Date(msg.sentAt), "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(msg);
      return acc;
    },
    {} as Record<string, Message[]>
  );

  const sortedDates = Object.keys(groupedMessages).sort().reverse();

  return (
    <div className="px-4 max-w-[1440px] mx-auto mb-12 md:mb-0">
      {/* Info Banner */}
      <div className="mb-6 p-4 bg-gray-50 border  rounded-lg flex items-start gap-3">
        <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium ">
            Showing messages from the last 30 days
          </p>
          <p className="text-xs mt-1">
            {messages.length} message{messages.length !== 1 ? "s" : ""} found
            {unreadCount > 0 && ` • ${unreadCount} unread`}
          </p>
        </div>
        {unreadCount > 0 && (
          <MarkAllReadButton unreadCount={unreadCount} />
        )}
      </div>

      {/* Messages List */}
      <div className="space-y-8">
        {messages.length > 0 ? (
          sortedDates.map((dateKey) => {
            const dayMessages = groupedMessages[dateKey];
            const date = new Date(dateKey);
            const today = getPhilippineTime();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateLabel = format(date, "EEEE, MMMM d, yyyy");
            if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
              dateLabel = "Today";
            } else if (
              format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")
            ) {
              dateLabel = "Yesterday";
            }

            return (
              <div key={dateKey}>
                {/* Date Separator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm font-medium text-gray-600 px-3 py-1 bg-white">
                    {dateLabel}
                  </span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Messages for this date */}
                <div className=" space-y-3">
                  {dayMessages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No messages in the last 30 days</p>
          </div>
        )}
      </div>
    </div>
  );
}