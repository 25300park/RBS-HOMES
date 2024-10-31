'use client'
import { usePathname } from "next/navigation";
import Link from "next/link";


const Footer = () => {
  const pathName = usePathname();
  const hiddenPaths = ["/map", "/account/unit/my-list"];
  const shouldRenderFooter = !hiddenPaths.some(path => pathName.startsWith(path));

  if (!shouldRenderFooter) return null; 
  
  return (
    <footer className="bg-[#f7f7f7] border-t py-16 px-4 ">
      <div className="max-w-6xl mx-auto flex md:flex-col flex-row justify-between items-start md:items-center">
        {/* Navigation Links */}
        <div className="md:w-full  flex md:flex-col flex-row  text-center md:text-left justify-evenly w-full">
          {/* Company Section */}
          <div className="md:mb-6 mb-0">
            <h4 className="text-lg font-semibold text-[#00092B]">Company</h4>
            <ul className="mt-4 space-y-2 text-zinc-500">
              <li>
                <Link href="#">About Us</Link>
              </li>
              <li>
                <Link href="#">Contact Us</Link>
              </li>
              <li>
                <Link href="#">Private Exclusives</Link>
              </li>
              <li>
                <Link href="#">Shell</Link>
              </li>
            </ul>
          </div>

          {/* Vertical Divider */}
          <div className="md:hidden block w-px bg-gray-300 h-40" />

          {/* Explore Section */}
          <div className="md:mb-6 mb-0">
            <h4 className="text-lg font-semibold text-[#00092B]">Explore</h4>
            <ul className="mt-4 space-y-2 text-zinc-500">
              <li>
                <Link href="#">Blog</Link>
              </li>
              <li>
                <Link href="#">Commercial</Link>
              </li>
              <li>
                <Link href="#">Interior</Link>
              </li>
              <li>
                <Link href="#">Market Report</Link>
              </li>
            </ul>
          </div>

          {/* Vertical Divider */}
          <div className="md:hidden block w-px bg-gray-300 h-40" />

          {/* ToS & Privacy Section */}
          <div>
            <h4 className="text-lg font-semibold text-[#00092B]">ToS & PRP</h4>
            <ul className="mt-4 space-y-2 text-zinc-500">
              <li>
                <Link href="#">Terms of Service</Link>
              </li>
              <li>
                <Link href="#">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Social Media Icons */}
      <div className="mt-16 flex justify-center space-x-14 text-zinc-500">
        <Link href="#">
          <img src="/assets/icons/footer/instagram.png" alt="insta" />
        </Link>
        <Link href="#">
          <img src="/assets/icons/footer/facebook.png" alt="face" />
        </Link>
        <Link href="#">
          <img src="/assets/icons/footer/youtube.png" alt="youtube" />
        </Link>
        <Link href="#">
          <img src="/assets/icons/footer/tiktok.png" alt="tiktok" />
        </Link>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-gray-400 text-xs">
        Copyright © 2024 Mr.Homes. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
