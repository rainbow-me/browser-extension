import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { getBlockExplorerHostForChain, isL2Chain } from '~/core/utils/chains';
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
import { useContact } from '../../hooks/useContacts';

import { ContactAction } from './ContactPrompt';

const NavbarSaveContactButton = ({
  toAddress,
  onSaveAction,
  enabled,
}: {
  enabled: boolean;
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
    <Box opacity={enabled ? '1' : '0.2'}>
      <Button
        color="surfaceSecondaryElevated"
        height="28px"
        variant="flat"
        onClick={enabled ? openSavePrompt : () => null}
        testId={`navbar-contact-button-save`}
        paddingLeft="8px"
        paddingRight="12px"
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
                color={'labelSecondary'}
              />
            </Box>
          )}

          <Text weight="semibold" size="14pt" color={'labelSecondary'}>
            {i18n.t('contacts.save')}
          </Text>
        </Inline>
      </Button>
    </Box>
  );
};

const EditContactDropdown = ({
  children,
  chainId,
  toAddress,
  onEdit,
}: {
  children: React.ReactNode;
  chainId?: ChainId;
  toAddress?: Address;
  onEdit: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
}) => {
  const contact = useContact({ address: toAddress });

  const viewOnEtherscan = useCallback(() => {
    const explorer = getBlockExplorerHostForChain(chainId || ChainId.mainnet);
    chrome.tabs.create({
      url: `https://${explorer}/address/${toAddress}`,
    });
  }, [chainId, toAddress]);

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
        <Box testId={'navbar-contact-button-edit'} position="relative">
          {children}
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent marginRight="12px">
        <Stack space="4px">
          <Box paddingTop="8px" paddingBottom="12px">
            <Text weight="bold" size="14pt" color="label" align="center">
              {contact?.display || truncateAddress(toAddress)}
            </Text>
          </Box>
          <DropdownMenuRadioGroup onValueChange={onValueChange}>
            <Stack space="4px">
              <DropdownMenuSeparator />
              <Box>
                <DropdownMenuRadioItem value={'copy'}>
                  <Box
                    testId="navbar-contact-button-edit-copy"
                    width="full"
                    // marginVertical="-1px"
                  >
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
                            {i18n.t('contacts.copy_address')}
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
                  <Box
                    testId="navbar-contact-button-edit-edit"
                    width="full"
                    paddingVertical="2px"
                  >
                    <Inline space="8px" alignVertical="center">
                      <Inline alignVertical="center">
                        <Symbol
                          symbol="person.crop.circle.fill"
                          weight="semibold"
                          size={18}
                        />
                      </Inline>
                      <Text weight="semibold" size="14pt" color="label">
                        {i18n.t('contacts.edit_contact')}
                      </Text>
                    </Inline>
                  </Box>
                </DropdownMenuRadioItem>

                <DropdownMenuRadioItem value={'view'}>
                  <Box
                    testId="navbar-contact-button-edit-view"
                    width="full"
                    paddingVertical="2px"
                  >
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
                          {i18n.t(
                            `contacts.${
                              chainId && isL2Chain(chainId)
                                ? 'view_on_explorer'
                                : 'view_on_etherscan'
                            }`,
                          )}
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
                  <Box testId="navbar-contact-button-edit-delete">
                    <Inline space="8px" alignVertical="center">
                      <Symbol
                        symbol="trash"
                        weight="semibold"
                        size={18}
                        color="red"
                      />
                      <Text weight="semibold" size="14pt" color="red">
                        {i18n.t('contacts.delete_contact')}
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
  chainId,
  toAddress,
  onSaveAction,
}: {
  chainId?: ChainId;
  toAddress?: Address;
  onSaveAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
}) => {
  return (
    <EditContactDropdown
      chainId={chainId}
      toAddress={toAddress}
      onEdit={onSaveAction}
    >
      <Navbar.SymbolButton symbol="ellipsis" variant="flat" />
    </EditContactDropdown>
  );
};

export const NavbarContactButton = ({
  chainId,
  toAddress,
  onSaveAction,
  action,
  enabled,
}: {
  chainId?: ChainId;
  toAddress?: Address;
  onSaveAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
  action: ContactAction;
  enabled: boolean;
}) => {
  return (
    <AnimatePresence initial={false} mode="wait">
      {action === 'save' && (
        <Box
          as={motion.div}
          key="save"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'spring', stiffness: 1111, damping: 50, mass: 1 }}
          exit={{ opacity: 0 }}
        >
          <NavbarSaveContactButton
            toAddress={toAddress}
            onSaveAction={onSaveAction}
            enabled={enabled}
          />
        </Box>
      )}
      {action === 'edit' && (
        <Box
          as={motion.div}
          key="edit"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'spring', stiffness: 1111, damping: 50, mass: 1 }}
          exit={{ opacity: 0 }}
        >
          <NavbarEditContactButton
            toAddress={toAddress}
            onSaveAction={onSaveAction}
            chainId={chainId}
          />
        </Box>
      )}
    </AnimatePresence>
  );
};
