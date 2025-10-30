import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)', 
      color: 'white',
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background */}
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
        backgroundSize: '50px 50px',
        animation: 'move-grid 10s linear infinite',
        opacity: 0.3,
        pointerEvents: 'none'
      }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
        {/* Main logo */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '2rem',
          background: 'linear-gradient(45deg, #00d4ff, #b366f5, #ff006b, #00ff88)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'glow-text 2s ease-in-out infinite'
        }}>
          ⚡ TRADING NEXUS ⚡
        </div>
        
        {/* Subtitle */}
        <div style={{ 
          color: '#b366f5', 
          fontSize: '1.4rem', 
          marginBottom: '3rem',
          opacity: 0.8
        }}>
          Advanced Performance Analytics
        </div>

        {/* Loading animation */}
        <div style={{ marginBottom: '2rem', position: 'relative' }}>
          {/* Main spinner */}
          <div style={{
            width: '80px',
            height: '80px',
            border: '4px solid rgba(0, 212, 255, 0.3)',
            borderTop: '4px solid #00d4ff',
            borderRight: '4px solid #b366f5',
            borderRadius: '50%',
            animation: 'spin 1.5s linear infinite',
            margin: '0 auto'
          }} />
          
          {/* Inner glow */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '60px',
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.3), transparent)',
            borderRadius: '50%',
            animation: 'pulse-glow 2s ease-in-out infinite'
          }} />
        </div>
        
        {/* Loading text */}
        <div style={{ 
          color: '#00d4ff', 
          fontSize: '1.2rem', 
          marginBottom: '2rem',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          Initializing Trading Matrix...
        </div>
        
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                background: `linear-gradient(45deg, ${
                  i % 2 === 0 ? '#00ff88' : '#ff006b'
                }, ${i % 2 === 0 ? '#00d4ff' : '#b366f5'})`,
                borderRadius: '50%',
                animation: `bounce 1.5s ease-in-out ${i * 0.2}s infinite`,
                boxShadow: `0 0 10px ${i % 2 === 0 ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 0, 107, 0.8)'}`
              }}
            />
          ))}
        </div>

        {/* Loading steps */}
        <div style={{ 
          marginTop: '3rem', 
          color: '#666', 
          fontSize: '0.9rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ opacity: 0.8 }}>📊 Loading trading data...</div>
          <div style={{ opacity: 0.6 }}>🔍 Analyzing performance metrics...</div>
          <div style={{ opacity: 0.4 }}>⚡ Preparing cyberpunk interface...</div>
        </div>
      </div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${20 + Math.random() * 30}px`,
            height: `${20 + Math.random() * 30}px`,
            background: `linear-gradient(45deg, ${
              ['#00d4ff', '#b366f5', '#ff006b', '#00ff88'][i % 4]
            }, transparent)`,
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-particle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`,
            opacity: 0.1 + Math.random() * 0.3,
            pointerEvents: 'none'
          }}
        />
      ))}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.2); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.2); }
        }
        
        @keyframes glow-text {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.8)); }
          50% { filter: drop-shadow(0 0 20px rgba(179, 102, 245, 1)); }
        }
        
        @keyframes move-grid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(90deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
          75% { transform: translateY(-15px) rotate(270deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;