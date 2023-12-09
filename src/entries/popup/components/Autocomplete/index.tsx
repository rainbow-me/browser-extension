import { Command } from 'cmdk';
import { forwardRef } from 'react';

import { Box } from '~/design-system';
import { stylesForHeight } from '~/design-system/components/Input/Input';
import { BoxStyles, semanticColorVars } from '~/design-system/styles/core.css';

export interface AutocompleteItem {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface AutocompleteData {
  [key: string]: AutocompleteItem[];
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
}

export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  (
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
    }: AutocompleteProps,
    ref,
  ) => {
    const {
      borderRadius: defaultBorderRadius,
      fontSize: defaultFontSize,
      paddingHorizontal,
      paddingVertical,
    } = stylesForHeight['32px'];

    return (
      <Box position="relative">
        <Command label="">
          <Box
            borderColor={borderColor as BoxStyles['borderColor']}
            borderRadius={defaultBorderRadius}
            borderWidth="1px"
          >
            <Command.Input
              value={value}
              onValueChange={onChange}
              style={{
                width: '100%',
                fontSize: defaultFontSize?.replace('pt', 'px'),
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
              }}
              placeholder={placeholder}
              // otherwise blur triggers before onSelect
              onBlur={() => setTimeout(onBlur, 200)}
              onFocus={onFocus}
              ref={ref}
            />
          </Box>
          {open && (
            <Box
              borderColor={'accent'}
              background="surfacePrimaryElevated"
              style={{
                position: 'absolute',
                zIndex: 999999,
                width: '100%',
                boxShadow: '2px 12px 12px rgba(0, 0, 0, 0.65)',
                borderRadius: defaultBorderRadius,
                maxHeight: '380px',
                overflow: 'scroll',
              }}
            >
              <Command.List>
                {Object.keys(data).map((key) => {
                  return (
                    <Command.Group
                      heading={key}
                      key={key}
                      style={{
                        color:
                          semanticColorVars.foregroundColors.labelSecondary,
                        fontSize: '12px',
                        padding: '20px 18px',
                      }}
                    >
                      <Box paddingTop="12px">
                        {data[key].map((item: { name: string }) => (
                          <Box key={`${key}_${item.name}`}>
                            <Command.Item
                              style={{
                                padding: '8px 12px',
                                fontSize: '14px',
                                lineHeight: '20px',
                                borderRadius: '8px',
                                outline: 'none',
                                backgroundColor:
                                  semanticColorVars.backgroundColors
                                    .surfacePrimaryElevated,
                                color: semanticColorVars.foregroundColors.label,
                              }}
                              onSelect={() => onSelect(item.name)}
                              value={item.name}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  semanticColorVars.backgroundColors.surfaceSecondaryElevated;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  semanticColorVars.backgroundColors.surfacePrimaryElevated;
                              }}
                            >
                              {item.name}
                            </Command.Item>
                          </Box>
                        ))}
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

Autocomplete.displayName = 'Autocomplete';
