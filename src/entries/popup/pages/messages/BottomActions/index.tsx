import React from 'react';
import { Address, useBalance } from 'wagmi';

import { i18n } from '~/core/languages';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { handleSignificantDecimals } from '~/core/utils/numbers';
import {
  Box,
  Button,
  Inline,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { TextStyles } from '~/design-system/styles/core.css';
import { EthSymbol } from '~/entries/popup/components/EthSymbol/EthSymbol';
import { SwitchNetworkMenu } from '~/entries/popup/components/SwitchMenu/SwitchNetworkMenu';
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useWalletInfo } from '~/entries/popup/hooks/useWalletInfo';
import { useWallets } from '~/entries/popup/hooks/useWallets';

import { ChainBadge } from '../../../components/ChainBadge/ChainBadge';
import { SwitchMenu } from '../../../components/SwitchMenu/SwitchMenu';

const { innerWidth: windowWidth } = window;
const TITLE_MAX_WIDTH = windowWidth - 240;

export const WalletName = ({
  address,
  color = 'label',
}: {
  address: Address;
  color: TextStyles['color'];
}) => {
  const { displayName: walletDisplayName } = useWalletInfo({
    address,
  });
  return (
    <TextOverflow
      maxWidth={TITLE_MAX_WIDTH}
      color={color}
      size="14pt"
      weight="semibold"
    >
      {walletDisplayName}
    </TextOverflow>
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
        <WalletName color="labelSecondary" address={selectedWallet} />
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
  const { visibleWallets } = useWallets();

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
              <WalletName color="label" address={wallet as Address} />
            </Inline>
          </Box>
        )}
        menuItems={visibleWallets?.map((wallet) => wallet.address)}
        selectedValue={selectedWallet}
        onValueChange={(value) => setSelectedWallet(value as Address)}
      />
    </Stack>
  );
};

export const BottomNetwork = ({
  selectedChainId,
  displaySymbol = false,
  symbolSize,
  symbol,
}: {
  selectedChainId: ChainId;
  displaySymbol: boolean;
  symbolSize?: number;
  symbol?: SymbolProps['symbol'];
}) => {
  return (
    <Box id="switch-network-menu">
      <Inline alignHorizontal="right" alignVertical="center" space="4px">
        <ChainBadge chainId={selectedChainId} size={'small'} />
        <Text
          align="right"
          size="14pt"
          weight="semibold"
          color="labelSecondary"
        >
          {ChainNameDisplay[selectedChainId]}
        </Text>
        {displaySymbol && (
          <Symbol
            color="labelSecondary"
            size={symbolSize || 14}
            symbol={symbol || 'chevron.down.circle'}
            weight="semibold"
          />
        )}
      </Inline>
    </Box>
  );
};

export const BottomDisplayNetwork = ({
  selectedChainId,
}: {
  selectedChainId: ChainId;
}) => {
  return (
    <Stack space="8px">
      <Text align="right" size="12pt" weight="semibold" color="labelQuaternary">
        {i18n.t('approve_request.network')}
      </Text>
      <BottomNetwork selectedChainId={selectedChainId} displaySymbol={false} />
    </Stack>
  );
};

export const BottomSwitchNetwork = ({
  selectedChainId,
  setSelectedChainId,
}: {
  selectedChainId: ChainId;
  setSelectedChainId: (selectedChainId: ChainId) => void;
}) => {
  return (
    <Stack space="8px">
      <Text align="right" size="12pt" weight="semibold" color="labelQuaternary">
        {i18n.t('approve_request.network')}
      </Text>

      <SwitchNetworkMenu
        type="dropdown"
        chainId={selectedChainId}
        onChainChanged={(chainId) => setSelectedChainId(chainId)}
        triggerComponent={
          <BottomNetwork selectedChainId={selectedChainId} displaySymbol />
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
