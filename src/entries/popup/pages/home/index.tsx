import * as React from 'react';
import { useAccount } from 'wagmi';

import {
  AccentColorProvider,
  Box,
  Inset,
  Separator,
  Stack,
} from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';

import { ClearStorage } from '../../components/_dev/ClearStorage';
import { InjectToggle } from '../../components/_dev/InjectToggle';
import { useAvatar } from '../../hooks/useAvatar';

import { Header } from './Header';

export type Tab = 'tokens' | 'activity';

export function Home() {
  const { address } = useAccount();

  const { avatar } = useAvatar({ address });

  const [activeTab, setActiveTab] = React.useState<Tab>('tokens');

  return (
    <AccentColorProvider color={avatar?.color || globalColors.blue50}>
      {({ className, style }) => (
        /* TODO: Convert to <Rows> */
        <Box
          className={className}
          style={{
            ...style,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* TODO: Convert to <Row> */}
          <Header activeTab={activeTab} onSelectTab={setActiveTab} />
          <Separator color="separatorTertiary" strokeWeight="1px" />
          <Box
            // TODO: Add proper background design token for this one.
            background="surfacePrimaryElevated"
            style={{
              flex: 1,
              overflow: 'scroll',
            }}
          >
            <Inset top="20px">
              <Stack space="20px">
                <InjectToggle />
                <ClearStorage />
              </Stack>
            </Inset>
          </Box>
        </Box>
      )}
    </AccentColorProvider>
  );
}
