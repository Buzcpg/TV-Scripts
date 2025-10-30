import React, { useState, useEffect } from 'react';
import { JournalEntry, JournalSettings, TakeProfit, TradeCalculations } from '../../types/journal';
import FeeCalculator from '../../utils/feeCalculator';

interface TradeEntryFormProps {
  onSubmit: (entry: JournalEntry) => void;
  onCancel: () => void;
  settings: JournalSettings;
  initialEntry?: JournalEntry;
}

const TradeEntryForm: React.FC<TradeEntryFormProps> = ({
  onSubmit,
  onCancel,
  settings,
  initialEntry
}) => {
  const [formData, setFormData] = useState({
    exchange: initialEntry?.exchange || settings.defaultExchanges[0] || '',
    coin: initialEntry?.coin || '',
    size: initialEntry?.size || 0,
    direction: initialEntry?.direction || 'Long' as 'Long' | 'Short',
    entry: initialEntry?.entry || 0,
    stopLoss: initialEntry?.stopLoss || 0,
    entryOrderType: initialEntry?.entryOrderType || 'Market' as 'Market' | 'Limit',
    defaultExitOrderType: initialEntry?.defaultExitOrderType || 'Market' as 'Market' | 'Limit',
    notes: initialEntry?.notes || ''
  });

  const [takeProfits, setTakeProfits] = useState<TakeProfit[]>(
    initialEntry?.takeProfits || [{ level: 1, price: 0, percentage: 50 }]
  );

  const [calculations, setCalculations] = useState<TradeCalculations & {
    estimatedFees: number;
    feeBreakdown: { entryFee: number; exitFee: number; };
  }>({
    positionSize: 0,
    riskAmount: 0,
    riskPercentage: 0,
    riskRewardRatios: [],
    potentialPnL: [],
    stopLossDistance: 0,
    takeProfitDistances: [],
    estimatedFees: 0,
    feeBreakdown: { entryFee: 0, exitFee: 0 }
  });

  const calculateMetrics = React.useCallback(() => {
    const { entry, stopLoss, size, direction, exchange, entryOrderType, defaultExitOrderType } = formData;
    
    if (!entry || !stopLoss || !size || !exchange) {
      setCalculations({
        positionSize: 0,
        riskAmount: 0,
        riskPercentage: 0,
        riskRewardRatios: [],
        potentialPnL: [],
        stopLossDistance: 0,
        takeProfitDistances: [],
        estimatedFees: 0,
        feeBreakdown: { entryFee: 0, exitFee: 0 }
      });
      return;
    }

    const stopLossDistance = Math.abs(entry - stopLoss);
    
    // Calculate fees
    const feeCalc = FeeCalculator.calculateTradeFees(
      exchange,
      entryOrderType,
      defaultExitOrderType,
      size,
      entry,
      stopLoss // Use stop loss as approximate exit price for fee calculation
    );

    const riskAmount = (stopLossDistance * size) + feeCalc.totalFees; // Include fees in risk
    const riskPercentage = (riskAmount / settings.accountSize) * 100;

    const riskRewardRatios: number[] = [];
    const potentialPnL: number[] = [];
    const takeProfitDistances: number[] = [];

    takeProfits.forEach(tp => {
      if (tp.price > 0) {
        const tpDistance = Math.abs(tp.price - entry);
        const ratio = tpDistance / stopLossDistance;
        
        // Calculate P&L including fees for this take profit
        const tpFeeCalc = FeeCalculator.calculateTradeFees(
          exchange,
          entryOrderType,
          defaultExitOrderType,
          size * (tp.percentage || 100) / 100,
          entry,
          tp.price
        );
        
        const grossPnL = tpDistance * size * (tp.percentage || 100) / 100;
        const netPnL = (direction === 'Long' && tp.price > entry) || (direction === 'Short' && tp.price < entry) 
          ? grossPnL - tpFeeCalc.totalFees
          : -(grossPnL + tpFeeCalc.totalFees);
        
        riskRewardRatios.push(ratio);
        potentialPnL.push(netPnL);
        takeProfitDistances.push(tpDistance);
      }
    });

    setCalculations({
      positionSize: size,
      riskAmount,
      riskPercentage,
      riskRewardRatios,
      potentialPnL,
      stopLossDistance,
      takeProfitDistances,
      estimatedFees: feeCalc.totalFees,
      feeBreakdown: {
        entryFee: feeCalc.entryFee,
        exitFee: feeCalc.exitFee
      }
    });
  }, [formData, takeProfits, settings.accountSize]);

  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics]);


  const handleTakeProfitChange = (index: number, field: keyof TakeProfit, value: number) => {
    const newTakeProfits = [...takeProfits];
    newTakeProfits[index] = { ...newTakeProfits[index], [field]: value };
    setTakeProfits(newTakeProfits);
  };

  const addTakeProfit = () => {
    if (takeProfits.length < 4) {
      setTakeProfits([...takeProfits, { 
        level: takeProfits.length + 1, 
        price: 0, 
        percentage: 25 
      }]);
    }
  };

  const removeTakeProfit = (index: number) => {
    if (takeProfits.length > 1) {
      setTakeProfits(takeProfits.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: JournalEntry = {
      id: initialEntry?.id || `trade_${Date.now()}`,
      exchange: formData.exchange,
      coin: formData.coin,
      size: formData.size,
      direction: formData.direction,
      entry: formData.entry,
      stopLoss: formData.stopLoss,
      takeProfits: takeProfits.filter(tp => tp.price > 0),
      timestamp: initialEntry?.timestamp || new Date().toISOString(),
      status: initialEntry?.status || 'Open',
      entryOrderType: formData.entryOrderType,
      defaultExitOrderType: formData.defaultExitOrderType,
      risk: calculations.riskAmount,
      riskReward: calculations.riskRewardRatios,
      estimatedFees: calculations.estimatedFees,
      followUps: initialEntry?.followUps || [],
      actualExits: initialEntry?.actualExits || [],
      images: initialEntry?.images || [],
      notes: formData.notes,
      linkedTrades: initialEntry?.linkedTrades || []
    };

    onSubmit(entry);
  };

  const isValidDirection = (price: number, entry: number, direction: 'Long' | 'Short'): boolean => {
    return direction === 'Long' ? price > entry : price < entry;
  };

  return (
    <div style={{
      background: 'rgba(26, 26, 46, 0.6)',
      padding: '30px',
      borderRadius: '12px',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      marginBottom: '20px'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #00d4ff 0%, #b366f5 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        {initialEntry ? 'Edit Trade Entry' : 'New Trade Entry'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Exchange */}
          <div>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
              Exchange
            </label>
            <select
              value={formData.exchange}
              onChange={(e) => setFormData({...formData, exchange: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
              required
            >
              <option value="">Select Exchange</option>
              {settings.defaultExchanges.map(exchange => (
                <option key={exchange} value={exchange}>{exchange}</option>
              ))}
            </select>
          </div>

          {/* Coin */}
          <div>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
              Coin/Symbol
            </label>
            <input
              type="text"
              value={formData.coin}
              onChange={(e) => setFormData({...formData, coin: e.target.value.toUpperCase()})}
              placeholder="e.g., BTCUSDT"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          {/* Direction */}
          <div>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
              Direction
            </label>
            <select
              value={formData.direction}
              onChange={(e) => setFormData({...formData, direction: e.target.value as 'Long' | 'Short'})}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
              required
            >
              <option value="Long">Long</option>
              <option value="Short">Short</option>
            </select>
          </div>

          {/* Size */}
          <div>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
              Position Size
            </label>
            <input
              type="number"
              step="0.00001"
              value={formData.size}
              onChange={(e) => setFormData({...formData, size: parseFloat(e.target.value) || 0})}
              placeholder="Position size"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          {/* Entry Price */}
          <div>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
              Entry Price
            </label>
            <input
              type="number"
              step="0.00001"
              value={formData.entry}
              onChange={(e) => setFormData({...formData, entry: parseFloat(e.target.value) || 0})}
              placeholder="Entry price"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          {/* Stop Loss */}
          <div>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
              Stop Loss
            </label>
            <input
              type="number"
              step="0.00001"
              value={formData.stopLoss}
              onChange={(e) => setFormData({...formData, stopLoss: parseFloat(e.target.value) || 0})}
              placeholder="Stop loss price"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
              required
            />
          </div>
        </div>

        {/* Order Types Section */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#00d4ff', marginBottom: '15px', fontSize: '1.1rem' }}>
            Order Types & Fees
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Entry Order Type */}
            <div>
              <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                Entry Order Type
              </label>
              <select
                value={formData.entryOrderType}
                onChange={(e) => setFormData({...formData, entryOrderType: e.target.value as 'Market' | 'Limit'})}
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

            {/* Default Exit Order Type */}
            <div>
              <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                Default Exit Order Type
              </label>
              <select
                value={formData.defaultExitOrderType}
                onChange={(e) => setFormData({...formData, defaultExitOrderType: e.target.value as 'Market' | 'Limit'})}
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
          </div>
        </div>

        {/* Take Profit Levels */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <label style={{ color: '#ccc', fontSize: '1.1rem' }}>
              Take Profit Levels
            </label>
            {takeProfits.length < 4 && (
              <button
                type="button"
                onClick={addTakeProfit}
                style={{
                  background: 'rgba(0, 212, 255, 0.2)',
                  color: '#00d4ff',
                  border: '1px solid #00d4ff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                + Add TP
              </button>
            )}
          </div>

          {takeProfits.map((tp, index) => (
            <div key={index} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: '15px',
              marginBottom: '15px',
              padding: '15px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                  TP{index + 1} Price
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={tp.price}
                  onChange={(e) => handleTakeProfitChange(index, 'price', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: `1px solid ${!isValidDirection(tp.price, formData.entry, formData.direction) && tp.price > 0 ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                  % of Position
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tp.percentage || 100}
                  onChange={(e) => handleTakeProfitChange(index, 'percentage', parseFloat(e.target.value) || 100)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                  R:R Ratio
                </label>
                <div style={{
                  padding: '10px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                  color: calculations.riskRewardRatios[index] >= 1.5 ? '#32cd32' : '#ffa500',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {calculations.riskRewardRatios[index] ? calculations.riskRewardRatios[index].toFixed(2) : '0.00'}
                </div>
              </div>

              {takeProfits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTakeProfit(index)}
                  style={{
                    background: 'rgba(255, 107, 107, 0.2)',
                    color: '#ff6b6b',
                    border: '1px solid #ff6b6b',
                    padding: '10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Risk Calculations Display */}
        {calculations.riskAmount > 0 && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ color: '#00d4ff', marginBottom: '15px', fontSize: '1.1rem' }}>
              Risk Analysis (Including Fees)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div>
                <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Total Risk</div>
                <div style={{ color: '#ff6b6b', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  ${calculations.riskAmount.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Risk %</div>
                <div style={{ 
                  color: calculations.riskPercentage > 5 ? '#ff6b6b' : calculations.riskPercentage > 2 ? '#ffa500' : '#32cd32',
                  fontSize: '1.1rem', 
                  fontWeight: 'bold' 
                }}>
                  {calculations.riskPercentage.toFixed(2)}%
                </div>
              </div>
              <div>
                <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Trading Fees</div>
                <div style={{ color: '#8f20ff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  ${calculations.estimatedFees.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Avg R:R</div>
                <div style={{ 
                  color: calculations.riskRewardRatios.length > 0 && 
                        calculations.riskRewardRatios.reduce((a, b) => a + b, 0) / calculations.riskRewardRatios.length >= 1.5 
                        ? '#32cd32' : '#ffa500',
                  fontSize: '1.1rem', 
                  fontWeight: 'bold' 
                }}>
                  {calculations.riskRewardRatios.length > 0 ? 
                    (calculations.riskRewardRatios.reduce((a, b) => a + b, 0) / calculations.riskRewardRatios.length).toFixed(2) : 
                    '0.00'
                  }
                </div>
              </div>
              <div>
                <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Net P&L Potential</div>
                <div style={{ color: '#4ecdc4', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  ${calculations.potentialPnL.reduce((a, b) => a + b, 0).toFixed(2)}
                </div>
              </div>
            </div>
            
            {/* Fee Breakdown */}
            {formData.exchange && calculations.estimatedFees > 0 && (
              <div style={{ 
                marginTop: '15px', 
                padding: '15px', 
                background: 'rgba(143, 32, 255, 0.1)', 
                borderRadius: '8px',
                border: '1px solid rgba(143, 32, 255, 0.2)'
              }}>
                <div style={{ color: '#8f20ff', fontWeight: 'bold', marginBottom: '10px', fontSize: '0.9rem' }}>
                  📊 {formData.exchange} Fee Breakdown
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: '#ccc' }}>Entry ({formData.entryOrderType})</div>
                    <div style={{ color: '#8f20ff', fontWeight: 'bold' }}>
                      ${calculations.feeBreakdown.entryFee.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#ccc' }}>Exit ({formData.defaultExitOrderType})</div>
                    <div style={{ color: '#8f20ff', fontWeight: 'bold' }}>
                      ${calculations.feeBreakdown.exitFee.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#ccc' }}>Total Fees</div>
                    <div style={{ color: '#8f20ff', fontWeight: 'bold' }}>
                      ${calculations.estimatedFees.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
            Notes & Analysis
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Add your trade setup analysis, market conditions, reasoning..."
            rows={4}
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

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
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
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #b366f5 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {initialEntry ? 'Update Trade' : 'Add Trade'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeEntryForm;

