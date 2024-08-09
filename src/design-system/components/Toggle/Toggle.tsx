import { KeyboardEventHandler } from 'react';
import Switch from 'react-switch';

import { shortcuts } from '~/core/references/shortcuts';
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
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === shortcuts.global.SELECT.key) {
      handleChange(!checked);
    }
  };
  return (
    <Box testId={testId} style={{ height: 23 }}>
      <Switch
        tabIndex={typeof tabIndex === 'number' ? tabIndex : 0}
        onChange={handleChange}
        checked={!!checked}
        className="react-switch"
        height={23}
        width={38}
        handleDiameter={19}
        uncheckedIcon={false}
        checkedIcon={false}
        onColor={accentColor || avatar?.color || '#268FFF'}
        boxShadow={`0px 0px 1px 2px transparent`}
        activeBoxShadow={`0px 0px 2px 4px ${
          accentColor || avatar?.color || '#268FFF'
        }`}
        disabled={disabled}
        onKeyDown={onKeyDown}
      />
    </Box>
  );
};

export { Toggle };
