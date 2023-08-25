import { SupportedCurrencyKey } from '~/core/references';
import { AddressOrEth } from '~/core/types/assets';

const assetQueryFragment = (
  address: AddressOrEth,
  currency: SupportedCurrencyKey,
  index: number,
) => {
  return `Q${index}: token(address: "${address}", chainID: 1, currency: "${currency}") {
      colors {
        primary
        fallback
        shadow
      }
      circulatingSupply
      decimals
      description
      fullyDilutedValuation
      iconUrl
      marketCap
      name
      networks
      price {
        value
        relativeChange24h
      }
      symbol
      totalSupply
      volume1d
  }`;
};

export const createAssetQuery = (
  addresses: AddressOrEth[],
  currency: SupportedCurrencyKey,
) => {
  return `{
        ${addresses.map((a, i) => assetQueryFragment(a, currency, i)).join(',')}
    }`;
};
