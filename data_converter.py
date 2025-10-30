#!/usr/bin/env python3
"""
Data Converter for Trading Dashboard
Converts Excel trading data to JSON format for the React frontend.
"""

import pandas as pd
import json
import os
import numpy as np
from datetime import datetime
from trading_performance_analyzer import TradingDataProcessor

def json_serializer(obj):
    """Custom JSON serializer to handle NaN and datetime objects"""
    # Handle pandas NA/NaN values
    if pd.isna(obj):
        return None
    # Handle numpy NaN values
    if isinstance(obj, (float, np.floating)) and (np.isnan(obj) if hasattr(obj, '__float__') else False):
        return None
    # Handle string "NaN" values
    if isinstance(obj, str) and obj == 'NaN':
        return None
    # Handle datetime
    if isinstance(obj, datetime):
        return obj.isoformat()
    # Handle numpy integers
    if isinstance(obj, np.integer):
        return int(obj)
    # Handle numpy floats
    if isinstance(obj, np.floating):
        return float(obj)
    return str(obj)

def convert_excel_to_json():
    """Convert trading performance Excel to JSON for frontend"""
    
    excel_file = "trading_performance_report.xlsx"
    output_dir = "trading-dashboard/public/data"
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    if not os.path.exists(excel_file):
        print(f"❌ Excel file not found: {excel_file}")
        print("💡 Run trading_performance_analyzer.py first to generate the Excel file")
        return
    
    print(f"📊 Converting {excel_file} to JSON format...")
    
    try:
        # Read all sheets
        excel_data = pd.read_excel(excel_file, sheet_name=None)
        
        dashboard_data = {}
        
        # Process each sheet
        for sheet_name, df in excel_data.items():
            print(f"Processing {sheet_name}...")
            
            if sheet_name == 'Summary':
                # Handle summary data specially
                dashboard_data['summary'] = process_summary_sheet(df)
            elif sheet_name == 'Position History':
                dashboard_data['positions'] = process_positions_sheet(df)
            elif sheet_name == 'Coin Analysis':
                dashboard_data['coins'] = process_coins_sheet(df)
            elif sheet_name in ['Day Analysis', 'Hour Analysis', 'Weekend Analysis']:
                dashboard_data[sheet_name.lower().replace(' ', '_')] = process_analysis_sheet(df)
            elif sheet_name == 'All Trades':
                dashboard_data['trades'] = process_trades_sheet(df)
            else:
                # Individual broker sheets
                dashboard_data[sheet_name.lower()] = process_trades_sheet(df)
        
        # Add metadata
        dashboard_data['metadata'] = {
            'generated_at': datetime.now().isoformat(),
            'total_sheets': len(excel_data),
            'data_version': '1.0'
        }
        
        # Write to JSON file
        output_file = os.path.join(output_dir, 'trading_data.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(dashboard_data, f, indent=2, default=json_serializer)
        
        # Post-process the JSON file to replace any remaining NaN strings
        with open(output_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace NaN values with null
        content = content.replace(': NaN,', ': null,')
        content = content.replace(': NaN}', ': null}')
        content = content.replace(': NaN\n', ': null\n')
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Data converted successfully!")
        print(f"📁 Output file: {output_file}")
        print(f"📊 Generated {len(dashboard_data)} data sections")
        
    except Exception as e:
        print(f"❌ Error converting data: {e}")
        print(f"💡 Fix the Excel file generation issue and try again")

def process_summary_sheet(df):
    """Process summary sheet data"""
    summary = {}
    
    # Convert summary table to key-value pairs
    if len(df.columns) >= 2:
        for _, row in df.iterrows():
            if pd.notna(row.iloc[0]) and pd.notna(row.iloc[1]):
                key = str(row.iloc[0]).strip()
                value = row.iloc[1]
                
                # Convert numeric strings
                if isinstance(value, str) and value.startswith('$'):
                    try:
                        value = float(value.replace('$', '').replace(',', ''))
                    except:
                        pass
                elif isinstance(value, str) and value.endswith('%'):
                    try:
                        value = float(value.replace('%', ''))
                    except:
                        pass
                
                summary[key] = value
    
    # Add frontend compatibility fields
    # Use Position Win Rate as the primary Win Rate for the frontend
    if 'Position Win Rate' in summary:
        summary['Win Rate'] = summary['Position Win Rate']
    elif 'Trade Win Rate' in summary:
        summary['Win Rate'] = summary['Trade Win Rate']
    
    # Map position-level max win/loss to frontend expected fields
    if 'Max Win (Position)' in summary:
        summary['Max Win'] = summary['Max Win (Position)']
    if 'Max Loss (Position)' in summary:
        summary['Max Loss'] = summary['Max Loss (Position)']
    
    # Map profitable trades count
    if 'Profitable Positions' in summary:
        summary['Profitable Trades'] = summary['Profitable Positions']
    
    return summary

def process_positions_sheet(df):
    """Process position history sheet"""
    if df.empty:
        return []
    
    # Replace NaN values with None before converting to dict
    df = df.where(pd.notnull(df), None)
    
    # Convert to records and handle datetime
    positions = df.to_dict('records')
    
    for position in positions:
        # Convert datetime fields
        for field in ['Open Date', 'Close Date']:
            if field in position and position[field] is not None:
                if isinstance(position[field], datetime):
                    position[field] = position[field].isoformat()
                else:
                    try:
                        position[field] = pd.to_datetime(position[field]).isoformat()
                    except:
                        pass
    
    return positions

def process_coins_sheet(df):
    """Process coin analysis sheet"""
    if df.empty:
        return []
    
    # Replace NaN values with None before converting to dict
    df = df.where(pd.notnull(df), None)
    
    return df.to_dict('records')

def process_analysis_sheet(df):
    """Process analysis sheets (day, hour, weekend)"""
    if df.empty:
        return {}
    
    # Convert index to regular column if it exists
    if df.index.name:
        df = df.reset_index()
    
    # Replace NaN values with None before converting to dict
    df = df.where(pd.notnull(df), None)
    
    return df.to_dict('records')

def process_trades_sheet(df):
    """Process trades sheet"""
    if df.empty:
        return []
    
    # Replace NaN values with None before converting to dict
    df = df.where(pd.notnull(df), None)
    
    trades = df.to_dict('records')
    
    for trade in trades:
        # Convert datetime fields
        if 'Date' in trade and trade['Date'] is not None:
            if isinstance(trade['Date'], datetime):
                trade['Date'] = trade['Date'].isoformat()
            else:
                try:
                    trade['Date'] = pd.to_datetime(trade['Date']).isoformat()
                except:
                    pass
    
    return trades


if __name__ == "__main__":
    convert_excel_to_json()
