import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { DismissableLayerProps } from '@radix-ui/react-tooltip';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
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
import symbols from '~/design-system/symbols/generated';

import { useAvatar } from '../../hooks/useAvatar';
import { simulateContextClick } from '../../utils/simulateClick';
import { ShortcutHint } from '../ShortcutHint/ShortcutHint';

const { innerWidth: windowWidth } = window;

const WINDOW_LEFT_OFFSET = windowWidth / 2 - 40;
const WINDOW_RIGHT_OFFSET = windowWidth / 2 + 40;

interface ContextMenuTriggerProps {
  children: ReactNode;
  accentColor?: string;
  asChild?: boolean;
  disabled?: boolean;
  onTrigger?: () => void;
  openOnClick?: boolean;
}

export const ContextMenuTrigger = (props: ContextMenuTriggerProps) => {
  const { children, accentColor, asChild, disabled } = props;
  const { currentAddress: address } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: address });
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <AccentColorProvider
      color={accentColor || avatar?.color || globalColors.blue60}
    >
      <ContextMenuPrimitive.Trigger
        asChild={asChild}
        disabled={disabled}
        onContextMenu={(e) => {
          if (
            e.clientX > WINDOW_LEFT_OFFSET &&
            e.clientX < WINDOW_RIGHT_OFFSET
          ) {
            e.clientX = WINDOW_LEFT_OFFSET;
          }
          props.onTrigger?.();
        }}
        onClick={(e) => {
          if (props.openOnClick) {
            simulateContextClick(triggerRef?.current, {
              clientX: e.clientX,
              clientY: e.clientY,
            });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === shortcuts.global.CLOSE.key) {
            e.stopPropagation();
          }
          if (e.key === shortcuts.global.DOWN.key) {
            e.preventDefault();
          }
          if (e.key === shortcuts.global.OPEN_CONTEXT_MENU.key) {
            simulateContextClick(triggerRef?.current);
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
  accentColor?: string;
  animate?: boolean;
  border?: boolean;
  boxShadow?: string;
  children: ReactNode;
  backdropFilter?: BoxStyles['backdropFilter'];
  marginRight?: Space;
  marginLeft?: Space | number;
  marginTop?: Space | number;
  position?: BoxStyles['position'];
  sideOffset?: number;
  alignOffset?: number;
  scale?: number;
  top?: number;
  onPointerDownOutside?: () => void;
  onInteractOutside?: DismissableLayerProps['onInteractOutside'];
}

export function ContextMenuContent(props: ContextMenuContentProps) {
  if (!hasChildren(props.children)) return null;
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
>(function ContextMenuContentBody(props: ContextMenuContentProps, ref) {
  const {
    animate,
    border,
    boxShadow,
    backdropFilter,
    children,
    marginRight,
    marginLeft,
    marginTop,
    position,
    accentColor,
    scale,
    top,
    alignOffset,
    onInteractOutside,
    onPointerDownOutside,
  } = props;
  const { currentTheme } = useCurrentThemeStore();
  const { currentAddress: address } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: address });
  return (
    <AccentColorProvider
      color={accentColor || avatar?.color || globalColors.blue60}
    >
      <ThemeProvider theme={currentTheme}>
        <Box
          as={ContextMenuPrimitive.Content}
          ref={ref}
          onPointerDownOutside={onPointerDownOutside}
          onInteractOutside={onInteractOutside}
          style={{
            width: 204,
          }}
          forceMount
          alignOffset={alignOffset}
          hideWhenDetached
        >
          <Box
            as={motion.div}
            initial={{ scale: 1, width: '204px', opacity: animate ? 0 : 1 }}
            animate={{
              scale: scale ?? 1,
              width: '204px',
              opacity: 1,
            }}
            exit={{ scale: 1, width: '204px', opacity: animate ? 0 : 1 }}
            transition={{ duration: 0.1 }}
            style={{
              boxShadow: boxShadow ?? '0px 10px 30px rgba(0, 0, 0, 0.2)',
              marginRight: marginRight ?? '0px',
              marginLeft: marginLeft ?? '0px',
              marginTop: marginTop ?? '0px',
              top: top ?? '0px',
            }}
            width="fit"
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
  // eslint-disable-next-line @typescript-eslint/ban-types
  symbolLeft: SymbolName | (string & {});
  color?: TextStyles['color'];
  shortcut?: string;
  external?: boolean;
  disabled?: boolean;
  testId?: string;
}

const isSymbol = (symbol: string): symbol is SymbolName =>
  !!symbols[symbol as SymbolName];

export const ContextMenuItem = ({
  children,
  onSelect,
  symbolLeft,
  color,
  shortcut,
  external,
  disabled,
  testId,
}: ContextMenuItemProps) => {
  const [isMounting, setIsMounting] = useState(true);
  useEffect(() => {
    setTimeout(() => setIsMounting(false), 400);
  }, []);
  const conditionalColor = disabled ? 'labelTertiary' : color;
  return (
    <Box
      testId={testId}
      as={ContextMenuPrimitive.Item}
      className={accentMenuFocusVisibleStyle}
      paddingVertical="8px"
      paddingHorizontal="8px"
      marginHorizontal="-8px"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '12px',
        outline: 'none',
      }}
      onSelect={onSelect}
      background={{
        default: 'transparent',
        hover: disabled ? 'transparent' : 'surfaceSecondary',
      }}
      tabIndex={disabled ? -1 : 0}
      disabled={disabled || isMounting}
    >
      <Inline alignVertical="center" space="8px" wrap={false}>
        {isSymbol(symbolLeft) ? (
          <Symbol
            size={16}
            symbol={symbolLeft}
            weight="semibold"
            color={conditionalColor}
          />
        ) : (
          <Text color={conditionalColor} weight="semibold" size="14pt">
            {symbolLeft}
          </Text>
        )}
        {typeof children === 'string' ? (
          <TextOverflow size="14pt" weight="semibold" color={conditionalColor}>
            {children}
          </TextOverflow>
        ) : (
          <Stack space="8px">{children}</Stack>
        )}
      </Inline>
      {shortcut && <ShortcutHint hint={shortcut} />}
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
      paddingVertical="7px"
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
