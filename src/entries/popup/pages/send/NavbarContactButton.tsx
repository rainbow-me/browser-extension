import React, { useCallback } from 'react';
import { Address } from 'wagmi';

import { Box, Button, Inline, Symbol, Text } from '~/design-system';

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

const NavbarEditContactButton = ({
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
  return mode ? (
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
