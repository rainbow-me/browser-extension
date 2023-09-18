import React from 'react';
import Switch from 'react-switch';

import { useCurrentAddressStore } from '~/core/state';
import { useAvatar } from '~/entries/popup/hooks/useAvatar';

import { Box } from '../Box/Box';

interface ToggleProps {
  accentColor?: string;
  checked: boolean;
  disabled?: boolean;
  handleChange: (checked: boolean) => void;
  testId?: string;
  tabIndex?: number;
}

const Toggle = ({
  accentColor,
  checked,
  handleChange,
  disabled = false,
  tabIndex,
  testId,
}: ToggleProps) => {
  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });
  return (
    <Box testId={testId}>
      <Switch
        tabIndex={typeof tabIndex === 'number' ? tabIndex : 0}
        onChange={handleChange}
        checked={checked}
        className="react-switch"
        height={23}
        width={38}
        handleDiameter={19}
        uncheckedIcon={false}
        checkedIcon={false}
        onColor={accentColor || avatar?.color || '#268FFF'}
        activeBoxShadow={accentColor || avatar?.color || '#268FFF'}
        disabled={disabled}
      />
    </Box>
  );
};

export { Toggle };
