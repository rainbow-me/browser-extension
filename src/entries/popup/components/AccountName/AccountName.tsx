import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useEnsAvatar } from 'wagmi';

import { useCurrentAddressStore } from '~/core/state';
import { Box, Inline, Symbol, Text } from '~/design-system';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_ACCOUNT_2,
} from '~/entries/background/handlers/handleProviderRequest';

import { useWalletName } from '../../hooks/useWalletName';
import { ROUTES } from '../../urls';
import { Avatar } from '../Avatar/Avatar';

type AccountNameProps = {
  includeAvatar?: boolean;
  id?: string;
  size?: '16pt' | '20pt';
};

const chevronDownSizes = {
  '16pt': 12,
  '20pt': 16,
} as const;

export function AccountName({
  includeAvatar = false,
  size = '20pt',
  id,
}: AccountNameProps) {
  const { address } = useAccount();
  const { displayName } = useWalletName({ address: address || '0x' });
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: address });

  const { setCurrentAddress } = useCurrentAddressStore();

  // TODO: handle account switching correctly
  const shuffleAccount = React.useCallback(() => {
    setCurrentAddress(
      address === DEFAULT_ACCOUNT ? DEFAULT_ACCOUNT_2 : DEFAULT_ACCOUNT,
    );
  }, [address, setCurrentAddress]);

  return (
    <Inline alignVertical="center" space="4px">
      {includeAvatar && <Avatar imageUrl={ensAvatar || ''} size={16} />}
      <Box
        as="button"
        onClick={shuffleAccount}
        id={`${id ?? ''}-account-name-shuffle`}
      >
        <Text color="label" size={size} weight="heavy" testId="account-name">
          {displayName}
        </Text>
      </Box>
      <Link
        id={`${id ? `${id}-` : ''}account-name-link-to-wallet`}
        to={ROUTES.WALLETS}
        onClick={() => console.log('I am clicking this shit')}
      >
        <Symbol
          size={chevronDownSizes[size]}
          symbol="chevron.down"
          color="labelTertiary"
          weight="semibold"
        />
      </Link>
    </Inline>
  );
}
