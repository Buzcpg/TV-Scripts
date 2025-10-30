import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'pink' | 'purple' | 'yellow' | 'orange';
  glowColor: string;
  size?: 'normal' | 'compact';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  glowColor,
  size = 'normal'
}) => {
  const colorMap = {
    blue: 'text-cyber-blue',
    green: 'text-cyber-green',
    pink: 'text-cyber-pink',
    purple: 'text-cyber-purple',
    yellow: 'text-cyber-yellow',
    orange: 'text-cyber-orange'
  };

  const bgColorMap = {
    blue: 'bg-cyber-blue',
    green: 'bg-cyber-green',
    pink: 'bg-cyber-pink',
    purple: 'bg-cyber-purple',
    yellow: 'bg-cyber-yellow',
    orange: 'bg-cyber-orange'
  };

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`glass p-${size === 'compact' ? '4' : '6'} rounded-lg border-glow 
                 card-hover group cursor-pointer relative overflow-hidden`}
    >
      {/* Background glow effect */}
      <motion.div
        className={`absolute inset-0 ${bgColorMap[color]} opacity-0 group-hover:opacity-5 
                   transition-opacity duration-300`}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg bg-dark-800 ${colorMap[color]}`}>
            <Icon size={size === 'compact' ? 18 : 20} />
          </div>
          
          {change && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-xs px-2 py-1 rounded-full bg-dark-800 
                         ${colorMap[color]} font-mono border border-gray-700`}
            >
              {change}
            </motion.span>
          )}
        </div>

        <div className="space-y-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${size === 'compact' ? 'text-xl' : 'text-2xl'} 
                       font-bold ${colorMap[color]} font-mono`}
          >
            {value}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-400 font-mono"
          >
            {title}
          </motion.div>
        </div>

        {/* Animated bottom border */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={`absolute bottom-0 left-0 h-0.5 ${bgColorMap[color]} 
                     origin-left group-hover:h-1 transition-all duration-300`}
        />
      </div>

      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-8 h-8 ${bgColorMap[color]} 
                     opacity-10 transform rotate-45 translate-x-4 -translate-y-4`} />
    </motion.div>
  );
};

export default MetricCard;
