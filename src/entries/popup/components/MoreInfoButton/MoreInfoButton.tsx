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
  onClose?: () => void;
  onOpen?: () => void;
  testId?: string;
}

const MoreInfoButton = ({
  onClose,
  onOpen,
  open,
  options,
  testId,
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
    <Box onClick={(e) => e.stopPropagation()} testId={testId}>
      <DropdownMenu
        onOpenChange={(openState) => (openState ? onOpen?.() : onClose?.())}
        open={open}
      >
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

        <DropdownMenuContent align="end">
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
      </DropdownMenu>
    </Box>
  );
};

export { MoreInfoButton };
