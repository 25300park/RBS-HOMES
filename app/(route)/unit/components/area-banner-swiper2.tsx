// components/area-banner-swiper.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import { getAreaBanners } from "../../unit/action";

interface AreaBannerSwiperProps {
  unitCity?: string;
  unitAddress?: string;
}

const AreaBannerSwiper: React.FC<AreaBannerSwiperProps> = ({ unitCity, unitAddress }) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      if (!unitCity && !unitAddress) {
        setIsLoading(false);
        return;
      }
      try {
        const result = await getAreaBanners(unitCity, unitAddress);
        if (result.status === 200) {
          setBanners(result.banners || []);
        }
      } catch (error) {
        console.error("Failed to fetch area banners:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [unitCity, unitAddress]);

 return  (
    <>
    <div className="max-w-6xl mx-auto p-5">
        <div className="swiper-gallery-dekstop">
            <div className="overflow-hidden rounded-xl bg-white shadow-md md:max-w-2xl mt-6">
                <div className="lg:flex">
                    <div className="md:shrink-0">
                        <Swiper
                            modules={[Pagination, Autoplay]}
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            loop={banners.length > 1}
                            className="area-banner-swiper"
                            >
                            
                                <SwiperSlide>
                                    <img 
                                        className="object-cover md:h-full h-96 w-full max-w-full md:w-36 sm:w-24"
                                        src="https://mrhomes2024.s3.ap-southeast-1.amazonaws.com/29/20250324073734533Z_bgc_avida_towers_34th_st_1740040847_763bae8a_progressive.jpg"
                                    />
                                    <div className="p-5">
                                    <h3 className="mt-1 block text-lg leading-tight font-medium text-black hover:underline">
                                        Avida Tower 1
                                    </h3>
                                    <p className="mt-2 text-gray-500">
                                        BGC, Avida Towers_CB297 1 Bedroom 37 sqm Fully furnished 35k Monthly 1mos..
                                    </p>
                                    </div>
                                </SwiperSlide>

                                <SwiperSlide>
                                    <img 
                                        className="object-cover md:h-full h-96 w-full max-w-full md:w-36 sm:w-24"
                                        src="https://mrhomes2024.s3.ap-southeast-1.amazonaws.com/29/20250324073734531Z_bgc_avida_towers_34th_st_1740040847_82e5e302_progressive.jpg"
                                    />
                                    <div className="p-5">
                                    <h3 className="mt-1 block text-lg leading-tight font-medium text-black hover:underline">
                                        Avida Tower 2
                                    </h3>
                                    <p className="mt-2 text-gray-500">
                                        BGC, Avida Towers_CB297 1 Bedroom 37 sqm Fully furnished 35k Monthly 1mos..
                                    </p>
                                    </div>
                                </SwiperSlide>
                            
                        </Swiper>
                    </div>
                </div>
            </div>
        </div>

        <div className="swiper-gallery-mobile">
            <div className="overflow-hidden rounded-xl bg-white shadow-md md:max-w-2xl">
                <Swiper
                    modules={[Pagination, Autoplay]}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    loop={banners.length > 1}
                    className="area-banner-swiper"
                >
                    <div className="md:shrink-0">
                    <SwiperSlide>
                        <img 
                            className="h-full w-full object-cover md:h-full"
                            src="https://mrhomes2024.s3.ap-southeast-1.amazonaws.com/29/20250324073734528Z_bgc_avida_towers_34th_st_1740040847_0e156592_progressive.jpg"
                        />
                        <div className="p-5">
                            <div className="mt-1 block text-lg leading-tight font-medium text-black hover:underline">
                                Avida Tower 1
                            </div>
                                <p className="mt-2 text-gray-500">
                                    BGC, Avida Towers_CB297 1 Bedroom 37 sqm Fully furnished 35k Monthly 1mos..
                                </p>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <img 
                            className="h-full w-full object-cover md:h-full"
                            src="https://mrhomes2024.s3.ap-southeast-1.amazonaws.com/29/20250324073734531Z_bgc_avida_towers_34th_st_1740040847_82e5e302_progressive.jpg"
                        />
                        <div className="p-5">
                            <div className="mt-1 block text-lg leading-tight font-medium text-black hover:underline">
                                Avida Tower 2
                            </div>
                                <p className="mt-2 text-gray-500">
                                    BGC, Avida Towers_CB297 1 Bedroom 37 sqm Fully furnished 35k Monthly 1mos..
                                </p>
                        </div>
                    </SwiperSlide>
                    </div>
                </Swiper>
            </div>
        </div>
    </div>
    </>
  )
}
export default AreaBannerSwiper;