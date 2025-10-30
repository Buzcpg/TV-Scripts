import React from 'react';

type PageType = 'home' | 'analytics' | 'transactions' | 'brokers' | 'journal';

interface NavigationProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { 
      id: 'home' as PageType, 
      label: 'Overview', 
      icon: '🏠',
      gradient: 'linear-gradient(135deg, #00d4ff 0%, #b366f5 100%)'
    },
    { 
      id: 'analytics' as PageType, 
      label: 'Analytics', 
      icon: '📊',
      gradient: 'linear-gradient(135deg, #b366f5 0%, #ff006b 100%)'
    },
    { 
      id: 'journal' as PageType, 
      label: 'Journal', 
      icon: '📔',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)'
    },
    { 
      id: 'transactions' as PageType, 
      label: 'Transactions', 
      icon: '💸',
      gradient: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)'
    },
    { 
      id: 'brokers' as PageType, 
      label: 'Brokers', 
      icon: '🏛️',
      gradient: 'linear-gradient(135deg, #ff8800 0%, #ffff00 100%)'
    }
  ];

  return (
    <nav style={{
      background: 'rgba(26, 26, 46, 0.95)',
      backdropFilter: 'blur(15px)',
      borderBottom: '2px solid rgba(0, 212, 255, 0.3)',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            background: 'linear-gradient(45deg, #00d4ff, #b366f5, #ff006b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginRight: '3rem'
          }}>
            ⚡ TRADING NEXUS
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          background: 'rgba(10, 10, 15, 0.8)',
          padding: '0.5rem',
          borderRadius: '25px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              style={{
                background: currentPage === item.id ? item.gradient : 'transparent',
                color: currentPage === item.id ? '#0a0a0f' : '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontWeight: currentPage === item.id ? 'bold' : 'normal',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 212, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              
              {/* Active indicator */}
              {currentPage === item.id && (
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80%',
                  height: '2px',
                  background: '#ffffff',
                  borderRadius: '2px'
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
            color: '#0a0a0f',
            padding: '0.4rem 1rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
          }}>
            LIVE DATA
          </div>
          <div style={{
            width: '12px',
            height: '12px',
            background: 'radial-gradient(circle, #00ff88, #00d4ff)',
            borderRadius: '50%',
            animation: 'pulse 2s infinite',
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.8)'
          }} />
        </div>
      </div>

      {/* Animated border */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #00d4ff, #b366f5, #ff006b, transparent)',
        animation: 'flow 4s ease-in-out infinite',
        opacity: 0.8
      }} />

      <style>{`
        @keyframes flow {
          0% { transform: translateX(-60%); }
          50% { transform: translateX(60%); }
          100% { transform: translateX(-60%); }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
