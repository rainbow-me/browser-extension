import { i18n } from '~/core/languages';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { Inline, Stack, Text } from '~/design-system';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';

import { useNativeAsset } from '../../hooks/useNativeAsset';

import { WalletName } from './BottomActions';
import { useHasEnoughtGas } from './SendTransaction/SendTransactionsInfo';

export interface SelectedNetwork {
  network: string;
  chainId: number;
  name: string;
}

function WalletNativeBalance({ chainId }: { chainId: ChainId }) {
  const { nativeAsset } = useNativeAsset({ chainId });
  const balance = nativeAsset?.balance;

  const hasEnoughtGas = useHasEnoughtGas(chainId);

  if (!balance) return null;

  return (
    <Inline alignVertical="center" space="6px">
      <ChainBadge chainId={chainId} size={14} />
      <Text
        size="12pt"
        weight="bold"
        color={hasEnoughtGas ? 'labelTertiary' : 'red'}
      >
        {+balance.amount > 0
          ? balance.display
          : i18n.t('approve_request.no_token', { token: nativeAsset.symbol })}
      </Text>
      <Text size="12pt" weight="semibold" color="labelQuaternary">
        {i18n.t('approve_request.on_chain', {
          chain: ChainNameDisplay[chainId],
        })}
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
