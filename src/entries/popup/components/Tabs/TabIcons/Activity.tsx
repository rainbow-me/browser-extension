import React from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { foregroundColors } from '~/design-system/styles/designTokens';

const ActivityIcon = () => {
  const { currentTheme } = useCurrentThemeStore();
  const color = foregroundColors.labelTertiary[currentTheme];

  return (
    <svg
      width={36 * 2}
      height={36 * 2}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.1249 18C10.1249 13.6508 13.6507 10.125 17.9999 10.125C22.3491 10.125 25.8749 13.6508 25.8749 18C25.8749 22.3492 22.3491 25.875 17.9999 25.875C13.6507 25.875 10.1249 22.3492 10.1249 18ZM17.9999 7.875C12.408 7.875 7.8749 12.4081 7.8749 18C7.8749 23.5919 12.408 28.125 17.9999 28.125C23.5918 28.125 28.1249 23.5919 28.1249 18C28.1249 12.4081 23.5918 7.875 17.9999 7.875ZM19.1249 12.6C19.1249 11.9787 18.6212 11.475 17.9999 11.475C17.3786 11.475 16.8749 11.9787 16.8749 12.6V16.875H14.3999C13.7786 16.875 13.2749 17.3787 13.2749 18C13.2749 18.6213 13.7786 19.125 14.3999 19.125H17.9999C18.6212 19.125 19.1249 18.6213 19.1249 18V12.6Z"
        fill={color}
      />
    </svg>
  );
};

export default ActivityIcon;
