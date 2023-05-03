import React from 'react';

import { i18n } from '~/core/languages';
import {
  Box,
  Button,
  Row,
  Rows,
  Separator,
  Symbol,
  Text,
} from '~/design-system';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import {
  IconAndCopyItem,
  IconAndCopyList,
} from '../../components/IconAndCopyList.tsx/IconAndCopyList';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const iconAndCopyList: IconAndCopyItem[] = [
  {
    icon: {
      symbol: 'highlighter',
      color: 'blue',
    },
    copy: i18n.t('seed_backup_prompt.warning_1'),
  },
  {
    icon: {
      symbol: 'exclamationmark.triangle',
      color: 'orange',
    },
    copy: i18n.t('seed_backup_prompt.warning_2'),
  },
  {
    icon: {
      symbol: 'lock.open.fill',
      color: 'red',
    },
    copy: i18n.t('seed_backup_prompt.warning_3'),
  },
];

export function SeedBackupPrompt() {
  const navigate = useRainbowNavigate();

  const handleShowRecoveryPhraseClick = React.useCallback(() => {
    navigate(ROUTES.SEED_REVEAL);
  }, [navigate]);

  const handleSkipClick = React.useCallback(() => {
    navigate(ROUTES.CREATE_PASSWORD);
  }, [navigate]);

  return (
    <FullScreenContainer>
      <Box height="full">
        <Rows space="20px" alignVertical="justify">
          <Row>
            <Box>
              <Rows alignHorizontal="center" space="24px">
                <Row>
                  <Rows alignHorizontal="center" space="24px">
                    <Row>
                      <Box width="fit" alignItems="center">
                        <Box
                          borderRadius="round"
                          boxShadow="18px accent"
                          borderWidth="1px"
                          style={{
                            height: 60,
                            width: 60,
                            overflow: 'hidden',
                            borderColor: 'rgba(255, 255, 255, 0.03)',
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
                      </Box>
                    </Row>

                    <Row>
                      <Box alignItems="center" style={{ width: '279px' }}>
                        <Text
                          size="16pt"
                          weight="bold"
                          color="label"
                          align="center"
                        >
                          {i18n.t('seed_backup_prompt.title')}
                        </Text>
                      </Box>
                    </Row>
                  </Rows>
                </Row>

                <Row>
                  <Box style={{ width: '104px' }}>
                    <Separator color="separatorTertiary" strokeWeight="1px" />
                  </Box>
                </Row>

                <Row>
                  <Box paddingHorizontal="16px">
                    <IconAndCopyList iconAndCopyList={iconAndCopyList} />
                  </Box>
                </Row>
              </Rows>
            </Box>
          </Row>

          <Row height="content">
            <Box width="full">
              <Rows alignVertical="top" space="8px">
                <Button
                  color="accent"
                  height="44px"
                  variant="flat"
                  width="full"
                  symbol="checkmark.circle.fill"
                  blur="26px"
                  onClick={handleShowRecoveryPhraseClick}
                  testId="show-recovery-phrase-button"
                >
                  {i18n.t('seed_backup_prompt.reveal_your_recovery_phrase')}
                </Button>

                <Button
                  color="labelSecondary"
                  height="44px"
                  variant="transparent"
                  width="full"
                  onClick={handleSkipClick}
                  testId="skip-button"
                >
                  {i18n.t('seed_backup_prompt.take_me_to_wallet')}
                </Button>
              </Rows>
            </Box>
          </Row>
        </Rows>
      </Box>
    </FullScreenContainer>
  );
}
