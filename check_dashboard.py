#!/usr/bin/env python3
"""
Quick check to see if the trading dashboard is running
"""

import requests
import time

def check_dashboard():
    """Check if the dashboard is accessible"""
    url = "http://localhost:3000"
    
    print("🔍 Checking if Trading Nexus dashboard is running...")
    
    for attempt in range(5):
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ Dashboard is running successfully at {url}")
                print("🎯 You can now access your Trading Nexus dashboard!")
                return True
        except requests.exceptions.RequestException:
            print(f"⏳ Attempt {attempt + 1}/5 - Dashboard not ready yet...")
            time.sleep(2)
    
    print("❌ Dashboard doesn't seem to be running")
    print("💡 Try running: cd trading-dashboard && npm start")
    return False

if __name__ == "__main__":
    check_dashboard()
