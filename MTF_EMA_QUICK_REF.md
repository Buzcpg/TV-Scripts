# MTF EMA Trend Strategy - Quick Reference Card

## 🎯 Entry Signals

### LONG (Bullish)
```
✓ EMA50 > EMA200 > HTF_EMA50 > HTF_EMA200
✓ Price retests EMA50 and crosses back ABOVE
✓ Valid pivot low for stop-loss
✓ No position OR existing position at breakeven
```

### SHORT (Bearish)
```
✓ EMA50 < EMA200 < HTF_EMA50 < HTF_EMA200
✓ Price retests EMA50 and crosses back BELOW
✓ Valid pivot high for stop-loss
✓ No position OR existing position at breakeven
```

---

## ⚙️ Recommended Settings

### Conservative (Beginner)
| Setting | Value |
|---------|-------|
| Base Risk | $500 or 0.5% |
| Max Risk | $1,000 or 1% |
| Leverage | 3x - 5x |
| Max Positions | 2 |
| Pause After Losses | 2 |
| Require Deeper Retest | ✓ Yes |

### Moderate (Intermediate)
| Setting | Value |
|---------|-------|
| Base Risk | $1,000 or 1% |
| Max Risk | $2,000 or 2% |
| Leverage | 5x - 10x |
| Max Positions | 3 |
| Pause After Losses | 2 |
| Require Deeper Retest | ✓ Yes |

### Aggressive (Advanced)
| Setting | Value |
|---------|-------|
| Base Risk | $2,000 or 2% |
| Max Risk | $4,000 or 4% |
| Leverage | 10x - 20x |
| Max Positions | 4 |
| Pause After Losses | 3 |
| Require Deeper Retest | Optional |

---

## 📊 Timeframe Combinations

| Chart TF | HTF Setting | EMA Periods | Trading Style |
|----------|-------------|-------------|---------------|
| 1 min | 5 min | 50, 200, 250, 1000 | Scalping |
| 5 min | 15 min | 50, 200, 150, 600 | Day Trading |
| 15 min | 1 hour | 50, 200, 200, 800 | Swing Trading |
| 1 hour | 4 hour | 50, 200, 200, 800 | Position Trading |

---

## 💰 Position Management

### First Position
```
Entry: When all EMAs aligned + retest
Size: Based on risk amount / distance to stop
Stop: Pivot low/high
Target 1: 2:1 RR → Close 50%
Target 2: 5:1 RR → Close remaining
Move Stop: To breakeven after partial
```

### Additional Positions (Pyramiding)
```
Requirement: First position at breakeven
Entry: New retest of EMA50 (or deeper EMA if required)
Size: Same risk calculation as first trade
Benefit: Effectively $0 risk on the trend
Max: 2-4 positions depending on settings
```

---

## 🎯 Profit Targets

### Standard Setup
| Target | Action | % of Position |
|--------|--------|---------------|
| 2:1 RR | Partial Profit | 50% |
| Move Stop | To Breakeven | All remaining |
| 5:1 RR | Final Target | Remaining 50% |

### Risk-Reward Calculation
```
Entry: $50,000
Stop:  $49,800
Risk:  $200

Partial Target (2:1): $50,000 + ($200 × 2) = $50,400
Main Target (5:1):    $50,000 + ($200 × 5) = $51,000
```

---

## 📈 Compounding Rules

### Win Streak Scaling
```
Wins < 3:  Use Base Risk ($1,000)
Wins ≥ 3:  Use Max Risk ($2,000)
```

### Profit-Based Scaling
```
If: Cumulative profit in trend > 0
And: Price tests deeper EMAs (200, HTF50, HTF200)
Then: Risk × 1.5

Example: $2,000 × 1.5 = $3,000
```

---

## ⚠️ Loss Management

### Pause Rules
```
After 2 consecutive losses: PAUSE trading
Resume: After next successful setup
Visual: ⏸ symbol on chart
```

### Loss Tracking
```
✓ Win → Reset loss counter → Add to win streak
✗ Loss → Reset win counter → Add to loss streak
```

---

## 📊 Visual Guide

### EMA Colors
| EMA | Color | Description |
|-----|-------|-------------|
| 50 | 🟡 Yellow | Entry signal line |
| 200 | 🟠 Orange | Primary trend filter |
| HTF 50 | 🔵 Blue | Secondary trend filter |
| HTF 200 | 🟣 Purple | Overall trend confirmation |

### Entry Signals
| Symbol | Meaning |
|--------|---------|
| 🟢 "LONG" | New long entry |
| 🔴 "SHORT" | New short entry |
| 🟢 "+" | Add to long position |
| 🔴 "+" | Add to short position |
| ⏸ | Trading paused |

### Stop & Targets
| Line Style | Color | Meaning |
|------------|-------|---------|
| ❌ Cross | Red | Original stop-loss |
| ❌ Cross | Yellow | Breakeven stop |
| ⭕ Circles | Aqua | Partial target (2:1) |
| ⭕ Circles | Lime | Main target (5:1) |

---

## 🔍 Info Panel Indicators

### Key Status Checks
```
Trend:         BULLISH ↑ / BEARISH ↓ / NEUTRAL ─
Positions:     X/3 (current/max)
Current P&L:   +$XXX or -$XXX
Partial Taken: YES ✓ / NO
Stop at BE:    YES ✓ / NO
Can Add Pos:   YES ✓ / NO
Win Streak:    X
Loss Streak:   X
Trading:       ACTIVE / PAUSED
```

---

## ✅ Pre-Trade Checklist

Before entering a trade, verify:

- [ ] All 4 EMAs are properly aligned
- [ ] EMAs have adequate spacing (not bunched)
- [ ] Price clearly retested EMA50
- [ ] Price crossed back through EMA50
- [ ] Valid pivot point exists for stop
- [ ] Not currently trading paused
- [ ] If adding position: first position at BE
- [ ] Risk amount is appropriate
- [ ] Stop loss distance is reasonable (<10% from entry)

---

## 🚨 Common Mistakes to Avoid

❌ **DON'T:**
- Enter without full EMA alignment
- Add positions before breakeven
- Exceed max position count
- Override the pause after losses
- Use excessive leverage
- Enter during EMA crosses/chop
- Ignore the stop-loss
- Take full position off at 2:1 (keep 50%)

✅ **DO:**
- Wait for clean retests
- Respect breakeven requirement
- Follow risk limits strictly
- Honor pause periods
- Use appropriate leverage
- Trade during clear trends
- Respect all stop-losses
- Use partial profit strategy

---

## 📱 Info Panel Quick Read

```
┌─────────────────────────┐
│ MTF EMA TREND │ STATUS  │
├─────────────────────────┤
│ Trend         │ BULLISH │ ← Current market trend
│ Positions     │ 2/3     │ ← Active/Max positions
│ Current P&L   │ +$1,250 │ ← Open position profit
│ Partial Taken │ YES ✓   │ ← Partial profit status
│ Stop at BE    │ YES ✓   │ ← Protected position
│ Can Add Pos   │ YES ✓   │ ← Ready for pyramiding
│ Current Risk  │ $1,000  │ ← Next trade risk
│ Win Streak    │ 2       │ ← Consecutive wins
│ Loss Streak   │ 0       │ ← Consecutive losses
│ Trading       │ ACTIVE  │ ← System status
└─────────────────────────┘
```

---

## 🎓 Trade Example (Short Version)

### Setup
- Account: $100,000, Leverage: 5x, Risk: $1,000

### Trade 1
```
Entry:   $50,000
Stop:    $49,800 (pivot low)
Risk:    $200 per unit
Size:    5 units
2:1:     $50,400 → Close 2.5 units → $1,000 profit
BE:      Stop moves to $50,000
5:1:     $51,000 → Close 2.5 units → $2,500 profit
Total:   $2,500 profit
```

### Trade 2 (Add-On)
```
Entry:   $50,300 (while Trade 1 at BE)
Stop:    $50,100
Size:    5 units
Risk:    $0 effective (Trade 1 protected)
Result:  Additional $2,500 potential
```

---

## ⚡ Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| No trades | Check EMA alignment, spacing, and retests |
| Too many losses | Increase confirmation requirements |
| Not adding positions | Check if first position reached BE |
| Trading paused | Wait for next clean setup (auto-resumes) |
| Risk too high | Reduce risk % or leverage |
| Stops too wide | Adjust pivot settings or use closer EMAs |

---

## 🎯 Key Numbers to Remember

```
📊 EMA Periods: 50, 200
🎯 Partial Target: 2:1 RR (50% off)
🎯 Main Target: 5:1 RR (remaining)
📈 Base Risk: 1% or $1,000
📈 Max Risk: 2% or $2,000
🔢 Scale-Up Threshold: 3 wins
⏸ Pause Threshold: 2 losses
🏗️ Max Positions: 2-3
⚖️ Leverage: 5x-10x
🎲 Pivot Settings: 5,2
```

---

## 💡 Pro Tips

1. **Wait for Confirmation**: Better to miss a trade than force a bad entry
2. **Protect Capital First**: Use conservative risk until proven
3. **Trust the Breakeven**: It's there to allow safe pyramiding
4. **Respect Pauses**: They prevent emotional trading
5. **Use Deeper Retests**: Best add-on entries test EMA200 or deeper
6. **Scale Gradually**: Let win streaks prove themselves
7. **Monitor Leverage**: Never exceed your max notional
8. **Keep Records**: Track what works in your conditions

---

**Remember: This is a TREND strategy. It needs TRENDS to work. Don't force it in choppy markets!** 📈

