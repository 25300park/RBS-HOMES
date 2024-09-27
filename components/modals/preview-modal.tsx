"use client";

import React, { useState } from "react";

interface PreviewModalProps {
  onClose: () => void;
  modalProps?: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ onClose, modalProps }) => {
  console.log(modalProps)
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageDimensions({
      width: naturalWidth,
      height: naturalHeight,
    });
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Preview Image</h3>
    
        <div className="w-full">
          <img
            src={modalProps}
            alt="Preview"
            onLoad={handleImageLoad}
            // style={{
            //   width: imageDimensions ? `${imageDimensions.width}px` : "auto",
            //   height: imageDimensions ? `${imageDimensions.height}px` : "auto",
            // }}
          />
          {/* <div className="text-sm text-gray-700">
            <p>
              <strong>File Name:</strong> {modalProps.imageName}
            </p>
            <p>
              <strong>File Size:</strong> {modalProps.imageSize}
            </p>
            <p>
              <strong>File Type:</strong> {modalProps.imageType}
            </p>
            {imageDimensions && (
              <p>
                <strong>Image Dimensions:</strong> {imageDimensions.width}x
                {imageDimensions.height} px
              </p>
            )}
          </div> */}
        </div>
    </div>
  );
};

export default PreviewModal;
