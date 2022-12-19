import React, { useCallback, useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { ParsedAddressAsset } from '~/core/types/assets';
import { Box, Text } from '~/design-system';

import { CoinIcon } from '../../components/CoinIcon/CoinIcon';

import { InputWrapper } from './InputWrapper';

export const TokenInput = ({
  asset,
  shuffleAssetIndex,
  dropdownClosed = false,
}: {
  asset: ParsedAddressAsset | null;
  shuffleAssetIndex: (n?: number) => void;
  dropdownClosed: boolean;
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const onDropdownAction = useCallback(
    () => setDropdownVisible((dropdownVisible) => !dropdownVisible),
    [],
  );

  useEffect(() => {
    if (dropdownClosed) {
      setDropdownVisible(false);
    }
  }, [dropdownClosed]);

  return (
    <InputWrapper
      zIndex={1}
      dropdownHeight={377}
      leftComponent={
        <Box>
          <CoinIcon asset={asset ?? undefined} />
        </Box>
      }
      centerComponent={
        <Box width="fit">
          <Text
            size="16pt"
            weight="semibold"
            color={`${asset ? 'label' : 'labelTertiary'}`}
          >
            {asset?.name ?? i18n.t('send.input_token_placeholder')}
          </Text>
        </Box>
      }
      showActionClose={false}
      onActionClose={() => shuffleAssetIndex(-1)}
      dropdownComponent={
        <Box>
          <Text size="12pt" weight="bold">
            aaaaaaaa
          </Text>
        </Box>
      }
      dropdownVisible={dropdownVisible}
      onDropdownAction={onDropdownAction}
    />
  );
};
