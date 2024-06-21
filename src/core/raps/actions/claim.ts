import { metadataPostClient } from '~/core/graphql';
import { CLAIM_MOCK_DATA } from '~/entries/popup/pages/home/Points/references';

import { ActionProps } from '../references';

export async function claim({
  parameters,
  wallet,
  baseNonce,
}: ActionProps<'claim'>) {
  const { address } = parameters;
  if (!address) {
    throw new Error('Invalid address');
  }
  const claimInfo =
    process.env.INTERNAL_BUILD === 'true'
      ? CLAIM_MOCK_DATA
      : await metadataPostClient.claimUserRewards({ address });

  const txHash = claimInfo.claimUserRewards?.txHash;
  if (!txHash) {
    throw new Error('Failed to claim rewards');
  }
  const claimTx = await wallet?.provider?.getTransaction(txHash);
  await claimTx?.wait();

  return {
    nonce: (baseNonce || 0) - 1,
    hash: txHash,
  };
}
