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

export default function TableDWH() {
  const [metaData, setMetaData] = useState({});
  const [cleanData, setCleanData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [dtgValues, setDTGValues] = useState("Month");
  const [dmhValues, setDMHValues] = useState("None");
  const [dkhValues, setDKHValues] = useState("None");
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (error) {
      console.error("Error fetching data:", error);
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
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Control Panel */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dim_Time</label>
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
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dim_Item</label>
              <SelectLocal
                placeholder="Dim_Item"
                arrayValues={[
                  { label: "Item Id", value: "Item_Id" },
                  { label: "None", value: "None" },
                ]}
                onChange={setDMHValues}
                defaultValue={dmhValues}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dim_Customer</label>
              <SelectLocal
                placeholder="Dim_Customer"
                arrayValues={[
                  { label: "Customer", value: "Customer_Id" },
                  { label: "City", value: "City_id" },
                  { label: "State", value: "State" },
                  { label: "None", value: "None" },
                ]}
                onChange={setDKHValues}
                defaultValue={dkhValues}
              />
            </div>
          </div>
          <div className="flex items-end justify-end">
            <Button
              onClick={handleGetData}
              disabled={
                (dtgValues === "None" &&
                  dmhValues === "None" &&
                  dkhValues === "None") ||
                isLoading
              }
              className="min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Xác nhận
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="flex-1 overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <div className="h-full flex flex-col">
          <div className="overflow-auto flex-1 custom-scrollbar">
            <Table className="min-w-[1024px]">
              <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300">
                  <TableHead className="font-semibold text-gray-700 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span>Tháng</span>
                      <PopoverLocal
                        optionArray={filterOptions.month}
                        filterKey={"month"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span>Quý</span>
                      <PopoverLocal
                        optionArray={filterOptions.quarter}
                        filterKey={"quarter"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span>Năm</span>
                      <PopoverLocal
                        optionArray={filterOptions.year}
                        filterKey={"year"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span>Mã mặt hàng</span>
                      <PopoverLocal
                        optionArray={filterOptions.product}
                        filterKey={"product"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span>Khách hàng</span>
                      <PopoverLocal
                        optionArray={filterOptions.customer}
                        filterKey={"customer"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span>Thành phố</span>
                      <PopoverLocal
                        optionArray={filterOptions.city}
                        filterKey={"city"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span>State</span>
                      <PopoverLocal
                        optionArray={filterOptions.state}
                        filterKey={"state"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-b border-gray-200">Số lượng</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-b border-gray-200">Tổng doanh thu</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-b border-gray-200">Số lượng bản ghi</TableHead>
                </TableRow>
              </TableHeader>
              {displayData && displayData.length > 0 && totalQuantity && totalRevenue ? (
                <TableBody>
                  {/* Summary Row */}
                  <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100 font-semibold sticky top-[48px] bg-white/95 backdrop-blur-sm z-10">
                    <TableCell colSpan={7} className="text-right py-4 border-b border-blue-200">Tổng cộng:</TableCell>
                    <TableCell className="font-medium py-4 border-b border-blue-200 bg-blue-50/50">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-blue-700">{totalQuantity.toLocaleString()}</span>
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium py-4 border-b border-blue-200 bg-green-50/50">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-green-700">{totalRevenue.toLocaleString('vi-VN')} VND</span>
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium py-4 border-b border-blue-200">{displayData.length.toLocaleString()}</TableCell>
                  </TableRow>
                  
                  {/* Data Rows */}
                  {displayData.map((invoice, index) => (
                    <TableRow 
                      key={index} 
                      className="hover:bg-gray-50/80 transition-all duration-300 border-b border-gray-100"
                    >
                      <TableCell className="py-3">{invoice["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3">{invoice["[Dim Time].[Quarter].[Quarter].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3">{invoice["[Dim Time].[Year].[Year].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3">{invoice["[Dim Item].[Item Id].[Item Id].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3">{invoice["[Dim Customer].[Customer Id].[Customer Id].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3">{invoice["[Dim Customer].[City Id].[City Id].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3">{invoice["[Dim Customer].[State].[State].[MEMBER_CAPTION]"]}</TableCell>
                      <TableCell className="py-3 text-right font-medium group">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                            {invoice["[Measures].[Quantity]"].toLocaleString()}
                          </span>
                          <svg className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-right font-medium group">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-green-600 group-hover:text-green-700 transition-colors duration-200">
                            {invoice["[Measures].[Total Revenue]"].toLocaleString('vi-VN')} VND
                          </span>
                          <svg className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </TableCell>
                      <TableCell className="py-3"></TableCell>
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
