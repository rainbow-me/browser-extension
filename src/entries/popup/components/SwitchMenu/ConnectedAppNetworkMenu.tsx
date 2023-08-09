import React, { ReactNode, useCallback } from 'react';

import { i18n } from '~/core/languages';
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

import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItemIndicator,
  ContextMenuRadioGroup,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ContextMenu/ContextMenu';
import ExternalImage from '../ExternalImage/ExternalImage';

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
  const { appHost, appLogo, appName } = useAppMetadata({ url });

  const { updateAppSessionChainId, disconnectAppSession, appSession } =
    useAppSession({ host: appHost });

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
      <ContextMenuTrigger asChild>
        <Box testId={menuTriggerId}>{children}</Box>
      </ContextMenuTrigger>
      <ContextMenuContent sideOffset={sideOffset}>
        {url ? (
          <Inset top="10px" bottom="14px">
            <Inline alignHorizontal="justify" alignVertical="center">
              <Inline space="10px" alignVertical="center">
                <Box
                  style={{
                    height: 14,
                    width: 14,
                    borderRadius: 3.5,
                    overflow: 'hidden',
                    marginRight: 2,
                  }}
                >
                  <ExternalImage src={appLogo} width="14" height="14" />
                </Box>
                <Box
                  id={`${headerHostId}-${
                    appSession ? appHost : 'not-connected'
                  }`}
                >
                  <Rows space="10px">
                    <Row>
                      <TextOverflow size="14pt" weight="bold" color="label">
                        {appName ?? appHost}
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
              value={`${appSession?.activeSession?.chainId}`}
              onValueChange={changeChainId}
            >
              <SwitchNetworkMenuSelector
                type="context"
                highlightAccentColor
                selectedValue={`${appSession?.activeSession?.chainId}`}
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
