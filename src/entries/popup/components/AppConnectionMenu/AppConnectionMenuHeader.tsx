import { motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
import { AppSession } from '~/core/state/appSessions';
import { ChainNameDisplay } from '~/core/types/chains';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Row,
  Rows,
  Symbol,
  Text,
} from '~/design-system';
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
        <Columns space="8px" alignVertical="center">
          <Column width="content">
            <Box
              style={{
                height: 18,
                width: 18,
                borderRadius: 3.5,
                overflow: 'hidden',
                marginRight: 2,
              }}
            >
              <Inline
                height="full"
                alignHorizontal="center"
                alignVertical="center"
              >
                <ExternalImage src={appLogo} width="16" height="16" />
              </Inline>
            </Box>
          </Column>
          <Column>
            <Box
              id={`${headerHostId}-${appSession ? appHost : 'not-connected'}`}
            >
              <Rows space="8px">
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
          </Column>
          <Column width="content">
            <Symbol
              size={6}
              color={appSession ? 'green' : 'labelQuaternary'}
              symbol="circle.fill"
              weight="semibold"
            />
          </Column>
        </Columns>
      </Inset>
    </Box>
  );
};
