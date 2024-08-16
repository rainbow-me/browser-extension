import { CSSProperties } from 'react';

import { PromoTypes, useQuickPromoStore } from '~/core/state/quickPromo';
import {
  Box,
  ButtonSymbol,
  Column,
  Columns,
  Symbol,
  textStyles,
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
        paddingTop="10px"
        paddingBottom="10px"
      >
        <Box width="full">
          <Columns alignHorizontal="justify" alignVertical="center" space="4px">
            <Column width="content">
              <Symbol
                size={12}
                weight="bold"
                color={symbolColor || 'blue'}
                symbol={symbol}
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
};
