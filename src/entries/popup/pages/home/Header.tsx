import * as React from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useBalance, useEnsName } from 'wagmi';

import {
  SupportedCurrencyKey,
  supportedCurrencies,
} from '~/core/references/supportedCurrencies';
import { useCurrentAddressStore } from '~/core/state';
import {
  convertAmountToNativeDisplay,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';
import { truncateAddress } from '~/core/utils/truncateAddress';
import { Box, Inline, Inset, Stack, Text } from '~/design-system';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_ACCOUNT_2,
} from '~/entries/background/handlers/handleProviderRequest';

import { Avatar } from '../../components/Avatar/Avatar';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { SFSymbol, SFSymbolProps } from '../../components/SFSymbol/SFSymbol';
import { Tabs } from '../../components/Tabs/Tabs';
import { useAvatar } from '../../hooks/useAvatar';

import { MoreMenu } from './MoreMenu';
import { NetworkMenu } from './NetworkMenu';

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
      position="relative"
      style={{
        height: '260px',
      }}
    >
      <Box position="absolute" width="full">
        <PageHeader
          leftComponent={
            <NetworkMenu>
              <PageHeader.SymbolButton symbol="appBadgeCheckmark" />
            </NetworkMenu>
          }
          rightComponent={
            <MoreMenu>
              <PageHeader.SymbolButton symbol="ellipsis" />
            </MoreMenu>
          }
        />
      </Box>
      <Box paddingTop="28px">
        <Inset>
          <Stack alignHorizontal="center" space="16px">
            <AvatarSection />
            <NameSection />
            <ActionButtonsSection />
          </Stack>
        </Inset>
      </Box>
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

  const { setCurrentAddress } = useCurrentAddressStore();

  // TODO: handle account switching correctly
  const shuffleAccount = React.useCallback(() => {
    setCurrentAddress(
      address === DEFAULT_ACCOUNT ? DEFAULT_ACCOUNT_2 : DEFAULT_ACCOUNT,
    );
  }, [address, setCurrentAddress]);
  return (
    <Inline alignVertical="center" space="4px">
      <Box as="button" onClick={shuffleAccount} id="account-name-shuffle">
        <Text color="label" size="20pt" weight="heavy" testId="account-name">
          {ensName ?? truncateAddress(address || '0x')}
        </Text>
      </Box>
      <Link to="/wallets">
        <SFSymbol color="labelTertiary" size={20} symbol="chevronDown" />
      </Link>
    </Inline>
  );
}

function ActionButtonsSection() {
  const { address } = useAccount();
  const { avatar } = useAvatar({ address });
  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(address as string);
  }, [address]);
  return (
    <Box style={{ height: 56 }}>
      {avatar?.color && (
        <Inline space="12px">
          <Link onClick={handleCopy} to={''}>
            <ActionButton symbol="copy" text="Copy" />
          </Link>
          <ActionButton symbol="swap" text="Swap" />
          <Link to="/send">
            <ActionButton symbol="send" text="Send" />
          </Link>
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
