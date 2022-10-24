import * as React from 'react';
import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';

import { truncateAddress } from '~/core/utils/truncateAddress';
import {
  AccentColorProvider,
  Box,
  Inline,
  Inset,
  Stack,
  Text,
} from '~/design-system';
import { foregroundColorVars } from '~/design-system/styles/core.css';

import { SFSymbol, SFSymbolProps } from '../components/SFSymbol';
import { useDominantColor } from '../hooks/useDominantColor';
import { InjectToggle } from '../components/_dev/InjectToggle';
import { ClearStorage } from '../components/_dev/ClearStorage';

export function Index() {
  const { address } = useAccount();

  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: address });
  const { data: balance } = useBalance({ addressOrName: address });

  const { data: color } = useDominantColor({
    imageUrl: ensAvatar ?? undefined,
  });

  return (
    <AccentColorProvider color={color || 'white'}>
      {({ className, style }) => (
        /* TODO: Convert to <Rows> */
        <Box
          className={className}
          style={{
            ...style,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* TODO: Convert to <Row> */}
          <Box
            background="surfacePrimaryElevatedSecondary"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            style={{
              height: '260px',
              // TODO: Need separator component?
              borderBottomColor: foregroundColorVars.separatorTertiary,
              borderBottomWidth: '1px',
              borderBottomStyle: 'solid',
            }}
          >
            <Inset top="36px">
              <Stack alignHorizontal="center" space="16px">
                {/* TODO: Convert to <Avatar> */}
                <Box
                  borderRadius="round"
                  style={{
                    height: '60px',
                    width: '60px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {ensAvatar && (
                    /* TODO: Convert to <Image> & Imgix/Cloudinary */
                    <img
                      src={ensAvatar}
                      width="100%"
                      height="100%"
                      loading="lazy"
                    />
                  )}
                  {/* TODO: Convert to <Skeleton> */}
                  <Box
                    background="surfaceSecondaryElevated"
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                    }}
                  />
                </Box>
                <Text
                  color="label"
                  size="20pt"
                  weight="heavy"
                  testId="account-name"
                >
                  {ensName ?? truncateAddress(address || '0x')}
                </Text>
                <Inline space="12px">
                  <ActionButton symbol="copy" text="Copy" />
                  <ActionButton symbol="swap" text="Swap" />
                  <ActionButton symbol="send" text="Send" />
                </Inline>
              </Stack>
            </Inset>
            <Inset horizontal="20px">
              {/* TODO: Convert to <Columns> */}
              <Box
                display="flex"
                justifyContent="space-between"
                style={{ height: '34px' }}
              >
                <Box>
                  <Tabs>
                    <Tab active symbol="tokens" text="Tokens" />
                    <Tab symbol="activity" text="Activity" />
                  </Tabs>
                </Box>
                <Inset top="4px">
                  {balance && (
                    <Inline alignVertical="center">
                      <SFSymbol symbol="eth" size={14} />
                      <Text size="16pt" weight="bold">
                        {parseFloat(balance?.formatted).toFixed(4)}
                      </Text>
                    </Inline>
                  )}
                </Inset>
              </Box>
            </Inset>
          </Box>
          <Box
            // TODO: Add proper background design token for this one.
            background="surfacePrimaryElevated"
            style={{
              flex: 1,
              overflow: 'scroll',
            }}
          >
            <Inset top="20px">
              <Stack space="20px">
                <InjectToggle />
                <ClearStorage />
              </Stack>
            </Inset>
          </Box>
        </Box>
      )}
    </AccentColorProvider>
  );
}

function ActionButton({
  symbol,
  text,
}: {
  symbol: SFSymbolProps['symbol'];
  text: string;
}) {
  return (
    <Stack alignHorizontal="center" space="10px">
      <Box
        background="accent"
        borderRadius="round"
        boxShadow="12px accent"
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{
          width: '36px',
          height: '36px',
        }}
      >
        <SFSymbol symbol={symbol} color="label" />
      </Box>
      <Text color="labelSecondary" size="12pt" weight="semibold">
        {text}
      </Text>
    </Stack>
  );
}

function Tabs({ children }: { children: React.ReactNode }) {
  return (
    <Inline space="20px" height="full">
      {children}
    </Inline>
  );
}

function Tab({
  active,
  symbol,
  text,
}: {
  active?: boolean;
  symbol?: SFSymbolProps['symbol'];
  text: string;
}) {
  return (
    /* TODO: Convert to <Rows> */
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* TODO: Convert to <Row> */}
      <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Inset horizontal="2px">
          <Inline alignVertical="center" space="4px">
            {symbol && (
              <SFSymbol
                color={active ? 'label' : 'labelTertiary'}
                symbol={symbol}
                size={14}
              />
            )}
            <Text
              color={active ? 'label' : 'labelTertiary'}
              size="16pt"
              weight="semibold"
            >
              {text}
            </Text>
          </Inline>
        </Inset>
      </Box>
      {/* TODO: Convert to <Row> */}
      <Box style={{ display: 'flex', alignItems: 'flex-end', height: '12px' }}>
        {active && (
          <Box
            background="accent"
            style={{
              marginBottom: -1,
              height: 2,
              width: '100%',
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
            }}
          />
        )}
      </Box>
    </Box>
  );
}
