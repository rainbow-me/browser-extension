import React, { KeyboardEvent, useCallback, useRef, useState } from 'react';

import { Box, ButtonSymbol } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { BoxStyles } from '~/design-system/styles/core.css';

export function PasswordInput({
  placeholder,
  testId,
  value,
  borderColor,
  onChange,
  onBlur,
  onSubmit,
  tabIndex,
  autoFocus,
}: {
  placeholder: string;
  testId?: string;
  value: string;
  borderColor?: BoxStyles['borderColor'];
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onSubmit?: () => void;
  tabIndex?: number;
  autoFocus?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef(null);

  const [cursorPosition, setCursorPosition] = useState(0);

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (inputRef.current) {
        const input = inputRef.current as HTMLInputElement;
        const cursorPosition = input.selectionStart;
        setCursorPosition(cursorPosition || 0);
      }
      onChange(e);
    },
    [onChange],
  );

  const toggleVisibility = useCallback(() => {
    setVisible(!visible);
    if (inputRef.current) {
      const input = inputRef.current as HTMLInputElement;
      input.focus();
      setTimeout(() => {
        input.setSelectionRange(cursorPosition, cursorPosition);
      });
    }
  }, [cursorPosition, visible]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onSubmit?.();
      }
    },
    [onSubmit],
  );

  return (
    <Box>
      <Input
        height="40px"
        variant="bordered"
        placeholder={placeholder}
        value={value}
        onChange={handleOnChange}
        onBlur={onBlur}
        type={visible ? 'text' : 'password'}
        innerRef={inputRef}
        borderColor={borderColor}
        testId={testId}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        autoFocus={autoFocus}
      />
      <Box position="relative">
        <Box
          position="absolute"
          style={{
            top: '-40px',
            right: '5px',
            height: '40px',
          }}
          paddingVertical="2px"
        >
          <ButtonSymbol
            color="accent"
            symbolColor={visible ? 'label' : 'labelTertiary'}
            height="36px"
            variant="transparent"
            symbol={!visible ? 'eye' : 'eye.slash.fill'}
            onClick={toggleVisibility}
          />
        </Box>
      </Box>
    </Box>
  );
}
