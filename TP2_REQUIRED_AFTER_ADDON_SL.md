# TP2 Required After Add-On Stop Loss

## The Problem: Compounding Losses

### Before This Fix:
```
Entry 1 → TP1 @ 2:1 [+1R] ✅ Building enabled

Entry 2 (add) → SL [-1R] ❌ Still building!

Entry 3 (add) → SL [-1R] ❌ Still building!

Entry 4 (add) → SL [-1R] ❌ Still building!

Net: +1R - 3R = -2R (losing money on compounding!)
```

**The Issue**: Once any position hit TP1, building stayed enabled regardless of subsequent add-on failures, leading to compounding losses.

---

## The Solution: Financially Balanced Protection

### The Rule:
**If any add-on position hits stop loss → Pause building until ANY position hits TP2**

### Why This Works Mathematically:
```
TP1 = 2:1 on 50% = 1R profit
TP2 = 5:1 on 50% = 2.5R additional profit  
SL = 1R loss (full position)

One TP2 (2.5R) > One SL (1R) ✅
```

---

## Implementation Details

### New Tracking Variables:
```pine
var array<bool> position_is_addon = array.new<bool>()  // Track if position was add-on
var bool building_paused_need_tp2 = false              // Pause flag
```

### Detection Logic:
```pine
// On trade close, check exit comment
if strategy.closedtrades > strategy.closedtrades[1]:
    last_comment = strategy.closedtrades.exit_comment(...)
    
    // Add-on hit SL? (not position #1)
    is_addon_sl = contains "- SL" AND not contains "#1"
    if is_addon_sl and loss:
        building_paused_need_tp2 = true  // PAUSE
    
    // Any position hit TP2?
    is_tp2 = contains "- TP2"
    if is_tp2 and profit:
        building_paused_need_tp2 = false  // RESUME
```

### Position Building Condition:
```pine
// Added: not building_paused_need_tp2
can_build = has_position_at_be 
            and not building_paused_need_tp2  // NEW CHECK
            and current_positions < max_positions
            and not trading_paused
```

### Reset Conditions:
```pine
// Reset when all positions close (fresh start)
if strategy.position_size == 0 and array.size(position_ids) == 0:
    building_paused_need_tp2 = false
```

---

## Example Flows

### Flow 1: Add-On Fails, Then TP2 Resumes
```
Entry 1 @ $50,000
  ↓ TP1 @ $49,000 [+1R] ✅
  ↓ Building ENABLED

Entry 2 (add) @ $49,800
  ↓ SL @ $50,800 [-1R] ❌
  ↓ ⚠️ PAUSE BUILDING (need TP2)

...Signal fires but building paused...

Entry 1 hits TP2 @ $47,500 [+2.5R] ✅
  ↓ ✅ RESUME BUILDING

Entry 3 can now open
```

**Net P&L**: +1R (TP1) - 1R (SL) + 2.5R (TP2) = +2.5R ✅

---

### Flow 2: Multiple Add-Ons Fail, One TP2 Resumes
```
Entry 1 @ $50,000
  ↓ TP1 [+1R] ✅

Entry 2 @ $49,800  
  ↓ TP1 [+1R] ✅

Entry 3 (add) @ $49,600
  ↓ SL [-1R] ❌
  ↓ ⚠️ PAUSE

(Signals fire but ignored)

Entry 1 hits TP2 [+2.5R] ✅
  ↓ ✅ RESUME

Can open Entry 4
```

**Net P&L**: +1R + 1R - 1R + 2.5R = +3.5R ✅

---

### Flow 3: All Hit Stop Before TP2
```
Entry 1 @ $50,000
  ↓ TP1 [+1R] ✅

Entry 2 (add) @ $49,800
  ↓ SL [-1R] ❌
  ↓ ⚠️ PAUSE

Entry 1 hits BE stop [+0R]
  ↓ All positions closed
  ↓ ✅ RESET (fresh start)

Next setup opens Entry 1 (fresh)
```

**Net P&L**: +1R - 1R + 0R = 0R (breakeven, stopped bleeding)

---

## Visual Feedback

### Info Panel "Building" Status:

| Display | Color | Meaning |
|---------|-------|---------|
| **ACTIVE ✓** | Lime | Can add positions |
| **PAUSED-TP2** | Orange | Waiting for TP2 after add-on SL |
| **NO BE** | Gray | No positions at breakeven yet |
| **MAX** | Gray | Max positions reached |

### Example States:
```
Building: ACTIVE ✓
→ Can add positions, all good

Building: PAUSED-TP2  
→ Add-on hit SL, need TP2 to resume

Building: NO BE
→ First position hasn't hit TP1 yet
```

---

## Key Benefits

### 1. **Prevents Compounding Losses**
Can't keep adding positions when they're failing.

### 2. **Financially Sound**
TP2 (2.5R) always covers SL (1R) with profit left over.

### 3. **Self-Regulating**
System automatically pauses and resumes based on performance.

### 4. **Protects Capital**
Since stops move to BE at TP1, maximum risk is limited.

### 5. **Maintains Opportunity**
Doesn't disable building permanently, just until proven profitable again.

---

## Risk Management Logic

### Why This Works:

**Worst Case Scenario:**
```
3 positions open, all at BE
Add-on #4 hits SL [-1R]
  ↓ PAUSE
All 3 hit BE [+0R each]
  ↓ RESET

Max loss: -1R (the add-on that failed)
```

**Best Case Scenario:**
```
3 positions open
Add-on #4 hits SL [-1R]
  ↓ PAUSE
Position 1 hits TP2 [+2.5R]
Position 2 hits TP2 [+2.5R]
Position 3 hits TP2 [+2.5R]
  ↓ RESUME

Net: -1R + 7.5R = +6.5R 🚀
```

**Typical Scenario:**
```
Entry 1: TP1 [+1R] → TP2 [+2.5R] = +3.5R total
Entry 2: SL [-1R]
  ↓ PAUSE, then Entry 1 TP2 resumes

Net: +3.5R - 1R = +2.5R ✅
```

---

## Testing Checklist

- [ ] First position opens normally
- [ ] Can add position #2 after first at BE
- [ ] Add-on hitting SL shows "PAUSED-TP2"
- [ ] Cannot add more positions while paused
- [ ] Any TP2 resumes building (shows "ACTIVE ✓")
- [ ] All positions closing resets pause
- [ ] Building status displays correctly
- [ ] No compounding losses occurring
- [ ] TP2 profits cover add-on losses

---

## Financial Examples

### Setup: $1,000 risk per position

**Scenario 1: Perfect Run**
```
Entry 1: +$1,000 (TP1) + $2,500 (TP2) = $3,500
Entry 2: +$1,000 (TP1) + $2,500 (TP2) = $3,500
Entry 3: +$1,000 (TP1) + $2,500 (TP2) = $3,500
Total: $10,500 profit 🎯
```

**Scenario 2: With Add-On Failures (Before Fix)**
```
Entry 1: +$1,000 (TP1)
Entry 2: -$1,000 (SL) ← Still building!
Entry 3: -$1,000 (SL) ← Still building!
Entry 4: -$1,000 (SL) ← Still building!
Total: -$2,000 loss 😢
```

**Scenario 3: With Add-On Failures (After Fix)**
```
Entry 1: +$1,000 (TP1) + $2,500 (TP2) = $3,500
Entry 2: -$1,000 (SL) → PAUSED
(Entry 1 TP2 covers Entry 2 SL with $1,500 extra)
Total: $2,500 profit ✅
```

---

## Summary

This fix ensures that:
1. **Position building remains safe** - Can't compound losses
2. **Financially balanced** - TP2 covers SL + profit
3. **Risk-limited** - Stops at BE after TP1
4. **Self-regulating** - Pauses/resumes automatically
5. **Clear feedback** - Status displayed in panel

The strategy now has built-in protection against compounding failures while maintaining the ability to build profitable positions! 🎯

