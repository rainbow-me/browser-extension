import React from 'react';
import { useEnsAvatar, useEnsName } from 'wagmi';

import { useCurrentAddressStore } from '~/core/state';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { getConnectedAppIcon } from '~/core/utils/connectedApps';
import { truncateAddress } from '~/core/utils/truncateAddress';
import {
  Box,
  Column,
  Columns,
  Inline,
  Separator,
  Stack,
  Text,
} from '~/design-system';

import { SFSymbol } from '../../components/SFSymbol/SFSymbol';

interface ApproveRequestProps {
  approveRequest: () => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

export function ApproveRequestAccounts({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) {
  const { currentAddress } = useCurrentAddressStore();

  const { data: ensAvatar } = useEnsAvatar({ addressOrName: currentAddress });
  const { data: ensName } = useEnsName({ address: currentAddress });

  const meta = request?.meta;

  console.log('METAAAA', meta);
  const host = new URL(meta?.sender.url || '').host;
  const title = meta?.sender?.tab?.title;
  const image = getConnectedAppIcon(host);

  return (
    <>
      <Box paddingHorizontal="52px" paddingTop="60px" paddingBottom="44px">
        <Stack space="32px">
          <Box alignItems="center">
            <Inline alignHorizontal="center">
              <img src={image} width="60px" height="60px" />
            </Inline>
          </Box>

          <Stack space="24px">
            <Text align="center" color="label" size="20pt" weight="semibold">
              {title} wants to connect to your wallet
            </Text>

            <Text align="center" color="accent" size="14pt" weight="bold">
              {host}
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
            Allow {title} to view your wallets address, balance, activity and
            request approval for transactions.
          </Text>
        </Stack>
      </Box>

      <Box background="surfacePrimary" padding="20px">
        <Columns alignVertical="center" alignHorizontal="justify">
          <Column width="1/3">
            <Stack space="8px">
              <Text size="12pt" weight="semibold" color="labelQuaternary">
                Wallet
              </Text>
              <Inline alignVertical="center" space="4px">
                <Box
                  background="fill"
                  borderRadius="30px"
                  style={{
                    width: '16px',
                    height: '16px',
                    overflow: 'hidden',
                  }}
                >
                  {ensAvatar && (
                    /* TODO: Convert to <Image> & Imgix/Cloudinary */
                    <img
                      src={ensAvatar}
                      width="100%"
                      height="100%"
                      loading="lazy"
                    />
                  )}
                </Box>
                <Text size="14pt" weight="semibold" color="labelSecondary">
                  {ensName || truncateAddress(currentAddress)}
                </Text>
                <SFSymbol
                  color="labelTertiary"
                  size={14}
                  symbol="chevronDownCircle"
                />
              </Inline>
            </Stack>
          </Column>
          <Column width="2/3">
            <Stack space="8px">
              <Text
                align="right"
                size="12pt"
                weight="semibold"
                color="labelQuaternary"
              >
                Wallet
              </Text>
              <Text
                align="right"
                size="14pt"
                weight="semibold"
                color="labelSecondary"
              >
                Network
              </Text>
            </Stack>
          </Column>
        </Columns>
      </Box>
      <Box>
        <Box
          as="button"
          id="accept-button"
          background="surfaceSecondary"
          onClick={approveRequest}
          padding="16px"
          style={{ borderRadius: 999 }}
        >
          <Text color="labelSecondary" size="14pt" weight="bold">
            ACCEPT
          </Text>
        </Box>
        <Box
          as="button"
          id="reject-button"
          background="surfaceSecondary"
          onClick={rejectRequest}
          padding="16px"
          style={{ borderRadius: 999 }}
        >
          <Text color="labelSecondary" size="14pt" weight="bold">
            REJECT
          </Text>
        </Box>
      </Box>
    </>
  );
}
