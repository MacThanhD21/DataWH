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
import { useEffect, useState, useMemo, useCallback } from "react";
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
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });

      // Thêm logo hoặc hình ảnh (nếu có)
      // doc.addImage(logoBase64, 'PNG', 14, 10, 30, 30);

      // Thêm tiêu đề với font size lớn hơn và màu sắc
      doc.setFontSize(24);
      doc.setTextColor(41, 128, 185); // Màu xanh dương
      doc.setFont('helvetica', 'bold');
      doc.text('Báo Cáo Doanh Thu', doc.internal.pageSize.width / 2, 25, { align: 'center' });

      // Thêm thông tin thời gian với font size nhỏ hơn
      const currentDate = new Date().toLocaleDateString('vi-VN');
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100); // Màu xám
      doc.setFont('helvetica', 'normal');
      doc.text(`Ngày xuất báo cáo: ${currentDate}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });

      // Thêm đường kẻ ngang
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 40, doc.internal.pageSize.width - 14, 40);

      // Chuẩn bị dữ liệu cho bảng
      const tableData = displayData.map(item => {
        try {
          return [
            item["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"] || '',
            item["[Dim Time].[Quarter].[Quarter].[MEMBER_CAPTION]"] || '',
            item["[Dim Time].[Year].[Year].[MEMBER_CAPTION]"] || '',
            item["[Dim Item].[Item Id].[Item Id].[MEMBER_CAPTION]"] || '',
            item["[Dim Customer].[Customer Id].[Customer Id].[MEMBER_CAPTION]"] || '',
            item["[Dim Customer].[City Id].[City Id].[MEMBER_CAPTION]"] || '',
            item["[Dim Customer].[State].[State].[MEMBER_CAPTION]"] || '',
            (item["[Measures].[Quantity]"] || 0).toLocaleString(),
            (item["[Measures].[Total Revenue]"] || 0).toLocaleString('vi-VN') + ' VND'
          ];
        } catch (error) {
          console.error("Lỗi khi xử lý dòng dữ liệu:", error);
          return Array(9).fill('');
        }
      });

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

      // Tạo bảng với định dạng đẹp
      autoTable(doc, {
        head: [['Tháng', 'Quý', 'Năm', 'Mã mặt hàng', 'Khách hàng', 'Thành phố', 'Bang', 'Số lượng', 'Tổng doanh thu']],
        body: tableData,
        startY: 45,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          font: 'helvetica',
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          textColor: [50, 50, 50]
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10,
          lineWidth: 0.1,
          cellPadding: 4
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
          fontSize: 10,
          cellPadding: 4
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
    <div className="flex flex-col h-[calc(100vh-64px)] p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Control Panel */}
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm shadow-lg border-0">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Bộ lọc dữ liệu</h2>
                <p className="text-sm text-gray-500">Chọn các tiêu chí để lọc và phân tích dữ liệu</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Action Button */}
              <Button
                onClick={handleGetData}
                disabled={
                  (dtgValues === "None" &&
                    dmhValues === "None" &&
                    dkhValues === "None") ||
                  isLoading
                }
                className="relative min-w-[160px] h-11 overflow-hidden group bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative flex items-center justify-center gap-3 px-6 py-2.5">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                      <span className="text-sm text-white font-medium">Đang xử lý...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      <span className="text-sm font-medium">Xác nhận</span>
                    </div>
                  )}
                </div>
              </Button>

              <div className="h-8 w-[1px] bg-gray-200" />

              <div className="flex gap-3">
                <Button
                  onClick={handleExportPDF}
                  className="relative min-w-[130px] h-10 overflow-hidden group"
                  disabled={!displayData || displayData.length === 0}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-[length:200%_100%] group-hover:bg-[length:100%_100%] transition-all duration-500" />
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  {/* Border gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-pink-400 to-red-400 rounded-md p-[1px]">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-md" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative flex items-center justify-center gap-2 px-4 py-2">
                    <FileText className="h-4 w-4 text-white" />
                    <span className="text-sm text-white font-medium">Xuất PDF</span>
                  </div>
                </Button>
                <Button
                  onClick={handleExportExcel}
                  className="relative min-w-[130px] h-10 overflow-hidden group"
                  disabled={!displayData || displayData.length === 0}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-[length:200%_100%] group-hover:bg-[length:100%_100%] transition-all duration-500" />
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  {/* Border gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 rounded-md p-[1px]">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 rounded-md" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative flex items-center justify-center gap-2 px-4 py-2">
                    <Download className="h-4 w-4 text-white" />
                    <span className="text-sm text-white font-medium">Xuất Excel</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Thời Gian */}
            <div className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Thời Gian</label>
                  <p className="text-xs text-gray-500">Chọn khoảng thời gian phân tích</p>
                </div>
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
            <div className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                  <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Mặt Hàng</label>
                  <p className="text-xs text-gray-500">Chọn loại mặt hàng cần phân tích</p>
                </div>
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
            <div className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Khách Hàng</label>
                  <p className="text-xs text-gray-500">Chọn nhóm khách hàng cần phân tích</p>
                </div>
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

      {/* Data Table */}
      <Card className="flex-1 overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <div className="h-full flex flex-col">
          <div className="overflow-auto flex-1 custom-scrollbar">
            <Table className="min-w-[1024px]">
              <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300">
                  <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-2 group">
                      <span className="group-hover:text-blue-600 transition-colors duration-200">Tháng</span>
                      <PopoverLocal
                        optionArray={filterOptions.month}
                        filterKey={"month"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-2 group">
                      <span className="group-hover:text-blue-600 transition-colors duration-200">Quý</span>
                      <PopoverLocal
                        optionArray={filterOptions.quarter}
                        filterKey={"quarter"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-2 group">
                      <span className="group-hover:text-blue-600 transition-colors duration-200">Năm</span>
                      <PopoverLocal
                        optionArray={filterOptions.year}
                        filterKey={"year"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-2 group">
                      <span className="group-hover:text-blue-600 transition-colors duration-200">Mã mặt hàng</span>
                      <PopoverLocal
                        optionArray={filterOptions.product}
                        filterKey={"product"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-2 group">
                      <span className="group-hover:text-blue-600 transition-colors duration-200">Khách hàng</span>
                      <PopoverLocal
                        optionArray={filterOptions.customer}
                        filterKey={"customer"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-2 group">
                      <span className="group-hover:text-blue-600 transition-colors duration-200">Thành phố</span>
                      <PopoverLocal
                        optionArray={filterOptions.city}
                        filterKey={"city"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 border-r border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-2 group">
                      <span className="group-hover:text-blue-600 transition-colors duration-200">Bang</span>
                      <PopoverLocal
                        optionArray={filterOptions.state}
                        filterKey={"state"}
                        filterSelection={filterSelection}
                        setFilterSelection={setFilterSelection}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
              {paginatedData && paginatedData.length > 0 && totalQuantity && totalRevenue ? (
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
                    <TableCell className="font-medium py-4 text-center">{paginatedData.length.toLocaleString()}</TableCell>
                  </TableRow>
                  
                  {/* Data Rows */}
                  {paginatedData.map((invoice, index) => (
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