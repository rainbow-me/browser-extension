import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { DismissableLayerProps } from '@radix-ui/react-menu';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import React, { CSSProperties, ReactNode, useRef } from 'react';
import { useAccount } from 'wagmi';

import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { hasChildren } from '~/core/utils/react';
import {
  AccentColorProvider,
  Box,
  Inline,
  Stack,
  Symbol,
  Text,
  TextOverflow,
  ThemeProvider,
} from '~/design-system';
import { accentMenuFocusVisibleStyle } from '~/design-system/components/Lens/Lens.css';
import {
  BoxStyles,
  TextStyles,
  boxStyles,
} from '~/design-system/styles/core.css';
import {
  BackgroundColor,
  Space,
  SymbolName,
  globalColors,
} from '~/design-system/styles/designTokens';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';

import { useAvatar } from '../../hooks/useAvatar';
import { simulateClick } from '../../utils/simulateClick';

export const DROPDOWN_MENU_ITEM_HEIGHT = 34;

interface DropdownMenuTriggerProps {
  children: ReactNode;
  accentColor?: string;
  asChild?: boolean;
}

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  const { children, accentColor, asChild } = props;
  const { address } = useAccount();
  const { data: avatar } = useAvatar({ addressOrName: address });
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <AccentColorProvider
      color={accentColor || avatar?.color || globalColors.blue60}
    >
      <DropdownMenuPrimitive.Trigger
        asChild={asChild}
        onKeyDown={(e) => {
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
      </DropdownMenuPrimitive.Trigger>
    </AccentColorProvider>
  );
}

interface DropdownMenuContentProps {
  animate?: boolean;
  border?: boolean;
  boxShadow?: string;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  backdropFilter?: BoxStyles['backdropFilter'];
  marginRight?: Space;
  marginLeft?: Space | number;
  marginTop?: Space | number;
  accentColor?: string;
  sideOffset?: number;
  alignOffset?: number;
  scale?: number;
  top?: number;
  position?: BoxStyles['position'];
  onPointerDownOutside?: () => void;
  onInteractOutside?: DismissableLayerProps['onInteractOutside'];
}

export function DropdownMenuContent(props: DropdownMenuContentProps) {
  if (!hasChildren(props.children)) return null;
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuContentBody
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export const DropdownMenuContentBody = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>((props: DropdownMenuContentProps, ref) => {
  const {
    border,
    boxShadow,
    children,
    align = 'start',
    backdropFilter,
    marginRight,
    marginLeft,
    marginTop,
    accentColor,
    scale,
    top,
    position,
    sideOffset,
    alignOffset,
    onInteractOutside,
    onPointerDownOutside,
    animate = false,
  } = props;
  const { currentTheme } = useCurrentThemeStore();
  const { address } = useAccount();
  const { data: avatar } = useAvatar({ addressOrName: address });
  return (
    <AccentColorProvider
      color={accentColor || avatar?.color || globalColors.blue60}
    >
      <ThemeProvider theme={currentTheme}>
        <Box
          as={DropdownMenuPrimitive.Content}
          ref={ref}
          onPointerDownOutside={onPointerDownOutside}
          tabIndex={-1}
          onInteractOutside={onInteractOutside}
          align={align}
          style={{ minWidth: '204px', maxWidth: '236px' }}
          alignItems="center"
          justifyContent="center"
          display="flex"
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          hideWhenDetached
        >
          <Box
            as={motion.div}
            initial={{ scale: 1, opacity: animate ? 0 : 1 }}
            animate={{ scale: scale ?? 1, opacity: 1 }}
            exit={{ scale: 1, opacity: animate ? 0 : 1 }}
            transition={{ duration: 0.1 }}
            style={{
              boxShadow: boxShadow ?? '0px 10px 30px rgba(0, 0, 0, 0.2)',
              marginRight: marginRight ?? '0px',
              marginLeft: marginLeft ?? '0px',
              marginTop: marginTop ?? '0px',
              top: top ?? '0px',
              minWidth: '204px',
            }}
            backdropFilter={backdropFilter || 'blur(26px)'}
            paddingHorizontal="12px"
            paddingVertical="4px"
            background="surfaceMenu"
            borderColor="separatorTertiary"
            borderWidth={border ? '1px' : undefined}
            borderRadius="16px"
            position={position}
          >
            {children}
          </Box>
        </Box>
      </ThemeProvider>
    </AccentColorProvider>
  );
});

DropdownMenuContentBody.displayName = 'DropdownMenuContentBody';

interface DropdownMenuLabelProps {
  children: ReactNode;
  align?: TextStyles['textAlign'];
}

export const DropdownMenuLabel = (props: DropdownMenuLabelProps) => {
  const { children, align = 'center' } = props;
  return (
    <Box as={DropdownMenuPrimitive.Label} paddingTop="8px" paddingBottom="12px">
      <Text color="label" size="14pt" weight="bold" align={align}>
        {children}
      </Text>
    </Box>
  );
};

type DropdownMenuItemProps = {
  children: ReactNode;
  onSelect?: (event: Event) => void;
  external?: boolean;
  color?: TextStyles['color'];
  disabled?: boolean;
} & (
  | { symbolLeft?: SymbolName; emoji?: never; leftComponent?: ReactNode }
  | { symbolLeft?: never; emoji?: string; leftComponent?: ReactNode }
);

export const DropdownMenuItem = ({
  children,
  onSelect,
  external,
  symbolLeft,
  leftComponent,
  emoji,
  color,
  disabled,
}: DropdownMenuItemProps) => {
  // eslint-disable-next-line no-param-reassign
  if (disabled) color = 'labelTertiary';
  return (
    <Box
      as={DropdownMenuPrimitive.Item}
      paddingVertical="8px"
      paddingHorizontal="8px"
      marginHorizontal="-8px"
      className={clsx([
        boxStyles({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '12px',
          outline: 'none',
          gap: '4px',
        }),
        accentMenuFocusVisibleStyle,
      ])}
      onSelect={onSelect}
      background={{
        default: 'transparent',
        hover: disabled ? 'transparent' : 'surfaceSecondary',
      }}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      style={{ minHeight: DROPDOWN_MENU_ITEM_HEIGHT }}
    >
      <Inline alignVertical="center" space="10px" wrap={false}>
        {emoji && (
          <Text size="14pt" weight="semibold">
            {emoji}
          </Text>
        )}
        {symbolLeft && (
          <Symbol
            size={16}
            symbol={symbolLeft}
            weight="semibold"
            color={color}
          />
        )}
        {leftComponent}
        {typeof children === 'string' ? (
          <TextOverflow size="14pt" weight="semibold" color={color}>
            {children}
          </TextOverflow>
        ) : (
          <Stack space="8px">{children}</Stack>
        )}
      </Inline>
      {external && (
        <Symbol
          size={12}
          symbol="arrow.up.forward.circle"
          weight="semibold"
          color="labelTertiary"
        />
      )}
    </Box>
  );
};

interface DropdownMenuRadioItemProps {
  cursor?: BoxStyles['cursor'];
  children: ReactNode;
  value: string;
  selectedValue?: string;
  selectedColor?: string;
  highlightAccentColor?: boolean;
  onSelect?: (event: Event) => void;
}

export const DropdownMenuRadioItem = (props: DropdownMenuRadioItemProps) => {
  const {
    cursor,
    children,
    value,
    selectedValue,
    selectedColor,
    highlightAccentColor,
    onSelect,
  } = props;
  const isSelectedValue = selectedValue === value;
  return (
    <Box
      as={DropdownMenuPrimitive.RadioItem}
      value={value}
      paddingVertical="7px"
      paddingHorizontal="8px"
      marginHorizontal="-8px"
      alignItems="center"
      onSelect={onSelect}
      className={clsx([
        highlightAccentColor && !isSelectedValue
          ? rowTransparentAccentHighlight
          : null,
        !isSelectedValue && accentMenuFocusVisibleStyle,
      ])}
      style={{
        display: 'flex',
        borderRadius: '12px',
        outline: 'none',
      }}
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
      cursor={cursor}
    >
      {children}
    </Box>
  );
};

export const DropdownMenuSeparator = () => (
  <Box
    as={DropdownMenuPrimitive.Separator}
    style={{ borderRadius: 1 }}
    borderWidth="1px"
    borderColor="separatorSecondary"
  />
);

interface DropdownMenuItemIndicatorProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export const DropdownMenuItemIndicator = (
  props: DropdownMenuItemIndicatorProps,
) => {
  const { children, style, className } = props;
  return (
    <Box
      as={DropdownMenuPrimitive.DropdownMenuItemIndicator}
      className={className}
      style={style}
    >
      {children}
    </Box>
  );
};

export const DropdownMenu = (
  props: DropdownMenuPrimitive.DropdownMenuProps,
) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <DropdownMenuPrimitive.Root {...props} modal />
);

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
