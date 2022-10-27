import { Address } from 'wagmi';

/**
 * @desc Checks if a an address has previous transactions
 * @param  {String} address
 * @return {Promise<Boolean>}
 */
export const hasPreviousTransactions = async (
  address: Address,
): Promise<boolean> => {
  try {
    const url = `https://aha.rainbow.me/?address=${address}`;
    const response = await fetch(url);
    if (!response.ok) {
      return false;
    }

    const parsedResponse: {
      data: {
        addresses: Record<string, boolean>;
      };
    } = await response.json();

    return parsedResponse?.data?.addresses[address.toLowerCase()] === true;
  } catch (e) {
    return false;
  }
};
