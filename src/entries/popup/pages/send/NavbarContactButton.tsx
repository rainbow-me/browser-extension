import React, { useCallback } from 'react';
import { Address, useEnsName } from 'wagmi';

import { truncateAddress } from '~/core/utils/address';
import {
  Bleed,
  Box,
  Button,
  Inline,
  Inset,
  Stack,
  Symbol,
  Text,
} from '~/design-system';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
import { Navbar } from '../../components/Navbar/Navbar';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';

const NavbarSaveContactButton = ({
  toAddress,
  onSaveAction,
}: {
  toAddress?: Address;
  onSaveAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      mode: 'save' | 'remove';
    }>
  >;
}) => {
  const openSavePrompt = useCallback(() => {
    onSaveAction({ show: true, mode: 'save' });
  }, [onSaveAction]);

  return (
    <Button
      color="surfaceSecondaryElevated"
      height="28px"
      variant="flat"
      onClick={openSavePrompt}
    >
      <Inline space="4px" alignVertical="center">
        {toAddress ? (
          <WalletAvatar size={16} address={toAddress} emojiSize="11pt" />
        ) : (
          <Box position="relative" paddingRight="2px">
            <Symbol
              weight="semibold"
              symbol="person.crop.circle.fill.badge.plus"
              size={16}
              color="labelSecondary"
            />
          </Box>
        )}

        <Text weight="semibold" size="14pt" color="labelSecondary">
          Save
        </Text>
      </Inline>
    </Button>
  );
};

const EditContactDropdown = ({
  children,
  toAddress,
}: {
  children: React.ReactNode;
  toAddress?: Address;
}) => {
  const { data: ensName } = useEnsName({ address: toAddress });

  const viewOnEtherscan = useCallback(() => {
    chrome.tabs.create({
      url: `https://etherscan.io/address/${toAddress}`,
    });
  }, [toAddress]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Box position="relative" id="home-page-header-right">
          {children}
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent marginRight="12px">
        <Stack space="4px">
          <Box paddingTop="8px" paddingBottom="12px">
            <Text weight="bold" size="14pt" color="label" align="center">
              {ensName ?? truncateAddress(toAddress)}
            </Text>
          </Box>
          <Stack space="4px">
            <Stack space="4px">
              <DropdownMenuSeparator />
              <Bleed horizontal="8px">
                <Box width="full" padding="8px">
                  <Inline space="8px" alignVertical="center">
                    <Symbol
                      symbol="doc.on.doc.fill"
                      weight="semibold"
                      size={14}
                    />
                    <Stack space="6px">
                      <Text weight="semibold" size="14pt" color="label">
                        Copy address
                      </Text>
                      <Text weight="regular" size="11pt" color="labelTertiary">
                        {truncateAddress(toAddress)}
                      </Text>
                    </Stack>
                  </Inline>
                </Box>
                <Box width="full" padding="8px">
                  <Inline space="8px" alignVertical="center">
                    <Symbol
                      symbol="person.crop.circle.fill"
                      weight="semibold"
                      size={14}
                    />
                    <Text weight="semibold" size="14pt" color="label">
                      Edit contact
                    </Text>
                  </Inline>
                </Box>
                <Box
                  width="full"
                  as="button"
                  padding="8px"
                  onClick={viewOnEtherscan}
                >
                  <Inset vertical="8px">
                    <Inline alignVertical="center" alignHorizontal="justify">
                      <Inline alignVertical="center" space="8px">
                        <Symbol
                          size={12}
                          symbol="binoculars.fill"
                          weight="semibold"
                        />
                        <Text size="14pt" weight="semibold">
                          {'View on Etherscan'}
                        </Text>
                      </Inline>
                      <Symbol
                        size={12}
                        symbol="arrow.up.forward.circle"
                        weight="semibold"
                        color="labelTertiary"
                      />
                    </Inline>
                  </Inset>
                </Box>
              </Bleed>
            </Stack>
            <Stack space="4px">
              <DropdownMenuSeparator />
              <Bleed horizontal="8px">
                <Box padding="8px">
                  <Inline space="8px" alignVertical="center">
                    <Symbol
                      symbol="trash"
                      weight="semibold"
                      size={14}
                      color="red"
                    />
                    <Text weight="semibold" size="14pt" color="red">
                      Delete contact
                    </Text>
                  </Inline>
                </Box>
              </Bleed>
            </Stack>
          </Stack>
        </Stack>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NavbarEditContactButton = ({
  toAddress,
}: //   onSaveAction,
{
  toAddress?: Address;
  onSaveAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      mode: 'save' | 'remove';
    }>
  >;
}) => {
  //   const openSavePrompt = useCallback(() => {
  //     onSaveAction({ show: true, mode: 'save' });
  //   }, [onSaveAction]);

  return (
    <EditContactDropdown toAddress={toAddress}>
      <Navbar.SymbolButton symbol="ellipsis" variant="flat" />
    </EditContactDropdown>
  );
};

export const NavbarContactButton = ({
  toAddress,
  onSaveAction,
  mode,
}: {
  toAddress?: Address;
  onSaveAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      mode: 'save' | 'remove';
    }>
  >;
  mode: 'save' | 'edit';
}) => {
  return mode === 'save' ? (
    <NavbarSaveContactButton
      toAddress={toAddress}
      onSaveAction={onSaveAction}
    />
  ) : (
    <NavbarEditContactButton
      toAddress={toAddress}
      onSaveAction={onSaveAction}
    />
  );
};
