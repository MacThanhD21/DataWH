"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/config/axios";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Package, Calendar, X, HelpCircle, BookOpen } from "lucide-react";
import dynamic from 'next/dynamic';
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// Dynamic imports for chart components
const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), { ssr: false });
const QuantityChart = dynamic(() => import('@/components/charts/QuantityChart'), { ssr: false });
const AvgRevenueChart = dynamic(() => import('@/components/charts/AvgRevenueChart'), { ssr: false });
const EfficiencyChart = dynamic(() => import('@/components/charts/EfficiencyChart'), { ssr: false });

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Hàm chuyển đổi số tháng thành tên tháng tiếng Việt
const getMonthName = (month) => {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  return months[month - 1] || `Tháng ${month}`;
};

// Hàm định dạng thời gian cho tooltip
const formatTime = (month, year) => {
  return `${getMonthName(month)}/${year}`;
};

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [quantityGrowth, setQuantityGrowth] = useState(0);
  const [timeRange, setTimeRange] = useState('');
  const [selectedData, setSelectedData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.post("/api/cube", {
          Dim_Time: "Month",
          Dim_Item: "None",
          Dim_Customer: "None",
        });

        const processedData = processData(data.validData);

        setTimeRange(processedData.timeRangeText);
        setTotalQuantity(processedData.totalQty);
        setTotalRevenue(processedData.totalRev);
        setCustomerCount(processedData.customerCount);
        setCityCount(processedData.cityCount);
        setRevenueGrowth(processedData.revenueGrowth);
        setQuantityGrowth(processedData.quantityGrowth);

        setData(processedData.chartData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = useCallback((rawData) => {
    const cleanData = Array.from(
      new Set(rawData.map((item) => JSON.stringify(item)))
    ).map((str) => JSON.parse(str));

    // Calculate totals
    const totalQty = cleanData.reduce(
      (acc, item) => acc + item["[Measures].[Quantity]"],
      0
    );
    const totalRev = cleanData.reduce(
      (acc, item) => acc + item["[Measures].[Total Revenue]"],
      0
    );

    // Calculate unique counts
    const uniqueCustomers = new Set(
      cleanData.map(item => item["[Dim Customer].[Customer Id].[Customer Id].[MEMBER_CAPTION]"])
    );
    const uniqueCities = new Set(
      cleanData.map(item => item["[Dim Customer].[City Id].[City Id].[MEMBER_CAPTION]"])
    );

    // Calculate growth
    const sortedData = [...cleanData].sort((a, b) => 
      a["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"] - b["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"]
    );
    
    const midPoint = Math.floor(sortedData.length / 2);
    const firstHalf = sortedData.slice(0, midPoint);
    const secondHalf = sortedData.slice(midPoint);
    
    const firstHalfRevenue = firstHalf.reduce((acc, item) => acc + item["[Measures].[Total Revenue]"], 0);
    const secondHalfRevenue = secondHalf.reduce((acc, item) => acc + item["[Measures].[Total Revenue]"], 0);
    const firstHalfQuantity = firstHalf.reduce((acc, item) => acc + item["[Measures].[Quantity]"], 0);
    const secondHalfQuantity = secondHalf.reduce((acc, item) => acc + item["[Measures].[Quantity]"], 0);
    
    const revenueGrowth = Math.round(((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100);
    const quantityGrowth = Math.round(((secondHalfQuantity - firstHalfQuantity) / firstHalfQuantity) * 100);

    // Get time range
    const years = new Set(cleanData.map(item => item["[Dim Time].[Year].[Year].[MEMBER_CAPTION]"]));
    const yearList = Array.from(years).sort();
    const timeRangeText = yearList.length > 1 
      ? `Từ ${getMonthName(firstHalf[0]["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"])}/${yearList[0]} đến ${getMonthName(secondHalf[secondHalf.length - 1]["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"])}/${yearList[yearList.length - 1]}`
      : `Năm ${yearList[0]}`;

    // Prepare chart data with correct average revenue calculation
    const chartData = cleanData.map((item) => {
      const revenue = item["[Measures].[Total Revenue]"];
      const quantity = item["[Measures].[Quantity]"];
      const avgRevenue = quantity > 0 ? Math.round(revenue / quantity) : 0;

      return {
        month: item["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"],
        year: item["[Dim Time].[Year].[Year].[MEMBER_CAPTION]"],
        monthName: getMonthName(item["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"]),
        timeLabel: formatTime(
          item["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"],
          item["[Dim Time].[Year].[Year].[MEMBER_CAPTION]"]
        ),
        quantity: quantity,
        revenue: revenue,
        avgRevenue: avgRevenue,
      };
    });

    return {
      chartData,
      totalQty,
      totalRev,
      customerCount: uniqueCustomers.size,
      cityCount: uniqueCities.size,
      revenueGrowth,
      quantityGrowth,
      timeRangeText
    };
  }, []);

  const handleChartClick = (data, chartType) => {
    setSelectedData({ ...data, chartType });
    setShowDetail(true);
  };

  const DetailModal = () => {
    if (!selectedData || !showDetail) return null;

    const getDetailContent = () => {
      switch (selectedData.chartType) {
        case 'revenue':
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Doanh thu:</span>
                <span className="font-semibold text-green-600">
                  {selectedData.revenue.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Số lượng:</span>
                <span className="font-semibold text-blue-600">
                  {selectedData.quantity.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Doanh thu trung bình:</span>
                <span className="font-semibold text-yellow-600">
                  {selectedData.avgRevenue.toLocaleString('vi-VN')} VND
                </span>
              </div>
            </div>
          );
        case 'quantity':
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Số lượng:</span>
                <span className="font-semibold text-blue-600">
                  {selectedData.quantity.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Doanh thu:</span>
                <span className="font-semibold text-green-600">
                  {selectedData.revenue.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tỷ lệ so với tổng:</span>
                <span className="font-semibold text-purple-600">
                  {Math.round((selectedData.quantity / totalQuantity) * 100)}%
                </span>
              </div>
            </div>
          );
        case 'avgRevenue':
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Doanh thu trung bình:</span>
                <span className="font-semibold text-yellow-600">
                  {selectedData.avgRevenue.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Doanh thu:</span>
                <span className="font-semibold text-green-600">
                  {selectedData.revenue.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Số lượng:</span>
                <span className="font-semibold text-blue-600">
                  {selectedData.quantity.toLocaleString()}
                </span>
              </div>
            </div>
          );
        case 'distribution':
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Doanh thu:</span>
                <span className="font-semibold text-green-600">
                  {selectedData.revenue.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tỷ lệ so với tổng:</span>
                <span className="font-semibold text-purple-600">
                  {Math.round((selectedData.revenue / totalRevenue) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Số lượng:</span>
                <span className="font-semibold text-blue-600">
                  {selectedData.quantity.toLocaleString()}
                </span>
              </div>
            </div>
          );
        case 'efficiency':
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Doanh thu trung bình:</span>
                <span className="font-semibold text-blue-600">
                  {selectedData.avgRevenue.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Số lượng bán:</span>
                <span className="font-semibold text-green-600">
                  {selectedData.quantity.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tổng doanh thu:</span>
                <span className="font-semibold text-purple-600">
                  {selectedData.revenue.toLocaleString('vi-VN')} VND
                </span>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Chi tiết {selectedData.timeLabel}
            </h3>
            <button
              onClick={() => setShowDetail(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {getDetailContent()}
        </div>
      </div>
    );
  };

  const ExplanationsModal = () => {
    if (!showExplanations) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
              Giải thích chi tiết
            </h3>
            <button
              onClick={() => setShowExplanations(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Chỉ số */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Giải thích các chỉ số</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Doanh thu */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="font-semibold text-green-700">Doanh thu</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• <span className="font-medium">Tổng doanh thu:</span> Tổng số tiền thu được từ tất cả các đơn hàng</p>
                  <p>• <span className="font-medium">Doanh thu trung bình:</span> Doanh thu trên mỗi sản phẩm (Tổng doanh thu / Tổng số lượng)</p>
                </div>
              </div>

              {/* Số lượng */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Package className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="font-semibold text-blue-700">Số lượng</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• <span className="font-medium">Tổng số lượng:</span> Tổng số sản phẩm đã bán</p>
                  <p>• <span className="font-medium">Tỷ lệ so với tổng:</span> Phần trăm số lượng của tháng so với tổng số lượng</p>
                </div>
              </div>
            </div>
          </div>

          {/* Biểu đồ */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Giải thích các biểu đồ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Doanh thu */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <h3 className="font-semibold text-green-700">Biểu đồ doanh thu theo tháng</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• <span className="font-medium">Mục đích:</span> Theo dõi xu hướng doanh thu qua các tháng</p>
                  <p>• <span className="font-medium">Cách đọc:</span> 
                    <ul className="list-disc pl-4 mt-1">
                      <li>Trục ngang: Thời gian (tháng/năm)</li>
                      <li>Trục dọc: Giá trị doanh thu (VND)</li>
                      <li>Diện tích màu xanh: Tổng doanh thu</li>
                    </ul>
                  </p>
                  <p>• <span className="font-medium">Phân tích:</span> 
                    <ul className="list-disc pl-4 mt-1">
                      <li>Tháng có doanh thu cao nhất</li>
                      <li>Xu hướng tăng/giảm theo mùa</li>
                      <li>Thời điểm đạt đỉnh doanh thu</li>
                    </ul>
                  </p>
                </div>
              </div>

              {/* Số lượng */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <h3 className="font-semibold text-blue-700">Biểu đồ số lượng theo tháng</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• <span className="font-medium">Mục đích:</span> Theo dõi số lượng sản phẩm bán ra</p>
                  <p>• <span className="font-medium">Cách đọc:</span> 
                    <ul className="list-disc pl-4 mt-1">
                      <li>Trục ngang: Thời gian (tháng/năm)</li>
                      <li>Trục dọc: Số lượng sản phẩm</li>
                      <li>Cột màu xanh: Số lượng bán mỗi tháng</li>
                    </ul>
                  </p>
                  <p>• <span className="font-medium">Phân tích:</span> 
                    <ul className="list-disc pl-4 mt-1">
                      <li>Tháng bán chạy nhất</li>
                      <li>Mức độ ổn định của số lượng bán</li>
                      <li>Mối tương quan với doanh thu</li>
                    </ul>
                  </p>
                </div>
              </div>

              {/* Doanh thu trung bình */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <h3 className="font-semibold text-yellow-700">Biểu đồ doanh thu trung bình</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• <span className="font-medium">Mục đích:</span> Đánh giá giá trị trung bình mỗi sản phẩm</p>
                  <p>• <span className="font-medium">Cách đọc:</span> 
                    <ul className="list-disc pl-4 mt-1">
                      <li>Trục ngang: Thời gian (tháng/năm)</li>
                      <li>Trục dọc: Doanh thu trung bình (VND)</li>
                      <li>Đường màu vàng: Giá trị trung bình</li>
                    </ul>
                  </p>
                  <p>• <span className="font-medium">Phân tích:</span> 
                    <ul className="list-disc pl-4 mt-1">
                      <li>Tháng có giá trị trung bình cao nhất</li>
                      <li>Xu hướng thay đổi giá trị sản phẩm</li>
                      <li>Hiệu quả chiến lược giá</li>
                    </ul>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
      {/* Time Range Info */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm shadow-lg rounded-lg p-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-gray-700 font-medium">{timeRange}</span>
        </div>
        <button
          onClick={() => setShowExplanations(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <BookOpen className="h-5 w-5 mr-2" />
          Giải thích
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Tổng doanh thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toLocaleString('vi-VN')} VND
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Tổng số lượng
            </CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalQuantity.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                Biểu đồ doanh thu theo tháng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <RevenueChart 
                  data={data}
                  onChartClick={handleChartClick}
                  totalRevenue={totalRevenue}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                Biểu đồ số lượng theo tháng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <QuantityChart 
                  data={data}
                  onChartClick={handleChartClick}
                  totalQuantity={totalQuantity}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">
              Biểu đồ doanh thu trung bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <AvgRevenueChart 
                data={data}
                onChartClick={handleChartClick}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <DetailModal />
      <ExplanationsModal />
    </div>
  );
} 