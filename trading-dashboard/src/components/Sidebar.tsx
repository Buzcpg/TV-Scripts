import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface SidebarProps {
  sections: Array<{ id: string; name: string; icon: string }>;
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sections,
  activeSection,
  onSectionChange,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col w-64 glass border-r border-gray-700"
      >
        <div className="p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-full h-full border-2 border-cyber-blue rounded-full border-dashed"
              />
              <div className="absolute inset-2 bg-gradient-neon rounded-full opacity-20" />
              <div className="absolute inset-4 bg-cyber-blue rounded-full" />
            </div>
            <h2 className="text-lg font-cyber text-neon-blue">NEXUS</h2>
            <p className="text-xs text-gray-400 font-mono">v1.0.0</p>
          </motion.div>

          <nav className="space-y-2">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSectionChange(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                         font-mono text-sm transition-all duration-300
                         ${activeSection === section.id
                           ? 'bg-cyber-blue text-dark-900 glow-blue font-semibold'
                           : 'text-gray-300 hover:text-cyber-blue hover:bg-dark-800 border-glow'
                         }`}
              >
                <span className="text-lg">{section.icon}</span>
                <span>{section.name}</span>
                {activeSection === section.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 bg-dark-900 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-auto p-6 border-t border-gray-700">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center space-y-2"
          >
            <div className="flex justify-center space-x-1">
              {['🟢', '🔵', '🟣'].map((color, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  }}
                  className="text-xs"
                >
                  {color}
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-gray-500 font-mono">
              SYSTEM ONLINE
            </p>
          </motion.div>
        </div>
      </motion.aside>

      {/* Mobile sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="fixed inset-y-0 left-0 z-50 w-64 glass border-r border-gray-700 lg:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-cyber text-neon-blue">NEXUS</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-cyber-blue transition-colors"
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSectionChange(section.id);
                  onToggle();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                         font-mono text-sm transition-all duration-300
                         ${activeSection === section.id
                           ? 'bg-cyber-blue text-dark-900 glow-blue font-semibold'
                           : 'text-gray-300 hover:text-cyber-blue hover:bg-dark-800 border-glow'
                         }`}
              >
                <span className="text-lg">{section.icon}</span>
                <span>{section.name}</span>
              </motion.button>
            ))}
          </nav>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
