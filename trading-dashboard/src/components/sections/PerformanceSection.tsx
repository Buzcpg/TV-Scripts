import React from 'react';
import { motion } from 'framer-motion';
import { TradingData } from '../../types/trading';
import ChartCard from '../cards/ChartCard';

interface PerformanceSectionProps {
  data: TradingData;
}

const PerformanceSection: React.FC<PerformanceSectionProps> = ({ data }) => {
  const hourlyData = data.hour_analysis?.map(hour => ({
    name: `${hour['Hour of Day']}:00`,
    value: hour['Net PNL'],
    winRate: hour['Win Rate %']
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-cyber text-neon-purple mb-2">
          Performance Analytics
        </h1>
        <p className="text-gray-400 font-mono">
          Detailed performance metrics and time-based analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Hourly Performance"
          subtitle="P&L by hour of day"
          data={hourlyData}
          type="line"
          color="cyber-purple"
          height={400}
        />
        
        <ChartCard
          title="Asset Distribution"
          subtitle="Trading volume by asset"
          data={data.coins?.slice(0, 6).map(coin => ({
            name: coin.Asset,
            value: coin['Total Trades']
          })) || []}
          type="pie"
          color="cyber-pink"
          height={400}
        />
      </div>
    </motion.div>
  );
};

export default PerformanceSection;
