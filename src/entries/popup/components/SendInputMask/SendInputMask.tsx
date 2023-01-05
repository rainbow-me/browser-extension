import { motion } from 'framer-motion';
import React, { CSSProperties, RefObject, useCallback, useMemo } from 'react';

import { Box, Inline, Text } from '~/design-system';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { BoxStyles, accentColorAsHsl } from '~/design-system/styles/core.css';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { Input } from '../../../../design-system/components/Input/Input';
import { InputHeight } from '../../../../design-system/components/Input/Input.css';

import { maskInput } from './utils';

const { innerWidth: windowWidth } = window;

export const SendInputMask = ({
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
  innerRef: RefObject<HTMLInputElement>;
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

  const symbolPadding = useMemo(
    () => ((placeholderSymbol?.length || 3) - 3) * 18,
    [placeholderSymbol],
  );

  const onMaskClick = useCallback(() => {
    innerRef?.current?.focus();
  }, [innerRef]);

  return (
    <Box
      width="full"
      as={motion.div}
      whileTap={
        variant !== 'transparent'
          ? { scale: transformScales['0.96'] }
          : undefined
      }
      transition={transitions.bounce}
      style={style}
      onClick={onMaskClick}
    >
      <Box
        position="absolute"
        background={'accent'}
        opacity="0.04"
        borderRadius="14px"
        width="full"
        style={{ height: 56, width: windowWidth - 64, zIndex: 0 }}
      />

      {value ? (
        <>
          <Box position="absolute" paddingTop="20px" style={{ zIndex: 99 }}>
            <Inline alignVertical="center">
              <Box
                style={{
                  maxWidth: value
                    ? windowWidth - 210 - symbolPadding
                    : windowWidth,
                  marginLeft: 17,
                  marginRight: 4,
                  marginTop: 1,
                }}
              >
                <Box style={{ visibility: 'hidden' }}>
                  <Text size="23pt" weight="semibold" color="labelTertiary">
                    {value}
                  </Text>
                </Box>
              </Box>
              <Box paddingLeft="2px">
                <TextOverflow
                  maxWidth={100}
                  size="23pt"
                  weight="semibold"
                  color="labelTertiary"
                >
                  {placeholderSymbol}
                </TextOverflow>
              </Box>
            </Inline>
          </Box>
        </>
      ) : null}

      <Box
        style={{ zIndex: 99 }}
        backdropFilter="opacity(0%)"
        // background="accent"
      >
        <Input
          value={value}
          placeholder={placeholder}
          borderColor={borderColor}
          onChange={handleOnChange}
          height={height}
          variant={variant}
          innerRef={innerRef}
          style={{
            paddingRight: value ? 125 + symbolPadding : 0,
            caretColor: accentColorAsHsl,
          }}
          enableTapScale={false}
          testId="send-input-mask"
        />
      </Box>
    </Box>
  );
};
