import Footer from "@/components/footer";
import Header from "@/components/header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MobileFooterNav from "@/components/ui/mob-footer-nav";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions as any);
  return (
    <div>
      <Header  />
      {children}
      {/* <div className="h-96 w-full bg-gray-100 sm:hidden"> 푸터</div> */}
      <Footer />
      <MobileFooterNav />
    </div>
  );
}
