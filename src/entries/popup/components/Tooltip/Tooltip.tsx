import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React, { ReactNode, useMemo } from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box, Inline, TextOverflow, ThemeProvider } from '~/design-system';
import { AlignHorizontal } from '~/design-system/components/Inline/Inline';
import { TextStyles } from '~/design-system/styles/core.css';
import { tooltipAnimation } from '~/design-system/styles/tooltipAnimationStyles.css';

import { ShortcutHint } from '../ShortcutHint/ShortcutHint';

const { innerWidth: windowWidth } = window;

export const Tooltip = ({
  align,
  alignOffset,
  children,
  text,
  textSize,
  textWeight,
  textColor,
  arrowAlignment = 'center',
  arrowDirection = 'down',
  open,
  hint,
}: {
  children: ReactNode;
  text: string;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  arrowAlignment?: 'left' | 'center' | 'right';
  arrowDirection?: 'down' | 'up';
  textSize?: TextStyles['fontSize'];
  textWeight?: TextStyles['fontWeight'];
  textColor?: TextStyles['color'];
  open?: boolean;
  hint?: string;
}) => {
  const { currentTheme } = useCurrentThemeStore();

  const { alignHorizontal, left, right } = useMemo(() => {
    switch (arrowAlignment) {
      case 'left':
        return {
          alignHorizontal: 'left' as AlignHorizontal,
          left: 8,
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
          right: 8,
        };
    }
  }, [arrowAlignment]);

  const side = arrowDirection === 'down' ? 'top' : 'bottom';

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={open}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            align={align}
            className={tooltipAnimation}
            side={side}
            sideOffset={12}
            alignOffset={side === 'top' ? alignOffset : -(alignOffset || 0)}
          >
            <ThemeProvider theme={currentTheme}>
              <Box
                style={{ maxWidth: windowWidth - 60, overflow: 'hidden' }}
                borderRadius="8px"
                boxShadow="24px"
              >
                <Inline alignHorizontal={alignHorizontal}>
                  <Box
                    background="surfaceSecondaryElevated"
                    backdropFilter="blur(26px)"
                    position="absolute"
                    marginBottom="-3px"
                    bottom="0"
                    style={{
                      borderRadius: 2.5,
                      height: 10,
                      width: 10,
                      rotate: '45deg',
                      left,
                      right,
                      ...(arrowDirection === 'up' ? { top: -3 } : {}),
                    }}
                  />
                </Inline>
                <Box
                  alignItems="center"
                  background="surfaceSecondaryElevated"
                  display="flex"
                  paddingRight={hint ? '4px' : '6px'}
                  paddingLeft="6px"
                  backdropFilter="blur(26px)"
                  style={{ height: 22 }}
                >
                  <Inline alignVertical="center" space={'6px'}>
                    <TextOverflow
                      align={hint ? 'left' : 'center'}
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
