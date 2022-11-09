import React, { useCallback, useState } from 'react';
import { Address, chain, useEnsAvatar, useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { initializeMessenger } from '~/core/messengers';
import { useCurrentAddressStore } from '~/core/state';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { truncateAddress } from '~/core/utils/truncateAddress';
import {
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_ACCOUNT_2,
} from '~/entries/background/handlers/handleProviderRequest';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { SFSymbol } from '~/entries/popup/components/SFSymbol/SFSymbol';
import { SwitchMenu } from '~/entries/popup/components/SwitchMenu/SwitchMenu';
import {
  SwitchNetworkMenu,
  supportedChains,
} from '~/entries/popup/components/SwitchMenu/SwitchNetworkMenu';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';

interface ApproveRequestProps {
  approveRequest: (payload: { address: Address; chainId: number }) => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

interface SelectedNetwork {
  network: string;
  chainId: number;
  name: string;
}

// TODO hook up real wallets
const wallets: Address[] = [DEFAULT_ACCOUNT, DEFAULT_ACCOUNT_2];

const EnsAvatar = ({ address }: { address: Address }) => {
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

const EnsName = ({
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

const messenger = initializeMessenger({ connect: 'inpage' });

export function ApproveRequestAccounts({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) {
  const { currentAddress } = useCurrentAddressStore();
  const { appHostName, appLogo, appName } = useAppMetadata({
    meta: request?.meta,
  });

  const [selectedNetwork, setSelectedNetwork] = useState<SelectedNetwork>(
    supportedChains[chain.mainnet.id],
  );
  const [selectedWallet, setSelectedWallet] = useState<Address>(currentAddress);

  const onApproveRequest = useCallback(() => {
    approveRequest({
      address: selectedWallet,
      chainId: selectedNetwork.chainId,
    });
    messenger.send(`connect:${appHostName}`, {});
  }, [appHostName, approveRequest, selectedNetwork.chainId, selectedWallet]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <Box
          style={{
            paddingLeft: 50,
            paddingRight: 50,
            paddingTop: 64,
            paddingBottom: 42,
          }}
          background="surfacePrimaryElevatedSecondary"
        >
          <Stack space="32px">
            <Inline alignHorizontal="center">
              <Box
                style={{
                  width: 60,
                  height: 60,
                  overflow: 'hidden',
                }}
                borderRadius="18px"
                alignItems="center"
              >
                {appLogo ? (
                  <img src={appLogo} width="100%" height="100%" />
                ) : null}
              </Box>
            </Inline>

            <Stack space="32px">
              <Text
                size="20pt"
                weight="semibold"
                color="labelSecondary"
                align="center"
              >
                {appName} {i18n.t('approve_request_accounts.wallet_info_title')}
              </Text>

              <Text align="center" color="accent" size="20pt" weight="bold">
                {appHostName}
              </Text>
            </Stack>
            <Inline alignHorizontal="center">
              <Box style={{ width: '186px' }}>
                <Separator color="separatorTertiary" />
              </Box>
            </Inline>

            <Text
              align="center"
              color="labelTertiary"
              size="14pt"
              weight="regular"
            >
              {i18n.t('approve_request_accounts.wallet_info_description', {
                appName,
              })}
            </Text>
          </Stack>
        </Box>
        {/* <Separator color="separatorTertiary" /> */}
      </Row>
      <Row height="content">
        <Box padding="20px">
          <Stack space="24px">
            <Columns alignVertical="center" alignHorizontal="justify">
              <Column>
                <Stack space="8px">
                  <Text size="12pt" weight="semibold" color="labelQuaternary">
                    {i18n.t('approve_request_accounts.wallet')}
                  </Text>
                  <SwitchMenu
                    title={i18n.t('approve_request_accounts.switch_wallets')}
                    renderMenuTrigger={
                      <Box id={'switch-wallet-menu'}>
                        <Inline alignVertical="center" space="4px">
                          <EnsAvatar address={selectedWallet} />
                          <EnsName
                            color="labelSecondary"
                            address={selectedWallet}
                          />

                          <SFSymbol
                            color="labelSecondary"
                            size={14}
                            symbol="chevronDownCircle"
                          />
                        </Inline>
                      </Box>
                    }
                    menuItemIndicator={
                      <SFSymbol symbol="checkMark" size={11} />
                    }
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
                    onValueChange={(value) =>
                      setSelectedWallet(value as Address)
                    }
                  />
                </Stack>
              </Column>
              <Column>
                <Stack space="8px">
                  <Text
                    align="right"
                    size="12pt"
                    weight="semibold"
                    color="labelQuaternary"
                  >
                    {i18n.t('approve_request_accounts.network')}
                  </Text>

                  <SwitchNetworkMenu
                    title={i18n.t('approve_request_accounts.switch_networks')}
                    renderMenuTrigger={
                      <Box id={'switch-network-menu'}>
                        <Inline
                          alignHorizontal="right"
                          alignVertical="center"
                          space="4px"
                        >
                          <ChainBadge
                            chainId={selectedNetwork.chainId}
                            size={'small'}
                          />
                          <Text
                            align="right"
                            size="14pt"
                            weight="semibold"
                            color="labelSecondary"
                          >
                            {selectedNetwork.name}
                          </Text>
                          <SFSymbol
                            color="labelSecondary"
                            size={14}
                            symbol="chevronDownCircle"
                          />
                        </Inline>
                      </Box>
                    }
                    selectedValue={String(selectedNetwork.chainId)}
                    onValueChange={(chainId) =>
                      setSelectedNetwork(supportedChains[chainId])
                    }
                  />
                </Stack>
              </Column>
            </Columns>
            <Rows space="8px">
              <Row>
                <Box
                  as="button"
                  id="accept-button"
                  background="accent"
                  width="full"
                  onClick={onApproveRequest}
                  padding="16px"
                  borderRadius="round"
                  boxShadow="24px accent"
                >
                  <Text color="label" size="14pt" weight="bold">
                    {i18n.t('approve_request_accounts.connect', { appName })}
                  </Text>
                </Box>
              </Row>
              <Row>
                <Box
                  as="button"
                  id="reject-button"
                  onClick={rejectRequest}
                  width="full"
                  padding="16px"
                  borderRadius="round"
                >
                  <Text color="labelSecondary" size="14pt" weight="bold">
                    {i18n.t('approve_request_accounts.cancel')}
                  </Text>
                </Box>
              </Row>
            </Rows>
          </Stack>
        </Box>
      </Row>
    </Rows>
  );
}
