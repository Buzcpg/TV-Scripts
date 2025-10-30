import React, { useState, useEffect } from 'react';

interface TradingData {
  summary: any;
  positions: any[];
  coins: any[];
  metadata: any;
}

function SimpleApp() {
  const [data, setData] = useState<TradingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/trading_data.json');
        if (!response.ok) {
          throw new Error(`Failed to load trading data: ${response.status} ${response.statusText}`);
        }
        const tradingData = await response.json();
        setData(tradingData);
      } catch (err) {
        console.error('❌ Data loading error:', err);
      } finally {
        setTimeout(() => setLoading(false), 1000); // Minimum loading time for effect
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="grid-pattern" style={{ position: 'fixed', inset: 0, opacity: 0.2, pointerEvents: 'none' }} />
        <div className="text-center relative">
          <h1 className="text-neon-blue font-cyber" style={{ fontSize: '3rem', marginBottom: '2rem' }}>
            TRADING <span className="text-neon-purple">NEXUS</span>
          </h1>
          <div className="loading-spinner" style={{ margin: '0 auto 2rem' }} />
          <div className="text-neon-purple font-mono">
            Initializing Trading Matrix...
          </div>
          <div className="flex justify-center space-x-4" style={{ marginTop: '1rem' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-cyber-green rounded-full animate-pulse-glow"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass p-6 rounded-lg border-glow">
          <div className="text-neon-pink" style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 className="text-neon-pink font-cyber" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            System Error
          </h1>
          <p className="font-mono" style={{ color: '#ccc' }}>
            Unable to load trading data
          </p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '1rem' }}
            onClick={() => window.location.reload()}
          >
            Restart System
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Background grid pattern */}
      <div className="grid-pattern" style={{ position: 'fixed', inset: 0, opacity: 0.2, pointerEvents: 'none' }} />
      
      {/* Header */}
      <header className="glass" style={{ borderBottom: '1px solid rgba(0, 212, 255, 0.3)', padding: '1rem 2rem', position: 'relative', zIndex: 10 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-neon-blue font-cyber" style={{ fontSize: '1.8rem', margin: 0 }}>
              TRADING <span className="text-neon-purple">NEXUS</span>
            </h1>
            <p className="font-mono" style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
              Advanced Performance Analytics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="status-live">LIVE</div>
            <div className="status-indicator" />
          </div>
        </div>
        {/* Animated bottom border */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          height: '2px', 
          width: '100%', 
          background: 'linear-gradient(90deg, var(--cyber-blue), var(--cyber-purple), var(--cyber-pink))',
          animation: 'float 3s ease-in-out infinite'
        }} />
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem', position: 'relative', zIndex: 10 }}>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="glass p-6 rounded-lg border-glow card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ background: 'var(--dark-800)', color: 'var(--cyber-green)' }}>
                💰
              </div>
              <span className="px-2 py-1 rounded-full font-mono" style={{ 
                background: 'var(--dark-800)', 
                color: data.summary['Net PNL'] > 0 ? 'var(--cyber-green)' : 'var(--cyber-pink)',
                fontSize: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {data.summary['Net PNL'] > 0 ? 'Profit' : 'Loss'}
              </span>
            </div>
            <div className="font-mono font-bold" style={{ 
              fontSize: '2rem', 
              color: data.summary['Net PNL'] > 0 ? 'var(--cyber-green)' : 'var(--cyber-pink)'
            }}>
              ${data.summary['Net PNL']?.toFixed(2)}
            </div>
            <div className="font-mono" style={{ fontSize: '0.875rem', color: '#999' }}>
              Net P&L
            </div>
          </div>

          <div className="glass p-6 rounded-lg border-glow card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ background: 'var(--dark-800)', color: 'var(--cyber-blue)' }}>
                🎯
              </div>
              <span className="px-2 py-1 rounded-full font-mono" style={{ 
                background: 'var(--dark-800)', 
                color: 'var(--cyber-blue)',
                fontSize: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {data.summary['Win Rate'] > 60 ? 'Good' : 'Needs Work'}
              </span>
            </div>
            <div className="text-neon-blue font-mono font-bold" style={{ fontSize: '2rem' }}>
              {data.summary['Win Rate']?.toFixed(1)}%
            </div>
            <div className="font-mono" style={{ fontSize: '0.875rem', color: '#999' }}>
              Win Rate
            </div>
          </div>

          <div className="glass p-6 rounded-lg border-glow card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ background: 'var(--dark-800)', color: 'var(--cyber-purple)' }}>
                📊
              </div>
              <span className="px-2 py-1 rounded-full font-mono" style={{ 
                background: 'var(--dark-800)', 
                color: 'var(--cyber-purple)',
                fontSize: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                Active
              </span>
            </div>
            <div className="text-neon-purple font-mono font-bold" style={{ fontSize: '2rem' }}>
              {data.summary['Total Transactions']}
            </div>
            <div className="font-mono" style={{ fontSize: '0.875rem', color: '#999' }}>
              Total Trades
            </div>
          </div>

          <div className="glass p-6 rounded-lg border-glow card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ background: 'var(--dark-800)', color: 'var(--cyber-orange)' }}>
                💸
              </div>
              <span className="px-2 py-1 rounded-full font-mono" style={{ 
                background: 'var(--dark-800)', 
                color: 'var(--cyber-orange)',
                fontSize: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                Costs
              </span>
            </div>
            <div className="text-neon-yellow font-mono font-bold" style={{ fontSize: '2rem' }}>
              ${data.summary['Total Fees']?.toFixed(2)}
            </div>
            <div className="font-mono" style={{ fontSize: '0.875rem', color: '#999' }}>
              Total Fees
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Assets */}
          <div className="glass p-6 rounded-lg border-glow">
            <h3 className="text-neon-blue font-cyber mb-4" style={{ fontSize: '1.25rem' }}>
              Top Trading Assets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.coins.slice(0, 6).map((coin: any, index: number) => (
                <div key={index} className="card-hover" style={{
                  background: 'rgba(0, 212, 255, 0.1)',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 212, 255, 0.2)'
                }}>
                  <div className="text-neon-blue font-mono font-bold mb-2" style={{ fontSize: '1.1rem' }}>
                    {coin.Asset}
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.875rem', color: '#ccc' }}>
                    Trades: <span className="text-neon-green">{coin['Total Trades']}</span>
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.875rem', color: '#ccc' }}>
                    Win Rate: <span className="text-neon-purple">{coin['Trade Win Rate']}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass p-6 rounded-lg border-glow">
            <h3 className="text-neon-purple font-cyber mb-4" style={{ fontSize: '1.25rem' }}>
              Quick Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4 font-mono text-center">
              <div>
                <div className="text-neon-green font-bold" style={{ fontSize: '2rem' }}>
                  {data.summary['Max Win']?.toFixed(0)}
                </div>
                <div style={{ color: '#999', fontSize: '0.875rem' }}>Max Win ($)</div>
              </div>
              <div>
                <div className="text-neon-pink font-bold" style={{ fontSize: '2rem' }}>
                  {Math.abs(data.summary['Max Loss'] || 0).toFixed(0)}
                </div>
                <div style={{ color: '#999', fontSize: '0.875rem' }}>Max Loss ($)</div>
              </div>
              <div>
                <div className="text-neon-blue font-bold" style={{ fontSize: '2rem' }}>
                  {data.summary['Profitable Trades'] || 0}
                </div>
                <div style={{ color: '#999', fontSize: '0.875rem' }}>Winning Trades</div>
              </div>
              <div>
                <div className="text-neon-yellow font-bold" style={{ fontSize: '2rem' }}>
                  {((data.summary['Total PNL'] / data.summary['Total Transactions']) || 0).toFixed(2)}
                </div>
                <div style={{ color: '#999', fontSize: '0.875rem' }}>Avg per Trade ($)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Positions */}
        <div className="glass p-6 rounded-lg border-glow">
          <h3 className="text-neon-green font-cyber mb-4" style={{ fontSize: '1.25rem' }}>
            Recent Positions
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Entry Price</th>
                  <th>Duration</th>
                  <th>P&L</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.positions.slice(0, 8).map((position: any, index: number) => (
                  <tr key={index}>
                    <td className="text-neon-blue font-bold">{position.Asset}</td>
                    <td>{position['Position Type']}</td>
                    <td>{position['Position Size']}</td>
                    <td>${position['Avg Entry Price']?.toFixed(2)}</td>
                    <td>{position['Duration (Hours)']?.toFixed(1)}h</td>
                    <td style={{ 
                      color: position['Net PNL'] > 0 ? 'var(--cyber-green)' : 'var(--cyber-pink)',
                      fontWeight: 'bold'
                    }}>
                      ${position['Net PNL']?.toFixed(2)}
                    </td>
                    <td>
                      <span style={{
                        background: position.Status === 'Closed' ? 'var(--cyber-green)' : 'var(--cyber-yellow)',
                        color: 'var(--dark-900)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {position.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '3rem', textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>
          <div className="text-neon-blue font-cyber">
            TRADING NEXUS v1.0.0
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            Last updated: {new Date(data.metadata.generated_at).toLocaleString()}
          </div>
        </div>
      </main>

      {/* Floating decoration elements */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="animate-float"
          style={{
            position: 'fixed',
            width: '60px',
            height: '60px',
            border: '2px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '50%',
            left: `${20 + i * 30}%`,
            top: `${30 + i * 20}%`,
            pointerEvents: 'none',
            animationDelay: `${i * 1}s`,
            zIndex: 1
          }}
        />
      ))}
    </div>
  );
}

export default SimpleApp;