import React from 'react';

import { i18n } from '~/core/languages';
import { Box, Inline, Separator, Stack, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { TextLink } from '~/design-system/components/TextLink/TextLink';

export interface IconAndCopyItem {
  icon: {
    symbol: SymbolProps['symbol'];
    color: SymbolProps['color'];
  };
  copy: string;
  onClickLink?: () => void;
}

export function IconAndCopyList({
  iconAndCopyList,
}: {
  iconAndCopyList: IconAndCopyItem[];
}) {
  return (
    <Stack
      alignHorizontal="center"
      space="20px"
      separator={
        <Box style={{ width: '148px' }}>
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
      }
    >
      {iconAndCopyList?.map(({ icon, copy, onClickLink }) => (
        <Box key={icon?.symbol}>
          <Inline wrap={false} space="16px" alignVertical="center">
            <Box display="flex" alignItems="center">
              <Symbol
                symbol={icon.symbol}
                size={18}
                color={icon.color}
                weight="semibold"
              />
            </Box>
            <Text size="14pt" weight="medium" color="label">
              {copy}
              {onClickLink && (
                <TextLink color="blue" onClick={onClickLink}>
                  {i18n.t('link_text')}
                </TextLink>
              )}
            </Text>
          </Inline>
        </Box>
      ))}
    </Stack>
  );
}
