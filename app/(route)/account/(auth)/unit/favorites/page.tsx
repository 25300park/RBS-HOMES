import { getFavoriteList } from "../../../action";
import FavoriteList from "../../../components/favorite-list";

export interface FavoriteListHomeProps {}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const FavoriteListHome = async ({}: FavoriteListHomeProps) => {
  const { data } = await getFavoriteList();
  return <FavoriteList data={data} />;
};

export default FavoriteListHome;
