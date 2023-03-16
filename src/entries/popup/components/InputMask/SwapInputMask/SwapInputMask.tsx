import { motion } from 'framer-motion';
import React, { CSSProperties, RefObject, useCallback } from 'react';

import { Box } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { BoxStyles, accentColorAsHsl } from '~/design-system/styles/core.css';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { InputHeight } from '../../../../../design-system/components/Input/Input.css';
import { maskInput } from '../utils';

interface SwapInputMaskProps {
  borderColor: BoxStyles['borderColor'];
  decimals?: number;
  height: InputHeight;
  innerRef?: RefObject<HTMLInputElement>;
  style?: CSSProperties;
  value: string;
  variant: 'surface' | 'bordered' | 'transparent' | 'tinted';
  onChange: (value: string) => void;
  paddingHorizontal?: number;
  placeholder: string;
  accentCaretColor?: boolean;
  testId?: string;
}

export const SwapInputMask = ({
  accentCaretColor = false,
  borderColor,
  decimals,
  height,
  innerRef,
  placeholder,
  style,
  value,
  variant,
  onChange,
  paddingHorizontal,
  testId,
}: SwapInputMaskProps) => {
  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = maskInput({ inputValue: e.target.value, decimals });
      onChange(maskedValue);
    },
    [decimals, onChange],
  );

  const onMaskClick = useCallback(() => {
    innerRef?.current?.focus();
  }, [innerRef]);
  console.log(`${testId ? testId + '-' : ''}swap-input-mask`);
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
            paddingRight: paddingHorizontal,
            paddingLeft: paddingHorizontal,
            caretColor: accentCaretColor ? accentColorAsHsl : undefined,
          }}
          enableTapScale={false}
          testId={`${testId ? testId + '-' : ''}swap-input-mask`}
        />
      </Box>
    </Box>
  );
};
