import React, { useState, useEffect } from 'react';
import { JournalEntry, JournalSettings } from '../types/journal';
import { TradingData } from '../types/trading';
import TradeEntryForm from '../components/journal/TradeEntryForm';
import TradeTable from '../components/journal/TradeTable';
import TradeDetail from '../components/journal/TradeDetail';

interface JournalPageProps {
  data: TradingData;
}

const JournalPage: React.FC<JournalPageProps> = ({ data }) => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [settings, setSettings] = useState<JournalSettings>({
    defaultExchanges: ['Blofin', 'EdgeX', 'Breakout'],
    riskPercentage: 2, // 2% default risk
    accountSize: 10000 // Default account size
  });

  useEffect(() => {
    // Load journal entries from localStorage
    const savedEntries = localStorage.getItem('tradingJournal');
    if (savedEntries) {
      setJournalEntries(JSON.parse(savedEntries));
    }

    // Load settings
    const savedSettings = localStorage.getItem('journalSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveJournalEntries = (entries: JournalEntry[]) => {
    setJournalEntries(entries);
    localStorage.setItem('tradingJournal', JSON.stringify(entries));
  };

  const addJournalEntry = (entry: JournalEntry) => {
    const newEntries = [...journalEntries, entry];
    saveJournalEntries(newEntries);
    setShowForm(false);
  };

  const updateJournalEntry = (updatedEntry: JournalEntry) => {
    const newEntries = journalEntries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    saveJournalEntries(newEntries);
    setSelectedEntry(updatedEntry);
  };

  const deleteJournalEntry = (id: string) => {
    const newEntries = journalEntries.filter(entry => entry.id !== id);
    saveJournalEntries(newEntries);
    setSelectedEntry(null);
  };

  const calculateSummaryStats = () => {
    const openTrades = journalEntries.filter(entry => entry.status !== 'Closed');
    const closedTrades = journalEntries.filter(entry => entry.status === 'Closed');
    
    const totalRisk = openTrades.reduce((sum, entry) => sum + entry.risk, 0);
    const totalPotentialReward = openTrades.reduce((sum, entry) => {
      const firstTP = entry.takeProfits[0];
      if (firstTP) {
        const reward = Math.abs(firstTP.price - entry.entry) * entry.size;
        return sum + reward;
      }
      return sum;
    }, 0);

    const realizedPnL = closedTrades.reduce((sum, entry) => {
      return sum + entry.actualExits.reduce((exitSum, exit) => exitSum + exit.pnl, 0);
    }, 0);

    return {
      totalEntries: journalEntries.length,
      openTrades: openTrades.length,
      closedTrades: closedTrades.length,
      totalRisk,
      totalPotentialReward,
      realizedPnL,
      riskRewardRatio: totalRisk > 0 ? totalPotentialReward / totalRisk : 0
    };
  };

  const stats = calculateSummaryStats();

  if (selectedEntry) {
    return (
      <TradeDetail
        entry={selectedEntry}
        onUpdate={updateJournalEntry}
        onDelete={deleteJournalEntry}
        onClose={() => setSelectedEntry(null)}
        settings={settings}
        exchangeData={data}
      />
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        background: 'rgba(26, 26, 46, 0.6)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(0, 212, 255, 0.3)'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #00d4ff 0%, #b366f5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            marginBottom: '10px'
          }}>
            📊 Trading Journal
          </h1>
          <p style={{ color: '#ccc', margin: 0 }}>
            Track your trades, analyze performance, and improve your strategy
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #b366f5 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 212, 255, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {showForm ? '❌ Cancel' : '➕ New Trade'}
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { label: 'Total Entries', value: stats.totalEntries, color: '#00d4ff' },
          { label: 'Open Trades', value: stats.openTrades, color: '#ffa500' },
          { label: 'Closed Trades', value: stats.closedTrades, color: '#32cd32' },
          { label: 'Total Risk', value: `$${stats.totalRisk.toFixed(2)}`, color: '#ff6b6b' },
          { label: 'Potential Reward', value: `$${stats.totalPotentialReward.toFixed(2)}`, color: '#4ecdc4' },
          { label: 'Realized P&L', value: `$${stats.realizedPnL.toFixed(2)}`, color: stats.realizedPnL >= 0 ? '#32cd32' : '#ff6b6b' },
          { label: 'Avg R:R Ratio', value: stats.riskRewardRatio.toFixed(2), color: '#b366f5' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'rgba(26, 26, 46, 0.6)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: stat.color,
              marginBottom: '8px'
            }}>
              {stat.value}
            </div>
            <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Trade Entry Form */}
      {showForm && (
        <div style={{ marginBottom: '30px' }}>
          <TradeEntryForm
            onSubmit={addJournalEntry}
            onCancel={() => setShowForm(false)}
            settings={settings}
          />
        </div>
      )}

      {/* Trade Table */}
      <TradeTable
        entries={journalEntries}
        onSelectEntry={setSelectedEntry}
        onDeleteEntry={deleteJournalEntry}
        onUpdateEntry={updateJournalEntry}
      />
    </div>
  );
};

export default JournalPage;

