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
  
  // 현재 경로 확인 (루트 경로인지 확인)
  const referer = headersList.get("referer") || "";
  const path = headersList.get("x-invoke-path") || "";
  const isDirectAccess = path === "/" || path === "";
  
  // // 모바일에서 직접 도메인 접속시에만 /map으로 리다이렉트
  // if (isMobile && isDirectAccess) {
  //   redirect("/map");
  // }

  return (
    <main>
      <BannerGroup />
      <div className="mt-2">
        <MainList />
      </div>
    </main>
  );
}