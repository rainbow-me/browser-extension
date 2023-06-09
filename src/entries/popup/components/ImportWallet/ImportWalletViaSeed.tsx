import { isAddress } from '@ethersproject/address';
import { isValidMnemonic } from '@ethersproject/hdnode';
import { wordlists } from 'ethers';
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
        testId={`secret-text-area-${index}`}
        onKeyDown={handleKeyDown}
        tabIndex={index}
        autoFocus={index - 1 === 0}
        onBlur={onBlur}
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

const ImportWalletViaSeed = () => {
  const navigate = useRainbowNavigate();
  const location = useLocation();
  const [isValid, setIsValid] = useState(false);
  const [invalidWords, setInvalidWords] = useState<number[]>([]);
  const [visibleInput, setVisibleInput] = useState<number | null>(null);
  const [secrets, setSecrets] = useState<string[]>(
    Array.from({ length: 12 }).map(() => ''),
  );

  const toggleWordLength = useCallback(() => {
    if (secrets.length === 12) {
      setSecrets(Array.from({ length: 24 }).map(() => ''));
    } else {
      setSecrets(Array.from({ length: 12 }).map(() => ''));
    }
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

  const [validity, setValidity] = useState<
    { valid: boolean; too_long: boolean; type: string | undefined }[]
  >([]);

  //   const updateValidity = useCallback((newSecrets: string[]) => {
  //     const newValidity = newSecrets.map((secret) => {
  //       let too_long = false;
  //       let type = undefined;
  //       const valid = validateSecret(secret);
  //       if (!valid) {
  //         if (startsWith(secret.toLowerCase(), '0x')) {
  //           type = 'pkey';
  //           if (addHexPrefix(secret).length > 66) {
  //             too_long = true;
  //           }
  //         } else {
  //           if (secret.split(' ').length > 12) {
  //             too_long = true;
  //             type = 'seed';
  //           }
  //         }
  //       }
  //       return {
  //         valid,
  //         too_long,
  //         type,
  //       };
  //     });
  //     if (newValidity.filter((word) => !word.valid).length === 0) {
  //       setIsValid(true);
  //     } else {
  //       setIsValid(false);
  //     }
  //     setValidity(newValidity);
  //   }, []);

  //   useEffect(() => {
  //     const getSecrets = async () => {
  //       const secrets = await getImportWalletSecrets();
  //       setSecrets(secrets);
  //       updateValidity(secrets);
  //     };
  //     if (
  //       location?.state?.from === ROUTES.NEW_IMPORT_WALLET_SELECTION ||
  //       location?.state?.from === ROUTES.IMPORT__SELECT
  //     ) {
  //       getSecrets();
  //     } else {
  //       removeImportWalletSecrets();
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, []);

  const handleSeedChange = useCallback(
    (e: { target: { value: string } }, index: number) => {
      const newSecrets = [...secrets] as string[];
      newSecrets[index] = e.target.value;
      // updateValidity(newSecrets);
      setSecrets(newSecrets);
      setImportWalletSecrets(newSecrets);
    },
    [secrets],
  );

  const handleImportWallet = useCallback(async () => {}, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleImportWallet();
      }
    },
    [handleImportWallet],
  );

  const isValidWord = (word: string) => wordlists['en'].getWordIndex(word) > -1;

  const onBlur = useCallback(
    (index: number) => {
      if (secrets[index] !== '' && !isValidWord(secrets[index])) {
        console.log('invalid word', secrets[index]);
        setInvalidWords([...invalidWords, index]);
      } else {
        console.log('valid word', secrets[index]);
        setInvalidWords(invalidWords.filter((i) => i !== index));
      }
    },
    [invalidWords, secrets],
  );

  console.log('invalid words', invalidWords);

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
          <Box
            width="full"
            style={{
              overflow: 'auto',
              height: secrets.length === 12 ? '320px' : '340px',
              transition: 'height 1s',
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
                            onBlur={() => onBlur(getOddWordIndex(i) - 1)}
                            wordError={invalidWords.includes(
                              getOddWordIndex(i) - 1,
                            )}
                            globalError={false}
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
                            onBlur={() => onBlur(getEvenWordIndex(i) - 1)}
                            wordError={invalidWords.includes(
                              getEvenWordIndex(i) - 1,
                            )}
                            globalError={false}
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
