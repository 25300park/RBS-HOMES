import Link from 'next/link';
import { FaInstagram, FaFacebookF, FaYoutube, FaTiktok } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        {/* Navigation Links */}
        <div className="w-full md:w-auto flex flex-col md:flex-row md:space-x-8 text-center md:text-left">
          {/* Company Section */}
          <div className="mb-6 md:mb-0">
            <h4 className="text-lg font-semibold text-gray-800">Company</h4>
            <ul className="mt-4 space-y-2 text-gray-600">
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
          <div className="hidden md:block w-px bg-gray-300 h-24" />

          {/* Explore Section */}
          <div className="mb-6 md:mb-0">
            <h4 className="text-lg font-semibold text-gray-800">Explore</h4>
            <ul className="mt-4 space-y-2 text-gray-600">
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
          <div className="hidden md:block w-px bg-gray-300 h-24" />

          {/* ToS & Privacy Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800">ToS & PRP</h4>
            <ul className="mt-4 space-y-2 text-gray-600">
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
      <div className="mt-10 flex justify-center space-x-6 text-gray-600">
        <Link href="#">
          <FaInstagram size={30} className="text-[#E1306C]" />
        </Link>
        <Link href="#">
          <FaFacebookF size={30} className="text-[#3b5998]" />
        </Link>
        <Link href="#">
          <FaYoutube size={30} className="text-[#FF0000]" />
        </Link>
        <Link href="#">
          <FaTiktok size={30} className="text-[#000000]" />
        </Link>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-gray-500">
        Copyright © 2024 Mr.Homes. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
