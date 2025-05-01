"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data, onChartClick, totalRevenue }) => {
  return (
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
  );
};

export default RevenueChart; 