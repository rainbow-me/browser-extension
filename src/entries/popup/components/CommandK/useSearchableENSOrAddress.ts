import * as React from 'react';

import { truncateAddress } from '~/core/utils/address';
import { isENSAddressFormat } from '~/core/utils/ethereum';

import { useWallets } from '../../hooks/useWallets';
import { useValidateInput } from '../WatchWallet/WatchWallet';

import { ENSOrAddressSearchItem, SearchItemType } from './SearchItems';
import { CommandKPage, PAGES } from './pageConfig';
import { actionLabels } from './references';
import { useCommandKStatus } from './useCommandKStatus';
import { truncateName } from './useSearchableWallets';

export const useSearchableENSorAddress = (
  currentPage: CommandKPage,
  searchQuery: string,
  setSelectedCommandNeedsUpdate: React.Dispatch<React.SetStateAction<boolean>>,
): { searchableENSOrAddress: ENSOrAddressSearchItem[] } => {
  const { isFetching, setIsFetching } = useCommandKStatus();
  const { allWallets } = useWallets();

  const query = searchQuery.trim();
  const validation = useValidateInput(query);
  const [cache, setCache] = React.useState<
    Record<string, ENSOrAddressSearchItem[]>
  >({});

  const searchableENSOrAddress = React.useMemo<ENSOrAddressSearchItem[]>(() => {
    if (currentPage !== PAGES.HOME) return [];

    if (cache[query]) {
      return cache[query];
    }

    if (
      validation.address &&
      !validation.error &&
      !allWallets.some((wallet) => wallet.address === validation.address)
    ) {
      const ensName = validation.ensName || null;
      return [
        {
          actionLabel: actionLabels.view,
          address: validation.address,
          ensName: ensName,
          id: validation.address,
          name: ensName || truncateAddress(validation.address),
          page: PAGES.HOME,
          toPage: PAGES.UNOWNED_WALLET_DETAIL,
          truncatedName:
            truncateName(ensName) || truncateAddress(validation.address),
          type: SearchItemType.ENSOrAddressResult,
        },
      ];
    }

    return [];
  }, [allWallets, cache, currentPage, query, validation]);

  React.useLayoutEffect(() => {
    const shouldStartFetching =
      currentPage === PAGES.HOME &&
      !validation.address &&
      !validation.error &&
      isENSAddressFormat(query) &&
      !isFetching;
    const shouldStopFetching =
      (currentPage !== PAGES.HOME ||
        validation.address ||
        validation.error ||
        !isENSAddressFormat(query)) &&
      !!isFetching;

    if (shouldStartFetching) {
      setIsFetching(true);
    } else if (shouldStopFetching) {
      setIsFetching(false);
      setSelectedCommandNeedsUpdate(true);
    }
  }, [
    currentPage,
    isFetching,
    query,
    setIsFetching,
    setSelectedCommandNeedsUpdate,
    validation,
  ]);

  React.useEffect(() => {
    if (
      searchableENSOrAddress.length &&
      searchableENSOrAddress !== cache[query]
    ) {
      setCache((prev) => ({ ...prev, [query]: searchableENSOrAddress }));
    }
  }, [cache, query, searchableENSOrAddress]);

  return { searchableENSOrAddress };
};
