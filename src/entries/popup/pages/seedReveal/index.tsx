import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Rows,
  Separator,
  Symbol,
  Text,
} from '~/design-system';

import { exportWallet } from '../../handlers/wallet';

export function SeedReveal() {
  const navigate = useNavigate();

  const [seed, setSeed] = useState('');
  const { currentAddress } = useCurrentAddressStore();

  useEffect(() => {
    const init = async () => {
      const seedPhrase = await exportWallet(currentAddress, '');
      setSeed(seedPhrase);
    };
    init();
  }, [currentAddress]);

  const handleSavedTheseWords = React.useCallback(async () => {
    navigate('/seed-verify');
  }, [navigate]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(seed as string);
  }, [seed]);

  return (
    <Box
      borderColor="separatorSecondary"
      borderWidth="1px"
      background="surfaceSecondary"
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="20px"
      paddingTop="16px"
    >
      <Box
        alignItems="center"
        paddingBottom="10px"
        style={{ marginTop: '40px' }}
      >
        <Inline
          wrap={false}
          alignVertical="center"
          alignHorizontal="center"
          space="5px"
        >
          <Symbol
            symbol="doc.plaintext"
            size={16}
            color="orange"
            weight={'bold'}
          />
          <Text size="16pt" weight="bold" color="label" align="center">
            {i18n.t('seed_reveal.title')}
          </Text>
        </Inline>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t('seed_reveal.write_down_seed_importance')}
          </Text>
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box
        style={{
          marginTop: '27px',
        }}
        alignItems="center"
        background="surfaceSecondaryElevated"
        borderRadius="16px"
        paddingHorizontal="24px"
        padding="16px"
      >
        <Columns>
          <Column width="1/3">
            {seed
              .split(' ')
              .slice(0, 6)
              .map((word, index) => (
                <Box padding="12px" paddingRight="24px" key={`word_${index}`}>
                  <Inline wrap={false} alignVertical="center" space="10px">
                    <Text
                      size="11pt"
                      weight="medium"
                      color="labelQuaternary"
                      align="center"
                    >
                      0{index + 1}
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
            {seed
              .split(' ')
              .slice(-6)
              .map((word, index) => (
                <Box
                  padding="12px"
                  paddingLeft="24px"
                  key={`word_${index + 6}`}
                >
                  <Inline wrap={false} alignVertical="center" space="10px">
                    <Text
                      size="11pt"
                      weight="medium"
                      color="labelQuaternary"
                      align="center"
                    >
                      {index + 7 > 9 ? '' : '0'}
                      {index + 7}
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

      <Box>
        <Button
          color="accent"
          height="44px"
          variant="transparent"
          width="full"
          onClick={handleCopy}
          symbol="doc.on.doc"
        >
          {i18n.t('seed_reveal.copy_to_clipboard')}
        </Button>
      </Box>

      <Box width="full" style={{ paddingTop: '100px' }}>
        <Rows alignVertical="top" space="8px">
          <Button
            color="accent"
            height="44px"
            variant="flat"
            width="full"
            symbol="checkmark.circle.fill"
            blur="26px"
            onClick={handleSavedTheseWords}
          >
            {i18n.t('seed_reveal.saved_these_words')}
          </Button>
        </Rows>
      </Box>
    </Box>
  );
}
