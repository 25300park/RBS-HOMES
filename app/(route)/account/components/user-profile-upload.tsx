import React, { useState } from "react";
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";
import { AiTwotoneSetting } from "react-icons/ai";

interface UserProfileAvatarProps {
  admin: any;
}

export default function UserProfileAvatar({ admin }: UserProfileAvatarProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file)); // 미리보기 설정
    }
  };

  return (
    <div className="relative w-fit cursor-pointer">
      {/* Avatar */}
      <label className="relative cursor-pointer">
        <Avatar className="w-24 h-24 cursor-pointer border">
          <AvatarImage
            src={previewImage || admin.image}
          />
          <AvatarFallback>
            <FaRegUser className="text-4xl" />
          </AvatarFallback>
        </Avatar>

        {/* 파일 업로드 input */}
        <input
          type="file"
          accept="image/*"
          className="hidden" // input을 화면에서 숨김
          onChange={handleImageChange}
        />

        {/* + 아이콘 (우측 하단) */}
        <AiTwotoneSetting className="absolute bottom-0 right-0 text-2xl" />
      </label>
    </div>
  );
}
