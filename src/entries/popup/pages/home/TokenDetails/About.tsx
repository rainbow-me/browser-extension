import { ReactNode } from 'react';

import { i18n } from '~/core/languages';
import { ParsedAddressAsset } from '~/core/types/assets';
import { truncateAddress } from '~/core/utils/address';
import { Box, Inline, Separator, Symbol, Text } from '~/design-system';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/design-system/components/Accordion/Accordion';
import { SymbolName } from '~/design-system/styles/designTokens';

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

export function About({ token }: { token: ParsedAddressAsset }) {
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
              value={'$3.85 B'}
            />
            <InfoRow
              symbol="chart.line.uptrend.xyaxis"
              label={i18n.t(`token_details.about.ath`)}
              value={'$1.17'}
            />
            <InfoRow
              symbol="chart.line.uptrend.xyaxis"
              label={i18n.t(`token_details.about.atl`)}
              value={'$0.92'}
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
              value={'$42.15 B'}
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
              value={'$39.22 B'}
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
              value={'$1.00'}
            />
            <InfoRow symbol="person" label={'Holders'} value={'$1.00'} />
            <InfoRow
              symbol="arrow.triangle.swap"
              label={i18n.t(`token_details.about.total_transfers`)}
              value={'$1.00'}
            />
          </AccordionContent>
        </AccordionItem>

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
              label={i18n.t(`token_details.about.other_chains`)}
              value={'aaaa'}
            />
          </AccordionContent>
        </AccordionItem>
      </Box>
    </Accordion>
  );
}
