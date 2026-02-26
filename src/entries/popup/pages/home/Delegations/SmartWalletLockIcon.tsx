import { useCurrentThemeStore } from '~/core/state';
import { Box, Symbol } from '~/design-system';

const iconGradients = {
  light: 'linear-gradient(180deg, #C6B8FF 0%, #FFB8E2 100%)',
  dark: 'linear-gradient(180deg, #7A70FF 0%, #FF7AB8 100%)',
} as const;

export const SmartWalletLockIcon = ({ size = 28 }: { size?: number }) => {
  const currentTheme = useCurrentThemeStore((s) => s.currentTheme);
  const isDark = currentTheme === 'dark';
  const gradient = iconGradients[isDark ? 'dark' : 'light'];

  return (
    <Box
      width="fit"
      padding="12px"
      borderRadius="12px"
      style={{ background: gradient }}
    >
      <Symbol symbol="lock.fill" size={size} weight="semibold" color="label" />
    </Box>
  );
};
