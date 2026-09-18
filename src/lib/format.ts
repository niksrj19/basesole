// Centralized INR Currency Formatter
export const formatINR = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  return '₹' + Math.round(amount).toLocaleString('en-IN');
};

export const formatINRDecimal = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
