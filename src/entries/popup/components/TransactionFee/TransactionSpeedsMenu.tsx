import React from 'react';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, Inline, Text } from '~/design-system';

import {
  Menu,
  MenuContent,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from '../Menu/Menu';
import { SFSymbol } from '../SFSymbol/SFSymbol';

export type Speed = 'urgent' | 'fast' | 'normal' | 'custom';

const speeds: Speed[] = ['custom', 'urgent', 'fast', 'normal'];

const SPEED_EMOJIS: { [key in Speed]: string } = {
  urgent: '🚨',
  fast: '🚀',
  normal: '⏱',
  custom: '⚙️',
};

export const SwitchSpeedMenuSelector = () => {
  return (
    <>
      {speeds.map((speed, i) => {
        return (
          <MenuRadioItem value={speed} key={i}>
            <Box id={`switch-network-item-${i}`}>
              <Inline space="8px" alignVertical="center">
                <Text weight="semibold" size="14pt">
                  {SPEED_EMOJIS[speed]}
                </Text>
                <Text color="label" size="14pt" weight="semibold">
                  {i18n.t(`transaction_fee.${speed}`)}
                </Text>
              </Inline>
            </Box>
          </MenuRadioItem>
        );
      })}
    </>
  );
};

interface SwitchTransactionSpeedMenuProps {
  speed: Speed;
  chainId: Chain['id'];
  onSpeedChanged: (speed: Speed) => void;
}

export const SwitchTransactionSpeedMenu = ({
  speed,
  onSpeedChanged,
}: SwitchTransactionSpeedMenuProps) => {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Box style={{ cursor: 'default' }}>
          {
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
                  {SPEED_EMOJIS[speed]}
                </Text>

                <Text color="label" weight="bold" size="14pt">
                  {i18n.t(`transaction_fee.${speed}`)}
                </Text>
                <SFSymbol color="label" size={14} symbol="chevronDownCircle" />
              </Inline>
            </Box>
          }
        </Box>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>{i18n.t('transaction_fee.title')}</MenuLabel>
        <MenuSeparator />
        <MenuRadioGroup
          value={speed}
          onValueChange={(speed) => onSpeedChanged(speed as Speed)}
        >
          <SwitchSpeedMenuSelector />
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
};
