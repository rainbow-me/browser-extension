import { motion } from 'framer-motion';
import * as React from 'react';

import { Box, Inline, Symbol } from '~/design-system';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

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
    <AppNetworkMenu
      menuTriggerId="home-page-header-left"
      headerHostId="home-page-header-host"
      connectedAppsId="home-page-header-connected-apps"
      sideOffset={1}
      url={url}
      type="dropdown"
    >
      {appSession ? (
        <Box
          as={motion.div}
          initial={{ zIndex: 0 }}
          whileHover={{ scale: transformScales['1.04'] }}
          whileTap={{ scale: transformScales['0.96'] }}
          transition={transitions.bounce}
          style={{
            height: 32,
            width: 32,
          }}
          borderRadius="round"
          background="surfaceSecondaryElevated"
          borderColor="separatorTertiary"
          borderWidth="1px"
        >
          <Inline alignHorizontal="center" alignVertical="center" height="full">
            <Box
              position="absolute"
              style={{
                paddingLeft: 24,
                paddingBottom: 24,
              }}
            >
              <Box
                background="surfacePrimaryElevated"
                style={{ height: 8, width: 8, borderRadius: 4.5 }}
              >
                <Inline
                  alignHorizontal="center"
                  alignVertical="center"
                  height="full"
                >
                  <Symbol
                    size={6}
                    color={appSession ? 'green' : 'labelQuaternary'}
                    symbol="circle.fill"
                    weight="semibold"
                  />
                </Inline>
              </Box>
            </Box>
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
        <Navbar.SymbolButton
          symbol="app.badge.checkmark"
          variant="flat"
          tabIndex={1}
        />
      )}
    </AppNetworkMenu>
  );
};
