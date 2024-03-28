import React, { useCallback, useImperativeHandle, useRef } from 'react';
import { type Address } from 'viem';
import { useBalance } from 'wagmi';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
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
import { Lens } from '~/design-system/components/Lens/Lens';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { TextProps } from '~/design-system/components/Text/Text';
import { EthSymbol } from '~/entries/popup/components/EthSymbol/EthSymbol';
import { Spinner } from '~/entries/popup/components/Spinner/Spinner';
import { SwitchMenu } from '~/entries/popup/components/SwitchMenu/SwitchMenu';
import { SwitchNetworkMenu } from '~/entries/popup/components/SwitchMenu/SwitchNetworkMenu';
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';
import { useAccounts } from '~/entries/popup/hooks/useAccounts';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import useKeyboardAnalytics from '~/entries/popup/hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';
import { useWalletInfo } from '~/entries/popup/hooks/useWalletInfo';
import {
  getInputIsFocused,
  radixIsActive,
  switchNetworkMenuIsActive,
} from '~/entries/popup/utils/activeElement';
import { simulateClick } from '~/entries/popup/utils/simulateClick';

import { ChainBadge } from '../../../components/ChainBadge/ChainBadge';

export const WalletName = ({
  address,
  ...props
}: { address: Address } & Partial<TextProps>) => {
  const { displayName } = useWalletInfo({ address });
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <TextOverflow color="label" size="14pt" weight="semibold" {...props}>
      {displayName}
    </TextOverflow>
  );
};

export const BottomWallet = React.forwardRef(function BottomWallet(
  {
    selectedWallet,
    displaySymbol = false,
  }: {
    selectedWallet: Address;
    displaySymbol: boolean;
  },
  ref,
) {
  const { trackShortcut } = useKeyboardAnalytics();
  const triggerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    triggerMenu: () => simulateClick(triggerRef?.current),
  }));
  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.connect.OPEN_WALLET_SWITCHER.key) {
        trackShortcut({
          key: shortcuts.connect.OPEN_WALLET_SWITCHER.display,
          type: 'connect.openWalletSwitcher',
        });
        simulateClick(triggerRef?.current);
      }
    },
  });
  return (
    <Box testId="switch-wallet-menu" ref={triggerRef}>
      <Inline alignVertical="center">
        <Lens
          alignItems="center"
          borderRadius="round"
          tabIndex={displaySymbol ? 0 : -1}
          style={{
            flexDirection: 'row',
            display: 'flex',
            gap: 4,
            padding: 2,
          }}
        >
          <WalletAvatar
            addressOrName={selectedWallet}
            size={18}
            emojiSize={'12pt'}
          />
          <WalletName color="labelSecondary" address={selectedWallet} />
          {displaySymbol && (
            <Symbol
              color="labelSecondary"
              size={14}
              symbol="chevron.down.circle"
              weight="semibold"
            />
          )}
        </Lens>
      </Inline>
    </Box>
  );
});

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
  const { setCurrentAddress } = useCurrentAddressStore();
  const { sortedAccounts } = useAccounts();
  const { trackShortcut } = useKeyboardAnalytics();
  const menuTriggerRef = useRef<{ triggerMenu: () => void }>(null);

  const onOpenChange = useCallback((isOpen: boolean) => {
    isOpen && analytics.track(event.dappPromptConnectWalletClicked);
  }, []);

  const onValueChange = useCallback(
    (address: string) => {
      setCurrentAddress(address as Address);
      setSelectedWallet(address as Address);
      analytics.track(event.dappPromptConnectWalletSwitched);
    },
    [setCurrentAddress, setSelectedWallet],
  );

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (!switchNetworkMenuIsActive() && !getInputIsFocused()) {
        const regex = /^[1-9]$/;
        if (regex.test(e.key)) {
          const accountIndex = parseInt(e.key, 10) - 1;
          if (sortedAccounts[accountIndex]) {
            trackShortcut({
              key: e.key.toString(),
              type: 'connect.switchWallet',
            });
            onValueChange(sortedAccounts[accountIndex]?.address);
          }
        }
      }
    },
  });

  return (
    <Stack space="8px">
      <Text size="12pt" weight="semibold" color="labelQuaternary">
        {i18n.t('approve_request.wallet')}
      </Text>
      <SwitchMenu
        title={i18n.t('approve_request.switch_wallets')}
        renderMenuTrigger={
          <BottomWallet
            selectedWallet={selectedWallet}
            displaySymbol
            ref={menuTriggerRef}
          />
        }
        menuItemIndicator={
          <Symbol symbol="checkmark" size={11} weight="semibold" />
        }
        renderMenuItem={(wallet, i) => (
          <Box testId={`switch-wallet-item-${i}`}>
            <Inline space="8px" alignVertical="center">
              <WalletAvatar
                addressOrName={wallet as Address}
                size={18}
                emojiSize={'12pt'}
              />
              <WalletName color="label" address={wallet as Address} />
            </Inline>
          </Box>
        )}
        menuItems={sortedAccounts.map((a) => a.address)}
        selectedValue={selectedWallet}
        onValueChange={onValueChange}
        onOpenChange={onOpenChange}
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
    <Box testId="switch-network-menu">
      <Inline alignHorizontal="right" alignVertical="center">
        <Lens
          alignItems="center"
          borderRadius="round"
          style={{
            flexDirection: 'row',
            display: 'flex',
            gap: 4,
            padding: 2,
          }}
          bubblesOnKeyDown
          tabIndex={displaySymbol ? 0 : -1}
        >
          <ChainBadge chainId={selectedChainId} size="18" />
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
        </Lens>
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
        onOpenChange={(isOpen) =>
          isOpen && analytics.track(event.dappPromptConnectNetworkClicked)
        }
        onChainChanged={(chainId) => {
          setSelectedChainId(chainId);
          analytics.track(event.dappPromptConnectNetworkSwitched, { chainId });
        }}
        triggerComponent={
          <BottomNetwork selectedChainId={selectedChainId} displaySymbol />
        }
      />
    </Stack>
  );
};

export const WalletBalance = ({ appHost }: { appHost: string }) => {
  const { activeSession } = useAppSession({ host: appHost });
  const { data: balance } = useBalance({
    address: activeSession?.address,
    chainId: activeSession?.chainId,
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

const getAcceptRequestButtonStyles = ({
  waitingForDevice,
  dappStatus,
  disabled,
}: {
  waitingForDevice?: boolean;
  disabled?: boolean;
  dappStatus?: DAppStatus;
}) => {
  if (waitingForDevice)
    return {
      variant: 'disabled',
      emoji: '👀',
      color: 'label',
      textColor: 'label',
    } as const;

  if (dappStatus === DAppStatus.Scam)
    return {
      variant: disabled ? 'disabled' : 'tinted',
      color: 'red',
      textColor: 'red',
    } as const;
  return {
    variant: disabled ? 'disabled' : 'flat',
    color: 'accent',
    textColor: 'label',
  } as const;
};

export const AcceptRequestButton = ({
  disabled,
  onClick,
  label,
  waitingForDevice,
  loading = false,
  dappStatus,
}: {
  disabled?: boolean;
  onClick: () => void;
  label: string;
  waitingForDevice?: boolean;
  loading?: boolean;
  dappStatus?: DAppStatus;
}) => {
  const { textColor, ...buttonStyleProps } = getAcceptRequestButtonStyles({
    waitingForDevice,
    dappStatus,
    disabled,
  });
  const isScamDapp = dappStatus === DAppStatus.Scam;

  return (
    <Button
      height="44px"
      width="full"
      onClick={(!waitingForDevice && onClick) || undefined}
      testId="accept-request-button"
      disabled={disabled}
      tabIndex={0}
      shortcut={
        !disabled && !waitingForDevice && !isScamDapp
          ? { ...shortcuts.transaction_request.ACCEPT, type: 'request.accept' }
          : undefined
      }
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...buttonStyleProps}
    >
      <TextOverflow weight="bold" size="16pt" color={textColor}>
        {loading || waitingForDevice ? (
          <Inline space="4px" alignVertical="center">
            <Spinner size={16} color="label" />
            {waitingForDevice && i18n.t('approve_request.confirm_hw')}
          </Inline>
        ) : (
          label
        )}
      </TextOverflow>
    </Button>
  );
};

export const RejectRequestButton = ({
  onClick,
  label,
  dappStatus,
}: {
  onClick: () => void;
  label: string;
  dappStatus?: DAppStatus;
}) => {
  const isScamDapp = dappStatus === DAppStatus.Scam;

  return (
    <Button
      color={isScamDapp ? 'red' : 'separatorSecondary'}
      variant="flat"
      height="44px"
      width="full"
      onClick={onClick}
      testId="reject-request-button"
      tabIndex={0}
      shortcut={{
        ...shortcuts.transaction_request.CANCEL,
        disabled: radixIsActive,
        type: 'request.cancel',
        hideHint: !isScamDapp,
      }}
    >
      {label}
    </Button>
  );
};
