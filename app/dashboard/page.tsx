import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const dashboardByLevel: Record<number, string> = {
  1: "/dashboard/buyer",
  2: "/dashboard/agent",
  3: "/dashboard/agent",
  4: "/dashboard/landlord",
  5: "/dashboard/tenant",
};

export default async function DashboardPage() {
  const session: any = await getServerSession(authOptions as any);

  if (!session?.user?.id) {
    redirect("/");
  }

  const level = Number(session.user.level ?? 1);
  const destination = dashboardByLevel[level] ?? "/dashboard/buyer";

  redirect(destination);
}
