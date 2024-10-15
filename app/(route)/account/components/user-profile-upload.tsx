import React, { useState } from "react";
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";
import { AiTwotoneSetting } from "react-icons/ai";

interface UserProfileAvatarProps {
  imageUrl: string;
  onImageSelect: (file: File | null) => void; // 부모 컴포넌트에 이미지 전달
}

export default function UserProfileAvatar({
  imageUrl,
  onImageSelect,
}: UserProfileAvatarProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file)); // 미리보기 설정
      onImageSelect(file); // 부모 컴포넌트에 파일 전달
    }
  };

  return (
    <div className="relative w-fit cursor-pointer">
      <label className="relative cursor-pointer">
        <Avatar className="w-24 h-24 cursor-pointer border">
          <AvatarImage src={previewImage || imageUrl} />
          <AvatarFallback>
            <FaRegUser className="text-4xl" />
          </AvatarFallback>
        </Avatar>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <AiTwotoneSetting className="absolute bottom-0 right-0 text-2xl" />
      </label>
    </div>
  );
}
