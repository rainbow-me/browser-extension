import React from 'react';
import { Address } from 'wagmi';

import { truncateAddress } from '~/core/utils/address';
import { Box, Button, Separator, Stack, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';

export const SaveContactPrompt = ({
  address,
}: //   onClose,
{
  address: Address;
  onClose?: () => void;
}) => {
  //   const [name, setName] = useState('');

  //   const handleClose = () => {
  //     onClose?.();
  //   };

  return (
    <Prompt show={!!address}>
      <Box alignItems="center" width="full" paddingTop="12px">
        <Stack alignHorizontal="center" space="24px">
          <Stack alignHorizontal="center" space="20px">
            <Text weight="bold" size="16pt" color="label">
              Save contact
            </Text>
            <Separator color="separatorTertiary" />
            <WalletAvatar address={address} size={44} />
            <Stack alignHorizontal="center" space="10px">
              <Input
                height="32px"
                variant="transparent"
                placeholder="Name"
                style={{ textAlign: 'center' }}
              />
              <Text weight="medium" color="labelTertiary" size="12pt">
                {truncateAddress(address)}
              </Text>
            </Stack>
            <Separator color="separatorTertiary" />
          </Stack>
        </Stack>
        <Stack alignHorizontal="center" space="8px">
          <Button
            width="full"
            color="accent"
            height="36px"
            variant="flat"
            borderRadius="8px"
          >
            Add to contacts
          </Button>
          <Button
            width="full"
            color="fillSecondary"
            height="36px"
            variant="raised"
            borderRadius="8px"
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Prompt>
  );
};
