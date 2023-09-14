import { i18n } from '~/core/languages';
import { Box, Inset, Text } from '~/design-system';

export const NoActivity = () => {
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
          {i18n.t('activity.empty_header')}
        </Text>
      </Box>
      <Inset horizontal="40px">
        <Text
          align="center"
          size="12pt"
          weight="medium"
          color="labelQuaternary"
        >
          {i18n.t('activity.empty_description')}
        </Text>
      </Inset>
    </Box>
  );
};
