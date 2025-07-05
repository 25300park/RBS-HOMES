"use client";

import { useEffect, useState } from 'react';
import { getActivePopups } from '@/app/(route)/(dashboard)/action';

interface PopupData {
  id: number;
  title: string;
  content: string | null;
  popupType: number; // 0: modal, 1: banner, 2: notification, 3: fullscreen
  triggerType: number; // 0: page_load, 1: time_delay, 2: scroll, 3: exit_intent
  triggerValue: string | null;
  targetAudience: string | null;
  showFrequency: number; // 0: always, 1: once, 2: daily
  useOverlay: boolean;
  buttonText: string | null;
  buttonAction: string | null;
  images: string | null;
  priority: number;
}

interface PopupManagerProps {
  userId?: number;
  userType?: 'new' | 'returning';
  deviceType?: 'mobile' | 'desktop';
  currentPath?: string;
}

const PopupManager: React.FC<PopupManagerProps> = ({
  userId,
  userType = 'new',
  deviceType = 'desktop',
  currentPath = '/',
}) => {
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [activePopup, setActivePopup] = useState<PopupData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // 쿠키 관리 함수들
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  // 팝업 데이터 가져오기 (서버 액션 사용)
  useEffect(() => {
    fetchActivePopups();
  }, []);

  // 팝업 트리거 감지
  useEffect(() => {
    if (popups.length > 0) {
      popups.forEach(popup => {
        if (shouldShowPopup(popup)) {
          triggerPopup(popup);
        }
      });
    }
  }, [popups]);

  // 활성 팝업 가져오기 (서버 액션 사용)
  const fetchActivePopups = async () => {
    try {
      const result = await getActivePopups();
      if (result.success) {
        setPopups(result.popups);
      } else {
        console.error('Failed to fetch popups:', result.error);
      }
    } catch (error) {
      console.error('Failed to fetch popups:', error);
    }
  };

  // 팝업 표시 여부 확인
  const shouldShowPopup = (popup: PopupData): boolean => {
    // 오늘 하루 열지 않기 체크 (쿠키)
    const hiddenToday = getCookie(`popup_hidden_today_${popup.id}`);
    if (hiddenToday) return false;

    // 표시 빈도 체크 (localStorage 사용)
    const shownPopups = JSON.parse(localStorage.getItem('shownPopups') || '{}');
    const today = new Date().toDateString();

    if (popup.showFrequency === 1) { // once
      if (shownPopups[popup.id]) return false;
    } else if (popup.showFrequency === 2) { // daily
      if (shownPopups[popup.id] === today) return false;
    }

    // 타겟 대상 체크
    if (popup.targetAudience === 'new_users' && userType !== 'new') return false;
    if (popup.targetAudience === 'returning_users' && userType !== 'returning') return false;
    if (popup.targetAudience === 'mobile_users' && deviceType !== 'mobile') return false;
    if (popup.targetAudience === 'desktop_users' && deviceType !== 'desktop') return false;

    return true;
  };

  // 팝업 트리거
  const triggerPopup = (popup: PopupData) => {
    switch (popup.triggerType) {
      case 0: // page_load
        showPopupByType(popup);
        break;
      case 1: // time_delay
        const delay = parseInt(popup.triggerValue || '5') * 1000;
        setTimeout(() => showPopupByType(popup), delay);
        break;
      case 2: // scroll
        setupScrollTrigger(popup);
        break;
      case 3: // exit_intent
        setupExitIntentTrigger(popup);
        break;
    }
  };

  // 팝업 타입별 표시
  const showPopupByType = (popup: PopupData) => {
    setActivePopup(popup);
    
    switch (popup.popupType) {
      case 0: // modal
        setShowModal(true);
        break;
      case 1: // banner
        setShowBanner(true);
        break;
      case 2: // notification
        setShowNotification(true);
        break;
      case 3: // fullscreen
        setShowFullscreen(true);
        break;
    }

    // 표시 기록 저장
    markPopupAsShown(popup);
  };

  // 스크롤 트리거 설정
  const setupScrollTrigger = (popup: PopupData) => {
    const scrollPercentage = parseInt(popup.triggerValue || '50');
    
    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrolled >= scrollPercentage) {
        showPopupByType(popup);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);
  };

  // 종료 의도 트리거 설정
  const setupExitIntentTrigger = (popup: PopupData) => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showPopupByType(popup);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
  };

  // 팝업 표시 기록
  const markPopupAsShown = (popup: PopupData) => {
    const shownPopups = JSON.parse(localStorage.getItem('shownPopups') || '{}');
    const today = new Date().toDateString();

    if (popup.showFrequency === 1) {
      shownPopups[popup.id] = true;
    } else if (popup.showFrequency === 2) {
      shownPopups[popup.id] = today;
    }

    localStorage.setItem('shownPopups', JSON.stringify(shownPopups));
  };

  // 팝업 닫기
  const closePopup = () => {
    setShowModal(false);
    setShowBanner(false);
    setShowNotification(false);
    setShowFullscreen(false);
    setActivePopup(null);
  };

  // 오늘 하루 열지 않기
  const hidePopupToday = () => {
    if (activePopup) {
      setCookie(`popup_hidden_today_${activePopup.id}`, 'true', 1); // 1일 동안 유지
    }
    closePopup();
  };

  // 버튼 액션 처리
  const handleButtonClick = () => {
    if (activePopup?.buttonAction) {
      if (activePopup.buttonAction.startsWith('http')) {
        window.open(activePopup.buttonAction, '_blank');
      } else {
        window.location.href = activePopup.buttonAction;
      }
    }
    closePopup();
  };

  // 이미지 파싱
  const parseImages = (imagesJson: string | null): string[] => {
    if (!imagesJson) return [];
    try {
      const images = JSON.parse(imagesJson);
      return Array.isArray(images) ? images.map(img => img.url || img) : [];
    } catch (e) {
      return [];
    }
  };

  if (!activePopup) return null;

  const images = parseImages(activePopup.images);

  return (
    <>
      {/* Modal 팝업 */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ 
            zIndex: 9999,
            backgroundColor: activePopup.useOverlay ? 'rgba(0, 0, 0, 0.5)' : 'transparent'
          }}
          onClick={activePopup.useOverlay ? closePopup : undefined}
        >
          <div 
            className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button 
              onClick={closePopup}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold z-10"
            >
              ×
            </button>
            
            {images.length > 0 ? (
              // 이미지가 있을 경우: 이미지만 표시
              <div className="">
                <img 
                  src={images[0]} 
                  alt={activePopup.title}
                  className="w-full h-auto object-cover rounded-lg"
                />
                <div className="text-center pb-3">
                  <button
                    onClick={hidePopupToday}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    오늘 하루 열지 않기
                  </button>
                </div>
              </div>
            ) : (
              // 이미지가 없을 경우: 기존 텍스트 형태
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">{activePopup.title}</h2>
                {activePopup.content && (
                  <p className="text-gray-600 mb-6">{activePopup.content}</p>
                )}
                {activePopup.buttonText && (
                  <button 
                    onClick={handleButtonClick}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-4"
                  >
                    {activePopup.buttonText}
                  </button>
                )}
                <div className="text-center">
                  <button
                    onClick={hidePopupToday}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    오늘 하루 열지 않기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Banner 팝업 */}
      {showBanner && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4"
          style={{ zIndex: 9999 }}
        >
          <div className="container mx-auto flex items-center justify-between">
            {images.length > 0 ? (
              // 이미지가 있을 경우
              <div className="flex items-center space-x-4 flex-1">
                <img 
                  src={images[0]} 
                  alt={activePopup.title}
                  className="h-12 w-auto object-cover rounded"
                />
              </div>
            ) : (
              // 이미지가 없을 경우
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="font-semibold">{activePopup.title}</h3>
                  {activePopup.content && (
                    <p className="text-sm opacity-90">{activePopup.content}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              {!images.length && activePopup.buttonText && (
                <button 
                  onClick={handleButtonClick}
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  {activePopup.buttonText}
                </button>
              )}
              <button
                onClick={hidePopupToday}
                className="text-white text-xs underline mr-2"
              >
                오늘 하루 열지 않기
              </button>
              <button 
                onClick={closePopup}
                className="text-white hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification 팝업 */}
      {showNotification && (
        <div 
          className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-sm border"
          style={{ zIndex: 9999 }}
        >
          <div className="flex justify-between items-start mb-2">
            {!images.length && (
              <h3 className="font-semibold text-gray-800">{activePopup.title}</h3>
            )}
            <button 
              onClick={closePopup}
              className="text-gray-400 hover:text-gray-600 text-lg font-bold ml-auto"
            >
              ×
            </button>
          </div>
          
          {images.length > 0 ? (
            // 이미지가 있을 경우
            <div>
              <img 
                src={images[0]} 
                alt={activePopup.title}
                className="w-full h-auto object-cover rounded"
              />
              <div className="text-center mt-2">
                <button
                  onClick={hidePopupToday}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  오늘 하루 열지 않기
                </button>
              </div>
            </div>
          ) : (
            // 이미지가 없을 경우
            <div>
              {activePopup.content && (
                <p className="text-gray-600 text-sm mb-3">{activePopup.content}</p>
              )}
              {activePopup.buttonText && (
                <button 
                  onClick={handleButtonClick}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors mb-2"
                >
                  {activePopup.buttonText}
                </button>
              )}
              <div className="text-center">
                <button
                  onClick={hidePopupToday}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  오늘 하루 열지 않기
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen 팝업 */}
      {showFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 relative">
            <button 
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
            
            {images.length > 0 ? (
              // 이미지가 있을 경우
              <div className="text-center">
                <img 
                  src={images[0]} 
                  alt={activePopup.title}
                  className="w-full h-auto object-cover rounded-lg"
                />
                <div className="mt-4">
                  <button
                    onClick={hidePopupToday}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    오늘 하루 열지 않기
                  </button>
                </div>
              </div>
            ) : (
              // 이미지가 없을 경우
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">{activePopup.title}</h2>
                {activePopup.content && (
                  <p className="text-gray-600 mb-8 text-lg">{activePopup.content}</p>
                )}
                {activePopup.buttonText && (
                  <button 
                    onClick={handleButtonClick}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg mb-4"
                  >
                    {activePopup.buttonText}
                  </button>
                )}
                <div>
                  <button
                    onClick={hidePopupToday}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    오늘 하루 열지 않기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PopupManager;