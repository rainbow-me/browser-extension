import React from 'react';
import Switch from 'react-switch';

const Toggle = ({
  checked,
  handleChange,
  disabled = false,
}: {
  checked: boolean;
  disabled?: boolean;
  handleChange: (checked: boolean) => void;
}) => {
  return (
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
  );
};

export { Toggle };
