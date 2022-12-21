import { motion } from 'framer-motion';
import React, { CSSProperties, Ref, useCallback } from 'react';

import { Box, Inline, Text } from '~/design-system';
import { BoxStyles } from '~/design-system/styles/core.css';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { Input } from '../../../../design-system/components/Input/Input';
import { InputHeight } from '../../../../design-system/components/Input/Input.css';

import { maskInput } from './utils';

export const InputMask = ({
  borderColor,
  decimals,
  height,
  innerRef,
  placeholder,
  style,
  value,
  variant,
  onChange,
  placeholderSymbol,
}: {
  borderColor: BoxStyles['borderColor'];
  decimals?: number;
  height: InputHeight;
  innerRef: Ref<HTMLInputElement>;
  placeholder: string;
  style?: CSSProperties;
  value: string;
  variant: 'surface' | 'bordered' | 'transparent';
  onChange: (value: string) => void;
  placeholderSymbol?: string;
}) => {
  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = maskInput({ inputValue: e.target.value, decimals });
      onChange(maskedValue);
    },
    [decimals, onChange],
  );
  console.log('input mask value', value);
  return (
    <Box
      as={motion.div}
      whileTap={
        variant !== 'transparent'
          ? { scale: transformScales['0.96'] }
          : undefined
      }
      transition={transitions.bounce}
    >
      {value ? (
        <>
          <Box position="absolute" paddingTop="20px">
            <Inline alignVertical="center">
              <Box
                style={{
                  maxWidth: 153,
                  marginLeft: 17,
                  marginRight: 4,
                }}
              >
                <Box style={{ visibility: 'hidden' }}>
                  <Text size="23pt" weight="semibold" color="labelTertiary">
                    {value}
                  </Text>
                </Box>
              </Box>
              <Box paddingLeft="2px">
                <Text size="23pt" weight="semibold" color="labelTertiary">
                  {placeholderSymbol}
                </Text>
              </Box>
            </Inline>
          </Box>
        </>
      ) : null}

      <Input
        value={value}
        placeholder={placeholder}
        borderColor={borderColor}
        onChange={handleOnChange}
        height={height}
        variant={variant}
        innerRef={innerRef}
        style={style}
        enableTapScale={false}
      />
    </Box>
  );
};
