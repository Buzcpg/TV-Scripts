import React from 'react';
import { motion } from 'framer-motion';
import { TradingData } from '../../types/trading';
import MetricCard from '../cards/MetricCard';
import ChartCard from '../cards/ChartCard';
import { TrendingUp, TrendingDown, Target, DollarSign, Activity, Zap } from 'lucide-react';

interface OverviewSectionProps {
  data: TradingData;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ data }) => {
  const { summary } = data;
  
  const isProfit = summary['Net PNL'] > 0;
  
  // Prepare chart data for daily performance
  const dailyData = data.day_analysis?.map(day => ({
    name: day['Day of Week'].slice(0, 3),
    value: day['Net PNL'],
    winRate: day['Win Rate %']
  })) || [];

  // Top performing coins
  const topCoins = data.coins?.slice(0, 5).map(coin => ({
    name: coin.Asset,
    value: typeof coin['Net PNL'] === 'string' 
      ? parseFloat(coin['Net PNL'].replace('$', '').replace(',', ''))
      : coin['Net PNL'],
    trades: coin['Total Trades']
  })) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page title */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-cyber text-neon-blue mb-2">
          Performance Overview
        </h1>
        <p className="text-gray-400 font-mono">
          Real-time trading metrics and portfolio analysis
        </p>
      </motion.div>

      {/* Key metrics row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Net P&L"
          value={`$${summary['Net PNL'].toFixed(2)}`}
          change={isProfit ? "+ve" : "-ve"}
          icon={isProfit ? TrendingUp : TrendingDown}
          color={isProfit ? "green" : "pink"}
          glowColor={isProfit ? "cyber-green" : "cyber-pink"}
        />
        
        <MetricCard
          title="Win Rate"
          value={`${summary['Win Rate'].toFixed(1)}%`}
          change={summary['Win Rate'] > 60 ? "Good" : "Needs Work"}
          icon={Target}
          color="blue"
          glowColor="cyber-blue"
        />
        
        <MetricCard
          title="Total Trades"
          value={summary['Total Transactions'].toString()}
          change="Active"
          icon={Activity}
          color="purple"
          glowColor="cyber-purple"
        />
        
        <MetricCard
          title="Avg Trade Size"
          value={summary['Avg Trade Size'].toFixed(4)}
          change="Volume"
          icon={DollarSign}
          color="yellow"
          glowColor="cyber-yellow"
        />
      </motion.div>

      {/* Charts row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <ChartCard
          title="Daily Performance"
          subtitle="Net P&L by day of week"
          data={dailyData}
          type="bar"
          color="cyber-blue"
        />
        
        <ChartCard
          title="Top Assets"
          subtitle="Performance by trading pair"
          data={topCoins}
          type="pie"
          color="cyber-purple"
        />
      </motion.div>

      {/* Additional metrics row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <MetricCard
          title="Max Win"
          value={`$${summary['Max Win'].toFixed(2)}`}
          change="Best Trade"
          icon={Zap}
          color="green"
          glowColor="cyber-green"
          size="compact"
        />
        
        <MetricCard
          title="Max Loss"
          value={`$${summary['Max Loss'].toFixed(2)}`}
          change="Worst Trade"
          icon={Zap}
          color="pink"
          glowColor="cyber-pink"
          size="compact"
        />
        
        <MetricCard
          title="Total Fees"
          value={`$${summary['Total Fees'].toFixed(2)}`}
          change="Costs"
          icon={DollarSign}
          color="orange"
          glowColor="cyber-orange"
          size="compact"
        />
      </motion.div>

      {/* Quick stats */}
      <motion.div
        variants={itemVariants}
        className="glass p-6 rounded-lg border-glow"
      >
        <h3 className="text-lg font-cyber text-neon-purple mb-4">
          Quick Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
          <div className="text-center">
            <div className="text-2xl text-cyber-green font-bold">
              {summary['Profitable Positions'] || 0}
            </div>
            <div className="text-gray-400">Winning Positions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-cyber-pink font-bold">
              {summary['Losing Positions'] || 0}
            </div>
            <div className="text-gray-400">Losing Positions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-cyber-blue font-bold">
              ${(summary['Total PNL'] / summary['Total Transactions']).toFixed(2)}
            </div>
            <div className="text-gray-400">Avg per Trade</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-cyber-yellow font-bold">
              {((summary['Total PNL'] / summary['Total Fees']) * 100).toFixed(1)}%
            </div>
            <div className="text-gray-400">ROI vs Fees</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OverviewSection;
