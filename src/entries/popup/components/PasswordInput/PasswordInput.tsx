import React, { useCallback, useRef, useState } from 'react';

import { Box, Symbol } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';

export function PasswordInput({
  placeholder,
  testId,
  value,
  onChange,
}: {
  placeholder: string;
  testId?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
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
        console.log('detected cursor position', cursorPosition);
      }
      onChange(e);
    },
    [onChange],
  );

  const toggleVisibility = useCallback(() => {
    setVisible(!visible);
    if (inputRef.current) {
      const input = inputRef.current as HTMLInputElement;
      console.log('setting cursor position', cursorPosition);
      input.focus();
      setTimeout(() => {
        input.setSelectionRange(cursorPosition, cursorPosition);
      });
    }
  }, [cursorPosition, visible]);

  return (
    <Box testId={testId}>
      <Input
        height="44px"
        variant="bordered"
        placeholder={placeholder}
        value={value}
        onChange={handleOnChange}
        type={visible ? 'text' : 'password'}
        innerRef={inputRef}
      />
      <Box position="relative">
        <Box
          position="absolute"
          style={{
            top: '-30px',
            right: '10px',
          }}
        >
          <button
            onClick={toggleVisibility}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <Symbol
              symbol={!visible ? 'eye' : 'eye.slash.fill'}
              size={16}
              weight="regular"
              color={visible ? 'label' : 'labelTertiary'}
            />
          </button>
        </Box>
      </Box>
    </Box>
  );
}
