import React, { useMemo } from 'react';

import {
  TokenToReceiveDropdown,
  TokenToReceiveDropdownProps,
} from './TokenToReceiveDropdown';
import {
  TokenToSwapDropdown,
  TokenToSwapDropdownProps,
} from './TokenToSwapDropdown';

type TokenDropdownProps = { type: 'toReceive' | 'toSwap' };

export function TokenDropdown({
  type,
  ...props
}: TokenDropdownProps &
  (TokenToReceiveDropdownProps | TokenToSwapDropdownProps)) {
  const dropdown = useMemo(() => {
    switch (type) {
      case 'toReceive':
        return (
          <TokenToReceiveDropdown
            asset={(props as TokenToReceiveDropdownProps)?.asset}
            assets={(props as TokenToReceiveDropdownProps)?.assets}
            onSelectAsset={
              (props as TokenToReceiveDropdownProps)?.onSelectAsset
            }
          />
        );
      case 'toSwap':
        return (
          <TokenToSwapDropdown
            asset={(props as TokenToSwapDropdownProps)?.asset}
            assets={(props as TokenToSwapDropdownProps)?.assets}
            sortMethod={(props as TokenToSwapDropdownProps)?.sortMethod}
            onSelectAsset={(props as TokenToSwapDropdownProps)?.onSelectAsset}
            setSortMethod={(props as TokenToSwapDropdownProps)?.setSortMethod}
          />
        );
    }
  }, [props, type]);

  return dropdown;
}
