import React from 'react';
import { Address, Chain, useBalance, useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { handleSignificantDecimals } from '~/core/utils/numbers';
import { truncateAddress } from '~/core/utils/truncateAddress';
import { Box, Button, Inline, Stack, Symbol, Text } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_ACCOUNT_2,
} from '~/entries/background/handlers/handleProviderRequest';
import { EthSymbol } from '~/entries/popup/components/EthSymbol/EthSymbol';
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useBackgroundAccounts } from '~/entries/popup/hooks/useBackgroundAccounts';

import { ChainBadge } from '../../../components/ChainBadge/ChainBadge';
import { SwitchMenu } from '../../../components/SwitchMenu/SwitchMenu';
import { SwitchNetworkMenu } from '../../../components/SwitchMenu/SwitchNetworkMenu';

export const EnsName = ({
  address,
  color = 'label',
}: {
  address: Address;
  color: TextStyles['color'];
}) => {
  const { data: ensName } = useEnsName({ address });
  return (
    <Text color={color} size="14pt" weight="semibold">
      {ensName || truncateAddress(address)}
    </Text>
  );
};

export const BottomWallet = ({
  selectedWallet,
  displaySymbol = false,
}: {
  selectedWallet: Address;
  displaySymbol: boolean;
}) => {
  return (
    <Box id={'switch-wallet-menu'}>
      <Inline alignVertical="center" space="4px">
        <WalletAvatar address={selectedWallet} size={18} emojiSize={'12pt'} />
        <EnsName color="labelSecondary" address={selectedWallet} />
        {displaySymbol && (
          <Symbol
            color="labelSecondary"
            size={14}
            symbol="chevron.down.circle"
            weight="semibold"
          />
        )}
      </Inline>
    </Box>
  );
};

export const BottomDisplayWallet = ({
  selectedWallet,
}: {
  selectedWallet: Address;
}) => {
  return (
    <Stack space="8px">
      <Text size="12pt" weight="semibold" color="labelQuaternary">
        {i18n.t('approve_request.wallet')}
      </Text>
      <BottomWallet selectedWallet={selectedWallet} displaySymbol={false} />
    </Stack>
  );
};

export const BottomSwitchWallet = ({
  selectedWallet,
  setSelectedWallet,
}: {
  selectedWallet: Address;
  setSelectedWallet: (selected: Address) => void;
}) => {
  const { accounts } = useBackgroundAccounts();
  const wallets: Address[] = [
    DEFAULT_ACCOUNT as Address,
    DEFAULT_ACCOUNT_2 as Address,
  ].concat(accounts);

  return (
    <Stack space="8px">
      <Text size="12pt" weight="semibold" color="labelQuaternary">
        {i18n.t('approve_request.wallet')}
      </Text>
      <SwitchMenu
        title={i18n.t('approve_request.switch_wallets')}
        renderMenuTrigger={
          <BottomWallet selectedWallet={selectedWallet} displaySymbol />
        }
        menuItemIndicator={
          <Symbol symbol="checkmark" size={11} weight="semibold" />
        }
        renderMenuItem={(wallet, i) => (
          <Box id={`switch-wallet-item-${i}`}>
            <Inline space="8px" alignVertical="center">
              <WalletAvatar
                address={wallet as Address}
                size={18}
                emojiSize={'12pt'}
              />
              <EnsName color="label" address={wallet as Address} />
            </Inline>
          </Box>
        )}
        menuItems={wallets}
        selectedValue={selectedWallet}
        onValueChange={(value) => setSelectedWallet(value as Address)}
      />
    </Stack>
  );
};

export const BottomNetwork = ({
  selectedNetwork,
  displaySymbol = false,
}: {
  selectedNetwork: Chain;
  displaySymbol: boolean;
}) => {
  return (
    <Box id="switch-network-menu">
      <Inline alignHorizontal="right" alignVertical="center" space="4px">
        <ChainBadge chainId={selectedNetwork.id} size={'small'} />
        <Text
          align="right"
          size="14pt"
          weight="semibold"
          color="labelSecondary"
        >
          {selectedNetwork.name}
        </Text>
        {displaySymbol && (
          <Symbol
            color="labelSecondary"
            size={14}
            symbol="chevron.down.circle"
            weight="semibold"
          />
        )}
      </Inline>
    </Box>
  );
};

export const BottomDisplayNetwork = ({
  selectedNetwork,
}: {
  selectedNetwork: Chain;
}) => {
  return (
    <Stack space="8px">
      <Text align="right" size="12pt" weight="semibold" color="labelQuaternary">
        {i18n.t('approve_request.network')}
      </Text>
      <BottomNetwork selectedNetwork={selectedNetwork} displaySymbol={false} />
    </Stack>
  );
};

export const BottomSwitchNetwork = ({
  selectedNetwork,
  setSelectedNetwork,
}: {
  selectedNetwork: Chain;
  setSelectedNetwork: (network: Chain) => void;
}) => {
  return (
    <Stack space="8px">
      <Text align="right" size="12pt" weight="semibold" color="labelQuaternary">
        {i18n.t('approve_request.network')}
      </Text>

      <SwitchNetworkMenu
        chainId={selectedNetwork.id}
        onChainChanged={(_, chain) => setSelectedNetwork(chain)}
        triggerComponent={
          <BottomNetwork selectedNetwork={selectedNetwork} displaySymbol />
        }
      />
    </Stack>
  );
};

export const WalletBalance = ({ appHost }: { appHost: string }) => {
  const { appSession } = useAppSession({ host: appHost });
  const { data: balance } = useBalance({
    addressOrName: appSession.address,
    chainId: appSession.chainId,
  });
  const displayBalance = handleSignificantDecimals(balance?.formatted || 0, 4);

  return (
    <Stack space="8px">
      <Text align="right" size="12pt" weight="semibold" color="labelQuaternary">
        {i18n.t('approve_request.balance')}
      </Text>

      <Inline alignVertical="center" alignHorizontal="right">
        {balance?.symbol === 'ETH' && (
          <EthSymbol color="labelTertiary" size={12} />
        )}
        <Text color="labelSecondary" size="14pt" weight="bold">
          {displayBalance}
        </Text>
      </Inline>
    </Stack>
  );
};

export const AcceptRequestButton = ({
  onClick,
  label,
  waitingForDevice,
}: {
  onClick: () => void;
  label: string;
  waitingForDevice?: boolean;
}) => {
  return (
    <Button
      emoji={waitingForDevice ? '👀' : undefined}
      color={waitingForDevice ? 'label' : 'accent'}
      height="44px"
      width="full"
      onClick={(!waitingForDevice && onClick) || undefined}
      testId="accept-request-button"
      variant={waitingForDevice ? 'disabled' : 'flat'}
    >
      {label}
    </Button>
  );
};

export const RejectRequestButton = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) => {
  return (
    <Button
      color={'labelSecondary'}
      height="44px"
      width="full"
      onClick={onClick}
      testId="reject-request-button"
      variant={'transparent'}
    >
      {label}
    </Button>
  );
};
