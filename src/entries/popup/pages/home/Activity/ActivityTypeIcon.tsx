import { RainbowTransaction, TransactionType } from '~/core/types/transactions';
import { Symbol, SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { SymbolName } from '~/design-system/styles/designTokens';
import { Spinner } from '~/entries/popup/components/Spinner/Spinner';

const activityTypeIcon: Record<TransactionType, SymbolName> = {
  airdrop: 'shippingbox',
  approve: 'checkmark.circle',
  contract_interaction: 'doc.plaintext',
  receive: 'arrow.down',
  send: 'paperplane.fill',
  swap: 'arrow.triangle.swap',
  bid: 'plus.app',
  burn: 'flame',
  mint: 'sparkle',
  purchase: 'bag',
  sale: 'tag',
  wrap: 'gift',
  unwrap: 'gift',
  cancel: 'xmark.circle',
  repay: 'arrow.turn.up.right',
  bridge: 'arrow.turn.up.right',
  stake: 'arrow.turn.left.down',
  unstake: 'arrow.turn.right.up',
  withdraw: 'arrow.turn.right.up',
  deposit: 'arrow.turn.left.down',
  //
  revoke: 'minus.circle',
  speed_up: 'hare',
  claim: 'arrow.down',
  borrow: 'arrow.down',
  deployment: 'arrow.down',
};

export const ActivityTypeIcon = ({
  transaction: { status, type },
}: {
  transaction: Pick<RainbowTransaction, 'status' | 'type'>;
}) => {
  let symbol = activityTypeIcon[type];
  let color: SymbolProps['color'] = 'labelTertiary';

  if (status === 'pending') return <Spinner size={9} color="blue" />;
  if (status === 'failed') {
    symbol = 'xmark.circle';
    color = 'red';
  }

  if (!symbol) return null;

  return <Symbol symbol={symbol} color={color} size={9} weight="semibold" />;
};
