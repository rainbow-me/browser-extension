import { Address, useBalance } from 'wagmi';

import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { formatNumber } from '~/core/utils/formatNumber';
import { Inline, Stack, Text } from '~/design-system';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';

import { WalletName } from './BottomActions';

export interface SelectedNetwork {
  network: string;
  chainId: number;
  name: string;
}

function WalletNativeBalance({
  chainId,
  address,
}: {
  chainId: ChainId;
  address: Address;
}) {
  const { data: balance } = useBalance({ address, chainId });
  if (!balance) return null;
  return (
    <Inline alignVertical="center" space="6px">
      <ChainBadge chainId={chainId} size={14} />
      <Text size="12pt" weight="semibold" color="labelTertiary">
        {formatNumber(balance.formatted)}
      </Text>
    </Inline>
  );
}

export function AccountSigningWith({
  session,
  noFee,
}: {
  session: {
    address: `0x${string}`;
    chainId: ChainId;
  } | null;
  noFee?: boolean;
}) {
  if (!session) return null;
  const { address, chainId } = session;
  return (
    <Inline alignVertical="center" space="8px">
      <WalletAvatar addressOrName={address} size={36} emojiSize="20pt / 150%" />
      <Stack space="10px">
        <Inline alignVertical="center" space="4px">
          <Text size="14pt" weight="bold" color="labelTertiary">
            {i18n.t('approve_request.signing_with')}
          </Text>
          <WalletName address={address} size="14pt" weight="bold" />
        </Inline>
        {noFee ? (
          <Text size="12pt" weight="semibold" color="labelTertiary">
            {i18n.t('approve_request.no_fee_to_sign')}
          </Text>
        ) : (
          <WalletNativeBalance address={address} chainId={chainId} />
        )}
      </Stack>
    </Inline>
  );
}
