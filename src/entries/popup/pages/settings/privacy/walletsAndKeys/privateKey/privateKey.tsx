import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { Box, Text } from '~/design-system';
import ViewSecret from '~/entries/popup/components/ViewSecret/ViewSecret';
import { exportAccount } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

export function PrivateKey() {
  const { state } = useLocation();
  const navigate = useRainbowNavigate();

  const [privKey, setPrivKey] = useState('');

  const handleSavedTheseWords = useCallback(
    () => navigate(ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS),
    [navigate],
  );

  const handleCopy = useCallback(
    () => navigator.clipboard.writeText(privKey as string),
    [privKey],
  );

  useEffect(() => {
    const fetchPrivateKey = async () => {
      const privateKey = await exportAccount(state?.account, state?.password);
      setPrivKey(privateKey);
    };
    fetchPrivateKey();
  }, [state?.account, state?.password]);

  return (
    <ViewSecret
      titleSymbol="key.fill"
      title={i18n.t(
        'settings.privacy_and_security.wallets_and_keys.private_key.title',
      )}
      subtitle={i18n.t(
        'settings.privacy_and_security.wallets_and_keys.private_key.subtitle',
      )}
      confirmButtonLabel={i18n.t(
        'settings.privacy_and_security.wallets_and_keys.private_key.saved',
      )}
      confirmButtonSymbol="checkmark.circle.fill"
      onConfirm={handleSavedTheseWords}
      onCopy={handleCopy}
      secret={
        <Box
          background="surfaceSecondaryElevated"
          borderRadius="16px"
          paddingVertical="10px"
          paddingHorizontal="16px"
          style={{
            wordBreak: 'break-all',
          }}
        >
          <Text size="14pt" weight="bold">
            {privKey}
          </Text>
        </Box>
      }
    />
  );
}
