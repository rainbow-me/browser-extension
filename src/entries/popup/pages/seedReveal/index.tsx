import React, { useCallback, useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import {
  Box,
  Button,
  Inline,
  Rows,
  Separator,
  Symbol,
  Text,
} from '~/design-system';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import SeedPhraseTable from '../../components/SeedPhraseTable/SeedPhaseTable';
import { exportWallet } from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function SeedReveal() {
  const navigate = useRainbowNavigate();

  const [seed, setSeed] = useState('');
  const { currentAddress } = useCurrentAddressStore();

  useEffect(() => {
    const init = async () => {
      const seedPhrase = await exportWallet(currentAddress, '');
      setSeed(seedPhrase);
    };
    init();
  }, [currentAddress]);

  const handleSavedTheseWords = React.useCallback(async () => {
    navigate(ROUTES.SEED_VERIFY);
  }, [navigate]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(seed as string);
  }, [seed]);

  return (
    <FullScreenContainer>
      <Box alignItems="center" paddingBottom="10px">
        <Inline
          wrap={false}
          alignVertical="center"
          alignHorizontal="center"
          space="5px"
        >
          <Symbol
            symbol="doc.plaintext"
            size={16}
            color="orange"
            weight={'bold'}
          />
          <Text size="16pt" weight="bold" color="label" align="center">
            {i18n.t('seed_reveal.title')}
          </Text>
        </Inline>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t('seed_reveal.write_down_seed_importance')}
          </Text>
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box paddingTop="28px">
        <SeedPhraseTable seed={seed} />
        <Box>
          <Button
            color="accent"
            height="44px"
            variant="transparent"
            width="full"
            onClick={handleCopy}
            symbol="doc.on.doc"
          >
            {i18n.t('common_actions.copy_to_clipboard')}
          </Button>
        </Box>
      </Box>
      <Box width="full" style={{ paddingTop: '100px' }}>
        <Rows alignVertical="top" space="8px">
          <Button
            color="accent"
            height="44px"
            variant="flat"
            width="full"
            symbol="checkmark.circle.fill"
            blur="26px"
            onClick={handleSavedTheseWords}
            testId="saved-these-words-button"
          >
            {i18n.t('seed_reveal.saved_these_words')}
          </Button>
        </Rows>
      </Box>
    </FullScreenContainer>
  );
}
