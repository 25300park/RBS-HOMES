import Footer from "@/components/footer";
import Header from "@/components/header";
import { getServerSession } from "next-auth";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession()
  return (
    <div>
      <Header session={session} />
      {children}
      {/* <div className="h-96 w-full bg-gray-100 sm:hidden"> 푸터</div> */}
      <Footer />
    </div>
  );
}
