import { i18n } from '~/core/languages';
import { Box, Button, Inset, Text } from '~/design-system';

export const ActivityErrorState = ({
  onRetry,
}: {
  onRetry: () => Promise<void>;
}) => {
  const handleRetry = async () => {
    await onRetry();
  };

  return (
    <Box
      width="full"
      height="full"
      justifyContent="center"
      alignItems="center"
      paddingTop="104px"
    >
      <Box paddingBottom="14px">
        <Text
          align="center"
          size="20pt"
          weight="semibold"
          color="labelTertiary"
        >
          {i18n.t('activity.error_header')}
        </Text>
      </Box>
      <Inset horizontal="40px">
        <Text
          align="center"
          size="12pt"
          weight="medium"
          color="labelQuaternary"
        >
          {i18n.t('activity.error_description')}
        </Text>
      </Inset>
      <Box
        paddingTop="24px"
        display="flex"
        justifyContent="center"
        width="full"
      >
        <Button
          color="labelSecondary"
          height="28px"
          variant="transparent"
          onClick={handleRetry}
        >
          {i18n.t('activity.error_retry')}
        </Button>
      </Box>
    </Box>
  );
};
