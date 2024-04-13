import { motion } from 'framer-motion';
import * as React from 'react';

import appConnectionImageMask from 'static/assets/appConnectionImageMask.svg';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { ChainId } from '~/core/types/chains';
import { Box, Inline, Symbol } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { AppConnectionMenu } from '../../components/AppConnectionMenu/AppConnectionMenu';
import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { DappIcon } from '../../components/DappIcon/DappIcon';
import { Navbar } from '../../components/Navbar/Navbar';
import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppSession } from '../../hooks/useAppSession';
import { tabIndexes } from '../../utils/tabIndexes';

export const AppConnection = () => {
  const { url } = useActiveTab();
  const { data: dappMetadata } = useDappMetadata({ url });
  const { appSession, activeSession } = useAppSession({
    host: dappMetadata?.appHost,
  });
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
                <Box position="absolute">
                  <Box
                    position="relative"
                    style={{
                      marginRight: 16,
                      marginTop: 1,
                    }}
                  >
                    <Inline
                      alignHorizontal="center"
                      alignVertical="center"
                      height="full"
                    >
                      <Box>
                        <ChainBadge
                          chainId={activeSession?.chainId || ChainId.mainnet}
                          size="8"
                        />
                      </Box>
                    </Inline>
                  </Box>
                </Box>
              ) : null}
              <DappIcon
                appLogo={dappMetadata?.appLogo}
                size="16px"
                mask={appSession ? appConnectionImageMask : undefined}
              />
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
