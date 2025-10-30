# MTF EMA TREND COMPOUND - FILTERS GUIDE
**Version 47 - October 27, 2025**

Complete guide to all available filters in the MTF EMA Trend Compound strategy.

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Core Filters](#core-filters)
3. [Momentum Filters](#momentum-filters)
4. [Advanced Filters](#advanced-filters)
5. [Quick Start Guide](#quick-start-guide)
6. [Filter Combinations](#filter-combinations)
7. [Troubleshooting](#troubleshooting)

---

## OVERVIEW

### Filter Philosophy

All filters are **DISABLED by default** to ensure the strategy works immediately. Enable filters progressively to refine entry quality:

- **Basic Setup**: Core EMA filters only (default)
- **Conservative**: Add HTF filters + RSI
- **Quality Focused**: Add Orderflow + Volatility
- **Maximum Confluence**: Enable all filters

### How Filters Work

All enabled filters must pass for an entry signal:
- **AND Logic**: Trade only triggers when ALL enabled filters agree
- **Directional**: Most filters have separate long/short conditions
- **Non-destructive**: Disabling a filter reverts to default behavior

---

## CORE FILTERS

### 1. EMA Alignment Filter ⭐ (CORE - Always Active)

**Purpose**: Defines the trend using multi-timeframe EMAs

**Settings**:
- Enable/Disable individual EMAs (EMA1-4)
- Configure EMA lengths (default: 50, 200, 250, 1000)
- Require all EMAs aligned or just basic alignment
- Minimum spacing between EMA pairs

**How It Works**:
- **Bullish**: Enabled EMAs in descending order (faster > slower)
- **Bearish**: Enabled EMAs in ascending order (faster < slower)
- Ensures EMAs are spaced apart for strong trends

**Recommended**:
- Keep all 4 EMAs enabled for strongest signals
- Min spacing: 0.1-0.2% for LTF pairs, 0.1-0.15% for HTF pairs

---

### 2. Retest Entry Filter ⭐ (CORE - Always Active)

**Purpose**: Waits for pullback to EMA then continuation

**How It Works**:
- **Longs**: Price dips below first enabled EMA, then crosses back above
- **Shorts**: Price bounces above first enabled EMA, then crosses back below
- Two-step process prevents entering on trend reversal

**Benefits**:
- Better entry prices (buying dips, selling rallies)
- Confirms trend continuation before entry
- Reduces entries at trend extremes

---

### 3. Stop Loss Distance Filter ⭐ (CORE - Always Active)

**Purpose**: Rejects trades with invalid risk/reward setup

**Settings**:
- Stop Method: Pivot or ATR
- Min Stop Distance % (default: 0.2%)
- Max Stop Distance % (default: 10%)

**How It Works**:
- Measures distance from entry to stop
- Rejects if stop too close (< min %) = likely to get stopped out
- Rejects if stop too far (> max %) = poor risk/reward

**Recommended**:
- Crypto 1m/5m: Min 0.2%, Max 5-10%
- Crypto 5m/15m: Min 0.3%, Max 8-12%

---

## HTF DIRECTIONAL FILTERS

### 4. 1H 100 MA Filter (Optional)

**Purpose**: Only take trades aligned with 1-hour trend

**Settings**:
- Enable/Disable toggle
- MA Length (default: 100)

**How It Works**:
- **Longs Only**: When price > 1H 100 MA
- **Shorts Only**: When price < 1H 100 MA
- Prevents counter-trend trades

**Best For**:
- Swing trading (longer holds)
- Reducing whipsaws in ranging markets
- Strong directional bias needed

---

### 5. 4H 200 EMA Filter (Optional)

**Purpose**: Only take trades aligned with 4-hour trend

**Settings**:
- Enable/Disable toggle
- EMA Length (default: 200)

**How It Works**:
- **Longs Only**: When price > 4H 200 EMA
- **Shorts Only**: When price < 4H 200 EMA
- Higher timeframe confirmation

**Best For**:
- Position trading
- Strong trending markets
- Combined with 1H filter for cascading alignment

**Cascading Alignment**: When both 1H and 4H enabled, requires:
- **Longs**: Price > 1H MA > 4H EMA
- **Shorts**: Price < 1H MA < 4H EMA

---

### 6. EMA Ordering Filter (Optional)

**Purpose**: Require EMAs to be positioned above/below HTF filter lines

**Settings**:
- Number of EMAs Required (1-4)
- Works with 1H or 4H filter

**How It Works**:
- **Longs**: First N enabled EMAs must be above HTF line
- **Shorts**: First N enabled EMAs must be below HTF line
- Ensures LTF structure supports HTF bias

**Example** (Require 2 EMAs):
- Longs: EMA1 and EMA2 both above 1H MA
- Shorts: EMA1 and EMA2 both below 1H MA

---

## MOMENTUM FILTERS

### 7. CVD Filter (Cumulative Volume Delta) 📊

**Purpose**: Measure buying vs selling pressure over time

**Settings**:
- Lookback Period (default: 20 bars)
- Longs: Require Positive CVD (default: ON)
- Longs: Require Rising CVD (default: ON)
- Shorts: Require Negative CVD (default: ON)
- Shorts: Require Falling CVD (default: ON)

**How It Works**:
- Cumulative sum of volume-weighted price movements
- Positive CVD = net buying pressure
- Negative CVD = net selling pressure
- Rising/Falling = direction of pressure

**Best For**:
- Confirming trend strength
- Avoiding weak trends with poor volume
- Crypto markets with strong volume data

**Interpretation**:
- **Strong Long**: CVD > 0 and rising
- **Strong Short**: CVD < 0 and falling
- **Warning**: CVD diverging from price = weak trend

---

### 8. RSI Filter (Relative Strength Index) 📈

**Purpose**: Avoid entering when price is overbought/oversold

**Settings**:
- RSI Length (default: 14)
- Longs: Min/Max RSI (default: 40-70)
- Shorts: Min/Max RSI (default: 30-60)

**How It Works**:
- **Longs**: RSI between 40-70
  - Above 40: Not oversold (has momentum)
  - Below 70: Not overbought (room to run)
- **Shorts**: RSI between 30-60
  - Above 30: Not oversold (room to fall)
  - Below 60: Not overbought (has momentum)

**Best For**:
- Range-bound or choppy markets
- Avoiding trend exhaustion entries
- Quality over quantity

**Recommended Ranges**:
- **Aggressive**: 30-80 (more signals)
- **Balanced**: 40-70 (default)
- **Conservative**: 45-65 (fewer, higher quality)

---

### 9. MACD Filter (Moving Average Convergence Divergence) 🌊

**Purpose**: Confirm trend momentum with crossover system

**Settings**:
- Fast/Slow/Signal lengths (default: 12/26/9)
- Longs: MACD > Signal (default: ON)
- Longs: MACD > Zero (default: OFF)
- Shorts: MACD < Signal (default: ON)
- Shorts: MACD < Zero (default: OFF)

**How It Works**:
- **MACD > Signal**: Bullish crossover (momentum increasing)
- **MACD < Signal**: Bearish crossover (momentum decreasing)
- **MACD > 0**: Strong bullish trend
- **MACD < 0**: Strong bearish trend

**Best For**:
- Trending markets
- Confirming momentum direction
- Early trend detection

**Recommended Settings**:
- **Default**: Crossover only (more signals)
- **Strong Trends**: Crossover + Zero line (higher quality)

---

## ADVANCED FILTERS (Multi-Timeframe)

### 10. Orderflow Filter 🔄 (Multi-Timeframe)

**Purpose**: Analyze higher timeframe directional pressure and bar conviction

**Settings**:
- **Timeframe**: 5/15/30/60/240 (default: 15)
- **Lookback**: Number of HTF bars to analyze (default: 10)
- **Bullish Threshold**: % of bars that must be bullish (default: 60%)
- **Bearish Threshold**: % of bars that must be bearish (default: 60%)
- **Require Volume Trend**: Volume must support direction (default: ON)
- **Require Strong Bars**: Recent bar must show conviction (default: ON)

**How It Works**:

1. **Directional Pressure**:
   - Counts bullish vs bearish bars in HTF lookback
   - **Longs**: ≥60% of last 10 bars must be bullish
   - **Shorts**: ≥60% of last 10 bars must be bearish

2. **Bar Strength**:
   - Measures where bar closes within its range
   - **Strong Bullish**: Close in top 30% of range
   - **Strong Bearish**: Close in bottom 30% of range
   - Indicates conviction, not just drifting

3. **Volume Trend**:
   - Current volume vs average volume
   - **Strong**: Volume ≥ 90% of MA
   - Confirms legitimate buying/selling pressure

**Best For**:
- Scalping and day trading
- Volatile crypto markets
- Avoiding weak trends with poor structure
- Ensuring HTF agrees with LTF entry

**Timeframe Selection**:
- **Chart 1m → OF 15m**: See if 15-minute is bullish/bearish
- **Chart 5m → OF 60m**: See if hourly structure supports trade
- **Chart 15m → OF 240m**: See if 4H orderflow aligned

**Interpretation**:
- **Bullish %**: Higher = stronger buying pressure
- **Bar Strength**: "STRONG ↑" = confident buyers
- **Volume**: "STRONG ✓" = institutional participation

**Warning Signs**:
- Bullish/Bearish % near 50% = choppy, no clear direction
- Weak bar strength = drifting price, no conviction
- Low volume = retail-only, lacks institutional support

---

### 11. Volatility Filter 📊 (Multi-Timeframe)

**Purpose**: Only trade during optimal volatility regimes (not too quiet, not too choppy)

**Settings**:
- **Timeframe**: 15/30/60/240/D (default: 60)
- **ATR Length**: Volatility measurement period (default: 14)
- **Regime Lookback**: Bars to determine normal range (default: 100)
- **Min Percentile**: Reject if volatility below this (default: 30%)
- **Max Percentile**: Reject if volatility above this (default: 80%)
- **Require Expansion**: ATR must be rising (default: ON)
- **Expansion Lookback**: Bars to compare ATR (default: 5)

**How It Works**:

1. **Percentile Ranking**:
   - Calculates where current ATR ranks vs last 100 bars
   - 30th percentile = volatility is low (bottom 30%)
   - 80th percentile = volatility is high (top 20%)
   - 50th percentile = median/normal volatility

2. **Optimal Range**:
   - **Too Low** (< 30%): Market too quiet, trends don't develop
   - **Optimal** (30-80%): Ideal for trending moves
   - **Too High** (> 80%): Market too choppy, lots of noise

3. **Expansion Requirement**:
   - ATR must be rising (expanding volatility)
   - Trending moves expand volatility
   - Ranging markets contract volatility
   - Ensures you're entering as trend develops, not ends

**Best For**:
- Avoiding dead/quiet periods
- Avoiding over-volatile/choppy periods
- Trading optimal market conditions
- Day trading and swing trading

**Timeframe Selection**:
- **Chart 1m/5m → Vol 60m**: Trade when hourly ATR optimal
- **Chart 5m/15m → Vol 240m**: Trade when 4H volatility right
- **Chart 15m+ → Vol D**: Trade when daily volatility supports trends

**Regime Interpretation**:
- **TOO LOW**: Market sleeping, no opportunity
- **OPTIMAL**: Perfect for trends
- **TOO HIGH**: Panic/chaos, poor R:R

**Advanced Strategy**:
- **Trending Markets**: Use 30-80% range (default)
- **Breakout Trading**: Use 50-100% range (higher vol OK)
- **Conservative**: Use 40-70% range (very selective)

**Expansion Strategy**:
- **ON** (default): Only trade expanding volatility (trend beginning)
- **OFF**: Trade in established trends (any volatility level)

---

## QUICK START GUIDE

### Beginner Setup (Start Here)

**Goal**: Get comfortable with core strategy, quality signals

```
✓ Core Filters: Enabled (default)
✓ RSI Filter: Enabled (40-70 for longs)
✗ All other filters: Disabled
```

**Expected**: Moderate signals, good quality

---

### Intermediate Setup (Most Popular)

**Goal**: Strong trends with momentum confirmation

```
✓ Core Filters: Enabled (default)
✓ HTF 1H Filter: Enabled (if holding > 30 minutes)
✓ RSI Filter: Enabled (40-70)
✓ MACD Filter: Enabled (crossover only)
✓ Volatility Filter: Enabled (30-80%)
✗ CVD, Orderflow, EMA Ordering: Disabled
```

**Expected**: Fewer signals, higher win rate

---

### Advanced Setup (Quality Over Quantity)

**Goal**: Only the absolute best setups

```
✓ Core Filters: Enabled
✓ HTF 1H + 4H Filters: Enabled (cascading alignment)
✓ EMA Ordering: Enabled (2 EMAs required)
✓ CVD Filter: Enabled
✓ RSI Filter: Enabled (45-65 tighter range)
✓ MACD Filter: Enabled (crossover + zero line)
✓ Orderflow Filter: Enabled
✓ Volatility Filter: Enabled (40-75% tighter range)
```

**Expected**: Very few signals, maximum confluence

---

### Scalping Setup (High Frequency)

**Goal**: More entries, faster timeframes

```
✓ Core Filters: Enabled
✗ HTF Filters: Disabled (too slow for scalping)
✓ RSI Filter: Enabled (30-80 wide range)
✓ Orderflow Filter: Enabled (15m timeframe)
✓ Volatility Filter: Enabled (expansion required)
✗ CVD, MACD: Disabled (lagging for scalps)
```

**Expected**: Many signals, quick entries/exits

---

## FILTER COMBINATIONS

### Best Pairs

**Strong Trend Confirmation**:
- HTF 1H/4H + EMA Ordering
- MACD + CVD (momentum alignment)

**Quality Entry Timing**:
- RSI + Volatility (good conditions + good levels)
- Orderflow + Volatility (HTF structure + optimal regime)

**Maximum Confluence**:
- All HTF filters + RSI + Orderflow + Volatility

---

### Avoid These Combinations

❌ **All Filters Enabled on 1-Minute Chart**
- Too restrictive, you'll never get signals
- Solution: Use fewer filters or longer timeframe

❌ **No Filters at All**
- Too many low-quality signals
- Solution: At least use RSI filter for basic quality control

❌ **Orderflow + CVD Without Volatility**
- Can catch dying trends
- Solution: Add volatility filter to ensure regime is optimal

---

## VISUAL FEEDBACK

### Indicators Panel

Enable "Show Indicators Panel" in Visual Settings to see real-time filter status:

**What You See**:
- ✓ PASS / ✗ FAIL for each condition
- Real-time values (RSI, MACD, CVD, etc.)
- Orderflow pressure percentages
- Volatility regime and percentile
- Overall summary (LONG ✓ / SHORT ✓ / WAIT ✗)

**Color Coding**:
- 🟢 Green = Bullish/Pass
- 🔴 Red = Bearish/Fail
- 🟠 Orange = Warning/Neutral
- ⚪ Gray = Disabled/Inactive

---

## TROUBLESHOOTING

### "Not Getting Any Signals"

**Check**:
1. Too many filters enabled? Start with just RSI
2. RSI range too tight? Try 30-80 instead of 40-70
3. Orderflow threshold too high? Try 55% instead of 60%
4. Volatility range too narrow? Try 20-90%
5. HTF filters preventing entries? Disable temporarily

**Solution**: Disable filters one by one until signals appear, then re-enable progressively

---

### "Getting Too Many Bad Signals"

**Check**:
1. No filters enabled? Add RSI at minimum
2. Volatility filter disabled? Enable to avoid choppy markets
3. No HTF filter? Add 1H filter for directional bias
4. Orderflow not confirming? Enable for HTF structure check

**Solution**: Add filters progressively until win rate improves

---

### "Orderflow Shows 50/50 Split"

**Meaning**: Higher timeframe is choppy/ranging, no clear direction

**Solution**:
- Don't trade! Wait for clear orderflow (>60% one direction)
- Consider longer orderflow timeframe (30m → 60m)
- Enable volatility filter to avoid these periods

---

### "Volatility Shows TOO LOW"

**Meaning**: Market is dead, not moving

**Solution**:
- Don't trade! Wait for volatility to enter 30-80% range
- Switch to different asset (crypto with more volume)
- Wait for market session change (Asia → London → NY)

---

### "Volatility Shows TOO HIGH"

**Meaning**: Market is panicking, too choppy for clean trends

**Solution**:
- Don't trade! Wait for volatility to normalize
- Reduce position size if you must trade
- Tighten stops (market can whipsaw)

---

## PERFORMANCE OPTIMIZATION

### For Higher Win Rate
- Enable more filters (especially HTF + RSI + Volatility)
- Tighten RSI range (45-65)
- Increase orderflow threshold (65-70%)
- Require MACD zero line confirmation

### For More Signals
- Disable HTF filters
- Widen RSI range (30-80)
- Lower orderflow threshold (55%)
- Disable EMA ordering filter

### For Best Risk/Reward
- Enable volatility filter (expansion required)
- Enable orderflow filter (strong bars required)
- Keep tight stop distance limits (0.2-5%)

---

## SUMMARY

### Core Philosophy
**Start Simple → Add Complexity → Optimize Results**

### Key Principles
1. **All filters disabled by default** = strategy works immediately
2. **Enable filters progressively** = refine quality without breaking strategy
3. **Use indicators panel** = see exactly why entries are/aren't triggering
4. **Optimize for YOUR style** = scalper, day trader, swing trader all different

### Recommended Path
1. **Week 1**: Core filters only, learn the strategy
2. **Week 2**: Add RSI filter, see how quality improves
3. **Week 3**: Add Volatility filter, avoid bad market conditions
4. **Week 4**: Experiment with Orderflow, HTF filters, CVD, MACD
5. **Week 5+**: Fine-tune your optimal filter combination

---

## QUICK REFERENCE TABLE

| Filter | Default | Best For | Impact |
|--------|---------|----------|--------|
| EMA Alignment | ✓ ON | All styles | Core trend definition |
| Retest Entry | ✓ ON | All styles | Better entry price |
| Stop Distance | ✓ ON | All styles | Risk management |
| 1H MA | ✗ OFF | Swing trading | HTF directional bias |
| 4H EMA | ✗ OFF | Position trading | HTF directional bias |
| EMA Ordering | ✗ OFF | Strong trends | HTF/LTF alignment |
| CVD | ✗ OFF | Volume-rich assets | Volume pressure |
| RSI | ✗ OFF | All styles | Momentum quality |
| MACD | ✗ OFF | Trending markets | Momentum direction |
| Orderflow | ✗ OFF | All styles | HTF structure |
| Volatility | ✗ OFF | All styles | Regime quality |

---

**Remember**: The best filter combination is the one that works for YOUR trading style, timeframe, and risk tolerance. Start simple and add complexity only when needed!

**Version**: v47 - October 27, 2025  
**Strategy**: MTF EMA Trend Compound  
**Author**: Busby Trading Systems

