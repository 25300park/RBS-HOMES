import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ModalProvider } from "@/provider/modal-provider";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/provider/auth-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VisitorTracker } from "@/components/visitor-tracker";

export const metadata: Metadata = {
  metadataBase: new URL('https://rbs-homes.com'),
  title: {
    default: "Apartments, Condos and Houses For Rent, Sale | RBS Homes",
    template: "%s | RBS Homes"
  },
  description: "Find long term and short term house rentals in the Philippines cities of Metro Manila Makati, Rockwell, Fort Bonifacio Global City, Ortigas and more.",
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
    "BGC부동산"
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
    title: "Apartments, Condos and Houses For Rent, Sale | RBS Homes",
    description: "Find long term and short term house rentals in the Philippines cities of Metro Manila Makati, Rockwell, Fort Bonifacio Global City, Ortigas and more.",
    images: [{
      url: "/assets/images/cities/BGC.png",
      width: 1200,
      height: 630,
      alt: "RBS Homes Philippines"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apartments, Condos and Houses For Rent, Sale | RBS Homes",
    description: "Find long term and short term house rentals in the Philippines cities of Metro Manila Makati, Rockwell, Fort Bonifacio Global City, Ortigas and more.",
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
