/**
 * Format price with currency symbol
 * Dollar sign before the number
 * Example: $100 or $1,000
 */
export const formatPrice = (price: number): string => {
  return `$${price.toLocaleString('en-US')}`;
};

/**
 * Format price in Congolese Franc
 */
export const formatPriceFC = (price: number): string => {
  return `${price.toLocaleString('fr-FR')} FC`;
};
