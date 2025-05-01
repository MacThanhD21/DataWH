"use client";

import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EfficiencyChart = ({ data, onChartClick }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        onClick={(data) => onChartClick(data.activePayload[0].payload, 'efficiency')}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="timeLabel"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis 
          yAxisId="left"
          orientation="left"
          stroke="#3B82F6"
          label={{ 
            value: 'Doanh thu trung bình (VND)', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          stroke="#10B981"
          label={{ 
            value: 'Số lượng bán', 
            angle: 90, 
            position: 'insideRight',
            style: { textAnchor: 'middle' }
          }}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'Doanh thu trung bình') {
              return [`${value.toLocaleString('vi-VN')} VND`, name];
            }
            return [value.toLocaleString(), name];
          }}
          labelFormatter={(label) => label}
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="avgRevenue"
          name="Doanh thu trung bình"
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="quantity"
          name="Số lượng bán"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EfficiencyChart; 