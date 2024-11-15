import Footer from "@/components/footer";
import Header from "@/components/header";
import MobileFooterNav from "@/components/ui/mob-footer-nav";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header  />
      {children}
      <Footer />
      <MobileFooterNav />
    </div>
  );
}
