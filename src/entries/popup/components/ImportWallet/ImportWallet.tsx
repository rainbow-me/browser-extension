import { isAddress } from '@ethersproject/address';
import { isValidMnemonic } from '@ethersproject/hdnode';
import { motion } from 'framer-motion';
import { startsWith } from 'lodash';
import React, { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { addHexPrefix, isValidPrivateKey } from '~/core/utils/ethereum';
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

const validateSecret = (secret: string) => {
  // check if it's a private key
  const trimmedSecret = secret.trimEnd().trimStart().toLowerCase();
  if (trimmedSecret.split(' ').length === 1) {
    const secretToValidate = startsWith(trimmedSecret, '0x')
      ? trimmedSecret
      : addHexPrefix(trimmedSecret);
    return isValidPrivateKey(secretToValidate);
  }
  return isValidMnemonic(secret.trimEnd().trimStart());
};

const ImportWallet = ({ onboarding = false }: { onboarding?: boolean }) => {
  const navigate = useRainbowNavigate();
  const location = useLocation();
  const [isValid, setIsValid] = useState(false);
  const [isAddingWallets, setIsAddingWallets] = useState(false);
  const [secrets, setSecrets] = useState<string[]>(['']);
  const { setCurrentAddress } = useCurrentAddressStore();

  const [validity, setValidity] = useState<
    { valid: boolean; too_long: boolean; type: string | undefined }[]
  >([]);

  const updateValidity = useCallback((newSecrets: string[]) => {
    const newValidity = newSecrets.map((secret) => {
      let too_long = false;
      let type = undefined;
      const valid = validateSecret(secret);
      if (!valid) {
        if (startsWith(secret.toLowerCase(), '0x')) {
          type = 'pkey';
          if (addHexPrefix(secret).length > 66) {
            too_long = true;
          }
        } else {
          if (secret.split(' ').length > 12) {
            too_long = true;
            type = 'seed';
          }
        }
      }
      return {
        valid,
        too_long,
        type,
      };
    });
    if (newValidity.filter((word) => !word.valid).length === 0) {
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

  const handleSeedChange = useCallback(
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
    // If it's only one private key or address, import it directly and go to wallet screen
    if (secrets.length === 1) {
      if (isValidPrivateKey(secrets[0]) || isAddress(secrets[0])) {
        try {
          setIsAddingWallets(true);
          const address = (await wallet.importWithSecret(
            secrets[0],
          )) as Address;
          setCurrentAddress(address);
          setIsAddingWallets(false);
          onboarding
            ? navigate(ROUTES.CREATE_PASSWORD, {
                state: { backTo: ROUTES.WELCOME },
              })
            : navigate(ROUTES.HOME);
          setIsAddingWallets(false);
          removeImportWalletSecrets();
          return;
        } catch (e) {
          //
        }
      }
    }

    if (isValid) {
      setIsAddingWallets(false);
      navigate(
        onboarding ? ROUTES.IMPORT__SELECT : ROUTES.NEW_IMPORT_WALLET_SELECTION,
        {
          state: {
            backTo: onboarding ? ROUTES.IMPORT : ROUTES.NEW_IMPORT_WALLET,
          },
        },
      );
    }
  }, [
    isAddingWallets,
    isValid,
    navigate,
    onboarding,
    secrets,
    setCurrentAddress,
  ]);

  const handleAddAnotherOne = useCallback(() => {
    const newSecrets = [...secrets, ''];
    setSecrets(newSecrets);
    setImportWalletSecrets(newSecrets);
    updateValidity(newSecrets);
  }, [secrets, updateValidity]);

  const handleRemove = useCallback(() => {
    const newSecrets = secrets.slice(0, -1);
    setSecrets(newSecrets);
    setImportWalletSecrets(newSecrets);
    updateValidity(newSecrets);
  }, [secrets, updateValidity]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleImportWallet();
      }
    },
    [handleImportWallet],
  );

  return (
    <>
      <Stack space="24px" alignHorizontal="center">
        <Box alignItems="center">
          <Stack space="12px">
            <Text size="16pt" weight="bold" color="label" align="center">
              {i18n.t('import_wallet.title')}
            </Text>
            <Box paddingHorizontal="28px">
              <Text
                size="12pt"
                weight="regular"
                color="labelTertiary"
                align="center"
              >
                {i18n.t('import_wallet.description')}
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
            {secrets.map((_, i) => (
              <Box
                as={motion.div}
                whileTap={{ scale: transformScales['0.96'] }}
                transition={transitions.bounce}
                height="full"
                width="full"
                key={`seed_${i}`}
                position="relative"
              >
                <Box
                  as="textarea"
                  background="surfaceSecondaryElevated"
                  borderRadius="12px"
                  borderWidth="1px"
                  borderColor={{
                    default: 'buttonStroke',
                    focus: 'accent',
                  }}
                  width="full"
                  padding="12px"
                  placeholder={i18n.t('import_wallet.placeholder')}
                  value={secrets[i]}
                  testId="secret-textarea"
                  onKeyDown={handleKeyDown}
                  tabIndex={1}
                  autoFocus
                  onChange={(e) => handleSeedChange(e, i)}
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
                    height: '96px',
                    resize: 'none',
                  }}
                />
                {validity[i]?.valid === false && validity[i]?.too_long && (
                  <Box position="absolute" marginTop="-24px" paddingLeft="12px">
                    <Inline space="4px" alignVertical="center">
                      <Symbol
                        symbol={'exclamationmark.triangle.fill'}
                        size={11}
                        color={'orange'}
                        weight={'bold'}
                      />
                      <Text size="11pt" weight="regular" color={'orange'}>
                        {validity[i].type === 'pkey'
                          ? i18n.t('import_wallet.too_many_chars')
                          : i18n.t('import_wallet.too_many_words')}
                      </Text>
                    </Inline>
                  </Box>
                )}
                {i > 0 && i === secrets.length - 1 && secrets[i].length === 0 && (
                  <Box
                    position="absolute"
                    marginTop="-30px"
                    paddingLeft="12px"
                    style={{
                      right: '0px',
                    }}
                  >
                    <Button
                      color="red"
                      height="24px"
                      variant="transparent"
                      width="full"
                      onClick={handleRemove}
                    >
                      {i18n.t('import_wallet.remove')}
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
            {isValid && (
              <Button
                symbol="plus.circle.fill"
                symbolSide="left"
                color="accent"
                height="44px"
                variant="transparent"
                width="full"
                onClick={handleAddAnotherOne}
              >
                {i18n.t('import_wallet.add_another')}
              </Button>
            )}
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
          {secrets.length > 1
            ? i18n.t('import_wallet.import_wallet_plural')
            : i18n.t('import_wallet.import_wallet')}
        </Button>
      </Box>
    </>
  );
};

export { ImportWallet };
