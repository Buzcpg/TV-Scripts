import React, { useState } from 'react';
import { JournalEntry, FollowUp, ActualExit, JournalSettings } from '../../types/journal';
import { TradingData } from '../../types/trading';
import TradeEntryForm from './TradeEntryForm';
import FollowUpForm from './FollowUpForm';
import ImageUpload from './ImageUpload';

interface TradeDetailProps {
  entry: JournalEntry;
  onUpdate: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  settings: JournalSettings;
  exchangeData: TradingData;
}

const TradeDetail: React.FC<TradeDetailProps> = ({
  entry,
  onUpdate,
  onDelete,
  onClose,
  settings,
  exchangeData
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'followups' | 'analysis' | 'edit'>('overview');
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [editingExit, setEditingExit] = useState<number | null>(null);
  const [editExitData, setEditExitData] = useState<{
    price: number;
    percentage: number;
    pnl: number;
    fees: number;
    notes: string;
    useManualPnL: boolean;
  }>({
    price: 0,
    percentage: 0,
    pnl: 0,
    fees: 0,
    notes: '',
    useManualPnL: false
  });

  const handleAddFollowUp = (followUp: FollowUp) => {
    const updatedEntry = {
      ...entry,
      followUps: [...entry.followUps, followUp]
    };
    onUpdate(updatedEntry);
    setShowFollowUpForm(false);
  };

  const handleAddActualExit = (exit: ActualExit) => {
    const updatedEntry = {
      ...entry,
      actualExits: [...entry.actualExits, exit],
      status: calculateNewStatus(entry, exit)
    };
    onUpdate(updatedEntry);
  };

  const calculateNewStatus = (entry: JournalEntry, newExit: ActualExit): 'Open' | 'Closed' | 'Partially Closed' => {
    const totalExited = [...entry.actualExits, newExit].reduce((sum, exit) => sum + exit.percentage, 0);
    if (totalExited >= 100) return 'Closed';
    if (totalExited > 0) return 'Partially Closed';
    return 'Open';
  };

  const calculateTotalPnL = (): number => {
    return entry.actualExits.reduce((sum, exit) => sum + exit.pnl, 0);
  };

  const calculateRemainingPosition = (): number => {
    const exitedPercentage = entry.actualExits.reduce((sum, exit) => sum + exit.percentage, 0);
    return Math.max(0, 100 - exitedPercentage);
  };

  const findLinkedTrades = () => {
    // Match trades from exchange data based on coin, approximate time, and size
    const tradeTime = new Date(entry.timestamp);
    const timeWindow = 24 * 60 * 60 * 1000; // 24 hours
    
    const allTrades = [
      ...(exchangeData.blofin || []),
      ...(exchangeData.edgex || []),
      ...(exchangeData.breakout || [])
    ];

    return allTrades.filter(trade => {
      const tradeTime2 = new Date(trade.Date);
      const timeDiff = Math.abs(tradeTime.getTime() - tradeTime2.getTime());
      
      return (
        trade.Asset.toUpperCase().includes(entry.coin.toUpperCase()) &&
        timeDiff <= timeWindow &&
        Math.abs(trade.Quantity - entry.size) / entry.size < 0.1 // Within 10% of size
      );
    });
  };

  const linkedTrades = findLinkedTrades();

  const validatePnL = (
    direction: 'Long' | 'Short',
    entryPrice: number,
    exitPrice: number,
    manualPnL: number,
    positionSize: number
  ): { isValid: boolean; warning: string | null; calculatedPnL: number } => {
    const calculatedPnL = direction === 'Long' 
      ? (exitPrice - entryPrice) * positionSize
      : (entryPrice - exitPrice) * positionSize;

    // Check if manual P&L has opposite sign to what's expected
    const expectedPositive = calculatedPnL > 0;
    const manualPositive = manualPnL > 0;
    
    if (expectedPositive !== manualPositive && Math.abs(manualPnL) > 1) {
      const directionText = direction === 'Long' ? 'long' : 'short';
      const priceMovement = direction === 'Long' 
        ? (exitPrice > entryPrice ? 'up' : 'down')
        : (exitPrice < entryPrice ? 'down' : 'up');
      
      return {
        isValid: false,
        warning: `⚠️ For a ${directionText} position, price moved ${priceMovement} (${entryPrice.toFixed(4)} → ${exitPrice.toFixed(4)}), suggesting ${expectedPositive ? 'profit' : 'loss'}. Your manual P&L shows ${manualPositive ? 'profit' : 'loss'}. Are you sure this is correct?`,
        calculatedPnL
      };
    }

    // Check if manual P&L is significantly different from calculated
    const difference = Math.abs(manualPnL - calculatedPnL);
    const percentDiff = calculatedPnL !== 0 ? (difference / Math.abs(calculatedPnL)) * 100 : 0;
    
    if (difference > 10 && percentDiff > 20) { // $10 difference and >20% variance
      return {
        isValid: false,
        warning: `⚠️ Manual P&L ($${manualPnL.toFixed(2)}) differs significantly from calculated P&L ($${calculatedPnL.toFixed(2)}). Please verify your entry.`,
        calculatedPnL
      };
    }

    return { isValid: true, warning: null, calculatedPnL };
  };

  const startEditingExit = (index: number) => {
    const exit = entry.actualExits[index];
    setEditExitData({
      price: exit.price,
      percentage: exit.percentage,
      pnl: exit.manualPnl || exit.pnl,
      fees: exit.fees || 0,
      notes: exit.notes || '',
      useManualPnL: exit.pnlSource === 'manual'
    });
    setEditingExit(index);
  };

  const saveExitEdit = async () => {
    if (editingExit === null) return;

    const positionSize = (entry.size * editExitData.percentage) / 100;
    
    // Validate P&L if using manual entry
    if (editExitData.useManualPnL) {
      const validation = validatePnL(
        entry.direction,
        entry.entry,
        editExitData.price,
        editExitData.pnl,
        positionSize
      );

      if (!validation.isValid) {
        const confirmed = window.confirm(
          `${validation.warning}\n\nCalculated P&L would be: $${validation.calculatedPnL.toFixed(2)}\nYour manual P&L: $${editExitData.pnl.toFixed(2)}\n\nDo you want to proceed with the manual P&L?`
        );
        
        if (!confirmed) return;
      }
    }

    const calculatedPnL = entry.direction === 'Long' 
      ? (editExitData.price - entry.entry) * positionSize
      : (entry.entry - editExitData.price) * positionSize;

    const finalPnL = editExitData.useManualPnL ? editExitData.pnl : calculatedPnL;
    const netPnL = finalPnL - editExitData.fees;

    const updatedExits = [...entry.actualExits];
    updatedExits[editingExit] = {
      ...updatedExits[editingExit],
      price: editExitData.price,
      percentage: editExitData.percentage,
      pnl: netPnL,
      pnlSource: editExitData.useManualPnL ? 'manual' : 'calculated',
      manualPnl: editExitData.useManualPnL ? editExitData.pnl : undefined,
      fees: editExitData.fees > 0 ? editExitData.fees : undefined,
      notes: editExitData.notes || undefined
    };

    onUpdate({ ...entry, actualExits: updatedExits });
    setEditingExit(null);
  };

  const deleteExit = (index: number) => {
    if (window.confirm('Are you sure you want to delete this exit?')) {
      const updatedExits = entry.actualExits.filter((_, i) => i !== index);
      const totalExited = updatedExits.reduce((sum, exit) => sum + exit.percentage, 0);
      const newStatus: 'Open' | 'Closed' | 'Partially Closed' = 
        totalExited >= 100 ? 'Closed' : 
        totalExited > 0 ? 'Partially Closed' : 'Open';
      
      onUpdate({ 
        ...entry, 
        actualExits: updatedExits,
        status: newStatus
      });
    }
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 20px',
    background: isActive ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
    color: isActive ? '#00d4ff' : '#ccc',
    border: 'none',
    borderBottom: isActive ? '2px solid #00d4ff' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.3s ease'
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
            fontSize: '1.8rem',
            margin: 0,
            marginBottom: '5px',
            background: 'linear-gradient(135deg, #00d4ff 0%, #b366f5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {entry.coin} {entry.direction} Trade
          </h1>
          <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
            {entry.exchange} • {new Date(entry.timestamp).toLocaleString()} • 
            <span style={{ 
              color: entry.status === 'Open' ? '#ffa500' : entry.status === 'Closed' ? '#32cd32' : '#4ecdc4',
              fontWeight: 'bold',
              marginLeft: '5px'
            }}>
              {entry.status}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ccc',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ← Back
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this trade?')) {
                onDelete(entry.id);
                onClose();
              }
            }}
            style={{
              background: 'rgba(255, 107, 107, 0.2)',
              color: '#ff6b6b',
              border: '1px solid #ff6b6b',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        marginBottom: '30px',
        background: 'rgba(26, 26, 46, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden'
      }}>
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'followups', label: `📝 Follow-ups (${entry.followUps.length})` },
          { key: 'analysis', label: '🔗 Linked Trades' },
          { key: 'edit', label: '✏️ Edit' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={tabStyle(activeTab === tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '30px' }}>
          {/* Trade Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{
              background: 'rgba(26, 26, 46, 0.6)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '15px', fontSize: '1.1rem' }}>Position Details</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ccc' }}>Size:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{entry.size.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ccc' }}>Entry:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>${entry.entry.toFixed(4)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ccc' }}>Stop Loss:</span>
                  <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>${entry.stopLoss.toFixed(4)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ccc' }}>Remaining:</span>
                  <span style={{ color: '#ffa500', fontWeight: 'bold' }}>{calculateRemainingPosition()}%</span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(26, 26, 46, 0.6)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '15px', fontSize: '1.1rem' }}>Risk Management</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ccc' }}>Risk Amount:</span>
                  <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>${entry.risk.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ccc' }}>Risk %:</span>
                  <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                    {((entry.risk / settings.accountSize) * 100).toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ccc' }}>Avg R:R:</span>
                  <span style={{ 
                    color: entry.riskReward.reduce((a, b) => a + b, 0) / entry.riskReward.length >= 1.5 ? '#32cd32' : '#ffa500',
                    fontWeight: 'bold' 
                  }}>
                    {(entry.riskReward.reduce((a, b) => a + b, 0) / entry.riskReward.length).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(26, 26, 46, 0.6)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '15px', fontSize: '1.1rem' }}>Performance</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ccc' }}>Current P&L:</span>
                  <span style={{ 
                    color: calculateTotalPnL() >= 0 ? '#32cd32' : '#ff6b6b', 
                    fontWeight: 'bold' 
                  }}>
                    {calculateTotalPnL() >= 0 ? '+' : ''}${calculateTotalPnL().toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ccc' }}>Exits:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{entry.actualExits.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ccc' }}>Follow-ups:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{entry.followUps.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Take Profit Levels */}
          <div style={{
            background: 'rgba(26, 26, 46, 0.6)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ color: '#00d4ff', marginBottom: '15px', fontSize: '1.1rem' }}>Take Profit Levels</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {entry.takeProfits.map((tp, index) => (
                <div key={index} style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ color: '#4ecdc4', fontWeight: 'bold', marginBottom: '8px' }}>
                    TP{tp.level}: ${tp.price.toFixed(4)}
                  </div>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    {tp.percentage}% • R:R {entry.riskReward[index]?.toFixed(2) || '0.00'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actual Exits */}
          {entry.actualExits.length > 0 && (
            <div style={{
              background: 'rgba(26, 26, 46, 0.6)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '15px', fontSize: '1.1rem' }}>Actual Exits</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {entry.actualExits.map((exit, index) => (
                  <div key={index} style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', alignItems: 'center', flex: 1 }}>
                        <div>
                          <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Date</div>
                          <div style={{ color: 'white', fontWeight: 'bold' }}>
                            {new Date(exit.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Price</div>
                          <div style={{ color: 'white', fontWeight: 'bold' }}>${exit.price.toFixed(4)}</div>
                        </div>
                        <div>
                          <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Amount</div>
                          <div style={{ color: 'white', fontWeight: 'bold' }}>{exit.percentage}%</div>
                        </div>
                        <div>
                          <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Net P&L</div>
                          <div style={{ 
                            color: exit.pnl >= 0 ? '#32cd32' : '#ff6b6b', 
                            fontWeight: 'bold' 
                          }}>
                            {exit.pnl >= 0 ? '+' : ''}${exit.pnl.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
                        <button
                          onClick={() => startEditingExit(index)}
                          style={{
                            background: 'rgba(0, 212, 255, 0.2)',
                            color: '#00d4ff',
                            border: '1px solid #00d4ff',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                          title="Edit Exit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteExit(index)}
                          style={{
                            background: 'rgba(255, 107, 107, 0.2)',
                            color: '#ff6b6b',
                            border: '1px solid #ff6b6b',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                          title="Delete Exit"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {/* Enhanced Exit Details */}
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{
                        background: exit.pnlSource === 'manual' ? 'rgba(255, 255, 0, 0.2)' : 
                                   exit.pnlSource === 'exchange' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 212, 255, 0.2)',
                        color: exit.pnlSource === 'manual' ? '#ffff00' : 
                               exit.pnlSource === 'exchange' ? '#00ff88' : '#00d4ff',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {exit.pnlSource === 'manual' ? '📝 Manual' : 
                         exit.pnlSource === 'exchange' ? '🔗 Exchange' : '🧮 Calculated'}
                      </div>
                      
                      {exit.fees && exit.fees > 0 && (
                        <div style={{ color: '#ccc', fontSize: '0.8rem' }}>
                          Fees: ${exit.fees.toFixed(2)}
                        </div>
                      )}
                      
                      {exit.manualPnl && (
                        <div style={{ color: '#ffff00', fontSize: '0.8rem' }}>
                          Manual P&L: ${exit.manualPnl.toFixed(2)}
                        </div>
                      )}
                      
                      {exit.exchangeTradeId && (
                        <div style={{ color: '#00ff88', fontSize: '0.8rem' }}>
                          Trade ID: {exit.exchangeTradeId}
                        </div>
                      )}
                    </div>
                    
                    {exit.notes && (
                      <div style={{ 
                        marginTop: '10px', 
                        padding: '8px', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: '6px',
                        borderLeft: '3px solid #4ecdc4'
                      }}>
                        <div style={{ color: '#ccc', fontSize: '0.85rem', fontStyle: 'italic' }}>
                          {exit.notes}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <div style={{
              background: 'rgba(26, 26, 46, 0.6)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '15px', fontSize: '1.1rem' }}>Notes</h3>
              <div style={{ color: '#ccc', lineHeight: '1.6' }}>
                {entry.notes}
              </div>
            </div>
          )}

          {/* Images */}
          <ImageUpload
            images={entry.images}
            onImagesChange={(images) => onUpdate({ ...entry, images })}
          />
        </div>
      )}

      {activeTab === 'followups' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#00d4ff', margin: 0 }}>Trade Follow-ups</h2>
            <button
              onClick={() => setShowFollowUpForm(true)}
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #b366f5 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ➕ Add Follow-up
            </button>
          </div>

          {showFollowUpForm && (
            <FollowUpForm
              onSubmit={handleAddFollowUp}
              onCancel={() => setShowFollowUpForm(false)}
              entry={entry}
              onAddExit={handleAddActualExit}
            />
          )}

          <div style={{ display: 'grid', gap: '20px' }}>
            {entry.followUps.map((followUp, index) => (
              <div key={followUp.id} style={{
                background: 'rgba(26, 26, 46, 0.6)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{
                    background: 'rgba(0, 212, 255, 0.2)',
                    color: '#00d4ff',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {followUp.type.replace('_', ' ').toUpperCase()}
                  </div>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    {new Date(followUp.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div style={{ color: 'white', marginBottom: '10px', fontWeight: 'bold' }}>
                  {followUp.description}
                </div>
                
                <div style={{ color: '#ccc', lineHeight: '1.6' }}>
                  {followUp.reasoning}
                </div>

                {followUp.newStopLoss && (
                  <div style={{ marginTop: '10px', color: '#ffa500' }}>
                    New Stop Loss: ${followUp.newStopLoss.toFixed(4)}
                  </div>
                )}

                {followUp.exitPrice && (
                  <div style={{ marginTop: '10px', color: '#4ecdc4' }}>
                    Exit Price: ${followUp.exitPrice.toFixed(4)} ({followUp.exitPercentage}%)
                  </div>
                )}
              </div>
            ))}

            {entry.followUps.length === 0 && (
              <div style={{
                background: 'rgba(26, 26, 46, 0.6)',
                padding: '40px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📝</div>
                <div style={{ color: '#ccc' }}>No follow-ups recorded yet</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div style={{
          background: 'rgba(26, 26, 46, 0.6)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ color: '#00d4ff', marginBottom: '20px' }}>Linked Exchange Trades</h2>
          
          {linkedTrades.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
                    <th style={{ padding: '12px', color: '#00d4ff', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '12px', color: '#00d4ff', textAlign: 'left' }}>Broker</th>
                    <th style={{ padding: '12px', color: '#00d4ff', textAlign: 'left' }}>Asset</th>
                    <th style={{ padding: '12px', color: '#00d4ff', textAlign: 'left' }}>Side</th>
                    <th style={{ padding: '12px', color: '#00d4ff', textAlign: 'left' }}>Quantity</th>
                    <th style={{ padding: '12px', color: '#00d4ff', textAlign: 'left' }}>Price</th>
                    <th style={{ padding: '12px', color: '#00d4ff', textAlign: 'left' }}>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedTrades.map((trade, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <td style={{ padding: '12px', color: '#ccc' }}>
                        {new Date(trade.Date).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', color: '#ccc' }}>{trade.Broker}</td>
                      <td style={{ padding: '12px', color: 'white', fontWeight: 'bold' }}>{trade.Asset}</td>
                      <td style={{ 
                        padding: '12px', 
                        color: trade.Side === 'Buy' ? '#32cd32' : '#ff6b6b',
                        fontWeight: 'bold'
                      }}>
                        {trade.Side}
                      </td>
                      <td style={{ padding: '12px', color: '#ccc' }}>{trade.Quantity.toLocaleString()}</td>
                      <td style={{ padding: '12px', color: '#ccc' }}>${trade.Price.toFixed(4)}</td>
                      <td style={{ 
                        padding: '12px', 
                        color: trade.PNL >= 0 ? '#32cd32' : '#ff6b6b',
                        fontWeight: 'bold'
                      }}>
                        {trade.PNL >= 0 ? '+' : ''}${trade.PNL.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#ccc' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
              <div>No matching trades found in exchange data</div>
              <div style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                Trades are matched by coin, time (±24h), and size (±10%)
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'edit' && (
        <TradeEntryForm
          onSubmit={(updatedEntry) => {
            onUpdate(updatedEntry);
            setActiveTab('overview');
          }}
          onCancel={() => setActiveTab('overview')}
          settings={settings}
          initialEntry={entry}
        />
      )}

      {/* Edit Exit Modal */}
      {editingExit !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(26, 26, 46, 0.95)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              color: '#00d4ff',
              marginBottom: '20px',
              fontSize: '1.5rem'
            }}>
              Edit Exit #{editingExit + 1}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                  Exit Price
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={editExitData.price}
                  onChange={(e) => setEditExitData({...editExitData, price: parseFloat(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                  Percentage Closed (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editExitData.percentage}
                  onChange={(e) => setEditExitData({...editExitData, percentage: parseFloat(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                Trading Fees ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editExitData.fees}
                onChange={(e) => setEditExitData({...editExitData, fees: parseFloat(e.target.value) || 0})}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={editExitData.useManualPnL}
                  onChange={(e) => setEditExitData({...editExitData, useManualPnL: e.target.checked})}
                  style={{ marginRight: '10px' }}
                />
                <label style={{ color: '#ccc', fontSize: '1rem' }}>
                  Use Manual P&L
                </label>
              </div>
              {editExitData.useManualPnL && (
                <input
                  type="number"
                  step="0.01"
                  value={editExitData.pnl}
                  onChange={(e) => setEditExitData({...editExitData, pnl: parseFloat(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter actual P&L"
                />
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                Notes
              </label>
              <textarea
                value={editExitData.notes}
                onChange={(e) => setEditExitData({...editExitData, notes: e.target.value})}
                placeholder="Exit reason, market conditions, etc..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* P&L Preview */}
            {editExitData.price > 0 && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ color: '#00d4ff', marginBottom: '10px', fontWeight: 'bold' }}>
                  P&L Preview
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Direction</div>
                    <div style={{ color: entry.direction === 'Long' ? '#32cd32' : '#ff6b6b', fontWeight: 'bold' }}>
                      {entry.direction}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Price Movement</div>
                    <div style={{ color: 'white', fontWeight: 'bold' }}>
                      ${entry.entry.toFixed(4)} → ${editExitData.price.toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                      {editExitData.useManualPnL ? 'Manual P&L' : 'Calculated P&L'}
                    </div>
                    <div style={{ 
                      color: editExitData.useManualPnL 
                        ? (editExitData.pnl >= 0 ? '#32cd32' : '#ff6b6b')
                        : ((entry.direction === 'Long' ? (editExitData.price - entry.entry) : (entry.entry - editExitData.price)) * (entry.size * editExitData.percentage / 100) >= 0 ? '#32cd32' : '#ff6b6b'),
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}>
                      {editExitData.useManualPnL 
                        ? `${editExitData.pnl >= 0 ? '+' : ''}$${editExitData.pnl.toFixed(2)}`
                        : `${((entry.direction === 'Long' ? (editExitData.price - entry.entry) : (entry.entry - editExitData.price)) * (entry.size * editExitData.percentage / 100)) >= 0 ? '+' : ''}$${((entry.direction === 'Long' ? (editExitData.price - entry.entry) : (entry.entry - editExitData.price)) * (entry.size * editExitData.percentage / 100)).toFixed(2)}`
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingExit(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ccc',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveExitEdit}
                disabled={editExitData.price <= 0}
                style={{
                  background: editExitData.price <= 0 
                    ? 'rgba(76, 206, 196, 0.3)' 
                    : 'linear-gradient(135deg, #4ecdc4 0%, #00d4ff 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: editExitData.price <= 0 ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  opacity: editExitData.price <= 0 ? 0.5 : 1
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeDetail;

