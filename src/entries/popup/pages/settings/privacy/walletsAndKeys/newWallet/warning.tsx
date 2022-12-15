import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Rows, Symbol, Text } from '~/design-system';
import {
  IconAndCopyItem,
  IconAndCopyList,
} from '~/entries/popup/components/IconAndCopyList.tsx/IconAndCopyList';

const iconAndCopyList: IconAndCopyItem[] = [
  {
    icon: {
      symbol: 'exclamationmark.triangle',
      color: 'orange',
    },
    copy: 'Never share your Private Key or enter it into any apps.',
  },
  {
    icon: {
      symbol: 'eye.slash.fill',
      color: 'pink',
    },
    copy: 'Make sure nobody can view your screen when viewing your Private Key.',
  },
  {
    icon: {
      symbol: 'lock.open.fill',
      color: 'red',
    },
    copy: 'Anyone with your Private Key can access your entire wallet.',
  },
  {
    icon: {
      symbol: 'lifepreserver',
      color: 'blue',
    },
    copy: 'Rainbow Support will never ask you for your Private Key.',
  },
];
export function NewPrivateKeyWarning() {
  const navigate = useNavigate();

  const handleShowRecoveryPhraseClick = useCallback(async () => {
    navigate('/settings/privacy/walletsAndKeys/accountDetails/privateKey');
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
      <IconAndCopyList iconAndCopyList={iconAndCopyList} />
      <Box width="full" style={{ paddingTop: 76 }}>
        <Rows alignVertical="top" space="8px">
          <Button
            color="accent"
            height="44px"
            variant="flat"
            width="full"
            symbol="key.fill"
            blur="26px"
            onClick={handleShowRecoveryPhraseClick}
          >
            Show Private Key
          </Button>
        </Rows>
      </Box>
    </Box>
  );
}
