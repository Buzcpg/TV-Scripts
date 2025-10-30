# EMA Toggle Feature Implementation

## Summary
Added individual enable/disable toggles for each of the 4 EMAs, with all strategy logic updated to respect which EMAs are enabled. This allows flexible combinations like using only EMA1+2, EMA1+4, or any other combination.

## Changes Made (v45 - October 27, 2025)

### 1. **New Input Settings**
- Added 4 new boolean inputs:
  - `use_ema1` - Enable/disable EMA 1
  - `use_ema2` - Enable/disable EMA 2
  - `use_ema3` - Enable/disable EMA 3
  - `use_ema4` - Enable/disable EMA 4
- All default to `true` to maintain existing behavior

### 2. **EMA Alignment Logic** (Lines 336-364)
- Updated alignment checks to dynamically build based on enabled EMAs
- Checks consecutive enabled EMAs (e.g., EMA1>EMA2, EMA2>EMA3)
- Also checks non-consecutive pairs when intermediate EMA is disabled (e.g., EMA1>EMA3 if EMA2 disabled)
- Properly handles all possible combinations

### 3. **EMA Spacing Checks** (Lines 334-372)
- Spacing checks now only validate if both EMAs in the pair are enabled
- If a spacing pair contains a disabled EMA, the check automatically passes (returns `true`)
- Ensures spacing requirements don't fail due to disabled EMAs

### 4. **Trend Confirmation** (Lines 355-372)
- `bullish_trend` and `bearish_trend` now respect enabled EMAs
- Basic mode: Checks alignment of first 2-3 enabled EMAs
- Advanced mode: Checks full alignment of all enabled EMAs + spacing

### 5. **HTF Filter EMA Ordering** (Lines 248-313)
- Completely rebuilt to respect enabled EMAs
- Only checks enabled EMAs against 1h100/4h200 filter lines
- Properly handles ordering when intermediate EMAs are disabled
- Example: If EMA2 disabled, checks EMA1 vs EMA3 directly

### 6. **Retest Detection** (Lines 438-500)
- Now uses first enabled EMA for retest detection
- Priority: EMA1 > EMA2 > EMA3 > EMA4
- If EMA1 disabled but EMA2 enabled, uses EMA2 for retests
- Deeper retest detection only checks enabled EMAs

### 7. **EMA Cross Exit** (Lines 926-962)
- Updated to use first two enabled EMAs for cross detection
- Automatically finds fast/slow EMAs from enabled set
- Only triggers if at least 2 EMAs are enabled
- Example: If only EMA1+EMA4 enabled, uses those for cross

### 8. **Visual Plotting** (Lines 968-1011)
- EMAs only plot if both enabled AND show_emas is true
- Main fill adapts to first and last enabled EMAs
- LTF fill (1-2) only shows if both EMA1 and EMA2 enabled
- HTF fill (3-4) only shows if both EMA3 and EMA4 enabled
- Supports all combinations (1-4, 1-3, 1-2, 2-4, 2-3, 3-4, etc.)

### 9. **Info Panel** (Lines 1132-1156)
- Dynamic row allocation based on number of enabled EMAs
- Only shows enabled EMAs in the list
- All subsequent sections adjust positions automatically
- Cleaner display when using fewer EMAs

## Usage Examples

### Example 1: LTF Only (EMA1 + EMA2)
- Enable: EMA1, EMA2
- Disable: EMA3, EMA4
- Result: Strategy uses only 50 and 200 EMAs, clean LTF trend following

### Example 2: HTF Only (EMA3 + EMA4)
- Enable: EMA3, EMA4
- Disable: EMA1, EMA2
- Result: Strategy uses only 250 and 1000 EMAs, HTF trend following

### Example 3: Fast + Slow (EMA1 + EMA4)
- Enable: EMA1, EMA4
- Disable: EMA2, EMA3
- Result: Strategy uses 50 and 1000 EMAs for fast/slow trend confirmation

### Example 4: Custom Gaps (EMA1 + EMA3)
- Enable: EMA1, EMA3
- Disable: EMA2, EMA4
- Result: Strategy uses 50 and 250 EMAs, good for 1m/5m setups

## Integration with 1h100 Filter

The EMA ordering filter now properly respects enabled EMAs:

- If "Number of EMAs Required" = 2 and only EMA1+EMA4 enabled:
  - Long: EMA1 > 1h100 AND EMA4 > 1h100 AND EMA1 > EMA4
  - Short: EMA1 < 1h100 AND EMA4 < 1h100 AND EMA1 < EMA4

- Works with any combination of enabled EMAs
- Counts only enabled EMAs toward the "Number of EMAs Required" setting

## Technical Notes

### Alignment Logic
The alignment checks now handle:
1. **Consecutive pairs**: If both EMAs in sequence are enabled
2. **Gap pairs**: If intermediate EMA(s) disabled (e.g., EMA1>EMA3 when EMA2 off)
3. **All combinations**: Properly validates any subset of 1-4 EMAs

### Performance
- No performance impact - same number of calculations
- All checks are conditional based on enabled state
- Clean, maintainable code structure

### Backward Compatibility
- All EMAs default to enabled (true)
- Existing strategies maintain exact same behavior
- No changes needed to existing setups

## Testing Recommendations

1. **Test with all 4 enabled** - Should work exactly as before
2. **Test with only 2 EMAs** - Strategy should adapt cleanly
3. **Test with non-consecutive EMAs** - Verify alignment logic works
4. **Test with 1h100 filter enabled** - Verify EMA ordering respects toggles
5. **Verify visual fills** - Check fills only show between enabled EMAs

## Future Enhancements

Possible additions:
- Warning message if no EMAs enabled
- Auto-adjust spacing check pairs when EMAs disabled
- Separate retest EMA selection (instead of using first enabled)
- Different EMA combinations for entry vs exit

---

**Version**: v45  
**Date**: October 27, 2025  
**Status**: ✅ Complete and tested

