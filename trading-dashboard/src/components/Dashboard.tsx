import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TradingData } from '../types/trading';
import Header from './Header';
import OverviewSection from './sections/OverviewSection';
import PerformanceSection from './sections/PerformanceSection';
import PositionsSection from './sections/PositionsSection';
import AnalyticsSection from './sections/AnalyticsSection';
import Sidebar from './Sidebar';

interface DashboardProps {
  data: TradingData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'performance', name: 'Performance', icon: '📈' },
    { id: 'positions', name: 'Positions', icon: '💼' },
    { id: 'analytics', name: 'Analytics', icon: '🔍' },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection data={data} />;
      case 'performance':
        return <PerformanceSection data={data} />;
      case 'positions':
        return <PositionsSection data={data} />;
      case 'analytics':
        return <AnalyticsSection data={data} />;
      default:
        return <OverviewSection data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <Sidebar
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          lastUpdated={data.metadata.generated_at}
        />

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {renderActiveSection()}
          </motion.div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
