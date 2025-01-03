import React from 'react';

import { i18n } from '~/core/languages';

import { triggerToast } from '../components/Toast/Toast';

export const useDeviceUUID = () => {
  const getAppUUID = React.useCallback(async () => {
    const storage = await chrome.storage.local.get('rainbow.zustand.deviceId');
    const entries = Object.entries(storage) as [string, string][];
    const jsonString = entries[0][1];
    const parsed = JSON.parse(jsonString) as {
      state: { deviceId: string };
      version: number;
    };
    return parsed.state.deviceId as string;
  }, []);

  const handleUUIDCopy = React.useCallback(async (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    triggerToast({
      title: i18n.t('command_k.action_labels.uuid_copied'),
      description: `${uuid.slice(0, 5)}…${uuid.slice(-5)}`,
    });
  }, []);

  return {
    getAppUUID,
    handleUUIDCopy,
  };
};
