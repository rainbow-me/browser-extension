import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { useContactsStore } from '~/core/state/contacts';
import { truncateAddress } from '~/core/utils/address';
import { Box, Button, Separator, Stack, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';

export type ContactAction = 'save' | 'edit' | 'delete';

const SaveOrEditContact = ({
  action,
  address,
  onSaveContactAction,
}: {
  action: 'save' | 'edit';
  address: Address;
  onSaveContactAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
}) => {
  const { saveContact, getContact } = useContactsStore();
  const contact = useMemo(() => getContact({ address }), [address, getContact]);
  const [name, setName] = useState(contact?.name);

  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const onSave = useCallback(() => {
    saveContact({ contact: { address, name } });
    onSaveContactAction({ show: false, action: 'save' });
  }, [address, name, onSaveContactAction, saveContact]);

  const onCancel = useCallback(() => {
    onSaveContactAction({ show: false, action: 'save' });
  }, [onSaveContactAction]);

  return (
    <Box alignItems="center" width="full" paddingTop="12px">
      <Stack space="20px">
        <Stack alignHorizontal="center" space="24px">
          <Stack alignHorizontal="center" space="20px">
            <Text weight="bold" size="16pt" color="label">
              {`${action === 'save' ? 'Save' : 'Edit'} contact`}
            </Text>
            <Box style={{ width: 42 }}>
              <Separator color="separatorTertiary" strokeWeight="1px" />
            </Box>
            <WalletAvatar address={address} size={44} />
            <Stack alignHorizontal="center" space="10px">
              <Box marginVertical="-12px">
                <Input
                  value={name}
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
            onClick={onSave}
          >
            Add to contacts
          </Button>
          <Button
            width="full"
            color="fillSecondary"
            height="36px"
            variant="raised"
            borderRadius="9px"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

const DeleteContact = ({
  address,
  onSaveContactAction,
}: {
  address: Address;
  onSaveContactAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
}) => {
  const { deleteContact } = useContactsStore();

  const onRemove = useCallback(() => {
    deleteContact({ address });
    onSaveContactAction({ show: false, action: 'delete' });
  }, [address, deleteContact, onSaveContactAction]);

  const onCancel = useCallback(() => {
    onSaveContactAction({ show: false, action: 'delete' });
  }, [onSaveContactAction]);

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
            onClick={onRemove}
          >
            Remove contact
          </Button>
          <Button
            width="full"
            color="fillSecondary"
            height="36px"
            variant="raised"
            borderRadius="9px"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export const ContactPrompt = ({
  show,
  address,
  action,
  onSaveContactAction,
}: {
  show: boolean;
  address: Address;
  action: ContactAction;
  onSaveContactAction: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      action: ContactAction;
    }>
  >;
}) => {
  return (
    <Prompt show={show}>
      {action === 'save' || action === 'edit' ? (
        <SaveOrEditContact
          address={address}
          action={action}
          onSaveContactAction={onSaveContactAction}
        />
      ) : (
        <DeleteContact
          address={address}
          onSaveContactAction={onSaveContactAction}
        />
      )}
    </Prompt>
  );
};
