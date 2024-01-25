import { Box, Inline, Symbol } from '~/design-system';
import { BoxStyles } from '~/design-system/styles/core.css';

import ExternalImage from '../ExternalImage/ExternalImage';

type DappIconSize = '60px' | '36px' | '32px' | '18px' | '16px' | '14px';

const SYMBOL_SIZE = {
  '60px': 32,
  '36px': 18,
  '32px': 16,
  '18px': 10,
  '16px': 8,
  '14px': 8,
};

const RADIUS_SIZE = {
  '60px': '18px',
  '36px': '10px',
  '32px': '9px',
  '18px': '6px',
  '16px': '4px',
  '14px': '4px',
} satisfies Record<DappIconSize, BoxStyles['borderRadius']>;

export const DappIcon = ({
  appLogo,
  mask,
  size,
}: {
  appLogo?: string;
  mask?: string;
  size: DappIconSize;
}) => {
  console.log('-- DappIcon', appLogo);
  if (!appLogo) {
    return (
      <Box
        borderRadius={RADIUS_SIZE[size]}
        borderWidth="1px"
        borderColor="separatorTertiary"
        background="fillQuaternary"
        style={{
          ...(mask
            ? {
                maskImage: `url(${mask})`,
                WebkitMaskImage: `url(${mask})`,
              }
            : {
                maskImage: 'initial',
                WebkitMaskImage: 'initial',
              }),
          ...{ width: size, height: size },
        }}
      >
        <Inline alignHorizontal="center" alignVertical="center" height="full">
          <Symbol
            symbol="safari.fill"
            color="labelQuaternary"
            weight="bold"
            size={SYMBOL_SIZE[size]}
          />
        </Inline>
      </Box>
    );
  }
  return (
    <Box
      style={{
        height: size,
        width: size,
        overflow: 'hidden',
      }}
    >
      <Inline alignHorizontal="center" alignVertical="center" height="full">
        <ExternalImage
          borderRadius={RADIUS_SIZE[size]}
          customFallback={
            <Box
              alignItems="center"
              background="fillQuaternary"
              borderColor="separatorTertiary"
              borderRadius={RADIUS_SIZE[size]}
              borderWidth="1px"
              display="flex"
              height="full"
              justifyContent="center"
              width="full"
            >
              <Box opacity="0.5">
                <Symbol
                  color="labelQuaternary"
                  size={Math.min(parseFloat(size) / 2.3, 24)}
                  symbol="safari.fill"
                  weight="heavy"
                />
              </Box>
            </Box>
          }
          mask={mask}
          src={appLogo}
          width={size}
          height={size}
        />
      </Inline>
    </Box>
  );
};
