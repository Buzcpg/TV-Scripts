# EMA Toggle Feature - Testing Checklist

## Quick Test Scenarios

### ✅ Test 1: All EMAs Enabled (Default)
**Setup**: EMA1=ON, EMA2=ON, EMA3=ON, EMA4=ON
**Expected**: Should work exactly as before, no changes in behavior
- [ ] All 4 EMAs visible on chart
- [ ] All 4 EMAs shown in info panel
- [ ] Fills work correctly (1-4, 1-2, 3-4)
- [ ] Entries trigger normally
- [ ] EMA cross exit uses EMA1 vs EMA2

### ✅ Test 2: LTF Only (EMA1 + EMA2)
**Setup**: EMA1=ON, EMA2=ON, EMA3=OFF, EMA4=OFF
**Expected**: Strategy uses only 50 and 200 EMAs
- [ ] Only EMA1 and EMA2 visible
- [ ] Only 2 EMAs in info panel
- [ ] Alignment checks EMA1 > EMA2 only
- [ ] Retest uses EMA1
- [ ] EMA cross exit uses EMA1 vs EMA2
- [ ] Main fill shows between EMA1-EMA2
- [ ] Spacing checks work (if set to EMA1-EMA2)

### ✅ Test 3: HTF Only (EMA3 + EMA4)
**Setup**: EMA1=OFF, EMA2=OFF, EMA3=ON, EMA4=ON
**Expected**: Strategy uses only 250 and 1000 EMAs
- [ ] Only EMA3 and EMA4 visible
- [ ] Only 2 EMAs in info panel
- [ ] Alignment checks EMA3 > EMA4 only
- [ ] Retest uses EMA3 (first enabled)
- [ ] EMA cross exit uses EMA3 vs EMA4
- [ ] Main fill shows between EMA3-EMA4

### ✅ Test 4: Fast + Slow (EMA1 + EMA4)
**Setup**: EMA1=ON, EMA2=OFF, EMA3=OFF, EMA4=ON
**Expected**: Wide gap between fast and slow EMAs
- [ ] Only EMA1 and EMA4 visible
- [ ] Only 2 EMAs in info panel
- [ ] Alignment checks EMA1 > EMA4 (direct comparison)
- [ ] Retest uses EMA1
- [ ] EMA cross exit uses EMA1 vs EMA4
- [ ] Main fill shows between EMA1-EMA4

### ✅ Test 5: Skip Middle (EMA1 + EMA3)
**Setup**: EMA1=ON, EMA2=OFF, EMA3=ON, EMA4=OFF
**Expected**: Good for 1m/5m setups (50 + 250)
- [ ] Only EMA1 and EMA3 visible
- [ ] Only 2 EMAs in info panel
- [ ] Alignment checks EMA1 > EMA3 (skips EMA2)
- [ ] Retest uses EMA1
- [ ] EMA cross exit uses EMA1 vs EMA3
- [ ] Main fill shows between EMA1-EMA3

### ✅ Test 6: Three EMAs (EMA1 + EMA2 + EMA4)
**Setup**: EMA1=ON, EMA2=ON, EMA3=OFF, EMA4=ON
**Expected**: LTF pair + HTF anchor
- [ ] EMA1, EMA2, EMA4 visible
- [ ] 3 EMAs in info panel
- [ ] Alignment checks: EMA1>EMA2 AND EMA2>EMA4 (skips EMA3)
- [ ] Retest uses EMA1
- [ ] EMA cross exit uses EMA1 vs EMA2
- [ ] Main fill shows between EMA1-EMA4

## HTF Filter Integration Tests

### ✅ Test 7: EMA1+EMA4 with 1h100 Filter
**Setup**: 
- EMA1=ON, EMA2=OFF, EMA3=OFF, EMA4=ON
- 1H 100 MA Filter = ENABLED
- EMA Ordering Filter = ENABLED
- Number of EMAs Required = 2

**Expected for LONGS**:
- [ ] EMA1 > 1h100
- [ ] EMA4 > 1h100
- [ ] EMA1 > EMA4
- [ ] Entry allowed when all conditions met

**Expected for SHORTS**:
- [ ] EMA1 < 1h100
- [ ] EMA4 < 1h100
- [ ] EMA1 < EMA4 (impossible, so no shorts)
- [ ] This is correct - can't short when fast EMA below slow EMA

### ✅ Test 8: EMA1+EMA2 with 1h100 Filter
**Setup**: 
- EMA1=ON, EMA2=ON, EMA3=OFF, EMA4=OFF
- 1H 100 MA Filter = ENABLED
- EMA Ordering Filter = ENABLED
- Number of EMAs Required = 2

**Expected for LONGS**:
- [ ] EMA1 > 1h100
- [ ] EMA2 > 1h100
- [ ] EMA1 > EMA2
- [ ] Allows entries above 1h100 with proper alignment

### ✅ Test 9: Only 1 EMA with 1h100 Filter
**Setup**: 
- EMA1=ON, EMA2=OFF, EMA3=OFF, EMA4=OFF
- 1H 100 MA Filter = ENABLED
- EMA Ordering Filter = ENABLED
- Number of EMAs Required = 1

**Expected**:
- [ ] Only checks EMA1 vs 1h100
- [ ] Allows entries when EMA1 above/below 1h100
- [ ] No cross exit (needs 2 EMAs)

## Visual Tests

### ✅ Test 10: Fill Behavior
Test each combination to verify fills:
- [ ] All 4 EMAs: Main fill 1-4, LTF fill 1-2, HTF fill 3-4
- [ ] EMA1+2: Main fill 1-2, LTF fill 1-2, no HTF fill
- [ ] EMA3+4: Main fill 3-4, no LTF fill, HTF fill 3-4
- [ ] EMA1+4: Main fill 1-4, no LTF fill, no HTF fill
- [ ] EMA1+3: Main fill 1-3, no LTF fill, no HTF fill
- [ ] EMA2+4: Main fill 2-4, no LTF fill, no HTF fill

## Spacing Check Tests

### ✅ Test 11: Spacing with Disabled EMAs
**Setup**: 
- EMA1=ON, EMA2=OFF, EMA3=ON, EMA4=ON
- Spacing Check 1: EMA1 to EMA2, Min 0.1%
- Spacing Check 2: EMA3 to EMA4, Min 0.1%

**Expected**:
- [ ] Spacing Check 1 auto-passes (EMA2 disabled)
- [ ] Spacing Check 2 validates normally (both enabled)
- [ ] Entries allowed if Spacing 2 requirement met

### ✅ Test 12: Both Spacing Checks Disabled Pairs
**Setup**: 
- EMA1=ON, EMA2=OFF, EMA3=OFF, EMA4=ON
- Spacing Check 1: EMA1 to EMA2, Min 0.1% (EMA2 disabled)
- Spacing Check 2: EMA3 to EMA4, Min 0.1% (EMA3 disabled)

**Expected**:
- [ ] Both spacing checks auto-pass
- [ ] Only alignment check matters for entries

## Edge Cases

### ✅ Test 13: Single EMA Only
**Setup**: Only EMA1=ON, all others OFF
**Expected**:
- [ ] Strategy should still work but with limited functionality
- [ ] No cross exits (needs 2 EMAs)
- [ ] Retest uses EMA1
- [ ] Alignment always passes (only 1 EMA)

### ✅ Test 14: No EMAs Enabled
**Setup**: All EMAs OFF
**Expected**:
- [ ] No entries trigger (no trend confirmation possible)
- [ ] No visual EMAs shown
- [ ] No crashes or errors

### ✅ Test 15: Rapid Toggle Changes
**Setup**: Change toggles between bars
**Expected**:
- [ ] Chart updates correctly
- [ ] No orphaned fills or lines
- [ ] Info panel adjusts dynamically

## Performance Tests

### ✅ Test 16: Chart Load Speed
- [ ] No noticeable slowdown with any combination
- [ ] Same performance with 1 EMA vs 4 EMAs

### ✅ Test 17: Historical Data
- [ ] All combinations work on historical bars
- [ ] Entries/exits trigger correctly in backtest
- [ ] Trade boxes display properly

## Documentation Verification

### ✅ Test 18: Tooltips and Help
- [ ] All new toggle inputs have clear tooltips
- [ ] Updated "Require All EMAs Aligned" tooltip
- [ ] Settings make sense to users

---

## Quick Test Command (TradingView)

1. Load mtf_ema_trend_compound.pine
2. Add to chart
3. Open Settings
4. Go to "EMA Settings" section
5. Toggle EMAs on/off as per test scenarios
6. Verify behavior matches expected results

---

**Status**: Ready for testing  
**Priority**: High - Core functionality change  
**Risk**: Low - Backward compatible (all default ON)

