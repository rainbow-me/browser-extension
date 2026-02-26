import { CSSProperties, KeyboardEvent } from 'react';

import rnbwBg from 'static/assets/rewards/rnbw-bg.png';
import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { i18n } from '~/core/languages';
import { PromoType, useQuickPromoStore } from '~/core/state/quickPromo';
import { goToNewTab } from '~/core/utils/tabs';
import {
  Box,
  ButtonSymbol,
  Column,
  Columns,
  Inline,
  Symbol,
  Text,
  textStyles,
} from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { RNBWCoinIcon } from '~/entries/popup/pages/home/Rewards/RNBWCoinIcon';

import { ChevronRight } from '../ChevronRight';

const DOWNLOAD_URL =
  'https://rainbow.me/download?utm_source=bx&utm_campaign=rnbw_airdrop_banner';

type PromoVariant = 'simple' | 'card';

interface PromoConfigItem {
  variant: PromoVariant;
  symbolName: SymbolProps['symbol'];
  symbolColor?: SymbolProps['color'];
  titleKey?: string;
  subtitleKey?: string;
  textBoldKey?: string;
  textKey?: string;
}

const promoConfig: Record<PromoType, PromoConfigItem> = {
  airdrop_banner: {
    variant: 'card',
    symbolName: 'gift',
    symbolColor: 'yellow',
    titleKey: 'promo.airdrop_banner.title',
    subtitleKey: 'promo.airdrop_banner.subtitle',
  },
  command_k: {
    variant: 'simple',
    symbolName: 'sparkle',
    symbolColor: 'accent',
    textBoldKey: 'command_k.quick_promo.text_bold',
    textKey: 'command_k.quick_promo.text',
  },
  wallet_switcher: {
    variant: 'simple',
    symbolName: 'person',
    symbolColor: 'accent',
    textBoldKey: 'wallet_switcher.quick_promo.text_bold',
    textKey: 'wallet_switcher.quick_promo.text',
  },
  network_settings: {
    variant: 'simple',
    symbolName: 'network',
    symbolColor: 'accent',
    textBoldKey: 'settings.networks.quick_promo.text_bold',
    textKey: 'settings.networks.quick_promo.text',
  },
  degen_mode: {
    variant: 'simple',
    symbolName: 'flame',
    symbolColor: 'orange',
    textBoldKey: 'degen_mode.quick_promo.text_bold',
    textKey: 'degen_mode.quick_promo.text',
  },
};

// Card variant for prominent promos like airdrop
function CardPromo({
  promoType,
  onClose,
}: {
  promoType: PromoType;
  onClose: () => void;
}) {
  const configItem = promoConfig[promoType];

  const handleClick = () => {
    if (promoType === 'airdrop_banner') {
      goToNewTab({ url: DOWNLOAD_URL });
      analytics.track(event.rnbwRewardsBannerClicked);
      return;
    }
    onClose();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  // Airdrop banner has custom styling
  if (promoType === 'airdrop_banner') {
    return (
      <Box
        as="div"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        borderRadius="16px"
        padding="16px"
        width="full"
        position="relative"
        style={{
          cursor: 'pointer',
          textAlign: 'left',
          backgroundImage: `url(${rnbwBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Close button - top right */}
        <Box position="absolute" style={{ top: 8, right: 8, zIndex: 1 }}>
          <ButtonSymbol
            color="labelTertiary"
            height="24px"
            variant="transparent"
            symbol="xmark.circle.fill"
            symbolSize={18}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
        </Box>

        <Columns alignVertical="center" space="12px">
          <Column width="content">
            <Box style={{ cursor: 'pointer' }}>
              <RNBWCoinIcon size={42} />
            </Box>
          </Column>
          <Column>
            <Box style={{ paddingRight: 24, cursor: 'pointer' }}>
              <Inline alignVertical="center" space="4px">
                <Text size="15pt" weight="heavy" color="label" cursor="pointer">
                  {i18n.t(configItem.titleKey || '')}
                </Text>
                <ChevronRight height={12} width={6} color="labelTertiary" />
              </Inline>
              {configItem.subtitleKey && (
                <Box style={{ marginTop: 8, whiteSpace: 'pre-line' }}>
                  <Text
                    size="11pt"
                    weight="medium"
                    color="labelSecondary"
                    cursor="pointer"
                  >
                    {i18n.t(configItem.subtitleKey)}
                  </Text>
                </Box>
              )}
            </Box>
          </Column>
        </Columns>
      </Box>
    );
  }

  // Default card variant for other promos
  return (
    <Box
      as="div"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      background="surfaceSecondaryElevated"
      borderRadius="16px"
      padding="16px"
      width="full"
      boxShadow="12px"
      style={{ cursor: 'pointer', textAlign: 'left' }}
    >
      <Columns alignVertical="center" space="12px">
        <Column width="content">
          <Box
            alignItems="center"
            background="fillSecondary"
            borderRadius="round"
            display="flex"
            justifyContent="center"
            style={{ width: 36, height: 36 }}
          >
            <Symbol
              size={18}
              weight="bold"
              color={configItem.symbolColor || 'accent'}
              symbol={configItem.symbolName}
            />
          </Box>
        </Column>
        <Column>
          <Box>
            {configItem.titleKey && (
              <Text size="14pt" weight="bold" color="label">
                {i18n.t(configItem.titleKey)}
              </Text>
            )}
            {configItem.subtitleKey && (
              <Text size="12pt" weight="medium" color="labelSecondary">
                {i18n.t(configItem.subtitleKey)}
              </Text>
            )}
          </Box>
        </Column>
        <Column width="content">
          <Inline alignVertical="center" space="8px">
            <Symbol
              size={14}
              weight="semibold"
              color="labelTertiary"
              symbol="chevron.right"
            />
            <ButtonSymbol
              color="labelTertiary"
              height="24px"
              variant="transparent"
              symbol="xmark.circle.fill"
              symbolSize={16}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            />
          </Inline>
        </Column>
      </Columns>
    </Box>
  );
}

// Simple inline variant for existing promos
function SimplePromo({
  promoType,
  onClose,
  style,
  textOverride,
  textBoldOverride,
}: {
  promoType: PromoType;
  onClose: () => void;
  style?: CSSProperties;
  textOverride?: string;
  textBoldOverride?: string;
}) {
  const configItem = promoConfig[promoType];
  const textBold =
    textBoldOverride ||
    (configItem.textBoldKey ? i18n.t(configItem.textBoldKey) : '');
  const text =
    textOverride || (configItem.textKey ? i18n.t(configItem.textKey) : '');

  return (
    <Box style={style}>
      <Box
        alignItems="center"
        background="fillTertiary"
        display="flex"
        paddingLeft="12px"
        paddingRight="6px"
        paddingVertical="10px"
        borderRadius="round"
        boxShadow="12px"
        paddingTop="10px"
        paddingBottom="10px"
        style={{ cursor: 'default' }}
      >
        <Box width="full">
          <Columns alignHorizontal="justify" alignVertical="center" space="4px">
            <Column width="content">
              <Symbol
                size={12}
                weight="bold"
                color={configItem.symbolColor || 'blue'}
                symbol={configItem.symbolName}
              />
            </Column>

            <Box
              className={textStyles({
                fontSize: '12pt',
                fontFamily: 'rounded',
              })}
            >
              <Box
                as="span"
                className={textStyles({
                  fontWeight: 'bold',
                  color: 'label',
                })}
              >
                {textBold}
              </Box>
              &nbsp;
              <Box
                as="span"
                className={textStyles({
                  fontWeight: 'semibold',
                  color: 'labelSecondary',
                })}
              >
                {text}
              </Box>
            </Box>
            <Column width="content">
              <Box marginVertical="-4px">
                <ButtonSymbol
                  color="labelTertiary"
                  height="24px"
                  variant="transparent"
                  symbol="xmark.circle.fill"
                  symbolSize={14}
                  onClick={onClose}
                />
              </Box>
            </Column>
          </Columns>
        </Box>
      </Box>
    </Box>
  );
}

// Legacy props interface for backwards compatibility
interface LegacyQuickPromoProps {
  textBold?: string;
  text?: string;
  style?: CSSProperties;
  symbol?: SymbolProps['symbol'];
  symbolColor?: SymbolProps['color'];
  promoType: PromoType;
}

export const QuickPromo = ({
  textBold,
  text,
  style,
  promoType,
}: LegacyQuickPromoProps) => {
  const { setSeenPromo } = useQuickPromoStore();
  const onClose = () => setSeenPromo(promoType);
  const configItem = promoConfig[promoType];

  if (configItem.variant === 'card') {
    return <CardPromo promoType={promoType} onClose={onClose} />;
  }

  return (
    <SimplePromo
      promoType={promoType}
      onClose={onClose}
      style={style}
      textOverride={text}
      textBoldOverride={textBold}
    />
  );
};
