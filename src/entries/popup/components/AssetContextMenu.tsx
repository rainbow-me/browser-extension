import { PropsWithChildren } from 'react';

import { i18n } from '~/core/languages';
import { ParsedAsset } from '~/core/types/assets';
import { truncateAddress } from '~/core/utils/address';
import { isNativeAsset } from '~/core/utils/chains';
import { copyAddress } from '~/core/utils/copy';
import { goToNewTab } from '~/core/utils/tabs';
import { getTokenBlockExplorer } from '~/core/utils/transactions';
import { Text } from '~/design-system';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ContextMenu/ContextMenu';

export const AssetContextMenu = ({
  children,
  asset,
}: PropsWithChildren<{ asset?: ParsedAsset | null }>) => {
  if (!asset) return children;

  const explorer = getTokenBlockExplorer(asset);

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent
        accentColor={asset?.colors?.primary || asset?.colors?.fallback}
      >
        {!isNativeAsset(asset.address, asset.chainId) && (
          <ContextMenuItem
            symbolLeft="doc.on.doc.fill"
            onSelect={() => copyAddress(asset.address)}
          >
            <Text size="14pt" weight="semibold">
              {i18n.t('token_details.more_options.copy_address')}
            </Text>
            <Text size="11pt" color="labelTertiary" weight="medium">
              {truncateAddress(asset.address)}
            </Text>
          </ContextMenuItem>
        )}
        {explorer && (
          <ContextMenuItem
            symbolLeft="binoculars.fill"
            external
            onSelect={() => goToNewTab(explorer)}
          >
            {i18n.t('token_details.view_on', {
              explorer: explorer.name,
            })}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
