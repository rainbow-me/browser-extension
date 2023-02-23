import React, { RefObject } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';
import { Box } from '~/design-system';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

import { SwapInputMask } from '../../../components/InputMask/SwapInputMask/SwapInputMask';

const { innerWidth: windowWidth } = window;

export const TokenToSwapInput = ({
  asset,
  placeholder,
  innerRef,
}: {
  asset: ParsedAddressAsset | null;
  placeholder: string;
  innerRef?: RefObject<HTMLInputElement>;
}) => {
  return !asset ? (
    <Box width="fit">
      <TextOverflow
        maxWidth={windowWidth / 2}
        size="16pt"
        weight="semibold"
        color={`${asset ? 'label' : 'labelTertiary'}`}
      >
        {placeholder}
      </TextOverflow>
    </Box>
  ) : (
    <Box width="fit" marginVertical="-20px">
      <SwapInputMask
        borderColor="transparent"
        decimals={asset?.decimals}
        height="56px"
        placeholder="0.00"
        value={''}
        variant="transparent"
        onChange={() => null}
        paddingHorizontal={0}
        innerRef={innerRef}
      />
    </Box>
  );
};
