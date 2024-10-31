"use client";

import Link from "next/link";
import { useModalStore } from "@/store/use-modal-store";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import HeaderUserProfile from "./ui/header-user-profile";
import { IoMapOutline, IoListOutline } from "react-icons/io5";
import GoogleSearchBar from "./ui/google-search-bar";
import MainAmenityList from "./ui/main-amenity-list";
import MainFilterGroup from "./ui/main-filter-group";
import { useMediaQuery } from "@/hooks/use-media-query";

export interface HeaderProps {}

const HeaderSkeleton = ({ pathname }: { pathname: string }) => {
 return (
   <div className="w-full">
     {/* 데스크톱 헤더 스켈레톤 */}
     <div className="md:hidden">
       <div className={`h-20 fixed top-0 left-0 right-0 w-full bg-white border-b z-50`} />
       {pathname === "/" && <div className="h-24 w-full bg-white" />}
       {(pathname === "/" || pathname.includes("map")) && (
         <div className="h-20 w-full bg-white" />
       )}
     </div>

     {/* 모바일 헤더 스켈레톤 */}
     <div className="hidden md:block">
       <div className="h-32 fixed top-0 left-0 right-0 w-full bg-white border-b shadow-md z-50" />
     </div>
     <div className={`${pathname === "/" ? "mt-44 md:mt-32" : "mt-20 md:mt-32"}`} />
   </div>
 );
};

const DesktopHeader = ({ navbarScrolled, session, pathName, openModal }: any) => (
 <nav
   className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-gray-200 md:hidden h-20 ${
     navbarScrolled ? "h-20 bg-white" : "h-44 bg-white"
   } w-full flex flex-col items-center`}
 >
   <div className="flex w-full items-center justify-between h-20 px-12">
     <div className="flex items-center">
       <Link className="mr-16" href={"/"}>
         <img src="/assets/images/RBS_logo.png" alt="logo" />
       </Link>
     </div>

     {(pathName !== "/" || (pathName === "/" && !navbarScrolled)) && (
       <div className="flex items-center gap-8">
         <Link
           href={"/"}
           className={`hover:border-gray-200 border-b flex items-center gap-2 ${
             pathName === "/"
               ? "text-black border-gray-200"
               : "text-gray-400 border-transparent"
           }`}
         >
           <IoListOutline className="text-xl" />
           <p>View as list</p>
         </Link>
         <Link
           href={"/map"}
           className={`flex items-center hover:border-gray-200 border-b gap-2 ${
             pathName.startsWith("/map")
               ? "text-black border-gray-200"
               : "text-gray-400 border-transparent"
           }`}
         >
           <IoMapOutline className="text-xl" />
           <p>View on map</p>
         </Link>
       </div>
     )}

     <div className="flex items-center space-x-4 w-[250px] justify-end">
       {session === null ? (
         <>
           <Button
             variant={"ghost"}
             size={"lg"}
             className="text-md text-[#6f6f6f]"
             onClick={() => openModal("login")}
           >
             LOGIN
           </Button>
           <span className="text-[#717171] mx-2">|</span>
           <Button
             variant={"ghost"}
             size={"lg"}
             className="text-md text-[#6f6f6f]"
             onClick={() => openModal("signup")}
           >
             SIGN-UP
           </Button>
         </>
       ) : (
         <HeaderUserProfile session={session} />
       )}
     </div>
   </div>

   {pathName === "/" && <GoogleSearchBar navbarScrolled={navbarScrolled} />}
 </nav>
);

const MobileHeader = ({ pathName }: { pathName: string }) => {
 // 특정 라우트에서만 헤더를 보여주기 위한 조건 체크
 const shouldShowHeader = pathName === "/" || 
                        pathName.includes("/map") || 
                        pathName.includes("/account");

 if (!shouldShowHeader) {
   return null;
 }

 return (
   <header>
     <nav className="h-32 hidden md:flex fixed top-0 bg-white p-4 w-full flex-col gap-2 z-50 border-b shadow-md">
       <GoogleSearchBar isMobile />
       <div>
         <MainFilterGroup />
       </div>
     </nav>
     <div className="mt-32"></div>
   </header>
 );
};

const Header = ({}: HeaderProps) => {
 const { data: session, status } = useSession();
 const { openModal } = useModalStore();
 const pathName = usePathname();
 const [navbarScrolled, setNavbarScrolled] = useState(false);
 const isMobile = useMediaQuery("(max-width: 768px)");
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
   setMounted(true);
 }, []);

 useEffect(() => {
   if (pathName === "/") {
     const handleScroll = () => {
       setNavbarScrolled(window.scrollY > 50);
     };

     window.addEventListener("scroll", handleScroll);
     setNavbarScrolled(false);

     return () => {
       window.removeEventListener("scroll", handleScroll);
     };
   } else {
     setNavbarScrolled(true);
   }
 }, [pathName]);

 if (!mounted || status === "loading") {
   return <HeaderSkeleton pathname={pathName} />;
 }

 if (isMobile) {
   return <MobileHeader pathName={pathName} />;
 }

 return (
   <header className="w-full">
     <DesktopHeader 
       navbarScrolled={navbarScrolled}
       session={session}
       pathName={pathName}
       openModal={openModal}
     />
     
     <nav className="hidden h-20 fixed top-0 w-full px-6 bg-white z-50 md:flex items-center">
       {pathName === "/" && (
         <GoogleSearchBar navbarScrolled={navbarScrolled} isMobile />
       )}
     </nav>
     
     <div className={`${pathName === "/" ? "mt-44 md:mt-20" : "mt-20"}`} />
     
     <div
       className={`${
         navbarScrolled
           ? "fixed bg-white top-20 z-30 transition-all duration-300"
           : "mt-20 bg-white"
       } w-full md:mt-0`}
     >
       {(pathName === "/" || pathName.includes("map")) && (
         <div className="flex w-full md:flex-col pt-4 px-20 3xl:px-12 xs:px-4 border-b md:p-4 md:gap-4">
           <MainFilterGroup />
           <MainAmenityList />
         </div>
       )}
     </div>
   </header>
 );
};

export default Header;