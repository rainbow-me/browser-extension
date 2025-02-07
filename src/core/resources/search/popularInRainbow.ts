import { RainbowError, logger } from '~/logger';
import { trendingTokensHttp } from '~/core/network/trendingTokens';
import { ChainId } from '~/core/types/chains';
import { createQueryStore } from '~/core/state/internal/createQueryStore';
import { SearchAsset } from '~/core/types/search';
import { parseTokenSearch } from './parseTokenSearch';

const fiftenMinutes = 15 * 60 * 1000;
const oneDay = 24 * 60 * 60 * 1000;

export type PopularTokensParams = {
  chainId: ChainId;
};

async function popularTokensQueryFunction({ chainId }: PopularTokensParams) {
  const url = `/${chainId}`;

  try {
    const tokenSearch = await trendingTokensHttp.get<{ data: SearchAsset[] }>(url);
    return parseTokenSearch(tokenSearch.data.data, chainId);
  } catch (e) {
    logger.error(new RainbowError('[popularTokensQueryFunction]: Popular tokens failed'), { url });
    return [];
  }
}

export const usePopularTokensStore = createQueryStore<SearchAsset[], PopularTokensParams>(
  {
    fetcher: ({ chainId }) => popularTokensQueryFunction({ chainId }),
    cacheTime: oneDay,
    staleTime: fiftenMinutes,
  },

  { storageKey: 'popularInRainbow' }
);