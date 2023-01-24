import React from 'react';

import { i18n } from '~/core/languages';
import { Box } from '~/design-system';

import { OnboardMenu } from '../../components/OnboardMenu/OnboardMenu';

const AddWallet = () => {
  return (
    <Box height="full">
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
            onClick={() => {
              console.log('create wallet');
            }}
            title={i18n.t('add_wallet.create_wallet')}
            subtitle={i18n.t('add_wallet.create_wallet_description')}
            symbolColor="pink"
            symbol="plus.circle"
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            onClick={() => {
              console.log('import wallet');
            }}
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
            onClick={() => {
              console.log('watch address');
            }}
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
