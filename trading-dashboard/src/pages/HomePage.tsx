import React from 'react';

interface HomePageProps {
  data: any;
}

const HomePage: React.FC<HomePageProps> = ({ data }) => {
  const summary = data.summary || {};
  const positions = data.positions || [];
  const coins = data.coins || [];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(179, 102, 245, 0.1) 50%, rgba(255, 0, 107, 0.1) 100%)',
        borderRadius: '20px',
        padding: '3rem 2rem',
        marginBottom: '3rem',
        border: '2px solid rgba(0, 212, 255, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(0, 212, 255, 0.1), transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 0, 107, 0.1), transparent 50%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <h1 style={{
            fontSize: '3.5rem',
            background: 'linear-gradient(45deg, #00d4ff, #b366f5, #ff006b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            Trading Performance Overview
          </h1>
          <p style={{
            fontSize: '1.4rem',
            color: '#b366f5',
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            Your comprehensive trading analytics across all platforms
          </p>
          
          {/* Key metrics in hero */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                background: summary['Net PNL'] >= 0 ? 'linear-gradient(45deg, #00ff88, #00d4ff)' : 'linear-gradient(45deg, #ff006b, #ff8800)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ${(summary['Net PNL'] || 0).toFixed(2)}
              </div>
              <div style={{ color: '#999', fontSize: '1.1rem' }}>Net P&L</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #00d4ff, #b366f5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {(summary['Win Rate'] || 0).toFixed(1)}%
              </div>
              <div style={{ color: '#999', fontSize: '1.1rem' }}>Win Rate</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #b366f5, #ff006b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {summary['Total Transactions'] || 0}
              </div>
              <div style={{ color: '#999', fontSize: '1.1rem' }}>Total Trades</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* Profit/Loss Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
          borderRadius: '16px',
          padding: '2rem',
          border: '2px solid rgba(0, 255, 136, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
        className="neon-glow"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 255, 136, 0.3)';
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
            background: 'radial-gradient(circle, rgba(0, 255, 136, 0.2), transparent)',
            borderRadius: '50%'
          }} />
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem' }}>💰</div>
              <div>
                <div style={{ color: '#00ff88', fontSize: '0.9rem', fontWeight: 'bold' }}>PROFIT ANALYSIS</div>
                <div style={{ color: '#999', fontSize: '0.8rem' }}>Performance Metrics</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: summary['Net PNL'] >= 0 ? '#00ff88' : '#ff006b',
                marginBottom: '0.5rem'
              }}>
                ${(summary['Net PNL'] || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Net Profit/Loss</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: '#00ff88', fontWeight: 'bold' }}>${(summary['Max Win'] || 0).toFixed(0)}</div>
                <div style={{ color: '#999' }}>Best Trade</div>
              </div>
              <div>
                <div style={{ color: '#ff006b', fontWeight: 'bold' }}>${Math.abs(summary['Max Loss'] || 0).toFixed(0)}</div>
                <div style={{ color: '#999' }}>Worst Trade</div>
              </div>
            </div>
          </div>
        </div>

        {/* Win Rate Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(179, 102, 245, 0.1) 100%)',
          borderRadius: '16px',
          padding: '2rem',
          border: '2px solid rgba(0, 212, 255, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 212, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2), transparent)',
            borderRadius: '50%'
          }} />
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem' }}>🎯</div>
              <div>
                <div style={{ color: '#00d4ff', fontSize: '0.9rem', fontWeight: 'bold' }}>SUCCESS RATE</div>
                <div style={{ color: '#999', fontSize: '0.8rem' }}>Trading Accuracy</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#00d4ff',
                marginBottom: '0.5rem'
              }}>
                {(summary['Win Rate'] || 0).toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Win Rate</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: '#00ff88', fontWeight: 'bold' }}>{summary['Profitable Positions'] || 0}</div>
                <div style={{ color: '#999' }}>Winning</div>
              </div>
              <div>
                <div style={{ color: '#ff006b', fontWeight: 'bold' }}>{summary['Losing Positions'] || 0}</div>
                <div style={{ color: '#999' }}>Losing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Volume Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(179, 102, 245, 0.1) 0%, rgba(255, 0, 107, 0.1) 100%)',
          borderRadius: '16px',
          padding: '2rem',
          border: '2px solid rgba(179, 102, 245, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(179, 102, 245, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{
            position: 'absolute',
            bottom: '-50%',
            right: '-50%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(179, 102, 245, 0.2), transparent)',
            borderRadius: '50%'
          }} />
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem' }}>📊</div>
              <div>
                <div style={{ color: '#b366f5', fontSize: '0.9rem', fontWeight: 'bold' }}>TRADING VOLUME</div>
                <div style={{ color: '#999', fontSize: '0.8rem' }}>Activity Overview</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#b366f5',
                marginBottom: '0.5rem'
              }}>
                {summary['Total Transactions'] || 0}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Total Trades</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: '#b366f5', fontWeight: 'bold' }}>{summary['Total Closed Positions'] || 0}</div>
                <div style={{ color: '#999' }}>Positions</div>
              </div>
              <div>
                <div style={{ color: '#ff006b', fontWeight: 'bold' }}>{coins.length}</div>
                <div style={{ color: '#999' }}>Assets</div>
              </div>
            </div>
          </div>
        </div>

        {/* Costs Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 136, 0, 0.1) 0%, rgba(255, 255, 0, 0.1) 100%)',
          borderRadius: '16px',
          padding: '2rem',
          border: '2px solid rgba(255, 136, 0, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 136, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{
            position: 'absolute',
            bottom: '-50%',
            left: '-50%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255, 136, 0, 0.2), transparent)',
            borderRadius: '50%'
          }} />
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem' }}>💸</div>
              <div>
                <div style={{ color: '#ff8800', fontSize: '0.9rem', fontWeight: 'bold' }}>TRADING COSTS</div>
                <div style={{ color: '#999', fontSize: '0.8rem' }}>Fee Analysis</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#ff8800',
                marginBottom: '0.5rem'
              }}>
                ${(summary['Total Fees'] || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Total Fees</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: '#ffff00', fontWeight: 'bold' }}>${(summary['Avg PNL per Trade'] || 0).toFixed(2)}</div>
                <div style={{ color: '#999' }}>Avg/Trade</div>
              </div>
              <div>
                <div style={{ color: '#ff8800', fontWeight: 'bold' }}>
                  {((summary['Total Fees'] / Math.max(summary['Total PNL'] || 1, 1)) * 100).toFixed(1)}%
                </div>
                <div style={{ color: '#999' }}>Fee Ratio</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(16, 21, 62, 0.9) 100%)',
        borderRadius: '16px',
        padding: '2rem',
        border: '2px solid rgba(0, 212, 255, 0.3)',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          color: '#00d4ff',
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⚡ Recent Activity Preview
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {positions.slice(0, 6).map((position: any, index: number) => (
            <div key={index} style={{
              background: 'rgba(0, 212, 255, 0.05)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>{position.Asset}</div>
                <div style={{ 
                  color: (position['Net PNL'] || 0) >= 0 ? '#00ff88' : '#ff006b',
                  fontWeight: 'bold'
                }}>
                  ${(position['Net PNL'] || 0).toFixed(2)}
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#999' }}>
                {position['Position Type']} • {(position['Duration (Hours)'] || 0).toFixed(1)}h
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
