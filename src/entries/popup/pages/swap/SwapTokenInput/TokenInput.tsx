import React, { RefObject, useState } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';
import { Box, Text } from '~/design-system';

import { SwapInputMask } from '../../../components/InputMask/SwapInputMask/SwapInputMask';

export const TokenInput = ({
  asset,
  placeholder,
  innerRef,
}: {
  asset: ParsedAddressAsset | null;
  placeholder: string;
  innerRef?: RefObject<HTMLInputElement>;
}) => {
  const [value, setValue] = useState('');

  return !asset ? (
    <Box width="fit">
      <Text
        size="16pt"
        weight="semibold"
        color={`${asset ? 'label' : 'labelTertiary'}`}
      >
        {placeholder}
      </Text>
    </Box>
  ) : (
    <Box width="fit" marginVertical="-20px">
      <SwapInputMask
        borderColor="transparent"
        decimals={asset?.decimals}
        height="56px"
        placeholder="0.00"
        value={value}
        variant="tinted"
        onChange={setValue}
        paddingHorizontal={0}
        innerRef={innerRef}
      />
    </Box>
  );
};
