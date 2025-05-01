import localFont from "next/font/local";
import "./globals.css";

export const metadata = {
  title: "Data Warehouse Nhóm 18",
  description: "Data Warehouse Nhóm 18",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="">{children}</body>
    </html>
  );
}
