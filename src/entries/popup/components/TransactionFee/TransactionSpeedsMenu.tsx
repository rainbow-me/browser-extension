import React from 'react';
import { Chain, chain } from 'wagmi';

import { i18n } from '~/core/languages';
import {
  GasFeeLegacyParamsBySpeed,
  GasFeeParamsBySpeed,
  GasSpeed,
} from '~/core/types/gas';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';

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

const speeds: GasSpeed[] = ['urgent', 'fast', 'normal'];

const SPEED_EMOJIS: { [key in GasSpeed]: string } = {
  urgent: '🚨',
  fast: '🚀',
  normal: '⏱',
  custom: '⚙️',
};

export const SwitchSpeedMenuSelector = ({
  gasFeeParamsBySpeed,
  chainId,
}: {
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed;
  chainId: Chain['id'];
}) => {
  return (
    <>
      {chain.mainnet.id === chainId ? (
        <DropdownMenuRadioItem value={'custom'}>
          <Box width="full" id={`switch-network-item-${0}`}>
            <Inline
              space="8px"
              alignVertical="center"
              alignHorizontal="justify"
            >
              <Inline space="8px" alignVertical="center">
                <Text weight="semibold" size="14pt">
                  {SPEED_EMOJIS['custom']}
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
          <DropdownMenuRadioItem value={speed} key={i}>
            <Box id={`switch-network-item-${i}`}>
              <Inline space="8px" alignVertical="center">
                <Text weight="semibold" size="14pt">
                  {SPEED_EMOJIS[speed as GasSpeed]}
                </Text>
                <Stack space="6px">
                  <Text color="label" size="14pt" weight="semibold">
                    {i18n.t(`transaction_fee.${speed}`)}
                  </Text>
                  <Text color="label" size="11pt" weight="medium">
                    {gasFeeParamsBySpeed[speed].display}
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
  selectedSpeed: GasSpeed;
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed;
  chainId: Chain['id'];
  editable?: boolean;
  onSpeedChanged: (speed: GasSpeed) => void;
}

export const SwitchTransactionSpeedMenu = ({
  selectedSpeed,
  gasFeeParamsBySpeed,
  onSpeedChanged,
  chainId,
  editable = true,
}: SwitchTransactionSpeedMenuProps) => {
  const menuTrigger = (
    <Box style={{ cursor: 'default' }}>
      <Box
        borderWidth="2px"
        borderColor="fillSecondary"
        paddingVertical="5px"
        paddingHorizontal="6px"
        borderRadius="24px"
        as="button"
      >
        <Inline space="6px" alignVertical="center">
          <Text color="label" weight="bold" size="14pt">
            {SPEED_EMOJIS[selectedSpeed]}
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
    </Box>
  );
  if (!editable) return menuTrigger;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{menuTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{i18n.t('transaction_fee.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedSpeed}
          onValueChange={(speed) => onSpeedChanged(speed as GasSpeed)}
        >
          <SwitchSpeedMenuSelector
            chainId={chainId}
            gasFeeParamsBySpeed={gasFeeParamsBySpeed}
          />
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
