import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ModalProvider } from "@/provider/modal-provider";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/provider/auth-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VisitorTracker } from "@/components/visitor-tracker";
import Script from "next/script";
import PWASplashScreen from "@/components/ui/pwa-splash-screen";

export const metadata: Metadata = {
  metadataBase: new URL("https://rbs-homes.com"),
  title: {
    default: "Apartments, Condos and Houses For Rent, Sale | RBS Homes",
    template: "%s | RBS Homes",
  },
  description:
    "Find long term and short term house rentals in the Philippines cities of Metro Manila Makati, Rockwell, Fort Bonifacio Global City, Ortigas and more.",
  keywords: [
    "apartment for rent",
    "condo near me",
    "condo for rent",
    "studio for rent",
    "room for rent near me",
    "apartment near me",
    "real estate philippine",
    "BGC condo for sale",
    "condo for sale",
    "house for rent near me",
    "house and lot",
    "bgc condo",
    "condo for rent bgc",
    "bgc condo for rent",
    "apartment for rent bgc",
    "makati condo",
    "apartment for rent in makati",
    "for rent makati",
    "condo for rent in manila",
    "mckinley hill village",
    "salcedo village",
    "multinational village",
    "필리핀 부동산",
    "마닐라 부동산",
    "BGC부동산",
  ],
  authors: [{ name: "RBS Homes" }],
  creator: "RBS Homes",
  publisher: "RBS Homes",
  formatDetection: {
    email: false,
    telephone: false,
  },
  // PWA 메타데이터 추가
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RBS Homes",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rbs-homes.com",
    siteName: "RBS Homes Philippines",
    title: "Apartments, Condos and Houses For Rent, Sale | RBS Homes",
    description: "지도기반의 집찾기 플랫폼",
    images: [
      {
        url: "/assets/images/ogimg.jpg",
        width: 1200,
        height: 630,
        alt: "RBS Homes Philippines",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apartments, Condos and Houses For Rent, Sale | RBS Homes",
    description:
      "Find long term and short term house rentals in the Philippines cities of Metro Manila Makati, Rockwell, Fort Bonifacio Global City, Ortigas and more.",
    images: ["https://rbs-homes.com/assets/images/ogimg.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions as any);

  return (
    <html lang="en">
      <head>
        {/* PWA 관련 메타 태그들 */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/pwaicons/apple-icon.png" />

        {/* iOS Safari PWA 설정 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RBS Homes" />

        {/* Android Chrome PWA 설정 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* 스플래시 스크린 색상 */}
        <meta name="theme-color" content="#ffffff" />

        {/* iOS 스플래시 스크린들 */}
        <link
          rel="apple-touch-startup-image"
          href="/pwaicons/icon-512x512.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/pwaicons/icon-512x512.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/pwaicons/icon-512x512.png"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/pwaicons/icon-512x512.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <style>{`
          :root {
            --pwa-bottom-padding: 0rem; 
          }
          
          @media (display-mode: standalone) {
            :root {
              --pwa-bottom-padding: 5rem; 
            }
          }
          
          .pwa-content {
            padding-bottom: var(--pwa-bottom-padding);
          }
        `}</style>
      </head>
      <body className={` md:h-[100dvh]`}>
        <PWASplashScreen />
        <AuthProvider session={session}>
          <div className="pwa-content">
            <ModalProvider />
            <VisitorTracker />
            {children}
          </div>
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-16798772282"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16798772282');
          `}
          </Script>

          {/* PWA 설치 알림 */}
          <Script id="pwa-install-prompt" strategy="afterInteractive">
            {`
            let deferredPrompt;
            let installButton;

            window.addEventListener('beforeinstallprompt', (e) => {
              console.log('beforeinstallprompt fired');
              e.preventDefault();
              deferredPrompt = e;
              
              // 설치 버튼 표시 로직 (필요시)
              showInstallPromotion();
            });

            window.addEventListener('appinstalled', (evt) => {
              console.log('PWA was installed');
              hideInstallPromotion();
            });

            function showInstallPromotion() {
              // PWA 설치 프로모션 표시
              console.log('PWA installable');
            }

            function hideInstallPromotion() {
              // PWA 설치 프로모션 숨기기
              console.log('PWA promotion hidden');
            }

            // 설치 함수 (필요시 글로벌로 노출)
            window.installPWA = async () => {
              if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('User choice:', outcome);
                deferredPrompt = null;
              }
            };
            `}
          </Script>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
