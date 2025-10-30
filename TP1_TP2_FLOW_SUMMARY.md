# Complete TP1/TP2 Entry Flow - How It Should Work Now

## The Correct Flow (Step-by-Step)

### Example: Short Trade with TP1 @ 2:1, TP2 @ 5:1

#### Stage 1: Initial Entry
```
🔽 SHORT #1 Entry
Price: $50,000
Size: 1.0 BTC (risk $1000)
Stop: $51,000 (1R risk)
TP1: $48,000 (2R profit)
TP2: $45,000 (5R profit)
```

#### Stage 2: TP1 Hits
```
📤 CLOSE FULL POSITION at $48,000
Profit: $2,000 (2R on full size)

🔄 IMMEDIATE RE-ENTRY "Remaining 50%"
Price: $50,000 (still using original entry!)
Size: 0.5 BTC
Stop: $50,000 (moved to BE)
TP2: $45,000 (5R from original entry)
```

**Key Points:**
- TP1 closes 100% of position
- System immediately re-enters 50% of original size
- Re-entry uses ORIGINAL entry price ($50,000) for stop/target calc
- This simulates "taking 50% profit and moving stop to BE"

#### Stage 3: Either TP2 or BE Stop
```
Option A: TP2 Hits at $45,000
📤 CLOSE at $45,000
Additional Profit: $2,500 (5R on remaining 50%)
Total Profit: $2,000 (TP1) + $2,500 (TP2) = $4,500

Option B: Hits BE Stop at $50,000
📤 CLOSE at $50,000
Additional Profit: $0
Total Profit: $2,000 (TP1) + $0 (BE) = $2,000
```

## What You Should See in Your Trade List

### Single Position Lifecycle:
```
Entry:  SHORT #1                 1.0 BTC @ $50,000
Exit:   TP1 @ 2:1               -1.0 BTC @ $48,000  [+$2,000]

Entry:  Remaining 50%            0.5 BTC @ $50,000
Exit:   TP2 @ 5:1               -0.5 BTC @ $45,000  [+$2,500]

Total: 2 entries, 2 exits, $4,500 profit
```

### With Position Building (3 positions max):

#### First Position:
```
Entry:  SHORT #1                 1.0 BTC @ $50,000
Exit:   TP1 @ 2:1               -1.0 BTC @ $48,000  [+$2,000]
Entry:  Remaining 50%            0.5 BTC @ $50,000
```

*Now at BE, position building enabled*

#### Second Position (after fresh retest):
```
Entry:  SHORT #2                 1.0 BTC @ $49,500
Exit:   TP1 @ 2:1               -1.0 BTC @ $47,500  [+$2,000]
Entry:  Remaining 50%            0.5 BTC @ $49,500
```

*Now 2 positions total, both at BE*

#### Third Position (after fresh retest):
```
Entry:  SHORT #3                 1.0 BTC @ $49,000
```

*Max 3 positions reached, no more entries allowed*

#### All Exit at TP2:
```
Exit:   TP2 @ 5:1 (Short #1)    -0.5 BTC @ $45,000  [+$2,500]
Exit:   TP2 @ 5:1 (Short #2)    -0.5 BTC @ $47,000  [+$1,250]
Exit:   TP2 @ 5:1 (Short #3)    -1.0 BTC @ $44,000  [+$5,000]
```

## What Was Happening Before (BUG)

### The Problem:
```
Entry:  SHORT #1                 1.0 BTC @ $50,000
Exit:   TP1 @ 2:1               -1.0 BTC @ $48,000

Entry:  Remaining 50%            0.5 BTC @ $50,000  ← TP1 re-entry
Entry:  Remaining 50%            0.5 BTC @ $50,000  ← DUPLICATE! ✗
Entry:  SHORT #1                 1.0 BTC @ $50,000  ← Extra entry! ✗

All these at same timestamp with no fresh signals!
```

## Technical Implementation

### Key Variables:
```pine
long_partial_taken / short_partial_taken
  → Set TRUE after TP1 hits
  → Enables position building
  → Reset when all positions close

is_tp1_reentry
  → Set TRUE during TP1 re-entry process
  → Prevents flag resets during re-entry
  → Reset after position established

prev_position_size / prev_short_size
  → Tracks position size changes
  → Reset IMMEDIATELY when TP1 detected
  → Prevents multiple re-entry triggers
```

### Critical Execution Order:
```pine
1. Detect TP1: prev_short_pos_size > 0 and not short_partial_taken
2. Reset prev_short_pos_size := 0.0          ← FIRST!
3. Calculate targets from original entry
4. Set is_tp1_reentry := true                ← Before entry
5. Set short_partial_taken := true           ← Before entry
6. strategy.entry("Remaining 50%")           ← Last
7. strategy.exit with BE stop and TP2
```

### What Each Fix Prevents:
- **Reset tracking FIRST** → Prevents condition being true twice
- **is_tp1_reentry flag** → Prevents retest flag resets during TP1 re-entry
- **Set partial_taken before entry** → Prevents race conditions
- **Check `not is_tp1_reentry` in tracking** → Distinguishes TP1 re-entry from real adds

## Position Building Requirements

### To Add Position #2 or #3:
1. ✅ At least one position has hit TP1 (`partial_taken = true`)
2. ✅ Current positions < max_positions (default 3)
3. ✅ Fresh retest signal (`had_short_retest = true`)
4. ✅ Valid stop level (pivot high/low within limits)
5. ✅ Trend still aligned (bearish/bullish)
6. ✅ HTF filters still allow direction

### Importantly:
- Each new position requires a NEW retest (old signal consumed by previous entry)
- Each position independently goes through TP1 → "Remaining 50%" → TP2
- All "Remaining 50%" portions share same BE stop level (original entries)

## What "Remaining 50%" Actually Means

It's a **simulation** of partial profit-taking:

### Real Broker Behavior:
```
Enter 1.0 BTC → Take 50% profit at TP1 → Leave 0.5 BTC running to TP2
```

### TradingView Strategy Limitation:
TradingView can't split one position into partials, so we simulate it:
```
Enter 1.0 BTC → Close 100% at TP1 → Re-enter 0.5 BTC with BE stop
```

The P&L math works out the same:
- First trade: 1.0 BTC × $2,000 = $2,000 profit
- Second trade: 0.5 BTC × $5,000 = $2,500 profit
- **Total: $4,500** (same as taking 50% at 2R, 50% at 5R)

## Testing Your Backtest

### What to Look For:
✅ **CORRECT:**
- One "Remaining 50%" per TP1 hit
- TP2 exits show correct 5R profit from ORIGINAL entry
- Position building only after TP1
- Each new position requires fresh retest

❌ **INCORRECT:**
- Multiple "Remaining 50%" at same timestamp
- TP2 profit calculated from TP1 price (not original entry)
- New positions opening when all close (no retest)
- Duplicate entries without price action

### Debug Indicators:
- Check timestamps: New entries should have time gaps
- Check comments: "SHORT #1" vs "Remaining 50%" vs "SHORT #2"
- Check quantities: Remaining should be 50% of original
- Check stops: After TP1, remaining should be at BE

## Summary

The system now properly simulates a professional trading approach:
1. **Risk defined entry** with full size
2. **Take partial profit** at 2R (50%)
3. **Move stop to breakeven** for remaining
4. **Let winners run** to 5R
5. **Build positions** when first is safe (at BE)
6. **Each add requires fresh signal** (no rapid-fire entries)

