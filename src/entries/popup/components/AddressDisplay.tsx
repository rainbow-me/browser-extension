import { type Address } from 'viem';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { getBlockExplorerHostForChain } from '~/core/utils/chains';
import { copyAddress } from '~/core/utils/copy';
import { getExplorerUrl, goToNewTab } from '~/core/utils/tabs';
import { getBlockExplorerName } from '~/core/utils/transactions';
import {
  Bleed,
  ButtonSymbol,
  Inline,
  Text,
  TextOverflow,
} from '~/design-system';
import { TextProps } from '~/design-system/components/Text/Text';
import { AddressOrEns } from '~/entries/popup/components/AddressOrEns/AddressorEns';
import { ContractIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';

export function AddressMoreOptions({
  address,
  chainId,
}: {
  address: Address;
  chainId?: ChainId;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Bleed space="9px">
          <ButtonSymbol
            symbol="ellipsis.circle"
            height="32px"
            variant="transparent"
            color="labelTertiary"
          />
        </Bleed>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          symbolLeft="doc.on.doc.fill"
          onSelect={() => copyAddress(address)}
        >
          <Text size="14pt" weight="semibold">
            {i18n.t('token_details.more_options.copy_address')}
          </Text>
          <Text size="11pt" color="labelTertiary" weight="medium">
            {truncateAddress(address)}
          </Text>
        </DropdownMenuItem>
        {chainId && (
          <DropdownMenuItem
            symbolLeft="doc.text.magnifyingglass"
            onSelect={() => {
              const explorer = getBlockExplorerHostForChain(chainId);
              goToNewTab({
                url: explorer && getExplorerUrl(explorer, address),
              });
            }}
          >
            <Text size="14pt" weight="semibold">
              {i18n.t('token_details.more_options.view_on_explorer', {
                explorer: getBlockExplorerName(chainId),
              })}
            </Text>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const YouOrAddress = ({
  address,
  color = 'labelSecondary',
}: {
  address: Address;
  color?: TextProps['color'];
}) => {
  const currentAccount = useCurrentAddressStore((a) =>
    a.currentAddress.toLocaleLowerCase(),
  );
  if (currentAccount === address.toLowerCase())
    return (
      <Inline alignVertical="center" wrap={false} space="2px">
        <Text color={color} size="12pt" weight="semibold">
          {i18n.t('activity_details.you')}
        </Text>

        <Inline alignVertical="center" wrap={false}>
          <Text size="12pt" weight="semibold" color="labelQuaternary">
            (
          </Text>
          <AddressOrEns
            address={address}
            size="12pt"
            weight="semibold"
            color="labelQuaternary"
          />
          <Text size="12pt" weight="semibold" color="labelQuaternary">
            )
          </Text>
        </Inline>
      </Inline>
    );

  return (
    <AddressOrEns
      address={address}
      size="12pt"
      weight="semibold"
      color={color}
    />
  );
};

function AddressIcon({
  iconUrl,
  address,
}: {
  iconUrl?: string;
  address?: Address;
}) {
  return iconUrl ? (
    <ContractIcon size={16} iconUrl={iconUrl} />
  ) : (
    <WalletAvatar addressOrName={address} size={16} emojiSize="9pt" />
  );
}

const ContractDisplay = ({
  address,
  hideAvatar,
  contract: { name, iconUrl },
  chainId,
  color = 'labelQuaternary',
}: {
  address: Address;
  hideAvatar?: boolean;
  contract: {
    name: string;
    iconUrl?: string;
  };
  chainId?: ChainId;
  color?: TextProps['color'];
}) => {
  return (
    <Inline space="6px" alignVertical="center" wrap={false}>
      {!hideAvatar && <AddressIcon iconUrl={iconUrl} address={address} />}
      <TextOverflow size="12pt" weight="semibold" color={color}>
        {name}
      </TextOverflow>
      <AddressMoreOptions address={address} chainId={chainId} />
    </Inline>
  );
};

export const AddressDisplay = ({
  address,
  contract,
  hideAvatar,
  chainId,
  color,
}: {
  address: Address;
  hideAvatar?: boolean;
  contract?: {
    name: string;
    iconUrl?: string;
  };
  chainId?: ChainId;
  color?: TextProps['color'];
}) => {
  if (contract?.name)
    return (
      <ContractDisplay
        address={address}
        contract={contract}
        hideAvatar={hideAvatar}
        chainId={chainId}
        color={color}
      />
    );

  return (
    <Inline space="6px" alignVertical="center" wrap={false}>
      {!hideAvatar && <AddressIcon address={address} />}
      <YouOrAddress address={address} color={color} />
      <AddressMoreOptions address={address} chainId={chainId} />
    </Inline>
  );
};
