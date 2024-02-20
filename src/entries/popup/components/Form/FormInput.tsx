import React, { forwardRef } from 'react';

import { Box, Inline } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { BoxStyles } from '~/design-system/styles/core.css';

import { Spinner } from '../Spinner/Spinner';

interface FormInputProps {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  value?: string | number;
  borderColor?: BoxStyles['borderColor'];
  loading?: boolean;
  spellCheck?: boolean;
  tabIndex?: number;
  testId?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput(
    {
      onChange,
      onBlur,
      placeholder,
      value,
      borderColor,
      loading,
      spellCheck,
      tabIndex,
      testId,
    },
    ref,
  ) {
    return (
      <Box position="relative">
        <Inline alignVertical="center">
          <Input
            innerRef={ref}
            onChange={onChange}
            height="32px"
            placeholder={placeholder}
            variant="surface"
            value={value || ''}
            onBlur={onBlur}
            spellCheck={spellCheck}
            borderColor={borderColor}
            style={{
              paddingRight: 30,
            }}
            tabIndex={tabIndex}
            testId={testId}
          />
          {loading && (
            <Box position="absolute" right="8px">
              <Spinner color="accent" size={16} />
            </Box>
          )}
        </Inline>
      </Box>
    );
  },
);

export { FormInput };
