import chroma from 'chroma-js';
import React from 'react';

import { globalColors } from '~/design-system/styles/designTokens';

const ActivitySelectedIcon = ({
  accentColor,
  colorMatrixValues,
}: {
  accentColor: string;
  colorMatrixValues: number[];
}) => {
  const useDarkForegroundColor = chroma.contrast(accentColor, '#fff') < 2.125;

  return (
    <svg
      width={36 * 2}
      height={36 * 2}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_201_1064)">
        <g filter="url(#filter0_dd_201_1064)">
          <path
            d="M18 7.875C12.4081 7.875 7.875 12.4081 7.875 18C7.875 23.5919 12.4081 28.125 18 28.125C23.5919 28.125 28.125 23.5919 28.125 18C28.125 12.4081 23.5919 7.875 18 7.875Z"
            fill={accentColor}
          />
        </g>
        <path
          d="M17.9999 11.475C18.6212 11.475 19.1249 11.9787 19.1249 12.6V18C19.1249 18.6214 18.6212 19.125 17.9999 19.125H14.3999C13.7786 19.125 13.2749 18.6214 13.2749 18C13.2749 17.3787 13.7786 16.875 14.3999 16.875H16.8749V12.6C16.8749 11.9787 17.3786 11.475 17.9999 11.475Z"
          fill={useDarkForegroundColor ? globalColors.blueGrey100 : 'white'}
        />
        <path
          d="M17.9999 11.475C18.6212 11.475 19.1249 11.9787 19.1249 12.6V18C19.1249 18.6214 18.6212 19.125 17.9999 19.125H14.3999C13.7786 19.125 13.2749 18.6214 13.2749 18C13.2749 17.3787 13.7786 16.875 14.3999 16.875H16.8749V12.6C16.8749 11.9787 17.3786 11.475 17.9999 11.475Z"
          fill={accentColor}
          fillOpacity="0.2"
        />
      </g>
      <defs>
        <filter
          id="filter0_dd_201_1064"
          x="1.875"
          y="3.875"
          width="32.25"
          height="32.25"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="3" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_201_1064"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="3" />
          <feColorMatrix
            type="matrix"
            values={`0 0 0 0 ${colorMatrixValues[0]} 0 0 0 0 ${colorMatrixValues[1]} 0 0 0 0 ${colorMatrixValues[2]} 0 0 0 0.2 0`}
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_201_1064"
            result="effect2_dropShadow_201_1064"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_201_1064"
            result="shape"
          />
        </filter>
        <clipPath id="clip0_201_1064">
          <rect width="36" height="36" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ActivitySelectedIcon;
