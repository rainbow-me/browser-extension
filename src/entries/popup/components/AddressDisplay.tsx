import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { truncateAddress } from '~/core/utils/address';
import { copyAddress } from '~/core/utils/copy';
import {
  Bleed,
  ButtonSymbol,
  Inline,
  Text,
  TextOverflow,
} from '~/design-system';
import { AddressOrEns } from '~/entries/popup/components/AddressOrEns/AddressorEns';
import { ContractIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';

function AddressMoreOptions({ address }: { address: Address }) {
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const YouOrAddress = ({ address }: { address: Address }) => {
  const currentAccount = useCurrentAddressStore((a) =>
    a.currentAddress.toLocaleLowerCase(),
  );
  if (currentAccount === address.toLowerCase())
    return (
      <Inline alignVertical="center" wrap={false} space="2px">
        <Text color="labelSecondary" size="12pt" weight="semibold">
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
      color="labelSecondary"
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
}: {
  address: Address;
  hideAvatar?: boolean;
  contract: {
    name: string;
    iconUrl?: string;
  };
}) => {
  return (
    <Inline space="6px" alignVertical="center">
      {!hideAvatar && <AddressIcon iconUrl={iconUrl} address={address} />}
      <TextOverflow size="12pt" weight="semibold" color="labelQuaternary">
        {name}
      </TextOverflow>
      <AddressMoreOptions address={address} />
    </Inline>
  );
};

export const AddressDisplay = ({
  address,
  contract,
  hideAvatar,
}: {
  address: Address;
  hideAvatar?: boolean;
  contract?: {
    name: string;
    iconUrl?: string;
  };
}) => {
  if (contract?.name)
    return (
      <ContractDisplay
        address={address}
        contract={contract}
        hideAvatar={hideAvatar}
      />
    );

  return (
    <Inline space="6px" alignVertical="center" wrap={false}>
      {!hideAvatar && <AddressIcon address={address} />}
      <YouOrAddress address={address} />
      <AddressMoreOptions address={address} />
    </Inline>
  );
};
