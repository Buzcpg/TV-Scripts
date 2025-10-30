import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import TransactionsPage from './pages/TransactionsPage';
import BrokersPage from './pages/BrokersPage';
import JournalPage from './pages/JournalPage';
import LoadingScreen from './components/LoadingScreen';

interface TradingData {
  summary: any;
  positions: any[];
  coins: any[];
  trades: any[];
  day_analysis: any[];
  hour_analysis: any[];
  weekend_analysis: any[];
  blofin: any[];
  edgex: any[];
  breakout: any[];
  metadata: any;
  [key: string]: any;
}

type PageType = 'home' | 'analytics' | 'transactions' | 'brokers' | 'journal';

function App() {
  const [data, setData] = useState<TradingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/trading_data.json');
        if (!response.ok) {
          throw new Error(`Failed to load trading data: ${response.status} ${response.statusText}`);
        }
        const tradingData = await response.json();
        setData(tradingData);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('❌ Data loading error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Trading data not found: ${errorMessage}`);
        setData(null); // Ensure no data is set on error
      } finally {
        setTimeout(() => setLoading(false), 2000);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error && !data) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)', 
        color: 'white',
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(26, 26, 46, 0.8)',
          padding: '2rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 0, 107, 0.3)',
          maxWidth: '600px',
          margin: '0 2rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h1 style={{ color: '#ff006b', fontSize: '1.5rem', marginBottom: '1rem' }}>
            Trading Data Missing
          </h1>
          <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>{error}</p>
          
          <div style={{ 
            background: 'rgba(255, 0, 107, 0.1)', 
            padding: '1rem', 
            borderRadius: '4px',
            border: '1px solid rgba(255, 0, 107, 0.2)',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ color: '#ff006b', fontSize: '1rem', marginBottom: '0.5rem' }}>
              🔧 How to Fix:
            </h2>
            <ol style={{ 
              color: '#ccc', 
              textAlign: 'left', 
              paddingLeft: '1.5rem',
              lineHeight: '1.6'
            }}>
              <li>Run: <code style={{ color: '#00d4ff' }}>python trading_performance_analyzer.py</code></li>
              <li>If that fails, check your broker data files are in place</li>
              <li>Verify the JSON conversion completed successfully</li>
              <li>Check the console for detailed error messages</li>
            </ol>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(45deg, #ff006b, #b366f5)',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}
          >
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage data={data} />;
      case 'analytics':
        return <AnalyticsPage data={data} />;
      case 'journal':
        return <JournalPage data={data} />;
      case 'transactions':
        return <TransactionsPage data={data} />;
      case 'brokers':
        return <BrokersPage data={data} />;
      default:
        return <HomePage data={data} />;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)', 
      color: 'white',
      fontFamily: 'monospace',
      position: 'relative'
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        opacity: 0.2,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        {renderPage()}
      </div>

      {/* Floating decoration elements */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            width: `${40 + i * 10}px`,
            height: `${40 + i * 10}px`,
            border: '2px solid rgba(0, 212, 255, 0.1)',
            borderRadius: '50%',
            left: `${10 + i * 20}%`,
            top: `${20 + i * 15}%`,
            pointerEvents: 'none',
            animation: `float 3s ease-in-out ${i * 0.8}s infinite`,
            zIndex: 1
          }}
        />
      ))}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(0, 212, 255, 0.5); }
          50% { box-shadow: 0 0 20px rgba(179, 102, 245, 0.8); }
        }
        .neon-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;