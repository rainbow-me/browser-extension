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

  console.log('claim action called with params', parameters);
  const claimInfo =
    process.env.IS_TESTING === 'true'
      ? CLAIM_MOCK_DATA
      : await metadataPostClient.claimUserRewards({ address });

  console.log('ENV VARS', {
    IS_TESTING: process.env.IS_TESTING,
    INTERNAL_BUILD: process.env.INTERNAL_BUILD,
  });

  console.log('got claim tx hash', claimInfo);

  const txHash = claimInfo.claimUserRewards?.txHash;
  if (!txHash) {
    console.log('did not get tx hash', claimInfo);
    throw new Error('Failed to claim rewards');
  }
  console.log('getting claim tx');
  const claimTx = await wallet?.provider?.getTransaction(txHash);
  console.log('got claim tx', claimTx);
  console.log('waiting for claim tx to be mined');
  const receipt = await claimTx?.wait();
  console.log('got claim tx receipt', receipt);

  const success = receipt?.status === 1;
  if (!success) {
    console.log('claim tx failed', receipt);
    throw new Error('Failed to claim rewards');
  }
  console.log('Claimed succesful');

  return {
    nonce: (baseNonce || 0) - 1,
    hash: txHash,
  };
}
