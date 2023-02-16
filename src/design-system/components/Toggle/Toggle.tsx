import React from 'react';
import Switch from 'react-switch';

import { Box } from '../Box/Box';

const Toggle = ({
  checked,
  handleChange,
  disabled = false,
  testId,
}: {
  checked: boolean;
  disabled?: boolean;
  handleChange: (checked: boolean) => void;
  testId?: string;
}) => {
  return (
    <Box testId={testId}>
      <Switch
        onChange={handleChange}
        checked={checked}
        className="react-switch"
        height={23}
        width={38}
        handleDiameter={19}
        uncheckedIcon={false}
        checkedIcon={false}
        onColor="#268FFF"
        disabled={disabled}
      />
    </Box>
  );
};

export { Toggle };
