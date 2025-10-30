import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface AnalyticsPageProps {
  data: any;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'time' | 'day' | 'coins'>('time');
  const [hourMetric, setHourMetric] = useState<string>('Total PNL');
  const [dayMetric, setDayMetric] = useState<string>('Total PNL');
  
  const hourAnalysis = data.hour_analysis || [];
  const dayAnalysis = data.day_analysis || [];
  const coinAnalysis = data.coins || [];

  // Available metrics for hour analysis
  const hourMetrics = [
    { key: 'Total PNL', label: 'Total P&L', color: '#00d4ff' },
    { key: 'Trade Count', label: 'Trade Count', color: '#b366f5' },
    { key: 'Win Rate %', label: 'Win Rate %', color: '#00ff88' },
    { key: 'Avg PNL', label: 'Average P&L', color: '#ff8800' },
    { key: 'Total Fees', label: 'Total Fees', color: '#ff006b' },
    { key: 'Net PNL', label: 'Net P&L', color: '#ffff00' }
  ];

  // Available metrics for day analysis
  const dayMetrics = [
    { key: 'Total PNL', label: 'Total P&L', color: '#00d4ff' },
    { key: 'Trade Count', label: 'Trade Count', color: '#b366f5' },
    { key: 'Win Rate %', label: 'Win Rate %', color: '#00ff88' },
    { key: 'Avg PNL', label: 'Average P&L', color: '#ff8800' },
    { key: 'Total Fees', label: 'Total Fees', color: '#ff006b' },
    { key: 'Net PNL', label: 'Net P&L', color: '#ffff00' },
    { key: 'Max Win', label: 'Max Win', color: '#00ff88' },
    { key: 'Max Loss', label: 'Max Loss', color: '#ff006b' }
  ];

  // Process hour data for the chart
  const hourData = hourAnalysis.map((item: any, index: number) => ({
    hour: `${item['Hour of Day']}:00`,
    value: item[hourMetric] || 0,
    'Total PNL': item['Total PNL'] || 0,
    'Trade Count': item['Trade Count'] || 0,
    'Win Rate %': item['Win Rate %'] || 0,
    'Avg PNL': item['Avg PNL'] || 0,
    'Total Fees': item['Total Fees'] || 0,
    'Net PNL': item['Net PNL'] || 0,
    gradient: `hsl(${(index * 15) % 360}, 70%, 60%)`
  }));

  // Process day data for vertical bar chart with days on horizontal axis
  const dayData = dayAnalysis.map((item: any, index: number) => ({
    day: item['Day of Week'],
    value: item[dayMetric] || 0,
    'Total PNL': item['Total PNL'] || 0,
    'Trade Count': item['Trade Count'] || 0,
    'Win Rate %': item['Win Rate %'] || 0,
    'Avg PNL': item['Avg PNL'] || 0,
    'Total Fees': item['Total Fees'] || 0,
    'Net PNL': item['Net PNL'] || 0,
    'Max Win': item['Max Win'] || 0,
    'Max Loss': item['Max Loss'] || 0,
    gradient: `hsl(${(index * 50) % 360}, 70%, 60%)`
  }));

  // Get current metric info
  const currentHourMetric = hourMetrics.find(m => m.key === hourMetric) || hourMetrics[0];
  const currentDayMetric = dayMetrics.find(m => m.key === dayMetric) || dayMetrics[0];

  // Colors for the charts
  const colors = {
    profit: '#00ff88',
    loss: '#ff006b',
    blue: '#00d4ff',
    purple: '#b366f5',
    orange: '#ff8800'
  };

  const tabs = [
    { id: 'time', label: 'Performance by Time', icon: '⏰' },
    { id: 'day', label: 'Performance by Day', icon: '📅' },
    { id: 'coins', label: 'Asset Analysis', icon: '🪙' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          background: 'linear-gradient(45deg, #00d4ff, #b366f5, #ff006b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Performance Analytics
        </h1>
        <p style={{ color: '#999', fontSize: '1.1rem' }}>
          Deep dive into your trading patterns and performance metrics
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
        border: '1px solid rgba(0, 212, 255, 0.3)'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, #00d4ff, #b366f5)' 
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
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'time' && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Performance by Hour Chart */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(16, 21, 62, 0.9) 100%)',
            borderRadius: '16px',
            padding: '2rem',
            border: '2px solid rgba(0, 212, 255, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: '#00d4ff', fontSize: '1.5rem', margin: 0 }}>
                Performance by Hour
              </h2>
              
              {/* Metric Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ color: '#999', fontSize: '0.9rem' }}>Metric:</label>
                <select
                  value={hourMetric}
                  onChange={(e) => setHourMetric(e.target.value)}
                  style={{
                    background: 'rgba(26, 26, 46, 0.9)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    color: '#00d4ff',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace'
                  }}
                >
                  {hourMetrics.map(metric => (
                    <option key={metric.key} value={metric.key} style={{ background: '#1a1a2e' }}>
                      {metric.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={hourData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fill: '#999', fontSize: 12 }}
                    stroke="rgba(255,255,255,0.3)"
                  />
                  <YAxis 
                    tick={{ fill: '#999', fontSize: 12 }}
                    stroke="rgba(255,255,255,0.3)"
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(26, 26, 46, 0.95)',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="value" fill={currentHourMetric.color} radius={[4, 4, 0, 0]}>
                    {hourData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                    ))}
                  </Bar>
                  
                  {/* Gradient definitions */}
                  <defs>
                    {hourData.map((entry: any, index: number) => (
                      <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={currentHourMetric.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={currentHourMetric.color} stopOpacity={0.3} />
                      </linearGradient>
                    ))}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'day' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(16, 21, 62, 0.9) 100%)',
          borderRadius: '16px',
          padding: '2rem',
          border: '2px solid rgba(0, 212, 255, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: '#00d4ff', fontSize: '1.5rem', margin: 0 }}>
              Performance by Day
            </h2>
            
            {/* Metric Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ color: '#999', fontSize: '0.9rem' }}>Metric:</label>
              <select
                value={dayMetric}
                onChange={(e) => setDayMetric(e.target.value)}
                style={{
                  background: 'rgba(26, 26, 46, 0.9)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  color: '#00d4ff',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace'
                }}
              >
                {dayMetrics.map(metric => (
                  <option key={metric.key} value={metric.key} style={{ background: '#1a1a2e' }}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart 
                data={dayData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="day"
                  tick={{ fill: '#999', fontSize: 12 }}
                  stroke="rgba(255,255,255,0.3)"
                />
                <YAxis 
                  tick={{ fill: '#999', fontSize: 12 }}
                  stroke="rgba(255,255,255,0.3)"
                />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(26, 26, 46, 0.95)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" fill={currentDayMetric.color} radius={[4, 4, 0, 0]}>
                  {dayData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={`url(#dayGradient-${index})`} />
                  ))}
                </Bar>
                
                {/* Gradient definitions for days */}
                <defs>
                  {dayData.map((entry: any, index: number) => (
                    <linearGradient key={`dayGradient-${index}`} id={`dayGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={currentDayMetric.color} stopOpacity={1} />
                      <stop offset="50%" stopColor={currentDayMetric.color} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={currentDayMetric.color} stopOpacity={0.2} />
                    </linearGradient>
                  ))}
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Statistics Summary */}
          <div style={{
            marginTop: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem'
          }}>
            {dayData.map((item: any, index: number) => (
              <div key={index} style={{
                background: `linear-gradient(135deg, ${currentDayMetric.color}20, ${currentDayMetric.color}10)`,
                border: `1px solid ${currentDayMetric.color}30`,
                borderRadius: '8px',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ color: currentDayMetric.color, fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {item.day}
                </div>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {dayMetric.includes('Rate') ? `${item.value}%` : 
                   dayMetric.includes('Count') ? item.value : 
                   `$${item.value.toFixed(2)}`}
                </div>
                <div style={{ color: '#999', fontSize: '0.8rem' }}>
                  {item['Trade Count']} trades
                </div>
                <div style={{ color: '#00ff88', fontSize: '0.8rem' }}>
                  {item['Win Rate %']}% win rate
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'coins' && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Coin Performance Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {coinAnalysis.slice(0, 8).map((coin: any, index: number) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(16, 21, 62, 0.9) 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '2px solid rgba(0, 212, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 212, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#00d4ff', fontSize: '1.3rem', margin: 0 }}>
                    {coin.Asset}
                  </h3>
                  <div style={{
                    background: parseFloat((coin['Net PNL'] || '0').replace('$', '')) >= 0 
                      ? 'linear-gradient(135deg, #00ff88, #00d4ff)'
                      : 'linear-gradient(135deg, #ff006b, #ff8800)',
                    color: '#0a0a0f',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {coin['Net PNL']}
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                  <div>
                    <div style={{ color: '#999', marginBottom: '0.3rem' }}>Trades</div>
                    <div style={{ color: '#b366f5', fontWeight: 'bold' }}>{coin['Total Trades']}</div>
                  </div>
                  <div>
                    <div style={{ color: '#999', marginBottom: '0.3rem' }}>Win Rate</div>
                    <div style={{ color: '#00ff88', fontWeight: 'bold' }}>{coin['Trade Win Rate']}</div>
                  </div>
                  <div>
                    <div style={{ color: '#999', marginBottom: '0.3rem' }}>Max Win</div>
                    <div style={{ color: '#00ff88', fontWeight: 'bold' }}>{coin['Max Win']}</div>
                  </div>
                  <div>
                    <div style={{ color: '#999', marginBottom: '0.3rem' }}>Max Loss</div>
                    <div style={{ color: '#ff006b', fontWeight: 'bold' }}>{coin['Max Loss']}</div>
                  </div>
                  <div>
                    <div style={{ color: '#999', marginBottom: '0.3rem' }}>Avg Duration</div>
                    <div style={{ color: '#ffff00', fontWeight: 'bold' }}>{coin['Avg Duration']}</div>
                  </div>
                  <div>
                    <div style={{ color: '#999', marginBottom: '0.3rem' }}>Best Day</div>
                    <div style={{ color: '#ff8800', fontWeight: 'bold' }}>{coin['Best Day']}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
