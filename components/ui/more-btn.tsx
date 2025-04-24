"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useModalStore } from "@/store/use-modal-store";
import { useSession } from "next-auth/react";
import { MdMoreHoriz, MdFlag } from "react-icons/md";

const MoreBtn = () => {
  const { openModal } = useModalStore();
  const { data: session } = useSession();

  const openComplain = () => {
    if (!session) {
      openModal("login");
    } else {
      openModal("complain");
    }
  };

  return (
    <HoverCard openDelay={0.5}>
      <HoverCardTrigger className="cursor-pointer">
        <div className="flex items-center gap-1">
          <MdMoreHoriz />
          <span>More</span>
        </div>
      </HoverCardTrigger>

      <HoverCardContent align="start" className="w-fit p-0">
        <div
          onClick={openComplain}
          className="w-full flex p-3 items-center gap-1 cursor-pointer hover:bg-blue-50"
        >
          <MdFlag />
          <p>Report a problem with this listing</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default MoreBtn;
