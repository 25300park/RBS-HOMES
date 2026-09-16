import { notFound, permanentRedirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { generatePropertySlug } from "@/lib/utils";

export interface UnitDetailProps {
  params: { id: string };
}

// 레거시 경로 — 과거 공유(카카오톡/SNS)된 링크 호환용.
// 정식 경로는 /properties/[slug]. 신규 진입점은 모두 그쪽을 사용할 것.
const UnitDetailRedirect = async ({ params }: UnitDetailProps) => {
  const unitId = parseInt(params?.id);

  if (!unitId || isNaN(unitId)) {
    notFound();
  }

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: {
      id: true,
      title: true,
      type: true,
      sellType: true,
      address2: true,
    },
  });

  if (!unit) {
    notFound();
  }

  permanentRedirect(`/properties/${generatePropertySlug(unit)}`);
};

export default UnitDetailRedirect;
