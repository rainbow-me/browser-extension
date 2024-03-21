import { motion } from 'framer-motion';
import React, { forwardRef, useCallback, useRef, useState } from 'react';

import { Box, Inline, Text } from '~/design-system';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';
import { mergeRefs } from '~/entries/popup/utils/mergeRefs';

import { Input } from '../../../../../design-system/components/Input/Input';
import { maskInput } from '../utils';

const GWEI_DECIMALS = 9;

export const GweiInputMask = forwardRef<
  HTMLInputElement,
  {
    value: string;
    variant: 'surface' | 'bordered' | 'transparent';
    onChange: (value: string) => void;
  }
>(function GweiInputMask({ value, variant, onChange }, ref) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>();

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = maskInput({
        inputValue: e.target.value,
        decimals: GWEI_DECIMALS,
      });
      onChange(maskedValue);
    },
    [onChange],
  );

  const onMaskClick = useCallback(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  const onFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

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
      onClick={onMaskClick}
    >
      <Box
        position="absolute"
        paddingHorizontal="12px"
        style={{ zIndex: 2, width: 98, height: 34 }}
        paddingTop="12px"
      >
        <Inline space="2px" alignVertical="center" alignHorizontal="center">
          <Box style={{ visibility: 'hidden', maxWidth: 38 }}>
            <Text size="14pt" weight="semibold" color="label">
              {value === '' ? 0 : value}
            </Text>
          </Box>
          <Box>
            <Text size="14pt" weight="semibold" color="label">
              Gwei
            </Text>
          </Box>
        </Inline>
      </Box>

      <Box backdropFilter="opacity(0%)">
        <Input
          onFocus={onFocus}
          onBlur={onBlur}
          value={`${value}`}
          placeholder={'0'}
          borderColor={isFocused ? 'accent' : 'separator'}
          onChange={handleOnChange}
          height="34px"
          variant={variant}
          innerRef={mergeRefs(inputRef, ref)}
          enableTapScale={false}
          testId="gwei-input-mask"
          style={{
            textAlign: 'center',
            paddingRight: 50,
          }}
          tabIndex={0}
        />
      </Box>
    </Box>
  );
});
