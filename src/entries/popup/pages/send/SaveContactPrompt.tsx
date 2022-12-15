import React, { ChangeEvent, useCallback, useState } from 'react';
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
  const [, setName] = useState('');

  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  //   const handleClose = () => {
  //     onClose?.();
  //   };

  return (
    <Prompt show={!!address}>
      <Box alignItems="center" width="full" paddingTop="12px">
        <Stack space="20px">
          <Stack alignHorizontal="center" space="24px">
            <Stack alignHorizontal="center" space="20px">
              <Text weight="bold" size="16pt" color="label">
                Save contact
              </Text>
              <Box style={{ width: 42 }}>
                <Separator color="separatorTertiary" strokeWeight="1px" />
              </Box>
              <WalletAvatar address={address} size={44} />
              <Stack alignHorizontal="center" space="10px">
                <Input
                  onChange={handleNameChange}
                  height="44px"
                  variant="transparent"
                  placeholder="Name"
                  style={{ textAlign: 'center' }}
                />
                <Text weight="medium" color="labelTertiary" size="12pt">
                  {truncateAddress(address)}
                </Text>
              </Stack>
              <Box style={{ width: 42 }}>
                <Separator color="separatorTertiary" strokeWeight="1px" />
              </Box>
            </Stack>
          </Stack>
          <Stack alignHorizontal="center" space="8px">
            <Button
              width="full"
              color="accent"
              height="36px"
              variant="flat"
              borderRadius="9px"
            >
              Add to contacts
            </Button>
            <Button
              width="full"
              color="fillSecondary"
              height="36px"
              variant="raised"
              borderRadius="9px"
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Prompt>
  );
};
