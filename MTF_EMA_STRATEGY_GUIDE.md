# MTF EMA Trend Strategy with Position Building & Compounding

## 📋 Overview

This is a sophisticated Pine Script v6 strategy designed for trend trading using multi-timeframe EMA alignment with position building, compounding, and advanced risk management.

### Key Features
- ✅ Multi-timeframe EMA alignment system
- ✅ Position building (pyramiding) when trades reach breakeven
- ✅ Automatic compounding based on win streaks
- ✅ Partial profit taking at 2:1 RR
- ✅ Automatic stop-loss to breakeven after partial
- ✅ Pause trading after consecutive losses
- ✅ Risk scaling based on cumulative profits
- ✅ Leverage-aware position sizing
- ✅ Comprehensive visual feedback

---

## 🎯 Strategy Concept

### The 4-EMA System

The strategy uses **4 EMAs** to identify strong trends:

1. **EMA 50** (LTF) - Entry signal EMA
2. **EMA 200** (LTF) - Primary trend filter
3. **HTF EMA 50** (converted to LTF periods) - Secondary trend filter
4. **HTF EMA 200** (converted to LTF periods) - Overall trend confirmation

### Timeframe Examples

| LTF | HTF | EMA Periods Used |
|-----|-----|------------------|
| 1m  | 5m  | 50, 200, 250, 1000 |
| 5m  | 15m | 50, 200, 150, 600 |
| 15m | 1h  | 50, 200, 200, 800 |

The HTF EMAs are calculated as:
- `HTF_EMA_50 = EMA_50 * (HTF_period / LTF_period)`
- `HTF_EMA_200 = EMA_200 * (HTF_period / LTF_period)`

---

## 📊 Entry Rules

### Bullish Entry (Long)
1. **EMA Alignment**: EMA50 > EMA200 > HTF_EMA50 > HTF_EMA200
2. **Retest**: Price must test/touch the EMA50
3. **Cross**: Price crosses back above EMA50
4. **Stop**: Last pivot low (using 5,2 pivot settings)
5. **Position**: No existing positions OR existing position at breakeven

### Bearish Entry (Short)
1. **EMA Alignment**: EMA50 < EMA200 < HTF_EMA50 < HTF_EMA200
2. **Retest**: Price must test/touch the EMA50
3. **Cross**: Price crosses back below EMA50
4. **Stop**: Last pivot high (using 5,2 pivot settings)
5. **Position**: No existing positions OR existing position at breakeven

---

## 💰 Risk Management

### Position Sizing

The strategy calculates position size based on:

```
Position Size = Risk Amount / (Entry - Stop + Fees)
```

With leverage constraints:
```
Max Position Notional = Account Size × Leverage
```

### Risk Levels

1. **Base Risk**: Initial risk per trade (e.g., $1,000 or 1%)
2. **Scaled Risk**: Increased risk after X consecutive wins (e.g., $2,000 or 2%)
3. **Profit-Based Scaling**: Further 1.5x increase when testing deeper EMAs after accumulated profits

---

## 🎯 Profit Management

### Partial Profits (2:1 RR)

When price reaches **2:1 Risk:Reward**:
- Close **50%** of position (adjustable)
- Move stop-loss to **breakeven**
- Allows adding new positions (position building)

### Main Target (5:1 RR)

Remaining position stays until:
- **5:1 RR** target is hit
- Stop-loss is triggered (at breakeven after partial)

### Breakeven Protection

After partial profit is taken:
- Stop-loss automatically moves to entry price
- Original risk is eliminated
- Allows "free" position building

---

## 🏗️ Position Building

### Rules

1. **First Position**: Enters when all EMAs are aligned and retest occurs
2. **Second Position**: Can add when first position reaches breakeven
3. **Third+ Positions**: Can add up to max positions (default: 3)

### Enhanced Entry for Add-Ons

When adding positions, you can require deeper retests:
- Price must test **EMA200**, **HTF_EMA50**, or **HTF_EMA200**
- Ensures better risk/reward for additional entries

### Example Scenario

```
Trade 1: Entry at $50,000 with $1,000 risk
  → Reaches 2:1 → Take 50% profit → Move to BE

Trade 2: Can now add at $50,500 with $1,000 risk
  → Effective risk: $0 on the trend (Trade 1 at BE)
  
Trade 3: Can add again if Trade 2 also reaches BE
  → Building a larger position with protected downside
```

---

## ⚠️ Loss Management

### Pause After Losses

After **2 consecutive losses** (adjustable):
- Trading automatically **pauses**
- Prevents revenge trading
- Waits for next **successful trade** to resume

### Loss Tracking

- Tracks consecutive wins/losses
- Resets on opposite outcome
- Visual indicator shows pause status

---

## 📈 Compounding Strategy

### Win-Based Scaling

After **3 consecutive wins** (adjustable):
- Risk increases from base ($1,000) to max ($2,000)
- Allows compounding of profits

### Profit-Based Scaling

When accumulated profit in current trend + deeper retest:
- Risk multiplied by **1.5x**
- Example: $2,000 × 1.5 = $3,000 risk on next trade

### Example

```
Cumulative Profit: $50,000 in current trend
Consecutive Wins: 3+
New Setup: Price tests HTF_EMA50 (deeper than EMA50)
Risk: $2,000 × 1.5 = $3,000

Reason: You have profits to scale with, and the deeper 
        retest suggests strong trend continuation
```

---

## ⚙️ Settings Guide

### Timeframe Settings

- **LTF Period**: Your entry/chart timeframe (e.g., 1m, 5m)
- **HTF Period**: Higher timeframe for trend (e.g., 5m, 15m)

### EMA Settings

- **EMA Fast**: Default 50
- **EMA Slow**: Default 200
- EMAs are automatically calculated for both timeframes

### Stop Loss Settings

- **Pivot Left Bars**: Default 5
- **Pivot Right Bars**: Default 2
- Uses pivot highs/lows for stop placement

### Risk & Position Settings

- **Account Size**: Your total account balance
- **Leverage**: Your maximum leverage (5x, 10x, etc.)
- **Base Risk %**: Starting risk per trade (1%)
- **Max Risk %**: Risk after wins (2%)
- **Base Risk $**: Dollar risk if using fixed amounts
- **Max Risk $**: Max dollar risk after wins

### Profit Taking Settings

- **Main Target (RR)**: Final target in RR terms (default: 5:1)
- **Partial Target (RR)**: Partial profit level (default: 2:1)
- **Partial Size %**: Percentage to close at partial (default: 50%)
- **Move to Breakeven**: Enable automatic BE stop move

### Position Building Settings

- **Enable Position Building**: Turn on/off pyramiding
- **Max Concurrent Positions**: Maximum number of positions (default: 3)
- **Require Deeper Retest**: Add-ons need deeper EMA tests
- **Wins Before Scale-Up**: Wins needed to increase risk (default: 3)

### Loss Management

- **Pause After Losses**: Number of losses before pause (default: 2)
- **Resume on Successful Trade**: Auto-resume after next win

### Strategy Settings

- **Trade Direction**: Long, Short, or Both
- **Require All EMAs Aligned**: Strict alignment requirement
- **Min EMA Spacing %**: Minimum distance between EMAs (0.05%)

---

## 📊 Visual Indicators

### EMAs on Chart

- **Yellow Line**: EMA 50
- **Orange Line**: EMA 200
- **Blue Line**: HTF EMA 50 (converted)
- **Purple Line**: HTF EMA 200 (converted)

### Background Colors

- **Light Green**: Bullish EMA alignment
- **Light Red**: Bearish EMA alignment

### Stop & Target Levels

- **Red Cross**: Original stop-loss
- **Yellow Cross**: Breakeven stop (after partial)
- **Aqua Circles**: Partial profit target (2:1)
- **Lime Circles**: Main target (5:1)

### Entry Signals

- **Green "LONG" Label**: New long entry
- **Red "SHORT" Label**: New short entry
- **Small "+" Symbol**: Add-on position

### Status Indicators

- **⏸ Symbol**: Trading paused due to losses

---

## 📱 Info Panel

The info panel (top-right) shows:

### Trend Status
- Current trend direction
- EMA values

### Position Info
- Active positions / max positions
- Position size
- Average entry price
- Current P&L
- Partial profit status
- Stop at breakeven status
- Can add position status

### Risk Management
- Current risk amount
- Max notional position
- Leverage being used

### Performance Stats
- Win streak
- Loss streak
- Trading status (Active/Paused)

---

## 🚀 Quick Start Guide

### Step 1: Configure Your Timeframes
```
LTF Period: 1 (for 1-minute chart)
HTF Period: 5 (for 5-minute trend)
```

### Step 2: Set Your Account Parameters
```
Account Size: $100,000
Leverage: 5x
Base Risk: $1,000 (1%)
Max Risk: $2,000 (2%)
```

### Step 3: Configure Position Building
```
Enable Position Building: ✓
Max Positions: 3
Require Deeper Retest: ✓
Wins Before Scale-Up: 3
```

### Step 4: Set Profit Management
```
Partial Target: 2:1
Partial Size: 50%
Main Target: 5:1
Move to Breakeven: ✓
```

### Step 5: Configure Loss Protection
```
Pause After Losses: 2
Resume on Successful Trade: ✓
```

---

## 💡 Best Practices

### 1. Timeframe Selection
- Use **1m/5m** for scalping
- Use **5m/15m** for swing trades
- Use **15m/1h** for position trades

### 2. Risk Management
- Start with **1%** base risk
- Don't exceed **2%** even with compounding
- Respect your max notional position

### 3. Position Building
- Wait for first position to reach **breakeven**
- Prefer **deeper retests** for add-ons
- Don't exceed **3-4 positions** in one trend

### 4. Trend Selection
- Only trade during **strong alignment**
- Ensure EMAs have proper **spacing**
- Avoid choppy/sideways markets

### 5. Loss Management
- Respect the **pause** after losses
- Don't override the loss limits
- Wait for **clean setup** to resume

---

## 🎓 Example Trade Walkthrough

### Setup
- Chart: 1-minute
- HTF: 5-minute
- Account: $100,000
- Leverage: 5x
- Base Risk: $1,000

### Trade Sequence

**Trade #1**: Initial Entry
```
Price: $50,000
EMAs: 50 > 200 > 250 > 1000 ✓ (aligned)
Retest: Price touches EMA50 at $49,950
Cross: Price crosses back to $50,000
Stop: Pivot low at $49,800
Risk: $50,000 - $49,800 = $200
Position: $1,000 / $200 = 5 units
Target: $50,000 + ($200 × 5) = $51,000

Outcome:
- Price reaches $50,400 (2:1)
- Close 2.5 units → Profit: $1,000
- Move stop to $50,000 (breakeven)
- Remaining: 2.5 units with $0 risk
```

**Trade #2**: Add-On Position
```
Price: $50,300
EMAs: Still aligned ✓
Retest: Price tests EMA200 at $50,250 (deeper!)
Cross: Price crosses back to $50,300
Stop: New pivot low at $50,100
Risk: $50,300 - $50,100 = $200
Position: $1,000 / $200 = 5 units
Target: $50,300 + ($200 × 5) = $51,300

Effective Risk: $0 (Trade #1 at breakeven)

Outcome:
- Both positions move toward targets
- Trade #1 exits at $51,000 → Total: $2,500 profit
- Trade #2 reaches 2:1 at $50,700
- Close 2.5 units → Profit: $1,000
- Move stop to $50,300
```

**Trade #3**: Scale-Up Entry
```
Price: $50,600
Consecutive Wins: 2 (approaching scale-up threshold)
EMAs: Still strongly aligned ✓
Retest: Tests HTF_EMA50 (EMA250)
Risk: Still $1,000 (need 3 wins for scale-up)

After this trade wins → Consecutive wins = 3
Next trade will use $2,000 risk!
```

**Final Results**:
- Total Profit: $4,500+
- Max Risk Taken: $1,000 per trade
- Actual Risk Realized: Only first trade had real risk
- Win Rate: 100% (3/3)
- Next trade will compound with $2,000 risk

---

## 🔧 Troubleshooting

### "No Entries Occurring"

**Check**:
1. Are all 4 EMAs properly aligned?
2. Is EMA spacing sufficient? (Check min spacing setting)
3. Did price actually retest EMA50?
4. Is there a valid pivot for stop-loss?
5. Is trading paused due to losses?

### "Partial Profit Not Taken"

**Check**:
1. Is price actually reaching 2:1 RR?
2. Is partial profit enabled?
3. Check the partial target line on chart
4. Ensure partial % is set correctly

### "Not Adding Positions"

**Check**:
1. Did first position reach breakeven?
2. Is "Enable Position Building" turned on?
3. Have you exceeded max positions?
4. If "Require Deeper Retest" is on, did price test deeper EMAs?

### "Risk Too High/Low"

**Check**:
1. Verify account size setting
2. Check leverage setting
3. Ensure risk % or $ amount is correct
4. Check if max notional is being exceeded

### "Trading Paused"

**Reason**:
- Had 2 consecutive losses
- Wait for next clean setup
- Will auto-resume on next win

---

## 📈 Performance Optimization

### For Better Results

1. **Strong Trends Only**
   - Wait for clear EMA separation
   - Avoid ranging markets
   - Use higher timeframes for trend confirmation

2. **Quality Over Quantity**
   - Don't force trades
   - Wait for proper retests
   - Respect pause periods

3. **Risk Control**
   - Start conservatively (1% risk)
   - Let compounding happen naturally
   - Don't chase with oversized positions

4. **Position Building**
   - Wait for breakeven confirmation
   - Prefer deeper retests for add-ons
   - Don't exceed 3-4 positions typically

---

## ⚡ Advanced Tips

### Optimal Setups
- **Best**: All 4 EMAs spread apart with clear spacing
- **Good**: EMAs aligned with moderate spacing
- **Avoid**: EMAs bunched together or crossing

### Market Conditions
- **Bull Market**: Focus on longs, wait for retests
- **Bear Market**: Focus on shorts, wait for rallies
- **Sideways**: Reduce position size or pause

### Leverage Usage
- **5x**: Conservative (recommended)
- **10x**: Moderate (for experienced traders)
- **20x+**: Aggressive (high risk)

### Position Building Strategy
- **Conservative**: 2 max positions, always require deeper retests
- **Moderate**: 3 positions, require deeper retests
- **Aggressive**: 4+ positions, allow any retest

---

## 📞 Support & Customization

### Customization Ideas

1. **Different EMA Periods**: Try 21/50/100 instead of 50/200
2. **Tighter Stops**: Use ATR-based stops instead of pivots
3. **Dynamic Targets**: Use trailing stops for targets
4. **Multiple Partials**: Take 33% at 2:1, 33% at 3:1, rest at 5:1

### Backtesting Tips

1. Use at least **6 months** of data
2. Test on **multiple pairs/assets**
3. Include **commission/fees**
4. Test different **market conditions**

---

## 📝 Version Information

**Version**: 6
**Last Updated**: 2024
**Compatible With**: TradingView Pine Script v6
**Author**: Custom MTF EMA Strategy

---

## ⚖️ Disclaimer

This strategy is for educational purposes. Always:
- Test on paper/demo accounts first
- Understand all risks involved
- Never risk more than you can afford to lose
- Past performance doesn't guarantee future results
- Adjust settings for your risk tolerance

---

## 🎯 Summary

This MTF EMA Trend Strategy combines:
- ✅ Multiple timeframe analysis
- ✅ Strict trend alignment
- ✅ Position building capabilities
- ✅ Automatic risk management
- ✅ Compounding through win streaks
- ✅ Loss protection through pauses
- ✅ Leverage-aware position sizing

**Use it wisely, trade it safely, and let the trends work for you!** 🚀

