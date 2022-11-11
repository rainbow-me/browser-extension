import React from 'react';
import { Address, useEnsAvatar, useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { truncateAddress } from '~/core/utils/truncateAddress';
import { Box, Inline, Stack, Text } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_ACCOUNT_2,
} from '~/entries/background/handlers/handleProviderRequest';

import { ChainBadge } from '../../../components/ChainBadge/ChainBadge';
import { SFSymbol } from '../../../components/SFSymbol/SFSymbol';
import { SwitchMenu } from '../../../components/SwitchMenu/SwitchMenu';
import {
  SwitchNetworkMenu,
  supportedChains,
} from '../../../components/SwitchMenu/SwitchNetworkMenu';
import { SelectedNetwork } from '../RequestAccounts';

const wallets: Address[] = [DEFAULT_ACCOUNT, DEFAULT_ACCOUNT_2];

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

export const BottomSwitchWallet = ({
  selectedWallet,
  setSelectedWallet,
}: {
  selectedWallet: Address;
  setSelectedWallet: (selected: Address) => void;
}) => {
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
  selectedNetwork: SelectedNetwork;
  displaySymbol: boolean;
}) => {
  return (
    <Box id={'switch-network-menu'}>
      <Inline alignHorizontal="right" alignVertical="center" space="4px">
        <ChainBadge chainId={selectedNetwork.chainId} size={'small'} />
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
  selectedNetwork: SelectedNetwork;
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
  selectedNetwork: SelectedNetwork;
  setSelectedNetwork: (network: SelectedNetwork) => void;
}) => {
  return (
    <Stack space="8px">
      <Text align="right" size="12pt" weight="semibold" color="labelQuaternary">
        {i18n.t('approve_request.network')}
      </Text>

      <SwitchNetworkMenu
        renderMenuTrigger={
          <BottomNetwork selectedNetwork={selectedNetwork} displaySymbol />
        }
        selectedValue={String(selectedNetwork.chainId)}
        onValueChange={(chainId) =>
          setSelectedNetwork(supportedChains[chainId])
        }
      />
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
