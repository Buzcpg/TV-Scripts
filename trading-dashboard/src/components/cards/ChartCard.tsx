import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  type: 'bar' | 'pie' | 'line';
  color: string;
  height?: number;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  data,
  type,
  color,
  height = 300
}) => {
  const colors = {
    'cyber-blue': '#00d4ff',
    'cyber-purple': '#b366f5',
    'cyber-pink': '#ff006b',
    'cyber-green': '#00ff88',
    'cyber-yellow': '#ffff00',
    'cyber-orange': '#ff8800',
  };

  const pieColors = [
    '#00d4ff', '#b366f5', '#ff006b', '#00ff88', '#ffff00', '#ff8800'
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-3 rounded-lg border border-cyber-blue"
        >
          <p className="text-cyber-blue font-mono text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white font-mono text-xs">
              {entry.name}: <span className="text-cyber-green">{entry.value}</span>
              {entry.payload.winRate && (
                <span className="ml-2 text-cyber-yellow">
                  WR: {entry.payload.winRate}%
                </span>
              )}
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke={colors[color as keyof typeof colors]}
                fontSize={12}
                fontFamily="monospace"
              />
              <YAxis 
                stroke={colors[color as keyof typeof colors]}
                fontSize={12}
                fontFamily="monospace"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={colors[color as keyof typeof colors]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={12}
                fontFamily="monospace"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={pieColors[index % pieColors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke={colors[color as keyof typeof colors]}
                fontSize={12}
                fontFamily="monospace"
              />
              <YAxis 
                stroke={colors[color as keyof typeof colors]}
                fontSize={12}
                fontFamily="monospace"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[color as keyof typeof colors]}
                strokeWidth={3}
                dot={{ fill: colors[color as keyof typeof colors], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors[color as keyof typeof colors] }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="glass p-6 rounded-lg border-glow card-hover group"
    >
      {/* Header */}
      <div className="mb-6">
        <motion.h3
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg font-cyber text-neon-blue mb-1"
        >
          {title}
        </motion.h3>
        {subtitle && (
          <motion.p
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-400 font-mono"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative"
      >
        {data.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 font-mono">
            No data available
          </div>
        )}
        
        {/* Glowing border effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute inset-0 rounded-lg border border-transparent 
                   group-hover:border-cyber-blue group-hover:shadow-lg 
                   group-hover:shadow-cyber-blue/20 transition-all duration-300 
                   pointer-events-none"
        />
      </motion.div>

      {/* Data count indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-xs text-gray-500 font-mono text-right"
      >
        {data.length} data points
      </motion.div>
    </motion.div>
  );
};

export default ChartCard;
