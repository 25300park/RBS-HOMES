import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ModalProvider } from "@/provider/modal-provider";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/provider/auth-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VisitorTracker } from "@/components/visitor-tracker";

export const metadata: Metadata = {
  title: {
    default: "Philippines Real Estate | RBS Homes",
    template: "%s | RBS Homes"
  },
  description: "Find your perfect property in the Philippines. Browse houses, condos, and apartments for sale or rent across the Philippines.",
  keywords: [
    "Philippines real estate",
    "Philippine property",
    "houses for sale Philippines",
    "condos Philippines",
    "Manila real estate",
    "Philippines property investment"
  ],
  authors: [{ name: "RBS Homes" }],
  creator: "RBS Homes",
  publisher: "RBS Homes",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rbs-homes.com",
    siteName: "RBS Homes Philippines",
    title: "Philippines Real Estate | RBS Homes",
    description: "Find your perfect property in the Philippines. Browse houses, condos, and apartments.",
    images: [{
      url: "/assets/images/cities/BGC.png", // OG 이미지 경로
      width: 1200,
      height: 630,
      alt: "RBS Homes Philippines"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Philippines Real Estate | RBS Homes",
    description: "Find your perfect property in the Philippines",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
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
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions as any);

  return (
    <html lang="en">
      <head />
      <body className={` md:h-[100dvh]`}>
        <AuthProvider session={session}>
          <ModalProvider />
          <VisitorTracker />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
