# Independent Position Management System

## Overview
Complete refactor from single averaged position to fully independent positions with unique IDs, each managing its own lifecycle, stops, and profit targets.

---

## Key Concept: Position Independence

### Before (WRONG):
```
Strategy used single entry ID: "Long" or "Short"
All entries merged into one averaged position
One stop, one TP1, one TP2 for combined position
```

### After (CORRECT):
```
Each position has unique ID: "Long_1", "Long_2", "Long_3"
Positions remain completely independent
Each has own entry, stop, TP1, TP2
Only commonality: All close on EMA cross exit
```

---

## Position Lifecycle (Example: 3 Independent Shorts)

### SHORT #1
```
Entry: $50,000 (1.0 BTC)
Stop:  $51,000 (1R risk)
TP1:   $48,000 (2R) → Closes 50% (0.5 BTC)
       After TP1: Stop moves to BE ($50,000)
TP2:   $45,000 (5R) → Closes remaining 50% (0.5 BTC)
```

**At TP1**: Position building **ENABLED** (first position safe at BE)

### SHORT #2 (after fresh retest)
```
Entry: $49,800 (1.0 BTC) ← Different entry!
Stop:  $50,800 (1R risk from $49,800)
TP1:   $47,800 (2R from $49,800) → Closes 50%
       After TP1: Stop moves to BE ($49,800)
TP2:   $44,800 (5R from $49,800) → Closes remaining 50%
```

**Both positions running independently now**

### SHORT #3 (after fresh retest)
```
Entry: $49,600 (1.0 BTC) ← Another different entry!
Stop:  $50,600 (1R risk from $49,600)
TP1:   $47,600 (2R from $49,600) → Closes 50%
       After TP1: Stop moves to BE ($49,600)
TP2:   $44,600 (5R from $49,600) → Closes remaining 50%
```

**Max positions reached (3/3)**

### All Three Continue Independently
- Short #1 hits TP2 @ $45,000 → Closes remaining 0.5 BTC
- Short #2 hits TP2 @ $44,800 → Closes remaining 0.5 BTC
- Short #3 hits BE @ $49,600 → Closes remaining 0.5 BTC (price reversed)

**Each position's outcome is independent!**

---

## Technical Implementation

### Position Tracking Arrays
```pine
var array<string> position_ids            // ["Long_1", "Long_2", "Long_3"]
var array<float> position_entries         // [50000, 49800, 49600]
var array<float> position_stops           // Current stop levels
var array<float> position_original_stops  // For RR calculation
var array<float> position_sizes           // [1.0, 1.0, 1.0]
var array<bool> position_at_be            // [true, true, false]
var array<bool> position_is_long          // [false, false, false]
var array<float> position_tp1             // [48000, 47800, 47600]
var array<float> position_tp2             // [45000, 44800, 44600]
var int next_position_number = 1          // Counter for IDs
```

### Entry Process
```pine
// Create unique ID
pos_num = next_position_number
position_id = "Short_" + str.tostring(pos_num)  // "Short_1"
next_position_number := next_position_number + 1

// Store all position data
array.push(position_ids, position_id)
array.push(position_entries, entry)
array.push(position_stops, stop)
// ... all other arrays

// Enter with unique ID
strategy.entry(position_id, strategy.short, qty=qty, comment="SHORT #1")

// Set exits for THIS specific position
exit_id_tp1 = "TP1_Short_1"
exit_id_sl = "SL_Short_1"

// 50% at TP1
strategy.exit(exit_id_tp1, position_id, qty=partial_qty, limit=tp1_price)
// Remaining 50% with stop
strategy.exit(exit_id_sl, position_id, qty=remaining_qty, stop=stop_price)
```

### TP1 Detection & BE Update
```pine
// Monitor each position independently
for i = 0 to array.size(position_ids) - 1
    pos_id = array.get(position_ids, i)
    pos_at_be = array.get(position_at_be, i)
    pos_tp1 = array.get(position_tp1, i)
    
    // Check if TP1 hit and not yet at BE
    if not pos_at_be
        if low <= pos_tp1  // For shorts
            // Move stop to BE
            array.set(position_stops, i, pos_entry)
            array.set(position_at_be, i, true)
            
            // Update exit order for remaining 50%
            exit_id_tp2 = "TP2_" + pos_id
            strategy.exit(exit_id_tp2, pos_id, qty=remaining_qty, 
                         stop=pos_entry, limit=pos_tp2)
```

### Position Cleanup
```pine
// Remove positions from arrays when fully closed
for i = array.size(position_ids) - 1 to 0
    pos_id = array.get(position_ids, i)
    
    // Check if still has open trades
    bool position_still_open = false
    for j = 0 to strategy.opentrades - 1
        if strategy.opentrades.entry_id(j) == pos_id
            position_still_open := true
            break
    
    // Remove from all arrays if closed
    if not position_still_open
        array.remove(position_ids, i)
        array.remove(position_entries, i)
        // ... remove from all arrays
```

---

## Margin Management

### 90% Safety Threshold
```pine
can_open_new_position(new_qty, entry_price) =>
    max_notional = account_size * leverage
    margin_safety_threshold = max_notional * 0.90  // 90% limit
    
    current_exposure = get_current_notional_exposure()
    new_position_notional = new_qty * entry_price
    total_after_new = current_exposure + new_position_notional
    
    total_after_new <= margin_safety_threshold
```

### Margin Calculation
```pine
get_current_notional_exposure() =>
    float total_notional = 0.0
    
    // Sum all open positions
    for i = 0 to array.size(position_ids) - 1
        pos_size = array.get(position_sizes, i)
        pos_entry = array.get(position_entries, i)
        total_notional := total_notional + (pos_size * pos_entry)
    
    total_notional
```

### Entry Check
```pine
if can_enter_short
    // ... validate stop ...
    
    if can_open_new_position(qty, entry)
        // Open position
        strategy.entry(position_id, ...)
    else
        // Margin limit - show warning label
        label.new(bar_index, high, "⚠️ MARGIN LIMIT\nShort rejected", 
                  color=color.orange, style=label.style_label_down)
```

**Benefits:**
- Never exceed leverage limits
- Visual feedback on rejected entries
- Useful for live trading to understand capacity

---

## Position Building Requirements

### When Can We Add Positions?

1. **✅ At least ONE position at BE**
   ```pine
   has_position_at_be = false
   for i = 0 to array.size(position_at_be) - 1
       if array.get(position_at_be, i)
           has_position_at_be := true
           break
   ```

2. **✅ Below max position count**
   ```pine
   current_positions = array.size(position_ids)
   current_positions < max_positions  // Default: 3
   ```

3. **✅ Fresh retest signal**
   ```pine
   had_short_retest = true  // Must have new retest
   ```

4. **✅ Within margin limits**
   ```pine
   can_open_new_position(qty, entry) = true
   ```

5. **✅ Not trading paused**
   ```pine
   trading_paused = false
   ```

### Why "At Least One at BE" Matters
- **Risk Protection**: First position proved itself (hit TP1)
- **Capital Safe**: At minimum, we're breakeven on something
- **Prevents Overexposure**: Don't pyramid into losers
- **Psychological**: Building from strength, not weakness

---

## Exit Scenarios

### Individual Position Exits
Each position can exit independently:
- **TP1 Hit**: 50% closes, 50% continues with BE stop
- **TP2 Hit**: Remaining 50% closes at full profit
- **BE Stop Hit**: Remaining 50% closes at entry (no additional profit)
- **Original SL Hit**: Full position closes at loss (if TP1 not reached yet)

### EMA Cross Exit (Closes All)
**Only scenario where all positions close together:**
```pine
// For shorts: EMA50 crosses above EMA200 (bullish)
if ema50_above_ema200 and ema50_was_below_ema200
    for i = 0 to array.size(position_ids) - 1
        if not array.get(position_is_long, i)  // If short
            pos_id = array.get(position_ids, i)
            strategy.close(pos_id, comment="EMA Cross Exit")
```

**This is the "trend has changed" emergency exit**

---

## Visual Feedback

### Entry Labels
- **First Position**: "LONG #1" or "SHORT #1"
- **Additional Positions**: "LONG #2", "SHORT #3", etc.
- Numbers increment across entire session

### Margin Rejection Labels
```
⚠️ MARGIN LIMIT
Short rejected
```
- Orange background
- Shows exactly where entry would have been
- Helps understand capacity constraints

### Info Panel Updates
- **Positions**: Shows X/3 (e.g., "2/3")
- **At Breakeven**: Shows count "2 pos" or "None"
- **Margin Used**: Shows percentage with color coding:
  - Green: < 60%
  - Orange: 60-80%
  - Red: > 80%
- **Can Add Pos**: YES ✓ if building allowed

---

## Example Trade List

### Independent Position Lifecycle
```
Entry:  SHORT #1           1.0 BTC @ $50,000
Exit:   TP1 @ 2:1          0.5 BTC @ $48,000  [+$1,000]

Entry:  SHORT #2           1.0 BTC @ $49,800
Exit:   TP1 @ 2:1          0.5 BTC @ $47,800  [+$1,000]

Entry:  SHORT #3           1.0 BTC @ $49,600
Exit:   TP1 @ 2:1          0.5 BTC @ $47,600  [+$1,000]

Exit:   TP2 @ 5:1 (SHORT #1)  0.5 BTC @ $45,000  [+$2,500]
Exit:   TP2 @ 5:1 (SHORT #2)  0.5 BTC @ $44,800  [+$2,500]
Exit:   BE (SHORT #3)         0.5 BTC @ $49,600  [+$0]

Total: 6 entries, 6 exits
Gross Profit: $8,000 (3×TP1 + 2×TP2)
```

**Notice:**
- Each position has two exits (TP1 + TP2 or BE)
- Different entries = different profit amounts even at same RR
- One position can lose/BE while others profit

---

## Key Differences Summary

| Aspect | Old System | New System |
|--------|-----------|------------|
| Entry ID | "Long" / "Short" | "Long_1", "Long_2", "Long_3" |
| Position Averaging | Yes (TradingView default) | No (independent) |
| TP1/TP2 Calc | From averaged entry | From each position's entry |
| Stop Management | One stop for all | Each position own stop |
| Position Building | After combined TP1 | After ANY position TP1 |
| Margin Tracking | Strategy default | Custom 90% threshold |
| Exit Independence | All together | Each independent |
| EMA Cross Exit | Yes (all close) | Yes (all close) |

---

## Benefits of Independent System

1. **True Position Building**
   - Add at different entry prices
   - Each position has accurate RR calculation
   - Better reflects actual trading

2. **Risk Management**
   - Stop to BE per position (not averaged)
   - Partial profits locked in independently
   - One position failing doesn't affect others' math

3. **Margin Control**
   - Real-time notional exposure tracking
   - 90% safety margin prevents liquidation
   - Visual warnings on capacity limits

4. **Flexibility**
   - Can scale in at better prices
   - Each entry decision independent
   - Natural drawdown protection

5. **Accurate Backtesting**
   - Reflects real exchange behavior
   - No averaging artifacts
   - True slippage and fees per position

---

## Testing Checklist

- [ ] First position opens with "LONG #1" or "SHORT #1"
- [ ] TP1 closes exactly 50% of position
- [ ] Stop moves to breakeven after TP1
- [ ] Second position requires fresh retest signal
- [ ] Second position opens with "LONG #2" or "SHORT #2"
- [ ] Each position has own entry price (not averaged)
- [ ] Each position's TP2 calculates from its own entry
- [ ] Margin limit prevents entries above 90%
- [ ] Warning label shows when margin prevents entry
- [ ] EMA cross closes all positions together
- [ ] Position arrays clean up when positions close
- [ ] Info panel shows correct position count and margin %
- [ ] Three positions can run simultaneously
- [ ] No more than max_positions allowed (default 3)
- [ ] Position numbers increment correctly (1, 2, 3, 4...)

---

## Important Notes

### Position Numbering
- Numbers increment for entire session
- If SHORT #1, #2, #3 close, next short is SHORT #4 (not #1)
- Resets only when `next_position_number := 1` (all positions closed and flat)

### TradingView Pyramiding
- Strategy setting `pyramiding=10` allows multiple positions
- Unique IDs prevent averaging
- Each `strategy.entry()` with different ID = separate position

### Performance Impact
- Arrays are efficient for small position counts (3-10)
- Loop overhead minimal with max 3-10 positions
- Real-time margin calculation negligible cost

### Live Trading Considerations
- Margin warning prevents overtrading
- Each position tracked separately in broker
- Easier to manage partial closes
- Clear position numbering for tracking

