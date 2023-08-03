import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo, useState } from 'react';
import { Address } from 'wagmi';

import appConnectionWalletItemImageMask from 'static/assets/appConnectionWalletItemImageMask.svg';
import { selectUserAssetsBalance } from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { convertAmountToNativeDisplay } from '~/core/utils/numbers';
import {
  Bleed,
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';

import { useWalletName } from '../../hooks/useWalletName';
import { ChainBadge } from '../ChainBadge/ChainBadge';
import {
  MoreInfoButton,
  MoreInfoOption,
} from '../MoreInfoButton/MoreInfoButton';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

import { appConnectionWalletItem } from './AppConnectionWalletItem.css';

const InfoButtonOptions = () => {
  const options = [
    {
      onSelect: () => null,
      label: 'Switch Networks',
      symbol: 'network',
    },
    {
      onSelect: () => null,
      label: 'Disconnect',
      symbol: 'xmark',
      separator: true,
    },
    {
      onSelect: () => null,
      label: 'Open Uniswap',
      symbol: 'trash.fill',
    },
  ];

  return options as MoreInfoOption[];
};

export default function AppConnectionWalletItem({
  account,
  onClick,
  chainId,
  active,
  connected,
}: {
  account: Address;
  onClick?: () => void;
  chainId: ChainId;
  active?: boolean;
  connected: boolean;
}) {
  const [hovering, setHovering] = useState(false);
  const { displayName } = useWalletName({ address: account });
  const showChainBadge = !!chainId && chainId !== ChainId.mainnet;

  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { connectedToHardhat } = useConnectedToHardhatStore();
  const { data: totalAssetsBalance } = useUserAssets(
    { address: account, currency, connectedToHardhat },
    { select: selectUserAssetsBalance() },
  );

  const userAssetsBalanceDisplay = convertAmountToNativeDisplay(
    totalAssetsBalance || 0,
    currency,
  );

  const subLabel = useMemo(
    () => (
      <AnimatePresence>
        {!hovering && (
          <Box
            as={motion.div}
            key={`${account}-${connected ? '' : 'not-'}-connected`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {connected ? (
              <Inline space="4px" alignVertical="center">
                <Symbol
                  symbol={active ? 'circle.fill' : 'circle'}
                  size={8}
                  weight="medium"
                  color={active ? 'green' : 'labelTertiary'}
                />
                <Text size="12pt" weight="semibold" align="left" color="label">
                  {ChainNameDisplay[chainId]}
                </Text>
              </Inline>
            ) : (
              <TextOverflow color="labelQuaternary" size="12pt" weight="bold">
                {userAssetsBalanceDisplay}
              </TextOverflow>
            )}
          </Box>
        )}
        {hovering && (
          <Box
            as={motion.div}
            key={`${account}-${connected ? '' : 'not-'}connected-hovering`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {connected ? (
              <Text size="12pt" weight="semibold" align="left" color="red">
                {'Switch connection'}
              </Text>
            ) : (
              <Text size="12pt" weight="semibold" align="left" color="green">
                {'Connect'}
              </Text>
            )}
          </Box>
        )}
      </AnimatePresence>
    ),
    [account, active, chainId, connected, hovering, userAssetsBalanceDisplay],
  );

  return (
    <Box
      as={motion.div}
      className={appConnectionWalletItem}
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
    >
      <Lens
        handleOpenMenu={onClick}
        key={account}
        onClick={onClick}
        paddingHorizontal="12px"
        paddingVertical="8px"
        borderRadius="12px"
      >
        <Columns space="8px" alignVertical="center" alignHorizontal="justify">
          <Column width="content">
            <WalletAvatar
              mask={showChainBadge ? appConnectionWalletItemImageMask : null}
              address={account}
              size={36}
              emojiSize="20pt"
              background="transparent"
            />
            {showChainBadge ? (
              <Box
                style={{
                  marginLeft: '-7px',
                  marginTop: '-10.5px',
                }}
              >
                <Box
                  style={{
                    height: 14,
                    width: 14,
                    borderRadius: 7,
                  }}
                >
                  <Inline
                    alignHorizontal="center"
                    alignVertical="center"
                    height="full"
                  >
                    <Bleed top="7px">
                      <ChainBadge chainId={chainId} size="14" />
                    </Bleed>
                  </Inline>
                </Box>
              </Box>
            ) : null}
          </Column>
          <Column>
            <Box>
              <Rows space="8px" alignVertical="center">
                <Row height="content">
                  <TextOverflow color="label" size="14pt" weight="semibold">
                    {displayName}
                  </TextOverflow>
                </Row>
                {subLabel}
              </Rows>
            </Box>
          </Column>
          <Column width="content">
            <Bleed horizontal="8px">
              <MoreInfoButton
                variant="transparent"
                options={InfoButtonOptions()}
              />
            </Bleed>
          </Column>
        </Columns>
      </Lens>
    </Box>
  );
}
