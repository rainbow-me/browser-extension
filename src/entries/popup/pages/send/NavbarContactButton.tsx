import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback } from 'react';
import { Address, useEnsName } from 'wagmi';

import { truncateAddress } from '~/core/utils/address';
import {
  Bleed,
  Box,
  Button,
  Inline,
  Stack,
  Symbol,
  Text,
} from '~/design-system';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
import { Navbar } from '../../components/Navbar/Navbar';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';

import { ContactAction } from './ContactPrompt';

const NavbarSaveContactButton = ({
  toAddress,
  onSaveAction,
}: {
  toAddress?: Address;
  onSaveAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
}) => {
  const openSavePrompt = useCallback(() => {
    onSaveAction({ show: true, action: 'save' });
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
  onEdit,
}: {
  children: React.ReactNode;
  toAddress?: Address;
  onEdit: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
}) => {
  const { data: ensName } = useEnsName({ address: toAddress });

  const viewOnEtherscan = useCallback(() => {
    chrome.tabs.create({
      url: `https://etherscan.io/address/${toAddress}`,
    });
  }, [toAddress]);

  const onValueChange = useCallback(
    (value: string) => {
      switch (value) {
        case 'copy':
          navigator.clipboard.writeText(toAddress as string);
          break;
        case 'edit':
          onEdit({ show: true, action: 'edit' });
          break;
        case 'view':
          viewOnEtherscan();
          break;
        case 'delete':
          onEdit({ show: true, action: 'delete' });

          break;
      }
    },
    [onEdit, toAddress, viewOnEtherscan],
  );

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
          <DropdownMenuRadioGroup onValueChange={onValueChange}>
            <Stack space="4px">
              <Box>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value={'copy'}>
                  <Box width="full" marginVertical="-1px">
                    <Inline space="8px" alignVertical="center">
                      <Box>
                        <Inline alignVertical="center">
                          <Symbol
                            symbol="doc.on.doc.fill"
                            weight="semibold"
                            size={18}
                          />
                        </Inline>
                      </Box>

                      <Box>
                        <Stack space="6px">
                          <Text weight="semibold" size="14pt" color="label">
                            Copy address
                          </Text>
                          <Text
                            weight="regular"
                            size="11pt"
                            color="labelTertiary"
                          >
                            {truncateAddress(toAddress)}
                          </Text>
                        </Stack>
                      </Box>
                    </Inline>
                  </Box>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={'edit'}>
                  <Box width="full" paddingVertical="2px">
                    <Inline space="8px" alignVertical="center">
                      <Inline alignVertical="center">
                        <Symbol
                          symbol="person.crop.circle.fill"
                          weight="semibold"
                          size={18}
                        />
                      </Inline>
                      <Text weight="semibold" size="14pt" color="label">
                        Edit contact
                      </Text>
                    </Inline>
                  </Box>
                </DropdownMenuRadioItem>

                <DropdownMenuRadioItem value={'view'}>
                  <Box width="full" paddingVertical="2px">
                    <Inline alignVertical="center" alignHorizontal="justify">
                      <Inline alignVertical="center" space="8px">
                        <Inline alignVertical="center">
                          <Symbol
                            size={18}
                            symbol="binoculars.fill"
                            weight="semibold"
                          />
                        </Inline>
                        <Text size="14pt" weight="semibold">
                          {'View on Etherscan'}
                        </Text>
                      </Inline>
                      <Bleed vertical="8px">
                        <Symbol
                          size={14}
                          symbol="arrow.up.forward.circle"
                          weight="semibold"
                          color="labelTertiary"
                        />
                      </Bleed>
                    </Inline>
                  </Box>
                </DropdownMenuRadioItem>
              </Box>
              <Stack space="4px">
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value={'delete'}>
                  <Box>
                    <Inline space="8px" alignVertical="center">
                      <Symbol
                        symbol="trash"
                        weight="semibold"
                        size={18}
                        color="red"
                      />
                      <Text weight="semibold" size="14pt" color="red">
                        Delete contact
                      </Text>
                    </Inline>
                  </Box>
                </DropdownMenuRadioItem>
              </Stack>
            </Stack>
          </DropdownMenuRadioGroup>
        </Stack>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NavbarEditContactButton = ({
  toAddress,
  onSaveAction,
}: {
  toAddress?: Address;
  onSaveAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
}) => {
  return (
    <EditContactDropdown toAddress={toAddress} onEdit={onSaveAction}>
      <Navbar.SymbolButton symbol="ellipsis" variant="flat" />
    </EditContactDropdown>
  );
};

export const NavbarContactButton = ({
  toAddress,
  onSaveAction,
  action,
}: {
  toAddress?: Address;
  onSaveAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
  action: ContactAction;
}) => {
  return (
    <AnimatePresence initial={false} mode="wait">
      {action === 'save' && (
        <Box
          as={motion.div}
          key="save"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <NavbarSaveContactButton
            toAddress={toAddress}
            onSaveAction={onSaveAction}
          />
        </Box>
      )}
      {action === 'edit' && (
        <Box
          as={motion.div}
          key="edit"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <NavbarEditContactButton
            toAddress={toAddress}
            onSaveAction={onSaveAction}
          />
        </Box>
      )}
    </AnimatePresence>
  );
};
