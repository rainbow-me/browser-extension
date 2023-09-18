import chroma from 'chroma-js';
import React from 'react';

import { globalColors } from '~/design-system/styles/designTokens';

const HomeSelectedIcon = ({
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
      <g clipPath="url(#clip0_201_1056)">
        <g filter="url(#filter0_dd_201_1056)">
          <path
            d="M19.057 7.98882C18.3664 7.79027 17.6338 7.79027 16.9432 7.98882C16.4932 8.11819 16.1116 8.34201 15.7413 8.60891C15.3903 8.86201 14.9918 9.19754 14.5236 9.59191L10.1739 13.2547C9.69546 13.657 9.30391 13.9862 9.01411 14.4012C8.75915 14.7662 8.5699 15.173 8.45488 15.6032C8.32414 16.0922 8.32453 16.6037 8.32501 17.2288L8.32507 22.76C8.32505 23.4778 8.32503 24.0837 8.36559 24.58C8.40806 25.0999 8.50055 25.5978 8.74197 26.0716C9.10868 26.7913 9.69383 27.3765 10.4136 27.7432C10.8874 27.9846 11.3853 28.0771 11.9051 28.1196C12.4014 28.1601 13.0073 28.1601 13.7251 28.1601H22.275C22.9928 28.1601 23.5987 28.1601 24.095 28.1196C24.6148 28.0771 25.1128 27.9846 25.5866 27.7432C26.3063 27.3765 26.8915 26.7913 27.2582 26.0716C27.4996 25.5978 27.5921 25.0999 27.6345 24.58C27.6751 24.0837 27.6751 23.4778 27.6751 22.76L27.6751 17.2288C27.6756 16.6037 27.676 16.0922 27.5453 15.6032C27.4302 15.173 27.241 14.7662 26.986 14.4012C26.6962 13.9862 26.3047 13.657 25.8262 13.2547L21.4766 9.59191C21.0083 9.19755 20.6099 8.86201 20.2588 8.60891C19.8886 8.34201 19.5069 8.11819 19.057 7.98882Z"
            fill={accentColor}
          />
        </g>
        <rect
          x="15.3"
          y="18.2619"
          width="5.4"
          height="6.3"
          rx="1.35"
          fill={useDarkForegroundColor ? globalColors.blueGrey100 : 'white'}
        />
        <rect
          x="15.3"
          y="18.2619"
          width="5.4"
          height="6.3"
          rx="1.35"
          fill={accentColor}
          fillOpacity="0.2"
        />
      </g>
      <defs>
        <filter
          id="filter0_dd_201_1056"
          x="2.32495"
          y="3.8399"
          width="31.3503"
          height="32.3202"
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
            result="effect1_dropShadow_201_1056"
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
            in2="effect1_dropShadow_201_1056"
            result="effect2_dropShadow_201_1056"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_201_1056"
            result="shape"
          />
        </filter>
        <clipPath id="clip0_201_1056">
          <rect width="36" height="36" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default HomeSelectedIcon;
