import { randomUUID } from 'crypto';

import { motion } from 'framer-motion';
import { setup } from 'gridplus-sdk';
import { FormEvent, useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { useGridPlusClientStore } from '~/core/state/gridplusClient';
import { LocalStorage } from '~/core/storage';
import { Box, Button, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Spinner } from '~/entries/popup/components/Spinner/Spinner';
import {
  getStoredGridPlusClient,
  setStoredGridPlusClient,
} from '~/entries/popup/handlers/gridplus';

export type WalletCredentialsProps = {
  appName: string;
  onAfterSetup?: (result: boolean) => void;
};

export const WalletCredentials = ({
  appName,
  onAfterSetup,
}: WalletCredentialsProps) => {
  const setClient = useGridPlusClientStore((state) => state.setClient);
  const [connecting, setConnecting] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const formDataFilled = deviceId.length > 0; // device ids probably have a pattern we could match against

  const disabled = !formDataFilled || connecting;

  const setStoredClient = (storedClient: string | null) => {
    if (!storedClient) return;
    setStoredGridPlusClient(storedClient);
    setClient(storedClient);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConnecting(true);
    try {
      let result: boolean;
      if (process.env.IS_TESTING === 'true') {
        result = true;
      } else {
        result = await setup({
          deviceId: deviceId,
          password: randomUUID(),
          name: appName,
          getStoredClient: () => useGridPlusClientStore.getState().client,
          setStoredClient: setStoredClient,
        });
      }
      await LocalStorage.set('gridPlusDeviceId', deviceId);
      onAfterSetup && onAfterSetup(result);
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    const checkPersistedClient = async () => {
      const gridPlusClient = await getStoredGridPlusClient();
      if (gridPlusClient) {
        const result = await setup({
          getStoredClient: () => gridPlusClient,
          setStoredClient: setStoredGridPlusClient,
          name: appName,
        });
        onAfterSetup && onAfterSetup(result);
      }
    };
    checkPersistedClient();
  }, [appName, onAfterSetup]);

  return (
    <Box
      as={motion.form}
      display="flex"
      flexDirection="column"
      flexGrow="1"
      flexShrink="1"
      onSubmit={onSubmit}
      width="full"
      paddingBottom="16px"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        flexGrow="1"
        flexShrink="1"
        gap="32px"
        width="full"
      >
        <Text size="20pt" weight="semibold" align="center">
          {i18n.t('hw.connect_gridplus_title')}
        </Text>
        <Box paddingHorizontal="24px">
          <Text
            size="16pt"
            weight="medium"
            align="center"
            color="labelSecondary"
          >
            {i18n.t('hw.connect_gridplus_description')}
          </Text>
        </Box>
        <Box
          as="fieldset"
          display="flex"
          flexDirection="column"
          gap="8px"
          width="full"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text size="14pt" weight="semibold" color="labelSecondary">
              {i18n.t('hw.gridplus_device_id')}
            </Text>
            <Text size="12pt" weight="medium" color="labelSecondary">
              {i18n.t('hw.gridplus_device_id_description')}
            </Text>
          </Box>
          <Input
            variant="bordered"
            height="40px"
            id="deviceId"
            placeholder="Enter Device ID"
            onChange={(e) => setDeviceId(e.target.value)}
            value={deviceId}
            testId="gridplus-deviceid"
            aria-label="username"
            tabIndex={0}
          />
        </Box>
      </Box>
      <Button
        height="44px"
        color={disabled ? 'labelQuaternary' : 'blue'}
        variant={disabled ? 'disabled' : 'flat'}
        disabled={disabled}
        testId="gridplus-submit"
        width="full"
        symbol="checkmark.circle.fill"
        tabIndex={0}
      >
        {connecting ? (
          <Spinner size={16} color="label" />
        ) : (
          i18n.t('hw.gridplus_connect')
        )}
      </Button>
    </Box>
  );
};
