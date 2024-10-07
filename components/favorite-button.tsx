'use client'

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useModalStore } from "@/store/use-modal-store";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void; // 좋아요 버튼 상태 토글 콜백
}

const FavoriteButton = ({ isFavorite, onToggle }: FavoriteButtonProps) => {
  const { data: session } = useSession(); // 로그인 상태 확인
  const { openModal } = useModalStore(); // 로그인 모달 열기

  const handleFavoriteClick = (e: any) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    if (!session) {
      // 비로그인 상태인 경우 로그인 모달을 열기
      openModal("login");
    } else {
      // 로그인 상태인 경우 좋아요 토글
      onToggle();
    }
  };

  return (
    <button onClick={handleFavoriteClick}>
      {isFavorite ? (
        <img src="/assets/icons/bookmark_on.png"  className="w-5" alt="bookmark"/>
      ) : (
        <img src="/assets/icons/bookmark_off.png" className="w-5"  alt="bookmark"/>
      )}
    </button>
  );
};

export default FavoriteButton;
