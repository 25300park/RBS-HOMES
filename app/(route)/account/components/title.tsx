// components/Title.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { accountSideBarOption } from "@/lib/config/account-options";
import { Breadcrumb } from "./breadcrumb";

export interface TitleProps {}

const Title = ({}: TitleProps): React.ReactNode => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const findCurrentMenuItem = () => {
    const dashboardItem = accountSideBarOption.find(
      (item) => item.link === pathname
    );
    if (dashboardItem) return dashboardItem;
  
    // 다른 메뉴 항목들 체크
    for (const option of accountSideBarOption) {
      if (option.children?.length) {
        const child = option.children.find(child => {
          if (child.isTab) {
            // tabs 파라미터가 있는 경우
            return pathname + "?" + searchParams.toString() === child.link;
          }
          // registration 특수 케이스
          if (child.link.includes('registration')) {
            return pathname.startsWith('/account/unit/registration');
          }
          return pathname === child.link;
        });
        if (child) return child;
      }
    }
    return null;
  };

  const currentItem = findCurrentMenuItem();

  if (!currentItem) return null;

  const Icon = currentItem.icon;

  return (
    <div className="space-y-4">
      <Breadcrumb />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          {Icon && <Icon className="w-5 h-5 text-orange-600" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{currentItem.name}</h1>
          {currentItem.description && (
            <p className="text-gray-500 mt-1">{currentItem.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Title;