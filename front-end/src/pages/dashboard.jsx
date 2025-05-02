"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import axiosInstance from "@/config/axios";
import { Loader2, Download, Copy, FileText } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const revenueChartRef = useRef(null);
  const quantityChartRef = useRef(null);

  const handleExportChart = async (chartRef, chartName) => {
    try {
      if (!chartRef.current) return;

      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Tăng độ phân giải
        logging: false,
        useCORS: true
      });

      // Tạo tên file với ngày hiện tại
      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `${chartName}_${currentDate}.png`;

      // Tạo link tải xuống
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success("Xuất ảnh thành công!", {
        description: `File ${fileName} đã được tải xuống`,
        duration: 3000,
        position: "top-right"
      });
    } catch (error) {
      console.error("Lỗi khi xuất ảnh:", error);
      toast.error("Xuất ảnh thất bại!", {
        description: "Vui lòng thử lại",
        duration: 3000,
        position: "top-right"
      });
    }
  };

  const handleCopyChart = async (chartRef) => {
    try {
      if (!chartRef.current) return;

      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      // Copy ảnh vào clipboard
      canvas.toBlob((blob) => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]);
      });

      toast.success("Đã sao chép biểu đồ!", {
        description: "Biểu đồ đã được sao chép vào clipboard",
        duration: 3000,
        position: "top-right"
      });
    } catch (error) {
      console.error("Lỗi khi sao chép:", error);
      toast.error("Sao chép thất bại!", {
        description: "Vui lòng thử lại",
        duration: 3000,
        position: "top-right"
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Bắt đầu fetch dữ liệu...");
        const response = await axiosInstance.post("/api/cube", {
          Dim_Time: "Month",
          Dim_Item: "None",
          Dim_Customer: "None",
        });

        console.log("Dữ liệu nhận được từ API:", response.data);

        if (!response.data || !response.data.validData) {
          throw new Error("Dữ liệu không hợp lệ từ server");
        }

        const cleanData = Array.from(
          new Set(response.data.validData.map((item) => JSON.stringify(item)))
        ).map((str) => JSON.parse(str));

        console.log("Dữ liệu sau khi làm sạch:", cleanData);

        // Tính tổng số lượng và doanh thu
        const totalQty = cleanData.reduce(
          (acc, item) => acc + (item["[Measures].[Quantity]"] || 0),
          0
        );
        const totalRev = cleanData.reduce(
          (acc, item) => acc + (item["[Measures].[Total Revenue]"] || 0),
          0
        );

        console.log("Tổng số lượng:", totalQty);
        console.log("Tổng doanh thu:", totalRev);

        setTotalQuantity(totalQty);
        setTotalRevenue(totalRev);

        // Chuẩn bị dữ liệu cho biểu đồ
        const chartData = cleanData.map((item) => ({
          month: item["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"] || "Không xác định",
          quantity: item["[Measures].[Quantity]"] || 0,
          revenue: item["[Measures].[Total Revenue]"] || 0,
        }));

        console.log("Dữ liệu cho biểu đồ:", chartData);
        setData(chartData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
        toast.error("Lỗi khi tải dữ liệu", {
          description: error.message,
          duration: 5000,
          position: "top-right"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Đã xảy ra lỗi</h2>
          <p className="text-gray-600">{error}</p>
          <Button 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Không có dữ liệu</h2>
          <p className="text-gray-500">Không tìm thấy dữ liệu để hiển thị</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Tổng số lượng
            </CardTitle>
            <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalQuantity.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tổng số lượng sản phẩm bán ra
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Tổng doanh thu
            </CardTitle>
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toLocaleString('vi-VN')} VND
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tổng doanh thu từ bán hàng
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Xuất báo cáo
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <button
              onClick={handleExportAllToPDF}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Xuất báo cáo PDF</span>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-700">
              Biểu đồ doanh thu theo tháng
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => handleCopyChart(revenueChartRef)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Sao chép biểu đồ"
              >
                <Copy className="h-4 w-4 text-gray-600" />
              </Button>
              <Button
                onClick={() => handleExportChart(revenueChartRef, "BieuDoDoanhThu")}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Tải xuống biểu đồ"
              >
                <Download className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]" ref={revenueChartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString('vi-VN')} VND`, 'Doanh thu']}
                    labelFormatter={(label) => `Tháng ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-700">
              Biểu đồ số lượng theo tháng
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => handleCopyChart(quantityChartRef)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Sao chép biểu đồ"
              >
                <Copy className="h-4 w-4 text-gray-600" />
              </Button>
              <Button
                onClick={() => handleExportChart(quantityChartRef, "BieuDoSoLuong")}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Tải xuống biểu đồ"
              >
                <Download className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]" ref={quantityChartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value.toLocaleString(), 'Số lượng']}
                    labelFormatter={(label) => `Tháng ${label}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="quantity"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 