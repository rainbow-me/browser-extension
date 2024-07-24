import clsx from 'clsx';
import { ReactNode, useState } from 'react';

import { i18n } from '~/core/languages';
import { ParsedUserAsset } from '~/core/types/assets';
import { SearchAsset } from '~/core/types/search';
import { truncateAddress } from '~/core/utils/address';
import { isNativeAsset } from '~/core/utils/chains';
import { formatCurrency } from '~/core/utils/formatNumber';
import { getTokenBlockExplorer } from '~/core/utils/transactions';
import {
  Box,
  Button,
  Inline,
  Separator,
  Symbol,
  Text,
  TextOverflow,
  textStyles,
} from '~/design-system';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/design-system/components/Accordion/Accordion';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';
import { TextStyles } from '~/design-system/styles/core.css';
import { SymbolName } from '~/design-system/styles/designTokens';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { ExplainerSheet } from '~/entries/popup/components/ExplainerSheet/ExplainerSheet';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import chunkLinks from '~/entries/popup/utils/chunkLinks';

import { ParsedTokenInfo } from './useTokenInfo';

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
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    gap="4px"
  >
    <Inline alignVertical="center" space="12px" wrap={false}>
      <Symbol size={14} symbol={symbol} weight="medium" color="labelTertiary" />
      <Text color="labelTertiary" size="12pt" weight="semibold">
        {label}
      </Text>
    </Inline>
    <TextOverflow
      color="labelSecondary"
      size="12pt"
      weight="semibold"
      cursor="text"
      userSelect="all"
    >
      {value}
    </TextOverflow>
  </Box>
);

function MarketCapInfoRow({ marketCap }: { marketCap: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <InfoRow
        symbol="chart.pie"
        label={
          <Box
            display="flex"
            alignItems="center"
            gap="4px"
            onClick={() => setIsOpen(true)}
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
        show={isOpen}
        title={i18n.t('token_details.about.market_cap_explainer.title')}
        description={[
          i18n.t('token_details.about.market_cap_explainer.description'),
        ]}
        onClickOutside={() => setIsOpen(false)}
        actionButton={{
          label: i18n.t('token_details.about.market_cap_explainer.action'),
          variant: 'tinted',
          labelColor: 'blue',
          action: () => setIsOpen(false),
        }}
        header={{ emoji: '📈' }}
      />
    </>
  );
}

function FullyDilutedInfoRow({ fullyDiluted }: { fullyDiluted: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <InfoRow
        symbol="chart.pie"
        label={
          <Box
            display="flex"
            alignItems="center"
            gap="4px"
            onClick={() => setIsOpen(true)}
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
        show={isOpen}
        title={i18n.t('token_details.about.fully_diluted_explainer.title')}
        description={[
          i18n.t('token_details.about.fully_diluted_explainer.description'),
        ]}
        onClickOutside={() => setIsOpen(false)}
        actionButton={{
          label: i18n.t('token_details.about.fully_diluted_explainer.action'),
          variant: 'tinted',
          labelColor: 'blue',
          action: () => setIsOpen(false),
        }}
        header={{ emoji: '📊' }}
      />
    </>
  );
}

const LinkInline = ({
  children,
  color,
  weight,
  href,
}: {
  children: ReactNode;
  color?: TextStyles['color'];
  highlight?: boolean;
  weight?: TextStyles['fontWeight'];
  href: string;
}) => (
  <Box
    rel="noopener noreferrer"
    target="_blank"
    href={href}
    as="a"
    className={clsx([textStyles({ color, fontWeight: weight })])}
  >
    {children}
  </Box>
);

function Description({ text = '' }: { text?: string | null }) {
  if (!text) return null;
  const chunks = chunkLinks(text);
  return (
    <Text
      color="labelTertiary"
      size="14pt"
      weight="regular"
      cursor="text"
      userSelect="text"
    >
      {chunks.map((chunk, i) => {
        if (chunk.type === 'text') {
          return chunk.value;
        } else if (chunk.href) {
          return (
            <LinkInline key={i} href={chunk.href} color="accent">
              {chunk.value}
            </LinkInline>
          );
        }
      })}
    </Text>
  );
}

const placeholder = <Skeleton width="40px" height="12px" />;
export function About({
  token,
  tokenInfo,
}: {
  token: ParsedUserAsset | SearchAsset;
  tokenInfo: ParsedTokenInfo;
}) {
  const {
    volume1d = placeholder,
    allTime = { high: placeholder, low: placeholder },
    fullyDilutedValuation = placeholder,
    marketCap = placeholder,
    networks = [token],
    totalSupply = placeholder,
    description = '',
    links = {},
  } = tokenInfo || {};

  const explorer = getTokenBlockExplorer(token);

  return (
    <Accordion
      type="multiple"
      defaultValue={['about', 'supply', 'more info']}
      asChild
    >
      <Box display="flex" flexDirection="column" gap="20px">
        <AccordionItem value="about">
          <AccordionTrigger testId={`about-${token.address}`}>
            {i18n.t(`token_details.about.about_token`, { name: token.name })}
          </AccordionTrigger>
          <AccordionContent gap="20px">
            <div />
            <InfoRow
              symbol="dollarsign.square"
              label={i18n.t(`token_details.about.price`)}
              value={formatCurrency(
                'native' in token
                  ? token.native.price?.amount
                  : tokenInfo?.price?.value ?? undefined,
              )}
            />
            <InfoRow
              symbol="clock.arrow.circlepath"
              label={
                <Inline alignVertical="center" space="4px">
                  {i18n.t(`token_details.about.volume`)}
                  <Text color="labelQuaternary" size="12pt" weight="semibold">
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
            {!isNativeAsset(token.address, token.chainId) && (
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
            <Description text={description} />

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
                {explorer && (
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
