
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HistogramDataPoint } from '../types';

interface HistogramChartProps {
  data: HistogramDataPoint[];
}

export const HistogramChart: React.FC<HistogramChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        barGap={0}
        barCategoryGap={0}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
        <XAxis 
          dataKey="intensity" 
          tick={{ fill: '#A0AEC0', fontSize: 12 }} 
          tickLine={{ stroke: '#718096' }} 
          axisLine={{ stroke: '#718096' }} 
        />
        <YAxis 
          tick={{ fill: '#A0AEC0', fontSize: 12 }}
          tickLine={{ stroke: '#718096' }} 
          axisLine={{ stroke: '#718096' }}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568', color: '#CBD5E0' }}
          cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="r" fill="#EF4444" stroke="#EF4444" name="Red" />
        <Bar dataKey="g" fill="#22C55E" stroke="#22C55E" name="Green" />
        <Bar dataKey="b" fill="#3B82F6" stroke="#3B82F6" name="Blue" />
      </BarChart>
    </ResponsiveContainer>
  );
};
