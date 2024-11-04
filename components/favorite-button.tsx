"use client";

import { useCallback, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useModalStore } from "@/store/use-modal-store";
import { ToggleFavoriteUnit } from "@/lib/action";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FavoriteButtonProps {
  initialIsFavorited: boolean;
  unitId: number;
  className?: string;
  withDetail?: boolean | null;
  rounded?: boolean | null;
}

const FavoriteButton = ({
  initialIsFavorited,
  unitId,
  className,
  withDetail = false,
  rounded = false,
}: FavoriteButtonProps) => {
  const { data: session } = useSession();
  const { openModal } = useModalStore();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const handleToggleFavorite = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!session) return openModal("login");

      // Toggle and update UI state immediately
      setIsFavorited((prev) => !prev);
      setIsLoading(true);

      try {
        const response = await ToggleFavoriteUnit(unitId);
        if (response.status !== 200) {
          setIsFavorited((prev) => !prev); // Revert the state if request fails
        } else {
          // Show toast based on the toggled state
          toast({
            variant: "default",
            title: isFavorited
              ? "Removed from Favorites"
              : "Added to Favorites",
            description: `This unit has been ${
              isFavorited ? "removed from" : "added to"
            } your favorites.`,
          });
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast({
          variant: "destructive",
          title: "Error toggling favorite",
          description: `${error}`,
        });
        setIsFavorited((prev) => !prev); // Revert the state in case of error
      } finally {
        setIsLoading(false);
      }
    },
    [unitId, openModal, session, isFavorited, toast]
  );
  if (rounded)
    return (
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md"
      >
        <Heart
          size={16}
          className={
            isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
          }
        />
      </button>
    );

  return (
    <button
      className={cn(
        `flex items-center gap-1 p-1 transition-transform transform-gpu
         hover:scale-110 active:scale-90 md:hover:scale-100 md:active:scale-100
         ${isFavorited ? "text-red-500" : "text-gray-500"}`,
        className
      )}
      onClick={handleToggleFavorite}
      disabled={isLoading}
    >
      <span className="flex items-center gap-1">
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
        {withDetail && (
          <span className="text-sm underline text-black">Save</span>
        )}
      </span>
    </button>
  );
};

export default FavoriteButton;
