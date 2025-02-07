import { motion } from 'framer-motion';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { networkStore } from '~/core/state/networks/networks';
import { getChain } from '~/core/utils/chains';
import {
  Box,
  Column,
  Columns,
  Inset,
  Row,
  Rows,
  Symbol,
  Text,
} from '~/design-system';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

import { DappIcon } from '../DappIcon/DappIcon';

interface AppConnectionMenuHeaderProps {
  opacity: number;
  appLogo?: string;
  headerHostId?: string;
  activeSession: { address: Address; chainId: number } | null;
  appHost?: string;
  appName?: string;
}

export const AppConnectionMenuHeader = ({
  opacity,
  appLogo,
  headerHostId,
  activeSession,
  appHost,
  appName,
}: AppConnectionMenuHeaderProps) => {
  const chainsLabel = networkStore((state) => state.getNetworksLabel());
  return (
    <Box as={motion.div} initial={false} animate={{ opacity: opacity }}>
      <Inset top="10px" bottom="14px">
        <Columns space="8px" alignVertical="center">
          <Column width="content">
            <DappIcon appLogo={appLogo} size="18px" />
          </Column>
          <Column>
            <Box
              id={`${headerHostId}-${
                activeSession ? appHost : 'not-connected'
              }`}
            >
              <Rows space="8px">
                <Row>
                  <TextOverflow size="14pt" weight="bold" color="label">
                    {appName || appHost}
                  </TextOverflow>
                </Row>
                <Row>
                  <Text size="11pt" weight="bold">
                    {!activeSession
                      ? i18n.t('menu.app_connection_menu.not_connected')
                      : chainsLabel[activeSession.chainId] ||
                        getChain({ chainId: activeSession.chainId }).name ||
                        ''}
                  </Text>
                </Row>
              </Rows>
            </Box>
          </Column>
          <Column width="content">
            <Symbol
              size={6}
              color={activeSession ? 'green' : 'labelQuaternary'}
              symbol="circle.fill"
              weight="semibold"
            />
          </Column>
        </Columns>
      </Inset>
    </Box>
  );
};
