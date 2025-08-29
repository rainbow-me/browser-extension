import { useSettingsStore } from '~/core/state/currentSettings/store';
import { ChainId } from '~/core/types/chains';
import { GasSpeed } from '~/core/types/gas';

const shouldUseDefaultTxSpeed = (chainId: ChainId) =>
  chainId === ChainId.mainnet || chainId === ChainId.polygon;

export const useDefaultTxSpeed = ({ chainId }: { chainId: ChainId }) => {
  const [storeDefaultTxSpeed] = useSettingsStore('defaultTxSpeed');

  return {
    defaultTxSpeed: shouldUseDefaultTxSpeed(chainId)
      ? storeDefaultTxSpeed
      : GasSpeed.NORMAL,
  };
};
