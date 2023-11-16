import React, { forwardRef } from 'react';

import { Input } from '~/design-system/components/Input/Input';
import { BoxStyles } from '~/design-system/styles/core.css';

interface FormInputProps {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  value?: string;
  borderColor?: BoxStyles['borderColor'];
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ onChange, onBlur, placeholder, value, borderColor }, ref) => {
    return (
      <Input
        innerRef={ref}
        onChange={onChange}
        height="32px"
        placeholder={placeholder}
        variant="surface"
        value={value}
        onBlur={onBlur}
        borderColor={borderColor}
      />
    );
  },
);

FormInput.displayName = 'FormInput';

export { FormInput };
