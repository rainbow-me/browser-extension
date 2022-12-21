import { motion } from 'framer-motion';
import React, { CSSProperties, Ref, useCallback } from 'react';

import { Box, Inline, Text } from '~/design-system';
import { BoxStyles, textStyles } from '~/design-system/styles/core.css';
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
                as={'div'}
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'clip',
                  maxWidth: 153,
                  direction: 'rtl',
                  marginLeft: 17,
                  marginRight: 4,
                }}
                className={textStyles({
                  color: 'labelTertiary',
                  cursor: 'default',
                  fontFamily: 'rounded',
                  fontSize: '23pt',
                  fontWeight: 'semibold',
                  textAlign: 'center',
                })}
              >
                {`${value}`}
              </Box>
              <Text size="23pt" weight="semibold" color="labelTertiary">
                {placeholderSymbol}
              </Text>
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
