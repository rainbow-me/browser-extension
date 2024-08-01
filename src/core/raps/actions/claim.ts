import { metadataPostClient } from '~/core/graphql';
import { CLAIM_MOCK_DATA } from '~/entries/popup/pages/home/Points/references';

import { ActionProps } from '../references';

// This action is used to claim the rewards of the user
// by making an api call to the backend which would use a relayer
// to do the claim and send the funds to the user
export async function claim({
  parameters,
  wallet,
  baseNonce,
}: ActionProps<'claim'>) {
  const { address } = parameters;
  if (!address) {
    throw new Error('[CLAIM]: Invalid address');
  }
  // when IS_TESTING is true, we use mock data (can do as many as we want)
  // otherwise we do a real claim (can be done once, then backend needs to reset it)
  const claimInfo =
    process.env.IS_TESTING === 'true'
      ? CLAIM_MOCK_DATA
      : await metadataPostClient.claimUserRewards({ address });

  // Checking if we got the tx hash
  const txHash = claimInfo.claimUserRewards?.txHash;
  if (!txHash) {
    // If there's no transaction hash the relayer didn't submit the transaction
    // so we can't contnue
    throw new Error('[CLAIM]: missing tx hash from backend');
  }

  // We need to make sure the transaction is mined
  // so we get the transaction
  const claimTx = await wallet?.provider?.getTransaction(txHash);
  if (!claimTx) {
    // If we can't get the transaction we can't continue
    throw new Error('[CLAIM]: tx not found');
  }

  // then we wait for the receipt of the transaction
  // to conirm it was mined
  const receipt = await claimTx?.wait();
  if (!receipt) {
    // If we can't get the receipt we can't continue
    throw new Error('[CLAIM]: tx not mined');
  }

  // finally we check if the transaction was successful
  const success = receipt?.status === 1;
  if (!success) {
    // The transaction failed, we can't continue
    throw new Error('[CLAIM]: claim tx failed onchain');
  }

  // If the transaction was successful we can return the hash
  return {
    nonce: (baseNonce || 0) - 1,
    hash: txHash,
  };
}
