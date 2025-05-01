"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AvgRevenueChart = ({ data, onChartClick }) => {
  return (
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
  );
};

export default AvgRevenueChart; 