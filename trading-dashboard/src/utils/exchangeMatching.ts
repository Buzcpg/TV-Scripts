import { JournalEntry, ActualExit } from '../types/journal';
import { TradingData } from '../types/trading';

export interface ExchangeMatchResult {
  journalEntry: JournalEntry;
  matchedTrades: any[];
  confidence: 'high' | 'medium' | 'low';
  discrepancies: string[];
  suggestedUpdates: Partial<ActualExit>[];
}

/**
 * Matches journal entries with actual exchange trade data
 * This prepares for future automation of P&L verification
 */
export class ExchangeDataMatcher {
  
  /**
   * Find potential matches between journal entries and exchange data
   */
  static findMatches(
    journalEntries: JournalEntry[], 
    exchangeData: TradingData
  ): ExchangeMatchResult[] {
    const allExchangeTrades = [
      ...(exchangeData.blofin || []),
      ...(exchangeData.edgex || []),
      ...(exchangeData.breakout || [])
    ];

    return journalEntries.map(entry => {
      const matches = this.findTradesForEntry(entry, allExchangeTrades);
      const confidence = this.calculateConfidence(entry, matches);
      const discrepancies = this.findDiscrepancies(entry, matches);
      const suggestedUpdates = this.generateSuggestedUpdates(entry, matches);

      return {
        journalEntry: entry,
        matchedTrades: matches,
        confidence,
        discrepancies,
        suggestedUpdates
      };
    });
  }

  /**
   * Find exchange trades that potentially match a journal entry
   */
  private static findTradesForEntry(entry: JournalEntry, exchangeTrades: any[]): any[] {
    const entryTime = new Date(entry.timestamp);
    const timeWindow = 48 * 60 * 60 * 1000; // 48 hours window

    return exchangeTrades.filter(trade => {
      const tradeTime = new Date(trade.Date);
      const timeDiff = Math.abs(entryTime.getTime() - tradeTime.getTime());
      
      // Match criteria
      const timeMatch = timeDiff <= timeWindow;
      const assetMatch = this.isAssetMatch(entry.coin, trade.Asset);
      const sizeMatch = this.isSizeMatch(entry.size, trade.Quantity);
      const directionMatch = this.isDirectionMatch(entry.direction, trade.Side);

      return timeMatch && assetMatch && (sizeMatch || directionMatch);
    });
  }

  /**
   * Calculate confidence level of the match
   */
  private static calculateConfidence(entry: JournalEntry, matches: any[]): 'high' | 'medium' | 'low' {
    if (matches.length === 0) return 'low';
    
    const exactMatches = matches.filter(trade => {
      const assetMatch = this.isAssetMatch(entry.coin, trade.Asset);
      const sizeMatch = this.isSizeMatch(entry.size, trade.Quantity, 0.05); // 5% tolerance
      const priceMatch = Math.abs(entry.entry - trade.Price) / entry.entry < 0.02; // 2% tolerance
      
      return assetMatch && sizeMatch && priceMatch;
    });

    if (exactMatches.length > 0) return 'high';
    if (matches.length <= 3) return 'medium';
    return 'low';
  }

  /**
   * Find discrepancies between journal and exchange data
   */
  private static findDiscrepancies(entry: JournalEntry, matches: any[]): string[] {
    const discrepancies: string[] = [];

    if (matches.length === 0) {
      discrepancies.push('No matching trades found in exchange data');
      return discrepancies;
    }

    // Check for price discrepancies
    const avgExchangePrice = matches.reduce((sum, trade) => sum + trade.Price, 0) / matches.length;
    const priceDiff = Math.abs(entry.entry - avgExchangePrice) / entry.entry;
    if (priceDiff > 0.05) { // 5% difference
      discrepancies.push(`Price difference: Journal ${entry.entry.toFixed(4)} vs Exchange ${avgExchangePrice.toFixed(4)}`);
    }

    // Check for size discrepancies
    const totalExchangeSize = matches.reduce((sum, trade) => sum + Math.abs(trade.Quantity), 0);
    const sizeDiff = Math.abs(entry.size - totalExchangeSize) / entry.size;
    if (sizeDiff > 0.1) { // 10% difference
      discrepancies.push(`Size difference: Journal ${entry.size} vs Exchange ${totalExchangeSize}`);
    }

    // Check P&L accuracy for closed trades
    entry.actualExits.forEach((exit, index) => {
      if (exit.pnlSource === 'calculated' && matches.length > 0) {
        const exchangePnL = matches.reduce((sum, trade) => sum + (trade.PNL || 0), 0);
        const diff = Math.abs(exit.pnl - exchangePnL);
        if (diff > 1) { // $1 difference threshold
          discrepancies.push(`P&L difference in exit ${index + 1}: Journal ${exit.pnl.toFixed(2)} vs Exchange ${exchangePnL.toFixed(2)}`);
        }
      }
    });

    return discrepancies;
  }

  /**
   * Generate suggested updates based on exchange data
   */
  private static generateSuggestedUpdates(entry: JournalEntry, matches: any[]): Partial<ActualExit>[] {
    if (matches.length === 0) return [];

    const suggestions: Partial<ActualExit>[] = [];

    // For each exchange trade, suggest an exit if not already recorded
    matches.forEach(trade => {
      const isAlreadyRecorded = entry.actualExits.some(exit => 
        Math.abs(exit.price - trade.Price) < 0.01 && 
        new Date(exit.timestamp).getTime() === new Date(trade.Date).getTime()
      );

      if (!isAlreadyRecorded && trade.PNL !== undefined) {
        suggestions.push({
          timestamp: trade.Date,
          price: trade.Price,
          percentage: 100, // Assume full exit, user can adjust
          type: 'manual',
          pnl: trade.PNL,
          pnlSource: 'exchange',
          exchangeTradeId: trade.id || `${trade.Broker}_${trade.Date}`,
          notes: `Auto-suggested from ${trade.Broker} exchange data`
        });
      }
    });

    return suggestions;
  }

  /**
   * Helper functions for matching
   */
  private static isAssetMatch(journalCoin: string, exchangeAsset: string): boolean {
    const normalize = (str: string) => str.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return normalize(journalCoin).includes(normalize(exchangeAsset)) || 
           normalize(exchangeAsset).includes(normalize(journalCoin));
  }

  private static isSizeMatch(journalSize: number, exchangeSize: number, tolerance: number = 0.1): boolean {
    const diff = Math.abs(journalSize - Math.abs(exchangeSize)) / journalSize;
    return diff <= tolerance;
  }

  private static isDirectionMatch(journalDirection: string, exchangeSide: string): boolean {
    const journalLong = journalDirection.toLowerCase() === 'long';
    const exchangeBuy = exchangeSide.toLowerCase() === 'buy';
    return journalLong === exchangeBuy;
  }

  /**
   * Auto-update journal entries with exchange data
   * This would be called when user wants to sync with exchange data
   */
  static async autoUpdateFromExchange(
    journalEntries: JournalEntry[],
    exchangeData: TradingData,
    userApproval: (suggestions: ExchangeMatchResult[]) => Promise<boolean>
  ): Promise<JournalEntry[]> {
    const matches = this.findMatches(journalEntries, exchangeData);
    const hasUpdates = matches.some(match => match.suggestedUpdates.length > 0);

    if (!hasUpdates) {
      return journalEntries; // No updates needed
    }

    // Ask user for approval
    const approved = await userApproval(matches);
    if (!approved) {
      return journalEntries; // User declined updates
    }

    // Apply updates
    return journalEntries.map(entry => {
      const match = matches.find(m => m.journalEntry.id === entry.id);
      if (!match || match.suggestedUpdates.length === 0) {
        return entry;
      }

      // Add suggested exits
      const newExits = match.suggestedUpdates.map(suggestion => ({
        timestamp: suggestion.timestamp!,
        price: suggestion.price!,
        percentage: suggestion.percentage!,
        type: suggestion.type!,
        pnl: suggestion.pnl!,
        pnlSource: suggestion.pnlSource!,
        exchangeTradeId: suggestion.exchangeTradeId,
        notes: suggestion.notes
      })) as ActualExit[];

      return {
        ...entry,
        actualExits: [...entry.actualExits, ...newExits],
        status: this.calculateNewStatus(entry, newExits)
      };
    });
  }

  private static calculateNewStatus(entry: JournalEntry, newExits: ActualExit[]): 'Open' | 'Closed' | 'Partially Closed' {
    const totalExited = [...entry.actualExits, ...newExits].reduce((sum, exit) => sum + exit.percentage, 0);
    if (totalExited >= 100) return 'Closed';
    if (totalExited > 0) return 'Partially Closed';
    return 'Open';
  }
}
