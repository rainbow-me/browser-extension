import { isValidMnemonic } from '@ethersproject/hdnode';
import { wordlists } from '@ethersproject/wordlists';
import { useEffect, useReducer } from 'react';
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

import {
  getImportWalletSecrets,
  removeImportWalletSecrets,
  setImportWalletSecrets,
} from '../../handlers/importWalletSecrets';
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

  const words = secret.split(' ');

  if (words.length === 1) {
    if (secret.length < 6) return true;
    if (secret.length > 66) return i18n.t('import_wallet.too_many_chars');
    if (isValidPrivateKey(addHexPrefix(secret.toLowerCase()))) return false; // false = no error
    return i18n.t('import_wallet.invalid_private_key');
  }

  if (isValidMnemonic(secret, wordlist)) return false; // false = no error
  if (words.length < 10) return true; // user prolly still typing let's not bother him with and error msg
  if (words.length > 12) return i18n.t('import_wallet.too_many_words');
  if (words.length < 12)
    return i18n.t('import_wallet.missing_words', { count: 12 - words.length });
  const invalidWord = words.find((word) => wordlist.getWordIndex(word) === -1);
  if (invalidWord)
    return i18n.t('import_wallet.invalid_word', { word: invalidWord });

  return i18n.t('import_wallet.invalid_recovery_phrase');
};

const secretsReducer = (
  oldSecrets: string[],
  updater: string[] | ((s: string[]) => string[]),
) => {
  const newSecrets =
    typeof updater === 'function' ? updater(oldSecrets) : updater;
  setImportWalletSecrets(newSecrets);
  return newSecrets;
};

export const ImportWallet = ({ onboarding = false }) => {
  const navigate = useRainbowNavigate();
  const { setCurrentAddress } = useCurrentAddressStore();

  const [secrets, setSecrets] = useReducer(secretsReducer, ['']);

  const location = useLocation();
  useEffect(() => {
    const getSecrets = async () => {
      const secrets = await getImportWalletSecrets();
      setSecrets(secrets);
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

  const onImport = () => {
    const _secrets = [...new Set(secrets.filter(Boolean))]; // remove duplicates & empty
    if (_secrets.length === 1 && isValidPrivateKey(_secrets[0]))
      return wallet.importWithSecret(_secrets[0]).then((address) => {
        navigate(onboarding ? ROUTES.CREATE_PASSWORD : ROUTES.HOME);
        setCurrentAddress(address);
      });

    return navigate(
      onboarding ? ROUTES.IMPORT__SELECT : ROUTES.NEW_IMPORT_WALLET_SELECTION,
    );
  };

  const debouncedSecrets = useDebounce(secrets, 1000);

  const errors = debouncedSecrets.map((dsecret, i) => {
    if (i > 0 && !secrets[i]) return false;
    const debouncedValue = dsecret.trim();
    const inputValue = secrets[i].trim();
    const error = validateSecret(inputValue);
    if (!error) return false;
    if (debouncedValue !== inputValue) return true;
    return error;
  });
  const disabled = errors.some((e) => e !== false);

  const onSecretChange =
    (secretIndex: number) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSecrets((secrets) => {
        const newSecrets = [...secrets];
        newSecrets[secretIndex] = e.target.value;
        return newSecrets;
      });
    };

  const onRemoveLastSecret = () => setSecrets((scts) => scts.slice(0, -1));
  const onAddAnother = () => setSecrets((secrets) => [...secrets, '']);

  return (
    <Box testId="import-wallet-screen">
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
                <ImportWalletTextarea
                  key={`seed_${i}`}
                  tabIndex={1}
                  autoFocus
                  error={!!errorMsg && <ErrorMessage message={errorMsg} />}
                  placeholder={i18n.t('import_wallet.placeholder')}
                  testId={`secret-text-area-${i}`}
                  value={secret}
                  onChange={onSecretChange(i)}
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
                        onClick={onRemoveLastSecret}
                      >
                        {i18n.t('import_wallet.remove')}
                      </Button>
                    </Box>
                  )}
                </ImportWalletTextarea>
              );
            })}
            {errors.every((e) => e === false) && (
              <Button
                symbol="plus.circle.fill"
                symbolSide="left"
                color="accent"
                height="44px"
                variant="transparent"
                width="full"
                onClick={onAddAnother}
              >
                {i18n.t('import_wallet.add_another')}
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>

      <Box
        testId={`box-isValid-${disabled ? 'yeah' : 'nop'}`}
        width="full"
        paddingTop="10px"
        paddingBottom="20px"
      >
        <Button
          symbol="arrow.uturn.down.circle.fill"
          symbolSide="left"
          color={!disabled ? 'accent' : 'labelQuaternary'}
          height="44px"
          variant={!disabled ? 'raised' : 'disabled'}
          width="full"
          onClick={onImport}
          disabled={disabled}
          testId="import-wallets-button"
          tabIndex={2}
        >
          {i18n.t('import_wallet.import_wallet', { count: secrets.length })}
        </Button>
      </Box>
    </Box>
  );
};
