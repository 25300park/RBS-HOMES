// pages/index.tsx
import MainList from "./components/main-list-section";
import BannerGroup from "./components/banner-group";
import { redirect } from 'next/navigation';

export default async function DashBoard({ searchParams }: { searchParams: any }) {
  // const { units, total } = await getMainList(1, 10, searchParams);

  if (!searchParams.sellType) {
    redirect('/?sellType=rent');
  }


  return (
    <div>
      <BannerGroup />
      <div className="mt-2">
        <MainList   />
      </div>
    </div>
  );
}
