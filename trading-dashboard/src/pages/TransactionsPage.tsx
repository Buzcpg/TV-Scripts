import React, { useState } from 'react';

interface TransactionsPageProps {
  data: any;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'trades'>('positions');
  
  const positions = data.positions || [];
  const trades = data.trades || [];

  const tabs = [
    { id: 'positions', label: 'Position History', icon: '📊', count: positions.length },
    { id: 'trades', label: 'All Trades', icon: '💸', count: trades.length }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          background: 'linear-gradient(45deg, #00ff88, #00d4ff, #b366f5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Transaction History
        </h1>
        <p style={{ color: '#999', fontSize: '1.1rem' }}>
          Complete record of your trading activity across all platforms
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        background: 'rgba(26, 26, 46, 0.8)',
        padding: '0.5rem',
        borderRadius: '16px',
        border: '1px solid rgba(0, 255, 136, 0.3)'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, #00ff88, #00d4ff)' 
                : 'transparent',
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
            <span style={{
              background: activeTab === tab.id ? 'rgba(10, 10, 15, 0.3)' : 'rgba(0, 255, 136, 0.2)',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              marginLeft: '0.5rem'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(16, 21, 62, 0.9) 100%)',
          borderRadius: '16px',
          padding: '2rem',
          border: '2px solid rgba(0, 255, 136, 0.3)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#00ff88', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              📊 Position History ({positions.length} total)
            </h2>
            <p style={{ color: '#999' }}>Reconciled trading positions showing complete entry and exit data</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0, 255, 136, 0.3)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00ff88', fontWeight: 'bold' }}>Asset</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00ff88', fontWeight: 'bold' }}>Type</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00ff88', fontWeight: 'bold' }}>Size</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00ff88', fontWeight: 'bold' }}>Entry</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00ff88', fontWeight: 'bold' }}>Duration</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00ff88', fontWeight: 'bold' }}>P&L</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00ff88', fontWeight: 'bold' }}>Broker</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00ff88', fontWeight: 'bold' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {positions.slice(0, 50).map((position: any, index: number) => (
                  <tr key={index} style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>{position.Asset}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: position['Position Type'] === 'Long' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 0, 107, 0.2)',
                        color: position['Position Type'] === 'Long' ? '#00ff88' : '#ff006b',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {position['Position Type']}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#ccc' }}>{position['Position Size']}</td>
                    <td style={{ padding: '1rem', color: '#ccc' }}>${(position['Avg Entry Price'] || 0).toFixed(4)}</td>
                    <td style={{ padding: '1rem', color: '#ccc' }}>{(position['Duration (Hours)'] || 0).toFixed(1)}h</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        color: (position['Net PNL'] || 0) >= 0 ? '#00ff88' : '#ff006b',
                        fontWeight: 'bold'
                      }}>
                        ${(position['Net PNL'] || 0).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: position.Broker === 'Blofin' ? 'rgba(0, 212, 255, 0.2)' : 
                                   position.Broker === 'Edgex' ? 'rgba(179, 102, 245, 0.2)' : 
                                   'rgba(255, 136, 0, 0.2)',
                        color: position.Broker === 'Blofin' ? '#00d4ff' : 
                               position.Broker === 'Edgex' ? '#b366f5' : '#ff8800',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {position.Broker}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#999', fontSize: '0.9rem' }}>
                      {new Date(position['Open Date']).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Trades Tab */}
      {activeTab === 'trades' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(16, 21, 62, 0.9) 100%)',
          borderRadius: '16px',
          padding: '2rem',
          border: '2px solid rgba(0, 212, 255, 0.3)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#00d4ff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              💸 All Trades ({trades.length} total)
            </h2>
            <p style={{ color: '#999' }}>Individual trade records from all brokers</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0, 212, 255, 0.3)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff', fontWeight: 'bold' }}>Asset</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff', fontWeight: 'bold' }}>Side</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff', fontWeight: 'bold' }}>Quantity</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff', fontWeight: 'bold' }}>Price</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff', fontWeight: 'bold' }}>P&L</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff', fontWeight: 'bold' }}>Fees</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff', fontWeight: 'bold' }}>Broker</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff', fontWeight: 'bold' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 100).map((trade: any, index: number) => (
                  <tr key={index} style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>{trade.Asset}</div>
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
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: trade.Broker === 'Blofin' ? 'rgba(0, 212, 255, 0.2)' : 
                                   trade.Broker === 'Edgex' ? 'rgba(179, 102, 245, 0.2)' : 
                                   'rgba(255, 136, 0, 0.2)',
                        color: trade.Broker === 'Blofin' ? '#00d4ff' : 
                               trade.Broker === 'Edgex' ? '#b366f5' : '#ff8800',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {trade.Broker}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#999', fontSize: '0.9rem' }}>
                      {new Date(trade.Date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
