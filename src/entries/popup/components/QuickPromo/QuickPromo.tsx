import { CSSProperties } from 'react';

import { PromoTypes, useQuickPromoStore } from '~/core/state/quickPromo';
import {
  Box,
  ButtonSymbol,
  Column,
  Columns,
  Inline,
  Symbol,
  Text,
} from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

export const QuickPromo = ({
  textBold,
  text,
  style,
  symbol,
  symbolColor,
  promoType,
}: {
  textBold: string;
  text: string;
  style?: CSSProperties;
  symbol: SymbolProps['symbol'];
  symbolColor?: SymbolProps['color'];
  promoType: PromoTypes;
}) => {
  const { seenPromos, setSeenPromo } = useQuickPromoStore();

  const onClose = () => setSeenPromo(promoType);
  const hasSeenPromo = seenPromos[promoType];

  if (hasSeenPromo) return null;

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
        style={{ height: 36 }}
      >
        <Box width="full">
          <Columns alignHorizontal="justify" alignVertical="center" space="4px">
            <Inline space="4px" alignVertical="center">
              <Symbol
                size={12}
                weight="bold"
                color={symbolColor || 'blue'}
                symbol={symbol}
              />
              <Text color="label" size="12pt" weight="bold">
                {textBold}
              </Text>
              <Text color="labelSecondary" size="12pt" weight="semibold">
                {text}
              </Text>
            </Inline>
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
};
