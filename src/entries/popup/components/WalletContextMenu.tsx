import { PropsWithChildren, useState } from 'react';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { truncateAddress } from '~/core/utils/address';
import { copyAddress } from '~/core/utils/copy';
import { goToNewTab } from '~/core/utils/tabs';
import { Text } from '~/design-system';

import { RenameWalletPrompt } from '../pages/walletSwitcher/renameWalletPrompt';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ContextMenu/ContextMenu';

export const WalletContextMenu = ({
  children,
  account,
}: PropsWithChildren<{ account?: Address }>) => {
  const [isRenamingWallet, setIsRenamingWallet] = useState(false);

  if (!account) return <>{children}</>;

  const viewOnEtherscan = () =>
    goToNewTab({ url: `https://etherscan.io/address/${account}` });

  return (
    <>
      <RenameWalletPrompt
        account={isRenamingWallet ? account : undefined}
        onClose={() => setIsRenamingWallet(false)}
      />

      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            symbolLeft="person.crop.circle.fill"
            onSelect={() => setIsRenamingWallet(true)}
          >
            {i18n.t('wallet.rename')}
          </ContextMenuItem>

          <ContextMenuItem
            symbolLeft="doc.on.doc.fill"
            onSelect={() => copyAddress(account)}
          >
            <Text size="14pt" weight="semibold">
              {i18n.t('wallet.copy_address')}
            </Text>
            <Text size="11pt" color="labelTertiary" weight="medium">
              {truncateAddress(account)}
            </Text>
          </ContextMenuItem>

          <ContextMenuItem
            symbolLeft="binoculars.fill"
            onSelect={viewOnEtherscan}
            external
          >
            {i18n.t('wallet.view_on', { explorer: 'Etherscan' })}
          </ContextMenuItem>

          <ContextMenuItem symbolLeft="paintbrush.pointed.fill" disabled>
            {i18n.t('wallet.edit_appearance')}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
};
