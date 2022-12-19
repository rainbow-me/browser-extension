import * as React from 'react';

import {
  accentColorAsHsl,
  foregroundColorVars,
} from '~/design-system/styles/core.css';
import { ForegroundColor } from '~/design-system/styles/designTokens';

export type LogoWithLettersProps = {
  color?: 'accent' | ForegroundColor;
  width?: number;
  height?: number;
};

export function LogoWithLetters({
  color = 'label',
  width = 162,
  height = 40,
}: LogoWithLettersProps) {
  const colorForTheme =
    color === 'accent' ? accentColorAsHsl : foregroundColorVars[color];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width,
        height,
      }}
      fill="none"
      viewBox="0 0 162 40"
    >
      <circle cx="16" cy="20" r="16" fill="url(#a)" />
      <mask
        id="b"
        width="18"
        height="18"
        x="7"
        y="11"
        maskUnits="userSpaceOnUse"
        style={{ maskType: 'alpha' }}
      >
        <path
          fill="#C4C4C4"
          d="M7 20.45v-8.1c0-.746.604-1.35 1.35-1.35C17.546 11 25 18.454 25 27.65A1.35 1.35 0 0 1 23.65 29h-8.1a1.35 1.35 0 0 1-1.35-1.35 5.85 5.85 0 0 0-5.85-5.85A1.35 1.35 0 0 1 7 20.45Z"
        />
      </mask>
      <g mask="url(#b)">
        <mask
          id="c"
          width="18"
          height="18"
          x="7"
          y="11"
          maskUnits="userSpaceOnUse"
          style={{ maskType: 'alpha' }}
        >
          <path
            fill="#C4C4C4"
            d="M7 15.05V11h18v18h-4.05v-1.35c0-6.959-5.641-12.6-12.6-12.6H7Z"
          />
        </mask>
        <g mask="url(#c)">
          <path fill="#6759FF" d="M2.5 6.5h27v27h-27v-27Z" />
          <g filter="url(#d)">
            <path
              fill="#FF4000"
              d="M2.5 12.35h5.85c8.45 0 15.3 6.85 15.3 15.3v5.85H2.5V12.35Z"
            />
          </g>
        </g>
        <mask
          id="e"
          width="15"
          height="15"
          x="7"
          y="14"
          maskUnits="userSpaceOnUse"
          style={{ maskType: 'alpha' }}
        >
          <path
            fill="#C4C4C4"
            d="M7 18.65V14.6h1.35c7.207 0 13.05 5.843 13.05 13.05V29h-4.05v-1.35a9 9 0 0 0-9-9H7Z"
          />
        </mask>
        <g mask="url(#e)">
          <path fill="#FF7F00" d="M2.5 14.6h18.9v18.9H2.5V14.6Z" />
          <g filter="url(#f)">
            <path
              fill="#FF0"
              d="M2.5 15.95h5.85c6.462 0 11.7 5.238 11.7 11.7v5.85H2.5V15.95Z"
            />
          </g>
        </g>
        <mask
          id="g"
          width="11"
          height="11"
          x="7"
          y="18"
          maskUnits="userSpaceOnUse"
          style={{ maskType: 'alpha' }}
        >
          <path
            fill="#C4C4C4"
            d="M7 20.45V18.2h1.35a9.45 9.45 0 0 1 9.45 9.45V29h-2.25a1.35 1.35 0 0 1-1.35-1.35 5.85 5.85 0 0 0-5.85-5.85A1.35 1.35 0 0 1 7 20.45Z"
          />
        </mask>
        <g mask="url(#g)">
          <path
            fill="#00E513"
            d="M2.5 18.2h5.85a9.45 9.45 0 0 1 9.45 9.45v5.85H2.5V18.2Z"
          />
        </g>
        <mask
          id="i"
          width="11"
          height="11"
          x="7"
          y="18"
          maskUnits="userSpaceOnUse"
          style={{ maskType: 'alpha' }}
        >
          <path
            fill="#C4C4C4"
            d="M7 29V18.2h1.35a9.45 9.45 0 0 1 9.45 9.45V29H7Z"
          />
        </mask>
        <g filter="url(#h)" mask="url(#i)">
          <path
            fill="#0AF"
            d="M2.5 19.55h5.85a8.1 8.1 0 0 1 8.1 8.1v5.85H2.5V19.55Z"
          />
        </g>
      </g>
      <path
        fill={colorForTheme}
        d="M45.484 31h4.563v-9.375c0-.813.14-1.5.422-2.063.281-.562.687-.99 1.218-1.28.532-.292 1.172-.438 1.922-.438.334 0 .646.026.938.078.292.041.531.099.719.172v-4.016a3.68 3.68 0 0 0-.594-.125 5.328 5.328 0 0 0-.719-.047c-.979 0-1.797.287-2.453.86-.656.572-1.11 1.375-1.36 2.406h-.093V14.25h-4.563V31Zm16.235.266c.74 0 1.422-.11 2.047-.328a5.631 5.631 0 0 0 1.672-.954c.5-.416.906-.911 1.218-1.484h.094V31h4.563V19.516c0-1.125-.297-2.11-.891-2.953-.584-.844-1.406-1.495-2.469-1.954-1.062-.468-2.318-.703-3.766-.703-1.468 0-2.74.23-3.812.688-1.063.448-1.896 1.073-2.5 1.875a5.235 5.235 0 0 0-1.016 2.75l-.015.187h4.172l.03-.14c.115-.542.423-.99.923-1.344.5-.354 1.177-.531 2.031-.531.896 0 1.578.218 2.047.656.469.427.703 1.01.703 1.75v5.078a2.78 2.78 0 0 1-.469 1.578c-.302.459-.724.823-1.265 1.094-.532.26-1.136.39-1.813.39-.792 0-1.422-.171-1.89-.515-.47-.354-.704-.839-.704-1.453v-.032c0-.593.23-1.067.688-1.421.458-.365 1.125-.573 2-.625l5.844-.375v-2.844l-6.532.406c-1.385.094-2.562.35-3.53.766-.97.416-1.71.99-2.22 1.718-.51.72-.765 1.589-.765 2.61v.031c0 .98.234 1.854.703 2.625a5.02 5.02 0 0 0 1.984 1.797c.844.427 1.823.64 2.938.64ZM74.36 31h4.562V14.25h-4.563V31Zm2.28-18.906c.688 0 1.266-.235 1.735-.703a2.283 2.283 0 0 0 .703-1.672 2.25 2.25 0 0 0-.703-1.672c-.469-.469-1.047-.703-1.734-.703-.688 0-1.266.234-1.735.703a2.25 2.25 0 0 0-.703 1.672c0 .646.234 1.203.703 1.672.469.468 1.047.703 1.735.703ZM81.984 31h4.563v-9.625c0-.74.135-1.385.406-1.938a3.094 3.094 0 0 1 1.172-1.28c.5-.313 1.088-.47 1.766-.47 1.02 0 1.786.303 2.296.907.521.593.782 1.437.782 2.531V31h4.562V20.187c0-1.968-.505-3.505-1.515-4.609-1-1.114-2.422-1.672-4.266-1.672-1.26 0-2.318.276-3.172.828A5.21 5.21 0 0 0 86.641 17h-.094v-2.75h-4.563V31Zm28.36.344c1.406 0 2.62-.35 3.64-1.047 1.021-.698 1.808-1.698 2.36-3 .552-1.302.828-2.86.828-4.672v-.016c0-1.823-.276-3.38-.828-4.672-.552-1.302-1.339-2.296-2.36-2.984-1.01-.698-2.218-1.047-3.625-1.047-.791 0-1.526.13-2.203.39a5.164 5.164 0 0 0-1.75 1.126 5.64 5.64 0 0 0-1.218 1.734h-.094V8.453h-4.563V31h4.563v-2.86h.094a5.5 5.5 0 0 0 1.203 1.72c.5.468 1.083.833 1.75 1.093.666.26 1.401.39 2.203.39Zm-1.516-3.782c-.739 0-1.39-.197-1.953-.593-.563-.407-1-.98-1.313-1.719-.312-.74-.468-1.615-.468-2.625v-.016c0-1.01.156-1.88.468-2.609.323-.74.761-1.307 1.313-1.703.563-.406 1.214-.61 1.953-.61.75 0 1.401.198 1.953.594.563.396.995.964 1.297 1.703.302.73.453 1.604.453 2.625v.016c0 1.01-.151 1.885-.453 2.625-.302.74-.729 1.313-1.281 1.719-.552.396-1.208.593-1.969.593Zm18.375 3.782c1.688 0 3.151-.344 4.391-1.032 1.239-.697 2.198-1.697 2.875-3 .687-1.302 1.031-2.864 1.031-4.687v-.031c0-1.813-.344-3.365-1.031-4.657-.688-1.302-1.657-2.296-2.907-2.984-1.239-.698-2.697-1.047-4.374-1.047-1.667 0-3.12.35-4.36 1.047-1.239.698-2.203 1.698-2.89 3-.688 1.292-1.032 2.839-1.032 4.64v.032c0 1.813.339 3.37 1.016 4.672.677 1.302 1.635 2.302 2.875 3 1.239.698 2.708 1.047 4.406 1.047Zm.016-3.578c-.75 0-1.401-.198-1.953-.594-.552-.406-.98-.99-1.282-1.75-.291-.771-.437-1.703-.437-2.797v-.031c0-1.084.151-2.006.453-2.766.302-.76.724-1.338 1.266-1.734.552-.407 1.192-.61 1.922-.61.739 0 1.385.203 1.937.61.552.396.979.974 1.281 1.734.302.76.453 1.682.453 2.766v.031c0 1.094-.151 2.026-.453 2.797-.291.76-.713 1.344-1.265 1.75-.542.396-1.183.594-1.922.594ZM140.969 31h4.797l3.015-11.844h.094L151.906 31h4.86l4.437-16.75h-4.5l-2.547 12.422h-.094l-2.984-12.422h-4.375l-2.969 12.422h-.093l-2.532-12.422h-4.593L140.969 31Z"
      />
      <defs>
        <filter
          id="d"
          width="29.25"
          height="29.25"
          x="-1.55"
          y="8.3"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur
            result="effect1_foregroundBlur_4437_165110"
            stdDeviation="2.025"
          />
        </filter>
        <filter
          id="f"
          width="25.65"
          height="25.65"
          x="-1.55"
          y="11.9"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur
            result="effect1_foregroundBlur_4437_165110"
            stdDeviation="2.025"
          />
        </filter>
        <filter
          id="h"
          width="22.05"
          height="22.05"
          x="-1.55"
          y="15.5"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur
            result="effect1_foregroundBlur_4437_165110"
            stdDeviation="2.025"
          />
        </filter>
        <linearGradient
          id="a"
          x1="16"
          x2="16"
          y1="4"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#174299" />
          <stop offset="1" stopColor="#001E59" />
        </linearGradient>
      </defs>
    </svg>
  );
}
