const parseTokenInfo = (token: AboutTokenQuery['token']) => {
  const f = createCurrencyFormatter();
  if (!token) return token;
  return {
    allTime: {
      high: f(token.allTime.highValue),
      low: f(token.allTime.lowValue),
    },
    circulatingSupply: f(token.circulatingSupply),
    fullyDilutedValuation: f(token.fullyDilutedValuation),
    marketCap: f(token.marketCap),
    totalSupply: f(token.totalSupply),
    volume1d: f(token.volume1d),
    networks: Object.entries(token.networks).map(([chainId, network]) => ({
      chainId: +chainId as ChainId,
      ...(network as { address: Address; decimals: number }),
    })),
    description: token.description,
    links: token.links as Record<string, { url?: string }>,
  };
};
export const useTokenInfo = ({
  address,
  chainId,
}: {
  address: Address | typeof ETH_ADDRESS;
  chainId: ChainId;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const args = { address, chainId, currency: currentCurrency };
  return useQuery({
    queryFn: () =>
      metadataClient.aboutToken(args).then((d) => parseTokenInfo(d.token)),
    queryKey: createQueryKey('token about info', args),
  });
};
