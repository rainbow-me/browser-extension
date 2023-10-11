import { Box, Inline, Symbol } from '~/design-system';
import { BoxStyles } from '~/design-system/styles/core.css';

import ExternalImage from '../ExternalImage/ExternalImage';

const SYMBOL_SIZE = {
  '60px': 32,
  '36px': 18,
  '32px': 16,
  '18px': 10,
  '16px': 8,
  '14px': 8,
};
const RADIUS_SIZE = {
  '60px': '9px' as BoxStyles['borderRadius'],
  '36px': '9px' as BoxStyles['borderRadius'],
  '32px': '9px' as BoxStyles['borderRadius'],
  '18px': '9px' as BoxStyles['borderRadius'],
  '16px': '4px' as BoxStyles['borderRadius'],
  '14px': '4px' as BoxStyles['borderRadius'],
};

export const DappIcon = ({
  appLogo,
  mask,
  size,
}: {
  appLogo?: string;
  mask?: string;
  size: '60px' | '36px' | '32px' | '18px' | '16px' | '14px';
}) => {
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
      borderRadius={RADIUS_SIZE[size]}
    >
      <Inline alignHorizontal="center" alignVertical="center" height="full">
        <ExternalImage mask={mask} src={appLogo} width={size} height={size} />
      </Inline>
    </Box>
  );
};
