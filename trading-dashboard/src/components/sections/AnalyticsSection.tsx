import React from 'react';
import { motion } from 'framer-motion';
import { TradingData } from '../../types/trading';
import ChartCard from '../cards/ChartCard';

interface AnalyticsSectionProps {
  data: TradingData;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ data }) => {
  const weekendData = [
    { name: 'Weekday', value: 65.2, trades: 180 },
    { name: 'Weekend', value: 58.7, trades: 47 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-cyber text-neon-yellow mb-2">
          Advanced Analytics
        </h1>
        <p className="text-gray-400 font-mono">
          Deep dive into trading patterns and behaviors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Weekend vs Weekday"
          subtitle="Performance comparison"
          data={weekendData}
          type="bar"
          color="cyber-yellow"
        />
        
        <div className="glass p-6 rounded-lg border-glow">
          <h3 className="text-lg font-cyber text-neon-yellow mb-4">
            Trading Insights
          </h3>
          <div className="space-y-4 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-gray-400">Best Trading Day:</span>
              <span className="text-cyber-green">Tuesday</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Best Trading Hour:</span>
              <span className="text-cyber-green">14:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Most Traded Asset:</span>
              <span className="text-cyber-blue">BTCUSD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Position Duration:</span>
              <span className="text-cyber-purple">13.3 hours</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsSection;
