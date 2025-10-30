export interface ExchangeFees {
  maker: number; // in percentage
  taker: number; // in percentage
}

export interface FeeCalculation {
  entryFee: number;
  exitFee: number;
  totalFees: number;
  entryFeeRate: number;
  exitFeeRate: number;
}

export const EXCHANGE_FEES: Record<string, ExchangeFees> = {
  'Breakout': {
    maker: 0.035, // 0.035%
    taker: 0.035  // 0.035%
  },
  'Edgex': {
    maker: 0.015, // 0.015%
    taker: 0.038  // 0.038%
  },
  'Blofin': {
    maker: 0.020, // 0.020%
    taker: 0.060  // 0.060%
  },
  'EdgeX': { // Alternative spelling
    maker: 0.015,
    taker: 0.038
  }
};

export type OrderType = 'Market' | 'Limit';

/**
 * Calculate trading fees based on exchange, order types, and position details
 */
export class FeeCalculator {
  
  /**
   * Calculate fees for a complete trade (entry + exit)
   */
  static calculateTradeFees(
    exchange: string,
    entryOrderType: OrderType,
    exitOrderType: OrderType,
    positionSize: number,
    entryPrice: number,
    exitPrice?: number
  ): FeeCalculation {
    const exchangeFees = this.getExchangeFees(exchange);
    
    // Entry fee calculation
    const entryFeeRate = entryOrderType === 'Limit' ? exchangeFees.maker / 100 : exchangeFees.taker / 100;
    const entryNotional = positionSize * entryPrice;
    const entryFee = entryNotional * entryFeeRate;
    
    // Exit fee calculation (always assume taker for exits by default)
    const exitFeeRate = exitOrderType === 'Limit' ? exchangeFees.maker / 100 : exchangeFees.taker / 100;
    const exitNotional = exitPrice ? (positionSize * exitPrice) : entryNotional; // Use entry notional if no exit price
    const exitFee = exitNotional * exitFeeRate;
    
    return {
      entryFee,
      exitFee,
      totalFees: entryFee + exitFee,
      entryFeeRate,
      exitFeeRate
    };
  }

  /**
   * Calculate just entry fees
   */
  static calculateEntryFees(
    exchange: string,
    orderType: OrderType,
    positionSize: number,
    entryPrice: number
  ): { fee: number; rate: number } {
    const exchangeFees = this.getExchangeFees(exchange);
    const feeRate = orderType === 'Limit' ? exchangeFees.maker / 100 : exchangeFees.taker / 100;
    const notional = positionSize * entryPrice;
    const fee = notional * feeRate;
    
    return { fee, rate: feeRate };
  }

  /**
   * Calculate exit fees
   */
  static calculateExitFees(
    exchange: string,
    orderType: OrderType,
    positionSize: number,
    exitPrice: number
  ): { fee: number; rate: number } {
    const exchangeFees = this.getExchangeFees(exchange);
    const feeRate = orderType === 'Limit' ? exchangeFees.maker / 100 : exchangeFees.taker / 100;
    const notional = positionSize * exitPrice;
    const fee = notional * feeRate;
    
    return { fee, rate: feeRate };
  }

  /**
   * Calculate optimal position size accounting for fees (like in your PineScript)
   */
  static calculatePositionSizeWithFees(
    exchange: string,
    entryOrderType: OrderType,
    exitOrderType: OrderType,
    riskAmount: number,
    entryPrice: number,
    stopLossPrice: number
  ): {
    positionSize: number;
    totalFees: number;
    effectiveRisk: number;
    riskPerContract: number;
  } {
    const exchangeFees = this.getExchangeFees(exchange);
    
    const entryFeeRate = entryOrderType === 'Limit' ? exchangeFees.maker / 100 : exchangeFees.taker / 100;
    const exitFeeRate = exitOrderType === 'Limit' ? exchangeFees.maker / 100 : exchangeFees.taker / 100;
    const totalFeeRate = entryFeeRate + exitFeeRate;
    
    const riskPerContract = Math.abs(entryPrice - stopLossPrice);
    
    // Solve for position size: riskAmount = qty * (riskPerContract + entryPrice * totalFeeRate)
    const effectiveRiskPerContract = riskPerContract + (entryPrice * totalFeeRate);
    const positionSize = Math.round((riskAmount / effectiveRiskPerContract) * 10000) / 10000; // Round to 4 decimals
    
    // Calculate actual fees based on final position size
    const entryFees = entryFeeRate * positionSize * entryPrice;
    const exitFees = exitFeeRate * positionSize * entryPrice; // Use entry price as approximation
    const totalFees = entryFees + exitFees;
    
    return {
      positionSize,
      totalFees,
      effectiveRisk: (positionSize * riskPerContract) + totalFees,
      riskPerContract
    };
  }

  /**
   * Get exchange fees with fallback
   */
  private static getExchangeFees(exchange: string): ExchangeFees {
    // Normalize exchange name
    const normalizedExchange = exchange.trim();
    
    if (EXCHANGE_FEES[normalizedExchange]) {
      return EXCHANGE_FEES[normalizedExchange];
    }
    
    // Try case-insensitive match
    const exchangeKey = Object.keys(EXCHANGE_FEES).find(
      key => key.toLowerCase() === normalizedExchange.toLowerCase()
    );
    
    if (exchangeKey) {
      return EXCHANGE_FEES[exchangeKey];
    }
    
    // Fallback to Breakout fees (most conservative)
    console.warn(`Unknown exchange: ${exchange}, using Breakout fees as fallback`);
    return EXCHANGE_FEES['Breakout'];
  }

  /**
   * Get all supported exchanges
   */
  static getSupportedExchanges(): string[] {
    return Object.keys(EXCHANGE_FEES);
  }

  /**
   * Get fee information for display
   */
  static getExchangeFeeInfo(exchange: string): {
    exchange: string;
    makerFee: string;
    takerFee: string;
    fees: ExchangeFees;
  } {
    const fees = this.getExchangeFees(exchange);
    return {
      exchange,
      makerFee: `${fees.maker}%`,
      takerFee: `${fees.taker}%`,
      fees
    };
  }

  /**
   * Compare fees across exchanges for a given trade
   */
  static compareFees(
    positionSize: number,
    entryPrice: number,
    entryOrderType: OrderType = 'Market',
    exitOrderType: OrderType = 'Market'
  ): Array<{
    exchange: string;
    totalFees: number;
    entryFee: number;
    exitFee: number;
    feePercentage: number;
  }> {
    const notional = positionSize * entryPrice;
    
    return Object.keys(EXCHANGE_FEES).map(exchange => {
      const calculation = this.calculateTradeFees(
        exchange,
        entryOrderType,
        exitOrderType,
        positionSize,
        entryPrice
      );
      
      return {
        exchange,
        totalFees: calculation.totalFees,
        entryFee: calculation.entryFee,
        exitFee: calculation.exitFee,
        feePercentage: (calculation.totalFees / notional) * 100
      };
    }).sort((a, b) => a.totalFees - b.totalFees); // Sort by lowest fees first
  }
}

export default FeeCalculator;
