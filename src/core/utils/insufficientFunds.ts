/**
 * Utility functions for handling insufficient funds errors
 */

export interface InsufficientFundsError extends Error {
  code: 'INSUFFICIENT_FUNDS';
}

/**
 * Creates an insufficient funds error
 */
export const createInsufficientFundsError = (
  message = 'Insufficient funds for transaction',
): InsufficientFundsError => {
  const error = new Error(message) as InsufficientFundsError;
  error.code = 'INSUFFICIENT_FUNDS';
  return error;
};

/**
 * Checks if an error is an insufficient funds error
 */
export const isInsufficientFundsError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;

  const errorMessage = error.message.toLowerCase();
  const errorCode = (error as { code?: string | number }).code;

  return (
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('insufficient balance') ||
    errorMessage.includes('insufficient eth') ||
    errorMessage.includes('insufficient gas') ||
    errorMessage.includes('exceeds balance') ||
    errorMessage.includes('balance too low') ||
    errorCode === 'INSUFFICIENT_FUNDS' ||
    errorCode === 'UNPREDICTABLE_GAS_LIMIT' ||
    (typeof errorCode === 'string' && errorCode.includes('INSUFFICIENT'))
  );
};
