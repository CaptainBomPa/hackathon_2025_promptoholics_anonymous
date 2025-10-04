import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { zusColors } from '../../../constants/zus-colors';
import { formatCurrency } from '../../../utils/pension-formatting';

/**
 * Salary Projection Chart Component
 * Displays salary progression over time with historical vs projected data
 */
const SalaryProjectionChart = ({ data, loading = false }) => {
  const currentYear = new Date().getFullYear();

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isProjected = payload[0].payload.isProjected;
      const isCustom = payload[0].payload.isCustom;
      
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          border: `1px solid ${zusColors.info}`,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: zusColors.dark }}>
            Rok: {label}
          </p>
          <p style={{ margin: '4px 0 0 0', color: zusColors.info }}>
            Wynagrodzenie: {formatCurrency(payload[0].value)}
          </p>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '0.75rem',
            color: isProjected ? zusColors.secondary : zusColors.success
          }}>
            {isProjected ? '📈 Prognoza' : '📊 Historyczne'}
            {isCustom && ' (własne dane)'}
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
            border: `3px solid ${zusColors.info}30`,
            borderTop: `3px solid ${zusColors.info}`,
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
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
        
        {/* Reference line for current year */}
        <ReferenceLine 
          x={currentYear} 
          stroke={zusColors.error} 
          strokeDasharray="5 5"
          label={{ value: "Dziś", position: "top" }}
        />
        
        {/* Historical data line */}
        <Line
          type="monotone"
          dataKey="amount"
          stroke={zusColors.info}
          strokeWidth={3}
          dot={(props) => {
            const { payload } = props;
            if (!payload.isProjected) {
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={4}
                  fill={payload.isCustom ? zusColors.success : zusColors.info}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            }
            return null;
          }}
          connectNulls={false}
        />
        
        {/* Projected data line */}
        <Line
          type="monotone"
          dataKey="amount"
          stroke={zusColors.secondary}
          strokeWidth={2}
          strokeDasharray="8 4"
          dot={(props) => {
            const { payload } = props;
            if (payload.isProjected) {
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={3}
                  fill={zusColors.secondary}
                  stroke="white"
                  strokeWidth={1}
                />
              );
            }
            return null;
          }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalaryProjectionChart;