import { Address } from '@wagmi/core';
import { KeyboardEvent, useState } from 'react';

import { i18n } from '~/core/languages';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { truncateAddress } from '~/core/utils/address';
import { Box, Button, Inset, Separator, Stack, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';

const RenameWallet = ({
  onClose,
  account,
}: {
  onClose: () => void;
  account: Address;
}) => {
  const { walletNames, saveWalletName } = useWalletNamesStore();
  const [newName, setNewName] = useState(walletNames[account]);

  const isValid = newName?.trim().length > 0;

  const saveAndClose = () => {
    saveWalletName({ address: account, name: newName });
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent) => e.key === 'Enter' && saveAndClose();

  return (
    <Box padding="12px" paddingTop="24px">
      <Stack space="20px">
        <Text size="16pt" weight="bold" align="center">
          {i18n.t('rename_wallet_prompt.rename_wallet')}
        </Text>

        <Inset horizontal="104px">
          <Separator color="separatorTertiary" />
        </Inset>

        <Stack alignHorizontal="center">
          <WalletAvatar addressOrName={account} size={44} emojiSize="20pt" />
          <Input
            testId={'wallet-name-input'}
            placeholder={i18n.t(
              'settings.privacy_and_security.wallets_and_keys.new_wallet.input_placeholder',
            )}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            height="44px"
            variant="transparent"
            textAlign="center"
            autoFocus
            onKeyDown={onKeyDown}
            tabIndex={1}
          />
          <Text size="12pt" weight="medium" color="labelTertiary">
            {truncateAddress(account)}
          </Text>
        </Stack>
      </Stack>

      <Inset horizontal="104px" vertical="24px">
        <Separator color="separatorTertiary" />
      </Inset>

      <Box display="flex" gap="8px" alignItems="center">
        <Button
          variant="flat"
          height="36px"
          color="fillSecondary"
          onClick={onClose}
          width="full"
          borderRadius="9px"
          tabIndex={3}
        >
          {i18n.t('common_actions.cancel')}
        </Button>
        <Button
          testId={'rename-wallet-done'}
          color={isValid ? 'accent' : 'labelQuaternary'}
          variant={isValid ? 'flat' : 'disabled'}
          height="36px"
          onClick={saveAndClose}
          disabled={!isValid}
          width="full"
          borderRadius="9px"
          tabIndex={2}
        >
          {i18n.t('rename_wallet_prompt.done')}
        </Button>
      </Box>
    </Box>
  );
};

export const RenameWalletPrompt = ({
  onClose,
  account,
}: {
  onClose: () => void;
  account?: Address;
}) => (
  <Prompt show={!!account} handleClose={onClose}>
    {account && <RenameWallet account={account} onClose={onClose} />}
  </Prompt>
);
