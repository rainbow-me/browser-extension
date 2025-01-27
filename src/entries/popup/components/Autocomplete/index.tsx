import { AddressZero } from '@ethersproject/constants';
import clsx from 'clsx';
import { Command } from 'cmdk';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

import { getCustomChainIconUrl } from '~/core/utils/assets';
import { Box, Inline, Text } from '~/design-system';
import { stylesForHeight } from '~/design-system/components/Input/Input';
import {
  accentCaretStyle,
  placeholderStyle,
} from '~/design-system/components/Input/Input.css';
import { selectedItem } from '~/design-system/styles/autocompleteInputStyles.css';
import {
  BoxStyles,
  semanticColorVars,
  textStyles,
} from '~/design-system/styles/core.css';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import ExternalImage from '../ExternalImage/ExternalImage';
import { Chain } from 'viem';

export interface AutocompleteData {
  [title: string]: Chain[];
}

export interface AutocompleteProps {
  data: AutocompleteData;
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  onBlur: () => void;
  onFocus: () => void;
  borderColor?: BoxStyles['borderColor'];
  placeholder?: string;
  open: boolean;
  autoFocus?: boolean;
  tabIndex: number;
  testId?: string;
}

export type customNetworkInfo = {
  rpcUrl: string;
  chainId: number;
  decimals: number;
  symbol: string;
  explorerUrl: string;
  testnet: boolean;
};

export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  function Autocomplete(
    {
      data,
      value,
      onChange,
      onSelect,
      onBlur,
      onFocus,
      borderColor,
      placeholder,
      open,
      autoFocus,
      tabIndex,
      testId,
    }: AutocompleteProps,
    ref,
  ) {
    const {
      borderRadius: defaultBorderRadius,
      fontSize: defaultFontSize,
      paddingHorizontal,
      paddingVertical,
    } = stylesForHeight['32px'];

    return (
      <Box position="relative">
        <Command label="" loop>
          <Box
            as={motion.div}
            borderColor={borderColor as BoxStyles['borderColor']}
            borderRadius={defaultBorderRadius}
            borderWidth="1px"
            transition={transitions.bounce}
            whileTap={{ scale: transformScales['0.96'] }}
            testId={testId}
          >
            <Command.Input
              autoFocus={autoFocus}
              value={value}
              onValueChange={onChange}
              className={clsx([
                textStyles({
                  fontSize: defaultFontSize,
                  fontWeight: 'semibold',
                  fontFamily: 'rounded',
                }),
                placeholderStyle,
                accentCaretStyle,
              ])}
              spellCheck={false}
              style={{
                width: '100%',
                paddingLeft: paddingHorizontal,
                paddingRight: paddingHorizontal,
                paddingTop: paddingVertical,
                paddingBottom: paddingVertical,
                outline: 'none',
                backgroundColor:
                  semanticColorVars.backgroundColors.surfacePrimaryElevated,
                color: semanticColorVars.foregroundColors.label,
                height: '32px',
                overflow: 'hidden',
                borderRadius: defaultBorderRadius,
                border: 'none',
                fontFamily: 'SFRounded, system-ui',
              }}
              placeholder={placeholder}
              tabIndex={tabIndex}
              // otherwise blur triggers before onSelect
              onBlur={() => setTimeout(onBlur, 200)}
              onFocus={onFocus}
              ref={ref}
            />
          </Box>
          {open && (
            <Box
              backdropFilter="blur(26px)"
              background="surfaceMenu"
              width="full"
              style={{
                alignSelf: 'center',
                position: 'absolute',
                zIndex: 999999,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                borderRadius: 16,
                marginTop: 6,
                maxHeight: '380px',
                overflow: 'scroll',
              }}
            >
              <Command.List>
                {Object.keys(data).map((key) => {
                  return (
                    <Command.Group
                      className={textStyles({
                        color: 'labelTertiary',
                        fontSize: '12pt',
                        fontWeight: 'semibold',
                        fontFamily: 'rounded',
                      })}
                      key={key}
                      style={{
                        padding: '9.5px 7px 9px',
                      }}
                    >
                      <Box>
                        {data[key].map(
                          (item: Chain) => (
                            <Command.Item
                              className={selectedItem}
                              key={`${key}_${item.name}`}
                              style={{
                                margin: '1px 0',
                                padding: '6px 8px',
                                borderRadius: '10px',
                                outline: 'none',
                              }}
                              onSelect={() => onSelect(item.name)}
                              value={item.name}
                            >
                              <Inline alignVertical="center" space="8px">
                                <ExternalImage
                                  borderRadius="10px"
                                  customFallbackSymbol="globe"
                                  height={20}
                                  src={getCustomChainIconUrl(
                                    item.id,
                                    AddressZero,
                                  )}
                                  width={20}
                                />
                                <Text
                                  color="label"
                                  size="14pt"
                                  weight="semibold"
                                >
                                  {item.name}
                                </Text>
                              </Inline>
                            </Command.Item>
                          ),
                        )}
                      </Box>
                    </Command.Group>
                  );
                })}
              </Command.List>
            </Box>
          )}
        </Command>
      </Box>
    );
  },
);
