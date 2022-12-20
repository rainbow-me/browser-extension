import React, { CSSProperties, Ref, useCallback } from 'react';

import { BoxStyles } from '~/design-system/styles/core.css';

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
}) => {
  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = maskInput({ inputValue: e.target.value, decimals });
      onChange(maskedValue);
    },
    [decimals, onChange],
  );

  return (
    <Input
      value={value}
      placeholder={placeholder}
      borderColor={borderColor}
      onChange={handleOnChange}
      height={height}
      variant={variant}
      innerRef={innerRef}
      style={style}
    />
  );
};
