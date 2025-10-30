import React from 'react';
import { motion } from 'framer-motion';
import { TradingData } from '../../types/trading';

interface PositionsSectionProps {
  data: TradingData;
}

const PositionsSection: React.FC<PositionsSectionProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-cyber text-neon-green mb-2">
          Position History
        </h1>
        <p className="text-gray-400 font-mono">
          Complete trading positions and their performance
        </p>
      </div>

      <div className="glass p-6 rounded-lg border-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-cyber-blue border-b border-gray-700">
                <th className="text-left p-2">Asset</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Size</th>
                <th className="text-left p-2">Entry</th>
                <th className="text-left p-2">Duration</th>
                <th className="text-left p-2">P&L</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.positions.slice(0, 10).map((position, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-800 hover:bg-dark-800 transition-colors"
                >
                  <td className="p-2 text-cyber-blue">{position.Asset}</td>
                  <td className="p-2">{position['Position Type']}</td>
                  <td className="p-2">{position['Position Size']}</td>
                  <td className="p-2">${position['Avg Entry Price'].toFixed(2)}</td>
                  <td className="p-2">{position['Duration (Hours)']?.toFixed(1)}h</td>
                  <td className={`p-2 ${position['Net PNL'] > 0 ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                    ${position['Net PNL'].toFixed(2)}
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      position.Status === 'Closed' 
                        ? 'bg-cyber-green text-dark-900' 
                        : 'bg-cyber-yellow text-dark-900'
                    }`}>
                      {position.Status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default PositionsSection;
