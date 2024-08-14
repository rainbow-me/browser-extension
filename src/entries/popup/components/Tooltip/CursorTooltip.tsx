import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box, TextOverflow, ThemeProvider } from '~/design-system';
import {
  AlignHorizontal,
  Inline,
} from '~/design-system/components/Inline/Inline';
import { TextStyles } from '~/design-system/styles/core.css';

import useComponentWillUnmount from '../../hooks/useComponentWillUnmount';
import { ShortcutHint } from '../ShortcutHint/ShortcutHint';

const { innerWidth: windowWidth } = window;

export const CursorTooltip = ({
  align,
  arrowAlignment = 'center',
  arrowDirection = 'down',
  arrowCentered,
  text,
  textWeight,
  textSize,
  textColor,
  children,
  hint,
}: {
  children: ReactNode;
  text: string;
  align?: 'start' | 'center' | 'end';
  arrowAlignment?: 'left' | 'center' | 'right';
  arrowDirection?: 'down' | 'up';
  arrowCentered?: boolean;
  textSize?: TextStyles['fontSize'];
  textWeight?: TextStyles['fontWeight'];
  textColor?: TextStyles['color'];
  hint?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const showTimer = useRef<Timer>();
  const childElementWrapperRef = useRef<HTMLDivElement>(null);
  const [childWidth, setChildWidth] = useState(0);
  const checkChildWidth = () => {
    const width = childElementWrapperRef.current?.offsetWidth;
    if (width) {
      setChildWidth(width);
    }
  };
  const alignOffset = useMemo(() => {
    if (!childWidth || !align || !arrowCentered) return 0;
    if (align !== 'center') {
      return childWidth / 2 - 12;
    }
    return 0;
  }, [align, arrowCentered, childWidth]);

  useEffect(() => {
    if (!isHovering) {
      clearTimeout(showTimer.current);
    }
  }, [isHovering]);

  useComponentWillUnmount(() => {
    clearTimeout(showTimer.current);
  });

  useLayoutEffect(() => {
    checkChildWidth();
  }, []);

  const { alignHorizontal, left, right } = useMemo(() => {
    switch (arrowAlignment) {
      case 'left':
        return {
          alignHorizontal: 'left' as AlignHorizontal,
          left: 6,
          right: undefined,
        };
      case 'center':
        return {
          alignHorizontal: 'center' as AlignHorizontal,
          left: undefined,
          right: undefined,
        };
      case 'right':
        return {
          alignHorizontal: 'right' as AlignHorizontal,
          left: undefined,
          right: 6,
        };
    }
  }, [arrowAlignment]);

  const { currentTheme } = useCurrentThemeStore();

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={open}>
        <TooltipPrimitive.Trigger asChild>
          <Box
            ref={childElementWrapperRef}
            onMouseEnter={() => {
              setIsHovering(true);
              showTimer.current = setTimeout(() => setOpen(true), 750);
            }}
            onMouseLeave={() => {
              setIsHovering(false);
              setOpen(false);
              showTimer.current && clearTimeout(showTimer.current);
            }}
          >
            {children}
          </Box>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            align={align}
            className="TooltipContent"
            side={arrowDirection === 'up' ? 'bottom' : 'top'}
            sideOffset={10}
            alignOffset={alignOffset}
          >
            <ThemeProvider theme={currentTheme}>
              <Box
                style={{ maxWidth: windowWidth - 60 }}
                borderRadius="6px"
                boxShadow="24px"
              >
                <Inline alignHorizontal={alignHorizontal}>
                  <Box
                    background="surfaceSecondaryElevated"
                    backdropFilter="blur(26px)"
                    position="absolute"
                    borderRadius="2px"
                    marginBottom="-3px"
                    bottom="0"
                    style={{
                      height: 10,
                      width: 10,
                      rotate: '45deg',
                      left,
                      right,
                      ...(arrowDirection === 'up' ? { top: -4 } : {}),
                    }}
                  />
                </Inline>
                <Box
                  style={{
                    alignItems: 'center',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'center',
                    minHeight: 22,
                  }}
                  background="surfaceSecondaryElevated"
                  padding="7px"
                  paddingHorizontal="6px"
                  backdropFilter="blur(26px)"
                >
                  <Inline alignVertical="center" space={'6px'}>
                    <TextOverflow
                      color={textColor || 'label'}
                      size={textSize || '16pt'}
                      weight={textWeight || 'bold'}
                    >
                      {text}
                    </TextOverflow>
                    {hint ? <ShortcutHint hint={hint} small /> : null}
                  </Inline>
                </Box>
              </Box>
            </ThemeProvider>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
