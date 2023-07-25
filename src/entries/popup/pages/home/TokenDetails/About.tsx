import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { Address } from 'wagmi';

import { metadataClient } from '~/core/graphql';
import { AboutTokenQuery } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { createQueryKey } from '~/core/react-query';
import { ETH_ADDRESS, SupportedCurrencyKey } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { Box, Inline, Separator, Symbol, Text } from '~/design-system';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/design-system/components/Accordion/Accordion';
import { SymbolName } from '~/design-system/styles/designTokens';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';

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
    <Inline alignVertical="center">
      <Text
        color="labelSecondary"
        size="12pt"
        weight="semibold"
        cursor="text"
        userSelect="all"
      >
        {value}
      </Text>
    </Inline>
  </Box>
);

const createCurrencyFormatter = ({ currency = 'USD' }) => {
  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    maximumSignificantDigits: 3,
    notation: 'compact',
  });
  return (n?: number | null) => (n ? formatter.format(n) : n);
};

const parseTokenInfo = (
  currency: SupportedCurrencyKey,
  token: AboutTokenQuery['token'],
) => {
  const f = createCurrencyFormatter({ currency });
  if (!token) return token;
  return {
    allTime: {
      high: f(token.allTime.highValue),
      low: f(token.allTime.lowValue),
    },
    circulatingSupply: f(token.circulatingSupply),
    fullyDilutedValuation: f(token.fullyDilutedValuation),
    marketCap: f(token.marketCap),
    totalSupply: f(token.totalSupply),
    volume1d: f(token.volume1d),
    networks: token.networks as Record<
      ChainId,
      { address: Address; decimals: number }
    >,
  };
};
const useTokenAboutInfo = ({
  address,
  chainId,
}: {
  address: Address | typeof ETH_ADDRESS;
  chainId: ChainId;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const args = { address, chainId, currency: currentCurrency };
  return useQuery({
    queryFn: () =>
      metadataClient
        .aboutToken(args)
        .then((d) => parseTokenInfo(currentCurrency, d.token)),
    queryKey: createQueryKey('token about info', args),
  });
};

export function About({ token }: { token: ParsedAddressAsset }) {
  const { data } = useTokenAboutInfo(token);

  if (!data) return null; // skeleton

  const {
    volume1d,
    allTime,
    // circulatingSupply,
    fullyDilutedValuation,
    marketCap,
    networks,
    totalSupply,
  } = data;

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
              value={token.native.price?.display}
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
            <InfoRow
              symbol="chart.pie"
              label={
                <Inline alignVertical="center" space="4px">
                  {i18n.t(`token_details.about.market_cap`)}
                  <Symbol
                    symbol="info.circle"
                    color="labelQuaternary"
                    size={12}
                    weight="semibold"
                  />
                </Inline>
              }
              value={marketCap}
            />
            <InfoRow
              symbol="chart.pie"
              label={
                <Inline alignVertical="center" space="4px">
                  {i18n.t(`token_details.about.fully_diluted`)}
                  <Symbol
                    symbol="info.circle"
                    color="labelQuaternary"
                    size={12}
                    weight="semibold"
                  />
                </Inline>
              }
              value={fullyDilutedValuation}
            />
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
            <InfoRow symbol="person" label={'Holders'} value={'---'} />
            <InfoRow
              symbol="arrow.triangle.swap"
              label={i18n.t(`token_details.about.total_transfers`)}
              value={'---'}
            />
          </AccordionContent>
        </AccordionItem>

        {token.address !== ETH_ADDRESS && (
          <>
            <Separator color="separatorTertiary" />

            <AccordionItem value="more info">
              <AccordionTrigger>
                {i18n.t(`token_details.about.more_info`)}
              </AccordionTrigger>
              <AccordionContent gap="20px">
                <div />
                <InfoRow
                  symbol="info.circle"
                  label={i18n.t(`token_details.about.token_standard`)}
                  value={'ERC-20'}
                />
                <InfoRow
                  symbol="doc.plaintext"
                  label={i18n.t(`token_details.about.token_contract`)}
                  value={
                    <Box
                      onClick={() => {
                        navigator.clipboard.writeText(token.address);
                        triggerToast({
                          title: i18n.t('wallet_header.copy_toast'),
                          description: truncateAddress(token.address),
                        });
                      }}
                    >
                      <Inline alignVertical="center" space="4px">
                        {truncateAddress(token.address)}{' '}
                        <Symbol
                          size={14}
                          weight="semibold"
                          symbol="doc.on.doc"
                          color="labelQuaternary"
                        />
                      </Inline>
                    </Box>
                  }
                />
                <InfoRow
                  symbol="point.3.filled.connected.trianglepath.dotted"
                  label={i18n.t(`token_details.about.other_chains`)}
                  value={
                    networks && (
                      <Inline alignVertical="center" space="2px">
                        {Object.keys(networks).map((chainId) => (
                          <ChainBadge
                            key={chainId}
                            chainId={+chainId as ChainId}
                            size="14px"
                          />
                        ))}
                      </Inline>
                    )
                  }
                />
              </AccordionContent>
            </AccordionItem>
          </>
        )}
      </Box>
    </Accordion>
  );
}
