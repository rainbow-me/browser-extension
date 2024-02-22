import React, { useImperativeHandle, useRef } from 'react';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { txSpeedEmoji } from '~/core/references/txSpeed';
import { ChainId } from '~/core/types/chains';
import {
  GasFeeLegacyParamsBySpeed,
  GasFeeParamsBySpeed,
  GasSpeed,
} from '~/core/types/gas';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { accentFocusVisibleStyle } from '~/design-system/components/Lens/Lens.css';
import { Space } from '~/design-system/styles/designTokens';

import { simulateClick } from '../../utils/simulateClick';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';

const speeds = [GasSpeed.URGENT, GasSpeed.FAST, GasSpeed.NORMAL];

export const SwitchSpeedMenuSelector = ({
  gasFeeParamsBySpeed,
  chainId,
  selectedValue,
}: {
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed | null;
  chainId: Chain['id'];
  selectedValue?: string;
}) => {
  return (
    <>
      {ChainId.mainnet === chainId ? (
        <DropdownMenuRadioItem value={'custom'} selectedValue={selectedValue}>
          <Box width="full" testId={`switch-network-item-${chainId}`}>
            <Inline
              space="8px"
              alignVertical="center"
              alignHorizontal="justify"
            >
              <Inline space="8px" alignVertical="center">
                <Text weight="semibold" size="14pt">
                  {txSpeedEmoji[GasSpeed.CUSTOM]}
                </Text>
                <Text color="label" size="14pt" weight="semibold">
                  {i18n.t(`transaction_fee.custom`)}
                </Text>
              </Inline>

              <Symbol
                weight="medium"
                size={12}
                symbol="arrow.up.forward.circle"
                color="labelTertiary"
              />
            </Inline>
          </Box>
        </DropdownMenuRadioItem>
      ) : null}
      {speeds.map((speed, i) => {
        return (
          <DropdownMenuRadioItem
            value={speed}
            key={i}
            selectedValue={selectedValue}
          >
            <Box testId={`switch-network-item-${chainId}`}>
              <Inline space="8px" alignVertical="center">
                <Text weight="semibold" size="14pt">
                  {txSpeedEmoji[speed]}
                </Text>
                <Stack space="6px">
                  <Text color="label" size="14pt" weight="semibold">
                    {i18n.t(`transaction_fee.${speed}`)}
                  </Text>
                  <Text color="label" size="11pt" weight="medium">
                    {gasFeeParamsBySpeed?.[speed].display}
                  </Text>
                </Stack>
              </Inline>
            </Box>
            <DropdownMenuItemIndicator style={{ marginLeft: 'auto' }}>
              <Symbol weight="medium" symbol="checkmark" size={11} />
            </DropdownMenuItemIndicator>
          </DropdownMenuRadioItem>
        );
      })}
    </>
  );
};

interface SwitchTransactionSpeedMenuProps {
  dropdownContentMarginRight?: Space;
  selectedSpeed: GasSpeed;
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed | null;
  chainId: Chain['id'];
  editable?: boolean;
  onSpeedChanged: (speed: GasSpeed) => void;
  accentColor?: string | 'accent';
  plainTriggerBorder?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SwitchTransactionSpeedMenu = React.forwardRef<
  { open: () => void },
  SwitchTransactionSpeedMenuProps
>(function SwitchTransactionSpeedMenu(
  {
    dropdownContentMarginRight,
    selectedSpeed,
    gasFeeParamsBySpeed,
    onSpeedChanged,
    chainId,
    editable = true,
    accentColor,
    plainTriggerBorder,
    onOpenChange,
  }: SwitchTransactionSpeedMenuProps,
  forwardedRef,
) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(forwardedRef, () => ({
    open: () => {
      simulateClick(triggerRef?.current);
    },
  }));

  const menuTrigger = (
    <Box
      style={{
        height: 28,
      }}
      borderWidth="2px"
      borderColor={plainTriggerBorder ? 'fillSecondary' : 'accent'}
      paddingVertical="5px"
      paddingHorizontal="6px"
      borderRadius="24px"
      as="button"
      ref={triggerRef}
      className={accentFocusVisibleStyle}
      tabIndex={editable ? 0 : -1}
    >
      <Inline space="6px" alignVertical="center">
        <Text color="label" weight="bold" size="14pt">
          {txSpeedEmoji[selectedSpeed]}
        </Text>

        <Text color="label" weight="bold" size="14pt">
          {i18n.t(`transaction_fee.${selectedSpeed}`)}
        </Text>
        {editable ? (
          <Symbol
            weight="medium"
            color="label"
            size={14}
            symbol="chevron.down.circle"
          />
        ) : null}
      </Inline>
    </Box>
  );
  if (!editable) return menuTrigger;
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild accentColor={accentColor}>
        {menuTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        marginRight={dropdownContentMarginRight}
        accentColor={accentColor}
      >
        <DropdownMenuLabel>{i18n.t('transaction_fee.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedSpeed}
          onValueChange={(speed) => onSpeedChanged(speed as GasSpeed)}
        >
          <SwitchSpeedMenuSelector
            chainId={chainId}
            gasFeeParamsBySpeed={gasFeeParamsBySpeed}
            selectedValue={selectedSpeed}
          />
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
