import React, { useCallback, useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useWalletBackupsStore } from '~/core/state/walletBackups';
import {
  Bleed,
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import SeedPhraseTable from '../../components/SeedPhraseTable/SeedPhraseTable';
import { triggerToast } from '../../components/Toast/Toast';
import { getImportWalletSecrets } from '../../handlers/importWalletSecrets';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function SeedReveal() {
  const navigate = useRainbowNavigate();
  const setWalletBackedUp = useWalletBackupsStore.use.setWalletBackedUp();
  const [seed, setSeed] = useState('');
  const { currentAddress } = useCurrentAddressStore();

  useEffect(() => {
    const init = async () => {
      const secrets = await getImportWalletSecrets();
      setSeed(secrets[0]);
    };
    init();
  }, [currentAddress]);

  const handleSavedTheseWords = React.useCallback(() => {
    setWalletBackedUp({ address: currentAddress });
    navigate(ROUTES.SEED_VERIFY);
  }, [currentAddress, navigate, setWalletBackedUp]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(seed as string);
    triggerToast({
      title: i18n.t('seed_reveal.copied'),
    });
  }, [seed]);

  return (
    <FullScreenContainer>
      <Rows alignVertical="justify">
        <Row height="content">
          <Stack alignHorizontal="center" space="24px">
            <Stack space="12px">
              <Inline
                wrap={false}
                alignVertical="center"
                alignHorizontal="center"
                space="5px"
              >
                <Bleed vertical="4px">
                  <Symbol
                    symbol="doc.plaintext"
                    size={16}
                    color="orange"
                    weight={'bold'}
                  />
                </Bleed>
                <Text size="16pt" weight="bold" color="label" align="center">
                  {i18n.t('seed_reveal.title')}
                </Text>
              </Inline>
              <Box paddingHorizontal="24px">
                <Text
                  size="12pt"
                  weight="regular"
                  color="labelTertiary"
                  align="center"
                >
                  {i18n.t('seed_reveal.write_down_seed_importance')}
                </Text>
              </Box>
            </Stack>

            <Box width="full" style={{ width: '106px' }}>
              <Separator color="separatorTertiary" strokeWeight="1px" />
            </Box>
          </Stack>
        </Row>
        <Row>
          <Box paddingTop="36px">
            <Stack space="10px" alignHorizontal="center">
              <SeedPhraseTable seed={seed} />

              <Box width="full">
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
            </Stack>
          </Box>
        </Row>

        <Row height="content">
          <Box paddingBottom="20px" paddingTop="10px" width="full">
            <Button
              color="accent"
              height="44px"
              variant="flat"
              width="full"
              symbol="checkmark.circle.fill"
              blur="26px"
              onClick={handleSavedTheseWords}
              testId="saved-these-words-button"
              tabIndex={0}
            >
              {i18n.t('seed_reveal.saved_these_words')}
            </Button>
          </Box>
        </Row>
      </Rows>
    </FullScreenContainer>
  );
}
