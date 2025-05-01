"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SelectLocal } from "./ui_local/select_local";
import { Button } from "./button";
import { use, useEffect, useState } from "react";
import axiosInstance from "@/config/axios";
import { Loader2 } from "lucide-react";
import { PopoverLocal } from "./ui_local/popover_local";
import { extractDistinctValues } from "@/utils/functions";
import { Card, CardContent } from "./card";
import { toast } from "sonner";

export default function TableDWH() {
  const [metaData, setMetaData] = useState({});
  const [cleanData, setCleanData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [dtgValues, setDTGValues] = useState("Month");
  const [dmhValues, setDMHValues] = useState("None");
  const [dkhValues, setDKHValues] = useState("None");
  const [isLoading, setIsLoading] = useState(false);
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

  const [filterSelection, setFilterSelection] = useState({
    month: [],
    quarter: [],
    year: [],
    product: [],
    customer: [],
    city: [],
    state: [],
  });

  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const handleGetData = async () => {
    try {
      setIsLoading(true);
      const sendData = {
        Dim_Time: dtgValues,
        Dim_Item: dmhValues,
        Dim_Customer: dkhValues,
      };
      const { data } = await axiosInstance.post("/api/cube", sendData);
      console.log("Data received from server:", data);
      setMetaData(data);

      // dữ liệu liên quan tới DIM_KhachHang bị lặp, không hiểu sao
      const cleanDataTmp = Array.from(
        new Set(data.validData.map((item) => JSON.stringify(item)))
      ).map((str) => JSON.parse(str));

      // const cleanDataTmp = [data.validData[1]];
      // const cleanDataTmp = data.validData;
      setCleanData(cleanDataTmp);
      setDisplayData(cleanDataTmp);
      console.log("Cleaned data:", cleanDataTmp);

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

      toast.success("Dữ liệu đã được cập nhật thành công!", {
        description: `Đã tải ${cleanDataTmp.length} bản ghi`,
        duration: 3000,
        position: "top-right",
        style: {
          background: "linear-gradient(to right, #10B981, #059669)",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          padding: "1rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu!", {
        description: "Vui lòng kiểm tra kết nối và thử lại",
        duration: 3000,
        position: "top-right",
        style: {
          background: "linear-gradient(to right, #EF4444, #DC2626)",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          padding: "1rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      setTotalQuantity(totalQuantityTmp);
      setTotalRevenue(totalRevenueTmp);
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

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...displayData].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      
      if (direction === 'ascending') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setDisplayData(sortedData);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Control Panel */}
      <Card className="p-4 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm shadow-lg border-0">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <h2 className="text-sm font-semibold text-gray-700">Bộ lọc dữ liệu</h2>
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Thời Gian */}
            <div className="group">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-1 rounded-md bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <label className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Thời Gian</label>
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
            <div className="group">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-1 rounded-md bg-purple-50 group-hover:bg-purple-100 transition-colors">
                  <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <label className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Mặt Hàng</label>
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
            <div className="group">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-1 rounded-md bg-green-50 group-hover:bg-green-100 transition-colors">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <label className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Khách Hàng</label>
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

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleGetData}
              disabled={
                (dtgValues === "None" &&
                  dmhValues === "None" &&
                  dkhValues === "None") ||
                isLoading
              }
              className="relative min-w-[120px] h-9 overflow-hidden group"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] group-hover:bg-[length:100%_100%] transition-all duration-500" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              {/* Border gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 rounded-md p-[1px]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-md" />
              </div>
              
              {/* Content */}
              <div className="relative flex items-center justify-center gap-1.5 px-4 py-1.5">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-white font-medium">Xác nhận</span>
                    <svg 
                      className="w-3.5 h-3.5 text-white transform group-hover:translate-x-0.5 transition-transform duration-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 7l5 5m0 0l-5 5m5-5H6" 
                      />
                    </svg>
                  </div>
                )}
              </div>
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="flex-1 overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <div className="h-full flex flex-col">
          <div className="overflow-auto flex-1 custom-scrollbar">
            <Table className="min-w-[1024px]">
              <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300">
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
                      <span>Số lượng</span>
                      <div className="flex flex-col">
                        <svg 
                          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                            sortConfig.key === "[Measures].[Quantity]" && sortConfig.direction === 'ascending' 
                              ? 'text-blue-500 transform -translate-y-0.5' 
                              : 'group-hover:text-gray-500'
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
                              : 'group-hover:text-gray-500'
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
                      <span>Tổng doanh thu</span>
                      <div className="flex flex-col">
                        <svg 
                          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                            sortConfig.key === "[Measures].[Total Revenue]" && sortConfig.direction === 'ascending' 
                              ? 'text-blue-500 transform -translate-y-0.5' 
                              : 'group-hover:text-gray-500'
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
                              : 'group-hover:text-gray-500'
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
              {displayData && displayData.length > 0 && totalQuantity && totalRevenue ? (
                <TableBody>
                  {/* Summary Row */}
                  <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100 font-semibold sticky top-[48px] bg-white/95 backdrop-blur-sm z-10">
                    <TableCell colSpan={7} className="text-center py-4 border-r border-blue-200">Tổng cộng:</TableCell>
                    <TableCell className="font-medium py-4 border-r border-blue-200 bg-blue-50/50 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-blue-700">{totalQuantity.toLocaleString()}</span>
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium py-4 border-r border-blue-200 bg-green-50/50 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-green-700">{totalRevenue.toLocaleString('vi-VN')} VND</span>
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium py-4 text-center">{displayData.length.toLocaleString()}</TableCell>
                  </TableRow>
                  
                  {/* Data Rows */}
                  {displayData.map((invoice, index) => (
                    <TableRow 
                      key={index} 
                      className="hover:bg-gray-50/80 transition-all duration-300 border-b border-gray-100"
                    >
                      <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Time].[Quarter].[Quarter].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Time].[Year].[Year].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Item].[Item Id].[Item Id].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Customer].[Customer Id].[Customer Id].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Customer].[City Id].[City Id].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3 border-r border-gray-100 text-center">{invoice["[Dim Customer].[State].[State].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3 border-r border-gray-100 text-center font-medium group">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                            {invoice["[Measures].[Quantity]"].toLocaleString()}
                          </span>
                          <svg className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 border-r border-gray-100 text-center font-medium group">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-green-600 group-hover:text-green-700 transition-colors duration-200">
                            {invoice["[Measures].[Total Revenue]"].toLocaleString('vi-VN')} VND
                          </span>
                          <svg className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center"></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-gray-500">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          <span className="text-lg">Đang tải dữ liệu...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-lg">Không có dữ liệu để hiển thị</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
