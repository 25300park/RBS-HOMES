import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import Title from "./components/title";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const session = await getServerSession(authOptions as any);
  // if (!session) {
  //   return <p>You need to be logged in to access this page.</p>;
  // }

  return (
    // max-h-[calc(100vh-80px)]
    <div className="flex min-h-[calc(100dvh-80px)] flex-col ">
      <Title />
      <section className="flex-1">{children}</section>
    </div>
  );
}
