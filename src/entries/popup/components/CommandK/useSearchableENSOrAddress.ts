import * as React from 'react';

import { truncateAddress } from '~/core/utils/address';
import { isENSAddressFormat } from '~/core/utils/ethereum';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { useDebounce } from '../../hooks/useDebounce';
import { useWallets } from '../../hooks/useWallets';
import { useValidateInput } from '../WatchWallet/WatchWallet';

import {
  ENSOrAddressSearchItem,
  SearchItemType,
  TokenSearchItem,
  UnownedTokenSearchItem,
} from './SearchItems';
import { CommandKPage, PAGES } from './pageConfig';
import { actionLabels } from './references';
import { useCommandKStatus } from './useCommandKStatus';
import { truncateName } from './useSearchableWallets';

export const useSearchableENSorAddress = ({
  currentPage,
  searchQuery,
  assets,
  isFetchingSearchAssets,
  setSelectedCommandNeedsUpdate,
}: {
  currentPage: CommandKPage;
  searchQuery: string;
  assets: (TokenSearchItem | UnownedTokenSearchItem)[];
  isFetchingSearchAssets: boolean;
  setSelectedCommandNeedsUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}): { searchableENSOrAddress: ENSOrAddressSearchItem[] } => {
  const { isFetching, setIsFetching } = useCommandKStatus();
  const { allWallets } = useWallets();

  const query = searchQuery.trim();
  const debouncedSearchQuery = useDebounce(query, 250);

  const validation = useValidateInput(debouncedSearchQuery);

  const searchableENSOrAddress = React.useMemo<ENSOrAddressSearchItem[]>(() => {
    if (currentPage !== PAGES.HOME) return [];

    if (
      validation.address &&
      !validation.error &&
      !isFetchingSearchAssets &&
      !allWallets.some((wallet) => wallet.address === validation.address) &&
      !assets.some((asset) =>
        isLowerCaseMatch(asset.address, validation.address),
      )
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
  }, [
    isFetchingSearchAssets,
    currentPage,
    assets,
    allWallets,
    validation.address,
    validation.ensName,
    validation.error,
  ]);

  React.useLayoutEffect(() => {
    const shouldStartFetching =
      currentPage === PAGES.HOME &&
      !validation.address &&
      !validation.error &&
      isENSAddressFormat(debouncedSearchQuery) &&
      !isFetching;
    const shouldStopFetching =
      (currentPage !== PAGES.HOME ||
        validation.address ||
        validation.error ||
        !isENSAddressFormat(debouncedSearchQuery)) &&
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
    debouncedSearchQuery,
    setIsFetching,
    setSelectedCommandNeedsUpdate,
    validation,
  ]);

  return { searchableENSOrAddress };
};
