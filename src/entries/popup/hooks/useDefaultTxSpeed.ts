import { useDefaultTxSpeedStore } from '~/core/state/currentSettings/defaultTxSpeed';
import { ChainId } from '~/core/types/chains';
import { GasSpeed } from '~/core/types/gas';

const shouldUseDefaultTxSpeed = (chainId: ChainId) =>
  chainId === ChainId.mainnet || chainId === ChainId.polygon;

export const useDefaultTxSpeed = ({ chainId }: { chainId: ChainId }) => {
  const { defaultTxSpeed: storeDefaultTxSpeed } = useDefaultTxSpeedStore();

  return {
    defaultTxSpeed: shouldUseDefaultTxSpeed(chainId)
      ? storeDefaultTxSpeed
      : GasSpeed.NORMAL,
  };
};
