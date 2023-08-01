import { motion } from 'framer-motion';
import * as React from 'react';

import appConnectionImageMask from 'static/assets/appConnectionImageMask.svg';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Bleed, Box, Inline, Symbol } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { AppConnectionMenu } from '../../components/AppConnectionMenu/AppConnectionMenu';
import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import ExternalImage from '../../components/ExternalImage/ExternalImage';
import { Navbar } from '../../components/Navbar/Navbar';
import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import { tabIndexes } from '../../utils/tabIndexes';

export const AppConnection = () => {
  const { url } = useActiveTab();
  const { appLogo, appHost } = useAppMetadata({ url });
  const { appSession } = useAppSession({ host: appHost });
  const { currentTheme } = useCurrentThemeStore();

  return (
    <AppConnectionMenu
      menuTriggerId="home-page-header-left"
      headerHostId="home-page-header-host"
      connectedAppsId="home-page-header-connected-apps"
      sideOffset={1}
      url={url}
    >
      {url ? (
        <Lens
          tabIndex={tabIndexes.WALLET_HEADER_LEFT_BUTTON}
          borderRadius="round"
        >
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
            <Inline
              alignHorizontal="center"
              alignVertical="center"
              height="full"
            >
              <Box
                position="absolute"
                style={{
                  paddingLeft: 24,
                  paddingBottom: 24,
                }}
              >
                <Box
                  backdropFilter="opacity(0%)"
                  style={{
                    height: 10,
                    width: 10,
                    borderRadius: 5,
                    backgroundColor:
                      currentTheme === 'dark' ? '#1D1E21' : '#F8F8F9',
                  }}
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
              {appSession ? (
                <Box
                  position="absolute"
                  style={{
                    marginRight: 16,
                    marginTop: 8,
                  }}
                >
                  <Box
                    style={{
                      height: 10,
                      width: 10,
                      borderRadius: 5,
                    }}
                  >
                    <Inline
                      alignHorizontal="center"
                      alignVertical="center"
                      height="full"
                    >
                      <Bleed top="7px">
                        <ChainBadge chainId={appSession?.chainId} size="8" />
                      </Bleed>
                    </Inline>
                  </Box>
                </Box>
              ) : null}
              <Box
                style={{
                  height: 16,
                  width: 16,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <ExternalImage
                  mask={appSession ? appConnectionImageMask : undefined}
                  src={appLogo}
                  width="16"
                  height="16"
                />
              </Box>
            </Inline>
          </Box>
        </Lens>
      ) : (
        <Navbar.SymbolButton
          symbol="app.badge.checkmark"
          variant="flat"
          tabIndex={tabIndexes.WALLET_HEADER_LEFT_BUTTON}
        />
      )}
    </AppConnectionMenu>
  );
};
