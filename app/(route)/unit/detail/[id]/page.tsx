import { getUnitDetail } from "../../action";
import DetailWrap from "../../components/detail-wrap";
import { sleep } from "@/lib/utils";
export interface UnitDetailProps {
  params: { id: string };
}

const UnitDetail = async ({ params }: UnitDetailProps) => {
  await sleep(200)
  const unitId = parseInt(params?.id);

  if (!unitId || isNaN(unitId)) {
    return <p>Error: Invalid unit ID.</p>;
  }

  const { unitDetail } = await getUnitDetail(unitId);
  return (
    <div className="max-w-[1140px] mx-auto">
      <DetailWrap property={unitDetail} />
    </div>
  );
};

export default UnitDetail;
