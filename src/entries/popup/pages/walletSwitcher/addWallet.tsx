import React, { useCallback, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box } from '~/design-system';

import { OnboardMenu } from '../../components/OnboardMenu/OnboardMenu';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { CreateWalletPrompt } from './createWalletPrompt';

const AddWallet = () => {
  const navigate = useRainbowNavigate();
  const navigateTo = useCallback(
    (route: string) => {
      navigate(route);
    },
    [navigate],
  );

  const [createWalletAddress, setCreateWalletAddress] = useState<Address>();
  const handleCreateWallet = useCallback(async () => {
    const address = await wallet.create();
    setCreateWalletAddress(address);
  }, []);
  const onClose = () => {
    setCreateWalletAddress(undefined);
  };

  return (
    <Box height="full">
      <CreateWalletPrompt
        show={!!createWalletAddress}
        onClose={onClose}
        address={createWalletAddress}
      />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        paddingHorizontal="20px"
        paddingBottom="20px"
        height="full"
      >
        <OnboardMenu>
          <OnboardMenu.Item
            onClick={handleCreateWallet}
            title={i18n.t('add_wallet.create_wallet')}
            subtitle={i18n.t('add_wallet.create_wallet_description')}
            symbolColor="pink"
            symbol="plus.circle"
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            onClick={() => navigateTo(ROUTES.NEW_IMPORT_WALLET)}
            title={i18n.t('add_wallet.import_wallet')}
            subtitle={i18n.t('add_wallet.import_wallet_description')}
            symbolColor="purple"
            symbol="lock.rotation"
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            onClick={() => {
              alert('coming soon!');
            }}
            title={i18n.t('add_wallet.hardware_wallet')}
            subtitle={i18n.t('add_wallet.hardware_wallet_description')}
            symbolColor="blue"
            symbol="doc.text.magnifyingglass"
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            onClick={() => navigateTo(ROUTES.NEW_WATCH_WALLET)}
            title={i18n.t('add_wallet.watch_address')}
            subtitle={i18n.t('add_wallet.watch_address_description')}
            symbolColor="green"
            symbol="magnifyingglass.circle"
          />
        </OnboardMenu>
      </Box>
    </Box>
  );
};

export { AddWallet };
