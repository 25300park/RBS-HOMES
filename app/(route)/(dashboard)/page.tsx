import MainList from "./components/main-list-section";
import BannerGroup from "./components/banner-group";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function DashBoard({
  searchParams,
}: {
  searchParams: { sellType?: string; [key: string]: string | string[] | undefined }
}) {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // 모바일에서 접근시 map 페이지로 리다이렉트
  if (isMobile && !searchParams.sellType) {
    redirect("/map?sellType=rent");
  }

  // 데스크톱에서 sellType 없을 때 리다이렉트
  if (!isMobile && !searchParams.sellType) {
    redirect("/?sellType=rent");
  }

  return (
    <main>
      <BannerGroup />
      <div className="mt-2">
        <MainList />
      </div>
    </main>
  );
}