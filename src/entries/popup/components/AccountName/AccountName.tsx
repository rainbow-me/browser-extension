import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi';

import { useCurrentAddressStore } from '~/core/state';
import { truncateAddress } from '~/core/utils/truncateAddress';
import { Box, Inline, Text } from '~/design-system';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_ACCOUNT_2,
} from '~/entries/background/handlers/handleProviderRequest';

import { Avatar } from '../Avatar/Avatar';
import { SFSymbol } from '../SFSymbol/SFSymbol';

type AccountNameProps = {
  id?: string;
  includeAvatar?: boolean;
  size?: '16pt' | '20pt';
};

export function AccountName({
  includeAvatar = false,
  size = '20pt',
  id,
}: AccountNameProps) {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });
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
        id={`${id ? `${id}-` : ''}account-name-shuffle-account`}
      >
        <Text color="label" size={size} weight="heavy" testId="account-name">
          {ensName ?? truncateAddress(address || '0x')}
        </Text>
      </Box>
      <Link
        id={`${id ? `${id}-` : ''}account-name-link-to-wallet`}
        to="/wallets"
      >
        <SFSymbol color="labelTertiary" size={20} symbol="chevronDown" />
      </Link>
    </Inline>
  );
}
