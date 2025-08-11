'use client'
import React from "react";
import { FaPlay, FaDownload, FaFile, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getRelativeTime } from "@/lib/utils";
import StickyBox from "./sticky-box";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from "next/image";
import StickyBoxPresale from "./sticky-box-prsale";

interface PreSalePropertyInfoProps {
  property: {
    id: number;
    title: string;
    address2: string;
    address3: string;
    address4: string;
    fullAdress: string;
    price?: number;
    area?: number | string;    // 면적 정보 추가
    bed?: number | string;     // 침실 정보 추가
    bath?: number | string;    // 욕실 정보 추가
    admin: any;
    lastUpdate: any;
    sellType: string;
    editorContent: string;
    videoDescriptionContent?: string; // 비디오 설명 에디터 내용
    carouselImagesContent?: string;   // 캐러셀 이미지 설명 에디터 내용
    images: string;
    videos?: string;
    attachments?: string;
    projectTitle?: string;
  };
}

const PreSalePropertyInfo: React.FC<PreSalePropertyInfoProps> = ({ property }) => {
  // 데이터 파싱
  const videos = property.videos ? JSON.parse(property.videos) : [];
  const attachments = property.attachments ? JSON.parse(property.attachments) : [];
  const images = property.images ? JSON.parse(property.images) : [];
  
  // 메인 이미지와 나머지 이미지 분리
  const mainImage = images[0];
  const galleryImages = images.slice(1);

  // URL에서 파일명 추출
  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return decodeURIComponent(fileName);
    } catch (error) {
      return 'Download File';
    }
  };

  // 파일 확장자에 따른 아이콘
  const getFileIcon = (url: string): JSX.Element => {
    const fileName = getFileNameFromUrl(url);
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const iconClass = "text-xl";
    
    switch (extension) {
      case 'pdf':
        return <FaFile className={`${iconClass} text-red-500`} />;
      case 'doc':
      case 'docx':
        return <FaFile className={`${iconClass} text-orange-500`} />;
      case 'xls':
      case 'xlsx':
        return <FaFile className={`${iconClass} text-green-500`} />;
      default:
        return <FaFile className={`${iconClass} text-gray-500`} />;
    }
  };

  return (
    <div className="mb-6 space-y-0 xl:px-2 md:space-y-0">
      {/* 상단 헤더 정보 */}
      <section className="border-b pb-2 mb-3">
        <div className="flex w-full items-center justify-between md:p-4 md:space-y-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-900">
              {property.projectTitle}
            </h2>
            <div className="flex flex-col">
              <p className="text-gray-600 mt-1 text-md md:text-sm">
                {property.fullAdress}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400 md: mt-2">
            last updated at {getRelativeTime(property.lastUpdate)}
          </div>
        </div>
      </section>

      <section className="flex h-full justify-between gap-10 md:px-4">
        {/* 좌측 에디터 영역 */}
        <div className="flex flex-col max-w-[65%] w-full md:max-w-full">
          
          {/* 프로젝트 스펙 정보 */}
          <div className="flex gap-6">
            {property.area && (
              <div className="flex flex-col  min-w-[80px]">
                <div className="text-gray-500 text-xs font-medium mb-1">Area</div>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 " fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/>
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">{property.area} sqm</span>
                </div>
              </div>
            )}
            
            {property.bed && (
              <div className="flex flex-col  min-w-[80px]">
                <div className="text-gray-500 text-xs font-medium mb-1">Bedrooms</div>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 " fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 10.78V8c0-1.65-1.35-3-3-3h-4c-.77 0-1.47.3-2 .78-.53-.48-1.23-.78-2-.78H6c-1.65 0-3 1.35-3 3v2.78c-.61.55-1 1.34-1 2.22v6h2v-2h16v2h2v-6c0-.88-.39-1.67-1-2.22zM14 7h4c.55 0 1 .45 1 1v2H14V7zM5 8c0-.55.45-1 1-1h4v3H5V8zm15 5v2H4v-2c0-.55.45-1 1-1h14c.55 0 1 .45 1 1z"/>
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">{property.bed}</span>
                </div>
              </div>
            )}
            
            {property.bath && (
              <div className="flex flex-col  min-w-[80px]">
                <div className="text-gray-500 text-xs font-medium mb-1">Bathrooms</div>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 " fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 2v1h6V2h2v1h1c1.1 0 2 .9 2 2v1H4V5c0-1.1.9-2 2-2h1V2h2zm-5 5h16v13c0 .55-.45 1-1 1H5c-.55 0-1-.45-1-1V7zm2 2v9h2V9H6zm4 0v9h2V9h-2zm4 0v9h2V9h-2z"/>
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">{property.bath}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 프로젝트 설명 에디터 콘텐츠 */}
          <div className="py-8 border-b">
            <h3 className="text-xl font-medium text-gray-800 mb-6">Project Description</h3>
            <div 
              className="prose max-w-none prose-table:border-collapse prose-table:w-full prose-table:my-5 prose-table:bg-white prose-table:rounded-lg prose-table:shadow-sm prose-td:border prose-td:border-gray-200 prose-td:p-3 prose-th:border prose-th:border-gray-200 prose-th:p-3 prose-th:bg-gray-50 prose-th:font-semibold prose-img:rounded-lg prose-img:shadow-md prose-p:my-4 prose-headings:text-gray-900 prose-headings:font-semibold prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-4 prose-blockquote:my-5 prose-blockquote:italic prose-blockquote:text-gray-600 prose-a:text-orange-600 prose-a:underline hover:prose-a:text-orange-800 prose-strong:font-semibold prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
              style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#374151'
              }}
              dangerouslySetInnerHTML={{ 
                __html: property.editorContent 
              }}
            />
          </div>

          {/* 이미지 갤러리 스와이퍼 */}
          {galleryImages.length > 0 && (
            <div className="py-8 border-b">
              <h3 className="text-xl font-medium text-gray-800 mb-6">Project Gallery</h3>
              
              {/* 캐러셀 이미지 설명 에디터 콘텐츠 */}
              {property.carouselImagesContent && (
                <div className="mb-6">
                  <div 
                    className="prose max-w-none prose-table:border-collapse prose-table:w-full prose-table:my-5 prose-table:bg-white prose-table:rounded-lg prose-table:shadow-sm prose-td:border prose-td:border-gray-200 prose-td:p-3 prose-th:border prose-th:border-gray-200 prose-th:p-3 prose-th:bg-gray-50 prose-th:font-semibold prose-img:rounded-lg prose-img:shadow-md prose-p:my-4 prose-headings:text-gray-900 prose-headings:font-semibold prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-4 prose-blockquote:my-5 prose-blockquote:italic prose-blockquote:text-gray-600 prose-a:text-orange-600 prose-a:underline hover:prose-a:text-orange-800 prose-strong:font-semibold prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
                    style={{
                      fontSize: '16px',
                      lineHeight: '1.6',
                      color: '#374151'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: property.carouselImagesContent 
                    }}
                  />
                </div>
              )}

              <div className="relative">
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={0}
                  slidesPerView={1}
                  slidesPerGroup={1}
                  centeredSlides={true}
                  loop={false}
                  navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                  }}
                  pagination={{ 
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet !bg-orange-600',
                    bulletActiveClass: 'swiper-pagination-bullet-active !bg-orange-800'
                  }}
                  breakpoints={{
                    0: {
                      slidesPerView: 1,
                      spaceBetween: 0,
                    },
                    640: {
                      slidesPerView: 1,
                      spaceBetween: 0,
                    },
                    768: {
                      slidesPerView: 1,
                      spaceBetween: 0,
                    },
                    1024: {
                      slidesPerView: 1,
                      spaceBetween: 0,
                    },
                  }}
                  className="gallery-swiper w-full"
                >
                  {galleryImages.map((imageUrl: string, index: number) => (
                    <SwiperSlide key={index} className="!w-full">
                      <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-md">
                        <Image
                          src={imageUrl}
                          alt={`Gallery image ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                
                {/* 커스텀 네비게이션 버튼 */}
                <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all">
                  <FaChevronLeft className="text-gray-700 text-lg" />
                </button>
                <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all">
                  <FaChevronRight className="text-gray-700 text-lg" />
                </button>
              </div>
            </div>
          )}

          {/* 프로젝트 비디오 */}
          {videos.length > 0 && (
            <div className="py-8 border-b">
              <h3 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                <FaPlay className="mr-3 text-orange-600" />
                Project Videos
              </h3>
              
              {/* 비디오 설명 에디터 콘텐츠 */}
              {property.videoDescriptionContent && (
                <div className="mb-6">
                  <div 
                    className="prose max-w-none prose-table:border-collapse prose-table:w-full prose-table:my-5 prose-table:bg-white prose-table:rounded-lg prose-table:shadow-sm prose-td:border prose-td:border-gray-200 prose-td:p-3 prose-th:border prose-th:border-gray-200 prose-th:p-3 prose-th:bg-gray-50 prose-th:font-semibold prose-img:rounded-lg prose-img:shadow-md prose-p:my-4 prose-headings:text-gray-900 prose-headings:font-semibold prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-4 prose-blockquote:my-5 prose-blockquote:italic prose-blockquote:text-gray-600 prose-a:text-orange-600 prose-a:underline hover:prose-a:text-orange-800 prose-strong:font-semibold prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
                    style={{
                      fontSize: '16px',
                      lineHeight: '1.6',
                      color: '#374151'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: property.videoDescriptionContent 
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((videoUrl: string, index: number) => (
                  <div key={index} className="border">
                    <video 
                      controls 
                      className="w-full h-[400px] object-cover"
                      poster="/api/placeholder/400/200"
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 파일 첨부 */}
          {attachments.length > 0 && (
            <div className="py-8">
              <h3 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                <FaDownload className="mr-3 text-orange-600" />
                Documents & Files
              </h3>
              <div className="space-y-3">
                {attachments.map((fileUrl: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {getFileIcon(fileUrl)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getFileNameFromUrl(fileUrl)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Click to download
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(fileUrl, '_blank')}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                    >
                      <FaDownload className="text-sm" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 에디터 콘텐츠 스타일링 */}
          <style jsx>{`
            .prose :global(table) {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: #fff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .prose :global(table td),
            .prose :global(table th) {
              border: 1px solid #e5e7eb;
              padding: 12px 16px;
              text-align: left;
              vertical-align: top;
            }
            .prose :global(table th) {
              background-color: #f9fafb;
              font-weight: 600;
              color: #374151;
            }
            .prose :global(table tr:nth-child(even)) {
              background-color: #f9fafb;
            }
            .prose :global(table tr:hover) {
              background-color: #f3f4f6;
            }
            .prose :global(img) {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 16px 0;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .prose :global(p) {
              margin: 16px 0;
            }
            .prose :global(h1), .prose :global(h2), .prose :global(h3), 
            .prose :global(h4), .prose :global(h5), .prose :global(h6) {
              margin: 24px 0 12px 0;
              color: #1f2937;
              font-weight: 600;
            }
            .prose :global(ul), .prose :global(ol) {
              margin: 16px 0;
              padding-left: 24px;
            }
            .prose :global(li) {
              margin: 8px 0;
            }
            .prose :global(blockquote) {
              border-left: 4px solid #3b82f6;
              padding-left: 16px;
              margin: 20px 0;
              font-style: italic;
              color: #6b7280;
            }
            .prose :global(a) {
              color: #3b82f6;
              text-decoration: underline;
            }
            .prose :global(a:hover) {
              color: #1d4ed8;
            }
            .prose :global(strong) {
              font-weight: 600;
              color: #1f2937;
            }
            .prose :global(em) {
              font-style: italic;
            }
            .prose :global(code) {
              background-color: #f3f4f6;
              padding: 2px 4px;
              border-radius: 4px;
              font-size: 0.9em;
            }
          `}</style>
        </div>

        {/* 우측 StickyBox */}
        <StickyBoxPresale
          price={property.price}
          sellType={property.sellType}
          unitId={property.id}
        />
      </section>
    </div>
  );
};

export default PreSalePropertyInfo;