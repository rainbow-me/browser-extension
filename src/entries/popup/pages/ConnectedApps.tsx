import { motion } from 'framer-motion';
import * as React from 'react';
import { chain, useEnsAvatar, useEnsName } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { useAppSessionsStore } from '~/core/state';
import { Box, Inline, Inset, Stack, Text } from '~/design-system';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_ACCOUNT_2,
} from '~/entries/background/handlers/handleProviderRequest';

import { PageHeader } from '../components/PageHeader';
import { useAppSession } from '../hooks/useAppSession';

const messenger = initializeMessenger({ connect: 'inpage' });

export function ConnectedApps() {
  const { appSessions, clearSessions } = useAppSessionsStore();

  return (
    /* TODO: Convert to <Rows> */
    <Box
      as={motion.div}
      display="flex"
      flexDirection="column"
      initial={{ opacity: 0, x: window.innerWidth }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: window.innerWidth }}
      transition={{ type: 'tween', duration: 0.2 }}
      height="full"
    >
      <PageHeader
        title={'Connected Apps'}
        leftRoute="/"
        leftSymbol="arrowLeft"
      />

      {/* TODO: Convert to <Row> */}
      <Box>
        {Object.keys(appSessions).map((key, i) => (
          <ConnectedApp
            key={i}
            host={appSessions[key].host}
            address={appSessions[key].address}
            chainId={appSessions[key].chainId}
          />
        ))}
      </Box>
      <Box
        as="button"
        id="disconnect-button"
        boxShadow="24px accent"
        borderColor="buttonStroke"
        borderWidth="1px"
        onClick={clearSessions}
        padding="16px"
        style={{
          width: '100%',
        }}
        bottom="0"
      >
        <Text color="red" size="14pt" weight="bold">
          Disconnect All
        </Text>
      </Box>
    </Box>
  );
}

function ConnectedApp({
  host,
  address,
  chainId,
}: {
  host: string;
  address: `0x${string}`;
  chainId: number;
}) {
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: address });
  const { updateAppSessionChainId, updateAppSessionAddress } = useAppSession({
    host,
  });

  const shuffleChainId = React.useCallback(() => {
    // TODO: handle chain switching correctly
    updateAppSessionChainId(
      chainId === chain.mainnet.id ? chain.arbitrum.id : chain.mainnet.id,
    );
    messenger.send(
      `chainChanged:${host}`,
      chainId === chain.mainnet.id ? chain.arbitrum.id : chain.mainnet.id,
    );
  }, [chainId, host, updateAppSessionChainId]);

  const shuffleAddress = React.useCallback(() => {
    // TODO: handle account switching correctly
    updateAppSessionAddress(
      address === DEFAULT_ACCOUNT ? DEFAULT_ACCOUNT_2 : DEFAULT_ACCOUNT,
    );
    messenger.send(
      `accountsChanged:${host}`,
      address === DEFAULT_ACCOUNT ? DEFAULT_ACCOUNT_2 : DEFAULT_ACCOUNT,
    );
  }, [address, host, updateAppSessionAddress]);

  return (
    <Box>
      <Inset horizontal="20px" vertical="8px">
        <Box
          height="full"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Inline space="8px">
            <Box
              background="fill"
              borderRadius="12px"
              style={{
                width: '36px',
                height: '36px',
                overflow: 'hidden',
              }}
            >
              <img
                src={
                  'https://raw.githubusercontent.com/rainbow-me/rainbow/develop/src/assets/dappLogos/rainbowkit.com.jpg'
                }
                width="100%"
                height="100%"
              />
            </Box>
            <Box>
              <Stack space="8px">
                <Text size="14pt" weight="semibold">
                  {host}
                </Text>
                <Inline space="4px" alignVertical="center">
                  <Box
                    background="fill"
                    borderRadius="30px"
                    as="button"
                    onClick={shuffleChainId}
                    style={{
                      width: '16px',
                      height: '16px',
                      overflow: 'hidden',
                    }}
                  >
                    {ensAvatar && (
                      /* TODO: Convert to <Image> & Imgix/Cloudinary */
                      <img
                        src={ensAvatar}
                        width="100%"
                        height="100%"
                        loading="lazy"
                      />
                    )}
                  </Box>
                  <Box as="button" onClick={shuffleAddress}>
                    <Text color="labelTertiary" size="12pt" weight="semibold">
                      {ensName}
                    </Text>
                  </Box>
                </Inline>
              </Stack>
            </Box>
          </Inline>
        </Box>
      </Inset>
    </Box>
  );
}
