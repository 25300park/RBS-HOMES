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
        <svg
          style={{
            fill: "#ff4e4e", // 흰색 배경
            stroke: "#ff4e4e", // 검은색 테두리
            strokeWidth: "1px", // 테두리 두께
            height: "20px",
            width: "20px",
          }}
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg
        className="hover:scale-105"
          style={{
            fill: "rgba(255, 255, 255, 1)", // 흰색 배경
            stroke: "#a1a1a1", // 검은색 테두리
            strokeWidth: "1px", // 테두리 두께
            height: "20px",
            width: "20px",
          }}
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )}
    </button>
  );
};

export default FavoriteButton;
