"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useModalStore } from "@/store/use-modal-store";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MdMoreHoriz, MdFlag, MdEdit } from "react-icons/md";

interface MoreBtnProps {
  unitId: string | number;
  adminId?: string;
}

const MoreBtn = ({ unitId, adminId }: MoreBtnProps) => {
  const { openModal } = useModalStore();
  const { data: session } = useSession();
  const router = useRouter();

  // 현재 로그인한 사용자가 유닛의 작성자인지 확인
  const isOwner = session?.user?.id === adminId;

  const openComplain = () => {
    if (!session) {
      openModal("login");
    } else {
      openModal("complain");
    }
  };

  const handleEdit = () => {
    router.push(`/account/unit/edit/${unitId}`);
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
        {/* 유닛 작성자에게만 수정 버튼 표시 */}
        {isOwner && (
          <div
            onClick={handleEdit}
            className="w-full flex p-3 items-center gap-2 cursor-pointer hover:bg-blue-50 border-b"
          >
            <MdEdit />
            <p>Edit this listing</p>
          </div>
        )}

        {/* 신고 버튼은 모든 사용자에게 표시 */}
        <div
          onClick={openComplain}
          className="w-full flex p-3 items-center gap-2 cursor-pointer hover:bg-blue-50"
        >
          <MdFlag />
          <p>Report a problem with this listing</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default MoreBtn;