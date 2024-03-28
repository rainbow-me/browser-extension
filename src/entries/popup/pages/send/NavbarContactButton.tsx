import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useRef } from 'react';
import { type Address } from 'viem';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { getBlockExplorerHostForChain, isL2Chain } from '~/core/utils/chains';
import { getExplorerUrl, goToNewTab } from '~/core/utils/tabs';
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
import { Navbar } from '../../components/Navbar/Navbar';
import { ShortcutHint } from '../../components/ShortcutHint/ShortcutHint';
import { triggerToast } from '../../components/Toast/Toast';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useContact } from '../../hooks/useContacts';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { simulateClick } from '../../utils/simulateClick';

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
    <Lens
      borderRadius="round"
      opacity={enabled ? '1' : '0.2'}
      onKeyDown={(e) => {
        if (e.key === shortcuts.global.SELECT.key && enabled) {
          openSavePrompt();
        }
      }}
    >
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
            <WalletAvatar
              size={16}
              addressOrName={toAddress}
              emojiSize="11pt"
            />
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
    </Lens>
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
  const explorer = getBlockExplorerHostForChain(chainId || ChainId.mainnet);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(toAddress as string);
    triggerToast({
      title: i18n.t('contacts.contact_address_copied'),
      description: truncateAddress(toAddress),
    });
  }, [toAddress]);

  const viewOnEtherscan = useCallback(() => {
    explorer &&
      goToNewTab({
        url: getExplorerUrl(explorer, toAddress),
      });
  }, [explorer, toAddress]);

  const onValueChange = useCallback(
    (value: string) => {
      switch (value) {
        case 'copy':
          handleCopy();
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
    [handleCopy, onEdit, viewOnEtherscan],
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
            <TextOverflow
              weight="bold"
              size="14pt"
              color="label"
              align="center"
            >
              {contact?.display || truncateAddress(toAddress)}
            </TextOverflow>
          </Box>
          <DropdownMenuRadioGroup onValueChange={onValueChange}>
            <Stack space="4px">
              <DropdownMenuSeparator />
              <Box>
                <DropdownMenuRadioItem value={'copy'}>
                  <Box testId="navbar-contact-button-edit-copy" width="full">
                    <EditContactDropdownCopyAddressRow />
                  </Box>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={'edit'}>
                  <Box
                    testId="navbar-contact-button-edit-edit"
                    width="full"
                    paddingVertical="2px"
                  >
                    <EditContactDropdownEditContactRow />
                  </Box>
                </DropdownMenuRadioItem>

                {explorer && (
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
                        <Symbol
                          size={14}
                          symbol="arrow.up.forward.circle"
                          weight="semibold"
                          color="labelTertiary"
                        />
                      </Inline>
                    </Box>
                  </DropdownMenuRadioItem>
                )}
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

const EditContactDropdownCopyAddressRow = ({
  toAddress,
}: {
  toAddress?: Address;
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const { trackShortcut } = useKeyboardAnalytics();
  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.contact_menu.COPY_CONTACT_ADDRESS.key) {
        trackShortcut({
          key: shortcuts.contact_menu.COPY_CONTACT_ADDRESS.display,
          type: 'send.copyContactAddress',
        });
        simulateClick(rowRef?.current);
      }
    },
  });
  return (
    <Box ref={rowRef}>
      <Inline space="8px" alignVertical="center" alignHorizontal="justify">
        <Inline space="8px" alignVertical="center">
          <Box>
            <Inline alignVertical="center">
              <Symbol symbol="doc.on.doc.fill" weight="semibold" size={18} />
            </Inline>
          </Box>
          <Box>
            <Stack space="6px">
              <Text weight="semibold" size="14pt" color="label">
                {i18n.t('contacts.copy_address')}
              </Text>
              <Text weight="regular" size="11pt" color="labelTertiary">
                {truncateAddress(toAddress)}
              </Text>
            </Stack>
          </Box>
        </Inline>
        <ShortcutHint
          hint={shortcuts.contact_menu.COPY_CONTACT_ADDRESS.display}
        />
      </Inline>
    </Box>
  );
};

const EditContactDropdownEditContactRow = () => {
  const rowRef = useRef<HTMLDivElement>(null);
  const { trackShortcut } = useKeyboardAnalytics();
  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.contact_menu.EDIT_CONTACT.key) {
        trackShortcut({
          key: shortcuts.contact_menu.EDIT_CONTACT.display,
          type: 'send.editContact',
        });
        simulateClick(rowRef?.current);
      }
    },
  });
  return (
    <Box ref={rowRef}>
      <Inline space="8px" alignVertical="center" alignHorizontal="justify">
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
        <ShortcutHint hint={shortcuts.contact_menu.EDIT_CONTACT.display} />
      </Inline>
    </Box>
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
      <Navbar.SymbolButton symbol="ellipsis" tabIndex={0} variant="flat" />
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
