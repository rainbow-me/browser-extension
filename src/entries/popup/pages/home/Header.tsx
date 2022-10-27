import * as React from 'react';
import { useAccount, useBalance, useEnsName } from 'wagmi';

import {
  SupportedCurrencyKey,
  supportedCurrencies,
} from '~/core/references/supportedCurrencies';
import {
  convertAmountToNativeDisplay,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';
import { truncateAddress } from '~/core/utils/truncateAddress';
import { Box, Inline, Inset, Stack, Text } from '~/design-system';

import { Avatar } from '../../components/Avatar/Avatar';
import { SFSymbol, SFSymbolProps } from '../../components/SFSymbol/SFSymbol';
import { Tabs } from '../../components/Tabs/Tabs';
import { useAvatar } from '../../hooks/useAvatar';

import { Tab } from '.';

export function Header({
  activeTab,
  onSelectTab,
}: {
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
}) {
  return (
    <Box
      background="surfacePrimaryElevatedSecondary"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      style={{
        height: '260px',
      }}
    >
      <Inset top="36px">
        <Stack alignHorizontal="center" space="16px">
          <AvatarSection />
          <NameSection />
          <ActionButtonsSection />
        </Stack>
      </Inset>
      <Inset horizontal="20px">
        <NavigationBar activeTab={activeTab} onSelectTab={onSelectTab} />
      </Inset>
    </Box>
  );
}

function AvatarSection() {
  const { address } = useAccount();
  const { avatar, isFetched } = useAvatar({ address });
  return (
    <Avatar.Wrapper>
      {isFetched ? (
        <>
          {avatar?.imageUrl ? (
            <Avatar.Image imageUrl={avatar.imageUrl} />
          ) : (
            <Avatar.Emoji color={avatar?.color} emoji={avatar?.emoji} />
          )}
        </>
      ) : null}
      <Avatar.Skeleton />
    </Avatar.Wrapper>
  );
}

function NameSection() {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });
  return (
    <Inline alignVertical="center" space="4px">
      <Text color="label" size="20pt" weight="heavy" testId="account-name">
        {ensName ?? truncateAddress(address || '0x')}
      </Text>
      <SFSymbol color="labelTertiary" size={20} symbol="chevronDown" />
    </Inline>
  );
}

function ActionButtonsSection() {
  const { address } = useAccount();
  const { avatar } = useAvatar({ address });
  return (
    <Box style={{ height: 56 }}>
      {avatar?.color && (
        <Inline space="12px">
          <ActionButton symbol="copy" text="Copy" />
          <ActionButton symbol="swap" text="Swap" />
          <ActionButton symbol="send" text="Send" />
        </Inline>
      )}
    </Box>
  );
}

function ActionButton({
  symbol,
  text,
}: {
  symbol: SFSymbolProps['symbol'];
  text: string;
}) {
  return (
    <Stack alignHorizontal="center" space="10px">
      <Box
        background="accent"
        borderRadius="round"
        boxShadow="12px accent"
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{
          width: '36px',
          height: '36px',
        }}
      >
        <SFSymbol symbol={symbol} color="label" />
      </Box>
      <Text color="labelSecondary" size="12pt" weight="semibold">
        {text}
      </Text>
    </Stack>
  );
}

function NavigationBar({
  activeTab,
  onSelectTab,
}: {
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
}) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ addressOrName: address });
  const symbol = balance?.symbol as SupportedCurrencyKey;

  let displayBalance = symbol
    ? convertAmountToNativeDisplay(
        convertRawAmountToBalance(
          // @ts-expect-error – TODO: fix this
          balance?.value.hex || balance.value.toString(),
          supportedCurrencies[symbol],
        ).amount,
        symbol,
      )
    : '';
  if (symbol === 'ETH') {
    // Our font set doesn't seem to like the ether symbol, so we have to omit it and use
    // an icon instead.
    displayBalance = displayBalance.replace('Ξ', '');
  }

  return (
    /* TODO: Convert to <Columns> */
    <Box
      display="flex"
      justifyContent="space-between"
      style={{ height: '34px' }}
    >
      <Box>
        <Tabs>
          <Tabs.Tab
            active={activeTab === 'tokens'}
            onClick={() => onSelectTab('tokens')}
            symbol="tokens"
            text="Tokens"
          />
          <Tabs.Tab
            active={activeTab === 'activity'}
            onClick={() => onSelectTab('activity')}
            symbol="activity"
            text="Activity"
          />
        </Tabs>
      </Box>
      <Inset top="4px">
        {balance && (
          <Inline alignVertical="center">
            {balance?.symbol === 'ETH' && (
              <SFSymbol
                color={activeTab === 'tokens' ? 'label' : 'labelTertiary'}
                symbol="eth"
                size={14}
              />
            )}
            <Text
              color={activeTab === 'tokens' ? 'label' : 'labelTertiary'}
              size="16pt"
              weight="bold"
            >
              {displayBalance}
            </Text>
          </Inline>
        )}
      </Inset>
    </Box>
  );
}
