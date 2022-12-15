import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Inline, Rows, Symbol, Text } from '~/design-system';

export function NewSecretPhraseWarning() {
  const navigate = useNavigate();

  const handleShowRecoveryPhraseClick = useCallback(async () => {
    navigate('/settings/privacy/walletsAndKeys/accountDetails/recoveryPhrase');
  }, [navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="20px"
      paddingTop="2px"
    >
      <Box
        borderRadius="round"
        boxShadow="18px accent"
        style={{
          height: 60,
          width: 60,
          overflow: 'hidden',
          position: 'absolute',
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="full"
          top="0"
          left="0"
          right="0"
          bottom="0"
          position="relative"
          style={{
            background:
              'radial-gradient(100% 144.46% at 0% 50%, #FF9233 0%, #FA423C 100%)',
            zIndex: 1,
          }}
        >
          <Symbol
            symbol="exclamationmark.triangle.fill"
            size={26}
            color="label"
            weight={'bold'}
          />
        </Box>
      </Box>
      <Box
        alignItems="center"
        style={{ paddingTop: '84px', paddingBottom: '60px' }}
      >
        <Text size="16pt" weight="bold" color="label" align="center">
          Before you proceed
        </Text>
      </Box>
      <Box paddingHorizontal="8px">
        <Rows alignVertical="top" space="40px">
          <Inline space="16px" wrap={false} alignVertical="center">
            <Box display="flex" alignItems="center">
              <Symbol
                symbol="exclamationmark.triangle"
                size={18}
                color="orange"
                weight="semibold"
              />
            </Box>
            <Text size="14pt" weight="medium" color="label">
              Never share your Recovery Phrase or enter it into any apps.
            </Text>
          </Inline>
          <Inline space="16px" wrap={false} alignVertical="center">
            <Box display="flex" alignItems="center">
              <Symbol
                symbol="eye.slash.fill"
                size={18}
                color="pink"
                weight="semibold"
              />
            </Box>
            <Text size="14pt" weight="medium" color="label">
              Make sure nobody can view your screen when viewing your Recovery
              Phrase.
            </Text>
          </Inline>
          <Inline space="16px" wrap={false} alignVertical="center">
            <Box display="flex" alignItems="center">
              <Symbol
                symbol="lock.open.fill"
                size={18}
                color="red"
                weight="semibold"
              />
            </Box>
            <Text size="14pt" weight="medium" color="label">
              Anyone with your Recovery Phrase can access your entire wallet.
            </Text>
          </Inline>
          <Inline space="16px" wrap={false} alignVertical="center">
            <Box display="flex" alignItems="center">
              <Symbol
                symbol="lifepreserver"
                size={18}
                color="blue"
                weight="semibold"
              />
            </Box>
            <Text size="14pt" weight="medium" color="label">
              Rainbow Support will never ask you for your Recovery Phrase.
            </Text>
          </Inline>
        </Rows>
      </Box>
      <Box width="full" style={{ paddingTop: 76 }}>
        <Rows alignVertical="top" space="8px">
          <Button
            color="accent"
            height="44px"
            variant="flat"
            width="full"
            symbol="doc.plaintext.fill"
            blur="26px"
            onClick={handleShowRecoveryPhraseClick}
          >
            Show Recovery Phrase
          </Button>
        </Rows>
      </Box>
    </Box>
  );
}
