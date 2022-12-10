import React from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { Box, Button, Inline, Rows, Symbol, Text } from '~/design-system';

export function SeedVerify() {
  const navigate = useNavigate();

  const handleShowRecoveryPhraseClick = React.useCallback(async () => {
    console.log('to do');
  }, []);

  const handleSkipClick = React.useCallback(async () => {
    navigate('/');
  }, [navigate]);

  return (
    <Box
      borderColor="separatorSecondary"
      borderWidth="1px"
      background="surfaceSecondary"
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="24px"
      paddingTop="32px"
    >
      <Box
        borderRadius="round"
        boxShadow="18px accent"
        borderWidth="1px"
        style={{
          height: 60,
          width: 60,
          overflow: 'hidden',
          position: 'absolute',
          borderColor: 'rgba(255, 255, 255, 0.03)',
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
        style={{ paddingTop: '84px', paddingBottom: '49px' }}
      >
        <Text size="16pt" weight="bold" color="label" align="center">
          {i18n.t('manual_backup_prompt.title')}
        </Text>
      </Box>
      <Box padding="16px">
        <Rows alignVertical="top" space="40px">
          <Inline space="16px" wrap={false} alignVertical="center">
            <Box display="flex" alignItems="center">
              <Symbol
                symbol="highlighter"
                size={18}
                color="accent"
                weight={'medium'}
              />
            </Box>
            <Text size="14pt" weight="medium" color="label">
              {i18n.t('manual_backup_prompt.write_down_seed_importance')}
            </Text>
          </Inline>
          <Inline space="16px" wrap={false} alignVertical="center">
            <Box display="flex" alignItems="center">
              <Symbol
                symbol="exclamationmark.triangle"
                size={18}
                color="orange"
                weight={'medium'}
              />
            </Box>
            <Text size="14pt" weight="medium" color="label">
              {i18n.t('manual_backup_prompt.secret_recovery_phrase_usage')}
            </Text>
          </Inline>
          <Inline space="16px" wrap={false} alignVertical="center">
            <Box display="flex" alignItems="center">
              <Symbol
                symbol="lock.open.fill"
                size={18}
                color="red"
                weight={'medium'}
              />
            </Box>
            <Text size="14pt" weight="medium" color="label">
              {i18n.t('manual_backup_prompt.secret_recovery_phrase_loss')}
            </Text>
          </Inline>
        </Rows>
      </Box>
      <Box width="full" paddingTop="52px">
        <Rows alignVertical="top" space="8px">
          <Button
            color="accent"
            height="44px"
            variant="flat"
            width="full"
            symbol="checkmark.circle.fill"
            blur="26px"
            onClick={handleShowRecoveryPhraseClick}
          >
            {i18n.t('manual_backup_prompt.reveal_your_recovery_phrase')}
          </Button>

          <Button
            color="labelSecondary"
            height="44px"
            variant="transparent"
            width="full"
            onClick={handleSkipClick}
          >
            {i18n.t('manual_backup_prompt.skip')}
          </Button>
        </Rows>
      </Box>
    </Box>
  );
}
