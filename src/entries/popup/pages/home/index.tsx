import * as React from 'react';
import { useAccount } from 'wagmi';

import { AccentColorProvider, Box, Inset, Separator } from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';

import { useAvatar } from '../../hooks/useAvatar';
import { MainLayout } from '../../layouts/MainLayout';

import { Activity } from './Activity';
import { Header } from './Header';
import { Tokens } from './Tokens';

export type Tab = 'tokens' | 'activity';

export function Home() {
  const { address } = useAccount();
  const { avatar } = useAvatar({ address });
  const [activeTab, setActiveTab] = React.useState<Tab>('tokens');

  return (
    <AccentColorProvider color={avatar?.color || globalColors.blue50}>
      {({ className, style }) => (
        <MainLayout className={className} style={style}>
          <Header activeTab={activeTab} onSelectTab={setActiveTab} />
          <Separator color="separatorTertiary" strokeWeight="1px" />
          <Content>
            {activeTab === 'tokens' && <Tokens />}
            {activeTab === 'activity' && <Activity />}
          </Content>
        </MainLayout>
      )}
    </AccentColorProvider>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return (
    <Box
      background="surfacePrimaryElevated"
      style={{
        flex: 1,
        overflow: 'scroll',
      }}
    >
      <Inset top="20px">{children}</Inset>
    </Box>
  );
}
