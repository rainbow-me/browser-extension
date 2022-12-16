import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import {
  Box,
  Button,
  Inline,
  Rows,
  Separator,
  Symbol,
  Text,
} from '~/design-system';
import SeedPhraseTable from '~/entries/popup/components/SeedPhraseTable/SeedPhaseTable';

export function RecoveryPhrase() {
  const navigate = useNavigate();

  const [seed] = useState(
    // dummy seed for UI
    'hello hello hello hello hello hello hello hello hello hello hello hello',
  );

  const handleSavedTheseWords = React.useCallback(async () => {
    navigate(-2);
  }, [navigate]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(seed as string);
  }, [seed]);

  return (
    <Box
      background="surfaceSecondary"
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="20px"
      paddingTop="2px"
    >
      <Box alignItems="center" paddingBottom="6px" paddingHorizontal="12px">
        <Inline
          wrap={false}
          alignVertical="center"
          alignHorizontal="center"
          space="5px"
        >
          <Symbol
            symbol="doc.plaintext"
            size={18}
            color="orange"
            weight={'bold'}
          />
          <Text size="16pt" weight="bold" color="label" align="center">
            {i18n.t(
              'settings.privacy_and_security.wallets_and_keys.recovery_phrase.title',
            )}
          </Text>
        </Inline>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t(
              'settings.privacy_and_security.wallets_and_keys.recovery_phrase.subtitle',
            )}
          </Text>
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box paddingTop="24px">
        <SeedPhraseTable seed={seed} />
        <Box padding="12px">
          <Button
            color="accent"
            height="32px"
            variant="transparent"
            width="full"
            onClick={handleCopy}
            symbol="doc.on.doc"
          >
            {i18n.t('seed_reveal.copy_to_clipboard')}
          </Button>
        </Box>
      </Box>
      <Box width="full" paddingTop="80px">
        <Rows alignVertical="top" space="8px">
          <Button
            color="accent"
            height="44px"
            variant="flat"
            width="full"
            symbol="checkmark.circle.fill"
            blur="26px"
            onClick={handleSavedTheseWords}
          >
            {i18n.t(
              'settings.privacy_and_security.wallets_and_keys.recovery_phrase.saved',
            )}
          </Button>
        </Rows>
      </Box>
    </Box>
  );
}
