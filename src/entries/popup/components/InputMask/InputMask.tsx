import React, { CSSProperties, Ref, useCallback } from 'react';

import { BoxStyles } from '~/design-system/styles/core.css';

import { Input } from '../../../../design-system/components/Input/Input';
import { InputHeight } from '../../../../design-system/components/Input/Input.css';

export const InputMask = ({
  borderColor,
  height,
  innerRef,
  placeholder,
  style,
  value,
  variant,
  onChange,
}: {
  borderColor: BoxStyles['borderColor'];
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
      const value = e.target.value;

      const partitions = value.split('.');

      const cleanPartitions = partitions.map((p) => p.replace(/[^0-9]/g, ''));

      const integerPart = cleanPartitions?.[0];

      const cleanIntegerPart =
        integerPart.length === 2 ? String(Number(integerPart)) : integerPart;

      const decimalsPart = cleanPartitions?.[1];
      const cleanDecimalsPart = decimalsPart?.substring(0, 6);

      const one =
        decimalsPart !== undefined
          ? [cleanIntegerPart, cleanDecimalsPart].join('.')
          : cleanIntegerPart;

      if (one === '.') {
        onChange('0.');
      } else {
        onChange(one);
      }
    },
    [onChange],
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
