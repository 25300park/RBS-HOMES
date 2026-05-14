'use client'
import React from "react";
import { FaPlay, FaDownload, FaFile, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Home, Bed, Bath } from "lucide-react";
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
    fullAddress: string;
    price?: number;
    area?: number | string;
    bed?: number | string;
    bath?: number | string;
    admin: any;
    lastUpdate: any;
    sellType: string;
    editorContent: string;
    images: string;
    videos?: string;
    attachments?: string;
    carouselImagesContent?: string;  // 새 구조용
    projectTitle?: string;
  };
}

const PreSalePropertyInfo: React.FC<PreSalePropertyInfoProps> = ({ property }) => {
  // 기존 이미지 처리 (메인 이미지)
  const images = property.images ? (Array.isArray(property.images) ? property.images : JSON.parse(property.images)) : [];
  const mainImage = images[0];

  // 새로운 구조의 캐러셀 아이템 파싱
  const getCarouselItems = () => {
    if (!property.carouselImagesContent) return [];
    
    try {
      let parsed;
      if (typeof property.carouselImagesContent === 'string') {
        parsed = JSON.parse(property.carouselImagesContent);
      } else {
        parsed = property.carouselImagesContent;
      }
      
      // 배열인지 확인하고, 아니면 빈 배열 반환
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing carousel items:', error);
      return [];
    }
  };

  // 새로운 구조의 비디오 아이템 파싱
  const getVideoItems = () => {
    if (!property.videos) return [];
    
    try {
      let parsed;
      if (typeof property.videos === 'string') {
        parsed = JSON.parse(property.videos);
      } else {
        parsed = property.videos;
      }
      
      // 배열인지 확인하고, 아니면 빈 배열 반환
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing video items:', error);
      return [];
    }
  };

  // 새로운 구조의 파일 아이템 파싱
  const getFileItems = () => {
    if (!property.attachments) return [];
    
    try {
      let parsed;
      if (typeof property.attachments === 'string') {
        parsed = JSON.parse(property.attachments);
      } else {
        parsed = property.attachments;
      }
      
      // 배열인지 확인하고, 아니면 빈 배열 반환
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing file items:', error);
      return [];
    }
  };

  const carouselItems = getCarouselItems();
  const videoItems = getVideoItems();
  const fileItems = getFileItems();

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
              {property.projectTitle || property.title}
            </h2>
            <div className="flex flex-col">
              <p className="text-gray-600 mt-1 text-md md:text-sm">
                {property.fullAddress}
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
              <div className="flex flex-col min-w-[80px]">
                <div className="text-gray-500 text-xs font-medium mb-1">Area</div>
                <div className="flex items-center gap-1">
                  <Home className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-800">{property.area} sqm</span>
                </div>
              </div>
            )}
            
            {(property.bed !== undefined && property.bed !== null) && (
              <div className="flex flex-col min-w-[80px]">
                <div className="text-gray-500 text-xs font-medium mb-1">Bedrooms</div>
                <div className="flex items-center gap-1">
                  <Bed className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-800">
                    {property.bed === 0 || property.bed === '0' ? 'Studio' : property.bed}
                  </span>
                </div>
              </div>
            )}
            
            {(property.bath !== undefined && property.bath !== null) && (
              <div className="flex flex-col min-w-[80px]">
                <div className="text-gray-500 text-xs font-medium mb-1">Bathrooms</div>
                <div className="flex items-center gap-1">
                  <Bath className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-800">{property.bath}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 프로젝트 설명 에디터 콘텐츠 - custom-prose 클래스 추가 */}
          <div className="py-6">
            <div 
              className="custom-prose prose max-w-none prose-table:border-collapse prose-table:w-full prose-table:my-5 prose-table:bg-white prose-table:rounded-lg prose-table:shadow-sm prose-td:border prose-td:border-gray-200 prose-td:p-3 prose-th:border prose-th:border-gray-200 prose-th:p-3 prose-th:bg-gray-50 prose-th:font-semibold prose-img:rounded-lg prose-img:shadow-md prose-p:my-4 prose-headings:text-gray-900 prose-headings:font-semibold prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-4 prose-blockquote:my-5 prose-blockquote:italic prose-blockquote:text-gray-600 prose-a:text-orange-600 prose-a:underline hover:prose-a:text-orange-800 prose-strong:font-semibold prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
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

          {/* 동적 캐러셀 섹션들 */}
          {Array.isArray(carouselItems) && carouselItems.length > 0 && carouselItems.map((carousel: any, carouselIndex: number) => (
            <div key={carousel.id || carouselIndex} className="py-6">
              {/* 캐러셀 제목 */}
              {carousel.title && (
                <h3 className="text-xl font-medium text-gray-800 mb-6">{carousel.title}</h3>
              )}
              
              {/* 캐러셀 이미지들 */}
              {carousel.images && carousel.images.length > 0 && (
                <div className="relative">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    slidesPerGroup={1}
                    centeredSlides={true}
                    loop={false}
                    navigation={{
                      nextEl: `.swiper-button-next-custom-${carouselIndex}`,
                      prevEl: `.swiper-button-prev-custom-${carouselIndex}`,
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
                    {carousel.images.map((imageUrl: string, index: number) => (
                      <SwiperSlide key={index} className="!w-full">
                        <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-md">
                          <Image
                            src={imageUrl}
                            alt={`${carousel.title || 'Gallery'} image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  
                  {/* 커스텀 네비게이션 버튼 */}
                  <button className={`swiper-button-prev-custom-${carouselIndex} absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all`}>
                    <FaChevronLeft className="text-gray-700 text-lg" />
                  </button>
                  <button className={`swiper-button-next-custom-${carouselIndex} absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all`}>
                    <FaChevronRight className="text-gray-700 text-lg" />
                  </button>
                </div>
              )}

              {/* 캐러셀 설명 - custom-prose 클래스 추가 */}
              {carousel.description && (
                <div className="mb-6">
                  <div 
                    className="custom-prose prose max-w-none prose-table:border-collapse prose-table:w-full prose-table:my-5 prose-table:bg-white prose-table:rounded-lg prose-table:shadow-sm prose-td:border prose-td:border-gray-200 prose-td:p-3 prose-th:border prose-th:border-gray-200 prose-th:p-3 prose-th:bg-gray-50 prose-th:font-semibold prose-img:rounded-lg prose-img:shadow-md prose-p:my-4 prose-headings:text-gray-900 prose-headings:font-semibold prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-4 prose-blockquote:my-5 prose-blockquote:italic prose-blockquote:text-gray-600 prose-a:text-orange-600 prose-a:underline hover:prose-a:text-orange-800 prose-strong:font-semibold prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
                    style={{
                      fontSize: '16px',
                      lineHeight: '1.6',
                      color: '#374151'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: carousel.description 
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* 동적 비디오 섹션들 */}
          {Array.isArray(videoItems) && videoItems.length > 0 && videoItems.map((video: any, videoIndex: number) => (
            <div key={video.id || videoIndex} className="py-6">
              {/* 비디오 제목 */}
              {video.title && (
                <h3 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                  <FaPlay className="mr-3 text-orange-600" />
                  {video.title}
                </h3>
              )}
              
              {/* 비디오 설명 - custom-prose 클래스 추가 */}
              {video.description && (
                <div className="mb-6">
                  <div 
                    className="custom-prose prose max-w-none prose-table:border-collapse prose-table:w-full prose-table:my-5 prose-table:bg-white prose-table:rounded-lg prose-table:shadow-sm prose-td:border prose-td:border-gray-200 prose-td:p-3 prose-th:border prose-th:border-gray-200 prose-th:p-3 prose-th:bg-gray-50 prose-th:font-semibold prose-img:rounded-lg prose-img:shadow-md prose-p:my-4 prose-headings:text-gray-900 prose-headings:font-semibold prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-4 prose-blockquote:my-5 prose-blockquote:italic prose-blockquote:text-gray-600 prose-a:text-orange-600 prose-a:underline hover:prose-a:text-orange-800 prose-strong:font-semibold prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
                    style={{
                      fontSize: '16px',
                      lineHeight: '1.6',
                      color: '#374151'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: video.description 
                    }}
                  />
                </div>
              )}

              {/* 비디오 플레이어 */}
              {video.videoUrl && (
                <div className="border">
                  <video 
                    controls 
                    className="w-full h-[400px] object-cover"
                    poster="/api/placeholder/400/200"
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>
          ))}

          {/* 동적 파일 섹션들 */}
          {Array.isArray(fileItems) && fileItems.length > 0 && fileItems.map((file: any, fileIndex: number) => (
            <div key={file.id || fileIndex} className="py-6">
              {/* 파일 제목 */}
              {file.title && (
                <h3 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                  <FaDownload className="mr-3 text-orange-600" />
                  {file.title}
                </h3>
              )}
              
              {/* 파일 설명 - custom-prose 클래스 추가 */}
              {file.description && (
                <div className="mb-6">
                  <div 
                    className="custom-prose prose max-w-none prose-table:border-collapse prose-table:w-full prose-table:my-5 prose-table:bg-white prose-table:rounded-lg prose-table:shadow-sm prose-td:border prose-td:border-gray-200 prose-td:p-3 prose-th:border prose-th:border-gray-200 prose-th:p-3 prose-th:bg-gray-50 prose-th:font-semibold prose-img:rounded-lg prose-img:shadow-md prose-p:my-4 prose-headings:text-gray-900 prose-headings:font-semibold prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-4 prose-blockquote:my-5 prose-blockquote:italic prose-blockquote:text-gray-600 prose-a:text-orange-600 prose-a:underline hover:prose-a:text-orange-800 prose-strong:font-semibold prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
                    style={{
                      fontSize: '16px',
                      lineHeight: '1.6',
                      color: '#374151'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: file.description 
                    }}
                  />
                </div>
              )}

              {/* 파일 다운로드 */}
              {file.fileUrl && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {getFileIcon(file.fileUrl)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {file.fileName || getFileNameFromUrl(file.fileUrl)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {file.mimeType && `${file.mimeType} • `}
                          {file.size && `${(file.size / 1024 / 1024).toFixed(2)}MB • `}
                          Click to download
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(file.fileUrl, '_blank')}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                    >
                      <FaDownload className="text-sm" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* <style jsx> 태그 완전 제거 */}
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