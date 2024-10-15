import Sidebar from "./components/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // next-auth 설정 파일 경로에 맞게 변경

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions as any);
  if (!session) {
    return <p>You need to be logged in to access this page.</p>;
  }

  return (
    // max-h-[calc(100vh-80px)]
    <div className="flex">
      <Sidebar />
      <section className="bg-zinc-50 flex-1">{children}</section>
    </div>
  );
}
