"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartLine, FaDatabase, FaCog, FaUser, FaBell } from "react-icons/fa";
import { useState } from "react";

const Header = () => {
  const pathname = usePathname();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo và Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300">
                <FaChartLine className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Order System Analytics
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  pathname === "/dashboard"
                    ? "bg-green-50 text-green-700 shadow-sm"
                    : "text-gray-600 hover:text-green-700 hover:bg-green-50/50"
                }`}
              >
                <FaChartLine className="h-4 w-4" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                href="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  pathname === "/"
                    ? "bg-green-50 text-green-700 shadow-sm"
                    : "text-gray-600 hover:text-green-700 hover:bg-green-50/50"
                }`}
              >
                <FaDatabase className="h-4 w-4" />
                <span className="font-medium">Bảng dữ liệu</span>
              </Link>
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <button 
              className="p-2 rounded-lg text-gray-600 hover:text-green-700 hover:bg-green-50/50 transition-all duration-300 relative"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <FaBell className="h-5 w-5" />
              {isNotificationOpen && (
                <div className="absolute top-10 right-0 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-600">Không có thông báo mới</div>
                </div>
              )}
            </button>
            
            <Link
              href="/settings"
              className={`p-2 rounded-lg transition-all duration-300 ${
                pathname === "/settings"
                  ? "bg-green-50 text-green-700 shadow-sm"
                  : "text-gray-600 hover:text-green-700 hover:bg-green-50/50"
              }`}
            >
              <FaCog className="h-5 w-5" />
            </Link>
            
            <button className="p-2 rounded-lg text-gray-600 hover:text-green-700 hover:bg-green-50/50 transition-all duration-300">
              <FaUser className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
