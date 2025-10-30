import React, { useState } from 'react';

interface BrokersPageProps {
  data: any;
}

const BrokersPage: React.FC<BrokersPageProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'blofin' | 'edgex' | 'breakout'>('blofin');
  
  const blofin = data.blofin || [];
  const edgex = data.edgex || [];
  const breakout = data.breakout || [];
  const summary = data.summary || {};

  const brokerData = {
    blofin: {
      name: 'Blofin',
      trades: blofin,
      pnl: summary.Blofin || 0,
      color: '#00d4ff',
      gradient: 'linear-gradient(135deg, #00d4ff, #b366f5)',
      icon: '🏦'
    },
    edgex: {
      name: 'Edgex',
      trades: edgex,
      pnl: summary.Edgex || 0,
      color: '#b366f5',
      gradient: 'linear-gradient(135deg, #b366f5, #ff006b)',
      icon: '⚡'
    },
    breakout: {
      name: 'Breakout',
      trades: breakout,
      pnl: summary.Breakout || 0,
      color: '#ff8800',
      gradient: 'linear-gradient(135deg, #ff8800, #ffff00)',
      icon: '🚀'
    }
  };

  const tabs = Object.entries(brokerData).map(([key, broker]) => ({
    id: key,
    label: broker.name,
    icon: broker.icon,
    count: broker.trades.length,
    pnl: broker.pnl,
    gradient: broker.gradient
  }));

  const currentBroker = brokerData[activeTab];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          background: 'linear-gradient(45deg, #ff8800, #ffff00, #00d4ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Broker Performance
        </h1>
        <p style={{ color: '#999', fontSize: '1.1rem' }}>
          Detailed breakdown of trading performance by platform
        </p>
      </div>

      {/* Broker Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {Object.entries(brokerData).map(([key, broker]) => (
          <div key={key} style={{
            background: `linear-gradient(135deg, ${broker.color}10, ${broker.color}05)`,
            borderRadius: '16px',
            padding: '2rem',
            border: `2px solid ${broker.color}50`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab(key as any)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = `0 20px 40px ${broker.color}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200px',
              height: '200px',
              background: `radial-gradient(circle, ${broker.color}20, transparent)`,
              borderRadius: '50%'
            }} />
            
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3rem' }}>{broker.icon}</div>
                <div>
                  <div style={{ color: broker.color, fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {broker.name}
                  </div>
                  <div style={{ color: '#999', fontSize: '0.9rem' }}>
                    {broker.trades.length} trades
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: broker.pnl >= 0 ? '#00ff88' : '#ff006b',
                  marginBottom: '0.5rem'
                }}>
                  ${broker.pnl.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Net P&L</div>
              </div>
              
              <div style={{
                background: broker.gradient,
                color: '#0a0a0f',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {activeTab === key ? 'VIEWING' : 'VIEW DETAILS'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        background: 'rgba(26, 26, 46, 0.8)',
        padding: '0.5rem',
        borderRadius: '16px',
        border: '1px solid rgba(255, 136, 0, 0.3)'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: activeTab === tab.id ? tab.gradient : 'transparent',
              color: activeTab === tab.id ? '#0a0a0f' : '#ffffff',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: 1,
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
            {tab.label}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '0.5rem' }}>
              <span style={{
                background: activeTab === tab.id ? 'rgba(10, 10, 15, 0.3)' : 'rgba(255, 136, 0, 0.2)',
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                fontSize: '0.7rem'
              }}>
                {tab.count}
              </span>
              <span style={{
                fontSize: '0.7rem',
                color: tab.pnl >= 0 ? (activeTab === tab.id ? '#00ff88' : '#00ff88') : '#ff006b',
                fontWeight: 'bold'
              }}>
                ${tab.pnl.toFixed(0)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Broker Details */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(16, 21, 62, 0.9) 100%)',
        borderRadius: '16px',
        padding: '2rem',
        border: `2px solid ${currentBroker.color}50`
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            color: currentBroker.color, 
            fontSize: '1.5rem', 
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {currentBroker.icon} {currentBroker.name} Trading History
          </h2>
          <p style={{ color: '#999' }}>
            {currentBroker.trades.length} trades • ${currentBroker.pnl.toFixed(2)} net P&L
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${currentBroker.color}50` }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: currentBroker.color, fontWeight: 'bold' }}>Asset</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: currentBroker.color, fontWeight: 'bold' }}>Side</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: currentBroker.color, fontWeight: 'bold' }}>Quantity</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: currentBroker.color, fontWeight: 'bold' }}>Price</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: currentBroker.color, fontWeight: 'bold' }}>P&L</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: currentBroker.color, fontWeight: 'bold' }}>Fees</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: currentBroker.color, fontWeight: 'bold' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentBroker.trades.slice(0, 50).map((trade: any, index: number) => (
                <tr key={index} style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${currentBroker.color}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: currentBroker.color, fontWeight: 'bold' }}>{trade.Asset}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: trade.Side === 'Buy' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 0, 107, 0.2)',
                      color: trade.Side === 'Buy' ? '#00ff88' : '#ff006b',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {trade.Side}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#ccc' }}>{trade.Quantity}</td>
                  <td style={{ padding: '1rem', color: '#ccc' }}>${(trade.Price || 0).toFixed(4)}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      color: (trade.PNL || 0) >= 0 ? '#00ff88' : '#ff006b',
                      fontWeight: 'bold'
                    }}>
                      ${(trade.PNL || 0).toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#ffff00' }}>${(trade.Fee || 0).toFixed(4)}</td>
                  <td style={{ padding: '1rem', color: '#999', fontSize: '0.9rem' }}>
                    {new Date(trade.Date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BrokersPage;
