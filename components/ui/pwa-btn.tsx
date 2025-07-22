"use client";

import { useState, useEffect } from 'react';
import { Download, X, Share, AlertTriangle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// 다국어 지원
const translations = {
  en: {
    title: 'Install RBS Homes App',
    subtitle: {
      androidAuto: 'Tap to install instantly!',
      iosSafari: 'Add to your home screen',
      desktop: 'Get quick access'
    },
    installButton: 'Install Now',
    installButtonDefault: 'Install',
    gotIt: 'Got it!',
    iosChrome: {
      alert: '🚫 PWA installation is not supported in iOS Chrome.\n\nPlease use Safari browser!'
    },
    instructions: {
      iosSafari: [
        'Tap the Share button (□↗) at the bottom',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to install'
      ],
      androidChrome: {
        failed: 'Auto-install failed',
        subtitle: 'Please install manually:',
        steps: [
          'Tap the three dots menu at the top right',
          'Look for "Install app" or "Add to home screen"',
          'Tap "Install"'
        ]
      },
      desktop: {
        text: 'Look for the Install button in your browser address bar',
        subtitle: 'Usually appears as a download icon or plus (+) symbol'
      }
    }
  },
  ko: {
    title: 'RBS Homes 앱 설치',
    subtitle: {
      androidAuto: '탭하여 즉시 설치',
      iosSafari: '홈 화면에 추가하기',
      desktop: '빠른 액세스'
    },
    installButton: '지금 설치',
    installButtonDefault: '설치',
    gotIt: '확인',
    iosChrome: {
      alert: '🚫 iOS Chrome에서는 PWA 설치가 지원되지 않습니다.\n\nSafari 브라우저를 사용해주세요!'
    },
    instructions: {
      iosSafari: [
        '하단의 공유 버튼 (□↗) 탭',
        '아래로 스크롤하여 "홈 화면에 추가" 탭',
        '"추가" 탭하여 설치'
      ],
      androidChrome: {
        failed: '자동 설치가 실패했습니다',
        subtitle: '수동으로 설치해주세요:',
        steps: [
          '우상단 점 3개 메뉴 탭',
          '"앱 설치" 또는 "홈 화면에 추가" 탭',
          '"설치" 탭'
        ]
      },
      desktop: {
        text: '브라우저 주소창의 설치 버튼을 찾아보세요',
        subtitle: '보통 다운로드 아이콘이나 플러스(+) 기호로 나타납니다'
      }
    }
  }
};

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [platform, setPlatform] = useState<'ios-safari' | 'ios-chrome' | 'android-chrome' | 'desktop' | 'other'>('other');
  const [showInstructions, setShowInstructions] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ko'>('en');

  useEffect(() => {
    // 언어 감지
    const detectLanguage = (): 'en' | 'ko' => {
      const browserLang = navigator.language || navigator.languages[0];
      return browserLang.startsWith('ko') ? 'ko' : 'en';
    };

    setLanguage(detectLanguage());

    // 모바일 여부 먼저 확인
    const isMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isMobileUA = /mobile/.test(userAgent);
      
      return isIOS || isAndroid || isMobileUA || window.innerWidth <= 768;
    };

    // 모바일이 아니면 아예 표시하지 않음
    if (!isMobile()) {
      return;
    }

    // 정확한 플랫폼 감지 (모바일만)
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isSafari = isIOS && /safari/.test(userAgent) && !/crios|fxios/.test(userAgent);
      const isIOSChrome = isIOS && /crios/.test(userAgent);
      const isAndroidChrome = isAndroid && /chrome/.test(userAgent) && !/edg/.test(userAgent);

      if (isSafari) return 'ios-safari';
      if (isIOSChrome) return 'ios-chrome';
      if (isAndroidChrome) return 'android-chrome';
      return 'other';
    };

    const currentPlatform = detectPlatform();
    setPlatform(currentPlatform);

    // PWA 이미 설치되었는지 확인
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      return;
    }

    // beforeinstallprompt 이벤트 처리 (Android Chrome, Desktop에서만 발생)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 플랫폼별 배너 표시 결정 (모바일만)
    const timer = setTimeout(() => {
      if (currentPlatform === 'ios-safari') {
        setShowBanner(true); // Safari에서는 수동 설치 가능
      } else if (currentPlatform === 'ios-chrome') {
        // iOS Chrome에서는 PWA 설치 불가능하므로 배너 표시 안 함
        setShowBanner(false);
      } else if (currentPlatform === 'android-chrome') {
        // Android Chrome은 beforeinstallprompt 이벤트 기다림
        if (!deferredPrompt) {
          setShowBanner(true); // 이벤트가 없어도 수동 안내 제공
        }
      } else {
        setShowBanner(true); // 기타 모바일 플랫폼
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const t = translations[language];

  // Android Chrome 원클릭 설치
  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setShowBanner(false);
        setDeferredPrompt(null);
        // 성공하면 여기서 끝! 수동 안내 불필요
      } catch (error) {
        // 자동 설치 실패 시에만 수동 안내
        setShowInstructions(true);
      }
    } else {
      // deferredPrompt가 없는 경우에만 수동 안내
      setShowInstructions(true);
    }
  };

  // 플랫폼별 설치 처리
  const handleInstall = () => {
    if (platform === 'android-chrome' && deferredPrompt) {
      handleAndroidInstall(); // 원클릭 자동 설치 → 끝!
    } else if (platform === 'ios-chrome') {
      // iOS Chrome은 PWA 설치 불가능
      alert(t.iosChrome.alert);
      setShowBanner(false);
    } else {
      setShowInstructions(true); // iOS Safari, Desktop 등만 수동 안내
    }
  };

  const handleClose = () => {
    setShowBanner(false);
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    setShowBanner(false);
  };

  // iOS Chrome에서는 아예 배너 표시하지 않음
  if (platform === 'ios-chrome') {
    return null;
  }

  if (!showBanner) return null;

  // 설치 안내 모달
  if (showInstructions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">{t.title}</h3>
            
            {platform === 'ios-safari' && (
              <div className="space-y-4 text-sm text-left">
                {t.instructions.iosSafari.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    {index === 0 && <Share className="h-6 w-6 text-orange-600 flex-shrink-0" />}
                    {index === 1 && <Download className="h-5 w-5 text-orange-600 flex-shrink-0" />}
                    {index === 2 && <span className="text-orange-600 text-xl font-bold flex-shrink-0">✓</span>}
                    <span><strong>{index + 1}.</strong> {step}</span>
                  </div>
                ))}
              </div>
            )}

            {platform === 'android-chrome' && (
              <div className="space-y-4 text-sm text-left">
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-red-700 font-medium">{t.instructions.androidChrome.failed}</p>
                  <p className="text-xs text-red-600 mt-1">{t.instructions.androidChrome.subtitle}</p>
                </div>
                {t.instructions.androidChrome.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    {index === 0 && <span className="text-orange-600 text-xl flex-shrink-0">⋮</span>}
                    {index === 1 && <Download className="h-5 w-5 text-orange-600 flex-shrink-0" />}
                    {index === 2 && <span className="text-orange-600 text-xl font-bold flex-shrink-0">✓</span>}
                    <span><strong>{index + 1}.</strong> {step}</span>
                  </div>
                ))}
              </div>
            )}

            {(platform === 'other') && (
              <div className="space-y-4 text-sm text-left">
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <p>Use your browser menu to install this app</p>
                  <p className="mt-2 text-xs text-gray-600">Look for &quot;Add to Home Screen&quot; or &quot;Install&quot; option</p>
                </div>
              </div>
            )}

            <button
              onClick={handleCloseInstructions}
              className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium"
            >
              {t.gotIt}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 상단 설치 배너
  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white p-4 z-[9999] shadow-lg">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-semibold">{t.title}</div>
            <div className="text-orange-100">
              {platform === 'android-chrome' && deferredPrompt 
                ? t.subtitle.androidAuto
                : platform === 'ios-safari'
                ? t.subtitle.iosSafari
                : 'Get quick access to our app'
              }
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              platform === 'android-chrome' && deferredPrompt
                ? 'bg-green-400 text-green-900 hover:bg-green-300 animate-pulse'
                : 'bg-white text-orange-500 hover:bg-orange-50'
            }`}
          >
            {platform === 'android-chrome' && deferredPrompt ? `⚡ ${t.installButton}` : t.installButtonDefault}
          </button>
          <button
            onClick={handleClose}
            className="text-orange-100 hover:text-white p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallButton;