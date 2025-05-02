import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DWH Analytics",
  description: "Hệ thống phân tích dữ liệu đơn hàng",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
} 