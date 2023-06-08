import { PromoTypes, useQuickPromoStore } from '~/core/state/quickPromo';
import { Box, ButtonSymbol, Inline, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

export const QuickPromo = ({
  textBold,
  text,
  symbol,
  promoType,
}: {
  textBold: string;
  text: string;
  symbol: SymbolProps['symbol'];
  promoType: PromoTypes;
}) => {
  const { seenPromos, setSeenPromo } = useQuickPromoStore();

  const onClose = () => setSeenPromo(promoType);
  const hasSeenPromo = seenPromos[promoType];

  if (hasSeenPromo) return null;

  return (
    <Box
      background="fillSecondary"
      paddingVertical="10px"
      paddingHorizontal="12px"
      borderRadius="20px"
    >
      <Inline alignHorizontal="justify">
        <Inline alignVertical="center" space="6px">
          <Inline alignVertical="center" space="4px">
            <Symbol size={12} weight="bold" color="label" symbol={symbol} />
            <Text color="label" size="12pt" weight="semibold">
              {textBold}
            </Text>
          </Inline>
          <Text color="labelSecondary" size="12pt" weight="semibold">
            {text}
          </Text>
        </Inline>
        <Box marginVertical="-4px">
          <ButtonSymbol
            color="labelQuaternary"
            height="24px"
            variant="transparent"
            symbol="xmark.circle.fill"
            onClick={onClose}
          />
        </Box>
      </Inline>
    </Box>
  );
};
