import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { Box, Text } from '~/design-system';
import ViewSecret from '~/entries/popup/components/ViewSecret/ViewSecret';
import { exportAccount } from '~/entries/popup/handlers/wallet';

export function PrivateKey() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [privKey, setPrivKey] = useState('');

  useEffect(() => {
    const fetchPrivateKey = async () => {
      const privateKey = await exportAccount(state.account, state.password);
      setPrivKey(privateKey);
    };
    fetchPrivateKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSavedTheseWords = useCallback(async () => {
    navigate(-2);
  }, [navigate]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(privKey as string);
  }, [privKey]);

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
      confirmButtonTopSpacing={260}
      onConfirm={handleSavedTheseWords}
      onCopy={handleCopy}
      secret={
        <Box
          background="surfaceSecondaryElevated"
          borderRadius="16px"
          paddingVertical="12px"
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
