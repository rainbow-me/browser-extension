import { setup } from 'gridplus-sdk';
import { FormEvent, useEffect } from 'react';

import { i18n } from '~/core/languages';
import { Box, Button, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';

export type WalletCredentialsProps = {
  appName: string;
  onAfterSetup?: () => void;
};

export const WalletCredentials = ({
  appName,
  onAfterSetup,
}: WalletCredentialsProps) => {
  const getStoredClient = () => localStorage.getItem('storedClient') || '';

  const setStoredClient = (storedClient: string | null) => {
    if (!storedClient) return;
    localStorage.setItem('storedClient', storedClient);
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // setup({
    //   deviceId: data.deviceId,
    //   password: data.password,
    //   name: appName,
    //   getStoredClient,
    //   setStoredClient,
    // });
    onAfterSetup && onAfterSetup();
  };
  useEffect(() => {
    if (getStoredClient()) {
      setup({ getStoredClient, setStoredClient, name: appName });
    }
  }, [appName]);
  return (
    <Box
      as="form"
      display="flex"
      flexDirection="column"
      onSubmit={onSubmit}
      gap="16px"
      width="full"
    >
      <Text size="20pt" weight="semibold">
        {i18n.t('hw.connect_gridplus_title')}
      </Text>
      <Box as="fieldset" display="flex" flexDirection="column" gap="8px">
        <Text size="14pt" weight="semibold">
          Device ID
        </Text>
        <Input
          variant="bordered"
          height="40px"
          id="deviceId"
          placeholder="Enter Device ID"
        />
        {/* {!!errors.deviceId && <p>{errors.deviceId.message}</p>} */}
      </Box>
      <Box as="fieldset" display="flex" flexDirection="column" gap="8px">
        <Text size="14pt" weight="semibold">
          Password
        </Text>
        <Input
          variant="bordered"
          height="40px"
          id="password"
          type="password"
          placeholder="Enter Password"
        />
        {/* {!!errors.password && <p>{errors.password.message}</p>} */}
      </Box>
      <Button height="36px" variant="flat" color="fill">
        Connect
      </Button>
    </Box>
  );
};
