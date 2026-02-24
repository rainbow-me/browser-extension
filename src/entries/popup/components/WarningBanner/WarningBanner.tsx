import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { TextColor } from '~/design-system/styles/designTokens';

type WarningBannerColor = 'orange' | 'red' | 'blue' | 'green';

interface WarningBannerProps {
  /** Main message text */
  message: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Color theme for the banner */
  color?: WarningBannerColor;
  /** Custom icon symbol (defaults based on color) */
  symbol?: SymbolProps['symbol'];
}

const colorToBackground: Record<WarningBannerColor, string> = {
  orange: 'rgba(255, 149, 0, 0.08)',
  red: 'rgba(255, 59, 48, 0.08)',
  blue: 'rgba(0, 122, 255, 0.08)',
  green: 'rgba(52, 199, 89, 0.08)',
};

const colorToSymbol: Record<WarningBannerColor, SymbolProps['symbol']> = {
  orange: 'info.circle.fill',
  red: 'exclamationmark.triangle.fill',
  blue: 'info.circle.fill',
  green: 'checkmark.circle.fill',
};

export function WarningBanner({
  message,
  action,
  color = 'orange',
  symbol,
}: WarningBannerProps) {
  const iconSymbol = symbol ?? colorToSymbol[color];

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      paddingHorizontal="12px"
      paddingVertical="12px"
      gap="12px"
      borderRadius="12px"
      borderWidth="1.5px"
      borderColor={color}
      style={{ backgroundColor: colorToBackground[color] }}
    >
      <Symbol
        symbol={iconSymbol}
        size={16}
        weight="medium"
        color={color as TextColor}
      />
      <Stack space="8px">
        <Text size="12pt" weight="semibold" color="label">
          {message}
        </Text>
        {action && (
          <Box
            as="button"
            onClick={action.onClick}
            background="transparent"
            style={{ cursor: 'pointer' }}
          >
            <Inline alignVertical="center" space="4px">
              <Text size="12pt" weight="bold" color="accent">
                {action.label}
              </Text>
              <Symbol
                symbol="arrow.right"
                size={10}
                weight="bold"
                color="accent"
              />
            </Inline>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
