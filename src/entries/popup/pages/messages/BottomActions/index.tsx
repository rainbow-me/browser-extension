import { uuid4 } from '@sentry/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { Address, Chain, useBalance, useEnsAvatar, useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { initializeMessenger } from '~/core/messengers';
import { SupportedCurrencyKey, supportedCurrencies } from '~/core/references';
import { WalletActions } from '~/core/types/walletActions';
import {
  convertAmountToNativeDisplay,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';
import { truncateAddress } from '~/core/utils/truncateAddress';
import { Box, Inline, Stack, Text } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_ACCOUNT_2,
} from '~/entries/background/handlers/handleProviderRequest';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';

import { ChainBadge } from '../../../components/ChainBadge/ChainBadge';
import { SFSymbol } from '../../../components/SFSymbol/SFSymbol';
import { SwitchMenu } from '../../../components/SwitchMenu/SwitchMenu';
import { SwitchNetworkMenu } from '../../../components/SwitchMenu/SwitchNetworkMenu';

export const EnsAvatar = ({ address }: { address: Address }) => {
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: address });
  return (
    <Box
      background="fill"
      borderRadius="30px"
      style={{
        width: '18px',
        height: '18px',
        overflow: 'hidden',
      }}
    >
      {ensAvatar && (
        /* TODO: Convert to <Image> & Imgix/Cloudinary */
        <img src={ensAvatar} width="100%" height="100%" loading="lazy" />
      )}
    </Box>
  );
};

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
        <EnsAvatar address={selectedWallet} />
        <EnsName color="labelSecondary" address={selectedWallet} />
        {displaySymbol && (
          <SFSymbol
            color="labelSecondary"
            size={14}
            symbol="chevronDownCircle"
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

const messenger = initializeMessenger({ connect: 'background' });

const walletAction = async (
  action: keyof typeof WalletActions,
  payload: unknown,
) => {
  const { result }: { result: unknown } = await messenger.send(
    WalletActions.action,
    {
      action,
      payload,
    },
    { id: uuid4() },
  );
  return result;
};

export const BottomSwitchWallet = ({
  selectedWallet,
  setSelectedWallet,
}: {
  selectedWallet: Address;
  setSelectedWallet: (selected: Address) => void;
}) => {
  const [accounts, setAccounts] = useState<Address[]>([]);
  const getAccounts = useCallback(async () => {
    const accounts = (await walletAction(
      WalletActions.get_accounts,
      {},
    )) as Address[];
    setAccounts(accounts);
    return accounts;
  }, []);

  useEffect(() => {
    getAccounts();
  }, [getAccounts]);

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
        menuItemIndicator={<SFSymbol symbol="checkMark" size={11} />}
        renderMenuItem={(wallet, i) => (
          <Box id={`switch-wallet-item-${i}`}>
            <Inline space="8px" alignVertical="center">
              <EnsAvatar address={wallet as Address} />
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
          <SFSymbol
            color="labelSecondary"
            size={14}
            symbol="chevronDownCircle"
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
    <Stack space="8px">
      <Text align="right" size="12pt" weight="semibold" color="labelQuaternary">
        {i18n.t('approve_request.balance')}
      </Text>

      <Inline alignVertical="center" alignHorizontal="right">
        {balance?.symbol === 'ETH' && (
          <SFSymbol color="labelTertiary" symbol="eth" size={12} />
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
}: {
  onClick: () => void;
  label: string;
}) => {
  return (
    <Box
      as="button"
      id="accept-request-button"
      background="accent"
      width="full"
      onClick={onClick}
      padding="16px"
      borderRadius="round"
      boxShadow="24px accent"
    >
      <Text color="label" size="14pt" weight="bold">
        {label}
      </Text>
    </Box>
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
    <Box
      as="button"
      id="reject-request-button"
      onClick={onClick}
      width="full"
      padding="16px"
      borderRadius="round"
    >
      <Text color="labelSecondary" size="14pt" weight="bold">
        {label}
      </Text>
    </Box>
  );
};
