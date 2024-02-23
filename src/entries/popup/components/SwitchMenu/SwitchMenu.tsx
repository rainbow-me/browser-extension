import * as SelectPrimitive from '@radix-ui/react-select';
import clsx from 'clsx';
import React, { PropsWithChildren, useCallback } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { AccentColorProvider, Box, Text, ThemeProvider } from '~/design-system';
import { accentMenuFocusVisibleStyle } from '~/design-system/components/Lens/Lens.css';
import { globalColors } from '~/design-system/styles/designTokens';

import { useAvatar } from '../../hooks/useAvatar';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

const SelectItem = ({
  value,
  isSelected,
  children,
}: { isSelected: boolean } & SelectPrimitive.SelectItemProps) => {
  return (
    <SelectPrimitive.Item asChild value={value}>
      <Box
        paddingVertical="10px"
        paddingHorizontal="8px"
        marginHorizontal="-8px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        className={clsx([!isSelected && accentMenuFocusVisibleStyle])}
        borderRadius="12px"
        outline="none"
        background={
          isSelected
            ? 'accent'
            : { default: 'transparent', hover: 'surfaceSecondary' }
        }
        borderColor={isSelected ? 'buttonStrokeSecondary' : 'transparent'}
        borderWidth="1px"
      >
        {children}
      </Box>
    </SelectPrimitive.Item>
  );
};

type SelectContentProps = PropsWithChildren<
  Pick<SelectPrimitive.SelectContentProps, 'align' | 'onPointerDownOutside'> & {
    sideOffset: number;
  }
>;

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  function SelectContent(
    { children, align = 'start', sideOffset = 16 }: SelectContentProps,
    ref,
  ) {
    const { currentTheme } = useCurrentThemeStore();
    const { currentAddress } = useCurrentAddressStore();
    const { data: avatar } = useAvatar({ addressOrName: currentAddress });
    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          align={align}
          sideOffset={sideOffset}
          hideWhenDetached
        >
          <AccentColorProvider color={avatar?.color || globalColors.blue60}>
            <ThemeProvider theme={currentTheme}>
              <Box
                alignItems="center"
                justifyContent="center"
                display="flex"
                backdropFilter="blur(26px)"
                paddingHorizontal="12px"
                paddingVertical="4px"
                background="surfaceMenu"
                borderColor="separatorTertiary"
                borderWidth="1px"
                borderRadius="16px"
                tabIndex={-1}
                style={{ overflowY: 'scroll', width: '204px' }}
                ref={ref}
              >
                <SelectPrimitive.Viewport asChild>
                  <Box
                    style={{
                      maxHeight:
                        'calc(var(--radix-select-content-available-height) - 8px)', // available height minus vertical padding
                      overflow: 'visible',
                      width: '100%',
                    }}
                  >
                    {children}
                  </Box>
                </SelectPrimitive.Viewport>
              </Box>
            </ThemeProvider>
          </AccentColorProvider>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  },
);

interface SwitchMenuProps {
  title?: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  renderMenuTrigger: React.ReactNode;
  renderMenuItem: (item: string, i: number) => React.ReactNode;
  menuItemIndicator: React.ReactNode;
  menuItems: string[];
  align?: 'start' | 'center' | 'end';
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  onClose?: () => void;
  sideOffset?: number;
}

export const SwitchMenu = ({
  title,
  selectedValue,
  onValueChange,
  renderMenuTrigger,
  menuItems,
  renderMenuItem,
  menuItemIndicator,
  align,
  onOpenChange,
  open,
  onClose,
  sideOffset = 16,
}: SwitchMenuProps) => {
  const { trackShortcut } = useKeyboardAnalytics();
  const handleShortcut = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        trackShortcut({
          key: shortcuts.global.CLOSE.display,
          type: 'radix.switchMenu.dismiss',
        });
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }
    },
    [onClose, trackShortcut],
  );
  useKeyboardShortcut({
    condition: open !== undefined,
    handler: handleShortcut,
  });
  return (
    <SelectPrimitive.Root
      value={selectedValue}
      onValueChange={onValueChange}
      onOpenChange={(open) => {
        onOpenChange?.(open);
        if (!open) onClose?.();
      }}
      open={open}
    >
      <SelectPrimitive.Trigger
        onKeyDown={(e) => {
          if (
            e.key === shortcuts.global.DOWN.key ||
            e.key === shortcuts.global.UP.key
          ) {
            e.preventDefault();
          }
        }}
        asChild
      >
        <Box style={{ cursor: 'default' }}>{renderMenuTrigger}</Box>
      </SelectPrimitive.Trigger>

      <SelectContent
        align={align}
        onPointerDownOutside={onClose}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Group asChild>
          <Box width="full" paddingBottom="4px">
            {title && (
              <>
                <Box
                  as={SelectPrimitive.Label}
                  paddingTop="8px"
                  paddingBottom="12px"
                >
                  <Text color="label" size="14pt" weight="bold" align="center">
                    {title}
                  </Text>
                </Box>
                <Box
                  as={SelectPrimitive.Separator}
                  style={{ borderRadius: 1 }}
                  borderWidth="1px"
                  borderColor="separatorSecondary"
                />
              </>
            )}
            {menuItems.map((item, i) => (
              <SelectItem
                key={item}
                value={item}
                isSelected={item === selectedValue}
              >
                {renderMenuItem(item, i)}
                <SelectPrimitive.ItemIndicator asChild>
                  {menuItemIndicator}
                </SelectPrimitive.ItemIndicator>
              </SelectItem>
            ))}
          </Box>
        </SelectPrimitive.Group>
      </SelectContent>
    </SelectPrimitive.Root>
  );
};
