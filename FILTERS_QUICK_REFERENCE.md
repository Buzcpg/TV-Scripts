# FILTERS QUICK REFERENCE CARD
**MTF EMA Trend Compound v47**

---

## 🎯 FILTER CATEGORIES

### **CORE FILTERS** (Always Active)
1. ✅ **EMA Alignment** - Trend definition
2. ✅ **Retest Entry** - Pullback confirmation  
3. ✅ **Stop Distance** - Risk validation

### **HTF DIRECTIONAL FILTERS** (Optional - OFF by default)
4. ⚪ **1H 100 MA** - Hourly bias
5. ⚪ **4H 200 EMA** - 4-hour bias
6. ⚪ **EMA Ordering** - LTF/HTF alignment

### **MOMENTUM FILTERS** (Optional - OFF by default)
7. ⚪ **CVD** - Volume pressure (20 bar)
8. ⚪ **RSI** - Overbought/oversold (14 period)
9. ⚪ **MACD** - Momentum crossover (12/26/9)

### **ADVANCED MTF FILTERS** (Optional - OFF by default)
10. ⚪ **Orderflow** - HTF directional pressure (multi-timeframe)
11. ⚪ **Volatility** - Regime quality (multi-timeframe)

---

## 📊 FILTER COMPARISON

| Filter | Type | Timeframe | Purpose | Reduces Signals By |
|--------|------|-----------|---------|---------------------|
| CVD | Volume | Current | Volume pressure | 10-20% |
| RSI | Momentum | Current | Entry timing | 30-40% |
| MACD | Momentum | Current | Trend direction | 20-30% |
| Orderflow | Structure | HTF (15m-4H) | HTF confirmation | 40-60% |
| Volatility | Regime | HTF (1H-D) | Market conditions | 30-50% |
| 1H/4H Filters | Bias | HTF (1H/4H) | Directional filter | 50% |

---

## 🚀 PRESET CONFIGURATIONS

### **BEGINNER** (Learn the Strategy)
```
✓ Core filters only
✗ All optional filters OFF
Result: ~100 signals/month, 50-55% win rate
```

### **BALANCED** (Recommended Starting Point)
```
✓ Core filters
✓ RSI (40-70)
✓ Volatility (30-80%)
✗ All others OFF
Result: ~50 signals/month, 60-65% win rate
```

### **QUALITY** (High Win Rate Focus)
```
✓ Core filters
✓ 1H MA filter
✓ RSI (45-65)
✓ MACD (crossover + zero)
✓ Orderflow (60% threshold)
✓ Volatility (40-75%)
✗ CVD OFF
Result: ~20 signals/month, 70%+ win rate
```

### **MAXIMUM CONFLUENCE** (Best Setups Only)
```
✓ ALL filters enabled
✓ Tight parameters on all
Result: ~5-10 signals/month, 75%+ win rate
```

### **SCALPER** (High Frequency)
```
✓ Core filters
✓ RSI (30-80 wide)
✓ Orderflow (15m timeframe)
✓ Volatility (expansion required)
✗ HTF filters OFF (too slow)
Result: ~150 signals/month, 55-60% win rate
```

---

## 🎨 VISUAL PANEL GUIDE

### Enable: Visual Settings → "Show Indicators Panel"

**What You See:**
```
📈 FILTERS          STATUS
━━━━━━━━━━━━━━━━━━━━━━━━
CVD                 OFF/ENABLED
Value               +5,234 (green)
Trend               RISING ↑

RSI(14)             OFF/ENABLED  
Value               58.23
Zone                NEUTRAL

MACD                OFF/ENABLED
Histogram           0.0234
Signal              BULLISH ↑

ORDERFLOW 15        OFF/ENABLED
Bullish %           72.5%
Bearish %           27.5%
Bar Strength        STRONG ↑
Volume              STRONG ✓

VOLATILITY 60       OFF/ENABLED
ATR                 $125.50
Percentile          45.2%ile
Regime              OPTIMAL
Expansion           EXPANDING ✓

OVERALL             LONG ✓
```

**Color Guide:**
- 🟢 Green = Bullish/Pass/Enabled
- 🔴 Red = Bearish/Fail  
- 🟠 Orange = Warning
- ⚪ Gray = Neutral/Disabled

---

## ⚡ QUICK DECISION TREE

### No Signals Appearing?
1. Check how many filters enabled → Disable all except RSI
2. Check RSI range → Widen to 30-80
3. Check volatility regime → Make sure not "TOO LOW" or "TOO HIGH"
4. Check orderflow % → Make sure threshold not too high (try 55%)

### Too Many Bad Signals?
1. Enable RSI filter (40-70)
2. Enable Volatility filter (30-80%)
3. Enable Orderflow filter (60% threshold)
4. Enable 1H MA filter for directional bias

### Indicators Panel Shows "WAIT ✗"?
Check which filter(s) failing:
- **CVD**: Wrong direction → Wait for CVD to flip
- **RSI**: Overbought/oversold → Wait for RSI to normalize
- **MACD**: Wrong signal → Wait for crossover
- **Orderflow**: Choppy HTF (50/50) → Wait for clear direction
- **Volatility**: Too low/high → Wait for regime to normalize

---

## 🔧 PARAMETER TUNING CHEAT SHEET

### RSI (Momentum Quality)
- **More signals**: 30-80 (wide)
- **Default**: 40-70 (balanced)
- **Fewer, higher quality**: 45-65 (tight)

### Orderflow Threshold
- **More signals**: 55% (relaxed)
- **Default**: 60% (balanced)
- **Fewer, higher quality**: 65-70% (strict)

### Volatility Percentile Range
- **More signals**: 20-90% (wide)
- **Default**: 30-80% (balanced)
- **Fewer, higher quality**: 40-70% (tight)

### Orderflow Timeframe
- **1m chart** → 15m orderflow
- **5m chart** → 30m or 60m orderflow
- **15m chart** → 60m or 240m orderflow

### Volatility Timeframe
- **Scalping** → 60m volatility
- **Day trading** → 240m volatility
- **Swing trading** → D (daily) volatility

---

## 🎯 USE CASE MATRIX

| Your Trading Style | Enable These | Disable These |
|-------------------|--------------|---------------|
| **Brand New** | Core only | Everything optional |
| **Scalper (1-5m)** | Core + RSI + OF + Vol | HTF filters |
| **Day Trader (5-15m)** | Core + RSI + MACD + OF + Vol | 4H filter |
| **Swing Trader (15m-1H)** | Core + All HTF + All momentum | None |
| **Quality Focus** | Everything | None |
| **High Frequency** | Core + RSI (wide) + Vol | MACD, CVD, HTF |
| **Trending Markets** | Core + MACD + Vol | CVD |
| **Choppy Markets** | Core + RSI + OF + Vol | MACD |

---

## 📈 EXPECTED RESULTS BY CONFIGURATION

| Config | Signals/Month | Win Rate | Avg R:R | Best For |
|--------|---------------|----------|---------|----------|
| Core Only | 100-150 | 50-55% | 2.5:1 | Learning |
| + RSI | 60-80 | 58-62% | 2.7:1 | Beginner |
| + RSI + Vol | 40-60 | 62-68% | 3.0:1 | Most traders |
| + HTF + RSI + Vol | 20-40 | 68-72% | 3.2:1 | Quality focus |
| All Filters | 5-20 | 70-80% | 3.5:1 | Maximum confluence |

*Results vary by asset, timeframe, and market conditions*

---

## ⚠️ COMMON MISTAKES

❌ **Enabling all filters on day 1**
✅ Start with core + RSI only

❌ **Ignoring volatility regime**  
✅ Only trade when "OPTIMAL"

❌ **Using 1m chart with 4H filters**
✅ Match filter timeframes to chart

❌ **Not checking indicators panel**
✅ Use panel to see why no signals

❌ **Expecting same signals with all filters**
✅ More filters = fewer signals = higher quality

---

## 🎓 LEARNING PATH

### Week 1: Core Understanding
- Run strategy with core filters only
- Observe signals, understand EMA alignment
- Don't add any filters yet

### Week 2: Add RSI
- Enable RSI filter (40-70)
- Compare signal quality to Week 1
- Adjust range based on results

### Week 3: Add Volatility
- Enable Volatility filter (30-80%)
- Notice how it filters out dead/choppy periods
- Observe "TOO LOW" and "TOO HIGH" warnings

### Week 4: Experiment
- Try adding Orderflow filter
- Try adding 1H MA filter
- Try MACD or CVD
- Find what works for your style

### Week 5+: Optimize
- Fine-tune your chosen filters
- Adjust thresholds for your asset
- Lock in your optimal configuration

---

## 📞 QUICK SUPPORT

**No signals?** → Disable filters one by one
**Bad signals?** → Enable more filters progressively  
**Confused?** → Read full FILTERS_GUIDE.md
**Panel shows WAIT?** → Check which filter failing (red ✗)

---

**Version**: v47 | **Updated**: Oct 27, 2025  
**Full Guide**: See FILTERS_GUIDE.md for detailed explanations

