import React, { ChangeEvent, useCallback, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useENSAvatar } from '~/core/resources/metadata/ensAvatar';
import { useContactsStore } from '~/core/state/contacts';
import { truncateAddress } from '~/core/utils/address';
import {
  AccentColorProvider,
  Box,
  Button,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Prompt } from '~/design-system/components/Prompt/Prompt';
import { globalColors } from '~/design-system/styles/designTokens';

import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useContact } from '../../hooks/useContacts';
import { useDominantColor } from '../../hooks/useDominantColor';

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
  const saveContact = useContactsStore.use.saveContact();
  const contact = useContact({ address });
  const [name, setName] = useState(contact?.display || '');

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
              {i18n.t(
                `contacts.${
                  action === 'save' ? 'save_contact' : 'edit_contact'
                }`,
              )}
            </Text>
            <Box style={{ width: 42 }}>
              <Separator color="separatorTertiary" strokeWeight="1px" />
            </Box>
            <WalletAvatar addressOrName={address} size={44} />
            <Stack alignHorizontal="center" space="10px">
              <Box marginVertical="-12px">
                <Input
                  value={name}
                  onChange={handleNameChange}
                  height="44px"
                  variant="transparent"
                  placeholder="Name"
                  style={{ textAlign: 'center' }}
                  testId="contact-prompt-input"
                  tabIndex={1}
                  autoFocus={!name?.length}
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
            symbol="return.left"
            symbolSide="left"
            width="full"
            color="accent"
            height="36px"
            variant="flat"
            borderRadius="9px"
            onClick={onSave}
            tabIndex={2}
            testId="contact-prompt-confirm"
            autoFocus={!!name?.length}
            enterCta
          >
            {i18n.t(
              `contacts.${
                action === 'save' ? 'add_to_contacts' : 'save_changes'
              }`,
            )}
          </Button>
          <Button
            width="full"
            color="fillSecondary"
            height="36px"
            variant="flat"
            borderRadius="9px"
            onClick={onCancel}
            tabIndex={3}
          >
            {i18n.t(`contacts.cancel`)}
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
  const deleteContact = useContactsStore.use.deleteContact();

  const onRemove = useCallback(() => {
    deleteContact({ address });
    onSaveContactAction({ show: false, action: 'delete' });
  }, [address, deleteContact, onSaveContactAction]);

  const onCancel = useCallback(() => {
    onSaveContactAction({ show: false, action: 'delete' });
  }, [onSaveContactAction]);

  const contact = useContact({ address });

  return (
    <Box alignItems="center" width="full" paddingTop="12px">
      <Stack space="24px">
        <Stack alignHorizontal="center" space="20px">
          <Text weight="bold" size="16pt" color="label">
            {i18n.t('contacts.remove_contact_title')}
          </Text>
          <Box width="full" style={{ wordBreak: 'break-all' }}>
            <Text
              weight="medium"
              color="labelTertiary"
              size="12pt"
              align="center"
            >
              {i18n.t('contacts.remove_contact_description', {
                name: contact?.display,
              })}
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
            testId="contact-prompt-delete-confirm"
            tabIndex={1}
          >
            {i18n.t('contacts.remove_contact_action')}
          </Button>
          <Button
            width="full"
            color="fillSecondary"
            height="36px"
            variant="raised"
            borderRadius="9px"
            onClick={onCancel}
            tabIndex={2}
          >
            {i18n.t('contacts.cancel')}
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
  handleClose,
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
  handleClose: () => void;
}) => {
  const { data: ensAvatar } = useENSAvatar({ addressOrName: address });
  const { data: dominantColor } = useDominantColor({
    imageUrl: ensAvatar ?? undefined,
  });
  return (
    <Prompt show={show} handleClose={handleClose}>
      <Box padding="12px">
        <AccentColorProvider color={dominantColor || globalColors.blue50}>
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
        </AccentColorProvider>
      </Box>
    </Prompt>
  );
};
