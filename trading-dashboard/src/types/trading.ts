export interface TradingData {
  summary: SummaryData;
  positions: Position[];
  coins: CoinAnalysis[];
  day_analysis: DayAnalysis[];
  hour_analysis?: HourAnalysis[];
  weekend_analysis?: WeekendAnalysis[];
  trades: Trade[];
  blofin?: Trade[];
  edgex?: Trade[];
  breakout?: Trade[];
  metadata: Metadata;
}

export interface SummaryData {
  'Total Transactions': number;
  'Total PNL': number;
  'Total Fees': number;
  'Net PNL': number;
  'Win Rate': number;
  'Max Win': number;
  'Max Loss': number;
  'Avg PNL per Trade': number;
  'Avg Trade Size': number;
  'Profitable Trades'?: number;
  'Losing Trades'?: number;
  'Total Closed Positions'?: number;
  'Position Win Rate'?: number;
  'Profitable Positions'?: number;
  'Losing Positions'?: number;
  'Max Win (Position)'?: number;
  'Max Loss (Position)'?: number;
  'Avg PNL per Position'?: number;
  'Trade Win Rate'?: number;
}

export interface Position {
  Asset: string;
  'Position Type': 'Long' | 'Short';
  'Open Date': string;
  'Close Date'?: string;
  'Duration (Hours)'?: number;
  'Position Size': number;
  'Avg Entry Price': number;
  'Net PNL': number;
  'Total PNL': number;
  'Total Fees': number;
  'Number of Trades': number;
  Status: 'Open' | 'Closed';
  'Day of Week': string;
  'Hour of Day': number;
}

export interface CoinAnalysis {
  Asset: string;
  'Total Trades': number;
  'Total Positions'?: number;
  'Trade Win Rate': string;
  'Position Win Rate'?: string;
  'Net PNL': string | number;
  'Avg PNL/Trade': string;
  'Max Win': string;
  'Max Loss': string;
  'Avg Trade Size': string;
  'Avg Duration': string;
  'Best Day': string;
  'Best Hour': string | number;
}

export interface DayAnalysis {
  'Day of Week': string;
  'Trade Count': number;
  'Total PNL': number;
  'Avg PNL': number;
  'Net PNL': number;
  'Win Rate %': number;
  'Max Win': number;
  'Max Loss': number;
  'Total Fees': number;
}

export interface HourAnalysis {
  'Hour of Day': number;
  'Trade Count': number;
  'Total PNL': number;
  'Avg PNL': number;
  'Net PNL': number;
  'Win Rate %': number;
  'Max Win': number;
  'Max Loss': number;
  'Total Fees': number;
}

export interface WeekendAnalysis {
  Period: 'Weekday' | 'Weekend';
  'Trade Count': number;
  'Total PNL': number;
  'Avg PNL': number;
  'Net PNL': number;
  'Win Rate %': number;
  'Max Win': number;
  'Max Loss': number;
  'Total Fees': number;
}

export interface Trade {
  Broker: string;
  Asset: string;
  Date: string;
  Side: 'Buy' | 'Sell';
  Type: string;
  Quantity: number;
  Price: number;
  PNL: number;
  Fee: number;
  Leverage: string;
  Order_Options: string;
}

export interface Metadata {
  generated_at: string;
  total_sheets: number;
  data_version: string;
}

// Chart data interfaces
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  pnl?: number;
  winRate?: number;
}

export interface AssetPerformance {
  asset: string;
  netPnl: number;
  winRate: number;
  trades: number;
  avgDuration: number;
}
