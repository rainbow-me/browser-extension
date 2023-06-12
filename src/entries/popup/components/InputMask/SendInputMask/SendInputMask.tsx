import { motion } from 'framer-motion';
import React, { CSSProperties, RefObject, useCallback, useMemo } from 'react';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box, Inline, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { BoxStyles, accentColorAsHsl } from '~/design-system/styles/core.css';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { InputHeight } from '../../../../../design-system/components/Input/Input.css';
import { maskInput } from '../utils';

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
        style={{
          height: 56,
          width: POPUP_DIMENSIONS.width - 64,
        }}
      />

      {value ? (
        <>
          <Box position="absolute" paddingTop="20px">
            <Inline alignVertical="center">
              <Box
                style={{
                  maxWidth:
                    POPUP_DIMENSIONS.width - (value ? 200 + symbolPadding : 0),
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

      <Box backdropFilter="opacity(0%)">
        <Input
          value={value}
          placeholder={placeholder}
          borderColor={borderColor}
          onChange={handleOnChange}
          height={height}
          variant={variant}
          innerRef={innerRef}
          style={{
            paddingRight: value ? 118 + symbolPadding : 0,
            caretColor: accentColorAsHsl,
          }}
          enableTapScale={false}
          testId="send-input-mask"
          tabIndex={0}
        />
      </Box>
    </Box>
  );
};
