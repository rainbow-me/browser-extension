import { Box, Inline, Text } from '~/design-system';

const shortcutHintVariants = {
  elevated: {
    background: 'fillSecondary',
    boxShadow: '1px',
  },
  flat: {
    background: 'fillSecondary',
    borderColor: 'fill',
    borderWidth: '1.5px',
  },
  pressed: {
    background: 'fill',
    borderColor: 'fillTertiary',
    borderWidth: '1.5px',
  },
} as const;

export const ShortcutHint = ({
  hint,
  small,
  variant = 'elevated',
}: {
  hint: string;
  small?: boolean;
  variant?: keyof typeof shortcutHintVariants;
}) => {
  const height = small ? '14px' : '18px';
  const width = small ? '16px' : '18px';
  const widthKey = (hint?.length || 0) > 1 ? 'minWidth' : 'width';
  const props = shortcutHintVariants[variant];
  return (
    <Box
      padding="4px"
      borderRadius={small ? '4px' : '5px'}
      style={{ [widthKey]: width, height }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      <Inline alignHorizontal="center" alignVertical="center">
        <Box
          style={
            variant === 'elevated' ? { marginTop: small ? -1 : 1 } : undefined
          }
        >
          <Text
            size={small ? '11pt' : '12pt'}
            color="labelSecondary"
            weight="bold"
          >
            {hint}
          </Text>
        </Box>
      </Inline>
    </Box>
  );
};
