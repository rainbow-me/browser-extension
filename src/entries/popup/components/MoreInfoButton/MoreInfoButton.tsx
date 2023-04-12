import React, { ReactNode } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import {
  Box,
  ButtonSymbol,
  Inline,
  Row,
  Rows,
  Symbol,
  Text,
} from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { TextStyles } from '~/design-system/styles/core.css';

import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';

export interface MoreInfoOption {
  label: string;
  subLabel?: string;
  symbol: SymbolProps['symbol'];
  separator?: boolean;
  onSelect: () => void;
  color?: TextStyles['color'];
}

interface MoreInfoButtonProps {
  options: MoreInfoOption[];
  open?: boolean;
  controlled?: boolean;
  onClose?: () => void;
}

const MoreInfoButton = ({
  controlled,
  onClose,
  open,
  options,
}: MoreInfoButtonProps) => {
  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        e.preventDefault();
        onClose?.();
      }
    },
  });
  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <MoreInfoMenuContainer open={open} controlled={controlled}>
        <DropdownMenuTrigger asChild>
          <Box style={{ cursor: 'default' }}>
            <ButtonSymbol
              color="labelTertiary"
              height="32px"
              variant="transparentHover"
              symbol="ellipsis.circle"
            />
          </Box>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onPointerDownOutside={() => {
            if (controlled) {
              onClose?.();
            }
          }}
          align="end"
        >
          {options.map((option) => (
            <Box key={option.symbol}>
              <DropdownMenuItem onSelect={option.onSelect}>
                <Inline alignVertical="center" space="10px" wrap={false}>
                  <Symbol
                    size={18}
                    symbol={option.symbol}
                    weight="semibold"
                    color={option.color}
                  />
                  <Rows space="6px">
                    <Row>
                      <Text size="14pt" weight="semibold" color={option.color}>
                        {option.label}
                      </Text>
                    </Row>

                    {option.subLabel && (
                      <Row>
                        <Text
                          size="12pt"
                          color="labelTertiary"
                          weight="regular"
                        >
                          {option.subLabel}
                        </Text>
                      </Row>
                    )}
                  </Rows>
                </Inline>
              </DropdownMenuItem>
              {option.separator && (
                <Box paddingVertical="4px">
                  <DropdownMenuSeparator />
                </Box>
              )}
            </Box>
          ))}
        </DropdownMenuContent>
      </MoreInfoMenuContainer>
    </Box>
  );
};

const MoreInfoMenuContainer = ({
  controlled,
  children,
  onOpenChange,
  open,
}: {
  controlled?: boolean;
  children: ReactNode;
  onOpenChange?: (v: boolean) => void;
  open?: boolean;
}) => {
  if (controlled) {
    return (
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        {children}
      </DropdownMenu>
    );
  }

  return <DropdownMenu onOpenChange={onOpenChange}>{children}</DropdownMenu>;
};

export { MoreInfoButton };
