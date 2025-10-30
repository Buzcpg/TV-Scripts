import React, { useState } from 'react';
import { FollowUp, ActualExit, JournalEntry } from '../../types/journal';

interface FollowUpFormProps {
  onSubmit: (followUp: FollowUp) => void;
  onCancel: () => void;
  entry: JournalEntry;
  onAddExit?: (exit: ActualExit) => void;
}

const FollowUpForm: React.FC<FollowUpFormProps> = ({
  onSubmit,
  onCancel,
  entry,
  onAddExit
}) => {
  const [formData, setFormData] = useState({
    type: 'note' as FollowUp['type'],
    description: '',
    reasoning: '',
    newStopLoss: 0,
    exitPrice: 0,
    exitPercentage: 25,
    images: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const followUp: FollowUp = {
      id: `followup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: formData.type,
      description: formData.description,
      reasoning: formData.reasoning,
      ...(formData.newStopLoss > 0 && { newStopLoss: formData.newStopLoss }),
      ...(formData.exitPrice > 0 && { 
        exitPrice: formData.exitPrice,
        exitPercentage: formData.exitPercentage 
      }),
      ...(formData.images.length > 0 && { images: formData.images })
    };

    // If this is an exit, also create an ActualExit
    if ((formData.type === 'partial_exit' || formData.type === 'full_exit') && formData.exitPrice > 0 && onAddExit) {
      const exitPercentage = formData.type === 'full_exit' ? 100 : formData.exitPercentage;
      const actualSize = (entry.size * exitPercentage) / 100;
      
      // Calculate P&L
      let pnl = 0;
      if (entry.direction === 'Long') {
        pnl = (formData.exitPrice - entry.entry) * actualSize;
      } else {
        pnl = (entry.entry - formData.exitPrice) * actualSize;
      }

      const actualExit: ActualExit = {
        timestamp: new Date().toISOString(),
        price: formData.exitPrice,
        percentage: exitPercentage,
        type: formData.type === 'full_exit' ? 'manual' : 'take_profit',
        pnl,
        pnlSource: 'calculated'
      };

      onAddExit(actualExit);
    }

    onSubmit(followUp);
  };

  const getFormFields = () => {
    switch (formData.type) {
      case 'stop_move':
        return (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                New Stop Loss Price
              </label>
              <input
                type="number"
                step="0.00001"
                value={formData.newStopLoss}
                onChange={(e) => setFormData({...formData, newStopLoss: parseFloat(e.target.value) || 0})}
                placeholder="New stop loss price"
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
        );

      case 'partial_exit':
      case 'full_exit':
        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                  Exit Price
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.exitPrice}
                  onChange={(e) => setFormData({...formData, exitPrice: parseFloat(e.target.value) || 0})}
                  placeholder="Exit price"
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

              {formData.type === 'partial_exit' && (
                <div>
                  <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                    Exit Percentage
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.exitPercentage}
                    onChange={(e) => setFormData({...formData, exitPercentage: parseFloat(e.target.value) || 25})}
                    placeholder="Percentage to exit"
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
              )}
            </div>

            {/* P&L Preview */}
            {formData.exitPrice > 0 && (
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
                {(() => {
                  const exitPercentage = formData.type === 'full_exit' ? 100 : formData.exitPercentage;
                  const actualSize = (entry.size * exitPercentage) / 100;
                  let pnl = 0;
                  
                  if (entry.direction === 'Long') {
                    pnl = (formData.exitPrice - entry.entry) * actualSize;
                  } else {
                    pnl = (entry.entry - formData.exitPrice) * actualSize;
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                      <div>
                        <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Size</div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>
                          {actualSize.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Price Diff</div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>
                          ${Math.abs(formData.exitPrice - entry.entry).toFixed(4)}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#ccc', fontSize: '0.9rem' }}>P&L</div>
                        <div style={{ 
                          color: pnl >= 0 ? '#32cd32' : '#ff6b6b', 
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}>
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );

      case 'add_position':
        return (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                Additional Position Size
              </label>
              <input
                type="number"
                step="0.00001"
                placeholder="Additional size"
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
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      background: 'rgba(26, 26, 46, 0.6)',
      padding: '25px',
      borderRadius: '12px',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      marginBottom: '20px'
    }}>
      <h3 style={{
        fontSize: '1.3rem',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #00d4ff 0%, #b366f5 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Add Trade Follow-up
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Follow-up Type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
            Follow-up Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value as FollowUp['type']})}
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
            <option value="note">📝 General Note</option>
            <option value="stop_move">🛡️ Move Stop Loss</option>
            <option value="partial_exit">💰 Partial Exit</option>
            <option value="full_exit">🎯 Full Exit</option>
            <option value="add_position">➕ Add to Position</option>
          </select>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Brief description of what happened"
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

        {/* Type-specific fields */}
        {getFormFields()}

        {/* Reasoning */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
            Reasoning & Analysis
          </label>
          <textarea
            value={formData.reasoning}
            onChange={(e) => setFormData({...formData, reasoning: e.target.value})}
            placeholder="Why did you make this decision? What market conditions led to this action?"
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
            required
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
            Add Follow-up
          </button>
        </div>
      </form>
    </div>
  );
};

export default FollowUpForm;

