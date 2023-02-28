import { ParsedAddressAsset } from '~/core/types/assets';

const INITIAL_TO_SWAP_HEIGHT = 452;
const INITIAL_TO_RECEIVE_HEIGHT = 376;
const EXTRA_INFO_HEIGHT = 24;

export const useSwapDropdownDimensions = ({
  assetToSwap,
  assetToReceive,
}: {
  assetToSwap: ParsedAddressAsset | null;
  assetToReceive: ParsedAddressAsset | null;
}) => {
  return {
    toSwapInputHeight:
      INITIAL_TO_SWAP_HEIGHT - (!assetToSwap ? 0 : EXTRA_INFO_HEIGHT),
    toReceiveInputHeight:
      INITIAL_TO_RECEIVE_HEIGHT -
      (!assetToSwap ? 0 : EXTRA_INFO_HEIGHT) -
      (!assetToReceive ? 0 : EXTRA_INFO_HEIGHT),
  };
};
