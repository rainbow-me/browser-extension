import React, { useCallback, useEffect, useMemo, useState } from 'react';

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

const shuffleArray = (array: { word: string; index: number }[]) => {
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

type SeedWord = { word: string; index: number };

const SeedWordRow = ({
  word,
  index,
  selectedWords,
  validated,
  incorrect,
  handleSelect,
}: {
  word: string;
  index: number;
  selectedWords: SeedWord[];
  validated: boolean;
  incorrect: boolean;
  handleSelect: ({ word, index }: SeedWord) => void;
}) => {
  const selectedWordPosition = useMemo(
    () =>
      selectedWords.findIndex(
        (selectedWord) =>
          selectedWord.index === index && selectedWord.word === word,
      ),
    [index, selectedWords, word],
  );

  const wordIsSelected = useMemo(
    () => selectedWordPosition !== -1,
    [selectedWordPosition],
  );

  const backgroundForWord = useMemo(() => {
    if (validated) return 'green';
    if (incorrect) return 'red';
    if (wordIsSelected) return 'accent';
  }, [incorrect, validated, wordIsSelected]);

  const onClick = useCallback(() => {
    handleSelect({ word, index });
  }, [handleSelect, index, word]);

  return (
    <Box
      width="fit"
      onClick={onClick}
      borderColor="separatorTertiary"
      borderRadius="8px"
      padding="8px"
      borderWidth="1px"
      background={backgroundForWord}
      key={`word_${index}`}
      style={{
        width: '102px',
        marginBottom: '8px',
        background: wordIsSelected
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
          color={wordIsSelected ? 'labelQuaternary' : 'transparent'}
          align="center"
        >
          {wordIsSelected
            ? addLeadingZero((1 + selectedWordPosition) * 4)
            : '00'}
        </Text>
        <Text size="14pt" weight="bold" color="label" align="center">
          {word}
        </Text>
      </Inline>
    </Box>
  );
};

export function SeedVerify() {
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();

  const [seed, setSeed] = useState('');
  const [validated, setValidated] = useState(false);
  const [incorrect, setIncorrect] = useState(false);

  const [randomSeedWithIndex, setRaindomSeedWithIndex] = useState<SeedWord[]>(
    [],
  );
  const [newSelectedWords, setNewSelectedWords] = useState<SeedWord[]>([]);

  const seedBoxBorderColor = useMemo(() => {
    if (validated) return globalColors.green90;
    if (incorrect) return globalColors.red90;
  }, [incorrect, validated]);

  const newHandleSelect = useCallback(
    ({ word, index }: { word: string; index: number }) => {
      const alreadySelected = newSelectedWords.find(
        (selectedWord) =>
          selectedWord.index === index && selectedWord.word === word,
      );
      if (alreadySelected) {
        const selectedWords = newSelectedWords.filter(
          (selectedWord) =>
            selectedWord.index !== index && selectedWord.word !== word,
        );
        setNewSelectedWords([...selectedWords]);
      } else {
        const selectedWords = newSelectedWords;
        selectedWords.push({ word, index });
        setNewSelectedWords([...selectedWords]);
      }
    },
    [newSelectedWords],
  );

  const handleSkip = useCallback(
    () => navigate(ROUTES.CREATE_PASSWORD),
    [navigate],
  );

  useEffect(() => {
    const init = async () => {
      const seedPhrase = await exportWallet(currentAddress, '');
      const seedArray = seedPhrase.split(' ');
      const seedWithIndex = seedArray.map((word, index) => ({
        word,
        index,
      }));
      setSeed(seedPhrase);
      setRaindomSeedWithIndex(shuffleArray(seedWithIndex));
    };
    init();
  }, [currentAddress, seed]);

  useEffect(() => {
    if (newSelectedWords.length === 3) {
      setTimeout(() => {
        // Validate
        const seedWords = seed.split(' ');
        if (
          seedWords[3] === newSelectedWords[0].word &&
          newSelectedWords[0].index === 3 &&
          seedWords[7] === newSelectedWords[1].word &&
          newSelectedWords[1].index === 7 &&
          seedWords[11] === newSelectedWords[2].word &&
          newSelectedWords[2].index === 11
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
  }, [navigate, newSelectedWords, seed]);

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
            borderColor: seedBoxBorderColor,
          }}
        >
          <Columns>
            <Column width="1/3">
              <Box paddingRight="14px">
                {randomSeedWithIndex.slice(0, 6).map(({ word, index }, i) => (
                  <SeedWordRow
                    key={i}
                    word={word}
                    index={index}
                    validated={validated}
                    incorrect={incorrect}
                    selectedWords={newSelectedWords}
                    handleSelect={newHandleSelect}
                  />
                ))}
              </Box>
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
              <Box paddingLeft="14px">
                {randomSeedWithIndex.slice(-6).map(({ word, index }, i) => (
                  <SeedWordRow
                    key={i}
                    word={word}
                    index={index}
                    validated={validated}
                    incorrect={incorrect}
                    selectedWords={newSelectedWords}
                    handleSelect={newHandleSelect}
                  />
                ))}
              </Box>
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
