import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions as any);

  if (!session) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-50 text-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Invalid Access</h1>
          <p className="text-lg mb-8">Your session has expired or you are not logged in.</p>
          <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full md:pb-32">
      <section>{children}</section>
    </div>
  );
}