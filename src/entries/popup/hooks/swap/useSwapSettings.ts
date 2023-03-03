import { Source } from '@rainbow-me/swaps';
import { useCallback, useState } from 'react';

export interface SwapSettings {
  source: Source | 'auto';
  slippage: string;
  flashbotsEnabled: boolean;
  setSource: (route: Source | 'auto') => void;
  setSlippage: (slippage: string) => void;
  setFlashbotsEnabled: (enabled: boolean) => void;
  setDefaultSettings: () => void;
}

export const useSwapSettings = (): SwapSettings => {
  const [source, setSource] = useState<Source | 'auto'>('auto');
  const [slippage, setSlippage] = useState<string>('2');
  const [flashbotsEnabled, setFlashbotsEnabled] = useState<boolean>(false);

  const setDefaultSettings = useCallback(() => {
    setSource('auto');
    setSlippage('2');
    setFlashbotsEnabled(false);
  }, []);

  return {
    source,
    slippage,
    flashbotsEnabled,
    setSource,
    setSlippage,
    setFlashbotsEnabled,
    setDefaultSettings,
  };
};
