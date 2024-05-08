import { isAddress } from '@ethersproject/address';
import { motion } from 'framer-motion';
import { startsWith } from 'lodash';
import { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { isValidPrivateKey } from '~/core/utils/ethereum';
import { addHexPrefix } from '~/core/utils/hex';
import {
  Box,
  Button,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
  textStyles,
} from '~/design-system';
import {
  accentSelectionStyle,
  placeholderStyle,
} from '~/design-system/components/Input/Input.css';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import {
  getImportWalletSecrets,
  removeImportWalletSecrets,
  setImportWalletSecrets,
} from '../../handlers/importWalletSecrets';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const ImportWalletViaPrivateKey = () => {
  const navigate = useRainbowNavigate();
  const location = useLocation();
  const onboarding = document.location.href.search('onboarding') !== -1;
  const [isValid, setIsValid] = useState(false);
  const [isAddingWallets, setIsAddingWallets] = useState(false);
  const [secrets, setSecrets] = useState<string[]>(['']);
  const setCurrentAddress = useCurrentAddressStore.use.setCurrentAddress();

  const [validity, setValidity] = useState<
    { valid: boolean; too_long: boolean; type: string | undefined }[]
  >([]);

  const updateValidity = useCallback((newSecrets: string[]) => {
    const newValidity = newSecrets.map((secret) => {
      let too_long = false;
      let type = undefined;
      const valid = isValidPrivateKey(secret);
      if (!valid) {
        if (startsWith(secret.toLowerCase(), '0x')) {
          type = 'pkey';
          if (addHexPrefix(secret).length > 66) {
            too_long = true;
          }
        }
      }
      return {
        valid,
        too_long,
        type,
      };
    });
    if (newValidity.filter((secret) => !secret.valid).length === 0) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
    setValidity(newValidity);
  }, []);

  useEffect(() => {
    const getSecrets = async () => {
      const secrets = await getImportWalletSecrets();
      setSecrets(secrets);
      updateValidity(secrets);
    };
    if (
      location?.state?.from === ROUTES.NEW_IMPORT_WALLET_SELECTION ||
      location?.state?.from === ROUTES.IMPORT__SELECT
    ) {
      getSecrets();
    } else {
      removeImportWalletSecrets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSecretChange = useCallback(
    (e: { target: { value: string } }, index: number) => {
      const newSecrets = [...secrets] as string[];
      newSecrets[index] = e.target.value;
      updateValidity(newSecrets);
      setSecrets(newSecrets);
      setImportWalletSecrets(newSecrets);
    },
    [secrets, updateValidity],
  );
  const handleImportWallet = useCallback(async () => {
    if (secrets.length === 1 && secrets[0] === '') return;
    if (isAddingWallets) return;
    // If it's only one private key, import it directly and go to wallet screen
    if (secrets.length === 1) {
      if (isValidPrivateKey(secrets[0]) || isAddress(secrets[0])) {
        try {
          setIsAddingWallets(true);
          const address = (await wallet.importWithSecret(
            secrets[0],
          )) as Address;
          setCurrentAddress(address);
          setIsAddingWallets(false);

          // workaround for a deeper issue where the keychain status
          // didn't yet updated or synced in the same tick
          setTimeout(() => {
            if (onboarding)
              navigate(ROUTES.CREATE_PASSWORD, {
                state: { backTo: ROUTES.WELCOME },
              });
            else navigate(ROUTES.HOME);
          }, 1);

          setIsAddingWallets(false);
          removeImportWalletSecrets();
          return;
        } catch (e) {
          //
        }
      }
    }
  }, [isAddingWallets, navigate, onboarding, secrets, setCurrentAddress]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleImportWallet();
      }
    },
    [handleImportWallet],
  );

  return (
    <Box testId="import-wallet-screen" paddingHorizontal="20px">
      <Stack space="24px" alignHorizontal="center">
        <Box alignItems="center">
          <Stack space="12px">
            <Text size="16pt" weight="bold" color="label" align="center">
              {i18n.t('import_wallet_via_private_key.title')}
            </Text>
            <Box paddingHorizontal="28px">
              <Text
                size="12pt"
                weight="regular"
                color="labelTertiary"
                align="center"
              >
                {i18n.t('import_wallet_via_private_key.explanation')}
              </Text>
            </Box>
          </Stack>
        </Box>
        <Box alignItems="center" style={{ width: '106px' }}>
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
        <Box
          width="full"
          style={{
            overflow: 'auto',
            height: '364px',
          }}
        >
          <Stack space="10px">
            <Box
              as={motion.div}
              whileTap={{ scale: transformScales['0.96'] }}
              transition={transitions.bounce}
              height="full"
              width="full"
              key={`seed_0`}
              position="relative"
            >
              <Box
                as="input"
                type="password"
                background="surfaceSecondaryElevated"
                borderRadius="12px"
                borderWidth="1px"
                borderColor={{
                  default: 'buttonStroke',
                  focus: 'accent',
                }}
                width="full"
                padding="12px"
                placeholder={i18n.t(
                  'import_wallet_via_private_key.placeholder',
                )}
                value={secrets[0]}
                testId={`private-key-input`}
                onKeyDown={handleKeyDown}
                tabIndex={1}
                autoFocus
                onChange={(e) => handleSecretChange(e, 0)}
                className={[
                  placeholderStyle,
                  textStyles({
                    color: 'label',
                    fontSize: '14pt',
                    fontWeight: 'regular',
                    fontFamily: 'rounded',
                  }),
                  accentSelectionStyle,
                ]}
                style={{
                  height: '48px',
                  resize: 'none',
                }}
              />
              {validity[0]?.valid === false && validity[0]?.too_long && (
                <Box
                  position="absolute"
                  paddingLeft="12px"
                  style={{ marginTop: '14px' }}
                >
                  <Inline space="4px" alignVertical="center">
                    <Symbol
                      symbol={'exclamationmark.triangle.fill'}
                      size={11}
                      color={'orange'}
                      weight={'bold'}
                    />
                    <Text size="11pt" weight="regular" color={'orange'}>
                      {validity[0].type === 'pkey'
                        ? i18n.t('import_wallet.too_many_chars')
                        : i18n.t('import_wallet.too_many_words')}
                    </Text>
                  </Inline>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      </Stack>

      <Box
        testId={`box-isValid-${isValid ? 'yeah' : 'nop'}`}
        width="full"
        paddingTop="10px"
        paddingBottom="20px"
      >
        <Button
          symbol="arrow.uturn.down.circle.fill"
          symbolSide="left"
          color={isValid ? 'accent' : 'labelQuaternary'}
          height="44px"
          variant={isValid ? 'flat' : 'disabled'}
          width="full"
          onClick={isValid ? handleImportWallet : () => null}
          testId="import-wallets-button"
          tabIndex={2}
        >
          {i18n.t('import_wallet_via_private_key.import_wallet')}
        </Button>
      </Box>
    </Box>
  );
};

export { ImportWalletViaPrivateKey };
