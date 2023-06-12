import { motion } from 'framer-motion';
import React, { RefObject, useCallback, useState } from 'react';

import { Box, Inline, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { accentColorAsHsl } from '~/design-system/styles/core.css';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { maskInput } from '../../components/InputMask/utils';

export const SlippageInputMask = ({
  value,
  variant,
  onChange,
  inputRef,
}: {
  value: string;
  variant: 'surface' | 'bordered' | 'transparent';
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement>;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = maskInput({
        inputValue: e.target.value,
        decimals: 1,
        integers: 2,
      });
      onChange(maskedValue);
    },
    [onChange],
  );

  const onMaskClick = useCallback(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  const onBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <Box
      style={{ width: '72px' }}
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
        style={{ zIndex: 2, width: 72, height: 34 }}
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
              %
            </Text>
          </Box>
        </Inline>
      </Box>

      <Box backdropFilter="opacity(0%)">
        <Input
          onBlur={onBlur}
          value={`${value}`}
          placeholder={'0'}
          borderColor={isFocused ? 'accent' : 'separator'}
          onChange={handleOnChange}
          height="34px"
          variant={variant}
          innerRef={inputRef}
          enableTapScale={false}
          testId="slippage-input-mask"
          style={{
            textAlign: 'center',
            paddingRight: 30,
            caretColor: accentColorAsHsl,
          }}
        />
      </Box>
    </Box>
  );
};
