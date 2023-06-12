import React from 'react';
import { useAccount } from 'wagmi';

import { i18n } from '~/core/languages';
import { truncateAddress } from '~/core/utils/address';
import { Box, Button, Stack, Text } from '~/design-system';

import { AccountName } from '../../components/AccountName/AccountName';
import { triggerToast } from '../../components/Toast/Toast';
import { useSwitchWalletShortcuts } from '../../hooks/useSwitchWalletShortcuts';

import { QRCode } from './qrcode';

export const QRCodePage = () => {
  const { address } = useAccount();

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(address as string);
    triggerToast({
      title: i18n.t('wallet_header.copy_toast'),
      description: truncateAddress(address),
    });
  }, [address]);

  useSwitchWalletShortcuts();

  return (
    <Box
      display="flex"
      width="full"
      alignItems="center"
      justifyContent="center"
    >
      <Stack space="8px">
        <Box paddingHorizontal="20px" paddingTop="20px">
          <QRCode size={280} value={address as string} />
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center">
          <AccountName id="qr-code" chevron={false} />
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center">
          <Text color={'labelTertiary'} size="16pt" weight="bold">
            {truncateAddress(address)}
          </Text>
        </Box>
        <Box
          paddingTop="16px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Button
            color="surfaceSecondaryElevated"
            symbol="square.on.square"
            height="28px"
            variant="raised"
            onClick={handleCopy}
            tabIndex={0}
          >
            {i18n.t('qr_code.copy_address')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
