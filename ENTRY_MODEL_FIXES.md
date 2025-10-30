# Entry Model Fixes - Position Building & Retest Signal Management

## Problem Identified
Multiple positions were opening immediately when existing positions closed, without waiting for fresh entry signals. The retest flags (`had_long_retest` / `had_short_retest`) were not being properly reset after entries, causing unintended re-entries in the same candle as exits.

## Root Causes

### 1. Retest Flag Only Reset on First Position
- **Old behavior**: Retest flags only reset when going from 0→1 positions
- **Issue**: When adding 2nd or 3rd positions, flags remained active
- **Result**: When all positions closed, flags were still true, triggering immediate re-entry

### 2. No Reset When All Positions Close
- **Old behavior**: Retest flags were NOT reset when position_size == 0
- **Issue**: After all positions closed, old retest signals remained active
- **Result**: Immediate re-entry without fresh retest requirement

## Solutions Implemented

### Fix 1: Reset Retest Flags After EVERY Entry
**Location**: Lines 651-675

```pine
// Track position size changes to detect ALL entries (not just first)
var float prev_position_size = 0.0
var float prev_short_size = 0.0

// For LONGS: Reset flag when position size increases
if strategy.position_size > 0
    if strategy.position_size > prev_position_size
        had_long_retest := false  // Consume the signal
    prev_position_size := strategy.position_size

// For SHORTS: Reset flag when position size increases (more negative)
if strategy.position_size < 0
    if math.abs(strategy.position_size) > math.abs(prev_short_size)
        had_short_retest := false  // Consume the signal
    prev_short_size := strategy.position_size
```

**Effect**: Each entry (1st, 2nd, 3rd) now consumes the retest signal, requiring a fresh retest for the next position.

### Fix 2: Reset Retest Flags When All Positions Close
**Location**: Lines 776-796

```pine
if strategy.position_size == 0
    // ... other resets ...
    
    // CRITICAL: Reset retest flags when all positions close
    // This prevents immediate re-entry in the same candle
    had_long_retest := false
    had_short_retest := false
```

**Effect**: When all positions close, retest signals are cleared, requiring fresh price action before new entries.

## Expected Behavior Flow (Example: Shorts)

### Correct Flow:
1. **Short #1 opens** → `had_short_retest` consumed/reset
2. Wait for price to move above EMA50 (step 1 of retest)
3. Wait for price to move back below EMA50 (step 2 - sets `had_short_retest = true`)
4. **Short #1 hits TP1** → `short_partial_taken = true` → enables position building
5. Entry conditions met: `had_short_retest = true` + `has_position_at_be = true`
6. **Short #2 opens** → `had_short_retest` consumed/reset
7. Wait for fresh retest signal...
8. **Short #2 hits TP1** → `short_partial_taken` still true (building stays enabled)
9. Fresh retest signal generates
10. **Short #3 opens** → `had_short_retest` consumed/reset
11. **All 3 shorts close** → ALL flags reset including `had_short_retest`
12. **New trade requires**:
    - Fresh retest (price above then below EMA50)
    - Proper alignment
    - Valid pivot stop
    
### What Was Happening Before:
- Step 11: Shorts close but `had_short_retest` NOT reset
- Step 12: Immediate re-entry because flag still true
- Multiple rapid entries without fresh signals

## Position Building Logic (Unchanged)
The position building enablement logic remains the same:
- `has_position_at_be = true` when ANY position hits TP1
- This stays true across multiple positions (correct behavior)
- Once at breakeven, can keep adding positions (up to max_positions)
- Each add still requires a fresh retest signal (now properly enforced)

## Key Design Principles

1. **Retest signals are consumed**: Each entry uses up the retest flag
2. **Fresh signals required**: After any entry, must wait for new retest
3. **BE enables building**: Once any position at breakeven, building allowed
4. **Clean slate on close**: All positions closing = all signals cleared
5. **No same-candle re-entry**: Flags reset prevents immediate re-entry

## Testing Checklist

- [ ] First position requires retest before entry
- [ ] Second position requires NEW retest (not same signal as first)
- [ ] Third position requires NEW retest (not same signal as second)
- [ ] When all positions close, no immediate re-entry
- [ ] New entries after close require fresh retest signal
- [ ] Position building only enabled after TP1 hit
- [ ] Maximum position count (max_positions) respected

