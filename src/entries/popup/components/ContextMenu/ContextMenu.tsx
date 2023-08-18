import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import clsx from 'clsx';
import React, { CSSProperties, ReactNode, useRef } from 'react';
import { useAccount } from 'wagmi';

import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import {
  AccentColorProvider,
  Box,
  Inline,
  Symbol,
  Text,
  ThemeProvider,
} from '~/design-system';
import { accentMenuFocusVisibleStyle } from '~/design-system/components/Lens/Lens.css';
import { TextStyles, boxStyles } from '~/design-system/styles/core.css';
import {
  BackgroundColor,
  Space,
  SymbolName,
  globalColors,
} from '~/design-system/styles/designTokens';

import { useAvatar } from '../../hooks/useAvatar';
import { simulateClick } from '../../utils/simulateClick';

const { innerWidth: windowWidth } = window;

const WINDOW_LEFT_OFFSET = windowWidth / 2 - 40;
const WINDOW_RIGHT_OFFSET = windowWidth / 2 + 40;

interface ContextMenuTriggerProps {
  children: ReactNode;
  accentColor?: string;
  asChild?: boolean;
  onTrigger?: () => void;
}

export const ContextMenuTrigger = (props: ContextMenuTriggerProps) => {
  const { children, accentColor, asChild } = props;
  const { address } = useAccount();
  const { avatar } = useAvatar({ address });
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <AccentColorProvider
      color={accentColor || avatar?.color || globalColors.blue60}
    >
      <ContextMenuPrimitive.Trigger
        asChild={asChild}
        onContextMenu={(e) => {
          if (
            e.clientX > WINDOW_LEFT_OFFSET &&
            e.clientX < WINDOW_RIGHT_OFFSET
          ) {
            e.clientX = WINDOW_LEFT_OFFSET;
          }
          props.onTrigger?.();
        }}
        onKeyDown={(e) => {
          if (e.key === shortcuts.global.CLOSE.key) {
            e.stopPropagation();
          }
          if (e.key === shortcuts.global.DOWN.key) {
            e.preventDefault();
          }
          if (e.key === shortcuts.global.OPEN_CONTEXT_MENU.key) {
            simulateClick(triggerRef?.current);
          }
        }}
        ref={triggerRef}
      >
        {children}
      </ContextMenuPrimitive.Trigger>
    </AccentColorProvider>
  );
};

interface ContextMenuContentProps {
  children: ReactNode;
  marginRight?: Space;
  accentColor?: string;
  sideOffset?: number;
}

export function ContextMenuContent(props: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuContentBody
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

const ContextMenuContentBody = React.forwardRef<
  HTMLDivElement,
  ContextMenuContentProps
>((props: ContextMenuContentProps, ref) => {
  const { children, marginRight, accentColor } = props;
  const { currentTheme } = useCurrentThemeStore();
  const { address } = useAccount();
  const { avatar } = useAvatar({ address });
  return (
    <AccentColorProvider
      color={accentColor || avatar?.color || globalColors.blue60}
    >
      <ThemeProvider theme={currentTheme}>
        <Box
          as={ContextMenuPrimitive.Content}
          style={{
            width: 204,
            backdropFilter: 'blur(26px)',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
            marginRight: marginRight ?? '0px',
          }}
          forceMount
          paddingHorizontal="12px"
          paddingVertical="4px"
          background="surfaceMenu"
          borderColor="separatorTertiary"
          borderWidth="1px"
          borderRadius="16px"
          ref={ref}
          hideWhenDetached
        >
          {children}
        </Box>
      </ThemeProvider>
    </AccentColorProvider>
  );
});

ContextMenuContentBody.displayName = 'ContextMenuContentBody';

interface ContextMenuLabelProps {
  children: ReactNode;
  align?: TextStyles['textAlign'];
}

export const ContextMenuLabel = (props: ContextMenuLabelProps) => {
  const { children, align = 'center' } = props;
  return (
    <Box as={ContextMenuPrimitive.Label} paddingTop="8px" paddingBottom="12px">
      <Text color="label" size="14pt" weight="bold" align={align}>
        {children}
      </Text>
    </Box>
  );
};

interface ContextMenuItemProps {
  children: ReactNode;
  onSelect?: (event: Event) => void;
  symbolLeft: SymbolName;
  color?: TextStyles['color'];
}

export const ContextMenuItem = ({
  children,
  onSelect,
  symbolLeft,
  color,
}: ContextMenuItemProps) => {
  return (
    <Box
      as={ContextMenuPrimitive.Item}
      className={accentMenuFocusVisibleStyle}
      paddingVertical="8px"
      paddingHorizontal="8px"
      marginHorizontal="-8px"
      style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '12px',
        outline: 'none',
      }}
      onSelect={onSelect}
      background={{
        default: 'transparent',
        hover: 'surfaceSecondary',
      }}
    >
      <Inline alignVertical="center" space="8px">
        {symbolLeft && (
          <Symbol
            size={16}
            symbol={symbolLeft}
            weight="semibold"
            color={color}
          />
        )}
        {typeof children === 'string' ? (
          <Text size="14pt" weight="semibold">
            {children}
          </Text>
        ) : (
          children
        )}
      </Inline>
    </Box>
  );
};

interface ContextMenuRadioItemProps {
  children: ReactNode;
  value: string;
  selectedValue?: string;
  selectedColor?: string;
  onSelect?: (event: Event) => void;
}

export const ContextMenuRadioItem = (props: ContextMenuRadioItemProps) => {
  const { children, value, selectedValue, selectedColor, onSelect } = props;
  const isSelectedValue = selectedValue === value;
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <Box
      as={ContextMenuPrimitive.RadioItem}
      value={value}
      paddingVertical="10px"
      paddingHorizontal="8px"
      marginHorizontal="-8px"
      alignItems="center"
      onSelect={onSelect}
      className={clsx([
        boxStyles({
          display: 'flex',
          borderRadius: '12px',
          outline: 'none',
        }),
        accentMenuFocusVisibleStyle,
      ])}
      background={{
        default: isSelectedValue
          ? (selectedColor as BackgroundColor) ?? 'accent'
          : 'transparent',
        hover: isSelectedValue
          ? (selectedColor as BackgroundColor) ?? 'accent'
          : 'surfaceSecondary',
      }}
      borderColor={isSelectedValue ? 'buttonStrokeSecondary' : 'transparent'}
      borderWidth="1px"
      ref={containerRef}
    >
      {children}
    </Box>
  );
};

export const ContextMenuSeparator = () => (
  <Box
    as={ContextMenuPrimitive.Separator}
    style={{ borderRadius: 1 }}
    borderWidth="1px"
    borderColor="separatorSecondary"
  />
);

interface ContextMenuItemIndicatorProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export const ContextMenuItemIndicator = (
  props: ContextMenuItemIndicatorProps,
) => {
  const { children, style, className } = props;
  return (
    <Box
      as={ContextMenuPrimitive.ItemIndicator}
      className={className}
      style={style}
    >
      {children}
    </Box>
  );
};

export const ContextMenu = (props: ContextMenuPrimitive.ContextMenuProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <ContextMenuPrimitive.Root {...props} modal />
);

export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
