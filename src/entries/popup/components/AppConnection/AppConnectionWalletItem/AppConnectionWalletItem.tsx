import { Address } from '@wagmi/core';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo, useState } from 'react';

import appConnectionWalletItemImageMask from 'static/assets/appConnectionWalletItemImageMask.svg';
import { i18n } from '~/core/languages';
import {
  selectUserAssetsBalance,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { convertAmountToNativeDisplay } from '~/core/utils/numbers';
import {
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

import { useWalletName } from '../../../hooks/useWalletName';
import { ChainBadge } from '../../ChainBadge/ChainBadge';
import { WalletAvatar } from '../../WalletAvatar/WalletAvatar';

import { appConnectionWalletItem } from './AppConnectionWalletItem.css';

interface WalletItemProps {
  address: Address;
  onClick?: () => void;
  chainId: ChainId;
  active?: boolean;
  connected: boolean;
}

export const AppConnectionWalletItem = React.forwardRef(
  (props: WalletItemProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const { address, onClick, chainId, active, connected } = props;
    const [hovering, setHovering] = useState(false);
    const { displayName } = useWalletName({ address });
    const showChainBadge = !!chainId && chainId !== ChainId.mainnet;

    const { currentCurrency: currency } = useCurrentCurrencyStore();
    const { data: totalAssetsBalance } = useUserAssets(
      { address, currency },
      {
        select: (data) =>
          selectorFilterByUserChains({
            data,
            selector: selectUserAssetsBalance,
          }),
      },
    );

    const userAssetsBalanceDisplay = convertAmountToNativeDisplay(
      totalAssetsBalance || 0,
      currency,
    );

    const subLabel = useMemo(
      () => (
        <AnimatePresence initial={false} mode="popLayout">
          {(!hovering || active) && (
            <Box
              as={motion.div}
              key={`${address}-${connected ? '' : 'not-'}-connected`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {connected ? (
                <Inline space="4px" alignVertical="center">
                  <Symbol
                    symbol={active ? 'circle.fill' : 'circle'}
                    size={8}
                    weight="medium"
                    color={active ? 'green' : 'labelTertiary'}
                  />
                  <Text
                    size="12pt"
                    weight="semibold"
                    align="left"
                    color="label"
                  >
                    {ChainNameDisplay[chainId]}
                  </Text>
                </Inline>
              ) : (
                <Inline space="4px" alignVertical="center">
                  <TextOverflow
                    color="labelQuaternary"
                    size="12pt"
                    weight="bold"
                  >
                    {userAssetsBalanceDisplay}
                  </TextOverflow>
                </Inline>
              )}
            </Box>
          )}
          {hovering && !active && (
            <Box
              as={motion.div}
              key={`${address}-${connected ? '' : 'not-'}connected-hovering`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Text
                size="12pt"
                weight="semibold"
                align="left"
                color={connected ? 'red' : 'green'}
              >
                {i18n.t(
                  `app_connection_switcher.wallet_item.${
                    connected ? 'switch_connection' : 'connect'
                  }`,
                )}
              </Text>
            </Box>
          )}
        </AnimatePresence>
      ),
      [address, active, chainId, connected, hovering, userAssetsBalanceDisplay],
    );

    return (
      <Box
        ref={ref}
        as={motion.div}
        className={active ? null : appConnectionWalletItem}
        onHoverStart={() => setHovering(true)}
        onHoverEnd={() => setHovering(false)}
        testId={`app-connection-wallet-item-${address}-${
          active ? 'active' : 'not-active'
        }`}
      >
        <Lens
          handleOpenMenu={onClick}
          key={address}
          onClick={onClick}
          paddingHorizontal="12px"
          paddingVertical="8px"
          borderRadius="12px"
        >
          <Columns space="8px" alignVertical="center" alignHorizontal="justify">
            <Column width="content">
              <Box>
                <WalletAvatar
                  mask={
                    showChainBadge ? appConnectionWalletItemImageMask : null
                  }
                  addressOrName={address}
                  size={36}
                  emojiSize="20pt"
                  background="transparent"
                />
                <Box
                  style={{
                    marginLeft: '-7px',
                    marginTop: '-14px',
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
                      <AnimatePresence>
                        {showChainBadge ? (
                          <Box
                            testId={`app-connection-wallet-item-badge-${address}-${chainId}`}
                            as={motion.div}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <ChainBadge chainId={chainId} size="14" />
                          </Box>
                        ) : null}
                      </AnimatePresence>
                    </Inline>
                  </Box>
                </Box>
              </Box>
            </Column>
            <Column>
              <Box position="relative">
                <Rows space="8px" alignVertical="center">
                  <Row height="content">
                    <TextOverflow color="label" size="14pt" weight="semibold">
                      {displayName}
                    </TextOverflow>
                  </Row>
                  <Row>
                    <Box position="relative">{subLabel}</Box>
                  </Row>
                </Rows>
              </Box>
            </Column>
          </Columns>
        </Lens>
      </Box>
    );
  },
);

AppConnectionWalletItem.displayName = 'AppConnectionWalletItem';
