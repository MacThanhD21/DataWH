"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Copy, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { useRef } from 'react';

const RevenueChart = ({ data, onChartClick, totalRevenue }) => {
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
      const fileName = `BieuDoDoanhThu_${currentDate}.png`;

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
          <AreaChart 
            data={data}
            onClick={(data) => onChartClick(data.activePayload[0].payload, 'revenue')}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timeLabel"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value.toLocaleString('vi-VN')} VND`, 'Doanh thu']}
              labelFormatter={(label) => label}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart; 