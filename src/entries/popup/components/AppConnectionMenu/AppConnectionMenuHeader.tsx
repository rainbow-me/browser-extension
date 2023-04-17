import { motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
import { AppSession } from '~/core/state/appSessions';
import { ChainNameDisplay } from '~/core/types/chains';
import { Box, Inline, Inset, Row, Rows, Symbol, Text } from '~/design-system';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

import ExternalImage from '../ExternalImage/ExternalImage';

interface AppConnectionMenuHeaderProps {
  opacity: number;
  appLogo?: string;
  headerHostId?: string;
  appSession?: AppSession;
  appHost?: string;
  appName?: string;
}

export const AppConnectionMenuHeader = ({
  opacity,
  appLogo,
  headerHostId,
  appSession,
  appHost,
  appName,
}: AppConnectionMenuHeaderProps) => {
  return (
    <Box as={motion.div} initial={false} animate={{ opacity: opacity }}>
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
              id={`${headerHostId}-${appSession ? appHost : 'not-connected'}`}
            >
              <Rows space="10px">
                <Row>
                  <TextOverflow size="14pt" weight="bold" color="label">
                    {appName ?? appHost}
                  </TextOverflow>
                </Row>
                <Row>
                  <Text size="11pt" weight="bold">
                    {!appSession
                      ? i18n.t('menu.app_connection_menu.not_connected')
                      : ChainNameDisplay[appSession.chainId] || ''}
                  </Text>
                </Row>
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
    </Box>
  );
};
