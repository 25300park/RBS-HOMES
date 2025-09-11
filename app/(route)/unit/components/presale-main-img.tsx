"use client";

import FavoriteButton from "@/components/favorite-button";
import { ShareBtn } from "@/components/ui/share-btn";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export interface PresaleMainImgProps {
  isFavorited: boolean;
  unitId: any;
  mainImage: any;
}

const PresaleMainImg = ({
  isFavorited,
  unitId,
  mainImage,
}: PresaleMainImgProps): React.ReactNode => {
  const router = useRouter();

  const handleBack = () => {
    // 브라우저의 히스토리 길이 체크
    if (window.history.length > 2) {
      router.back();
    } else {
      // 히스토리가 없으면 기본 경로로 이동
      router.push("/");
    }
  };

  return (
    <div>
      <div className="hidden md:block">
        <div className="absolute top-4 left-4 z-20 flex gap-2 items-center">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md"
          >
            <ArrowLeft size={16} />
          </button>
        </div>
        <div className="absolute top-4 right-4 z-20 flex gap-2 items-center">
          <ShareBtn rounded />
          <FavoriteButton
            rounded
            initialIsFavorited={isFavorited}
            unitId={unitId}
          />
        </div>
      </div>

      <div className="w-full">
        <div className="relative w-full h-[720px] md:h-[360px] overflow-hidden">
          <Image src={mainImage} alt="Main project image" fill className="" />
        </div>
      </div>
    </div>
  );
};

export default PresaleMainImg;
