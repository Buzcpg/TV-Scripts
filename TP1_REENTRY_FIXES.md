# TP1 Re-Entry Fixes - Preventing Duplicate "Remaining 50%" Entries

## Problem Identified
After TP1 hits and the position is closed, the system was:
1. Re-entering multiple "Remaining 50%" positions instead of just one
2. Treating the TP1 re-entry as a new position, triggering flag resets
3. Allowing position building logic to fire during the TP1 re-entry process

## Root Causes

### 1. TP1 Re-Entry Triggered Flag Resets
**Issue**: When we re-entered the "Remaining 50%" after TP1, the position size increased from 0, triggering the new position detection logic which reset `had_long_retest` and `had_short_retest`.

**Impact**: This allowed immediate additional entries if conditions were still met.

### 2. Multiple "Remaining 50%" Entries
**Issue**: The condition check `prev_short_pos_size > 0 and not short_partial_taken` could be evaluated multiple times before the flags were properly updated.

**Impact**: Multiple "Remaining 50%" entries in the same or consecutive bars.

## Solutions Implemented

### Fix 1: TP1 Re-Entry Flag
**Location**: Lines 482, 680-681, 715-720, 749-756, 810

Added `is_tp1_reentry` flag to distinguish TP1 re-entries from genuine new positions:

```pine
var bool is_tp1_reentry = false

// Before re-entering after TP1:
is_tp1_reentry := true
strategy.entry("Short", strategy.short, qty=remaining_qty, comment="Remaining 50%")

// In position tracking:
if math.abs(strategy.position_size) > math.abs(prev_short_size) and not is_tp1_reentry
    // Only reset flags for genuine new entries, not TP1 re-entries
    had_short_retest := false
```

**Effect**: TP1 re-entries no longer trigger flag resets or position building logic.

### Fix 2: Reset Tracking Variables FIRST
**Location**: Lines 705-706, 741-742

Changed the order of operations to reset tracking variables BEFORE re-entering:

**OLD (Buggy):**
```pine
else if prev_short_pos_size > 0 and not short_partial_taken and not na(short_entry_stop)
    short_partial_taken := true
    // ... calculate targets ...
    strategy.entry(...)
    // Reset tracking
    prev_short_pos_size := 0.0  // ← TOO LATE
```

**NEW (Fixed):**
```pine
else if prev_short_pos_size > 0 and not short_partial_taken and not na(short_entry_stop)
    // Reset tracking FIRST to prevent multiple re-entries
    prev_short_pos_size := 0.0  // ← IMMEDIATELY
    
    // ... calculate targets ...
    
    is_tp1_reentry := true
    short_partial_taken := true
    strategy.entry(...)
```

**Effect**: Prevents the condition from being true on subsequent bars/ticks, ensuring only ONE re-entry.

### Fix 3: Set Flags in Correct Order
**Location**: Lines 717-720, 753-756

Moved `short_partial_taken := true` BEFORE the strategy.entry call:

```pine
// Flag that we're re-entering after TP1
is_tp1_reentry := true

// Mark partial as taken (enables position building)
short_partial_taken := true

// Now enter the position
strategy.entry("Short", strategy.short, qty=remaining_qty, comment="Remaining 50%")
```

**Effect**: Ensures flags are set immediately, preventing race conditions.

## Expected TP1 Flow Now

### Correct Sequence:
1. **Position opens**: 1.0 BTC SHORT #1 @ $50,000
2. **TP1 hits**: Closes full position (1.0 BTC) @ $49,000 → Profit on 100%
3. **TP1 detection triggers**:
   - Sets `prev_short_pos_size := 0.0` (prevents re-trigger)
   - Sets `is_tp1_reentry := true` (prevents flag resets)
   - Sets `short_partial_taken := true` (enables position building)
   - Re-enters 0.5 BTC with comment "Remaining 50%"
4. **Position now**: 0.5 BTC SHORT @ $50,000 (original entry)
5. **Stop updated**: Moves to breakeven @ $50,000
6. **Target updated**: TP2 @ 5:1 = $50,000 - ($1,000 × 5) = $45,000
7. **Ready for building**: Can add positions on new retest signals

### What You Should See in Trade List:
```
Entry:  SHORT #1        @ $50,000  [1.0 BTC]
Exit:   TP1 @ 2:1       @ $49,000  [1.0 BTC] → +$1,000 profit

Entry:  Remaining 50%   @ $50,000  [0.5 BTC]
Exit:   TP2 @ 5:1       @ $45,000  [0.5 BTC] → +$2,500 profit
```

### What Was Happening Before (WRONG):
```
Entry:  SHORT #1        @ $50,000  [1.0 BTC]
Exit:   TP1 @ 2:1       @ $49,000  [1.0 BTC]

Entry:  Remaining 50%   @ $50,000  [0.5 BTC]  ← First re-entry
Entry:  Remaining 50%   @ $50,000  [0.5 BTC]  ← Duplicate!
Exit:   TP2 @ 5:1       @ ...
```

## Partial vs Full Trade Lifecycle

### Single Position (No Building):
- Enter 1.0 BTC → TP1 closes all → Re-enter 0.5 BTC → TP2 closes remaining
- **Total**: 2 entries, 2 exits

### With Position Building (Max 3):
- Enter 1.0 BTC SHORT #1 → TP1 → Re-enter 0.5 BTC "Remaining 50%"
- Get fresh retest → Enter 1.0 BTC SHORT #2 → TP1 → Re-enter 0.5 BTC "Remaining 50%"
- Get fresh retest → Enter 1.0 BTC SHORT #3 → (Max reached)
- All hit TP2 eventually
- **Total**: 3 original entries + 3 re-entries = 6 entries

## Key Changes Summary

| Issue | Before | After |
|-------|--------|-------|
| TP1 re-entry resets flags | Yes ✗ | No ✓ |
| Multiple "Remaining 50%" | Yes ✗ | No ✓ |
| Flag reset timing | After entry | Before entry |
| Partial taken flag | After entry | Before entry |
| Position building during TP1 | Possible ✗ | Blocked ✓ |

## Testing Checklist

- [x] TP1 closes full position
- [ ] Only ONE "Remaining 50%" re-entry per TP1
- [ ] Re-entry maintains original entry price for stop/target calculations
- [ ] Stop moves to breakeven after TP1
- [ ] TP2 target calculates from original entry (not TP1 price)
- [ ] Position building still works after TP1
- [ ] No immediate new entries during TP1 re-entry process
- [ ] Retest flags preserved during TP1 re-entry
- [ ] No duplicate entries on same bar/tick

