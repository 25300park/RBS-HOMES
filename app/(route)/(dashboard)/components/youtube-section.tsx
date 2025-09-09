'use client'

import React, { useState } from 'react';
import { Play, X, Clock, Eye } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

const YouTubeSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const videos = [
    {
      id: '9ICzsxYrenM',
      title: 'How to find a happy home',
      description: 'rbs-homes.com',
      duration: '0:20',
      views: '12K'
    },
    {
      id: 'XMpwY8Z_EqY', 
      title: 'Are real estate contracts complicated?',
      description: 'We will kindly assist you with the complex real estate contract process.',
      duration: '0:21',
      views: '28K'
    },
    {
      id: 'eVtQxKZmt_w', 
      title: 'How to Search for a Condo with a Pet',
      description: 'rbs-homes.com',
      duration: '0:21',
      views: '15K'
    }
  ];

  const openVideo = (video: any) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className=" py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className='video-section-pc'>
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Featured Property Videos
            </h2>
            <p className="text-gray-600">
              Explore our exclusive property showcases and expert insights to help you make informed decisions
            </p>
          </div>
        </div>
        <div className='video-section-mobile'>
          <div className=" mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
              Featured Property Videos
            </h2>
            <p className="text-gray-600 text-center">
              Explore our exclusive property showcases and expert insights to help you make informed decisions
            </p>
          </div>
        </div>

        {/* Video Grid */}
        <div className='video-section-pc'>
          <div className="grid grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <div 
                key={video.id}
                className="bg-white rounded-xl overflow-hidden shadow-md cursor-pointer group"
                onClick={() => openVideo(video)}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video overflow-hidden bg-gray-200">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.src = 'https://via.placeholder.com/640x360/f97316/ffffff?text=Property+Video';
                    }}
                  />
                  
                  {/* Simple Play Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{video.duration}</span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  
                  {/* Stats */}
                  {/* <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{video.views} views</span>
                    </div>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='video-section-mobile'>
          <div className="max-w-6xl mx-auto">
            <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              className="area-banner-swiper"
              loop={false}
            >
              <SwiperSlide>
                {videos.map((video, index) => (
                  <div 
                    key={video.id}
                    className=" bg-white rounded-xl grid grid-cols-2 shadow-md cursor-pointer mt-4"
                    onClick={() => openVideo(video)}
                  >
                    {/* Thumbnail Container */}
                    <div className="relative aspect-video overflow-hidden bg-gray-200">
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.src = 'https://via.placeholder.com/640x360/f97316/ffffff?text=Property+Video';
                        }}
                      />
                      
                      {/* Simple Play Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{video.duration}</span>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {video.description}
                      </p>
                      
                      {/* Stats */}
                      {/* <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{video.views} views</span>
                        </div>
                      </div> */}
                    </div>
                  </div>
                ))}
            </SwiperSlide>
            </Swiper>
            
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-24">
            <iframe src='https://widgets.sociablekit.com/google-reviews/iframe/25581582' frameborder='0' width='100%' height='600px'></iframe>
        </div>

      </div>

      {/* YouTube Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeVideo}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* YouTube Embed */}
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeSection;