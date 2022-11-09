import { motion } from 'framer-motion';
import * as React from 'react';
import { Address, useEnsAvatar, useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { initializeMessenger } from '~/core/messengers';
import { useAppSessionsStore } from '~/core/state';
import { getConnectedAppIcon } from '~/core/utils/connectedApps';
import { truncateAddress } from '~/core/utils/truncateAddress';
import { Box, Inline, Inset, Stack, Text } from '~/design-system';
import { Row, Rows } from '~/design-system/components/Rows/Rows';

import { PageHeader } from '../components/PageHeader/PageHeader';
import { SFSymbol } from '../components/SFSymbol/SFSymbol';
import { SwitchNetworkMenu } from '../components/SwitchMenu/SwitchNetworkMenu';
import { useAppSession } from '../hooks/useAppSession';

const messenger = initializeMessenger({ connect: 'inpage' });

export function ConnectedApps() {
  const { appSessions, clearSessions } = useAppSessionsStore();

  return (
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
        title={i18n.t('connected_apps.title')}
        leftRoute="/"
        leftSymbol="arrowLeft"
      />
      <Box
        style={{
          flex: 1,
          overflow: 'scroll',
        }}
      >
        <Rows alignVertical="top">
          {Object.keys(appSessions).map((key, i) => (
            <Row height="content" key={i}>
              <ConnectedApp
                host={appSessions[key].host}
                address={appSessions[key].address}
                chainId={appSessions[key].chainId}
              />
            </Row>
          ))}
        </Rows>
      </Box>

      <Box
        as="button"
        id="disconnect-button"
        boxShadow="24px accent"
        borderColor="buttonStroke"
        borderWidth="1px"
        onClick={clearSessions}
        padding="16px"
        bottom="0"
      >
        <Inline alignHorizontal="center" alignVertical="center" space="8px">
          <SFSymbol symbol={'xmark'} color="red" size={12} />
          <Text color="red" size="14pt" weight="bold">
            {i18n.t('connected_apps.disconnect')}
          </Text>
        </Inline>
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
  address: Address;
  chainId: number;
}) {
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: address });
  const { updateAppSessionChainId } = useAppSession({
    host,
  });

  const shuffleChainId = React.useCallback(
    (chainId: string) => {
      updateAppSessionChainId(Number(chainId));
      messenger.send(`chainChanged:${host}`, chainId);
    },
    [host, updateAppSessionChainId],
  );

  return (
    <SwitchNetworkMenu
      title={i18n.t('connected_apps.switch_networks')}
      onValueChange={shuffleChainId}
      selectedValue={String(chainId)}
      renderMenuTrigger={
        <Box as="button" id="switch-network-menu">
          <Inset horizontal="20px" vertical="8px">
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
                  src={getConnectedAppIcon(host)}
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
                    <Box>
                      <Text color="labelTertiary" size="12pt" weight="semibold">
                        {ensName || truncateAddress(address)}
                      </Text>
                    </Box>
                  </Inline>
                </Stack>
              </Box>
            </Inline>
          </Inset>
        </Box>
      }
    />
  );
}
