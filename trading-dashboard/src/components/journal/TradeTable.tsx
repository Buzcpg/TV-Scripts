import React, { useState } from 'react';
import { JournalEntry, ActualExit } from '../../types/journal';
import FeeCalculator from '../../utils/feeCalculator';

interface TradeTableProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (entry: JournalEntry) => void;
}

const TradeTable: React.FC<TradeTableProps> = ({ entries, onSelectEntry, onDeleteEntry, onUpdateEntry }) => {
  const [sortBy, setSortBy] = useState<keyof JournalEntry>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Open' | 'Closed' | 'Partially Closed'>('all');
  const [filterExchange, setFilterExchange] = useState<string>('all');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedTradeToClose, setSelectedTradeToClose] = useState<JournalEntry | null>(null);
  const [closePrice, setClosePrice] = useState<number>(0);
  const [closePercentage, setClosePercentage] = useState<number>(100);
  const [manualPnL, setManualPnL] = useState<number | null>(null);
  const [useManualPnL, setUseManualPnL] = useState<boolean>(false);
  const [fees, setFees] = useState<number>(0);
  const [exitNotes, setExitNotes] = useState<string>('');
  const [exitOrderType, setExitOrderType] = useState<'Market' | 'Limit'>('Market');

  const sortedAndFilteredEntries = entries
    .filter(entry => filterStatus === 'all' || entry.status === filterStatus)
    .filter(entry => filterExchange === 'all' || entry.exchange === filterExchange)
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  const handleSort = (column: keyof JournalEntry) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getUniqueExchanges = () => {
    return Array.from(new Set(entries.map(entry => entry.exchange)));
  };

  const calculateCurrentPnL = (entry: JournalEntry): number => {
    return entry.actualExits.reduce((sum, exit) => sum + exit.pnl, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '#ffa500';
      case 'Closed': return '#32cd32';
      case 'Partially Closed': return '#4ecdc4';
      default: return '#ccc';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'Long' ? '#32cd32' : '#ff6b6b';
  };

  const openCloseModal = (entry: JournalEntry) => {
    setSelectedTradeToClose(entry);
    setClosePrice(entry.entry); // Default to entry price
    setClosePercentage(calculateRemainingPosition(entry));
    setManualPnL(null);
    setUseManualPnL(false);
    setExitOrderType(entry.defaultExitOrderType || 'Market');
    
    // Calculate initial fees automatically
    const positionSize = (entry.size * calculateRemainingPosition(entry)) / 100;
    const exitFeeCalc = FeeCalculator.calculateExitFees(
      entry.exchange,
      entry.defaultExitOrderType || 'Market',
      positionSize,
      entry.entry
    );
    setFees(exitFeeCalc.fee);
    
    setExitNotes('');
    setShowCloseModal(true);
  };

  const calculateRemainingPosition = (entry: JournalEntry): number => {
    const exitedPercentage = entry.actualExits.reduce((sum, exit) => sum + exit.percentage, 0);
    return Math.max(0, 100 - exitedPercentage);
  };

  const calculatePnL = (entry: JournalEntry, exitPrice: number, percentage: number): number => {
    const positionSize = (entry.size * percentage) / 100;
    const priceDifference = entry.direction === 'Long' 
      ? exitPrice - entry.entry 
      : entry.entry - exitPrice;
    return priceDifference * positionSize;
  };

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

    return { isValid: true, warning: null, calculatedPnL };
  };

  const handleCloseTrade = async () => {
    if (!selectedTradeToClose) return;

    const calculatedPnL = calculatePnL(selectedTradeToClose, closePrice, closePercentage);
    const finalPnL = useManualPnL && manualPnL !== null ? manualPnL : calculatedPnL;
    
    // Validate P&L if using manual entry
    if (useManualPnL && manualPnL !== null) {
      const positionSize = (selectedTradeToClose.size * closePercentage) / 100;
      const validation = validatePnL(
        selectedTradeToClose.direction,
        selectedTradeToClose.entry,
        closePrice,
        manualPnL,
        positionSize
      );

      if (!validation.isValid) {
        const confirmed = window.confirm(
          `${validation.warning}\n\nCalculated P&L would be: $${validation.calculatedPnL.toFixed(2)}\nYour manual P&L: $${manualPnL.toFixed(2)}\n\nDo you want to proceed with the manual P&L?`
        );
        
        if (!confirmed) return;
      }
    }
    
    const netPnL = finalPnL - fees; // Subtract fees from P&L
    
    const newExit: ActualExit = {
      timestamp: new Date().toISOString(),
      price: closePrice,
      percentage: closePercentage,
      type: 'manual',
      pnl: netPnL,
      pnlSource: useManualPnL ? 'manual' : 'calculated',
      manualPnl: useManualPnL && manualPnL !== null ? manualPnL : undefined,
      fees: fees > 0 ? fees : undefined,
      orderType: exitOrderType,
      notes: exitNotes || undefined
    };

    const totalExited = selectedTradeToClose.actualExits.reduce((sum, exit) => sum + exit.percentage, 0) + closePercentage;
    const newStatus: 'Open' | 'Closed' | 'Partially Closed' = 
      totalExited >= 100 ? 'Closed' : 
      totalExited > 0 ? 'Partially Closed' : 'Open';

    const updatedEntry: JournalEntry = {
      ...selectedTradeToClose,
      actualExits: [...selectedTradeToClose.actualExits, newExit],
      status: newStatus
    };

    onUpdateEntry(updatedEntry);
    setShowCloseModal(false);
    setSelectedTradeToClose(null);
  };

  if (entries.length === 0) {
    return (
      <div style={{
        background: 'rgba(26, 26, 46, 0.6)',
        padding: '40px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📋</div>
        <h3 style={{ color: '#ccc', marginBottom: '10px' }}>No trades recorded yet</h3>
        <p style={{ color: '#999' }}>Start by adding your first trade entry to begin tracking your performance</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(26, 26, 46, 0.6)',
      borderRadius: '12px',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      overflow: 'hidden'
    }}>
      {/* Filters */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ color: '#ccc', marginRight: '10px', fontSize: '0.9rem' }}>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.9rem'
            }}
          >
            <option value="all">All</option>
            <option value="Open">Open</option>
            <option value="Partially Closed">Partially Closed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <label style={{ color: '#ccc', marginRight: '10px', fontSize: '0.9rem' }}>Exchange:</label>
          <select
            value={filterExchange}
            onChange={(e) => setFilterExchange(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.9rem'
            }}
          >
            <option value="all">All Exchanges</option>
            {getUniqueExchanges().map(exchange => (
              <option key={exchange} value={exchange}>{exchange}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto', color: '#ccc', fontSize: '0.9rem' }}>
          {sortedAndFilteredEntries.length} of {entries.length} trades
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
              {[
                { key: 'timestamp', label: 'Date', width: '120px' },
                { key: 'exchange', label: 'Exchange', width: '100px' },
                { key: 'coin', label: 'Coin', width: '100px' },
                { key: 'direction', label: 'Direction', width: '80px' },
                { key: 'size', label: 'Size', width: '100px' },
                { key: 'entry', label: 'Entry', width: '100px' },
                { key: 'stopLoss', label: 'Stop Loss', width: '100px' },
                { key: 'risk', label: 'Risk ($)', width: '100px' },
                { key: 'riskReward', label: 'R:R', width: '80px' },
                { key: 'status', label: 'Status', width: '120px' },
                { key: 'pnl', label: 'P&L ($)', width: '100px' },
                { key: 'actions', label: 'Actions', width: '120px' }
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => col.key !== 'actions' && col.key !== 'pnl' && handleSort(col.key as keyof JournalEntry)}
                  style={{
                    padding: '15px 10px',
                    color: '#00d4ff',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    cursor: col.key !== 'actions' && col.key !== 'pnl' ? 'pointer' : 'default',
                    width: col.width,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative'
                  }}
                >
                  {col.label}
                  {sortBy === col.key && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredEntries.map((entry) => {
              const currentPnL = calculateCurrentPnL(entry);
              const avgRiskReward = entry.riskReward.length > 0 ? 
                entry.riskReward.reduce((a, b) => a + b, 0) / entry.riskReward.length : 0;

              return (
                <tr
                  key={entry.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => onSelectEntry(entry)}
                >
                  <td style={{ padding: '12px 10px', color: '#ccc', fontSize: '0.85rem' }}>
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#ccc', fontSize: '0.85rem' }}>
                    {entry.exchange}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {entry.coin}
                  </td>
                  <td style={{ 
                    padding: '12px 10px', 
                    color: getDirectionColor(entry.direction), 
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    {entry.direction}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#ccc', fontSize: '0.85rem' }}>
                    {entry.size.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#ccc', fontSize: '0.85rem' }}>
                    ${entry.entry.toFixed(4)}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#ff6b6b', fontSize: '0.85rem' }}>
                    ${entry.stopLoss.toFixed(4)}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#ff6b6b', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    ${entry.risk.toFixed(2)}
                  </td>
                  <td style={{ 
                    padding: '12px 10px', 
                    color: avgRiskReward >= 1.5 ? '#32cd32' : '#ffa500', 
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    {avgRiskReward.toFixed(1)}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      color: getStatusColor(entry.status),
                      background: `${getStatusColor(entry.status)}20`,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {entry.status}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '12px 10px', 
                    color: currentPnL >= 0 ? '#32cd32' : '#ff6b6b', 
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    {currentPnL >= 0 ? '+' : ''}${currentPnL.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEntry(entry);
                        }}
                        style={{
                          background: 'rgba(0, 212, 255, 0.2)',
                          color: '#00d4ff',
                          border: '1px solid #00d4ff',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                        title="View Details"
                      >
                        👁️
                      </button>
                      {entry.status !== 'Closed' && calculateRemainingPosition(entry) > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCloseModal(entry);
                          }}
                          style={{
                            background: 'rgba(76, 206, 196, 0.2)',
                            color: '#4ecdc4',
                            border: '1px solid #4ecdc4',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                          title="Close Trade"
                        >
                          💰
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this trade?')) {
                            onDeleteEntry(entry.id);
                          }
                        }}
                        style={{
                          background: 'rgba(255, 107, 107, 0.2)',
                          color: '#ff6b6b',
                          border: '1px solid #ff6b6b',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                        title="Delete Trade"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Close Trade Modal */}
      {showCloseModal && selectedTradeToClose && (
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
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{
              color: '#00d4ff',
              marginBottom: '20px',
              fontSize: '1.5rem'
            }}>
              Close Trade: {selectedTradeToClose.coin} {selectedTradeToClose.direction}
            </h2>

            <div style={{ marginBottom: '20px', color: '#ccc' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Entry Price:</strong> ${selectedTradeToClose.entry.toFixed(4)}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Remaining Position:</strong> {calculateRemainingPosition(selectedTradeToClose)}%
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                Close Price
              </label>
              <input
                type="number"
                step="0.00001"
                value={closePrice}
                onChange={(e) => {
                  const newPrice = parseFloat(e.target.value) || 0;
                  setClosePrice(newPrice);
                  
                  // Recalculate fees when price changes
                  if (!useManualPnL && newPrice > 0) {
                    const positionSize = (selectedTradeToClose.size * closePercentage) / 100;
                    const exitFeeCalc = FeeCalculator.calculateExitFees(
                      selectedTradeToClose.exchange,
                      exitOrderType,
                      positionSize,
                      newPrice
                    );
                    setFees(exitFeeCalc.fee);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem'
                }}
                placeholder="Exit price"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                Percentage to Close (%)
              </label>
              <input
                type="number"
                min="1"
                max={calculateRemainingPosition(selectedTradeToClose)}
                value={closePercentage}
                onChange={(e) => {
                  const newPercentage = Math.min(calculateRemainingPosition(selectedTradeToClose), Math.max(1, parseFloat(e.target.value) || 0));
                  setClosePercentage(newPercentage);
                  
                  // Recalculate fees
                  if (!useManualPnL) {
                    const positionSize = (selectedTradeToClose.size * newPercentage) / 100;
                    const exitFeeCalc = FeeCalculator.calculateExitFees(
                      selectedTradeToClose.exchange,
                      exitOrderType,
                      positionSize,
                      closePrice
                    );
                    setFees(exitFeeCalc.fee);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem'
                }}
                placeholder="Percentage to close"
              />
            </div>

            {/* Exit Order Type */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                Exit Order Type
              </label>
              <select
                value={exitOrderType}
                onChange={(e) => {
                  const newOrderType = e.target.value as 'Market' | 'Limit';
                  setExitOrderType(newOrderType);
                  
                  // Recalculate fees
                  if (!useManualPnL) {
                    const positionSize = (selectedTradeToClose.size * closePercentage) / 100;
                    const exitFeeCalc = FeeCalculator.calculateExitFees(
                      selectedTradeToClose.exchange,
                      newOrderType,
                      positionSize,
                      closePrice
                    );
                    setFees(exitFeeCalc.fee);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                <option value="Market">Market Order</option>
                <option value="Limit">Limit Order</option>
              </select>
            </div>

            {/* Fees */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                Trading Fees ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={fees}
                onChange={(e) => setFees(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem'
                }}
                placeholder="0.00"
              />
            </div>

            {/* Manual P&L Override */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={useManualPnL}
                  onChange={(e) => setUseManualPnL(e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                <label style={{ color: '#ccc', fontSize: '1rem' }}>
                  Override with Manual P&L
                </label>
              </div>
              {useManualPnL && (
                <input
                  type="number"
                  step="0.01"
                  value={manualPnL || ''}
                  onChange={(e) => setManualPnL(parseFloat(e.target.value) || null)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter actual P&L from exchange"
                />
              )}
            </div>

            {/* Exit Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                Exit Notes
              </label>
              <textarea
                value={exitNotes}
                onChange={(e) => setExitNotes(e.target.value)}
                placeholder="Reason for exit, market conditions, etc..."
                rows={2}
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
            {closePrice > 0 && (
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
                    <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Price Difference</div>
                    <div style={{ 
                      color: selectedTradeToClose.direction === 'Long' 
                        ? (closePrice > selectedTradeToClose.entry ? '#32cd32' : '#ff6b6b')
                        : (closePrice < selectedTradeToClose.entry ? '#32cd32' : '#ff6b6b'),
                      fontWeight: 'bold'
                    }}>
                      ${Math.abs(closePrice - selectedTradeToClose.entry).toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                      {useManualPnL ? 'Manual P&L' : 'Calculated P&L'}
                    </div>
                    <div style={{ 
                      color: (useManualPnL ? (manualPnL || 0) : calculatePnL(selectedTradeToClose, closePrice, closePercentage)) >= 0 ? '#32cd32' : '#ff6b6b',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}>
                      {(useManualPnL ? (manualPnL || 0) : calculatePnL(selectedTradeToClose, closePrice, closePercentage)) >= 0 ? '+' : ''}
                      ${(useManualPnL ? (manualPnL || 0) : calculatePnL(selectedTradeToClose, closePrice, closePercentage)).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Net P&L (after fees)</div>
                    <div style={{ 
                      color: ((useManualPnL ? (manualPnL || 0) : calculatePnL(selectedTradeToClose, closePrice, closePercentage)) - fees) >= 0 ? '#32cd32' : '#ff6b6b',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}>
                      {((useManualPnL ? (manualPnL || 0) : calculatePnL(selectedTradeToClose, closePrice, closePercentage)) - fees) >= 0 ? '+' : ''}
                      ${((useManualPnL ? (manualPnL || 0) : calculatePnL(selectedTradeToClose, closePrice, closePercentage)) - fees).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {useManualPnL && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    background: 'rgba(255, 255, 0, 0.1)', 
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 0, 0.3)'
                  }}>
                    <div style={{ color: '#ffff00', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      📝 Manual P&L Override Active
                    </div>
                    <div style={{ color: '#ccc', fontSize: '0.8rem', marginTop: '5px' }}>
                      Using manual P&L instead of calculated. This will be marked for verification against exchange data.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setSelectedTradeToClose(null);
                }}
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
                onClick={handleCloseTrade}
                disabled={closePrice <= 0}
                style={{
                  background: closePrice <= 0 
                    ? 'rgba(76, 206, 196, 0.3)' 
                    : 'linear-gradient(135deg, #4ecdc4 0%, #00d4ff 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: closePrice <= 0 ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  opacity: closePrice <= 0 ? 0.5 : 1
                }}
              >
                Close Trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeTable;

