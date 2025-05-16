"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SelectLocal } from "./ui_local/select_local";
import { Button } from "./button";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { Loader2, Download, FileText } from "lucide-react";
import { PopoverLocal } from "./ui_local/popover_local";
import { extractDistinctValues } from "@/utils/functions";
import { Card } from "./card";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Pagination from "./Pagination";
import { useDataFetching } from '@/hooks/useDataFetching';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// Tách component TableHeader thành component riêng
const TableHeaderComponent = memo(({ 
  filterOptions, 
  filterSelection, 
  setFilterSelection, 
  handleSort, 
  sortConfig 
}) => (
  <TableHeader className="sticky top-0 bg-white z-10">
    <TableRow>
      <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2">
          <span>Tháng</span>
          <PopoverLocal
            optionArray={filterOptions.month}
            filterKey={"month"}
            filterSelection={filterSelection}
            setFilterSelection={setFilterSelection}
          />
        </div>
      </TableHead>
      <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2">
          <span>Quý</span>
          <PopoverLocal
            optionArray={filterOptions.quarter}
            filterKey={"quarter"}
            filterSelection={filterSelection}
            setFilterSelection={setFilterSelection}
          />
        </div>
      </TableHead>
      <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2">
          <span>Năm</span>
          <PopoverLocal
            optionArray={filterOptions.year}
            filterKey={"year"}
            filterSelection={filterSelection}
            setFilterSelection={setFilterSelection}
          />
        </div>
      </TableHead>
      <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2">
          <span>Mã mặt hàng</span>
          <PopoverLocal
            optionArray={filterOptions.product}
            filterKey={"product"}
            filterSelection={filterSelection}
            setFilterSelection={setFilterSelection}
          />
        </div>
      </TableHead>
      <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2">
          <span>Khách hàng</span>
          <PopoverLocal
            optionArray={filterOptions.customer}
            filterKey={"customer"}
            filterSelection={filterSelection}
            setFilterSelection={setFilterSelection}
          />
        </div>
      </TableHead>
      <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2">
          <span>Thành phố</span>
          <PopoverLocal
            optionArray={filterOptions.city}
            filterKey={"city"}
            filterSelection={filterSelection}
            setFilterSelection={setFilterSelection}
          />
        </div>
      </TableHead>
      <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2">
          <span>Bang</span>
          <PopoverLocal
            optionArray={filterOptions.state}
            filterKey={"state"}
            filterSelection={filterSelection}
            setFilterSelection={setFilterSelection}
          />
        </div>
      </TableHead>
      <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2 cursor-pointer group" onClick={() => handleSort("[Measures].[Quantity]")}>
          <span className="group-hover:text-blue-600 transition-colors duration-200">Số lượng</span>
          <div className="flex flex-col">
            <svg 
              className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                sortConfig.key === "[Measures].[Quantity]" && sortConfig.direction === 'ascending' 
                  ? 'text-blue-500 transform -translate-y-0.5' 
                  : 'group-hover:text-blue-500'
              }`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <svg 
              className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                sortConfig.key === "[Measures].[Quantity]" && sortConfig.direction === 'descending' 
                  ? 'text-blue-500 transform translate-y-0.5' 
                  : 'group-hover:text-blue-500'
              }`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </TableHead>
      <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2 cursor-pointer group" onClick={() => handleSort("[Measures].[Total Revenue]")}>
          <span className="group-hover:text-blue-600 transition-colors duration-200">Tổng doanh thu</span>
          <div className="flex flex-col">
            <svg 
              className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                sortConfig.key === "[Measures].[Total Revenue]" && sortConfig.direction === 'ascending' 
                  ? 'text-blue-500 transform -translate-y-0.5' 
                  : 'group-hover:text-blue-500'
              }`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <svg 
              className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                sortConfig.key === "[Measures].[Total Revenue]" && sortConfig.direction === 'descending' 
                  ? 'text-blue-500 transform translate-y-0.5' 
                  : 'group-hover:text-blue-500'
              }`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </TableHead>
      <TableHead className="font-semibold text-gray-700 py-4 text-center">Số lượng bản ghi</TableHead>
    </TableRow>
  </TableHeader>
));

// Tách component TableRow thành component riêng
const TableRowComponent = memo(({ invoice }) => (
  <TableRow className="border-b border-gray-100">
    <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"]}</TableCell>
    <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Time].[Quarter].[Quarter].[MEMBER_CAPTION]"]}</TableCell>
    <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Time].[Year].[Year].[MEMBER_CAPTION]"]}</TableCell>
    <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Item].[Item Id].[Item Id].[MEMBER_CAPTION]"]}</TableCell>
    <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Customer].[Customer Id].[Customer Id].[MEMBER_CAPTION]"]}</TableCell>
    <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Customer].[City Id].[City Id].[MEMBER_CAPTION]"]}</TableCell>
    <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Customer].[State].[State].[MEMBER_CAPTION]"]}</TableCell>
    <TableCell className="py-3 border-r border-gray-100 text-center">
      {invoice["[Measures].[Quantity]"].toLocaleString()}
    </TableCell>
    <TableCell className="py-3 border-r border-gray-100 text-center">
      {invoice["[Measures].[Total Revenue]"].toLocaleString('vi-VN')} VND
    </TableCell>
    <TableCell className="py-3 text-center"></TableCell>
  </TableRow>
));

// Tách component SummaryRow thành component riêng
const SummaryRowComponent = memo(({ totalQuantity, totalRevenue, paginatedData }) => (
  <TableRow className="bg-gray-50 font-semibold sticky top-[48px] z-10">
    <TableCell colSpan={7} className="text-center py-4 border-r border-gray-200">Tổng cộng:</TableCell>
    <TableCell className="py-4 border-r border-gray-200 text-center">
      {totalQuantity.toLocaleString()}
    </TableCell>
    <TableCell className="py-4 border-r border-gray-200 text-center">
      {totalRevenue.toLocaleString('vi-VN')} VND
    </TableCell>
    <TableCell className="py-4 text-center">{paginatedData.length.toLocaleString()}</TableCell>
  </TableRow>
));

// Tách component Dashboard thành component riêng
const DashboardComponent = memo(({ displayData }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const chartsPerPage = 4;

  // Tính toán dữ liệu cho các biểu đồ
  const chartData = useMemo(() => {
    if (!displayData || displayData.length === 0) return [];

    // Nhóm dữ liệu theo tháng
    const monthlyData = displayData.reduce((acc, item) => {
      const month = item["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"];
      if (!acc[month]) {
        acc[month] = {
          month,
          quantity: 0,
          revenue: 0
        };
      }
      acc[month].quantity += item["[Measures].[Quantity]"];
      acc[month].revenue += item["[Measures].[Total Revenue]"];
      return acc;
    }, {});

    return Object.values(monthlyData).sort((a, b) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
  }, [displayData]);

  // Tính toán dữ liệu cho biểu đồ tròn
  const pieData = useMemo(() => {
    if (!displayData || displayData.length === 0) return [];

    // Nhóm dữ liệu theo thành phố
    const cityData = displayData.reduce((acc, item) => {
      const city = item["[Dim Customer].[City Id].[City Id].[MEMBER_CAPTION]"];
      if (!acc[city]) {
        acc[city] = {
          name: city,
          value: 0
        };
      }
      acc[city].value += item["[Measures].[Total Revenue]"];
      return acc;
    }, {});

    return Object.values(cityData).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [displayData]);

  // Tính toán dữ liệu cho các biểu đồ khác
  const stateData = useMemo(() => {
    if (!displayData || displayData.length === 0) return [];
    return displayData.reduce((acc, item) => {
      const state = item["[Dim Customer].[State].[State].[MEMBER_CAPTION]"];
      if (!acc[state]) {
        acc[state] = {
          name: state,
          value: 0
        };
      }
      acc[state].value += item["[Measures].[Total Revenue]"];
      return acc;
    }, {});
  }, [displayData]);

  const customerData = useMemo(() => {
    if (!displayData || displayData.length === 0) return [];
    return displayData.reduce((acc, item) => {
      const customer = item["[Dim Customer].[Customer Id].[Customer Id].[MEMBER_CAPTION]"];
      if (!acc[customer]) {
        acc[customer] = {
          name: customer,
          value: 0
        };
      }
      acc[customer].value += item["[Measures].[Total Revenue]"];
      return acc;
    }, {});
  }, [displayData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Định nghĩa tất cả các biểu đồ
  const allCharts = [
    {
      title: "Thống kê tổng quan",
      type: "overview",
      data: displayData,
      stats: [
        {
          title: "Tổng doanh thu",
          value: displayData.reduce((acc, item) => acc + item["[Measures].[Total Revenue]"], 0),
          format: "currency",
          color: "blue"
        },
        {
          title: "Tổng số lượng",
          value: displayData.reduce((acc, item) => acc + item["[Measures].[Quantity]"], 0),
          format: "number",
          color: "green"
        },
        {
          title: "Số lượng đơn hàng",
          value: displayData.length,
          format: "number",
          color: "purple"
        },
        {
          title: "Doanh thu trung bình",
          value: displayData.reduce((acc, item) => acc + item["[Measures].[Total Revenue]"], 0) / displayData.length,
          format: "currency",
          color: "orange"
        }
      ]
    },
    {
      title: "Doanh thu theo tháng",
      type: "bar",
      data: chartData,
      dataKey: "revenue",
      name: "Doanh thu",
      color: "#8884d8"
    },
    {
      title: "Số lượng bán theo tháng",
      type: "line",
      data: chartData,
      dataKey: "quantity",
      name: "Số lượng",
      color: "#82ca9d"
    },
    {
      title: "Top 5 thành phố có doanh thu cao nhất",
      type: "pie",
      data: pieData,
      dataKey: "value",
      name: "Doanh thu",
      color: COLORS
    },
    {
      title: "Doanh thu theo bang",
      type: "bar",
      data: Object.values(stateData).sort((a, b) => b.value - a.value).slice(0, 10),
      dataKey: "value",
      name: "Doanh thu",
      color: "#8884d8"
    },
    {
      title: "Top 10 khách hàng có doanh thu cao nhất",
      type: "bar",
      data: Object.values(customerData).sort((a, b) => b.value - a.value).slice(0, 10),
      dataKey: "value",
      name: "Doanh thu",
      color: "#82ca9d"
    },
    {
      title: "Phân bố doanh thu theo quý",
      type: "pie",
      data: displayData.reduce((acc, item) => {
        const quarter = item["[Dim Time].[Quarter].[Quarter].[MEMBER_CAPTION]"];
        if (!acc[quarter]) {
          acc[quarter] = {
            name: quarter,
            value: 0
          };
        }
        acc[quarter].value += item["[Measures].[Total Revenue]"];
        return acc;
      }, {}),
      dataKey: "value",
      name: "Doanh thu",
      color: COLORS
    },
    // Thêm các biểu đồ khác ở đây...
  ];

  // Tính toán số trang
  const totalPages = Math.ceil(allCharts.length / chartsPerPage);

  // Lấy các biểu đồ cho trang hiện tại
  const currentCharts = allCharts.slice(
    currentPage * chartsPerPage,
    (currentPage + 1) * chartsPerPage
  );

  // Xử lý chuyển trang
  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Render biểu đồ
  const renderChart = (chart) => {
    if (chart.type === "overview") {
      return (
        <div className="grid grid-cols-2 gap-4 h-[300px]">
          {chart.stats.map((stat, index) => (
            <div key={index} className={`bg-${stat.color}-50 p-4 rounded-lg flex flex-col justify-center`}>
              <p className={`text-sm text-${stat.color}-600 mb-2`}>{stat.title}</p>
              <p className={`text-2xl font-bold text-${stat.color}-700`}>
                {stat.format === "currency" 
                  ? `${stat.value.toLocaleString('vi-VN')} VND`
                  : stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      );
    }

    if (chart.type === "bar") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={chart.dataKey} name={chart.name} fill={chart.color} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chart.type === "line") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={chart.dataKey} name={chart.name} stroke={chart.color} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chart.type === "pie") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={Object.values(chart.data)}
              dataKey={chart.dataKey}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {Object.values(chart.data).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chart.color[index % chart.color.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value.toLocaleString('vi-VN')} VND`, chart.name]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <div className="relative">
        {/* Nút điều hướng */}
        <div className="absolute -left-12 top-1/2 transform -translate-y-1/2">
          <button
            onClick={handlePrevPage}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
            disabled={currentPage === 0}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="absolute -right-12 top-1/2 transform -translate-y-1/2">
          <button
            onClick={handleNextPage}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
            disabled={currentPage === totalPages - 1}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Grid biểu đồ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {currentCharts.map((chart, index) => (
            <Card key={index} className="p-4">
              <h3 className="text-base font-semibold mb-3">{chart.title}</h3>
              <div className="h-[300px]">
                {renderChart(chart)}
              </div>
            </Card>
          ))}
        </div>

        {/* Chỉ báo trang */}
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentPage === index ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export default function TableDWH() {
  const [cleanData, setCleanData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [dtgValues, setDTGValues] = useState("Month");
  const [dmhValues, setDMHValues] = useState("None");
  const [dkhValues, setDKHValues] = useState("None");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(100);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [filterOptions, setFilterOptions] = useState({
    month: [],
    quarter: [],
    year: [],
    product: [],
    customer: [],
    city: [],
    state: [],
  });

  const { data: fetchedData, isLoading: isDataLoading, fetchData } = useDataFetching();

  // Memoize filter selection
  const [filterSelection, setFilterSelection] = useState({
    month: [],
    quarter: [],
    year: [],
    product: [],
    customer: [],
    city: [],
    state: [],
  });

  // Memoize totals calculation
  const { totalQuantity, totalRevenue } = useMemo(() => {
    if (!displayData || displayData.length === 0) {
      return { totalQuantity: 0, totalRevenue: 0 };
    }

    return {
      totalQuantity: displayData.reduce(
        (acc, invoice) => acc + invoice["[Measures].[Quantity]"],
        0
      ),
      totalRevenue: displayData.reduce(
        (acc, invoice) => acc + invoice["[Measures].[Total Revenue]"],
        0
      ),
    };
  }, [displayData]);

  // Memoize filtered data
  const filteredData = useMemo(() => {
    if (!cleanData) return [];
    
    const dimensionMap = {
      month: "[Dim Time].[Month].[Month].[MEMBER_CAPTION]",
      quarter: "[Dim Time].[Quarter].[Quarter].[MEMBER_CAPTION]",
      year: "[Dim Time].[Year].[Year].[MEMBER_CAPTION]",
      product: "[Dim Item].[Item Id].[Item Id].[MEMBER_CAPTION]",
      customer: "[Dim Customer].[Customer Id].[Customer Id].[MEMBER_CAPTION]",
      city: "[Dim Customer].[City Id].[City Id].[MEMBER_CAPTION]",
      state: "[Dim Customer].[State].[State].[MEMBER_CAPTION]",
    };

    return cleanData.filter((item) => {
      return Object.entries(filterSelection).every(([key, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        const dimKey = dimensionMap[key];
        const value = item[dimKey];
        return selectedValues.includes(value);
      });
    });
  }, [cleanData, filterSelection]);

  // Memoize paginated data
  const paginatedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Optimize handleGetData
  const handleGetData = useCallback(async () => {
    try {
      setIsLoading(true);
      const cleanDataTmp = await fetchData(dtgValues, dmhValues, dkhValues);
      if (cleanDataTmp.length > 0) {
        setCleanData(cleanDataTmp);
        setDisplayData(cleanDataTmp);
        const distinctOptions = extractDistinctValues(cleanDataTmp);
        setFilterOptions(distinctOptions);
        setFilterSelection({
          month: [],
          quarter: [],
          year: [],
          product: [],
          customer: [],
          city: [],
          state: [],
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi khi tải dữ liệu!", {
        description: "Vui lòng thử lại sau",
        duration: 3000,
        position: "top-right"
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, dtgValues, dmhValues, dkhValues]);

  // Optimize handleSort
  const handleSort = useCallback((key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...displayData].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      return direction === 'ascending' ? aValue - bValue : bValue - aValue;
    });

    setDisplayData(sortedData);
  }, [sortConfig, displayData]);

  useEffect(() => {
    handleGetData();
  }, []);

  useEffect(() => {
    if (displayData && displayData.length > 0) {
      const totalQuantityTmp = displayData.reduce(
        (acc, invoice) => acc + invoice["[Measures].[Quantity]"],
        0
      );
      const totalRevenueTmp = displayData.reduce(
        (acc, invoice) => acc + invoice["[Measures].[Total Revenue]"],
        0
      );
    }
  }, [displayData]);

  useEffect(() => {
    if (!cleanData) return;
    const dimensionMap = {
      month: "[Dim Time].[Month].[Month].[MEMBER_CAPTION]",
      quarter: "[Dim Time].[Quarter].[Quarter].[MEMBER_CAPTION]",
      year: "[Dim Time].[Year].[Year].[MEMBER_CAPTION]",
      product: "[Dim Item].[Item Id].[Item Id].[MEMBER_CAPTION]",
      customer:
        "[Dim Customer].[Customer Id].[Customer Id].[MEMBER_CAPTION]",
      city: "[Dim Customer].[City Id].[City Id].[MEMBER_CAPTION]",
      state: "[Dim Customer].[State].[State].[MEMBER_CAPTION]",
    };
    const filteredData = cleanData.filter((item) => {
      return Object.entries(filterSelection).every(([key, selectedValues]) => {
        // Bỏ qua nếu chưa chọn filter cho trường này
        if (selectedValues.length === 0) return true;

        const dimKey = dimensionMap[key];
        const value = item[dimKey];

        return selectedValues.includes(value);
      });
    });
    setDisplayData(filteredData);
  }, [filterSelection]);

  // Tính tổng số trang
  const totalPages = Math.ceil((displayData?.length || 0) / pageSize);

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSelection]);

  const handleExportExcel = () => {
    try {
      // Tạo workbook mới
      const wb = XLSX.utils.book_new();
      
      // Chuẩn bị dữ liệu cho Excel
      const excelData = displayData.map(item => ({
        'Tháng': item["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"],
        'Quý': item["[Dim Time].[Quarter].[Quarter].[MEMBER_CAPTION]"],
        'Năm': item["[Dim Time].[Year].[Year].[MEMBER_CAPTION]"],
        'Mã mặt hàng': item["[Dim Item].[Item Id].[Item Id].[MEMBER_CAPTION]"],
        'Khách hàng': item["[Dim Customer].[Customer Id].[Customer Id].[MEMBER_CAPTION]"],
        'Thành phố': item["[Dim Customer].[City Id].[City Id].[MEMBER_CAPTION]"],
        'Bang': item["[Dim Customer].[State].[State].[MEMBER_CAPTION]"],
        'Số lượng': item["[Measures].[Quantity]"],
        'Tổng doanh thu': item["[Measures].[Total Revenue]"]
      }));

      // Thêm dòng tổng cộng
      excelData.push({
        'Tháng': 'Tổng cộng',
        'Quý': '',
        'Năm': '',
        'Mã mặt hàng': '',
        'Khách hàng': '',
        'Thành phố': '',
        'Bang': '',
        'Số lượng': totalQuantity,
        'Tổng doanh thu': totalRevenue
      });

      // Tạo worksheet từ dữ liệu
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Định dạng cột
      const wscols = [
        {wch: 10}, // Tháng
        {wch: 10}, // Quý
        {wch: 10}, // Năm
        {wch: 15}, // Mã mặt hàng
        {wch: 20}, // Khách hàng
        {wch: 15}, // Thành phố
        {wch: 15}, // Bang
        {wch: 15}, // Số lượng
        {wch: 20}  // Tổng doanh thu
      ];
      ws['!cols'] = wscols;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, "Báo cáo");

      // Tạo tên file với ngày hiện tại
      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `BaoCaoDoanhThu_${currentDate}.xlsx`;

      // Xuất file
      XLSX.writeFile(wb, fileName);

      toast.success("Xuất Excel thành công!", {
        description: `File ${fileName} đã được tải xuống`,
        duration: 3000,
        position: "top-right"
      });
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      toast.error("Xuất Excel thất bại!", {
        description: "Vui lòng thử lại",
        duration: 3000,
        position: "top-right"
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      if (!displayData || displayData.length === 0) {
        toast.error("Không có dữ liệu để xuất!", {
          description: "Vui lòng tải dữ liệu trước khi xuất PDF",
          duration: 3000,
          position: "top-right"
        });
        return;
      }

      // Tạo instance của jsPDF với cấu hình phù hợp
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });

      // Thêm font Times New Roman
      doc.setFont("times", "normal");

      // Thêm tiêu đề
      doc.setFontSize(24);
      doc.setTextColor(41, 128, 185);
      doc.text('Báo Cáo Doanh Thu', doc.internal.pageSize.width / 2, 25, { align: 'center' });

      // Thêm thông tin thời gian
      const currentDate = new Date().toLocaleDateString('vi-VN');
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Ngày xuất báo cáo: ${currentDate}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });

      // Thêm đường kẻ ngang
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 40, doc.internal.pageSize.width - 14, 40);

      // Tính toán dữ liệu cho biểu đồ
      const chartData = displayData.reduce((acc, item) => {
        const month = item["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"];
        if (!acc[month]) {
          acc[month] = {
            month,
            quantity: 0,
            revenue: 0
          };
        }
        acc[month].quantity += item["[Measures].[Quantity]"];
        acc[month].revenue += item["[Measures].[Total Revenue]"];
        return acc;
      }, {});

      const monthlyData = Object.values(chartData).sort((a, b) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

      // Tạo canvas cho dashboard
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Vẽ các biểu đồ lên canvas
      const dashboardComponent = document.querySelector('.dashboard-container');
      if (dashboardComponent) {
        const svgElements = dashboardComponent.querySelectorAll('svg');
        svgElements.forEach((svg, index) => {
          const svgData = new XMLSerializer().serializeToString(svg);
          const img = new Image();
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
          ctx.drawImage(img, 0, index * 200, 1200, 200);
        });
      }

      // Chuyển canvas thành ảnh
      const dashboardImage = canvas.toDataURL('image/png');

      // Thêm ảnh dashboard vào PDF
      doc.addImage(dashboardImage, 'PNG', 14, 45, 180, 120);

      // Thêm thống kê tổng quan
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('Thống kê tổng quan', 14, 175);

      const totalRevenue = displayData.reduce((acc, item) => acc + item["[Measures].[Total Revenue]"], 0);
      const totalQuantity = displayData.reduce((acc, item) => acc + item["[Measures].[Quantity]"], 0);
      const avgRevenue = totalRevenue / displayData.length;

      // Tạo bảng thống kê
      autoTable(doc, {
        startY: 180,
        head: [['Chỉ số', 'Giá trị']],
        body: [
          ['Tổng doanh thu', totalRevenue.toLocaleString('vi-VN') + ' VND'],
          ['Tổng số lượng', totalQuantity.toLocaleString()],
          ['Số lượng đơn hàng', displayData.length.toLocaleString()],
          ['Doanh thu trung bình', avgRevenue.toLocaleString('vi-VN') + ' VND']
        ],
        theme: 'grid',
        styles: {
          font: 'times',
          fontSize: 10,
          cellPadding: 5,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          textColor: [50, 50, 50]
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 100, halign: 'right' }
        }
      });

      // Thêm chi tiết dữ liệu
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('Chi tiết dữ liệu', 14, doc.lastAutoTable.finalY + 20);

      // Chuẩn bị dữ liệu cho bảng chi tiết
      const tableData = displayData.map(item => [
        item["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"] || '',
        item["[Dim Time].[Quarter].[Quarter].[MEMBER_CAPTION]"] || '',
        item["[Dim Time].[Year].[Year].[MEMBER_CAPTION]"] || '',
        item["[Dim Item].[Item Id].[Item Id].[MEMBER_CAPTION]"] || '',
        item["[Dim Customer].[Customer Id].[Customer Id].[MEMBER_CAPTION]"] || '',
        item["[Dim Customer].[City Id].[City Id].[MEMBER_CAPTION]"] || '',
        item["[Dim Customer].[State].[State].[MEMBER_CAPTION]"] || '',
        (item["[Measures].[Quantity]"] || 0).toLocaleString(),
        (item["[Measures].[Total Revenue]"] || 0).toLocaleString('vi-VN') + ' VND'
      ]);

      // Thêm dòng tổng cộng
      tableData.push([
        'Tổng cộng',
        '',
        '',
        '',
        '',
        '',
        '',
        totalQuantity.toLocaleString(),
        totalRevenue.toLocaleString('vi-VN') + ' VND'
      ]);

      // Tạo bảng chi tiết
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 25,
        head: [['Tháng', 'Quý', 'Năm', 'Mã mặt hàng', 'Khách hàng', 'Thành phố', 'Bang', 'Số lượng', 'Tổng doanh thu']],
        body: tableData,
        theme: 'grid',
        styles: {
          font: 'times',
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          textColor: [50, 50, 50]
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 15 },
          2: { cellWidth: 15 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 25 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20, halign: 'right' },
          8: { cellWidth: 30, halign: 'right' }
        },
        footStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'right',
          fontSize: 9
        },
        didDrawPage: function(data) {
          // Thêm footer cho mỗi trang
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Trang ${data.pageNumber} / ${data.pageCount}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
          );

          // Thêm đường kẻ ngang ở footer
          doc.setDrawColor(200, 200, 200);
          doc.line(
            14,
            doc.internal.pageSize.height - 15,
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 15
          );
        },
        margin: { top: 45, right: 14, bottom: 20, left: 14 },
        tableWidth: 'auto',
        showFoot: 'lastPage'
      });

      // Tạo tên file với ngày hiện tại
      const fileDate = new Date().toISOString().split('T')[0];
      const fileName = `BaoCaoDoanhThu_${fileDate}.pdf`;

      // Xuất file PDF
      doc.save(fileName);

      toast.success("Xuất PDF thành công!", {
        description: `File ${fileName} đã được tải xuống`,
        duration: 3000,
        position: "top-right"
      });
    } catch (error) {
      console.error("Lỗi chi tiết khi xuất PDF:", error);
      if (error.message) console.error("Error message:", error.message);
      if (error.stack) console.error("Error stack:", error.stack);
      
      toast.error("Xuất PDF thất bại!", {
        description: "Vui lòng thử lại hoặc liên hệ hỗ trợ",
        duration: 3000,
        position: "top-right"
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 space-y-6 bg-white">
      {/* Control Panel */}
      <Card className="p-6 bg-white">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Bộ lọc dữ liệu</h2>
              <p className="text-sm text-gray-500">Chọn các tiêu chí để lọc và phân tích dữ liệu</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleGetData}
                disabled={(dtgValues === "None" && dmhValues === "None" && dkhValues === "None") || isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  <span>Xác nhận</span>
                )}
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={handleExportPDF}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={!displayData || displayData.length === 0}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Xuất PDF</span>
                </Button>
                <Button
                  onClick={handleExportExcel}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={!displayData || displayData.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span>Xuất Excel</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Thời Gian */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700">Thời Gian</label>
                <p className="text-xs text-gray-500">Chọn khoảng thời gian phân tích</p>
              </div>
              <SelectLocal
                placeholder="DIM_ThoiGian"
                arrayValues={[
                  { label: "Month", value: "Month" },
                  { label: "Quarter", value: "Quarter" },
                  { label: "Year", value: "Year" },
                  { label: "None", value: "None" },
                ]}
                onChange={setDTGValues}
                defaultValue={dtgValues}
                className="w-full text-sm"
              />
            </div>

            {/* Mặt Hàng */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700">Mặt Hàng</label>
                <p className="text-xs text-gray-500">Chọn loại mặt hàng cần phân tích</p>
              </div>
              <SelectLocal
                placeholder="Dim_Item"
                arrayValues={[
                  { label: "Mã Mặt Hàng", value: "Item_Id" },
                  { label: "None", value: "None" },
                ]}
                onChange={setDMHValues}
                defaultValue={dmhValues}
                className="w-full text-sm"
              />
            </div>

            {/* Khách Hàng */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700">Khách Hàng</label>
                <p className="text-xs text-gray-500">Chọn nhóm khách hàng cần phân tích</p>
              </div>
              <SelectLocal
                placeholder="Dim_Customer"
                arrayValues={[
                  { label: "Khách Hàng", value: "Customer_Id" },
                  { label: "Thành Phố", value: "City_Id" },
                  { label: "Bang", value: "State" },
                  { label: "None", value: "None" },
                ]}
                onChange={setDKHValues}
                defaultValue={dkhValues}
                className="w-full text-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Dashboard */}
      {displayData && displayData.length > 0 && (
        <div className="w-full flex justify-center">
          <DashboardComponent displayData={displayData} />
        </div>
      )}

      {/* Data Table */}
      <Card className="flex-1 overflow-hidden bg-white">
        <div className="h-full flex flex-col">
          <div className="overflow-auto flex-1">
            <Table className="min-w-[1024px]">
              <TableHeaderComponent 
                filterOptions={filterOptions}
                filterSelection={filterSelection}
                setFilterSelection={setFilterSelection}
                handleSort={handleSort}
                sortConfig={sortConfig}
              />
              {paginatedData && paginatedData.length > 0 && totalQuantity && totalRevenue ? (
                <TableBody>
                  <SummaryRowComponent 
                    totalQuantity={totalQuantity}
                    totalRevenue={totalRevenue}
                    paginatedData={paginatedData}
                  />
                  {paginatedData.map((invoice, index) => (
                    <TableRowComponent key={index} invoice={invoice} />
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-gray-500">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span>Đang tải dữ liệu...</span>
                        </div>
                      ) : (
                        <span>Không có dữ liệu để hiển thị</span>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </div>
          
          {/* Pagination */}
          {displayData && displayData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}
        </div>
      </Card>
    </div>
  );
}