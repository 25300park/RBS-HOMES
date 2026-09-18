"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  ShieldCheck,
  Wrench,
  Truck,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCheck,
  ChevronDown,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  sender: "manager" | "user" | "system";
  senderName: string;
  avatar?: string;
  text: string;
  time: string;
  attachmentName?: string;
  attachmentType?: "image" | "pdf" | "doc";
  attachmentSize?: string;
  status?: "sent" | "read";
}

interface FloatingLiveChatProps {
  managerName?: string;
  managerRole?: string;
  userRole?: "tenant" | "landlord" | "agent" | "buyer";
  unitTitle?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FloatingLiveChat({
  managerName = "Sarah Jenkins",
  managerRole = "Mr. Homes Senior Dedicated Manager",
  userRole = "tenant",
  unitTitle = "Two Serendra #1204",
  isOpen: externalIsOpen,
  onOpenChange,
}: FloatingLiveChatProps) {
  const { toast } = useToast();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    setInternalIsOpen(val);
    if (onOpenChange) onOpenChange(val);
  };
  const [unreadCount, setUnreadCount] = useState(1);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Drag & Safe Position State ──────────────────────────────
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    moved: false,
  });
  const buttonRef = useRef<HTMLDivElement>(null);

  const isLandlord = userRole === "landlord";

  // Clamp helper to ensure button is NEVER outside screen
  const getSafePosition = useCallback((x: number, y: number) => {
    if (typeof window === "undefined") return { x, y };
    const btnWidth = buttonRef.current?.offsetWidth || 56;
    const btnHeight = buttonRef.current?.offsetHeight || 56;
    const minX = 12;
    const maxX = Math.max(12, window.innerWidth - btnWidth - 12);
    const minY = 12;
    // Keep above bottom navigation bar on mobile (at least 80px)
    const maxY = Math.max(12, window.innerHeight - btnHeight - (window.innerWidth < 640 ? 80 : 20));

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  }, []);

  // Screen Resize Guardian: Auto snap inside if window resizes
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        return getSafePosition(prev.x, prev.y);
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getSafePosition]);

  // Role-specific initial messages
  const initialMessages: ChatMessage[] = isLandlord
    ? [
        {
          id: "1",
          sender: "system",
          senderName: "RBS Encrypted Asset Desk",
          text: `Connected to your assigned Asset Manager (${managerName}) for ${unitTitle}.`,
          time: "10:00 AM",
        },
        {
          id: "2",
          sender: "manager",
          senderName: managerName,
          text: `Hello! I am ${managerName}, your dedicated Asset Manager at Mr. Homes. How can I assist you with your rental remittances, maintenance approvals, or lease terms for ${unitTitle}?`,
          time: "10:01 AM",
          status: "read",
        },
      ]
    : [
        {
          id: "1",
          sender: "system",
          senderName: "RBS Encrypted Resident Desk",
          text: `Connected to your assigned property manager (${managerName}) for ${unitTitle}.`,
          time: "10:00 AM",
        },
        {
          id: "2",
          sender: "manager",
          senderName: managerName,
          text: `Hello! I am ${managerName}, your dedicated property manager at Mr. Homes. How can I assist you with your condo today?`,
          time: "10:01 AM",
          status: "read",
        },
      ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Sync messages when role changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [userRole, managerName, unitTitle]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  // ── Drag Handlers ─────────────────────────────────────────
  const handlePointerDown = (clientX: number, clientY: number) => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initX: rect.left,
      initY: rect.top,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartRef.current.startX;
    const deltaY = clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
      dragStartRef.current.moved = true;
    }

    const rawX = dragStartRef.current.initX + deltaX;
    const rawY = dragStartRef.current.initY + deltaY;
    setPosition(getSafePosition(rawX, rawY));
  }, [isDragging, getSafePosition]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
  }, [isDragging]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handlePointerUp();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const handleButtonClick = (e: React.MouseEvent) => {
    if (dragStartRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(true);
  };

  const handleSendMessage = (textToSend?: string, attachment?: { name: string; type: "image" | "pdf" | "doc"; size: string }) => {
    const text = (textToSend !== undefined ? textToSend : inputMessage).trim();
    if (!text && !attachment) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      senderName: "You",
      text: text || `Sent an attachment: ${attachment?.name}`,
      time: timeStr,
      attachmentName: attachment?.name,
      attachmentType: attachment?.type,
      attachmentSize: attachment?.size,
      status: "sent",
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (textToSend === undefined) setInputMessage("");

    // Simulate smart manager reply based on user role
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = `Thank you for your message. I have logged your request regarding ${unitTitle} and will follow up immediately.`;

      if (attachment) {
        replyText = `Thank you! I have received "${attachment.name}". It has been securely verified and auto-archived in your Legal Vault.`;
      } else if (isLandlord) {
        if (text.includes("Remittance") || text.includes("remittance") || text.includes("Payout")) {
          replyText = `Your monthly rental collection for ${unitTitle} is in order. Remittance transfer details have been logged in your Payment Ledger.`;
        } else if (text.includes("Repair") || text.includes("Approval") || text.includes("Quotation")) {
          replyText = `The repair quotation for ${unitTitle} has been attached to your dashboard. You can review and authorize it directly with 1-click.`;
        } else if (text.includes("Tax") || text.includes("BIR") || text.includes("2307")) {
          replyText = `Your BIR 2307 and expense tax certificates for ${unitTitle} are being compiled by accounting and will be uploaded to your Vault.`;
        } else if (text.includes("Renewal") || text.includes("Extension")) {
          replyText = `I will coordinate with the resident regarding lease renewal terms and prepare the updated LOI draft for your review.`;
        }
      } else {
        if (text.includes("Gatepass") || text.includes("gatepass")) {
          replyText = `Your Gatepass request for ${unitTitle} has been received. Our team will verify and upload the clearance pass to your Vault.`;
        } else if (text.includes("Repair") || text.includes("Plumbing") || text.includes("Aircon")) {
          replyText = `Your maintenance ticket for ${unitTitle} is in review. I will coordinate technician schedule and forward the formal quotation.`;
        } else if (text.includes("Receipt") || text.includes("Tax") || text.includes("OR")) {
          replyText = `Official Receipt (BIR 2307/OR) issuance request has been forwarded to accounting. We will notify you once ready.`;
        } else if (text.includes("Lease") || text.includes("Terms")) {
          replyText = `I have received your lease inquiry for ${unitTitle}. I will review the contract terms and get back to you shortly.`;
        }
      }

      const managerReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "manager",
        senderName: managerName,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "read",
      };

      setMessages((prev) => [...prev, managerReply]);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    const type: "image" | "pdf" | "doc" = isImg ? "image" : isPdf ? "pdf" : "doc";
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";

    handleSendMessage("", {
      name: file.name,
      type,
      size: sizeStr,
    });

    toast({
      title: "File Uploaded & Archived",
      description: `"${file.name}" has been sent to ${managerName} and saved to Vault.`,
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleQuickAction = (actionTitle: string, templateText: string) => {
    handleSendMessage(`[${actionTitle}] ${templateText}`);
    toast({
      title: `${actionTitle} Sent`,
      description: `Dispatched directly to ${managerName}`,
    });
  };

  return (
    <>
      {/* 100% Safe Draggable Floating Action Button */}
      <div
        ref={buttonRef}
        style={
          position
            ? { left: `${position.x}px`, top: `${position.y}px`, bottom: "auto", right: "auto" }
            : undefined
        }
        className={`${
          position ? "fixed" : "fixed bottom-20 right-4 sm:bottom-6 sm:right-6"
        } z-[60] select-none touch-none`}
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
      >
        {!isOpen ? (
          <div
            onClick={handleButtonClick}
            className={`group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-blue-600/40 active:scale-95 transition-transform cursor-grab active:cursor-grabbing border-2 border-white/30 ${
              isDragging ? "opacity-90 scale-110 shadow-blue-500/60" : ""
            }`}
            title="Click to chat, or Drag to move anywhere"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
              {unreadCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-xs font-black tracking-tight hidden sm:inline-block pr-0.5">
              {isLandlord ? `Asset Manager (${managerName.split(" ")[0]})` : `Chat with ${managerName.split(" ")[0]}`}
            </span>
          </div>
        ) : null}
      </div>

      {/* Floating Live Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-6 z-[60] w-auto sm:w-[390px] h-[500px] sm:h-[550px] max-h-[calc(100vh-140px)] sm:max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-zinc-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 font-sans">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center border-2 border-white/20 shadow-xs">
                  {managerName.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white leading-tight">{managerName}</h3>
                  <span className="text-[9px] bg-blue-500/30 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded-md font-bold">
                    {isLandlord ? "Asset Desk" : "Concierge"}
                  </span>
                </div>
                <p className="text-[10px] text-blue-200/80 font-medium truncate max-w-[190px]">
                  {unitTitle} · {isLandlord ? "Landlord Asset Manager" : "Dedicated Manager"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Minimize chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 4 Role-Specific Quick Action Chips */}
          <div className="bg-zinc-50/90 border-b border-zinc-100 p-2.5 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
            {isLandlord ? (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickAction("Remittance", "Checking current monthly rental collection and payout remittance schedule.")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200/80 hover:border-blue-500 hover:text-blue-600 text-[11px] font-bold text-zinc-700 whitespace-nowrap shadow-2xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <DollarSign className="w-3 h-3 text-emerald-600" />
                  <span>Remittance</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("Repair Approval", "Reviewing repair quotation authorization for tenant maintenance.")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200/80 hover:border-blue-500 hover:text-blue-600 text-[11px] font-bold text-zinc-700 whitespace-nowrap shadow-2xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Wrench className="w-3 h-3 text-amber-500" />
                  <span>Repair Approval</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("Tax Statement", "Requesting BIR 2307 withholding certificates and tax invoice summaries.")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200/80 hover:border-blue-500 hover:text-blue-600 text-[11px] font-bold text-zinc-700 whitespace-nowrap shadow-2xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-purple-500" />
                  <span>Tax & BIR 2307</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("Lease Renewal", "Discussing tenant lease renewal terms and monthly rent adjustments.")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200/80 hover:border-blue-500 hover:text-blue-600 text-[11px] font-bold text-zinc-700 whitespace-nowrap shadow-2xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <TrendingUp className="w-3 h-3 text-blue-500" />
                  <span>Lease Renewal</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickAction("Care Request", "I'd like to report a repair/maintenance issue in the unit.")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200/80 hover:border-blue-500 hover:text-blue-600 text-[11px] font-bold text-zinc-700 whitespace-nowrap shadow-2xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Wrench className="w-3 h-3 text-amber-500" />
                  <span>Repair Request</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("Gatepass", "Please issue a building delivery / visitor Gatepass clearance.")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200/80 hover:border-blue-500 hover:text-blue-600 text-[11px] font-bold text-zinc-700 whitespace-nowrap shadow-2xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Truck className="w-3 h-3 text-indigo-500" />
                  <span>Gatepass</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("Official Receipt", "Requesting official rent receipt (OR / BIR 2307) for tax expense.")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200/80 hover:border-blue-500 hover:text-blue-600 text-[11px] font-bold text-zinc-700 whitespace-nowrap shadow-2xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-purple-500" />
                  <span>Official Receipt (OR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("Lease Inquiry", "I have an inquiry regarding my lease contract terms and renewal.")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200/80 hover:border-blue-500 hover:text-blue-600 text-[11px] font-bold text-zinc-700 whitespace-nowrap shadow-2xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Lease Terms</span>
                </button>
              </>
            )}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]/50 text-xs">
            {messages.map((msg) => {
              if (msg.sender === "system") {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-semibold">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isUser = msg.sender === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
                >
                  <span className="text-[10px] text-zinc-400 font-medium px-1">
                    {msg.senderName} · {msg.time}
                  </span>
                  
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed text-xs space-y-2 ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-none shadow-sm shadow-blue-600/20"
                        : "bg-white text-zinc-800 border border-zinc-200/80 rounded-tl-none shadow-2xs"
                    }`}
                  >
                    {msg.text && <p>{msg.text}</p>}

                    {/* Attachment Card with Vault Sync Badge */}
                    {msg.attachmentName && (
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        isUser
                          ? "bg-blue-700/80 border-blue-500 text-white"
                          : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      }`}>
                        <div className="flex items-center gap-2 min-w-0">
                          {msg.attachmentType === "image" ? (
                            <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="font-bold block truncate text-[11px]">{msg.attachmentName}</span>
                            <span className="text-[9px] opacity-80 block">
                              {msg.attachmentSize} · <span className="underline font-bold">Auto-saved to Vault</span>
                            </span>
                          </div>
                        </div>

                        <a
                          href="/dashboard/contracts"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0"
                          title="View in Document Vault"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {isUser && msg.status && (
                    <span className="text-[9px] text-blue-600 flex items-center gap-0.5 pr-1">
                      <CheckCheck className="w-3 h-3" />
                      <span>Sent & Archived in Vault</span>
                    </span>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] italic pl-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                <span>{managerName} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-zinc-200/80 flex items-center gap-2 shrink-0"
          >
            {/* Hidden Real File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,image/*,.doc,.docx"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title="Attach File or Photo (Auto-saved to Vault)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isLandlord ? "Message your Asset Manager..." : "Type your message..."}
              className="flex-1 text-xs border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 transition-colors bg-zinc-50/50"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
