import { ReactNode, useCallback } from 'react';

import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import {
  Box,
  Inline,
  Inset,
  Row,
  Rows,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

import { useAppSession } from '../../hooks/useAppSession';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItemIndicator,
  ContextMenuRadioGroup,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ContextMenu/ContextMenu';
import { DappIcon } from '../DappIcon/DappIcon';

import { SwitchNetworkMenuSelector } from './SwitchNetworkMenu';

interface ConnectedAppNetworkMenuProps {
  children: ReactNode;
  url: string;
  sideOffset?: number;
  menuTriggerId?: string;
  headerHostId?: string;
}

export const ConnectedAppNetworkMenu = ({
  children,
  url,
  sideOffset,
  menuTriggerId,
  headerHostId,
}: ConnectedAppNetworkMenuProps) => {
  const { data: dappMetadata } = useDappMetadata({ url });

  const {
    updateAppSessionChainId,
    disconnectAppSession,
    appSession,
    activeSession,
  } = useAppSession({ host: dappMetadata?.appHost });

  const changeChainId = useCallback(
    (chainId: string) => {
      updateAppSessionChainId(Number(chainId));
    },
    [updateAppSessionChainId],
  );

  const disconnect = useCallback(() => {
    disconnectAppSession();
  }, [disconnectAppSession]);

  return (
    <ContextMenu>
      <ContextMenuTrigger openOnClick asChild>
        <Box testId={menuTriggerId}>{children}</Box>
      </ContextMenuTrigger>
      <ContextMenuContent sideOffset={sideOffset}>
        {url ? (
          <Inset top="10px" bottom="14px">
            <Inline alignHorizontal="justify" alignVertical="center">
              <Inline space="10px" alignVertical="center">
                <DappIcon appLogo={dappMetadata?.appLogo} size="14px" />
                <Box
                  id={`${headerHostId}-${
                    appSession ? dappMetadata?.appHost : 'not-connected'
                  }`}
                >
                  <Rows space="10px">
                    <Row>
                      <TextOverflow size="14pt" weight="bold" color="label">
                        {dappMetadata?.appName || dappMetadata?.appHost}
                      </TextOverflow>
                    </Row>
                    {!appSession && (
                      <Row>
                        <Text size="11pt" weight="bold">
                          {i18n.t('menu.app_connection_menu.not_connected')}
                        </Text>
                      </Row>
                    )}
                  </Rows>
                </Box>
              </Inline>
              <Symbol
                size={6}
                color={appSession ? 'green' : 'labelQuaternary'}
                symbol="circle.fill"
                weight="semibold"
              />
            </Inline>
          </Inset>
        ) : null}

        <Stack space="4px">
          <Stack space="12px">
            <ContextMenuSeparator />
            <Text color="labelTertiary" size="11pt" weight="bold">
              {i18n.t('menu.app_connection_menu.networks')}
            </Text>
          </Stack>

          <Box paddingTop="4px">
            <ContextMenuRadioGroup
              value={`${activeSession?.chainId}`}
              onValueChange={changeChainId}
            >
              <SwitchNetworkMenuSelector
                type="context"
                highlightAccentColor
                selectedValue={`${activeSession?.chainId}`}
                onShortcutPress={changeChainId}
                disconnect={disconnect}
                showDisconnect
              />
            </ContextMenuRadioGroup>
          </Box>
        </Stack>

        <ContextMenuItemIndicator style={{ marginLeft: 'auto' }}>
          o
        </ContextMenuItemIndicator>
      </ContextMenuContent>
    </ContextMenu>
  );
};
