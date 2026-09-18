/**
 * SoleVault Currency Helper - Strictly INR (₹)
 * As per specification: "Currency should be in INR only"
 */

export const formatINR = (amount: number | undefined | null): string => {
  const num = typeof amount === 'number' ? amount : 0;
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
};

export const formatINRPrecise = (amount: number | undefined | null): string => {
  const num = typeof amount === 'number' ? amount : 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';
