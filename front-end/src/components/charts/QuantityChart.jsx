"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const QuantityChart = ({ data, onChartClick, totalQuantity }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data}
        onClick={(data) => onChartClick(data.activePayload[0].payload, 'quantity')}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="timeLabel"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis />
        <Tooltip 
          formatter={(value) => [value.toLocaleString(), 'Số lượng']}
          labelFormatter={(label) => label}
        />
        <Legend />
        <Bar
          dataKey="quantity"
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default QuantityChart; 