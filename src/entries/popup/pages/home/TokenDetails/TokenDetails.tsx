import { ReactNode } from 'react';
import { To, useLocation } from 'react-router-dom';

import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId, ChainName, ChainNameDisplay } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import {
  Box,
  Button,
  Inline,
  Separator,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/design-system/components/Accordion/Accordion';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import { TextProps } from '~/design-system/components/Text/Text';
import { SymbolName } from '~/design-system/styles/designTokens';
import { Asterisks } from '~/entries/popup/components/Asterisks/Asterisks';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
import { Tooltip } from '~/entries/popup/components/Tooltip/Tooltip';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useUserAsset } from '~/entries/popup/hooks/useUserAsset';
import { ROUTES } from '~/entries/popup/urls';

import LineChart from './LineChart';

const usdc = {
  uniqueId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_1',
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  chainId: 1,
  chainName: ChainName.mainnet,
  name: 'USDC Coin',
  mainnetAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  symbol: 'usdc',
  decimals: 6,
  isNativeAsset: false,
  colors: {
    primary: '#2775CA',
  },
  balance: { amount: '0', display: '0' },
  native: {
    balance: { amount: '0', display: '0' },
  },
  icon_url:
    'https://rainbow.imgix.net/https%3A%2F%2Frainbowme-res.cloudinary.com%2Fimage%2Fupload%2Fv1668633498%2Fassets%2Fethereum%2F0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png?w=72&h=72&s=b5485b080191e103486b476dd757b617',
} as ParsedAddressAsset;

const parsePriceChange = (
  value: number,
): { color: TextProps['color']; symbol: SymbolName | '' } => {
  if (value < 0) return { color: 'red', symbol: 'arrow.down' };
  if (value > 0) return { color: 'green', symbol: 'arrow.up' };
  return { color: 'labelSecondary', symbol: '' };
};
function PriceChange({ value = 0 }: { value?: number }) {
  const { color, symbol } = parsePriceChange(+value.toFixed(2));
  return (
    <Box display="flex" flexDirection="column" gap="10px" alignItems="flex-end">
      <Text size="16pt" weight="heavy" color={color}>
        {symbol && (
          <Symbol color={color} size={12} symbol={symbol} weight="heavy" />
        )}{' '}
        {Math.abs(value).toFixed(2)} %
      </Text>
      <Text size="14pt" weight="heavy" color={color}>
        Today
      </Text>
    </Box>
  );
}

function Chart() {
  const selected = '1D';
  return (
    <Box>
      <Box style={{ height: '222px' }} marginHorizontal="-20px">
        <LineChart />
      </Box>
      <Box display="flex" justifyContent="center" gap="12px">
        {['1H', '1D', '1W', '1M', '1Y'].map((timeframe) => {
          const isSelected = timeframe === selected;
          return (
            <Button
              key={timeframe}
              height="24px"
              variant={isSelected ? 'tinted' : 'transparentHover'}
              color={isSelected ? 'accent' : 'labelTertiary'}
            >
              {timeframe}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}

const HiddenValue = () => <Asterisks color="labelTertiary" size={10} />;
type Amount = [value: string, symbol: string];
function BalanceValue({ balance, value }: { balance: Amount; value: Amount }) {
  const { hideAssetBalances } = useHideAssetBalancesStore();

  const color: TextProps['color'] = hideAssetBalances
    ? 'labelTertiary'
    : 'label';

  return (
    <Box display="flex" justifyContent="space-between" gap="10px">
      <Box display="flex" flexDirection="column" gap="12px">
        <Text size="12pt" weight="semibold" color="labelTertiary">
          Balance
        </Text>
        <Text size="14pt" weight="semibold" color={color}>
          <Inline alignVertical="center">
            {hideAssetBalances ? (
              <Asterisks color="labelTertiary" size={10} />
            ) : (
              balance[0]
            )}{' '}
            {balance[1]}
          </Inline>
        </Text>
      </Box>
      <Box display="flex" flexDirection="column" gap="12px">
        <Text size="12pt" weight="semibold" color="labelTertiary" align="right">
          Value
        </Text>
        <Text size="14pt" weight="semibold" color={color} align="right">
          <Inline alignVertical="center">
            {value[0]} {hideAssetBalances ? <HiddenValue /> : value[1]}
          </Inline>
        </Text>
      </Box>
    </Box>
  );
}

function SwapSend() {
  const navigate = useRainbowNavigate();
  const { setSelectedToken } = useSelectedTokenStore();
  const selectTokenAndNavigate = (to: To) => {
    setSelectedToken(usdc);
    navigate(to);
  };
  return (
    <Box display="flex" gap="8px">
      <Button
        height="32px"
        variant="flat"
        width="full"
        color="accent"
        symbol="arrow.triangle.swap"
        onClick={() => selectTokenAndNavigate(ROUTES.SWAP)}
      >
        Swap
      </Button>
      <Button
        height="32px"
        variant="flat"
        width="full"
        color="accent"
        symbol="paperplane.fill"
        onClick={() => selectTokenAndNavigate(ROUTES.SEND)}
      >
        Send
      </Button>
    </Box>
  );
}

function NetworkBanner({
  tokenSymbol,
  chainId,
}: {
  tokenSymbol: string;
  chainId: ChainId;
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      background="surfacePrimaryElevated"
      borderColor="separatorTertiary"
      borderWidth="1px"
      borderRadius="12px"
      padding="8px"
      gap="4px"
    >
      <ChainBadge chainId={chainId} size="14px" />
      <Text size="12pt" weight="semibold" color="labelSecondary">
        This {tokenSymbol} is on the {ChainNameDisplay[chainId]} network
      </Text>
      <Tooltip text="lalala" textSize="12pt">
        <Box style={{ marginLeft: 'auto', height: 14 }}>
          <Symbol
            symbol="info.circle.fill"
            color="labelTertiary"
            size={14}
            weight="semibold"
          />
        </Box>
      </Tooltip>
    </Box>
  );
}

function TokenPrice({ token }: { token: ParsedAddressAsset }) {
  const coinIconAsset = token;
  // CoinIcon displays a ChainBadge when chainId !== mainnet
  coinIconAsset.chainId = ChainId.mainnet;
  return (
    <Box display="flex" justifyContent="space-between" gap="10px">
      <CoinIcon asset={coinIconAsset} size={40} />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        gap="10px"
      >
        <Text size="16pt" weight="heavy">
          {token.native.price?.display}
        </Text>
        <Box style={{ maxWidth: '150px' }}>
          <TextOverflow
            color="accent"
            size="14pt"
            weight="heavy"
            // cursor="text"
          >
            {token.name}
          </TextOverflow>
        </Box>
      </Box>
    </Box>
  );
}

function TokenApprovals() {
  const approvals = [
    {
      icon: null,
      name: null,
      contract: '0x000…10E2',
      amount: Number.MAX_VALUE,
      moreInfoLink: 'https://etherscan.com',
    },
  ];
  return (
    <Box
      display="flex"
      flexDirection="column"
      padding="16px"
      gap="12px"
      background="surfaceSecondaryElevated"
      borderColor="separatorTertiary"
      borderRadius="16px"
      borderWidth="1px"
    >
      <Text color="label" size="14pt" weight="bold">
        Token Approvals
      </Text>
      <Separator color="separatorTertiary" />
      <Box display="flex" flexDirection="column" gap="20px">
        {approvals.map(({ icon, name, amount, contract }) => (
          <Box display="flex" justifyContent="space-between" key={contract}>
            <Inline alignVertical="center" space="4px">
              {icon || (
                <Symbol
                  size={15}
                  symbol="doc.plaintext"
                  weight="medium"
                  color="labelTertiary"
                />
              )}
              <Text color="labelTertiary" size="14pt" weight="semibold">
                {name || contract}
              </Text>
            </Inline>
            <Inline alignVertical="center" space="4px">
              <Text color="labelSecondary" size="12pt" weight="semibold">
                {amount === Number.MAX_VALUE ? 'Unlimited' : amount}
              </Text>
              <Symbol
                size={12}
                symbol="arrow.up.forward.circle"
                weight="medium"
                color="labelQuaternary"
              />
            </Inline>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

const InfoRow = ({
  symbol,
  label,
  value,
}: {
  symbol: SymbolName;
  label: ReactNode;
  value: ReactNode;
}) => (
  <Box display="flex" justifyContent="space-between">
    <Inline alignVertical="center" space="4px">
      <Symbol size={15} symbol={symbol} weight="medium" color="labelTertiary" />
      <Text color="labelTertiary" size="14pt" weight="semibold">
        {label}
      </Text>
    </Inline>
    <Text color="labelSecondary" size="12pt" weight="semibold">
      {value}
    </Text>
  </Box>
);

function About({ token }: { token: ParsedAddressAsset }) {
  return (
    <Accordion
      type="multiple"
      defaultValue={['about', 'supply', 'more info']}
      asChild
    >
      <Box display="flex" flexDirection="column" gap="20px">
        <AccordionItem value="about">
          <AccordionTrigger>About {usdc.name}</AccordionTrigger>
          <AccordionContent gap="20px">
            <div />
            <InfoRow
              symbol="dollarsign.square"
              label={'Price'}
              value={token.native.price?.display}
            />
            <InfoRow
              symbol="clock.arrow.circlepath"
              label={
                <Inline alignVertical="center" space="4px">
                  Volume
                  <Text color="labelQuaternary" size="14pt" weight="semibold">
                    (24H)
                  </Text>
                </Inline>
              }
              value={'$3.85 B'}
            />
            <InfoRow
              symbol="chart.line.uptrend.xyaxis"
              label={'All time high'}
              value={'$1.17'}
            />
            <InfoRow
              symbol="chart.line.uptrend.xyaxis"
              label={'All time low'}
              value={'$0.92'}
            />
            <Separator color="separatorTertiary" />
            <InfoRow
              symbol="chart.pie"
              label={
                <Inline alignVertical="center" space="4px">
                  Market Cap
                  <Symbol
                    symbol="info.circle"
                    color="labelQuaternary"
                    size={12}
                    weight="semibold"
                  />
                </Inline>
              }
              value={'$42.15 B'}
            />
            <InfoRow
              symbol="chart.pie"
              label={
                <Inline alignVertical="center" space="4px">
                  Fully Diluted
                  <Symbol
                    symbol="info.circle"
                    color="labelQuaternary"
                    size={12}
                    weight="semibold"
                  />
                </Inline>
              }
              value={'$39.22 B'}
            />
          </AccordionContent>
        </AccordionItem>

        <Separator color="separatorTertiary" />

        <AccordionItem value="supply">
          <AccordionTrigger>Supply</AccordionTrigger>
          <AccordionContent gap="20px">
            <div />
            <InfoRow
              symbol="chart.bar"
              label={'Max Total Supply'}
              value={'$1.00'}
            />
            <InfoRow symbol="person" label={'Holders'} value={'$1.00'} />
            <InfoRow
              symbol="arrow.triangle.swap"
              label={'Total Transfers'}
              value={'$1.00'}
            />
          </AccordionContent>
        </AccordionItem>

        <Separator color="separatorTertiary" />

        <AccordionItem value="more info">
          <AccordionTrigger>More Info</AccordionTrigger>
          <AccordionContent gap="20px">
            <div />
            <InfoRow
              symbol="info.circle"
              label={'Token Standard'}
              value={'ERC-20'}
            />
            <InfoRow
              symbol="doc.plaintext"
              label={'Token Contract'}
              value={
                <Inline alignVertical="center" space="4px">
                  {truncateAddress(token.address)}{' '}
                  <Symbol
                    size={14}
                    weight="semibold"
                    symbol="doc.on.doc"
                    color="labelQuaternary"
                  />
                </Inline>
              }
            />
            <InfoRow
              symbol="point.3.filled.connected.trianglepath.dotted"
              label={'Other Chains'}
              value={'aaaa'}
            />
          </AccordionContent>
        </AccordionItem>
      </Box>
    </Accordion>
  );
}

export function TokenDetails() {
  const { state } = useLocation();
  const asset = useUserAsset(state.uniqueId);

  if (!asset) throw '';

  // const asset = useUserAsset(usdc.uniqueId);
  return (
    <AccentColorProviderWrapper
      color={asset.colors?.primary || asset.colors?.fallback}
    >
      <Box
        display="flex"
        flexDirection="column"
        gap="16px"
        padding="20px"
        // background="surfaceSecondaryElevated"
        borderColor="separatorTertiary"
        borderWidth="1px"
        style={{ borderTop: 0, borderLeft: 0, borderRight: 0 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <TokenPrice token={asset} />
          <PriceChange value={asset.price?.relative_change_24h} />
        </Box>
        <Chart />
        <Separator color="separatorTertiary" />
        <BalanceValue
          balance={asset.balance.display.split(' ') as Amount}
          value={asset.native.balance.display.split(' ').reverse() as Amount}
        />
        <SwapSend />
        {asset.chainId !== ChainId.mainnet && (
          <NetworkBanner tokenSymbol={asset.symbol} chainId={asset.chainId} />
        )}
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        gap="24px"
        paddingHorizontal="20px"
        paddingVertical="24px"
      >
        <TokenApprovals />
        <Separator color="separatorTertiary" />
        <About token={asset} />
      </Box>
    </AccentColorProviderWrapper>
  );
}
