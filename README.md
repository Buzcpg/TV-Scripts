# Trading Nexus Dashboard

🚀 **Advanced Trading Performance Analytics Platform**

## 🚀 Quick Start

### Option 1: Use the Startup Scripts (Recommended)
- **Windows**: Double-click `start_dashboard.bat`
- **PowerShell**: Right-click `start_dashboard.ps1` → "Run with PowerShell"

### Option 2: Manual Start
```bash
cd trading-dashboard
npm start
```

### Option 3: Command Line
```bash
# Navigate to project directory
cd E:\busby\Pinescript

# Start the dashboard
cd trading-dashboard && npm start
```

**The dashboard will automatically open at: `http://localhost:3000`**

> ⚡ **Pro Tip**: The site runs in the background - you can keep using your terminal while it's running!

## 🎯 Features

✅ **Real-time Trading Analytics**
- Net P&L tracking across multiple brokers
- Win rate and performance metrics
- Position history with durations
- Top trading assets analysis

✅ **Multi-Broker Support**
- Blofin (CSV)
- Edgex (CSV) 
- Breakout (PDF)

✅ **Cyberpunk UI**
- Dark mode with neon accents
- Responsive design
- Real-time data updates

## 📊 Data Processing

To update your trading data:

1. **Add new export files** to the respective broker folders:
   - `account statements/blofin/`
   - `account statements/edgex/`
   - `account statements/breakout/`

2. **Run the data processor**:
   ```bash
   python trading_performance_analyzer.py
   ```

3. **Convert to dashboard format**:
   ```bash
   python data_converter.py
   ```

4. **Refresh your browser** - the dashboard will load the new data automatically

## 🔧 Troubleshooting

### "npm start fails immediately"
- Make sure you're in the `trading-dashboard` directory
- Use the provided startup scripts
- If issues persist, delete `node_modules` and `package-lock.json`, then run `npm install`

### "Dashboard won't load data"
- Ensure `trading_performance_report.xlsx` exists in the main directory
- Run `python data_converter.py` to regenerate the JSON files
- Check browser console for any fetch errors

### "Build errors"
- The dashboard uses pure CSS (no Tailwind) to avoid build conflicts
- If you see PostCSS errors, ensure no Tailwind config files exist

## 📁 Project Structure

```
E:\busby\Pinescript\
├── start_dashboard.bat          # Windows startup script
├── start_dashboard.ps1          # PowerShell startup script
├── trading_performance_analyzer.py  # Main data processor
├── data_converter.py            # JSON converter for dashboard
├── account statements/          # Broker export files
│   ├── blofin/
│   ├── edgex/
│   └── breakout/
└── trading-dashboard/           # React application
    ├── public/data/            # Dashboard data files
    ├── src/                    # React source code
    └── package.json           # Dependencies
```

## 🎮 Next Steps

The dashboard is ready for:
- 📈 Interactive charts and visualizations
- 🔍 Advanced filtering and sorting
- 📝 Manual trade logging with comments
- 📱 Mobile responsive enhancements

---

**Trading Nexus v1.0.0** - Your Trading Performance Command Center ⚡
