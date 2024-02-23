import React, { forwardRef, useCallback } from 'react';

import { Shortcut, getModifierKeyDisplay } from '~/core/references/shortcuts';
import { BoxStyles } from '~/design-system/styles/core.css';
import { Radius } from '~/design-system/styles/designTokens';
import { ShortcutHint } from '~/entries/popup/components/ShortcutHint/ShortcutHint';
import useKeyboardAnalytics, {
  KeyboardEventDescription,
} from '~/entries/popup/hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';

import { Box } from '../Box/Box';
import { Inline } from '../Inline/Inline';
import { Symbol, SymbolProps } from '../Symbol/Symbol';
import { Text } from '../Text/Text';

import {
  ButtonVariantProps,
  ButtonWrapper,
  stylesForHeight,
  stylesForVariant,
} from './ButtonWrapper';
import { ButtonHeight } from './ButtonWrapper.css';

type ButtonShortcutExtended = Shortcut & {
  type?: KeyboardEventDescription;
  disabled?: boolean | (() => boolean);
  hideHint?: boolean;
};

export type ButtonProps = {
  autoFocus?: boolean;
  children: string | React.ReactNode;
  height: ButtonHeight;
  onClick?: () => void;
  width?: 'fit' | 'full';
  testId?: string;
  symbolSide?: 'left' | 'right';
  blur?: string;
  borderRadius?: Radius;
  paddingLeft?: BoxStyles['paddingLeft'];
  paddingRight?: BoxStyles['paddingRight'];
  paddingHorizontal?: BoxStyles['paddingHorizontal'];
  tabIndex?: number;
  disabled?: boolean;
  enterCta?: boolean;
  shortcut?: ButtonShortcutExtended;
} & ButtonVariantProps &
  (
    | {
        emoji?: string;
        symbol?: never;
      }
    | {
        emoji?: never;
        symbol?: SymbolProps['symbol'];
      }
  );

function ButtonShortcut({
  shortcut,
  onTrigger,
}: {
  onTrigger: VoidFunction;
  shortcut: ButtonShortcutExtended;
}) {
  const { trackShortcut } = useKeyboardAnalytics();
  const handleShortcut = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.key === shortcut.key &&
        (!shortcut.disabled ||
          (typeof shortcut.disabled === 'function' && !shortcut.disabled()))
      ) {
        if (shortcut.type) {
          trackShortcut({
            key: shortcut.key,
            type: shortcut.type,
          });
        }
        onTrigger();
      }
    },
    [onTrigger, shortcut, trackShortcut],
  );

  useKeyboardShortcut({
    handler: handleShortcut,
    modifierKey: shortcut.modifier,
  });

  if (shortcut.hideHint) return null;

  return (
    <Inline alignVertical="center" space="3px" wrap={false}>
      {shortcut.modifier && (
        <ShortcutHint
          hint={getModifierKeyDisplay(shortcut.modifier)}
          variant="flat"
        />
      )}
      <ShortcutHint hint={shortcut.display} variant="flat" />
    </Inline>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      emoji,
      height,
      symbol,
      symbolSide,
      testId,
      shortcut,
      ...props
    }: ButtonProps,
    ref,
  ) {
    const { textColor } = stylesForVariant({
      color: props.color ?? 'accent',
    })[props.variant];

    const { paddingHorizontal, gap, textSize } = stylesForHeight[height];
    const symbolSize =
      parseInt(textSize?.split(' ')[0].replace('pt', '') ?? '') -
      (props.enterCta ? 4 : 0);
    const symbolComponent =
      (symbol && (
        <Symbol
          color={textColor}
          boxed={props.enterCta}
          size={symbolSize}
          symbol={symbol}
          weight="bold"
        />
      )) ||
      null;

    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <ButtonWrapper height={height} {...props} testId={testId} ref={ref}>
        <Box
          paddingLeft={
            props.paddingLeft || props.paddingHorizontal || paddingHorizontal
          }
          paddingRight={
            props.paddingRight || props.paddingHorizontal || paddingHorizontal
          }
        >
          <Inline alignVertical="center" space={gap} wrap={false}>
            {typeof children === 'string' ? (
              <>
                {emoji && (
                  <Text color={textColor} size={textSize} weight="bold">
                    {emoji}
                  </Text>
                )}
                {symbolSide !== 'right' && symbolComponent}
                <Text color={textColor} size={textSize} weight="bold">
                  {children}
                </Text>
                {symbolSide === 'right' && symbolComponent}
              </>
            ) : (
              children
            )}
            {shortcut && (
              <ButtonShortcut
                shortcut={shortcut}
                onTrigger={() => !props.disabled && props.onClick?.()}
              />
            )}
          </Inline>
        </Box>
      </ButtonWrapper>
    );
  },
);
