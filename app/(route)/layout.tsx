import Footer from "@/components/footer";
import Header from "@/components/header";
import PopupManager from "@/components/modals/popup-manager";
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
    redirect("/map");
  }

  return (
    <div>
      <Header />
      <PopupManager />
      {children}
      <Footer />
      <MobileFooterNav />
      <div class="messenger-dekstop">
          <div class="relative size-32 z-40">
            <a href="https://m.me/498331016707865" target="_blank">
              <img src="https://static.xx.fbcdn.net/rsrc.php/yb/r/M8rOX7S5AN3.svg"
                width={25}
                height={25} 
                class="fixed right-5 bottom-5 size-16 animate-fade-in"
                alt=""/>
            </a>
          </div>
      </div>
      <div class="messenger-mobile">
          <div class="relative size-32 z-40">
            <a href="https://m.me/498331016707865" target="_blank">
              <img src="https://static.xx.fbcdn.net/rsrc.php/yb/r/M8rOX7S5AN3.svg"
                width={25}
                height={25} 
                class="fixed right-5 bottom-16 size-16 animate-fade-in"
                alt=""/>
            </a>
          </div>
      </div>
    </div>
  );
}