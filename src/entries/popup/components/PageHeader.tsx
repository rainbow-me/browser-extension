import * as React from 'react';
import { Link } from 'react-router-dom';

import { Box, Inline, Text } from '~/design-system';

import { SFSymbol, Symbols } from './SFSymbol/SFSymbol';

interface PageHeaderProps {
  title: string;
  leftRoute?: string;
  rightRoute?: string;
  leftSymbol?: Symbols;
  rightSymbol?: Symbols;
  mainPage?: boolean;
}

const HeaderActionButton = ({
  symbol,
  mainPage,
}: {
  symbol?: Symbols;
  mainPage: boolean;
}) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    mainPage && symbol ? (
      <Box
        style={{
          height: '32px',
          width: '32px',
        }}
        background="surfaceSecondaryElevated"
        borderRadius="round"
        boxShadow="30px accent"
        borderColor="buttonStroke"
        borderWidth="1px"
      >
        {children}
      </Box>
    ) : (
      <Box
        style={{
          height: '32px',
          width: '32px',
        }}
      >
        {children}
      </Box>
    );

  return (
    <Wrapper>
      <Inline
        space="4px"
        height="full"
        alignHorizontal="center"
        alignVertical="center"
      >
        <Inline alignHorizontal="center" alignVertical="center">
          {symbol ? <SFSymbol symbol={symbol} size={14} /> : null}
        </Inline>
      </Inline>
    </Wrapper>
  );
};

export function PageHeader({
  title,
  leftRoute,
  rightRoute,
  leftSymbol,
  rightSymbol,
  mainPage = false,
}: PageHeaderProps) {
  return (
    <Box
      style={{
        height: '62px',
      }}
      paddingHorizontal="10px"
    >
      <Inline alignVertical="center" height="full" alignHorizontal="justify">
        <Link to={leftRoute || ''}>
          <HeaderActionButton symbol={leftSymbol} mainPage={mainPage} />
        </Link>

        <Box>
          <Text size="14pt" weight="heavy">
            {title}
          </Text>
        </Box>

        <Link to={rightRoute || ''}>
          <HeaderActionButton symbol={rightSymbol} mainPage={mainPage} />
        </Link>
      </Inline>
    </Box>
  );
}
