import { motion } from 'framer-motion';
import React, { CSSProperties, RefObject, useCallback, useMemo } from 'react';

import { Box } from '~/design-system';
import { BoxStyles, accentColorAsHsl } from '~/design-system/styles/core.css';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { Input } from '../../../../../design-system/components/Input/Input';
import { InputHeight } from '../../../../../design-system/components/Input/Input.css';
import { maskInput } from '../utils';

export const SwapInputMask = ({
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
  paddingHorizontal,
}: {
  borderColor: BoxStyles['borderColor'];
  decimals?: number;
  height: InputHeight;
  innerRef?: RefObject<HTMLInputElement>;
  placeholder: string;
  style?: CSSProperties;
  value: string;
  variant: 'surface' | 'bordered' | 'transparent';
  onChange: (value: string) => void;
  placeholderSymbol?: string;
  paddingHorizontal?: number;
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
            paddingRight: paddingHorizontal || value ? 125 + symbolPadding : 0,
            paddingLeft: paddingHorizontal,
            caretColor: accentColorAsHsl,
          }}
          enableTapScale={false}
          testId="swap-input-mask"
        />
      </Box>
    </Box>
  );
};
