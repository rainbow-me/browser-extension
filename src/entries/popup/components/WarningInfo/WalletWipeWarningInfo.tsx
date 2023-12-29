import React, { useMemo, useState } from 'react';

import { i18n } from '~/core/languages';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';

import { Checkbox } from '../Checkbox/Checkbox';
import {
  IconAndCopyItem,
  IconAndCopyList,
} from '../IconAndCopyList.tsx/IconAndCopyList';

const t = (s: string) =>
  i18n.t(s, { scope: 'settings.privacy_and_security.wallets_and_keys' });

interface WarningInfoProps {
  iconAndCopyList: IconAndCopyItem[];
  onProceed: () => void;
  testId?: string;
}

export default function WarningInfo({
  iconAndCopyList,
  onProceed,
  testId,
}: WarningInfoProps) {
  const [acknowledgeCheck, setacknowledgeCheck] = useState(false);

  const buttonEnabled = useMemo(() => acknowledgeCheck, [acknowledgeCheck]);
  return (
    <Box
      height="full"
      alignItems="center"
      paddingHorizontal="20px"
      style={{ height: 535 }}
    >
      <Rows alignVertical="justify">
        <Row>
          <Box alignItems="center">
            <Stack space="24px">
              <Inline alignHorizontal="center">
                <Box
                  borderRadius="round"
                  boxShadow="18px accent"
                  style={{
                    height: 60,
                    width: 60,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="full"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    position="relative"
                    style={{
                      background:
                        'radial-gradient(100% 144.46% at 0% 50%, #FF9233 0%, #FA423C 100%)',
                      zIndex: 1,
                    }}
                  >
                    <Symbol
                      symbol="exclamationmark.triangle.fill"
                      size={26}
                      color="label"
                      weight={'bold'}
                    />
                  </Box>
                </Box>
              </Inline>

              <Inline alignHorizontal="center">
                <Box alignItems="center" style={{ width: '106px' }}>
                  <Separator color="separatorTertiary" strokeWeight="1px" />
                </Box>
              </Inline>

              <Text size="16pt" weight="bold" color="label" align="center">
                {i18n.t('common_titles.before_you_proceed')}
              </Text>

              <Box paddingHorizontal="12px">
                <IconAndCopyList iconAndCopyList={iconAndCopyList} />
              </Box>
            </Stack>
          </Box>
        </Row>
        <Row height="content">
          <Columns alignVertical="center" alignHorizontal="center" space="7px">
            <Column width="content">
              <Checkbox
                width="16px"
                height="16px"
                borderRadius="6px"
                selected={acknowledgeCheck}
                backgroundSelected="blue"
                borderColorSelected="blue"
                borderColor="labelTertiary"
                onClick={() => setacknowledgeCheck(!acknowledgeCheck)}
              />
            </Column>
            <Column width="content">
              <Lens
                testId="wallet-wipe-check"
                onClick={() => setacknowledgeCheck(!acknowledgeCheck)}
              >
                <Text
                  align="left"
                  size="12pt"
                  weight="bold"
                  color="labelSecondary"
                >
                  {t('wipe_wallets.acknowlegement')}
                </Text>
              </Lens>
            </Column>
          </Columns>
        </Row>

        <Row height="content">
          <Box width="full" paddingVertical="20px">
            <Button
              testId={testId}
              color={buttonEnabled ? 'red' : 'fill'}
              height="44px"
              variant="flat"
              width="full"
              symbol={buttonEnabled ? 'trash' : 'arrow.up.circle.fill'}
              blur="26px"
              onClick={onProceed}
              disabled={!buttonEnabled}
            >
              {buttonEnabled ? 'Wipe Wallets' : 'Complete Check Above'}
            </Button>
          </Box>
        </Row>
      </Rows>
    </Box>
  );
}
