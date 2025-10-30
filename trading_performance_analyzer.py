#!/usr/bin/env python3
"""
Trading Performance Analyzer
Consolidates trading data from multiple brokers (Blofin, Edgex, Breakout) into a unified Excel report.

🔥 KEY FEATURES:
- Smart Deduplication: Automatically detects and skips duplicate transactions
- Auto-Discovery: Automatically finds and processes all files in broker folders
- Multi-File Support: Process multiple exports from each broker seamlessly
- Position Reconciliation: Groups related trades into complete positions
- Time Analytics: Performance analysis by day, hour, weekend vs weekday
- Coin Analytics: Comprehensive per-asset performance breakdown

📁 USAGE FOR REGULAR UPDATES:
1. Download new statements from your brokers
2. Save them in the respective folders:
   - Blofin CSV files → account statements/blofin/
   - Edgex CSV files → account statements/edgex/
   - Breakout PDF files → account statements/breakout/
3. Run: python trading_performance_analyzer.py
   (No need to manually update file lists - auto-discovery handles it!)

💡 DEDUPLICATION LOGIC:
- Blofin: Order Time + Asset + Side + Price + Quantity + Fee
- Edgex: Order Time + Asset + Entry/Exit Prices + Quantity + PNL
- Breakout: Unique Transaction ID (most reliable)

🎯 HANDLES OVERLAPPING PERIODS:
- Open trades in one file, closed in another ✅
- Same-day downloads with partial overlaps ✅
- Multiple partial exports combined safely ✅
"""

import pandas as pd
import numpy as np
import pdfplumber
import re
import os
import glob
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class TradingDataProcessor:
    def __init__(self):
        self.blofin_data = None
        self.edgex_data = None
        self.breakout_data = None
        self.consolidated_data = None
        self.processed_transactions = set()  # Track processed transaction fingerprints
    
    def _create_transaction_fingerprint(self, broker: str, **kwargs) -> str:
        """Create a unique fingerprint for a transaction to detect duplicates"""
        if broker == 'Blofin':
            # Use Order Time + Asset + Side + Price + Quantity + Fee
            return f"blofin_{kwargs.get('order_time')}_{kwargs.get('asset')}_{kwargs.get('side')}_{kwargs.get('price')}_{kwargs.get('quantity')}_{kwargs.get('fee')}"
        elif broker == 'Edgex':
            # Use Order time + Asset + Entry Price + Exit Price + Quantity + PNL
            return f"edgex_{kwargs.get('order_time')}_{kwargs.get('asset')}_{kwargs.get('entry_price')}_{kwargs.get('exit_price')}_{kwargs.get('quantity')}_{kwargs.get('pnl')}"
        elif broker == 'Breakout':
            # Use Transaction ID which is unique
            return f"breakout_{kwargs.get('transaction_id')}"
        else:
            # Generic fallback
            return f"{broker}_{kwargs.get('date')}_{kwargs.get('asset')}_{kwargs.get('side')}_{kwargs.get('price')}_{kwargs.get('quantity')}"
    
    def _is_duplicate_transaction(self, fingerprint: str) -> bool:
        """Check if transaction fingerprint already exists"""
        if fingerprint in self.processed_transactions:
            return True
        self.processed_transactions.add(fingerprint)
        return False
        
    def parse_blofin_data(self, file_path: str) -> pd.DataFrame:
        """Parse Blofin CSV data"""
        print(f"📊 Processing Blofin data from: {file_path}")
        
        try:
            df = pd.read_csv(file_path)
            
            # Normalize column names and create standardized format
            normalized_data = []
            duplicates_found = 0
            
            for _, row in df.iterrows():
                # Extract relevant information
                asset = row['Underlying Asset']
                side = row['Side']
                price = self._extract_numeric(str(row['Avg Fill']))
                size = self._extract_numeric(str(row['Filled']))
                pnl = self._parse_pnl(str(row['PNL']))
                fee = self._extract_numeric(str(row['Fee']))
                order_time = pd.to_datetime(row['Order Time'], format='%m/%d/%Y %H:%M:%S')
                
                # Create transaction fingerprint for deduplication
                fingerprint = self._create_transaction_fingerprint(
                    broker='Blofin',
                    order_time=order_time.isoformat(),
                    asset=asset,
                    side=side,
                    price=price,
                    quantity=size,
                    fee=fee
                )
                
                # Check for duplicates
                if self._is_duplicate_transaction(fingerprint):
                    duplicates_found += 1
                    continue
                
                # Determine if this is entry or exit
                is_reduce_only = str(row['Reduce-only']).upper() == 'Y'
                trade_type = 'Exit' if is_reduce_only else 'Entry'
                
                normalized_data.append({
                    'Broker': 'Blofin',
                    'Asset': asset,
                    'Date': order_time,
                    'Side': self._normalize_side(side),
                    'Type': trade_type,
                    'Quantity': size,
                    'Price': price,
                    'PNL': pnl,
                    'Fee': fee,
                    'Leverage': row['Leverage'],
                    'Order_Options': row['Order Options']
                })
            
            df_normalized = pd.DataFrame(normalized_data)
            if duplicates_found > 0:
                print(f"✅ Blofin: Processed {len(df_normalized)} transactions ({duplicates_found} duplicates skipped)")
            else:
                print(f"✅ Blofin: Processed {len(df_normalized)} transactions")
            return df_normalized
            
        except Exception as e:
            print(f"❌ Error processing Blofin data: {e}")
            return pd.DataFrame()
    
    def parse_edgex_data(self, file_path: str) -> pd.DataFrame:
        """Parse Edgex CSV data"""
        print(f"📊 Processing Edgex data from: {file_path}")
        
        try:
            df = pd.read_csv(file_path)
            
            # Normalize column names and create standardized format
            normalized_data = []
            duplicates_found = 0
            
            for _, row in df.iterrows():
                asset = row['Markets']
                qty_str = str(row['Qty'])
                entry_price = self._extract_numeric(str(row['Entry Price']))
                exit_price = self._extract_numeric(str(row['Exit Price']))
                trade_type = row['Trade Type']
                pnl = self._extract_numeric(str(row['Closed P&L']))
                open_fee = self._extract_numeric(str(row['Open Fee']))
                close_fee = self._extract_numeric(str(row['Close Fee']))
                total_fee = open_fee + close_fee
                order_time = pd.to_datetime(row['Order time'])
                
                # Extract quantity and unit
                quantity = self._extract_numeric(qty_str)
                
                # Create fingerprint for this complete trade (entry + exit)
                trade_fingerprint = self._create_transaction_fingerprint(
                    broker='Edgex',
                    order_time=order_time.isoformat(),
                    asset=asset,
                    entry_price=entry_price,
                    exit_price=exit_price,
                    quantity=quantity,
                    pnl=pnl
                )
                
                # Check for duplicates
                if self._is_duplicate_transaction(trade_fingerprint):
                    duplicates_found += 1
                    continue
                
                # Create entry transaction
                normalized_data.append({
                    'Broker': 'Edgex',
                    'Asset': asset,
                    'Date': order_time,
                    'Side': 'Buy' if trade_type == 'Sell' else 'Sell',  # Entry is opposite of trade type
                    'Type': 'Entry',
                    'Quantity': quantity,
                    'Price': entry_price,
                    'PNL': 0,  # Entry has no PNL
                    'Fee': open_fee,
                    'Leverage': 'Unknown',
                    'Order_Options': f"Entry for {trade_type}"
                })
                
                # Create exit transaction
                normalized_data.append({
                    'Broker': 'Edgex',
                    'Asset': asset,
                    'Date': order_time,
                    'Side': trade_type,
                    'Type': 'Exit',
                    'Quantity': quantity,
                    'Price': exit_price,
                    'PNL': pnl,
                    'Fee': close_fee,
                    'Leverage': 'Unknown',
                    'Order_Options': f"Exit - {row['Exit Type']}"
                })
            
            df_normalized = pd.DataFrame(normalized_data)
            if duplicates_found > 0:
                print(f"✅ Edgex: Processed {len(df_normalized)} transactions ({duplicates_found} duplicate trades skipped)")
            else:
                print(f"✅ Edgex: Processed {len(df_normalized)} transactions")
            return df_normalized
            
        except Exception as e:
            print(f"❌ Error processing Edgex data: {e}")
            return pd.DataFrame()
    
    def parse_breakout_pdf(self, file_path: str) -> pd.DataFrame:
        """Parse Breakout PDF data"""
        print(f"📊 Processing Breakout PDF from: {file_path}")
        
        try:
            transactions = []
            duplicates_found = 0
            
            with pdfplumber.open(file_path) as pdf:
                print(f"📄 Found {len(pdf.pages)} pages in PDF")
                
                # Start from page 2 (index 1) where transactions begin
                for page_num in range(1, len(pdf.pages)):
                    page = pdf.pages[page_num]
                    text = page.extract_text()
                    
                    if text:
                        print(f"Processing page {page_num + 1}...")
                        lines = text.split('\n')
                        
                        # Find lines that look like transaction data
                        for line in lines:
                            if self._is_breakout_transaction_line(line):
                                transaction = self._parse_breakout_transaction_line(line)
                                if transaction:
                                    transactions.append(transaction)
                                elif self._is_breakout_transaction_line(line):
                                    # Line was recognized as transaction but filtered as duplicate
                                    duplicates_found += 1
            
            if transactions:
                df_normalized = pd.DataFrame(transactions)
                if duplicates_found > 0:
                    print(f"✅ Breakout: Processed {len(df_normalized)} transactions ({duplicates_found} duplicates skipped)")
                else:
                    print(f"✅ Breakout: Processed {len(df_normalized)} transactions")
                return df_normalized
            else:
                print("⚠️ No transaction data found in PDF.")
                return pd.DataFrame()
                
        except Exception as e:
            print(f"❌ Error processing Breakout PDF: {e}")
            return pd.DataFrame()
    
    def _is_breakout_transaction_line(self, line: str) -> bool:
        """Check if a line contains Breakout transaction data"""
        # Breakout transaction lines have the format:
        # Transaction ID:subID Date Time Direction Size Symbol Price Order ID Settled PnL Commission Description
        
        # Look for the specific pattern: numbers:numbers date time Buy/Sell
        pattern = r'^\d+:\d+\s+\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}\s+(Buy|Sell)\s+'
        return bool(re.search(pattern, line))
    
    def _is_transaction_line(self, line: str) -> bool:
        """Check if a line contains transaction data (legacy method)"""
        # Look for patterns that indicate transaction data
        patterns = [
            r'\d{8,}',  # Transaction ID (8+ digits)
            r'\d{2}/\d{2}/\d{4}',  # Date pattern
            r'Buy|Sell',  # Buy/Sell indicators
            r'BTCUSD|USDT',  # Common trading pairs
        ]
        
        matches = sum(1 for pattern in patterns if re.search(pattern, line))
        return matches >= 2  # At least 2 patterns should match
    
    def _parse_breakout_transaction_line(self, line: str) -> Optional[Dict]:
        """Parse individual Breakout transaction line"""
        try:
            # Breakout format: Transaction ID Transaction Time (GMT) Direction Size Symbol Price Order ID Settled PnL Commission Description
            # Example: 20660151:4876352 16/09/2025 15:16 Buy 0.10 BTCUSD 115,092.3 278052827 9.27 4.03 —
            
            # Use regex to extract components
            pattern = r'^(\d+:\d+)\s+(\d{2}/\d{2}/\d{4})\s+(\d{2}:\d{2})\s+(Buy|Sell)\s+([\d\.]+)\s+(\w+)\s+([\d,\.]+)\s+(\d+)\s+([\d\.\-—‑]+)\s+([\d\.]+)\s*(.*)$'
            
            match = re.match(pattern, line.strip())
            if match:
                transaction_id = match.group(1)
                date_str = match.group(2)
                time_str = match.group(3)
                direction = match.group(4)
                size = match.group(5)
                symbol = match.group(6)
                price = match.group(7)
                order_id = match.group(8)
                settled_pnl = match.group(9)
                commission = match.group(10)
                description = match.group(11) if match.group(11) else ""
                
                # Create fingerprint for deduplication using unique transaction ID
                fingerprint = self._create_transaction_fingerprint(
                    broker='Breakout',
                    transaction_id=transaction_id
                )
                
                # Check for duplicates
                if self._is_duplicate_transaction(fingerprint):
                    return None  # Skip duplicate
                
                # Parse datetime
                datetime_str = f"{date_str} {time_str}"
                parsed_date = pd.to_datetime(datetime_str, format='%d/%m/%Y %H:%M')
                
                # Parse numeric values
                quantity = float(size)
                parsed_price = float(price.replace(',', ''))
                
                # Parse PNL (handle — and ‑ as zero, and convert ‑ to -)
                if settled_pnl in ['—', '-']:
                    pnl = 0.0
                else:
                    # Replace the special minus character ‑ with regular minus -
                    pnl_clean = settled_pnl.replace(',', '').replace('‑', '-')
                    pnl = float(pnl_clean)
                
                fee = float(commission)
                
                return {
                    'Broker': 'Breakout',
                    'Asset': symbol,
                    'Date': parsed_date,
                    'Side': direction,
                    'Type': 'Trade',
                    'Quantity': quantity,
                    'Price': parsed_price,
                    'PNL': pnl,
                    'Fee': fee,
                    'Leverage': '5',  # Breakout uses x5 leverage for all coins
                    'Order_Options': f"Transaction ID: {transaction_id}, Order ID: {order_id}"
                }
            
            return None
            
        except Exception as e:
            print(f"⚠️ Error parsing transaction line: {e}")
            print(f"Line: {line}")
            return None
    
    def _parse_transaction_line(self, line: str) -> Optional[Dict]:
        """Parse individual transaction line (legacy method)"""
        try:
            # This would need to be customized based on the actual PDF format
            # For now, return None as we'll use table extraction
            return None
        except:
            return None
    
    def _parse_table_data(self, table: List[List]) -> List[Dict]:
        """Parse table data from PDF"""
        transactions = []
        
        try:
            # Assume first row is header
            if len(table) < 2:
                return []
                
            header = table[0]
            
            # Look for standard transaction columns
            col_map = {}
            for i, col in enumerate(header):
                if col:
                    col_lower = str(col).lower()
                    if 'transaction' in col_lower or 'id' in col_lower:
                        col_map['id'] = i
                    elif 'time' in col_lower or 'date' in col_lower:
                        col_map['date'] = i
                    elif 'direction' in col_lower or 'side' in col_lower:
                        col_map['side'] = i
                    elif 'symbol' in col_lower:
                        col_map['symbol'] = i
                    elif 'price' in col_lower:
                        col_map['price'] = i
                    elif 'size' in col_lower or 'quantity' in col_lower:
                        col_map['size'] = i
                    elif 'pnl' in col_lower:
                        col_map['pnl'] = i
                    elif 'commission' in col_lower or 'fee' in col_lower:
                        col_map['fee'] = i
            
            # Process data rows
            for row in table[1:]:
                if len(row) > max(col_map.values()) if col_map else 0:
                    transaction = {
                        'Broker': 'Breakout',
                        'Asset': row[col_map.get('symbol', 0)] if 'symbol' in col_map else 'BTCUSD',
                        'Date': self._parse_date(row[col_map.get('date', 1)]) if 'date' in col_map else datetime.now(),
                        'Side': row[col_map.get('side', 2)] if 'side' in col_map else 'Buy',
                        'Type': 'Trade',
                        'Quantity': self._extract_numeric(str(row[col_map.get('size', 3)])) if 'size' in col_map else 0,
                        'Price': self._extract_numeric(str(row[col_map.get('price', 4)])) if 'price' in col_map else 0,
                        'PNL': self._extract_numeric(str(row[col_map.get('pnl', 5)])) if 'pnl' in col_map else 0,
                        'Fee': self._extract_numeric(str(row[col_map.get('fee', 6)])) if 'fee' in col_map else 0,
                        'Leverage': 'Unknown',
                        'Order_Options': 'PDF Extracted'
                    }
                    
                    if transaction['Price'] > 0 and transaction['Quantity'] > 0:
                        transactions.append(transaction)
                        
        except Exception as e:
            print(f"⚠️ Error parsing table data: {e}")
        
        return transactions
    
    def _create_breakout_placeholder(self) -> pd.DataFrame:
        """Create placeholder data for Breakout based on balance chart info"""
        # Based on the screenshot showing approximately 330 transactions
        # Create some sample transactions to demonstrate the structure
        placeholder_data = []
        
        # Sample transactions based on common patterns
        dates = pd.date_range(start='2025-08-01', end='2025-09-16', freq='D')
        
        for i in range(min(10, len(dates))):  # Create 10 sample transactions
            placeholder_data.extend([
                {
                    'Broker': 'Breakout',
                    'Asset': 'BTCUSD',
                    'Date': dates[i],
                    'Side': 'Buy',
                    'Type': 'Entry',
                    'Quantity': 0.01,
                    'Price': 110000 + (i * 100),
                    'PNL': 0,
                    'Fee': 4.0,
                    'Leverage': 'Unknown',
                    'Order_Options': 'Placeholder - PDF parsing needed'
                },
                {
                    'Broker': 'Breakout',
                    'Asset': 'BTCUSD',
                    'Date': dates[i] + pd.Timedelta(hours=2),
                    'Side': 'Sell',
                    'Type': 'Exit',
                    'Quantity': 0.01,
                    'Price': 110000 + (i * 100) + 50,
                    'PNL': 50,
                    'Fee': 4.0,
                    'Leverage': 'Unknown',
                    'Order_Options': 'Placeholder - PDF parsing needed'
                }
            ])
        
        return pd.DataFrame(placeholder_data)
    
    def _extract_numeric(self, value: str) -> float:
        """Extract numeric value from string"""
        if pd.isna(value) or value == '--' or value == '':
            return 0.0
        
        # Remove currency symbols and commas
        clean_value = re.sub(r'[^\d\.\-\+]', '', str(value))
        
        # Handle empty strings after cleaning
        if not clean_value or clean_value in ['-', '+']:
            return 0.0
        
        try:
            return float(clean_value)
        except:
            return 0.0
    
    def _parse_pnl(self, pnl_str: str) -> float:
        """Parse PNL value handling positive/negative indicators"""
        if pd.isna(pnl_str) or pnl_str == '--':
            return 0.0
        
        # Extract numeric value while preserving sign
        clean_pnl = re.sub(r'[^\d\.\-\+]', '', str(pnl_str))
        
        if not clean_pnl or clean_pnl in ['-', '+']:
            return 0.0
        
        try:
            return float(clean_pnl)
        except:
            return 0.0
    
    def _normalize_side(self, side: str) -> str:
        """Normalize trading side"""
        side_lower = str(side).lower()
        if 'buy' in side_lower:
            return 'Buy'
        elif 'sell' in side_lower:
            return 'Sell'
        else:
            return side
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string to datetime"""
        try:
            # Try different date formats
            formats = [
                '%m/%d/%Y %H:%M:%S',
                '%Y-%m-%d %H:%M:%S',
                '%d/%m/%Y %H:%M:%S',
                '%m/%d/%Y',
                '%Y-%m-%d'
            ]
            
            for fmt in formats:
                try:
                    return pd.to_datetime(date_str, format=fmt)
                except:
                    continue
            
            # If all else fails, use pandas to infer
            return pd.to_datetime(date_str)
        except:
            return datetime.now()
    
    def consolidate_data(self) -> pd.DataFrame:
        """Consolidate all broker data into single dataframe"""
        print("\n🔄 Consolidating all trading data...")
        
        all_data = []
        
        if self.blofin_data is not None and not self.blofin_data.empty:
            all_data.append(self.blofin_data)
        
        if self.edgex_data is not None and not self.edgex_data.empty:
            all_data.append(self.edgex_data)
        
        if self.breakout_data is not None and not self.breakout_data.empty:
            all_data.append(self.breakout_data)
        
        if all_data:
            self.consolidated_data = pd.concat(all_data, ignore_index=True)
            self.consolidated_data = self.consolidated_data.sort_values('Date', ascending=False)  # Most recent first
            print(f"✅ Consolidated {len(self.consolidated_data)} total transactions")
        else:
            print("⚠️ No data to consolidate")
            self.consolidated_data = pd.DataFrame()
        
        return self.consolidated_data
    
    def create_position_history(self) -> pd.DataFrame:
        """Create position history by grouping related trades"""
        if self.consolidated_data is None or self.consolidated_data.empty:
            return pd.DataFrame()
        
        print("\n🔄 Creating position history...")
        
        positions = []
        df = self.consolidated_data.copy()
        
        # Group by broker and asset, then sort by date
        for (broker, asset), group in df.groupby(['Broker', 'Asset']):
            group = group.sort_values('Date').reset_index(drop=True)
            
            current_position = 0
            position_trades = []
            position_start_date = None
            
            for _, trade in group.iterrows():
                if current_position == 0:
                    # Starting a new position
                    position_start_date = trade['Date']
                    position_trades = [trade]
                else:
                    position_trades.append(trade)
                
                # Update position based on trade direction
                quantity_change = trade['Quantity'] if trade['Side'] == 'Buy' else -trade['Quantity']
                current_position += quantity_change
                
                # If position is closed (back to 0), record the complete position
                if abs(current_position) < 0.0001:  # Account for floating point precision
                    if position_trades:
                        position = self._create_position_record(position_trades, broker, asset, position_start_date)
                        positions.append(position)
                    
                    current_position = 0
                    position_trades = []
                    position_start_date = None
            
            # Handle any remaining open position
            if position_trades and current_position != 0:
                position = self._create_position_record(position_trades, broker, asset, position_start_date, is_open=True)
                positions.append(position)
        
        if positions:
            positions_df = pd.DataFrame(positions)
            positions_df = positions_df.sort_values('Open Date', ascending=False)  # Most recent first
            print(f"✅ Created {len(positions_df)} position records")
            return positions_df
        else:
            return pd.DataFrame()
    
    def _create_position_record(self, trades: List, broker: str, asset: str, start_date: datetime, is_open: bool = False) -> Dict:
        """Create a single position record from multiple trades"""
        total_pnl = sum(trade['PNL'] for trade in trades)
        total_fees = sum(trade['Fee'] for trade in trades)
        net_pnl = total_pnl - total_fees
        
        # Determine position type from first trade
        initial_side = trades[0]['Side']
        position_type = 'Long' if initial_side == 'Buy' else 'Short'
        
        # Calculate average entry price (weighted by quantity)
        total_entry_value = 0
        total_entry_quantity = 0
        
        for trade in trades:
            if (position_type == 'Long' and trade['Side'] == 'Buy') or \
               (position_type == 'Short' and trade['Side'] == 'Sell'):
                # This is an entry trade
                total_entry_value += trade['Price'] * trade['Quantity']
                total_entry_quantity += trade['Quantity']
        
        avg_entry_price = total_entry_value / total_entry_quantity if total_entry_quantity > 0 else 0
        
        # Get position size (maximum absolute position during the trades)
        position_size = max(trade['Quantity'] for trade in trades)
        
        # Get close date (last trade date)
        close_date = max(trade['Date'] for trade in trades)
        
        return {
            'Broker': broker,
            'Asset': asset,
            'Position Type': position_type,
            'Open Date': start_date,
            'Close Date': close_date if not is_open else None,
            'Duration (Hours)': (close_date - start_date).total_seconds() / 3600 if not is_open else None,
            'Position Size': position_size,
            'Avg Entry Price': avg_entry_price,
            'Total PNL': total_pnl,
            'Total Fees': total_fees,
            'Net PNL': net_pnl,
            'Number of Trades': len(trades),
            'Status': 'Open' if is_open else 'Closed',
            'Day of Week': start_date.strftime('%A'),
            'Hour of Day': start_date.hour
        }
    
    def generate_time_analytics(self) -> Dict:
        """Generate time-based analytics"""
        if self.consolidated_data is None or self.consolidated_data.empty:
            return {}
        
        print("\n📊 Generating time-based analytics...")
        
        # Add time-based columns
        df = self.consolidated_data.copy()
        df['Day of Week'] = df['Date'].dt.strftime('%A')
        df['Hour of Day'] = df['Date'].dt.hour
        df['Is Weekend'] = df['Date'].dt.weekday >= 5
        
        analytics = {}
        
        # Day of week analysis (only for trades with PNL != 0, excluding breakeven)
        pnl_trades = df[(df['PNL'] != 0) & (abs(df['PNL']) > 0.01)].copy()
        
        if not pnl_trades.empty:
            day_stats = pnl_trades.groupby('Day of Week').agg({
                'PNL': ['count', 'sum', 'mean'],
                'Fee': 'sum'
            }).round(2)
            
            day_stats.columns = ['Trade Count', 'Total PNL', 'Avg PNL', 'Total Fees']
            day_stats['Net PNL'] = day_stats['Total PNL'] - day_stats['Total Fees']
            day_stats['Win Rate %'] = pnl_trades.groupby('Day of Week')['PNL'].apply(
                lambda x: (x > 0).sum() / len(x) * 100
            ).round(1)
            day_stats['Max Win'] = pnl_trades.groupby('Day of Week')['PNL'].max().round(2)
            day_stats['Max Loss'] = pnl_trades.groupby('Day of Week')['PNL'].min().round(2)
            
            # Reorder by weekday
            weekday_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            day_stats = day_stats.reindex([day for day in weekday_order if day in day_stats.index])
            analytics['By Day of Week'] = day_stats
            
            # Hour of day analysis
            hour_stats = pnl_trades.groupby('Hour of Day').agg({
                'PNL': ['count', 'sum', 'mean'],
                'Fee': 'sum'
            }).round(2)
            
            hour_stats.columns = ['Trade Count', 'Total PNL', 'Avg PNL', 'Total Fees']
            hour_stats['Net PNL'] = hour_stats['Total PNL'] - hour_stats['Total Fees']
            hour_stats['Win Rate %'] = pnl_trades.groupby('Hour of Day')['PNL'].apply(
                lambda x: (x > 0).sum() / len(x) * 100
            ).round(1)
            hour_stats['Max Win'] = pnl_trades.groupby('Hour of Day')['PNL'].max().round(2)
            hour_stats['Max Loss'] = pnl_trades.groupby('Hour of Day')['PNL'].min().round(2)
            
            analytics['By Hour of Day'] = hour_stats
            
            # Weekend vs Weekday
            weekend_stats = pnl_trades.groupby('Is Weekend').agg({
                'PNL': ['count', 'sum', 'mean'],
                'Fee': 'sum'
            }).round(2)
            
            weekend_stats.columns = ['Trade Count', 'Total PNL', 'Avg PNL', 'Total Fees']
            weekend_stats['Net PNL'] = weekend_stats['Total PNL'] - weekend_stats['Total Fees']
            weekend_stats['Win Rate %'] = pnl_trades.groupby('Is Weekend')['PNL'].apply(
                lambda x: (x > 0).sum() / len(x) * 100
            ).round(1)
            weekend_stats['Max Win'] = pnl_trades.groupby('Is Weekend')['PNL'].max().round(2)
            weekend_stats['Max Loss'] = pnl_trades.groupby('Is Weekend')['PNL'].min().round(2)
            weekend_stats.index = ['Weekday', 'Weekend']
            
            analytics['Weekend vs Weekday'] = weekend_stats
        
        return analytics
    
    def generate_coin_analytics(self) -> Dict:
        """Generate comprehensive coin-by-coin analytics"""
        if self.consolidated_data is None or self.consolidated_data.empty:
            return {}
        
        print("\n🪙 Generating coin analytics...")
        
        df = self.consolidated_data.copy()
        
        # Add time-based columns
        df['Day of Week'] = df['Date'].dt.strftime('%A')
        df['Hour of Day'] = df['Date'].dt.hour
        df['Is Weekend'] = df['Date'].dt.weekday >= 5
        
        coin_analytics = {}
        
        # Only analyze trades with PNL (not just entries), excluding breakeven trades
        pnl_trades = df[(df['PNL'] != 0) & (abs(df['PNL']) > 0.01)].copy()
        
        if not pnl_trades.empty:
            for asset in pnl_trades['Asset'].unique():
                asset_data = pnl_trades[pnl_trades['Asset'] == asset].copy()
                
                if len(asset_data) > 0:
                    # Use existing position history if available
                    if not hasattr(self, '_cached_position_history'):
                        self._cached_position_history = self.create_position_history()
                    
                    position_history = self._cached_position_history
                    asset_positions = position_history[
                        (position_history['Asset'] == asset) & 
                        (position_history['Status'] == 'Closed') &
                        (abs(position_history['Net PNL']) > 0.01)  # Exclude breakeven positions
                    ] if not position_history.empty else pd.DataFrame()
                    
                    # Basic stats
                    total_trades = len(asset_data)
                    winning_trades = len(asset_data[asset_data['PNL'] > 0])
                    losing_trades = len(asset_data[asset_data['PNL'] < 0])
                    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
                    
                    # PNL stats
                    total_pnl = asset_data['PNL'].sum()
                    total_fees = asset_data['Fee'].sum()
                    net_pnl = total_pnl - total_fees
                    avg_pnl = asset_data['PNL'].mean()
                    max_win = asset_data['PNL'].max()
                    max_loss = asset_data['PNL'].min()
                    
                    # Trade size stats
                    avg_trade_size = asset_data['Quantity'].mean()
                    max_trade_size = asset_data['Quantity'].max()
                    min_trade_size = asset_data['Quantity'].min()
                    
                    # Position duration stats
                    if not asset_positions.empty and 'Duration (Hours)' in asset_positions.columns:
                        avg_position_duration = asset_positions['Duration (Hours)'].mean()
                        max_position_duration = asset_positions['Duration (Hours)'].max()
                        min_position_duration = asset_positions['Duration (Hours)'].min()
                        total_positions = len(asset_positions)
                        position_win_rate = (asset_positions['Net PNL'] > 0).sum() / len(asset_positions) * 100
                    else:
                        avg_position_duration = 0
                        max_position_duration = 0
                        min_position_duration = 0
                        total_positions = 0
                        position_win_rate = 0
                    
                    # Time-based performance
                    best_day = asset_data.groupby('Day of Week')['PNL'].sum().idxmax() if len(asset_data) > 1 else 'N/A'
                    best_hour = asset_data.groupby('Hour of Day')['PNL'].sum().idxmax() if len(asset_data) > 1 else 'N/A'
                    
                    # Broker breakdown
                    broker_performance = asset_data.groupby('Broker').agg({
                        'PNL': ['count', 'sum', 'mean'],
                        'Fee': 'sum'
                    }).round(2)
                    
                    if not broker_performance.empty:
                        broker_performance.columns = ['Trade Count', 'Total PNL', 'Avg PNL', 'Total Fees']
                        broker_performance['Net PNL'] = broker_performance['Total PNL'] - broker_performance['Total Fees']
                    
                    coin_analytics[asset] = {
                        'Basic Stats': {
                            'Total Trades': total_trades,
                            'Total Positions': total_positions,
                            'Winning Trades': winning_trades,
                            'Losing Trades': losing_trades,
                            'Win Rate %': round(win_rate, 1),
                            'Position Win Rate %': round(position_win_rate, 1)
                        },
                        'PNL Performance': {
                            'Total PNL': round(total_pnl, 2),
                            'Total Fees': round(total_fees, 2),
                            'Net PNL': round(net_pnl, 2),
                            'Avg PNL per Trade': round(avg_pnl, 2),
                            'Max Win': round(max_win, 2),
                            'Max Loss': round(max_loss, 2)
                        },
                        'Trade Size': {
                            'Avg Trade Size': round(avg_trade_size, 4),
                            'Max Trade Size': round(max_trade_size, 4),
                            'Min Trade Size': round(min_trade_size, 4)
                        },
                        'Position Duration': {
                            'Avg Duration (Hours)': round(avg_position_duration, 1),
                            'Max Duration (Hours)': round(max_position_duration, 1),
                            'Min Duration (Hours)': round(min_position_duration, 1)
                        },
                        'Time Patterns': {
                            'Best Day of Week': best_day,
                            'Best Hour of Day': best_hour
                        },
                        'Broker Breakdown': broker_performance
                    }
        
        return coin_analytics
    
    def generate_summary_stats(self) -> Dict:
        """Generate summary statistics"""
        if self.consolidated_data is None or self.consolidated_data.empty:
            return {}
        
        summary = {}
        
        # Overall stats
        summary['Total Transactions'] = len(self.consolidated_data)
        summary['Total PNL'] = self.consolidated_data['PNL'].sum()
        summary['Total Fees'] = self.consolidated_data['Fee'].sum()
        summary['Net PNL'] = summary['Total PNL'] - summary['Total Fees']
        
        # Get position history for position-level metrics (exclude breakeven positions)
        position_history = self.create_position_history()
        closed_positions = position_history[
            (position_history['Status'] == 'Closed') & 
            (abs(position_history['Net PNL']) > 0.01)  # Exclude breakeven positions
        ] if not position_history.empty else pd.DataFrame()
        
        # Enhanced performance metrics using position-level data (exclude breakeven trades)
        pnl_trades = self.consolidated_data[(self.consolidated_data['PNL'] != 0) & (abs(self.consolidated_data['PNL']) > 0.01)]
        if not closed_positions.empty:
            # Use position-level max win/loss for more accurate representation
            summary['Max Win'] = closed_positions['Net PNL'].max()
            summary['Max Loss'] = closed_positions['Net PNL'].min()
            summary['Avg PNL per Position'] = closed_positions['Net PNL'].mean()
            
            # Position-based win rate
            profitable_positions = closed_positions[closed_positions['Net PNL'] > 0]
            losing_positions = closed_positions[closed_positions['Net PNL'] < 0]
            
            summary['Position Win Rate'] = len(profitable_positions) / len(closed_positions) * 100
            summary['Profitable Positions'] = len(profitable_positions)
            summary['Losing Positions'] = len(losing_positions)
            summary['Total Closed Positions'] = len(closed_positions)
        else:
            summary['Max Win'] = 0
            summary['Max Loss'] = 0
            summary['Avg PNL per Position'] = 0
            summary['Position Win Rate'] = 0
            summary['Profitable Positions'] = 0
            summary['Losing Positions'] = 0
            summary['Total Closed Positions'] = 0
        
        # Keep trade-level metrics for additional context
        if not pnl_trades.empty:
            summary['Avg PNL per Trade'] = pnl_trades['PNL'].mean()
            summary['Avg Trade Size'] = pnl_trades['Quantity'].mean()
            
            # Trade-level win rate
            profitable_trades = pnl_trades[pnl_trades['PNL'] > 0]
            losing_trades = pnl_trades[pnl_trades['PNL'] < 0]
            
            summary['Trade Win Rate'] = len(profitable_trades) / len(pnl_trades) * 100
            summary['Profitable Trades'] = len(profitable_trades)
            summary['Losing Trades'] = len(losing_trades)
        else:
            summary['Avg PNL per Trade'] = 0
            summary['Avg Trade Size'] = 0
            summary['Trade Win Rate'] = 0
            summary['Profitable Trades'] = 0
            summary['Losing Trades'] = 0
        
        # By broker (enhanced)
        broker_stats = self.consolidated_data.groupby('Broker').agg({
            'PNL': ['sum', 'mean', 'count', 'max', 'min'],
            'Fee': 'sum',
            'Quantity': 'mean'
        }).round(2)
        
        broker_stats.columns = ['Total PNL', 'Avg PNL', 'Trade Count', 'Max Win', 'Max Loss', 'Total Fees', 'Avg Trade Size']
        broker_stats['Net PNL'] = broker_stats['Total PNL'] - broker_stats['Total Fees']
        # Calculate win rate excluding breakeven trades
        non_breakeven_trades = self.consolidated_data[(self.consolidated_data['PNL'] != 0) & (abs(self.consolidated_data['PNL']) > 0.01)]
        broker_stats['Win Rate %'] = non_breakeven_trades.groupby('Broker')['PNL'].apply(
            lambda x: (x > 0).sum() / len(x) * 100
        ).round(1)
        
        summary['By Broker'] = broker_stats
        
        return summary
    
    def export_to_excel(self, output_file: str = 'trading_performance_report.xlsx'):
        """Export all data to Excel with multiple sheets"""
        print(f"\n📁 Exporting data to: {output_file}")
        
        # Generate analytics
        position_history = self.create_position_history()
        time_analytics = self.generate_time_analytics()
        coin_analytics = self.generate_coin_analytics()
        
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            
            # Summary sheet
            summary_stats = self.generate_summary_stats()
            
            if summary_stats:
                summary_rows = []
                summary_rows.append(['Metric', 'Value'])
                summary_rows.append(['=== OVERALL PERFORMANCE ===', ''])
                summary_rows.append(['Total Transactions', summary_stats.get('Total Transactions', 0)])
                summary_rows.append(['Total PNL', f"${summary_stats.get('Total PNL', 0):.2f}"])
                summary_rows.append(['Total Fees', f"${summary_stats.get('Total Fees', 0):.2f}"])
                summary_rows.append(['Net PNL', f"${summary_stats.get('Net PNL', 0):.2f}"])
                summary_rows.append(['', ''])
                summary_rows.append(['=== POSITION-LEVEL METRICS ===', ''])
                summary_rows.append(['Total Closed Positions', summary_stats.get('Total Closed Positions', 0)])
                summary_rows.append(['Position Win Rate', f"{summary_stats.get('Position Win Rate', 0):.1f}%"])
                summary_rows.append(['Profitable Positions', summary_stats.get('Profitable Positions', 0)])
                summary_rows.append(['Losing Positions', summary_stats.get('Losing Positions', 0)])
                summary_rows.append(['Max Win (Position)', f"${summary_stats.get('Max Win', 0):.2f}"])
                summary_rows.append(['Max Loss (Position)', f"${summary_stats.get('Max Loss', 0):.2f}"])
                summary_rows.append(['Avg PNL per Position', f"${summary_stats.get('Avg PNL per Position', 0):.2f}"])
                summary_rows.append(['', ''])
                summary_rows.append(['=== TRADE-LEVEL METRICS ===', ''])
                summary_rows.append(['Trade Win Rate', f"{summary_stats.get('Trade Win Rate', 0):.1f}%"])
                summary_rows.append(['Profitable Trades', summary_stats.get('Profitable Trades', 0)])
                summary_rows.append(['Losing Trades', summary_stats.get('Losing Trades', 0)])
                summary_rows.append(['Avg PNL per Trade', f"${summary_stats.get('Avg PNL per Trade', 0):.2f}"])
                summary_rows.append(['Avg Trade Size', f"{summary_stats.get('Avg Trade Size', 0):.4f}"])
                
                summary_df = pd.DataFrame(summary_rows[1:], columns=summary_rows[0])
                summary_df.to_excel(writer, sheet_name='Summary', index=False)
                
                # Broker breakdown (enhanced)
                if 'By Broker' in summary_stats and not summary_stats['By Broker'].empty:
                    summary_stats['By Broker'].to_excel(writer, sheet_name='Summary', startrow=15)
            
            # Position History sheet (exclude breakeven positions from export)
            if not position_history.empty:
                # Export all positions but mark breakeven ones
                position_history_export = position_history.copy()
                position_history_export['Is_Breakeven'] = abs(position_history_export['Net PNL']) <= 0.01
                
                # Filter out breakeven positions for cleaner analysis
                non_breakeven_positions = position_history_export[~position_history_export['Is_Breakeven']]
                
                if not non_breakeven_positions.empty:
                    non_breakeven_positions.to_excel(writer, sheet_name='Position History', index=False)
            
            # Coin Analytics sheet
            if coin_analytics:
                # Create a comprehensive coin analysis sheet
                coin_summary_rows = []
                for asset, analytics in coin_analytics.items():
                    basic_stats = analytics.get('Basic Stats', {})
                    pnl_perf = analytics.get('PNL Performance', {})
                    trade_size = analytics.get('Trade Size', {})
                    duration = analytics.get('Position Duration', {})
                    time_patterns = analytics.get('Time Patterns', {})
                    
                    coin_summary_rows.append([
                        asset,
                        basic_stats.get('Total Trades', 0),
                        basic_stats.get('Total Positions', 0),
                        f"{basic_stats.get('Win Rate %', 0):.1f}%",
                        f"{basic_stats.get('Position Win Rate %', 0):.1f}%",
                        f"${pnl_perf.get('Net PNL', 0):.2f}",
                        f"${pnl_perf.get('Avg PNL per Trade', 0):.2f}",
                        f"${pnl_perf.get('Max Win', 0):.2f}",
                        f"${pnl_perf.get('Max Loss', 0):.2f}",
                        f"{trade_size.get('Avg Trade Size', 0):.4f}",
                        f"{duration.get('Avg Duration (Hours)', 0):.1f}h",
                        time_patterns.get('Best Day of Week', 'N/A'),
                        time_patterns.get('Best Hour of Day', 'N/A')
                    ])
                
                coin_summary_df = pd.DataFrame(coin_summary_rows, columns=[
                    'Asset', 'Total Trades', 'Total Positions', 'Trade Win Rate', 'Position Win Rate',
                    'Net PNL', 'Avg PNL/Trade', 'Max Win', 'Max Loss', 'Avg Trade Size',
                    'Avg Duration', 'Best Day', 'Best Hour'
                ])
                
                # Sort by Net PNL (best performing coins first)
                coin_summary_df['Net_PNL_Numeric'] = coin_summary_df['Net PNL'].str.replace('$', '').str.replace(',', '').astype(float)
                coin_summary_df = coin_summary_df.sort_values('Net_PNL_Numeric', ascending=False).drop('Net_PNL_Numeric', axis=1)
                
                coin_summary_df.to_excel(writer, sheet_name='Coin Analysis', index=False)
            
            # Time Analytics sheets
            if time_analytics:
                # Day of week analysis
                if 'By Day of Week' in time_analytics:
                    time_analytics['By Day of Week'].to_excel(writer, sheet_name='Day Analysis')
                
                # Hour of day analysis
                if 'By Hour of Day' in time_analytics:
                    time_analytics['By Hour of Day'].to_excel(writer, sheet_name='Hour Analysis')
                
                # Weekend vs Weekday
                if 'Weekend vs Weekday' in time_analytics:
                    time_analytics['Weekend vs Weekday'].to_excel(writer, sheet_name='Weekend Analysis')
            
            # Individual broker sheets (sorted by most recent)
            if self.blofin_data is not None and not self.blofin_data.empty:
                blofin_sorted = self.blofin_data.sort_values('Date', ascending=False)
                blofin_sorted.to_excel(writer, sheet_name='Blofin', index=False)
            
            if self.edgex_data is not None and not self.edgex_data.empty:
                edgex_sorted = self.edgex_data.sort_values('Date', ascending=False)
                edgex_sorted.to_excel(writer, sheet_name='Edgex', index=False)
            
            if self.breakout_data is not None and not self.breakout_data.empty:
                breakout_sorted = self.breakout_data.sort_values('Date', ascending=False)
                breakout_sorted.to_excel(writer, sheet_name='Breakout', index=False)
            
            # Consolidated data (already sorted by most recent)
            if self.consolidated_data is not None and not self.consolidated_data.empty:
                self.consolidated_data.to_excel(writer, sheet_name='All Trades', index=False)
        
        print(f"✅ Excel report generated: {output_file}")
        return output_file

def discover_broker_files(broker_name: str) -> List[str]:
    """Automatically discover all files for a specific broker"""
    folder_path = f"account statements/{broker_name}/"
    
    if not os.path.exists(folder_path):
        print(f"⚠️ Folder not found: {folder_path}")
        return []
    
    if broker_name == 'blofin':
        pattern = os.path.join(folder_path, "*.csv")
    elif broker_name == 'edgex':
        pattern = os.path.join(folder_path, "*.csv")
    elif broker_name == 'breakout':
        pattern = os.path.join(folder_path, "*.pdf")
    else:
        return []
    
    files = glob.glob(pattern)
    files.sort()  # Sort files alphabetically for consistent processing order
    
    if files:
        print(f"🔍 Auto-discovered {len(files)} {broker_name} files:")
        for file in files:
            print(f"   📄 {os.path.basename(file)}")
    else:
        print(f"⚠️ No {broker_name} files found in {folder_path}")
    
    return files

def process_multiple_files(processor, broker_type, file_list):
    """Process multiple files for a single broker with deduplication"""
    all_data = []
    
    for file_path in file_list:
        if os.path.exists(file_path):
            if broker_type == 'blofin':
                data = processor.parse_blofin_data(file_path)
            elif broker_type == 'edgex':
                data = processor.parse_edgex_data(file_path)
            elif broker_type == 'breakout':
                data = processor.parse_breakout_pdf(file_path)
            else:
                continue
                
            if not data.empty:
                all_data.append(data)
        else:
            print(f"⚠️ File not found: {file_path}")
    
    if all_data:
        return pd.concat(all_data, ignore_index=True)
    else:
        return pd.DataFrame()

def main():
    """Main execution function"""
    print("🚀 Trading Performance Analyzer Started")
    print("=" * 50)
    print("💡 Smart Deduplication: The script automatically detects and skips duplicate transactions")
    print("🔍 Auto-Discovery: Automatically finds all files in broker folders")
    print("📁 Simply add new files to the respective broker folders and rerun the script")
    print("=" * 50)
    
    # Initialize processor
    processor = TradingDataProcessor()
    
    # Auto-discover all files for each broker
    print("\n📂 Auto-discovering broker data files...")
    blofin_files = discover_broker_files('blofin')
    edgex_files = discover_broker_files('edgex')
    breakout_files = discover_broker_files('breakout')
    
    # Process each broker's data with deduplication
    print("\n📊 Processing broker data files...")
    
    # Process all files for each broker
    processor.blofin_data = process_multiple_files(processor, 'blofin', blofin_files)
    processor.edgex_data = process_multiple_files(processor, 'edgex', edgex_files)
    processor.breakout_data = process_multiple_files(processor, 'breakout', breakout_files)
    
    # Consolidate all data
    consolidated = processor.consolidate_data()
    
    # Generate Excel report
    if not consolidated.empty:
        output_file = processor.export_to_excel()
        
        # Print summary
        summary = processor.generate_summary_stats()
        if summary:
            print("\n📊 Performance Summary:")
            print("-" * 30)
            print(f"Total Transactions: {summary.get('Total Transactions', 0)}")
            print(f"Total PNL: ${summary.get('Total PNL', 0):.2f}")
            print(f"Total Fees: ${summary.get('Total Fees', 0):.2f}")
            print(f"Net PNL: ${summary.get('Net PNL', 0):.2f}")
            print(f"\n🎯 Position-Level Performance:")
            print(f"Position Win Rate: {summary.get('Position Win Rate', 0):.1f}%")
            print(f"Max Win (Position): ${summary.get('Max Win', 0):.2f}")
            print(f"Max Loss (Position): ${summary.get('Max Loss', 0):.2f}")
            print(f"Avg PNL per Position: ${summary.get('Avg PNL per Position', 0):.2f}")
            print(f"\n📈 Trade-Level Performance:")
            print(f"Trade Win Rate: {summary.get('Trade Win Rate', 0):.1f}%")
            
            # Show position summary (exclude breakeven)
            position_history = processor.create_position_history()
            if not position_history.empty:
                closed_positions = position_history[position_history['Status'] == 'Closed']
                # Exclude breakeven positions from summary
                non_breakeven_closed = closed_positions[abs(closed_positions['Net PNL']) > 0.01]
                breakeven_count = len(closed_positions) - len(non_breakeven_closed)
                
                if not non_breakeven_closed.empty:
                    print(f"\n🎯 Position Summary (Excluding Breakeven):")
                    print(f"Total Positions: {len(position_history)}")
                    print(f"Closed Positions: {len(closed_positions)}")
                    print(f"Breakeven Positions (excluded): {breakeven_count}")
                    print(f"Analyzed Positions: {len(non_breakeven_closed)}")
                    print(f"Avg Position Duration: {non_breakeven_closed['Duration (Hours)'].mean():.1f} hours")
                    print(f"Position Win Rate: {(non_breakeven_closed['Net PNL'] > 0).sum() / len(non_breakeven_closed) * 100:.1f}%")
            
            print(f"\n📋 Report saved to: {output_file}")
            print(f"📑 Sheets included: Position History, Coin Analysis, Day Analysis, Hour Analysis, Weekend Analysis")
            
            # Auto-convert to JSON for frontend
            try:
                print("\n🔄 Converting to JSON for dashboard...")
                from data_converter import convert_excel_to_json
                convert_excel_to_json()
                print("✅ JSON conversion complete - dashboard ready!")
            except Exception as e:
                print(f"⚠️ JSON conversion failed: {e}")
                print("💡 Run 'python data_converter.py' manually to generate JSON for dashboard")
    else:
        print("❌ No data available to process")
    
    print("\n✨ Analysis complete!")

if __name__ == "__main__":
    main()
