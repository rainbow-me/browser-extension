import { isValidMnemonic } from '@ethersproject/hdnode';
import { wordlists } from '@ethersproject/wordlists';
import { Fragment, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

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
} from '~/design-system';

import * as wallet from '../../handlers/wallet';
import { useDebounce } from '../../hooks/useDebounce';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import { ImportWalletTextarea } from '../ImportWalletTextarea/ImportWalletTextarea';

function ErrorMessage({ message }: { message: string }) {
  return (
    <Inline space="4px" alignVertical="center">
      <Symbol
        symbol={'exclamationmark.triangle.fill'}
        size={11}
        color={'orange'}
        weight={'bold'}
      />
      <Text size="11pt" weight="regular" color={'orange'}>
        {message}
      </Text>
    </Inline>
  );
}

const wordlist = wordlists['en']; // ethers uses the 'en' wordlist as default, I'm just making it explicit here
const validateSecret = (secret: string): string | boolean => {
  if (!secret) return true; // true = error but no msg

  if (secret.startsWith('0x')) {
    if (secret.length < 4) return true;
    if (secret.length > 66) return i18n.t('import_wallet.too_many_chars');
    if (isValidPrivateKey(addHexPrefix(secret.toLowerCase()))) return false; // false = no error
    return i18n.t('import_wallet.invalid_private_key');
  }

  if (isValidMnemonic(secret, wordlist)) return false; // false = no error
  const words = secret.split(' ');
  if (words.length < 10) return true; // user prolly still typing let's not bother him with and error msg
  if (words.length > 12) return i18n.t('import_wallet.too_many_words');
  if (words.length < 12)
    return i18n.t('import_wallet.missing_words', { count: 12 - words.length });
  const invalidWord = words.find((word) => wordlist.getWordIndex(word) === -1);
  if (invalidWord)
    return i18n.t('import_wallet.invalid_word', { word: invalidWord });

  return i18n.t('import_wallet.invalid_recovery_phrase');
};

export const ImportWallet = ({ onboarding = false }) => {
  const { state } = useLocation();
  const navigate = useRainbowNavigate();
  const { setCurrentAddress } = useCurrentAddressStore();
  const [secrets, setSecrets] = useState<string[]>(state.secrets || ['']);

  const importWallets = useCallback(
    (_secrets: string[]) => {
      const secrets = [...new Set(_secrets)]; // remove duplicates
      if (secrets.length === 1 && isValidPrivateKey(secrets[0])) {
        wallet.importWithSecret(secrets[0]).then(setCurrentAddress);
        return navigate(onboarding ? ROUTES.CREATE_PASSWORD : ROUTES.HOME);
      }
      return navigate(
        onboarding ? ROUTES.IMPORT__SELECT : ROUTES.NEW_IMPORT_WALLET_SELECTION,
        { state: { secrets } },
      );
    },
    [navigate, onboarding, setCurrentAddress],
  );

  const addAnotherOne = () => setSecrets((secrets) => [...secrets, '']);

  const debouncedSecrets = useDebounce(secrets, 1000);
  const errors = debouncedSecrets.map((dsecret, i) => {
    if (!secrets[i]) return false;
    const debouncedValue = dsecret.trim();
    const inputValue = secrets[i].trim();
    const error = validateSecret(inputValue);
    if (!error) return false;
    if (debouncedValue !== inputValue) return true;
    return error;
  });
  const disabled = errors.some((e) => e !== false);

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

        <Box width="full" style={{ overflow: 'auto', height: '364px' }}>
          <Stack space="10px">
            {secrets.map((secret, i) => {
              const isLast = i === secrets.length - 1;
              const error = errors[i];
              const errorMsg = typeof error === 'string' && error;
              return (
                <Fragment key={`seed_${i}`}>
                  <ImportWalletTextarea
                    tabIndex={1}
                    autoFocus
                    error={!!errorMsg && <ErrorMessage message={errorMsg} />}
                    placeholder={i18n.t('import_wallet.placeholder')}
                    value={secret}
                    onChange={(e) => {
                      setSecrets((secrets) => {
                        const newSecrets = [...secrets];
                        newSecrets[i] = e.target.value;
                        return newSecrets;
                      });
                    }}
                  >
                    {i !== 0 && isLast && !secret && (
                      <Box
                        position="absolute"
                        marginTop="-30px"
                        paddingLeft="12px"
                        style={{ right: '0px' }}
                      >
                        <Button
                          color="red"
                          height="24px"
                          variant="transparent"
                          width="full"
                          onClick={() =>
                            setSecrets((scts) => scts.slice(0, -1))
                          }
                        >
                          {i18n.t('import_wallet.remove')}
                        </Button>
                      </Box>
                    )}
                  </ImportWalletTextarea>
                  {isLast && !error && (
                    <Button
                      symbol="plus.circle.fill"
                      symbolSide="left"
                      color="accent"
                      height="44px"
                      variant="transparent"
                      width="full"
                      onClick={addAnotherOne}
                    >
                      {i18n.t('import_wallet.add_another')}
                    </Button>
                  )}
                </Fragment>
              );
            })}
          </Stack>
        </Box>
      </Stack>

      <Box width="full" paddingTop="10px" paddingBottom="20px">
        <Button
          symbol="arrow.uturn.down.circle.fill"
          symbolSide="left"
          color={!disabled ? 'accent' : 'labelQuaternary'}
          height="44px"
          variant={!disabled ? 'raised' : 'disabled'}
          width="full"
          onClick={() => importWallets(secrets)}
          disabled={disabled}
          testId="import-wallets-button"
          tabIndex={2}
        >
          {i18n.t('import_wallet.import_wallet', { count: secrets.length })}
        </Button>
      </Box>
    </>
  );
};
