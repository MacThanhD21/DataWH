"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaDatabase, FaCog, FaUser, FaBell } from "react-icons/fa";
import { useState } from "react";

const Header = () => {
  const pathname = usePathname();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo và Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-600">
                <FaDatabase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-800">
                Data Warehouse
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  pathname === "/"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
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
              className="p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50"
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
              className={`p-2 rounded-lg ${
                pathname === "/settings"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              <FaCog className="h-5 w-5" />
            </Link>
            
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50">
              <FaUser className="h-5 w-5" />
              <span className="hidden md:block font-medium">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
