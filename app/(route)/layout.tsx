import Footer from "@/components/footer";
import Header from "@/components/header";
import MobileFooterNav from "@/components/ui/mob-footer-nav";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 현재 URL 패스 확인
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  const pathname = headersList.get("x-invoke-path") || "";
  if (isMobile && pathname === "/") {
    redirect("/map?sellType=rent");
  }

  return (
    <div>
      <Header />
      {children}
      <Footer />
      <MobileFooterNav />
    </div>
  );
}