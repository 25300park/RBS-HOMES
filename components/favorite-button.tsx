"use client";

import { useCallback, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useModalStore } from "@/store/use-modal-store";
import { ToggleFavoriteUnit } from "@/lib/action";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  initialIsFavorited: boolean;
  unitId: number;
  className?: string;
}

const FavoriteButton = ({
  initialIsFavorited,
  unitId,
  className,
}: FavoriteButtonProps) => {
  const { data: session } = useSession();
  const { openModal } = useModalStore();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 서버에서 받은 초기 값으로 상태 설정
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const handleToggleFavorite = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!session) return openModal("login");

      // UI 상태 업데이트 (즐겨찾기 상태 즉시 반영)
      setIsFavorited((prev) => !prev);

      setIsLoading(true);
      try {
        // 서버와 동기화
        const response = await ToggleFavoriteUnit(unitId);
        if (response.status !== 200) {
          // 서버에서 오류가 발생한 경우 원래 상태로 복구
          setIsFavorited((prev) => !prev);
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        // 오류 발생 시 상태 복구
        setIsFavorited((prev) => !prev);
      } finally {
        setIsLoading(false);
      }
    },
    [unitId, openModal, session]
  );

  return (
    <button
      className={cn(
        `p-1 transition-transform transform-gpu 
         hover:scale-110 active:scale-90 md:hover:scale-100 md:active:scale-100
         ${isFavorited ? "text-red-500" : "text-gray-500"}`,
        className
      )}
      onClick={handleToggleFavorite}
      disabled={isLoading}
    >
      {isFavorited ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 text-red-500 stroke-white stroke-2"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 text-gray-700 stroke-white stroke-2"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )}
    </button>
  );
};

export default FavoriteButton;
