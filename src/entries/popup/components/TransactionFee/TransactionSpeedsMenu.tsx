import React from 'react';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';

import {
  Menu,
  MenuContent,
  MenuItemIndicator,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from '../Menu/Menu';

export type Speed = 'urgent' | 'fast' | 'normal' | 'custom';

// const speeds: Speed[] = ['custom', 'urgent', 'fast', 'normal'];

const SPEED_EMOJIS: { [key in Speed]: string } = {
  urgent: '🚨',
  fast: '🚀',
  normal: '⏱',
  custom: '⚙️',
};

export const SwitchSpeedMenuSelector = () => {
  return (
    <>
      <MenuRadioItem value={'custom'}>
        <Box width="full" id={`switch-network-item-${0}`}>
          <Inline space="8px" alignVertical="center" alignHorizontal="justify">
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
      </MenuRadioItem>
      {['urgent', 'fast', 'normal'].map((speed, i) => {
        return (
          <MenuRadioItem value={speed} key={i}>
            <Box id={`switch-network-item-${i}`}>
              <Inline space="8px" alignVertical="center">
                <Text weight="semibold" size="14pt">
                  {SPEED_EMOJIS[speed as Speed]}
                </Text>
                <Stack space="6px">
                  <Text color="label" size="14pt" weight="semibold">
                    {i18n.t(`transaction_fee.${speed}`)}
                  </Text>
                  <Text color="label" size="11pt" weight="medium">
                    {'5 Gwei'}
                  </Text>
                </Stack>
              </Inline>
            </Box>
            <MenuItemIndicator style={{ marginLeft: 'auto' }}>
              <Symbol weight="medium" symbol="checkmark" size={11} />
            </MenuItemIndicator>
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
                <Symbol weight="medium" color="label" size={14} symbol="chevron.down.circle" />
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
