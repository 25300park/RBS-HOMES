"use client";

import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';

const PWASplashScreen = () => {
  const [showSplash, setShowSplash] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // PWA 환경 감지
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    
    // PWA에서만 스플래시 화면 표시
    if (!isPWA) return;

    // 이미 스플래시를 본 적이 있는지 확인 (세션 단위)
    const hasSeenSplash = sessionStorage.getItem('pwa-splash-shown');
    if (hasSeenSplash) return;

    setShowSplash(true);

    // 진행 바 애니메이션
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // 스플래시 완료 후 페이드아웃
          setTimeout(() => {
            setShowSplash(false);
            sessionStorage.setItem('pwa-splash-shown', 'true');
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150); // 1.5초 동안 로딩

    return () => clearInterval(progressInterval);
  }, []);

  if (!showSplash) return null;

  return (
    <div className="fixed inset-0 bg-white z-[99999] flex flex-col items-center justify-center">
      {/* 로고 */}
      <div className="mb-8 text-center">
        <div className="mb-6 mx-auto w-20 h-20">
          <img 
            src='/pwaicons/icon-192x192.png' 
            className='w-full h-full rounded-xl shadow-lg' 
            alt='RBS Homes Logo'
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">RBS Homes</h1>
        <p className="text-gray-600">Find your perfect home</p>
      </div>

      {/* 로딩 바 */}
      <div className="w-64 bg-gray-200 rounded-full h-1 mb-4">
        <div 
          className="bg-orange-500 h-1 rounded-full transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 로딩 텍스트 */}
      <div className="text-sm text-gray-500">
        {progress < 30 && "Initializing..."}
        {progress >= 30 && progress < 60 && "Loading properties..."}
        {progress >= 60 && progress < 90 && "Setting up map..."}
        {progress >= 90 && "Almost ready!"}
      </div>

      {/* 버전 정보 */}
      <div className="absolute bottom-8 text-xs text-gray-400">
        Version 1.0.0
      </div>
    </div>
  );
};

export default PWASplashScreen;