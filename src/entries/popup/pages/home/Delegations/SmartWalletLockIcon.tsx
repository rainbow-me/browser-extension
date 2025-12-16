import { Box, Symbol } from '~/design-system';

export const SmartWalletLockIcon = ({ size = 28 }: { size?: number }) => {
  return (
    <Box
      width="fit"
      padding="12px"
      borderRadius="12px"
      style={{
        background: 'linear-gradient(180deg, #7A70FF 0%, #FF7AB8 100%)',
      }}
    >
      <Symbol symbol="lock.fill" size={size} weight="semibold" color="label" />
    </Box>
  );
};
