'use client'

import React from "react";
import { FaShareAlt } from "react-icons/fa";

const ShareButton: React.FC = () => {
  const handleShare = () => {
    // 공유하기 기능 로직 (예: navigator.share)
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this property!",
          text: "Here is an amazing property for sale.",
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.error("Error sharing", error));
    } else {
      alert("Your browser doesn't support sharing.");
    }
  };

  return (
    <button onClick={handleShare} className="text-gray-500 hover:text-[#0CB8C5]">
      <FaShareAlt size={20} />
    </button>
  );
};

export default ShareButton;
