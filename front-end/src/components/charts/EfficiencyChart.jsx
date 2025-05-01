"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length >= 2) {
    const revenueValue = payload[0]?.value || 0;
    const quantityValue = payload[1]?.value || 0;

    return (
      <div style={{ 
        background: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: 4, 
        padding: 8, 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        fontSize: 14
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: '#111827' }}>{label}</div>
        <div style={{ color: '#2563eb', marginBottom: 2 }}>
          <span>Doanh thu: </span>
          <b>{revenueValue.toLocaleString('vi-VN')} VND</b>
        </div>
        <div style={{ color: '#059669' }}>
          <span>Số lượng: </span>
          <b>{quantityValue.toLocaleString()}</b>
        </div>
      </div>
    );
  }
  return null;
};

const EfficiencyChart = ({ data, onChartClick }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        onClick={(data) => onChartClick(data.activePayload[0].payload, 'efficiency')}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="timeLabel"
          tick={{ fontSize: 12, fill: '#4b5563' }}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          stroke="#2563eb"
          tick={{ fontSize: 12, fill: '#2563eb' }}
          label={{
            value: 'Doanh thu (VND)',
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle', fill: '#2563eb', fontSize: 12 }
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#059669"
          tick={{ fontSize: 12, fill: '#059669' }}
          label={{
            value: 'Số lượng',
            angle: 90,
            position: 'insideRight',
            style: { textAnchor: 'middle', fill: '#059669', fontSize: 12 }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#4b5563' }}
          iconType="circle"
        />
        <Bar
          yAxisId="left"
          dataKey="avgRevenue"
          name="Doanh thu"
          fill="#2563eb"
          radius={[2, 2, 0, 0]}
          barSize={20}
        >
          <LabelList
            dataKey="avgRevenue"
            position="top"
            formatter={(value) => `${(value/1000000).toFixed(1)}M`}
            style={{ fontSize: 10, fill: '#2563eb' }}
          />
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="quantity"
          name="Số lượng"
          stroke="#059669"
          strokeWidth={2}
          dot={{ r: 3, fill: '#059669' }}
          activeDot={{ r: 4, fill: '#059669' }}
        >
          <LabelList
            dataKey="quantity"
            position="top"
            style={{ fontSize: 10, fill: '#059669' }}
          />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default EfficiencyChart; 