import { ActionProps } from '../references';

export async function claim({
  parameters,
  wallet,
  baseNonce,
}: ActionProps<'claim'>) {
  const { claimHash } = parameters;
  const claimTx = await wallet?.provider?.getTransaction(claimHash);
  await claimTx?.wait();
  return {
    nonce: (baseNonce || 0) - 1,
    hash: claimHash,
  };
}
