// components/ui/breadcrumb.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbConfig {
 label: string;
 show: boolean;
}

type BreadcrumbMap = {
 [key: string]: BreadcrumbConfig;
}

const BREADCRUMB_MAP: BreadcrumbMap = {
 account: {
   label: "Account",
   show: true,
 },
 dashboard: { 
  label: "Dashboard",
  show: true,
},
 schedule: { 
  label: "Schedule",
  show: true,
},
 "my-list": {
   label: "My List",
   show: true,
 },
 favorites: {
   label: "Favorites",
   show: true,
 },
 management: {
   label: "Management",
   show: true,
 },
 registration: {
   label: "Registration",
   show: true,
 },
};

interface BreadcrumbItem {
 href: string;
 label: string;
 isLast: boolean;
}

export function Breadcrumb() {
 const pathname = usePathname();
 const paths = pathname.split("/").filter(Boolean);
 if (pathname === '/account') return null;
 const breadcrumbs = paths
   .map((path, index) => {
     const href = `/${paths.slice(0, index + 1).join("/")}`;
     const pathConfig = BREADCRUMB_MAP[path];
     
     // 표시하지 않을 경로는 필터링
     if (!pathConfig?.show) return null;

     const isLast = index === paths.length - 1;

     return {
       href,
       label: pathConfig?.label || path,
       isLast
     };
   })
   .filter((item): item is BreadcrumbItem => item !== null); // null 값 제거 및 타입 가드

 if (breadcrumbs.length <= 0) return null;

 return (
   <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
     {breadcrumbs.map(({ href, label, isLast }, index) => (
       <div key={href} className="flex items-center">
         {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
         {isLast ? (
           <span className="text-gray-900 font-medium">{label}</span>
         ) : (
           <Link 
             href={href}
             className="hover:text-gray-700 transition-colors"
           >
             {label}
           </Link>
         )}
       </div>
     ))}
   </nav>
 );
}