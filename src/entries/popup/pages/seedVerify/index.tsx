/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Separator,
  Symbol,
  Text,
} from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { exportWallet } from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const shuffleArray = (array: string[]) => {
  const arrayCopy = [...array];
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
  }
  return arrayCopy;
};

const addLeadingZero = (num: number) => {
  if (num > 9) {
    return num;
  }
  return `0${num}`;
};

export function SeedVerify() {
  const navigate = useRainbowNavigate();
  const [seed, setSeed] = useState('');
  const [randomSeed, setRandomSeed] = useState<string[]>([]);
  const { currentAddress } = useCurrentAddressStore();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);
  const [incorrect, setIncorrect] = useState(false);

  useEffect(() => {
    const init = async () => {
      const seedPhrase = await exportWallet(currentAddress, '');
      setSeed(seedPhrase);
      setRandomSeed(shuffleArray(seed.split(' ')));
    };
    init();
  }, [currentAddress, seed]);

  const handleSelect = useCallback(
    (word: string) => {
      const prev = [...selectedWords];

      let current;
      if (prev.includes(word)) {
        current = prev.filter((w) => w !== word);
      } else {
        if (prev.length === 3) return;
        current = [...prev, word];
      }
      setSelectedWords(current);
    },
    [selectedWords],
  );

  useEffect(() => {
    if (selectedWords.length === 3) {
      setTimeout(() => {
        // Validate
        const seedWords = seed.split(' ');
        if (
          seedWords[3] === selectedWords[0] &&
          seedWords[7] === selectedWords[1] &&
          seedWords[11] === selectedWords[2]
        ) {
          setValidated(true);
          setTimeout(() => {
            navigate(ROUTES.CREATE_PASSWORD);
          }, 1200);
        } else {
          setIncorrect(true);
        }
      }, 100);
    } else {
      setValidated(false);
      setIncorrect(false);
    }
  }, [navigate, seed, selectedWords]);

  const handleSkip = useCallback(async () => {
    navigate(ROUTES.CREATE_PASSWORD);
  }, [navigate]);

  return (
    <FullScreenContainer>
      <Box alignItems="center" paddingBottom="10px">
        <Inline
          wrap={false}
          alignVertical="center"
          alignHorizontal="center"
          space="5px"
        >
          <Symbol
            symbol="doc.plaintext"
            size={16}
            color="transparent"
            weight={'bold'}
          />
          <Text size="16pt" weight="bold" color="label" align="center">
            {i18n.t('seed_verify.title')}
          </Text>
        </Inline>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t('seed_verify.explanation')}
          </Text>
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box paddingTop="28px">
        <Box
          background="surfaceSecondaryElevated"
          borderRadius="16px"
          padding="12px"
          paddingBottom="4px"
          borderColor={
            (!validated && !incorrect && 'separatorSecondary') || undefined
          }
          borderWidth={'1px'}
          style={{
            borderColor: validated
              ? globalColors.green90
              : incorrect
              ? globalColors.red90
              : undefined,
          }}
        >
          <Columns>
            <Column width="1/3">
              {randomSeed.slice(0, 6).map((word, index) => (
                <Box
                  width="fit"
                  onClick={() => handleSelect(word)}
                  borderColor="separatorTertiary"
                  borderWidth="1px"
                  borderRadius="8px"
                  padding="8px"
                  key={`word_${index}`}
                  background={
                    validated
                      ? 'green'
                      : incorrect
                      ? 'red'
                      : selectedWords.includes(word)
                      ? 'accent'
                      : undefined
                  }
                  style={{
                    width: '102px',
                    marginBottom: '8px',
                    marginRight: '14px',
                    background: selectedWords.includes(word)
                      ? undefined
                      : 'radial-gradient(100% 100% at 0% 50%, rgba(245, 248, 255, 0.02) 0%, rgba(245, 248, 255, 0.06) 100%)',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Inline wrap={false} alignVertical="center" space="10px">
                    <Text
                      size="11pt"
                      weight="medium"
                      color={
                        selectedWords.includes(word)
                          ? 'labelQuaternary'
                          : 'transparent'
                      }
                      align="center"
                    >
                      {selectedWords.includes(word)
                        ? addLeadingZero((selectedWords.indexOf(word) + 1) * 4)
                        : '00'}
                    </Text>
                    <Text
                      size="14pt"
                      weight="bold"
                      color="label"
                      align="center"
                    >
                      {word}
                    </Text>
                  </Inline>
                </Box>
              ))}
            </Column>
            <Box
              borderColor="separatorTertiary"
              height="fit"
              style={{
                width: '1px',
                height: '100%',
                borderRightStyle: 'solid',
                borderRightWidth: '1px',
              }}
            ></Box>
            <Column width="1/3">
              {randomSeed.slice(-6).map((word, index) => (
                <Box
                  width="fit"
                  onClick={() => handleSelect(word)}
                  borderColor="separatorTertiary"
                  borderRadius="8px"
                  padding="8px"
                  borderWidth="1px"
                  background={
                    validated
                      ? 'green'
                      : incorrect
                      ? 'red'
                      : selectedWords.includes(word)
                      ? 'accent'
                      : undefined
                  }
                  key={`word_${index + 6}`}
                  style={{
                    width: '102px',
                    marginBottom: '8px',
                    background: selectedWords.includes(word)
                      ? undefined
                      : 'radial-gradient(100% 100% at 0% 50%, rgba(245, 248, 255, 0.02) 0%, rgba(245, 248, 255, 0.06) 100%)',
                    marginLeft: '14px',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Inline wrap={false} alignVertical="center" space="10px">
                    <Text
                      size="11pt"
                      weight="medium"
                      color={
                        selectedWords.includes(word)
                          ? 'labelQuaternary'
                          : 'transparent'
                      }
                      align="center"
                    >
                      {selectedWords.includes(word)
                        ? addLeadingZero((selectedWords.indexOf(word) + 1) * 4)
                        : '00'}
                    </Text>
                    <Text
                      size="14pt"
                      weight="bold"
                      color="label"
                      align="center"
                    >
                      {word}
                    </Text>
                  </Inline>
                </Box>
              ))}
            </Column>
          </Columns>
        </Box>
      </Box>

      <Box>
        <Button
          color="labelTertiary"
          height="44px"
          variant="transparent"
          width="full"
          onClick={handleSkip}
          testId="skip-this-button"
        >
          {i18n.t('seed_verify.skip')}
        </Button>
      </Box>

      <Box width="full" paddingTop="80px" paddingBottom="60px"></Box>
    </FullScreenContainer>
  );
}
