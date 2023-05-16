import React, { useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import {
  Box,
  Button,
  Inline,
  Stack,
  Text,
  ThemeProvider,
} from '~/design-system';
import { Row, Rows } from '~/design-system/components/Rows/Rows';
import { accentColorAsHsl } from '~/design-system/styles/core.css';
import { RainbowError, logger } from '~/logger';

import { LogoWithLetters } from '../../components/LogoWithLetters/LogoWithLetters';
import { Spinner } from '../../components/Spinner/Spinner';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function ImportOrCreateWallet() {
  const navigate = useRainbowNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const wipeIncompleteWallet = async () => {
      const { hasVault } = await wallet.getStatus();
      if (hasVault) {
        wallet.wipe();
      }
    };
    wipeIncompleteWallet();
  }, []);

  const { setCurrentAddress } = useCurrentAddressStore();

  const handleImportWalletClick = React.useCallback(async () => {
    navigate(ROUTES.IMPORT_OR_CONNECT);
  }, [navigate]);

  const handleCreateNewWalletClick = React.useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const newWalletAddress = await wallet.create();
      setCurrentAddress(newWalletAddress);
      navigate(ROUTES.SEED_BACKUP_PROMPT);
    } catch (e) {
      logger.info('Onboarding error: creating new wallet failed');
      logger.error(e as RainbowError);
      setLoading(false);
    }
  }, [loading, navigate, setCurrentAddress]);

  return (
    <Box width="full" style={{ zIndex: 1 }}>
      <Box style={{ marginTop: 135 }}>
        <Stack space="4px">
          <Box width="full" display="flex" justifyContent="center">
            <LogoWithLetters color="label" />
          </Box>
          <Box
            width="full"
            justifyContent="center"
            alignItems="center"
            display="flex"
          >
            <Text
              align="center"
              color="labelTertiary"
              size="16pt"
              weight="bold"
            >
              {i18n.t('welcome.subtitle')}
            </Text>
          </Box>
        </Stack>
      </Box>

      <Box width="full" style={{ marginTop: '226px' }}>
        <Rows space="20px">
          <Row>
            <Rows space="10px">
              <Row>
                {loading ? (
                  <Button
                    color="fill"
                    height="44px"
                    variant="flat"
                    width="full"
                    symbol="arrow.right"
                    symbolSide="right"
                    blur="26px"
                    onClick={handleCreateNewWalletClick}
                    testId="create-wallet-button"
                  >
                    <Inline space="8px" alignVertical="center">
                      <Text color="label" size="16pt" weight="bold">
                        {i18n.t('welcome.create_wallet')}
                      </Text>
                      <Spinner size={16} color="label" />
                    </Inline>
                  </Button>
                ) : (
                  <Button
                    color="fill"
                    height="44px"
                    variant="flat"
                    width="full"
                    symbol="arrow.right"
                    symbolSide="right"
                    blur="26px"
                    onClick={handleCreateNewWalletClick}
                    testId="create-wallet-button"
                  >
                    {i18n.t('welcome.create_wallet')}
                  </Button>
                )}
              </Row>
              <Row>
                <ThemeProvider theme="dark">
                  <Button
                    color="surfaceSecondaryElevated"
                    height="44px"
                    variant="flat"
                    width="full"
                    onClick={handleImportWalletClick}
                    testId="import-wallet-button"
                  >
                    {i18n.t('welcome.import_wallet')}
                  </Button>
                </ThemeProvider>
              </Row>
            </Rows>
          </Row>
          <Row>
            <Box display="flex" style={{ width: '210px', margin: 'auto' }}>
              <Text
                align="center"
                color="labelTertiary"
                size="12pt"
                weight="regular"
                as="p"
              >
                {i18n.t('welcome.disclaimer_tos')}&nbsp;
                <a
                  href="https://rainbow.me/terms-of-use"
                  target="_blank"
                  style={{ color: accentColorAsHsl }}
                  rel="noreferrer"
                >
                  {i18n.t('welcome.disclaimer_tos_link')}
                </a>
              </Text>
            </Box>
          </Row>
        </Rows>
      </Box>
    </Box>
  );
}
