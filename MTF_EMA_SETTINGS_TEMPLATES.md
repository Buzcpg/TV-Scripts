# MTF EMA Strategy - Settings Templates

Quick copy-paste templates for different trading styles and risk profiles.

---

## 📋 Template Index

1. [Crypto Scalping (1m/5m)](#crypto-scalping-1m5m)
2. [Crypto Day Trading (5m/15m)](#crypto-day-trading-5m15m)
3. [Conservative Trend Following](#conservative-trend-following)
4. [Aggressive Compounding](#aggressive-compounding)
5. [Safe Position Building](#safe-position-building)
6. [Maximum Compounding](#maximum-compounding)
7. [Beginner Safe Mode](#beginner-safe-mode)
8. [Professional Setup](#professional-setup)

---

## Crypto Scalping (1m/5m)

### Profile
- **Style**: Fast scalping
- **Timeframes**: 1-minute chart, 5-minute trend
- **Position Hold**: Minutes to hours
- **Risk Level**: Moderate

### Settings
```
═══ Timeframe Settings ═══
LTF Period: 1
HTF Period: 5

═══ EMA Settings ═══
EMA Fast: 50
EMA Slow: 200

═══ Stop Loss Settings ═══
Pivot Left Bars: 5
Pivot Right Bars: 2

═══ Risk & Position Management ═══
Account Size: $100,000
Leverage: 5.0x
Base Risk %: 0.5
Max Risk %: 1.0
Use Dollar Risk: ✓
Base Risk $: 500
Max Risk $: 1,000

═══ Profit Taking ═══
Main Target (RR): 5.0
Partial Target (RR): 2.0
Partial Size %: 50
Move to Breakeven: ✓

═══ Position Building & Compounding ═══
Enable Position Building: ✓
Max Concurrent Positions: 3
Require Deeper Retest: ✓
Wins Before Scale-Up: 3

═══ Loss Management ═══
Pause After Losses: 2
Resume on Successful Trade: ✓

═══ Strategy Settings ═══
Trade Direction: Both
Require All EMAs Aligned: ✓
Min EMA Spacing %: 0.05

═══ Fee Settings ═══
Fee Platform: Breakout (or your platform)
Entry Type: Market
```

**Expected Results:**
- 3-5 trades per session
- Quick in and out
- Small stops, frequent trades
- Win rate: 50-60%

---

## Crypto Day Trading (5m/15m)

### Profile
- **Style**: Intraday swing trading
- **Timeframes**: 5-minute chart, 15-minute trend
- **Position Hold**: Hours to 1 day
- **Risk Level**: Moderate

### Settings
```
═══ Timeframe Settings ═══
LTF Period: 5
HTF Period: 15

═══ EMA Settings ═══
EMA Fast: 50
EMA Slow: 200

═══ Stop Loss Settings ═══
Pivot Left Bars: 5
Pivot Right Bars: 2

═══ Risk & Position Management ═══
Account Size: $100,000
Leverage: 10.0x
Base Risk %: 1.0
Max Risk %: 2.0
Use Dollar Risk: ✓
Base Risk $: 1,000
Max Risk $: 2,000

═══ Profit Taking ═══
Main Target (RR): 5.0
Partial Target (RR): 2.0
Partial Size %: 50
Move to Breakeven: ✓

═══ Position Building & Compounding ═══
Enable Position Building: ✓
Max Concurrent Positions: 3
Require Deeper Retest: ✓
Wins Before Scale-Up: 3

═══ Loss Management ═══
Pause After Losses: 2
Resume on Successful Trade: ✓

═══ Strategy Settings ═══
Trade Direction: Both
Require All EMAs Aligned: ✓
Min EMA Spacing %: 0.10

═══ Fee Settings ═══
Fee Platform: Breakout
Entry Type: Market
```

**Expected Results:**
- 2-4 trades per day
- Better RR ratios
- Moderate stop sizes
- Win rate: 55-65%

---

## Conservative Trend Following

### Profile
- **Style**: Low-risk, high-confidence trades only
- **Focus**: Capital preservation
- **Risk Level**: Low

### Settings
```
═══ Timeframe Settings ═══
LTF Period: 5
HTF Period: 15

═══ EMA Settings ═══
EMA Fast: 50
EMA Slow: 200

═══ Stop Loss Settings ═══
Pivot Left Bars: 7
Pivot Right Bars: 3

═══ Risk & Position Management ═══
Account Size: $100,000
Leverage: 3.0x
Base Risk %: 0.5
Max Risk %: 1.0
Use Dollar Risk: ✓
Base Risk $: 500
Max Risk $: 1,000

═══ Profit Taking ═══
Main Target (RR): 6.0
Partial Target (RR): 2.5
Partial Size %: 50
Move to Breakeven: ✓

═══ Position Building & Compounding ═══
Enable Position Building: ✓
Max Concurrent Positions: 2
Require Deeper Retest: ✓
Wins Before Scale-Up: 5

═══ Loss Management ═══
Pause After Losses: 1
Resume on Successful Trade: ✓

═══ Strategy Settings ═══
Trade Direction: Both
Require All EMAs Aligned: ✓
Min EMA Spacing %: 0.15

═══ Fee Settings ═══
Fee Platform: Breakout
Entry Type: Limit (when possible)
```

**Expected Results:**
- Fewer trades, higher quality
- Larger RR ratios
- Very selective entries
- Win rate: 60-70%

---

## Aggressive Compounding

### Profile
- **Style**: Maximum profit extraction
- **Focus**: Compounding winners
- **Risk Level**: High

### Settings
```
═══ Timeframe Settings ═══
LTF Period: 1
HTF Period: 5

═══ EMA Settings ═══
EMA Fast: 50
EMA Slow: 200

═══ Stop Loss Settings ═══
Pivot Left Bars: 5
Pivot Right Bars: 2

═══ Risk & Position Management ═══
Account Size: $100,000
Leverage: 20.0x
Base Risk %: 2.0
Max Risk %: 4.0
Use Dollar Risk: ✓
Base Risk $: 2,000
Max Risk $: 4,000

═══ Profit Taking ═══
Main Target (RR): 5.0
Partial Target (RR): 2.0
Partial Size %: 40
Move to Breakeven: ✓

═══ Position Building & Compounding ═══
Enable Position Building: ✓
Max Concurrent Positions: 5
Require Deeper Retest: ✗
Wins Before Scale-Up: 2

═══ Loss Management ═══
Pause After Losses: 3
Resume on Successful Trade: ✓

═══ Strategy Settings ═══
Trade Direction: Both
Require All EMAs Aligned: ✓
Min EMA Spacing %: 0.05

═══ Fee Settings ═══
Fee Platform: Breakout
Entry Type: Market
```

**Expected Results:**
- Maximum position building
- Fast compounding
- Higher drawdowns
- Win rate: 45-55%
- **⚠️ Only for experienced traders**

---

## Safe Position Building

### Profile
- **Style**: Gradual position accumulation
- **Focus**: Risk-free compounding
- **Risk Level**: Low-Moderate

### Settings
```
═══ Timeframe Settings ═══
LTF Period: 5
HTF Period: 15

═══ EMA Settings ═══
EMA Fast: 50
EMA Slow: 200

═══ Stop Loss Settings ═══
Pivot Left Bars: 5
Pivot Right Bars: 2

═══ Risk & Position Management ═══
Account Size: $100,000
Leverage: 5.0x
Base Risk %: 1.0
Max Risk %: 1.5
Use Dollar Risk: ✓
Base Risk $: 1,000
Max Risk $: 1,500

═══ Profit Taking ═══
Main Target (RR): 5.0
Partial Target (RR): 2.0
Partial Size %: 60
Move to Breakeven: ✓

═══ Position Building & Compounding ═══
Enable Position Building: ✓
Max Concurrent Positions: 3
Require Deeper Retest: ✓ (IMPORTANT)
Wins Before Scale-Up: 4

═══ Loss Management ═══
Pause After Losses: 2
Resume on Successful Trade: ✓

═══ Strategy Settings ═══
Trade Direction: Both
Require All EMAs Aligned: ✓
Min EMA Spacing %: 0.10

═══ Fee Settings ═══
Fee Platform: Breakout
Entry Type: Limit
```

**Expected Results:**
- Conservative pyramiding
- High-quality add-ons only
- Good risk/reward balance
- Win rate: 55-65%

---

## Maximum Compounding

### Profile
- **Style**: Profit-driven scaling
- **Focus**: Scaling winners aggressively
- **Risk Level**: Very High

### Settings
```
═══ Timeframe Settings ═══
LTF Period: 1
HTF Period: 5

═══ EMA Settings ═══
EMA Fast: 50
EMA Slow: 200

═══ Stop Loss Settings ═══
Pivot Left Bars: 5
Pivot Right Bars: 2

═══ Risk & Position Management ═══
Account Size: $100,000
Leverage: 15.0x
Base Risk %: 2.0
Max Risk %: 5.0
Use Dollar Risk: ✓
Base Risk $: 2,000
Max Risk $: 5,000

═══ Profit Taking ═══
Main Target (RR): 5.0
Partial Target (RR): 2.0
Partial Size %: 30
Move to Breakeven: ✓

═══ Position Building & Compounding ═══
Enable Position Building: ✓
Max Concurrent Positions: 6
Require Deeper Retest: ✗
Wins Before Scale-Up: 2

═══ Loss Management ═══
Pause After Losses: 3
Resume on Successful Trade: ✓

═══ Strategy Settings ═══
Trade Direction: Both
Require All EMAs Aligned: ✓
Min EMA Spacing %: 0.05

═══ Fee Settings ═══
Fee Platform: HyperLiquid (lowest fees)
Entry Type: Limit
```

**Expected Results:**
- Massive winners possible
- Significant drawdowns
- Requires strong trends
- Win rate: 40-50%
- **⚠️ Expert traders only**

---

## Beginner Safe Mode

### Profile
- **Style**: Learning with minimal risk
- **Focus**: Understanding the system
- **Risk Level**: Very Low

### Settings
```
═══ Timeframe Settings ═══
LTF Period: 5
HTF Period: 15

═══ EMA Settings ═══
EMA Fast: 50
EMA Slow: 200

═══ Stop Loss Settings ═══
Pivot Left Bars: 7
Pivot Right Bars: 3

═══ Risk & Position Management ═══
Account Size: $10,000 (small account)
Leverage: 2.0x
Base Risk %: 0.5
Max Risk %: 1.0
Use Dollar Risk: ✓
Base Risk $: 50
Max Risk $: 100

═══ Profit Taking ═══
Main Target (RR): 5.0
Partial Target (RR): 2.5
Partial Size %: 60
Move to Breakeven: ✓

═══ Position Building & Compounding ═══
Enable Position Building: ✗ (Disabled for learning)
Max Concurrent Positions: 1
Require Deeper Retest: ✓
Wins Before Scale-Up: 10

═══ Loss Management ═══
Pause After Losses: 1
Resume on Successful Trade: ✓

═══ Strategy Settings ═══
Trade Direction: Both
Require All EMAs Aligned: ✓
Min EMA Spacing %: 0.20

═══ Fee Settings ═══
Fee Platform: Breakout
Entry Type: Limit
```

**Expected Results:**
- Very few trades
- Focus on quality
- Learn the patterns
- Win rate: 65-75%
- **Perfect for learning**

---

## Professional Setup

### Profile
- **Style**: Balanced professional trading
- **Focus**: Consistent profitability
- **Risk Level**: Moderate

### Settings
```
═══ Timeframe Settings ═══
LTF Period: 5
HTF Period: 15

═══ EMA Settings ═══
EMA Fast: 50
EMA Slow: 200

═══ Stop Loss Settings ═══
Pivot Left Bars: 5
Pivot Right Bars: 2

═══ Risk & Position Management ═══
Account Size: $100,000
Leverage: 10.0x
Base Risk %: 1.0
Max Risk %: 2.0
Use Dollar Risk: ✓
Base Risk $: 1,000
Max Risk $: 2,000

═══ Profit Taking ═══
Main Target (RR): 5.0
Partial Target (RR): 2.0
Partial Size %: 50
Move to Breakeven: ✓

═══ Position Building & Compounding ═══
Enable Position Building: ✓
Max Concurrent Positions: 3
Require Deeper Retest: ✓
Wins Before Scale-Up: 3

═══ Loss Management ═══
Pause After Losses: 2
Resume on Successful Trade: ✓

═══ Strategy Settings ═══
Trade Direction: Both
Require All EMAs Aligned: ✓
Min EMA Spacing %: 0.08

═══ Fee Settings ═══
Fee Platform: HyperLiquid
Entry Type: Limit (when possible)
```

**Expected Results:**
- Consistent daily/weekly profits
- Balanced risk/reward
- Professional-grade setup
- Win rate: 55-65%
- **Recommended for most traders**

---

## 🎯 Comparison Table

| Template | Risk Level | Leverage | Max Positions | Best For |
|----------|-----------|----------|---------------|----------|
| Crypto Scalping | ⭐⭐⭐ | 5x | 3 | Fast markets |
| Crypto Day Trading | ⭐⭐⭐ | 10x | 3 | Intraday trends |
| Conservative | ⭐⭐ | 3x | 2 | Safety first |
| Aggressive | ⭐⭐⭐⭐⭐ | 20x | 5 | Experts only |
| Safe Building | ⭐⭐ | 5x | 3 | Learning pyramiding |
| Max Compounding | ⭐⭐⭐⭐⭐ | 15x | 6 | High risk/reward |
| Beginner | ⭐ | 2x | 1 | First-timers |
| Professional | ⭐⭐⭐ | 10x | 3 | Full-time traders |

---

## 📝 Custom Template Worksheet

Create your own custom settings:

```
═══ MY CUSTOM SETUP ═══

Trading Style: _________________
Account Size: $_________________
Risk Tolerance: Low / Medium / High
Experience Level: Beginner / Intermediate / Advanced

═══ Timeframe Settings ═══
LTF Period: ____
HTF Period: ____

═══ Risk & Position Management ═══
Leverage: ____x
Base Risk $: $____
Max Risk $: $____
Max Positions: ____

═══ Position Building ═══
Enable Building: Yes / No
Require Deeper Retest: Yes / No
Wins Before Scale-Up: ____

═══ Loss Management ═══
Pause After Losses: ____

═══ Strategy Filters ═══
Min EMA Spacing %: ____
```

---

## 💡 Template Selection Guide

### Choose Based On:

**Account Size:**
- Small ($1k-$10k): Beginner Safe Mode
- Medium ($10k-$50k): Conservative or Safe Building
- Large ($50k+): Professional or Day Trading

**Experience:**
- New to Strategy: Beginner Safe Mode
- Some Experience: Conservative or Day Trading
- Experienced Trader: Professional
- Expert: Aggressive or Max Compounding

**Risk Tolerance:**
- Conservative: Conservative Trend Following
- Moderate: Professional Setup
- Aggressive: Aggressive Compounding

**Trading Style:**
- Scalper: Crypto Scalping (1m/5m)
- Day Trader: Crypto Day Trading (5m/15m)
- Swing Trader: Conservative (15m/1h)

**Goals:**
- Learn System: Beginner Safe Mode
- Steady Income: Professional Setup
- Maximum Growth: Max Compounding
- Capital Preservation: Conservative

---

## 🔧 Customization Tips

### Adjusting for Volatility

**High Volatility (Crypto Bull Market):**
- Increase: Min EMA Spacing, Pivot Bars
- Decrease: Leverage, Position Count
- Use: Limit orders

**Low Volatility (Ranging Market):**
- Consider: Pausing the strategy
- Increase: Min EMA Spacing requirement
- Focus: Quality over quantity

### Adjusting for Win Rate

**If Win Rate < 45%:**
- Increase: Min EMA Spacing
- Enable: Require Deeper Retest
- Increase: Pivot confirmation bars
- Use: Entry confirmation

**If Win Rate > 70%:**
- You can: Slightly increase risk
- Consider: More positions
- Maybe: Decrease EMA spacing filter

### Adjusting for Drawdown

**If Drawdown Too High:**
- Decrease: Leverage
- Decrease: Max positions
- Decrease: Risk per trade
- Increase: Pause threshold

**If Drawdown Too Low (underperforming):**
- You might be: Too conservative
- Consider: Increasing risk slightly
- Maybe: Allow more positions

---

## ⚠️ Important Notes

1. **Always backtest** any template before live trading
2. **Start conservative** and increase risk gradually
3. **Paper trade first** with any new settings
4. **Adjust for fees** based on your actual platform
5. **Monitor performance** and adjust settings monthly
6. **Risk management** is more important than profit optimization
7. **Account for slippage** especially on lower timeframes

---

## 📊 Performance Tracking Template

Track your results with each template:

```
Template Used: _________________
Date Range: _________________
Total Trades: _________________
Win Rate: ________%
Average RR: _________________
Total Profit/Loss: $_________________
Max Drawdown: $_________________
Sharpe Ratio: _________________

Notes:
_________________________________
_________________________________
_________________________________

Adjustments Made:
_________________________________
_________________________________
_________________________________
```

---

**Remember: These are starting points. Adjust based on YOUR results, risk tolerance, and trading style!** 🎯

