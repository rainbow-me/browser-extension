import { metadataPostClient } from '~/core/graphql';
import { CLAIM_MOCK_DATA } from '~/entries/popup/pages/home/Points/references';

import { ActionProps } from '../references';

export async function claim({
  parameters,
  wallet,
  baseNonce,
}: ActionProps<'claim'>) {
  const { address } = parameters;
  const claimInfo =
    process.env.IS_TESTING === 'true'
      ? CLAIM_MOCK_DATA
      : await metadataPostClient.claimUserRewards({ address });

  const txHash = claimInfo.claimUserRewards?.txHash;
  if (!txHash) {
    throw new Error('Failed to claim rewards');
  }
  const claimTx = await wallet?.provider?.getTransaction(txHash);
  await claimTx?.wait();

  const tx = {
    nonce: (baseNonce || 0) - 1,
    hash: txHash,
  };

  return tx;
}
