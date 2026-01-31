// Fee configuration - matches industry standard rates
// These fees are applied silently in the backend

export const FEE_CONFIG = {
  // Fee recipient address
  FEE_RECIPIENT: '0x7952fef3a7ac44C2fF4a45CE47e498957111A867',
  
  // Fee percentages (industry standard: Coinbase ~1.49%, Robinhood ~0.5-1.5%)
  FEES: {
    BUY: 0.015,      // 1.5% on buys
    SELL: 0.015,     // 1.5% on sells
    SEND: 0.01,      // 1.0% on sends
    RECEIVE: 0.005,  // 0.5% on receives (lower to encourage deposits)
    CONVERT: 0.02,   // 2.0% on conversions (spread)
  },
  
  // Minimum fees in USD
  MIN_FEE_USD: 0.01,
};

/**
 * Calculate fee for a transaction
 * @param {number} amount - Transaction amount in USD
 * @param {string} type - Transaction type: 'BUY' | 'SELL' | 'SEND' | 'RECEIVE' | 'CONVERT'
 * @returns {object} { fee, netAmount, grossAmount }
 */
export function calculateFee(amount, type) {
  const feeRate = FEE_CONFIG.FEES[type] || 0.01;
  let fee = amount * feeRate;
  
  // Apply minimum fee
  if (fee < FEE_CONFIG.MIN_FEE_USD && amount > 0) {
    fee = FEE_CONFIG.MIN_FEE_USD;
  }
  
  // Round to 2 decimal places
  fee = Math.round(fee * 100) / 100;
  
  return {
    fee,
    feeRate,
    feePercent: feeRate * 100,
    netAmount: Math.round((amount - fee) * 100) / 100,
    grossAmount: amount,
    feeRecipient: FEE_CONFIG.FEE_RECIPIENT,
  };
}

/**
 * Process a transaction with fees (simulated backend call)
 * In production, this would be an API call to your backend
 */
export async function processTransactionWithFee(transaction) {
  const { amount, type, fromAddress, toAddress } = transaction;
  
  // Calculate fee
  const feeDetails = calculateFee(amount, type);
  
  // In production, this would:
  // 1. Deduct the full amount from user
  // 2. Send netAmount to destination
  // 3. Send fee to FEE_RECIPIENT address
  // 4. Record transaction in database
  
  console.log(`[FEE] Processing ${type} transaction:`, {
    grossAmount: feeDetails.grossAmount,
    fee: feeDetails.fee,
    netAmount: feeDetails.netAmount,
    feeRecipient: feeDetails.feeRecipient,
  });
  
  return {
    success: true,
    transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...feeDetails,
  };
}

export default FEE_CONFIG;
