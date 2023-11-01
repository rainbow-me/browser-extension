import { Address, useBalance } from 'wagmi';

import { ChainId } from '~/core/types/chains';
import { formatNumber } from '~/core/utils/formatNumber';
import { Inline, Stack, Text } from '~/design-system';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';

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
  if (!balance) return;
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
  selectedWallet,
  appHost,
  noFee,
}: {
  selectedWallet: Address;
  appHost: string;
  noFee?: boolean;
}) {
  const { activeSession } = useAppSession({ host: appHost });
  if (!activeSession) return;
  const { address, chainId } = activeSession;
  return (
    <Inline alignVertical="center" space="8px">
      <WalletAvatar
        addressOrName={selectedWallet}
        size={36}
        emojiSize="20pt / 150%"
      />
      <Stack space="10px">
        <Inline alignVertical="center" space="4px">
          <Text size="14pt" weight="bold" color="labelTertiary">
            Signing with
          </Text>
          <WalletName address={selectedWallet} size="14pt" weight="bold" />
        </Inline>
        {noFee ? (
          <Text size="12pt" weight="semibold" color="labelTertiary">
            No fee to sign
          </Text>
        ) : (
          <WalletNativeBalance address={address} chainId={chainId} />
        )}
      </Stack>
    </Inline>
  );
}
