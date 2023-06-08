import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { Box, Button, Inline, Text, ThemeProvider } from '~/design-system';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { Row, Rows } from '~/design-system/components/Rows/Rows';
import { accentColorAsHsl } from '~/design-system/styles/core.css';
import { RainbowError, logger } from '~/logger';

import { Spinner } from '../../components/Spinner/Spinner';
import {
  removeImportWalletSecrets,
  setImportWalletSecrets,
} from '../../handlers/importWalletSecrets';
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
      await removeImportWalletSecrets();
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
      const seedPhrase = await wallet.exportWallet(newWalletAddress, '');
      setImportWalletSecrets([seedPhrase]);
      navigate(ROUTES.SEED_BACKUP_PROMPT);
    } catch (e) {
      logger.info('Onboarding error: creating new wallet failed');
      logger.error(e as RainbowError);
      setLoading(false);
    }
  }, [loading, navigate, setCurrentAddress]);

  return (
    <Box style={{ marginTop: '234px' }}>
      <Rows space="20px">
        <Row>
          <Rows space="10px">
            <Row>
              <ButtonOverflow>
                <Box
                  as={motion.div}
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(80px)' }}
                  exit={{ opacity: 1, backdropFilter: 'blur(80px)' }}
                  key="create-button"
                  borderRadius="round"
                >
                  <Button
                    color="label"
                    height="44px"
                    variant="tinted"
                    width="full"
                    symbol="arrow.right"
                    symbolSide="right"
                    onClick={handleCreateNewWalletClick}
                    testId="create-wallet-button"
                  >
                    {loading ? (
                      <Inline space="8px" alignVertical="center">
                        <Text color="label" size="16pt" weight="bold">
                          {i18n.t('welcome.create_wallet')}
                        </Text>
                        <Spinner size={16} color="label" />
                      </Inline>
                    ) : (
                      i18n.t('welcome.create_wallet')
                    )}
                  </Button>
                </Box>
              </ButtonOverflow>
            </Row>
            <Row>
              <Box
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                key="import-button"
                borderRadius="round"
              >
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
              </Box>
            </Row>
          </Rows>
        </Row>
        <Row>
          <Box
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            key="description"
            display="flex"
            style={{ width: '210px', margin: 'auto' }}
          >
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
  );
}
