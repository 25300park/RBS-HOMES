'use client'

import { useState } from "react";
import { Archive, Trash2 } from "lucide-react";
import { markMessageAsRead } from "@/lib/message-action";

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

interface MessageCardProps {
  message: Message;
  onMarkAsRead?: (messageId: number) => void;
}

export default function MessageCard({ message, onMarkAsRead }: MessageCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCardClick = async () => {
    if (message.isReadByUser) return; // 이미 읽은 메시지면 아무것도 하지 않음

    setIsLoading(true);
    try {
      const result = await markMessageAsRead(message.id);
      if (result.success && onMarkAsRead) {
        onMarkAsRead(message.id);
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: 아카이브 기능 구현
    console.log("Archive message:", message.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: 삭제 기능 구현
    console.log("Delete message:", message.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
        ${
          message.isReadByUser
            ? "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
            : "bg-gradient-to-r from-orange-50 to-orange-25 border-orange-200 shadow-sm hover:shadow-md hover:border-orange-300"
        }
        ${isLoading ? "opacity-75 pointer-events-none" : ""}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {message.sender.image ? (
            <img
              src={message.sender.image}
              alt={message.sender.name || "Sender"}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium text-sm">
              {message.sender.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {message.sender.name || "Unknown"}
              </h3>
              {!message.isReadByUser && (
                <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>
              )}
            </div>
          </div>

          <p className="text-sm font-medium text-gray-900 mb-2">
            {message.title}
          </p>
             <div 
                    className=""
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.4',
                      color: '#374151'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: message.content
                    }}
                  />
          {/* <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {message.content}
            
          </p> */}

          <p className="text-xs text-gray-500 mt-2">
            {message.sender.email}
          </p>
        </div>

        {/* Actions */}
        {/* <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleArchive}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Archive"
            disabled={isLoading}
          >
            <Archive className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Delete"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 text-gray-600" />
          </button>
        </div> */}
      </div>

      {/* Unread Indicator Bar */}
      {!message.isReadByUser && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-xl"></div>
      )}
    </div>
  );
}