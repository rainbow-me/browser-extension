import { ParsedSearchAsset } from '~/core/types/assets';
import { SearchAsset } from '~/core/types/search';

const INITIAL_TO_SWAP_HEIGHT = 452;
const INITIAL_TO_RECEIVE_HEIGHT = 376;
const EXTRA_INFO_HEIGHT = 24;

export const useSwapDropdownDimensions = ({
  assetToSell,
  assetToBuy,
}: {
  assetToSell: ParsedSearchAsset | SearchAsset | null;
  assetToBuy: ParsedSearchAsset | SearchAsset | null;
}) => {
  return {
    toSellInputHeight:
      INITIAL_TO_SWAP_HEIGHT - (!assetToSell ? 0 : EXTRA_INFO_HEIGHT),
    toBuyInputHeight:
      INITIAL_TO_RECEIVE_HEIGHT -
      (!assetToSell ? 0 : EXTRA_INFO_HEIGHT) -
      (!assetToBuy ? 0 : EXTRA_INFO_HEIGHT),
  };
};
