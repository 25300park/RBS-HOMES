import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions as any);

  return <div className="h-full md:pb-32 min-h-screen max-w-6xl mx-auto">{children}</div>;
}
