import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { zusColors } from '../../../constants/zus-colors';
import { formatCurrency } from '../../../utils/pension-formatting';

/**
 * ZUS Account Growth Chart Component
 * Displays the growth of ZUS account balance over time
 */
const ZUSAccountGrowthChart = ({ data, loading = false }) => {
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          border: `1px solid ${zusColors.primary}`,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: zusColors.dark }}>
            Rok: {label}
          </p>
          <p style={{ margin: '4px 0 0 0', color: zusColors.primary }}>
            Saldo: {formatCurrency(payload[0].value)}
          </p>
          <p style={{ margin: '4px 0 0 0', color: zusColors.info, fontSize: '0.875rem' }}>
            Składki: {formatCurrency(payload[0].payload.totalContribution)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ 
        height: 320, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: `3px solid ${zusColors.primary}30`,
            borderTop: `3px solid ${zusColors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px'
          }} />
          <p style={{ color: '#666', margin: 0 }}>Ładowanie wykresu...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: 320, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        border: '1px dashed #ccc'
      }}>
        <p style={{ color: '#666', margin: 0 }}>Brak danych do wyświetlenia</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={420}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="zusGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={zusColors.primary} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={zusColors.primary} stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="year" 
          stroke="#666"
          fontSize={12}
          tickFormatter={(value) => value.toString()}
        />
        <YAxis 
          stroke="#666"
          fontSize={12}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="balance"
          stroke={zusColors.primary}
          strokeWidth={3}
          fill="url(#zusGradient)"
          dot={{ fill: zusColors.primary, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: zusColors.primary, strokeWidth: 2, fill: 'white' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ZUSAccountGrowthChart;