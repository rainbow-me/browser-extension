import { Contract } from '@ethersproject/contracts';
import { getDefaultProvider } from '@ethersproject/providers';
import { erc20Abi } from 'viem';

export async function tokenBalance(addy: string, contract: string) {
  try {
    const provider = getDefaultProvider('http://127.0.0.1:8545');
    const testContract = new Contract(contract, erc20Abi, provider);
    const balance = await testContract.balanceOf(addy);

    return balance;
  } catch (error) {
    console.error('Error fetching on-chain balance:', error);
    throw error;
  }
}

export async function transactionStatus() {
  const provider = getDefaultProvider('http://127.0.0.1:8545');
  const blockData = await provider.getBlock('latest');
  const txnReceipt = await provider.getTransactionReceipt(
    blockData.transactions[0],
  );
  const txnStatus = txnReceipt.status === 1 ? 'success' : 'failure';
  return txnStatus;
}
