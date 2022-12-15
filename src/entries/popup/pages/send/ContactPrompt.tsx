import React, { ChangeEvent, useCallback, useState } from 'react';
import { Address } from 'wagmi';

import { truncateAddress } from '~/core/utils/address';
import { Box, Button, Separator, Stack, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';

const SaveContact = ({ address }: { address: Address }) => {
  const [, setName] = useState('');

  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  return (
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
              <Box marginVertical="-12px">
                <Input
                  onChange={handleNameChange}
                  height="44px"
                  variant="transparent"
                  placeholder="Name"
                  style={{ textAlign: 'center' }}
                />
              </Box>

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
  );
};

const RemoveContact = () => {
  return (
    <Box alignItems="center" width="full" paddingTop="12px">
      <Stack space="24px">
        <Stack alignHorizontal="center" space="20px">
          <Text weight="bold" size="16pt" color="label">
            Remove contact?
          </Text>
          <Box width="full">
            <Text
              weight="medium"
              color="labelTertiary"
              size="12pt"
              align="center"
            >
              Are you sure you want to remove “0xhab.eth” from your contacts?
            </Text>
          </Box>

          <Box style={{ width: 42 }}>
            <Separator color="separatorTertiary" strokeWeight="1px" />
          </Box>
        </Stack>

        <Stack alignHorizontal="center" space="8px">
          <Button
            width="full"
            color="red"
            height="36px"
            variant="flat"
            borderRadius="9px"
          >
            Remove contact
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
  );
};

export const ContactPrompt = ({
  address,
  mode,
}: //   onClose,
{
  address: Address;
  onClose?: () => void;
  mode: 'save' | 'remove';
}) => {
  //   const handleClose = () => {
  //     onClose?.();
  //   };

  return (
    <Prompt show={!!address}>
      {mode === 'save' ? (
        <SaveContact address={address} />
      ) : (
        <RemoveContact address={address} />
      )}
    </Prompt>
  );
};
