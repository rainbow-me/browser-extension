import React, { useMemo } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';

import { TokenToReceiveInfo } from './TokenToReceiveInfo';
import { TokenToSwapInfo } from './TokenToSwapInfo';

type TokenInfoProps = {
  type: 'toReceive' | 'toSwap';
  asset: ParsedAddressAsset | null;
};

export function TokenInfo({ type, asset }: TokenInfoProps) {
  const component = useMemo(() => {
    switch (type) {
      case 'toReceive':
        return <TokenToReceiveInfo asset={asset} />;
      case 'toSwap':
        return <TokenToSwapInfo asset={asset} />;
    }
  }, [asset, type]);

  return component;
}
