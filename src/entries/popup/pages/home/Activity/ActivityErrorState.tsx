import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { ShortcutHint } from '~/entries/popup/components/ShortcutHint/ShortcutHint';

export const ActivityErrorState = ({
  onRetry,
}: {
  onRetry: () => Promise<void>;
}) => {
  return (
    <Stack
      alignHorizontal="center"
      gap="32px"
      padding="24px"
      paddingTop="48px"
      paddingBottom="60px"
    >
      <Symbol
        symbol="exclamationmark.triangle.fill"
        size={34}
        color="labelQuaternary"
      />
      <Stack alignHorizontal="center" gap="16px">
        <Text align="center" size="20pt" weight="bold" color="label">
          {i18n.t('activity.error_header')}
        </Text>
        <Text
          align="center"
          size="14pt"
          weight="semibold"
          color="labelTertiary"
          whiteSpace="pre-wrap"
        >
          {i18n.t('activity.error_description')}
        </Text>
        <Box
          as="button"
          onClick={onRetry}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
          }}
        >
          <Inline
            alignHorizontal="center"
            alignVertical="center"
            space="8px"
            wrap={false}
          >
            <Text size="15pt" weight="semibold" color="label">
              {i18n.t('activity.error_retry')}
            </Text>
            <ShortcutHint
              hint={shortcuts.activity.REFRESH_TRANSACTIONS.display}
              variant="flat"
            />
          </Inline>
        </Box>
      </Stack>
    </Stack>
  );
};
