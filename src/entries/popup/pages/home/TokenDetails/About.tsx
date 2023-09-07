import { useQuery } from '@tanstack/react-query';
import { ReactNode, useReducer } from 'react';
import { Address } from 'wagmi';

import { metadataClient } from '~/core/graphql';
import { AboutTokenQuery } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { createQueryKey } from '~/core/react-query';
import { ETH_ADDRESS } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { AddressOrEth, ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { formatCurrency } from '~/core/utils/formatNumber';
import { getTokenBlockExplorer } from '~/core/utils/transactions';
import { Box, Button, Inline, Separator, Symbol, Text } from '~/design-system';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/design-system/components/Accordion/Accordion';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';
import { SymbolName } from '~/design-system/styles/designTokens';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { ExplainerSheet } from '~/entries/popup/components/ExplainerSheet/ExplainerSheet';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';

export const CopyableValue = ({
  value,
  title,
  children,
}: {
  value: string;
  title: string;
  children: string;
}) => (
  <Box
    onClick={() => {
      navigator.clipboard.writeText(value);
      triggerToast({ title, description: children });
    }}
    display="flex"
    alignItems="center"
    gap="4px"
  >
    {children}{' '}
    <Symbol
      size={14}
      weight="semibold"
      symbol="doc.on.doc"
      color="labelQuaternary"
    />
  </Box>
);

export const InfoRow = ({
  symbol,
  label,
  value,
}: {
  symbol: SymbolName;
  label: ReactNode;
  value: ReactNode;
}) => (
  <Box display="flex" alignItems="center" justifyContent="space-between">
    <Inline alignVertical="center" space="12px">
      <Symbol size={14} symbol={symbol} weight="medium" color="labelTertiary" />
      <Text color="labelTertiary" size="12pt" weight="semibold">
        {label}
      </Text>
    </Inline>
    <Text
      color="labelSecondary"
      size="12pt"
      weight="semibold"
      cursor="text"
      userSelect="all"
    >
      {value}
    </Text>
  </Box>
);

const parseTokenInfo = (token: AboutTokenQuery['token']) => {
  if (!token) return token;
  const format = (n?: number | string | null) =>
    formatCurrency(n || 0, {
      notation: 'compact',
      maximumSignificantDigits: 4,
    });
  return {
    allTime: {
      high: format(token.allTime.highValue),
      low: format(token.allTime.lowValue),
    },
    circulatingSupply: format(token.circulatingSupply),
    fullyDilutedValuation: format(token.fullyDilutedValuation),
    marketCap: format(token.marketCap),
    totalSupply: format(token.totalSupply),
    volume1d: format(token.volume1d),
    networks: Object.entries(token.networks).map(([chainId, network]) => ({
      chainId: +chainId as ChainId,
      ...(network as { address: Address; decimals: number }),
    })),
    description: token.description,
    links: token.links,
  };
};
const useTokenInfo = ({
  address,
  chainId,
}: {
  address: AddressOrEth;
  chainId: ChainId;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const args = { address, chainId, currency: currentCurrency };
  return useQuery({
    queryFn: () =>
      metadataClient.aboutToken(args).then((d) => parseTokenInfo(d.token)),
    queryKey: createQueryKey('token about info', args),
  });
};

function MarketCapInfoRow({ marketCap }: { marketCap: ReactNode }) {
  const [isMarketCapExplainerOpen, toggleMarketCapExplainer] = useReducer(
    (s) => !s,
    false,
  );
  return (
    <>
      <InfoRow
        symbol="chart.pie"
        label={
          <Box
            display="flex"
            alignItems="center"
            gap="4px"
            onClick={toggleMarketCapExplainer}
          >
            {i18n.t(`token_details.about.market_cap`)}
            <Symbol
              symbol="info.circle"
              color="labelQuaternary"
              size={12}
              weight="semibold"
            />
          </Box>
        }
        value={marketCap}
      />
      <ExplainerSheet
        show={isMarketCapExplainerOpen}
        title={i18n.t('token_details.about.market_cap_explainer.title')}
        description={[
          i18n.t('token_details.about.market_cap_explainer.description'),
        ]}
        onClickOutside={toggleMarketCapExplainer}
        actionButton={{
          label: i18n.t('token_details.about.market_cap_explainer.action'),
          variant: 'tinted',
          labelColor: 'blue',
          action: toggleMarketCapExplainer,
        }}
        header={{ emoji: '📈' }}
      />
    </>
  );
}

function FullyDilutedInfoRow({ fullyDiluted }: { fullyDiluted: ReactNode }) {
  const [isFullyDilutedExplainerOpen, toggleFullyDilutedExplainer] = useReducer(
    (s) => !s,
    false,
  );

  return (
    <>
      <InfoRow
        symbol="chart.pie"
        label={
          <Box
            display="flex"
            alignItems="center"
            gap="4px"
            onClick={toggleFullyDilutedExplainer}
          >
            {i18n.t(`token_details.about.fully_diluted`)}
            <Symbol
              symbol="info.circle"
              color="labelQuaternary"
              size={12}
              weight="semibold"
            />
          </Box>
        }
        value={fullyDiluted}
      />
      <ExplainerSheet
        show={isFullyDilutedExplainerOpen}
        title={i18n.t('token_details.about.fully_diluted_explainer.title')}
        description={[
          i18n.t('token_details.about.fully_diluted_explainer.description'),
        ]}
        onClickOutside={toggleFullyDilutedExplainer}
        actionButton={{
          label: i18n.t('token_details.about.fully_diluted_explainer.action'),
          variant: 'tinted',
          labelColor: 'blue',
          action: toggleFullyDilutedExplainer,
        }}
        header={{ emoji: '📊' }}
      />
    </>
  );
}

const placeholder = <Skeleton width="40px" height="12px" />;
export function About({ token }: { token: ParsedUserAsset }) {
  const { data } = useTokenInfo(token);

  const {
    volume1d = placeholder,
    allTime = { high: placeholder, low: placeholder },
    fullyDilutedValuation = placeholder,
    marketCap = placeholder,
    networks = [token],
    totalSupply = placeholder,
    description = '',
    links = {},
  } = data || {};

  const explorer = getTokenBlockExplorer(token);

  const isEth = [token.address, token.mainnetAddress].includes(ETH_ADDRESS);

  return (
    <Accordion
      type="multiple"
      defaultValue={['about', 'supply', 'more info']}
      asChild
    >
      <Box display="flex" flexDirection="column" gap="20px">
        <AccordionItem value="about">
          <AccordionTrigger>
            {i18n.t(`token_details.about.about_token`, { name: token.name })}
          </AccordionTrigger>
          <AccordionContent gap="20px">
            <div />
            <InfoRow
              symbol="dollarsign.square"
              label={i18n.t(`token_details.about.price`)}
              value={formatCurrency(token.native.price?.amount)}
            />
            <InfoRow
              symbol="clock.arrow.circlepath"
              label={
                <Inline alignVertical="center" space="4px">
                  {i18n.t(`token_details.about.volume`)}
                  <Text color="labelQuaternary" size="14pt" weight="semibold">
                    (24H)
                  </Text>
                </Inline>
              }
              value={volume1d}
            />
            <InfoRow
              symbol="chart.line.uptrend.xyaxis"
              label={i18n.t(`token_details.about.ath`)}
              value={allTime.high}
            />
            <InfoRow
              symbol="chart.line.uptrend.xyaxis"
              label={i18n.t(`token_details.about.atl`)}
              value={allTime.low}
            />
            <Separator color="separatorTertiary" />
            <MarketCapInfoRow marketCap={marketCap} />
            <FullyDilutedInfoRow fullyDiluted={fullyDilutedValuation} />
          </AccordionContent>
        </AccordionItem>

        <Separator color="separatorTertiary" />

        <AccordionItem value="supply">
          <AccordionTrigger>
            {i18n.t(`token_details.about.supply`)}
          </AccordionTrigger>
          <AccordionContent gap="20px">
            <div />
            <InfoRow
              symbol="chart.bar"
              label={i18n.t(`token_details.about.max_total_supply`)}
              value={totalSupply}
            />
            {/* <InfoRow symbol="person" label={'Holders'} value={'---'} />
            <InfoRow
              symbol="arrow.triangle.swap"
              label={i18n.t(`token_details.about.total_transfers`)}
              value={'---'}
            /> */}
          </AccordionContent>
        </AccordionItem>

        <Separator color="separatorTertiary" />

        <AccordionItem value="more info">
          <AccordionTrigger>
            {i18n.t(`token_details.about.more_info`)}
          </AccordionTrigger>
          <AccordionContent
            gap="20px"
            paddingHorizontal="20px"
            marginHorizontal="-20px"
          >
            <div />
            {!isEth && (
              <>
                <InfoRow
                  symbol="info.circle"
                  label={i18n.t(`token_details.about.token_standard`)}
                  value={'ERC-20'}
                />
                <InfoRow
                  symbol="doc.plaintext"
                  label={i18n.t(`token_details.about.token_contract`)}
                  value={
                    <CopyableValue
                      title={i18n.t('wallet_header.copy_toast')}
                      value={token.address}
                    >
                      {truncateAddress(token.address)}
                    </CopyableValue>
                  }
                />
              </>
            )}
            <InfoRow
              symbol="point.3.filled.connected.trianglepath.dotted"
              label={i18n.t(`token_details.about.chains`, {
                count: networks.length,
              })}
              value={
                networks && (
                  <Inline alignVertical="center" space="2px">
                    {networks.map(({ chainId }) => (
                      <ChainBadge key={chainId} chainId={chainId} size="14" />
                    ))}
                  </Inline>
                )
              }
            />

            <Separator color="separatorTertiary" />

            <Text weight="regular" size="14pt" color="labelTertiary">
              {description}
            </Text>

            {links && (
              <Inline alignVertical="center" space="8px">
                {links.homepage && (
                  <Button
                    symbol="safari"
                    onClick={() => window.open(links.homepage?.url, '_blank')}
                    height="32px"
                    variant="tinted"
                    color="accent"
                  >
                    Homepage
                  </Button>
                )}
                {token.address && (
                  <Button
                    symbol="link"
                    onClick={() => window.open(explorer.url, '_blank')}
                    height="32px"
                    variant="tinted"
                    color="accent"
                  >
                    {explorer.name}
                  </Button>
                )}
              </Inline>
            )}
          </AccordionContent>
        </AccordionItem>
      </Box>
    </Accordion>
  );
}
