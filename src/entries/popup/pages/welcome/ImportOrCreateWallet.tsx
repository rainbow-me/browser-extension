import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';

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
import { useBrowser } from '../../hooks/useBrowser';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function ImportOrCreateWallet() {
  const navigate = useRainbowNavigate();
  const [loading, setLoading] = useState(false);
  const { isFirefox } = useBrowser();

  const requestPermissionsIfNeeded = useCallback(async () => {
    if (!isFirefox) return true;
    const permissionGranted = await chrome.permissions.request({
      origins: ['<all_urls>'],
    });
    if (!permissionGranted) {
      alert(i18n.t('permissions.firefox_permission_denied'));
      return false;
    }
    return true;
  }, [isFirefox]);

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

  const setCurrentAddress = useCurrentAddressStore(
    (state) => state.setCurrentAddress,
  );

  const handleImportWalletClick = React.useCallback(async () => {
    const permissionsOk = await requestPermissionsIfNeeded();
    permissionsOk && navigate(ROUTES.IMPORT_OR_CONNECT);
  }, [navigate, requestPermissionsIfNeeded]);

  const handleCreateNewWalletClick = React.useCallback(async () => {
    if (loading) return;
    const permissionsOk = await requestPermissionsIfNeeded();
    if (!permissionsOk) return;
    setLoading(true);
    try {
      const newWalletAddress = await wallet.create();
      setCurrentAddress(newWalletAddress);
      const seedPhrase = await wallet.exportWallet(newWalletAddress, '');
      setImportWalletSecrets([seedPhrase]);
      navigate(ROUTES.SEED_BACKUP_PROMPT);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      logger.info('Onboarding error: creating new wallet failed');
      logger.error(new RainbowError(e?.name), { message: e?.message });
      setLoading(false);
    }
  }, [loading, navigate, requestPermissionsIfNeeded, setCurrentAddress]);

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
                    color={isFirefox ? 'surfaceSecondaryElevated' : 'label'}
                    height="44px"
                    variant={isFirefox ? 'flat' : 'tinted'}
                    width="full"
                    symbol="arrow.right"
                    symbolSide="right"
                    onClick={handleCreateNewWalletClick}
                    testId="create-wallet-button"
                    tabIndex={0}
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
                    tabIndex={0}
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
            style={{ width: '210px', margin: 'auto', position: 'relative' }}
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
