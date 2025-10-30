# Entry and Stop Loss Options Update (v48)

**Date:** October 27, 2025  
**Version:** v48

## Overview

Three new powerful options have been added to give you more control over entries and stop loss placement:

1. **EMA-Based Stop Loss** - Use an EMA as your stop level instead of pivots or ATR
2. **Selectable Entry EMA** - Choose which EMA (1-4) triggers your entries
3. **Wick vs Close Cross Detection** - Control how EMA crosses are detected

---

## 1. EMA-Based Stop Loss

### Location
**Settings → Stop Loss Settings → Stop Loss Method**

### Description
Previously you could only use Pivot highs/lows or ATR for stop placement. Now you can use any of your 4 EMAs as the stop level.

### How It Works

**For Long Entries:**
- Stop loss is placed at the selected EMA level (e.g., EMA2)
- Risk is calculated as: `Entry Price - EMA Value`

**For Short Entries:**
- Stop loss is placed at the selected EMA level
- Risk is calculated as: `EMA Value - Entry Price`

### Settings

```
Stop Loss Method: "Pivot" | "ATR" | "EMA"
Stop Loss EMA: "EMA1" | "EMA2" | "EMA3" | "EMA4"
```

### Use Cases

**Tight Stops (EMA1 or EMA2):**
- Scalping on lower timeframes (1m, 5m)
- When you want stops close to price action
- Higher risk of being stopped out, but lower $ risk per trade

**Wide Stops (EMA3 or EMA4):**
- Swing trading or position trading
- When you want to give the trade "room to breathe"
- Less likely to be stopped out, but higher $ risk per trade

**Example Configuration:**
```
EMA1: 50
EMA2: 200
Entry EMA: EMA1 (enter on 50 EMA retest)
Stop EMA: EMA2 (stop at 200 EMA)
```

This means:
- Enter when price pulls back to 50 EMA and bounces
- Stop loss at 200 EMA
- Risk = distance from 50 EMA to 200 EMA at entry

### Important Notes

- ⚠️ Stop loss is **static at entry** (not trailing the EMA)
- ✅ Still respects min/max stop distance % limits
- ✅ Position sizing automatically adjusts based on EMA distance
- 💡 Works great for "EMA layering" strategies (enter at fast EMA, stop at slow EMA)

---

## 2. Selectable Entry EMA

### Location
**Settings → Strategy Settings → Entry EMA Cross**

### Description
Choose which of your 4 EMAs is used for entry cross/retest detection.

### Settings

```
Entry EMA Cross: "EMA1" | "EMA2" | "EMA3" | "EMA4"
```

### How It Works

**Previously:**
- Strategy always used the first enabled EMA for entries
- If you disabled EMA1, it would use EMA2, etc.

**Now:**
- You explicitly choose which EMA triggers entries
- Can enter on EMA2 retest even if EMA1 is enabled

### Entry Logic (Retest Model)

**For Longs (Bullish Trend):**
1. Wait for price to pull back and touch/cross below the selected Entry EMA
2. Price bounces back above the Entry EMA
3. Entry signal triggered

**For Shorts (Bearish Trend):**
1. Wait for price to bounce up and touch/cross above the selected Entry EMA
2. Price rejects back below the Entry EMA
3. Entry signal triggered

### Use Cases

**Enter on EMA1 (50 EMA):**
- More frequent entries
- Tighter stops possible
- Good for active trading / scalping

**Enter on EMA2 (200 EMA):**
- Fewer but higher quality entries
- Deeper pullbacks
- Good for swing trading

**Enter on EMA3 or EMA4:**
- Very selective entries
- Major trend retest only
- Position trading / long-term holds

### Example Configurations

**Scalping Setup:**
```
Entry EMA: EMA1 (50)
Stop Method: ATR or EMA2 (200)
Result: Quick entries on minor pullbacks
```

**Swing Trading Setup:**
```
Entry EMA: EMA2 (200)
Stop Method: EMA3 (250) or EMA4 (1000)
Result: Patient entries on significant pullbacks
```

**Confirmation Strategy:**
```
Entry EMA: EMA2 (200)
Require: EMA1 > EMA2 > EMA3 > EMA4 (all aligned)
Result: Enter on 200 EMA retest only when full alignment confirmed
```

---

## 3. Wick vs Close Cross Detection

### Location
**Settings → Strategy Settings → Cross Detection Method**

### Description
Control whether EMA crosses require a candle close beyond the EMA, or if a wick touch is sufficient.

### Settings

```
Cross Detection Method: "Close" | "Wick"
```

### Close Method (Default - Original Behavior)

**How it works:**
- Candle must **close** beyond the EMA for a cross to be valid
- More conservative, fewer false signals
- Requires stronger price movement

**Long Entry Example:**
1. Bullish trend (EMAs aligned)
2. Candle closes **below** Entry EMA → Retest started
3. Next candle closes **above** Entry EMA → Entry signal

**Visual:**
```
Price action:
  ↑ Entry here (closed above EMA)
──┼── Entry EMA
  ↓ Retest (closed below EMA)
```

### Wick Method (New Option)

**How it works:**
- Price can **touch** the EMA with a wick without closing beyond it
- More aggressive, more frequent entries
- Captures quick "rejection" moves

**Long Entry Example:**
1. Bullish trend (EMAs aligned)
2. Candle **wicks down** to Entry EMA but closes above → Entry signal immediately
3. No need to wait for price to close below then back above

**Visual:**
```
Price action:
  ↑ Candle body (closes above EMA)
  │
──┼── Entry EMA
  │ Wick touches (entry triggered)
```

### Comparison

| Feature | Close Method | Wick Method |
|---------|-------------|-------------|
| **Entry Speed** | Slower (waits for confirmation) | Faster (immediate on touch) |
| **Entry Frequency** | Fewer entries | More entries |
| **False Signals** | Lower | Higher |
| **Best For** | Confirmation traders | Aggressive traders |
| **Timeframes** | All (especially higher TF) | Lower timeframes (1m, 5m) |

### Use Cases

**Close Method (Conservative):**
- ✅ Swing trading on 15m+ timeframes
- ✅ When you want strong confirmation
- ✅ Trending markets with clear pullbacks
- ✅ Backtesting to avoid overfitting

**Wick Method (Aggressive):**
- ✅ Scalping on 1m/5m timeframes
- ✅ Fast-moving crypto markets
- ✅ When you want to catch "quick taps" to support
- ✅ EMA acts as support/resistance level

### Example Strategy Combinations

**1. Scalper Setup**
```
Entry EMA: EMA1 (50)
Cross Method: Wick
Stop Method: ATR (1.0x)
Timeframe: 1m or 5m
Logic: Enter immediately when price wicks to 50 EMA
```

**2. Swing Trader Setup**
```
Entry EMA: EMA2 (200)
Cross Method: Close
Stop Method: EMA (EMA3 or EMA4)
Timeframe: 15m or 1H
Logic: Wait for confirmed close below/above 200 EMA before entry
```

**3. Position Trader Setup**
```
Entry EMA: EMA3 (250)
Cross Method: Close
Stop Method: EMA (EMA4)
Timeframe: 4H or Daily
Logic: Only enter on deep pullbacks with strong confirmation
```

---

## Settings Summary

### Stop Loss Settings Group

```pine
Stop Loss Method: "Pivot" | "ATR" | "EMA"
  ↳ Pivot Settings:
      - Pivot Left Bars
      - Pivot Right Bars
  ↳ ATR Settings:
      - ATR Length
      - ATR Multiplier
  ↳ EMA Settings:
      - Stop Loss EMA: "EMA1" | "EMA2" | "EMA3" | "EMA4"

Min Stop Distance (%): 0.2%
Max Stop Distance (%): 10.0%
```

### Strategy Settings Group

```pine
Trade Direction: "Long" | "Short" | "Both"
Entry EMA Cross: "EMA1" | "EMA2" | "EMA3" | "EMA4"
Cross Detection Method: "Close" | "Wick"
```

---

## Visual Feedback

The **Info Panel** (top right) now displays:

```
═══════════════════
MTF EMA TREND
═══════════════════
Risk Management
-------------------
Entry EMA:     EMA1
Cross Method:  Close
Stop Method:   EMA (EMA2)
-------------------
```

This helps you quickly see which configuration is active.

---

## Testing Recommendations

### Step 1: Test Stop Methods
1. Start with your current settings (Pivot or ATR)
2. Switch to `Stop Method: EMA (EMA2)`
3. Compare:
   - Number of trades
   - Average R-multiple
   - Win rate
   - Drawdown

### Step 2: Test Entry EMAs
1. Keep `Entry EMA: EMA1` (default)
2. Run backtest, note results
3. Change to `Entry EMA: EMA2`
4. Compare trade frequency and quality

### Step 3: Test Cross Methods
1. Start with `Close` method (conservative)
2. Run backtest
3. Switch to `Wick` method (aggressive)
4. Compare entry timing and false signals

### Sample Test Matrix

| Test # | Entry EMA | Cross Method | Stop Method | Expected Result |
|--------|-----------|--------------|-------------|-----------------|
| 1 | EMA1 | Close | Pivot | Baseline (current behavior) |
| 2 | EMA1 | Close | EMA (EMA2) | Tighter stops, smaller R |
| 3 | EMA2 | Close | EMA (EMA3) | Fewer trades, higher quality |
| 4 | EMA1 | Wick | ATR | More trades, faster entries |
| 5 | EMA2 | Wick | EMA (EMA4) | Best pullbacks, wide stops |

---

## Important Considerations

### Position Sizing Impact

**With EMA-based stops:**
- Stop distance varies with EMA spacing
- In strong trends (wide EMA spacing): Smaller position size
- In tight consolidation (narrow EMA spacing): Larger position size
- Still capped by `Max Position Size (%)` setting

**Example:**
```
Account: $100,000
Risk per trade: $1,000
Entry: $100
EMA2 Stop: $98
Risk distance: $2

Position size = $1,000 / $2 = 500 units
Notional = 500 × $100 = $50,000
```

### Stop Loss Validation

All stop methods still respect:
- ✅ `Min Stop Distance (%)` - prevents stops too close
- ✅ `Max Stop Distance (%)` - rejects trades with stops too far
- ✅ Stop must be on correct side (below for longs, above for shorts)

If EMA-based stop violates these rules, trade is rejected.

---

## Fallback Behavior

**If selected Entry EMA is disabled:**
- Strategy falls back to first enabled EMA
- Example: `Entry EMA: EMA2` but EMA2 is disabled → uses EMA1

**If selected Stop EMA is disabled:**
- Strategy falls back to first enabled EMA
- Example: `Stop EMA: EMA3` but EMA3 is disabled → uses EMA1

This prevents configuration errors.

---

## Code Changes (Technical)

### Files Modified
- `mtf_ema_trend_compound.pine` (main strategy)

### Key Changes

**1. Inputs Added (lines ~61-73, 112-113):**
```pine
stop_loss_method = input.string("Pivot", options=["Pivot", "ATR", "EMA"])
stop_ema_choice = input.string("EMA2", options=["EMA1", "EMA2", "EMA3", "EMA4"])
entry_ema_choice = input.string("EMA1", options=["EMA1", "EMA2", "EMA3", "EMA4"])
cross_detection_method = input.string("Close", options=["Close", "Wick"])
```

**2. Retest Detection Updated (lines ~658-763):**
- Now respects `entry_ema_choice` setting
- Implements wick-based vs close-based logic
- Separate logic paths for long/short

**3. Stop Loss Calculation Updated (lines ~952-1093):**
- Added EMA stop logic for longs
- Added EMA stop logic for shorts
- Respects `stop_ema_choice` setting

**4. Info Panel Updated (lines ~1536-1543):**
- Displays Entry EMA choice
- Displays Cross Method
- Displays Stop Method with EMA choice

---

## Quick Start Examples

### Want More Entries? (Aggressive)
```
Entry EMA: EMA1
Cross Method: Wick
Stop Method: ATR (1.0x)
```

### Want Better Quality? (Conservative)
```
Entry EMA: EMA2
Cross Method: Close
Stop Method: EMA (EMA3)
```

### Want Tight Risk Management? (Precision)
```
Entry EMA: EMA1
Cross Method: Close
Stop Method: EMA (EMA2)
```

### Want Big Runners? (Patient)
```
Entry EMA: EMA3
Cross Method: Close
Stop Method: EMA (EMA4)
Min Stop Distance: 0.5%
Max Stop Distance: 15%
```

---

## Frequently Asked Questions

**Q: Does the EMA stop trail with the EMA?**  
A: No. Stop is set at entry and remains static. This is intentional for clean R-multiple tracking.

**Q: Can I use EMA1 for both entry and stop?**  
A: Yes, but this creates very tight stops. Only recommended for scalping.

**Q: What if my stop EMA is above price at entry (for longs)?**  
A: Trade is rejected. Stop must be below entry for longs, above for shorts.

**Q: Which cross method is better?**  
A: Depends on your style. `Close` is more reliable, `Wick` is more aggressive. Test both.

**Q: Can I still use the old pivot/ATR methods?**  
A: Absolutely! All previous functionality is preserved. `EMA` is just a third option.

**Q: Does this work with all the filters (CVD, RSI, etc.)?**  
A: Yes! These entry/stop options work alongside all existing filters.

---

## Performance Notes

**These options do NOT change:**
- EMA alignment logic
- Filter system (CVD, RSI, MACD, Orderflow, Volatility)
- Position sizing algorithm
- TP1/TP2/TP3 logic (Advanced mode)
- Trade direction settings
- Risk management caps

**What changes:**
- Entry timing (which EMA cross triggers entry)
- Entry sensitivity (wick vs close detection)
- Stop placement (pivot/ATR/EMA)
- Risk per trade (varies with stop distance)

---

## Related Documentation

- [FILTERS_GUIDE.md](FILTERS_GUIDE.md) - Complete filter system guide
- [MTF_EMA_STRATEGY_GUIDE.md](MTF_EMA_STRATEGY_GUIDE.md) - Full strategy guide
- [MTF_EMA_README.md](MTF_EMA_README.md) - Strategy overview

---

**Version:** v48  
**Last Updated:** October 27, 2025  
**Status:** ✅ Production Ready

