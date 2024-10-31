import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'viem';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { i18n } from '~/core/languages';
import { useWalletBackupsStore } from '~/core/state/walletBackups';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { globalColors } from '~/design-system/styles/designTokens';

import { getImportWalletSecrets } from '../../handlers/importWalletSecrets';
import playSound from '../../utils/playSound';

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

const CHARACTER_WIDTH = 10;

type SeedWord = { word: string; index: number };

const SeedWordRow = ({
  word,
  index,
  selectedWords,
  validated,
  incorrect,
  handleSelect,
  additionalWidth,
}: {
  word: string;
  index: number;
  selectedWords: SeedWord[];
  validated: boolean;
  incorrect: boolean;
  handleSelect: ({ word, index }: SeedWord) => void;
  additionalWidth: number;
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
    <Lens
      width="fit"
      onClick={onClick}
      borderColor={{
        default: 'separatorTertiary',
      }}
      borderRadius="8px"
      padding="8px"
      borderWidth="1px"
      background={backgroundForWord}
      key={`word_${index}`}
      style={{
        maxWidth: '136px',
        marginBottom: '8px',
        background: wordIsSelected
          ? undefined
          : 'radial-gradient(100% 100% at 0% 50%, rgba(245, 248, 255, 0.02) 0%, rgba(245, 248, 255, 0.06) 100%)',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
      testId={`word_${word}`}
    >
      <Inline wrap={false} alignVertical="bottom" space="10px">
        <Box style={{ width: '15px' }}>
          <Text
            size="11pt"
            weight="bold"
            color={wordIsSelected ? 'label' : 'transparent'}
            align="center"
          >
            {wordIsSelected
              ? addLeadingZero((1 + selectedWordPosition) * 4)
              : '00'}
          </Text>
        </Box>

        <Box style={{ width: 57 + additionalWidth }}>
          <Text
            size="14pt"
            weight="bold"
            color="label"
            align="left"
            translate="no"
          >
            {word}
          </Text>
        </Box>
      </Inline>
    </Lens>
  );
};

export function SeedVerifyQuiz({
  address,
  onQuizValidated,
  handleSkip,
}: {
  address: Address;
  onQuizValidated: () => void;
  handleSkip: () => void;
}) {
  const [seed, setSeed] = useState('');
  const [validated, setValidated] = useState(false);
  const [incorrect, setIncorrect] = useState(false);

  const [randomSeedWithIndex, setRandomSeedWithIndex] = useState<SeedWord[]>(
    [],
  );
  const [selectedWords, setSelectedWords] = useState<SeedWord[]>([]);

  const setWalletBackedUp = useWalletBackupsStore.use.setWalletBackedUp();
  const seedBoxBorderColor = useMemo(() => {
    if (validated) return globalColors.green90;
    if (incorrect) return globalColors.red90;
  }, [incorrect, validated]);

  const handleSelect = useCallback(
    ({ word, index }: { word: string; index: number }) => {
      const selectedIndex = selectedWords.findIndex(
        (selectedWord) => selectedWord.index === index,
      );
      if (selectedIndex !== -1) {
        selectedWords.splice(selectedIndex, 1);
        setSelectedWords([...selectedWords]);
      } else if (selectedWords.length < 3) {
        selectedWords.push({ word, index });
        setSelectedWords([...selectedWords]);
      }

      if (selectedWords.length === 3) {
        setTimeout(() => {
          // Validate
          const seedWords = seed.split(' ');
          if (
            seedWords[3] === selectedWords[0]?.word &&
            seedWords[7] === selectedWords[1]?.word &&
            seedWords[11] === selectedWords[2]?.word
          ) {
            setValidated(true);
            analytics.track(event.walletBackup, {
              status: 'completed',
            });
            playSound('CorrectSeedQuiz');
            setTimeout(() => {
              setWalletBackedUp({ address });
              onQuizValidated();
            }, 1200);
          } else {
            playSound('IncorrectSeedQuiz');
            analytics.track(event.walletBackup, {
              status: 'failed',
            });
            setIncorrect(true);
          }
        }, 100);
      } else {
        setValidated(false);
        setIncorrect(false);
      }
    },
    [address, onQuizValidated, seed, selectedWords, setWalletBackedUp],
  );

  useEffect(() => {
    const init = async () => {
      const secrets = await getImportWalletSecrets();
      const seedArray = secrets[0].split(' ');
      const seedWithIndex = seedArray.map((word, index) => ({
        word,
        index,
      }));
      setSeed(secrets[0]);
      setRandomSeedWithIndex(shuffleArray(seedWithIndex));
    };
    init();
  }, [address, seed]);

  const additionalWordWith = useMemo(() => {
    const longestWordLength = seed
      .split(' ')
      .reduce(
        (prevLength, word) =>
          word.length > prevLength ? word.length : prevLength,
        0,
      );
    const adittionalCharacters =
      longestWordLength - 6 > 0 ? longestWordLength - 6 : 0;
    return adittionalCharacters * CHARACTER_WIDTH;
  }, [seed]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Stack space="24px" alignHorizontal="center">
        <Stack space="12px">
          <Text size="16pt" weight="bold" color="label" align="center">
            {i18n.t('seed_verify.title')}
          </Text>
          <Box paddingHorizontal="15px">
            <Text
              size="12pt"
              weight="regular"
              color="labelTertiary"
              align="center"
            >
              {i18n.t('seed_verify.explanation')}
            </Text>
          </Box>
        </Stack>
        <Box width="full" style={{ width: '106px' }}>
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
      </Stack>

      <Box paddingTop="36px">
        <Box
          flexBasis="0"
          width="fit"
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
            <Column>
              <Box paddingRight="14px">
                {randomSeedWithIndex.slice(0, 6).map(({ word, index }, i) => (
                  <SeedWordRow
                    key={i}
                    word={word}
                    index={index}
                    validated={validated}
                    incorrect={incorrect}
                    selectedWords={selectedWords}
                    handleSelect={handleSelect}
                    additionalWidth={additionalWordWith}
                  />
                ))}
              </Box>
            </Column>
            <Column width="content">
              <Box
                borderColor="separatorTertiary"
                height="fit"
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
                {randomSeedWithIndex.slice(-6).map(({ word, index }, i) => (
                  <SeedWordRow
                    key={i}
                    word={word}
                    index={index}
                    validated={validated}
                    incorrect={incorrect}
                    selectedWords={selectedWords}
                    handleSelect={handleSelect}
                    additionalWidth={additionalWordWith}
                  />
                ))}
              </Box>
            </Column>
          </Columns>
        </Box>
      </Box>

      <Box paddingTop="10px">
        <Button
          color="labelTertiary"
          height="44px"
          variant="transparent"
          width="full"
          onClick={() => {
            analytics.track(event.walletBackup, {
              status: 'skipped',
            });
            handleSkip();
          }}
          testId="skip-this-button"
          tabIndex={0}
        >
          {i18n.t('seed_verify.skip')}
        </Button>
      </Box>
    </Box>
  );
}
