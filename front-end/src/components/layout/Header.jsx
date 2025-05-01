"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartLine, FaDatabase, FaCog, FaUser } from "react-icons/fa";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <FaChartLine className="h-6 w-6 text-green-500" />
            <span className="text-xl font-bold text-gray-800">DWH Analytics</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                pathname === "/dashboard"
                  ? "bg-green-50 text-green-600"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <FaChartLine className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                pathname === "/"
                  ? "bg-green-50 text-green-600"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <FaDatabase className="h-4 w-4" />
              Bảng dữ liệu
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className={`p-2 rounded-md transition-colors ${
              pathname === "/settings"
                ? "bg-green-50 text-green-600"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            <FaCog className="h-5 w-5" />
          </Link>
          <button className="p-2 rounded-md text-gray-600 hover:text-green-600 transition-colors">
            <FaUser className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
