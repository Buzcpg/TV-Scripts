export interface JournalEntry {
  id: string;
  exchange: string;
  coin: string;
  size: number;
  direction: 'Long' | 'Short';
  entry: number;
  stopLoss: number;
  takeProfits: TakeProfit[];
  timestamp: string;
  status: 'Open' | 'Closed' | 'Partially Closed';
  
  // Order type information
  entryOrderType?: 'Market' | 'Limit'; // How entry was executed
  defaultExitOrderType?: 'Market' | 'Limit'; // Default for exits
  
  // Calculated fields
  risk: number; // Amount at risk (entry - stop) * size
  riskReward: number[]; // Risk to reward ratios for each TP
  estimatedFees?: number; // Estimated total fees for the trade
  
  // Follow-up data
  followUps: FollowUp[];
  actualExits: ActualExit[];
  images: string[]; // File paths to images
  notes: string;
  
  // Linking to exchange data
  linkedTrades?: string[]; // IDs of actual trades from exchange data
}

export interface TakeProfit {
  level: number; // 1, 2, 3, 4
  price: number;
  percentage?: number; // Percentage of position to close
}

export interface FollowUp {
  id: string;
  timestamp: string;
  type: 'stop_move' | 'partial_exit' | 'full_exit' | 'add_position' | 'note';
  description: string;
  newStopLoss?: number;
  exitPrice?: number;
  exitPercentage?: number;
  reasoning: string;
  images?: string[];
}

export interface ActualExit {
  timestamp: string;
  price: number;
  percentage: number; // Percentage of original position
  type: 'stop_loss' | 'take_profit' | 'manual';
  pnl: number;
  pnlSource: 'calculated' | 'manual' | 'exchange'; // Track how P&L was determined
  manualPnl?: number; // Override calculated P&L if needed
  exchangeTradeId?: string; // Link to actual exchange trade for verification
  fees?: number; // Track trading fees
  orderType?: 'Market' | 'Limit'; // How this exit was executed
  notes?: string; // Notes about this exit
}

export interface JournalSettings {
  defaultExchanges: string[];
  riskPercentage: number; // Default risk percentage of account
  accountSize: number;
}

export interface TradeCalculations {
  positionSize: number;
  riskAmount: number;
  riskPercentage: number;
  riskRewardRatios: number[];
  potentialPnL: number[];
  stopLossDistance: number;
  takeProfitDistances: number[];
}

