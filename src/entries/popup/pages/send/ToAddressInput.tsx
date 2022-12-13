import { isAddress } from 'ethers/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import React, { InputHTMLAttributes, useMemo, useRef } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { truncateAddress } from '~/core/utils/address';
import { Box, Column, Columns, Stack, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';

import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';

import { InputActionButon } from './InputActionButton';

export const ToAddressInput = ({
  toAddressOrName,
  toEnsName,
  toAddress,
  handleToAddressChange,
  clearToAddress,
}: {
  toAddressOrName: string;
  toEnsName?: string;
  toAddress: Address;
  handleToAddressChange: InputHTMLAttributes<HTMLInputElement>['onChange'];
  clearToAddress: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const inputVisible = useMemo(
    () => (!toAddressOrName || !toEnsName) && !isAddress(toAddressOrName),
    [toAddressOrName, toEnsName],
  );

  return (
    <Box
      background="surfaceSecondaryElevated"
      paddingVertical="20px"
      paddingHorizontal="16px"
      borderRadius="24px"
      width="full"
    >
      <Columns alignVertical="center" alignHorizontal="justify" space="8px">
        <Column width="content">
          <Box background="fillSecondary" borderRadius="18px">
            <WalletAvatar address={toAddress} size={36} emojiSize="20pt" />
          </Box>
        </Column>

        <Column>
          <AnimatePresence initial={false} mode="wait">
            {inputVisible && (
              <Box
                as={motion.div}
                key="input"
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
              >
                <Input
                  value={toAddressOrName}
                  placeholder={i18n.t('send.input_to_address_placeholder')}
                  onChange={handleToAddressChange}
                  height="32px"
                  variant="transparent"
                  style={{ paddingLeft: 0, paddingRight: 0 }}
                  innerRef={inputRef}
                />
              </Box>
            )}
            {!inputVisible && (
              <Box
                as={motion.div}
                key="wallet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Stack space="8px">
                  <Text weight="semibold" size="14pt" color="label">
                    {toEnsName || truncateAddress(toAddress)}
                  </Text>
                  {toEnsName && (
                    <Text weight="semibold" size="12pt" color="labelTertiary">
                      {truncateAddress(toAddress)}
                    </Text>
                  )}
                </Stack>
              </Box>
            )}
          </AnimatePresence>
        </Column>

        <Column width="content">
          <InputActionButon showClose={!!toAddress} onClose={clearToAddress} />
        </Column>
      </Columns>
    </Box>
  );
};
