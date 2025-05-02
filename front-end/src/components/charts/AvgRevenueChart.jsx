"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Copy, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { useRef } from 'react';

const AvgRevenueChart = ({ data, onChartClick }) => {
  const chartRef = useRef(null);

  const handleCopyChart = async () => {
    try {
      if (!chartRef.current) return;

      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      canvas.toBlob((blob) => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]);
      });

      toast.success("Đã sao chép biểu đồ!");
    } catch (error) {
      console.error("Lỗi khi sao chép:", error);
      toast.error("Sao chép thất bại!");
    }
  };

  const handleExportChart = async () => {
    try {
      if (!chartRef.current) return;

      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `BieuDoDoanhThuTrungBinh_${currentDate}.png`;

      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success("Xuất ảnh thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất ảnh:", error);
      toast.error("Xuất ảnh thất bại!");
    }
  };

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <button
          onClick={handleCopyChart}
          className="h-8 w-8 hover:bg-gray-100 transition-colors border border-gray-200 rounded-md flex items-center justify-center bg-white shadow-sm"
          title="Sao chép biểu đồ"
        >
          <Copy className="h-4 w-4 text-gray-600" />
        </button>
        <button
          onClick={handleExportChart}
          className="h-8 w-8 hover:bg-gray-100 transition-colors border border-gray-200 rounded-md flex items-center justify-center bg-white shadow-sm"
          title="Tải xuống biểu đồ"
        >
          <Download className="h-4 w-4 text-gray-600" />
        </button>
      </div>
      <div ref={chartRef} className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
            onClick={(data) => onChartClick(data.activePayload[0].payload, 'avgRevenue')}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timeLabel"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value.toLocaleString('vi-VN')} VND`, 'Doanh thu trung bình']}
              labelFormatter={(label) => label}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgRevenue"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AvgRevenueChart; 