import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Wifi, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  onMenuToggle: () => void;
  lastUpdated: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, lastUpdated }) => {
  const currentTime = new Date();
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass border-b border-gray-700 p-4 lg:p-6"
    >
      <div className="flex items-center justify-between">
        {/* Left side - Menu and title */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-cyber-blue hover:text-cyber-purple 
                     transition-colors rounded-lg border border-gray-700 
                     hover:border-cyber-blue"
          >
            <Menu size={20} />
          </motion.button>
          
          <div>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl lg:text-3xl font-cyber text-neon-blue"
            >
              TRADING
              <span className="text-neon-purple"> NEXUS</span>
            </motion.h1>
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-400 font-mono"
            >
              Advanced Performance Analytics
            </motion.p>
          </div>
        </div>

        {/* Right side - Status indicators */}
        <div className="flex items-center space-x-4">
          {/* Connection status */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="hidden sm:flex items-center space-x-2 px-3 py-2 
                     bg-dark-800 rounded-lg border border-cyber-green"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Wifi size={16} className="text-cyber-green" />
            </motion.div>
            <span className="text-xs text-cyber-green font-mono">LIVE</span>
          </motion.div>

          {/* Current time */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="hidden md:flex items-center space-x-2 px-3 py-2 
                     bg-dark-800 rounded-lg border border-cyber-blue"
          >
            <Clock size={16} className="text-cyber-blue" />
            <div className="text-xs font-mono">
              <div className="text-cyber-blue">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-gray-400">
                {format(currentTime, 'dd MMM')}
              </div>
            </div>
          </motion.div>

          {/* Last updated */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="hidden lg:flex flex-col items-end px-3 py-2 
                     bg-dark-800 rounded-lg border border-gray-700"
          >
            <span className="text-xs text-gray-400 font-mono">Last Updated</span>
            <span className="text-xs text-cyber-yellow font-mono">
              {format(new Date(lastUpdated), 'dd MMM HH:mm')}
            </span>
          </motion.div>

          {/* System status indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="relative"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 5px rgba(0, 255, 136, 0.5)',
                  '0 0 20px rgba(0, 255, 136, 0.8)',
                  '0 0 5px rgba(0, 255, 136, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 bg-cyber-green rounded-full"
            />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-green rounded-full animate-ping" />
          </motion.div>
        </div>
      </div>

      {/* Glitch effect line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-neon origin-left"
      />
    </motion.header>
  );
};

export default Header;
