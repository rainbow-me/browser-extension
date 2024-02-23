import { ReactNode, useCallback } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { Box, ButtonSymbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { TextStyles } from '~/design-system/styles/core.css';
import { ButtonVariant } from '~/design-system/styles/designTokens';

import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
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
  symbol?: SymbolProps['symbol'];
  leftComponent?: ReactNode;
  separator?: boolean;
  onSelect: () => void;
  color?: TextStyles['color'];
  disabled?: boolean;
}

interface MoreInfoButtonProps {
  options: MoreInfoOption[];
  open?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  testId?: string;
  variant?: ButtonVariant;
}

const MoreInfoButton = ({
  onClose,
  onOpen,
  open,
  options,
  testId,
  variant = 'transparentHover',
}: MoreInfoButtonProps) => {
  const { trackShortcut } = useKeyboardAnalytics();
  const handleShortcut = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        trackShortcut({
          key: shortcuts.global.CLOSE.display,
          type: 'moreInfoButton.dismiss',
        });
        e.preventDefault();
        onClose?.();
      }
    },
    [onClose, trackShortcut],
  );
  useKeyboardShortcut({
    handler: handleShortcut,
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
              variant={variant}
              symbol="ellipsis.circle"
            />
          </Box>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {options.map((option) => (
            <Box key={option.symbol}>
              <DropdownMenuItem
                color={option.color}
                symbolLeft={option.symbol}
                leftComponent={option.leftComponent}
                onSelect={option.onSelect}
                disabled={option.disabled}
              >
                <Text
                  size="14pt"
                  weight="semibold"
                  color={option.disabled ? 'labelTertiary' : option.color}
                >
                  {option.label}
                </Text>
                {option.subLabel && (
                  <Text size="12pt" color="labelTertiary" weight="regular">
                    {option.subLabel}
                  </Text>
                )}
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
