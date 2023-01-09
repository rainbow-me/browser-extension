import * as React from 'react';

import { Box, Inline } from '~/design-system';

import { Navbar } from '../../components/Navbar/Navbar';
import { AppNetworkMenu } from '../../components/SwitchMenu/AppNetworkMenu';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';

export const NetworkMenu = () => {
  const [url, setUrl] = React.useState('');
  const { appLogo, appHost } = useAppMetadata({ url });
  const { appSession } = useAppSession({ host: appHost });

  React.useEffect(() => {
    chrome?.tabs?.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const url = tabs[0].url;
      try {
        if (url) {
          const urlObject = new URL(url ?? '');
          if (
            urlObject.protocol === 'http:' ||
            urlObject.protocol === 'https:'
          ) {
            setUrl(url);
          }
        }
      } catch (e) {
        //
      }
    });
  }, []);

  return (
    <AppNetworkMenu sideOffset={1} url={url}>
      {appSession ? (
        <Box
          style={{
            height: 32,
            width: 32,
          }}
          borderRadius="round"
          background="surfaceSecondaryElevated"
          borderColor="separatorTertiary"
          borderWidth="1px"
        >
          <Inline alignHorizontal="center" alignVertical="center">
            <Box
              style={{
                height: 14,
                width: 14,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <img src={appLogo} width="100%" height="100%" />
            </Box>
          </Inline>
        </Box>
      ) : (
        <Navbar.SymbolButton symbol="app.badge.checkmark" variant="flat" />
      )}
    </AppNetworkMenu>
  );
};
