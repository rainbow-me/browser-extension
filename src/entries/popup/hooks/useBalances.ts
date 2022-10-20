// import { erc20ABI, useContractReads } from 'wagmi';
// import { useUserAssets } from '~/core/resources/assets';

// TODO: grab address from wagmi, use popupStore for currency, configure chainId
export function useBalances({ address, currency }) {
  const { data: assets } = useUserAssets({ address, currency });
  console.log('assets: ', assets);
  const { data: balances } = useContractReads({
    contracts: Object.keys(assets).map((address) => ({
      abi: erc20ABI,
      address: address,
      chainId: 1,
      functionName: 'balanceOf',
      args: [address],
    })),
  });
  return balances;
}
