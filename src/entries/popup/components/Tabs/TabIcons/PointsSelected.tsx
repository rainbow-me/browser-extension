import chroma from 'chroma-js';
import React from 'react';

import { globalColors } from '~/design-system/styles/designTokens';

const PointsSelectedIcon = ({
  accentColor,
  colorMatrixValues,
  tintBackdrop,
  tintOpacity,
}: {
  accentColor: string;
  colorMatrixValues: number[] | null;
  tintBackdrop?: string;
  tintOpacity?: number;
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
      <g clipPath="url(#clip0_441_4724)">
        <g filter="url(#filter0_dd_441_4724)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20.105 8.09627C14.4751 6.8996 8.93488 10.0912 7.03966 15.3599C6.55617 16.704 7.18491 18.1896 8.49235 18.7737C8.64508 18.8419 8.79977 18.9069 8.95636 18.9687L14.1436 23.6442C14.4193 23.8928 14.6552 24.1055 14.8726 24.286C14.7595 24.3974 14.6632 24.5277 14.589 24.6734C14.4993 24.8494 14.451 25.0768 14.3543 25.5316C14.2576 25.9865 14.2093 26.2139 14.2196 26.4111C14.2477 26.9462 14.5591 27.4258 15.0366 27.6691C15.2125 27.7587 15.4399 27.8071 15.8948 27.9038C16.3496 28.0004 16.577 28.0488 16.7742 28.0384C17.3094 28.0104 17.7889 27.699 18.0322 27.2215C18.1219 27.0455 18.1702 26.8181 18.2669 26.3633C18.3636 25.9085 18.4119 25.681 18.4016 25.4838C18.393 25.3205 18.358 25.1623 18.3 25.0145C18.5721 24.9381 18.8741 24.8397 19.2271 24.7247L25.8675 22.5633C26.0357 22.5706 26.2035 22.5741 26.3708 22.5739C27.8028 22.5721 28.9814 21.4707 29.0864 20.0461C29.498 14.462 25.7349 9.29294 20.105 8.09627ZM14.1488 19.723C13.2372 19.8037 12.3038 19.7747 11.3656 19.6257L14.8237 22.7427C14.8992 22.8108 14.9702 22.8747 15.0372 22.9348L14.1488 19.723ZM17.3793 20.9198C18.036 21.0594 18.6921 21.1392 19.3417 21.1629L17.1311 23.8482C16.9188 24.1061 16.5041 24.0179 16.415 23.696L15.4877 20.3438C16.0908 20.5863 16.7227 20.7802 17.3793 20.9198ZM20.8174 21.1405C21.6173 21.585 22.4818 21.9381 23.3994 22.1835L18.9724 23.6245C18.8758 23.656 18.7851 23.6855 18.6995 23.7131L20.8174 21.1405Z"
            fill={accentColor}
          />
          <path
            d="M18.5304 11.0663C19.1313 10.2977 19.4886 10.2656 19.6371 10.2971C19.7856 10.3287 20.099 10.5034 20.3353 11.45C20.5565 12.3363 20.6046 13.5361 20.5466 14.8084C20.4895 16.062 20.3339 17.3053 20.1907 18.2417C20.1526 18.4908 20.1156 18.717 20.0819 18.9146C19.3486 18.9411 18.5994 18.8789 17.847 18.719C17.0946 18.5591 16.3849 18.3111 15.7258 17.9886C15.7753 17.7944 15.8335 17.5727 15.9 17.3297C16.1501 16.416 16.5136 15.2169 16.9713 14.0484C17.4359 12.8625 17.9678 11.7861 18.5304 11.0663Z"
            fill={
              tintBackdrop ||
              (useDarkForegroundColor ? globalColors.blueGrey100 : 'white')
            }
          />
          <path
            d="M18.5304 11.0663C19.1313 10.2977 19.4886 10.2656 19.6371 10.2971C19.7856 10.3287 20.099 10.5034 20.3353 11.45C20.5565 12.3363 20.6046 13.5361 20.5466 14.8084C20.4895 16.062 20.3339 17.3053 20.1907 18.2417C20.1526 18.4908 20.1156 18.717 20.0819 18.9146C19.3486 18.9411 18.5994 18.8789 17.847 18.719C17.0946 18.5591 16.3849 18.3111 15.7258 17.9886C15.7753 17.7944 15.8335 17.5727 15.9 17.3297C16.1501 16.416 16.5136 15.2169 16.9713 14.0484C17.4359 12.8625 17.9678 11.7861 18.5304 11.0663Z"
            fill={accentColor}
            fillOpacity={tintOpacity ?? '0.2'}
          />
          <path
            d="M24.4495 20.1224C23.6812 19.9591 22.9573 19.704 22.2863 19.3714C22.3257 19.1438 22.3696 18.8778 22.4149 18.5817C22.5649 17.6002 22.7323 16.272 22.7943 14.9108C22.8453 13.792 22.8284 12.5927 22.6474 11.5268C25.4261 13.2994 27.092 16.4954 26.8424 19.8808C26.8237 20.1346 26.619 20.3236 26.368 20.3239C25.7365 20.3247 25.0943 20.2594 24.4495 20.1224Z"
            fill={
              tintBackdrop ||
              (useDarkForegroundColor ? globalColors.blueGrey100 : 'white')
            }
          />
          <path
            d="M24.4495 20.1224C23.6812 19.9591 22.9573 19.704 22.2863 19.3714C22.3257 19.1438 22.3696 18.8778 22.4149 18.5817C22.5649 17.6002 22.7323 16.272 22.7943 14.9108C22.8453 13.792 22.8284 12.5927 22.6474 11.5268C25.4261 13.2994 27.092 16.4954 26.8424 19.8808C26.8237 20.1346 26.619 20.3236 26.368 20.3239C25.7365 20.3247 25.0943 20.2594 24.4495 20.1224Z"
            fill={accentColor}
            fillOpacity={tintOpacity ?? '0.2'}
          />
          <path
            d="M9.15679 16.1216C10.3057 12.9275 13.1275 10.6853 16.3869 10.1962C15.788 11.0962 15.2848 12.185 14.8763 13.2278C14.3794 14.4965 13.992 15.778 13.7299 16.7356C13.6508 17.0246 13.5827 17.2855 13.5261 17.5094C12.7779 17.5403 12.0129 17.4789 11.2445 17.3156C10.5997 17.1785 9.9866 16.9769 9.40996 16.7193C9.1808 16.617 9.07064 16.3611 9.15679 16.1216Z"
            fill={
              tintBackdrop ||
              (useDarkForegroundColor ? globalColors.blueGrey100 : 'white')
            }
          />
          <path
            d="M9.15679 16.1216C10.3057 12.9275 13.1275 10.6853 16.3869 10.1962C15.788 11.0962 15.2848 12.185 14.8763 13.2278C14.3794 14.4965 13.992 15.778 13.7299 16.7356C13.6508 17.0246 13.5827 17.2855 13.5261 17.5094C12.7779 17.5403 12.0129 17.4789 11.2445 17.3156C10.5997 17.1785 9.9866 16.9769 9.40996 16.7193C9.1808 16.617 9.07064 16.3611 9.15679 16.1216Z"
            fill={accentColor}
            fillOpacity={tintOpacity ?? '0.2'}
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_dd_441_4724"
          x="0.877197"
          y="3.84534"
          width="34.24"
          height="32.1945"
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
            values={`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${
              colorMatrixValues ? 0.02 : 0
            } 0`}
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_441_4724"
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
            values={`0 0 0 0 ${colorMatrixValues?.[0] || 0} 0 0 0 0 ${
              colorMatrixValues?.[1] || 0
            } 0 0 0 0 ${colorMatrixValues?.[2] || 0} 0 0 0 ${
              colorMatrixValues ? 0.2 : 0
            } 0`}
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_441_4724"
            result="effect2_dropShadow_441_4724"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_441_4724"
            result="shape"
          />
        </filter>
        <clipPath id="clip0_441_4724">
          <rect width="36" height="36" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PointsSelectedIcon;
