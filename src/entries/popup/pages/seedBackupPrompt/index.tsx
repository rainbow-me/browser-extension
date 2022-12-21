import React from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { Box, Button, Rows, Symbol, Text } from '~/design-system';

import {
  IconAndCopyItem,
  IconAndCopyList,
} from '../../components/IconAndCopyList.tsx/IconAndCopyList';

const iconAndCopyList: IconAndCopyItem[] = [
  {
    icon: {
      symbol: 'highlighter',
      color: 'blue',
    },
    copy: i18n.t('seed_backup_prompt.warning_1'),
  },
  {
    icon: {
      symbol: 'exclamationmark.triangle',
      color: 'orange',
    },
    copy: i18n.t('seed_backup_prompt.warning_2'),
  },
  {
    icon: {
      symbol: 'lock.open.fill',
      color: 'red',
    },
    copy: i18n.t('seed_backup_prompt.warning_3'),
  },
];

export function SeedBackupPrompt() {
  const navigate = useNavigate();

  const handleShowRecoveryPhraseClick = React.useCallback(async () => {
    navigate('/seed-reveal');
  }, [navigate]);

  const handleSkipClick = React.useCallback(async () => {
    navigate('/create-password');
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
          {i18n.t('seed_backup_prompt.title')}
        </Text>
      </Box>
      <Box padding="12px">
        <IconAndCopyList iconAndCopyList={iconAndCopyList} />
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
            {i18n.t('seed_backup_prompt.reveal_your_recovery_phrase')}
          </Button>

          <Button
            color="labelSecondary"
            height="44px"
            variant="transparent"
            width="full"
            onClick={handleSkipClick}
          >
            {i18n.t('seed_backup_prompt.skip')}
          </Button>
        </Rows>
      </Box>
    </Box>
  );
}
