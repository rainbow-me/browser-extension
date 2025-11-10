import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { Box, Inline, Text } from '~/design-system';
import { ShortcutHint } from '~/entries/popup/components/ShortcutHint/ShortcutHint';

import { ErrorState } from '../ErrorState';

export const BalancesErrorState = ({
  onRetry,
}: {
  onRetry: () => Promise<void>;
}) => {
  return (
    <ErrorState
      headerText={i18n.t('tokens_tab.error_header')}
      descriptionText={i18n.t('tokens_tab.error_description')}
    >
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
            {i18n.t('tokens_tab.error_retry')}
          </Text>
          <ShortcutHint
            hint={shortcuts.tokens.REFRESH_TOKENS.display}
            variant="flat"
          />
        </Inline>
      </Box>
    </ErrorState>
  );
};
