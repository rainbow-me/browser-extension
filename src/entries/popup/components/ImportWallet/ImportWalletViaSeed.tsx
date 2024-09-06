/* eslint-disable no-nested-ternary */
import * as bip39 from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english';
import { motion } from 'framer-motion';
import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import {
  Box,
  Button,
  ButtonSymbol,
  Column,
  Columns,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
  textStyles,
} from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { accentSelectionStyle } from '~/design-system/components/Input/Input.css';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import {
  getImportWalletSecrets,
  removeImportWalletSecrets,
  setImportWalletSecrets,
} from '../../handlers/importWalletSecrets';
import { isMnemonicInVault } from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const getEvenWordIndex = (index: number) => {
  return index * 2 + 2;
};
const getOddWordIndex = (index: number) => {
  return index * 2 + 1;
};

const WordInput = ({
  index,
  visibleInput,
  value,
  handleKeyDown,
  handleSeedChange,
  toggleInputVisibility,
  wordError,
  globalError,
  onBlur,
  onPaste,
}: {
  index: number;
  visibleInput: number | null;
  value: string;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleSeedChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => void;
  toggleInputVisibility: (index: number) => void;
  wordError: boolean;
  globalError: boolean;
  onBlur: () => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}) => {
  return (
    <Box
      as={motion.div}
      whileTap={{ scale: transformScales['0.96'] }}
      transition={transitions.bounce}
      height="full"
      width="full"
      key={`seed_${index}`}
      position="relative"
      style={{ marginBottom: '8px' }}
    >
      <Box
        position="absolute"
        style={{
          left: '12px',
          top: '12px',
        }}
      >
        <Text
          size="12pt"
          weight="regular"
          color={globalError ? 'red' : 'labelTertiary'}
          align="center"
        >
          {`${index < 10 ? '0' : ''}${index}`}
        </Text>
      </Box>
      <Box
        as="input"
        type={visibleInput === index ? 'text' : 'password'}
        background="surfaceSecondaryElevated"
        borderRadius="12px"
        borderWidth="1px"
        borderColor={{
          default: wordError ? 'red' : 'buttonStroke',
          focus: 'accent',
        }}
        width="full"
        padding="12px"
        value={value}
        testId={`secret-input-${index}`}
        onKeyDown={handleKeyDown}
        tabIndex={index}
        autoFocus={index - 1 === 0}
        onBlur={onBlur}
        onPaste={onPaste}
        onChange={(e) => handleSeedChange(e, index - 1)}
        style={{
          height: '32px',
          resize: 'none',
          paddingLeft: '32px',
          paddingRight: '32px',
        }}
        className={[
          textStyles({
            color: 'label',
            fontSize: '14pt',
            fontWeight: 'regular',
            fontFamily: 'rounded',
          }),
          accentSelectionStyle,
        ]}
      />
      {value.length > 0 && (
        <Box
          position="absolute"
          style={{
            right: '4px',
            top: '4px',
          }}
          onClick={() => toggleInputVisibility(index)}
        >
          <ButtonSymbol
            color="labelTertiary"
            height="24px"
            variant="transparent"
            symbol="eye.fill"
          />
        </Box>
      )}
    </Box>
  );
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

const emptySecrets12 = Array.from({ length: 12 }).map(() => '');
const emptySecrets24 = Array.from({ length: 24 }).map(() => '');

const ImportWalletViaSeed = () => {
  const navigate = useRainbowNavigate();
  const location = useLocation();
  const onboarding = document.location.href.search('onboarding') !== -1;
  const [isValid, setIsValid] = useState(false);
  const [globalError, setGlobalError] = useState(false);
  const [invalidWords, setInvalidWords] = useState<number[]>([]);
  const [visibleInput, setVisibleInput] = useState<number | null>(null);
  const [secrets, setSecrets] = useReducer(secretsReducer, emptySecrets12);

  const toggleWordLength = useCallback(() => {
    if (secrets.length === 12) {
      setSecrets(emptySecrets24);
    } else {
      setSecrets(emptySecrets12);
    }
    setInvalidWords([]);
    setGlobalError(false);
    setIsValid(false);
  }, [secrets.length]);

  const toggleInputVisibility = useCallback(
    (index: React.SetStateAction<number | null>) => {
      if (visibleInput === index) {
        setVisibleInput(null);
      } else {
        setVisibleInput(index);
      }
    },
    [visibleInput],
  );

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

  const handleSeedChange = useCallback(
    (e: { target: { value: string } }, index: number) => {
      const newSecrets = [...secrets] as string[];
      newSecrets[index] = e.target.value;
      setSecrets(newSecrets);
      setImportWalletSecrets(newSecrets);
    },
    [secrets],
  );

  const handleImportWallet = useCallback(async () => {
    if (await isMnemonicInVault(secrets.join(' '))) {
      triggerAlert({
        text: i18n.t('import_wallet_via_seed.duplicate_seed'),
      });
      setSecrets(emptySecrets12);
      return;
    }

    return navigate(
      onboarding ? ROUTES.IMPORT__SELECT : ROUTES.NEW_IMPORT_WALLET_SELECTION,
    );
  }, [navigate, onboarding, secrets]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleImportWallet();
      }
    },
    [handleImportWallet],
  );

  const isValidWord = (word: string) => englishWordlist.indexOf(word) > -1;

  const handleBlur = useCallback(
    (index: number) => {
      if (secrets[index] !== '' && !isValidWord(secrets[index])) {
        !invalidWords.includes(index) &&
          setInvalidWords([...invalidWords, index]);
      } else {
        setInvalidWords(invalidWords.filter((i) => i !== index));
      }
    },
    [invalidWords, secrets],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const dataToBePasted = e.clipboardData.getData('text').trim();
    e.preventDefault();
    const words = dataToBePasted.split(' ');
    if (words.length === 12 || words.length === 24) {
      setSecrets(words);
    } else {
      setGlobalError(true);
      setSecrets(emptySecrets12);
    }
  }, []);

  useEffect(() => {
    if (secrets.filter((word) => !!word).length > 0 && globalError) {
      setGlobalError(false);
    }
  }, [secrets, globalError]);

  useEffect(() => {
    const totalWords = secrets.filter((word) => !!word).length;
    const wordCountValid = totalWords === 12 || totalWords === 24;
    const noErrors = !globalError && invalidWords.length === 0;
    const validSeed = bip39.validateMnemonic(
      secrets.join(' '),
      englishWordlist,
    );
    if (noErrors && wordCountValid && validSeed) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [secrets, invalidWords, globalError]);

  return (
    <Box testId="import-wallet-screen" paddingHorizontal="20px">
      <Stack space="24px" alignHorizontal="center">
        <Box alignItems="center">
          <Stack space="12px">
            <Text size="16pt" weight="bold" color="label" align="center">
              {i18n.t('import_wallet_via_seed.title')}
            </Text>
            <Box paddingHorizontal="28px">
              <Text
                size="12pt"
                weight="regular"
                color="labelTertiary"
                align="center"
              >
                {i18n.t('import_wallet_via_seed.explanation')}
              </Text>
            </Box>
          </Stack>
        </Box>
        <Box alignItems="center" style={{ width: '106px' }}>
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
        <Box
          style={{
            height: '360px',
          }}
        >
          <Box alignItems="center" justifyContent="center" display="flex">
            <Box
              style={{
                width: '100%',
                position: 'absolute',
                marginTop: '-18px',
                marginBottom: '8px',
              }}
            >
              {(invalidWords.length > 0 || globalError) && (
                <Inline
                  alignHorizontal="center"
                  alignVertical="center"
                  space="12px"
                >
                  <Symbol
                    size={16}
                    color="red"
                    symbol="exclamationmark.triangle.fill"
                    weight="regular"
                  />
                  <Text color="red" weight="regular" size="12pt">
                    {globalError
                      ? i18n.t('import_wallet_via_seed.couldnt_paste')
                      : invalidWords.length === 1
                      ? i18n.t('import_wallet_via_seed.1_word_might_be_wrong')
                      : i18n.t(
                          'import_wallet_via_seed.n_words_might_be_wrong',
                          {
                            n: invalidWords.length,
                          },
                        )}
                  </Text>
                </Inline>
              )}
            </Box>
          </Box>
          <Box
            width="full"
            style={{
              overflow: 'auto',
              height: secrets.length === 12 ? '320px' : '340px',
              transition: 'height .5s',
            }}
          >
            <Stack space="10px">
              <Box
                background="surfaceSecondaryElevated"
                borderRadius="16px"
                padding="12px"
                paddingBottom="4px"
                borderColor={'transparent'}
                borderWidth={'1px'}
              >
                <Columns>
                  <Column>
                    <Box paddingRight="14px">
                      {secrets
                        .filter((el, x) => x % 2 !== 0)
                        .map((word, i) => (
                          <WordInput
                            index={getOddWordIndex(i)}
                            handleKeyDown={handleKeyDown}
                            handleSeedChange={handleSeedChange}
                            value={secrets[getOddWordIndex(i) - 1]}
                            visibleInput={visibleInput}
                            toggleInputVisibility={toggleInputVisibility}
                            key={`seed_${i}`}
                            onBlur={() => handleBlur(getOddWordIndex(i) - 1)}
                            wordError={invalidWords.includes(
                              getOddWordIndex(i) - 1,
                            )}
                            globalError={globalError}
                            onPaste={handlePaste}
                          />
                        ))}
                    </Box>
                  </Column>
                  <Column width="content">
                    <Box
                      borderColor="separatorTertiary"
                      style={{
                        width: '1px',
                        height: '100%',
                        borderRightStyle: 'solid',
                        borderRightWidth: '1px',
                      }}
                    />
                  </Column>
                  <Column>
                    <Box paddingLeft="14px">
                      {secrets
                        .filter((el, x) => x % 2 === 0)
                        .map((word: string, i: number) => (
                          <WordInput
                            index={getEvenWordIndex(i)}
                            handleKeyDown={handleKeyDown}
                            handleSeedChange={handleSeedChange}
                            value={secrets[getEvenWordIndex(i) - 1]}
                            visibleInput={visibleInput}
                            toggleInputVisibility={toggleInputVisibility}
                            key={`seed_${i}`}
                            onBlur={() => handleBlur(getEvenWordIndex(i) - 1)}
                            wordError={invalidWords.includes(
                              getEvenWordIndex(i) - 1,
                            )}
                            globalError={globalError}
                            onPaste={handlePaste}
                          />
                        ))}
                    </Box>
                  </Column>
                </Columns>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Button
                  color="labelTertiary"
                  height="24px"
                  variant="transparent"
                  onClick={toggleWordLength}
                >
                  {i18n.t(
                    `import_wallet_via_seed.${
                      secrets.length === 12 ? '24_words' : '12_words'
                    }`,
                  )}
                </Button>
              </Box>
            </Stack>
          </Box>
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
          tabIndex={secrets.length + 1}
        >
          {i18n.t('import_wallet_via_seed.import_wallet_group')}
        </Button>
      </Box>
    </Box>
  );
};

export { ImportWalletViaSeed };
