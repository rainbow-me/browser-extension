import { AnimatePresence, motion } from 'framer-motion';
import { KeyboardEventHandler, useCallback, useState } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import {
  Box,
  Button,
  Inline,
  Inset,
  Row,
  Rows,
  Stack,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { Input } from '~/design-system/components/Input/Input';
import { accentColorAsHsl } from '~/design-system/styles/core.css';
import {
  backgroundColors,
  globalColors,
} from '~/design-system/styles/designTokens';
import { Checkbox } from '~/entries/popup/components/Checkbox/Checkbox';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { ICON_SIZE } from '~/entries/popup/components/Tabs/TabBar';
import PointsSelectedIcon from '~/entries/popup/components/Tabs/TabIcons/PointsSelected';
import { useAvatar } from '~/entries/popup/hooks/useAvatar';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { INVALID_REFERRAL_CODE_ERROR } from './references';
import {
  useReferralValidation,
  validateAsciiCodeFormat,
} from './useReferralCodeValidation';

const maskAsciiInput = (inputValue: string): string => {
  const asciiRegex = /[\x20-\x7E]/g;
  let filteredInput = inputValue.match(asciiRegex)?.join('') || '';
  if (filteredInput.length > 3 && filteredInput[3] !== '-') {
    filteredInput = filteredInput.slice(0, 3) + '-' + filteredInput.slice(3);
  }
  return filteredInput.substring(0, 7).toUpperCase();
};

export const PointsReferralSheet = () => {
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });
  const { currentTheme } = useCurrentThemeStore();
  const [referralCode, setReferralCode] = useState('');

  const { data } = useReferralValidation({
    address: currentAddress,
    referralCode,
  });

  const validCodeFormat = validateAsciiCodeFormat(referralCode);

  const invalidReferralCode =
    validCodeFormat &&
    data?.validateReferral?.error?.type === INVALID_REFERRAL_CODE_ERROR;
  const validReferralCode = validCodeFormat && data?.validateReferral?.valid;

  const backToHome = () =>
    navigate(ROUTES.HOME, {
      state: { skipTransitionOnRoute: ROUTES.HOME },
    });

  const navigateToOnboarding = useCallback(
    () =>
      navigate(ROUTES.POINTS_ONBOARDING, {
        state: {
          skipTransitionOnRoute: ROUTES.HOME,
          referralCode: referralCode.replace('-', ''),
        },
      }),
    [navigate, referralCode],
  );

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = maskAsciiInput(e.target.value);
      setReferralCode(maskedValue);
    },
    [],
  );

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === 'Enter' && validReferralCode) {
        navigateToOnboarding();
      }
    },
    [navigateToOnboarding, validReferralCode],
  );

  return (
    <BottomSheet zIndex={zIndexes.ACTIVITY_DETAILS} show>
      <Navbar leftComponent={<Navbar.BackButton onClick={backToHome} />} />
      <Box style={{ height: '400px' }} height="full">
        <Rows alignVertical="justify">
          <Row>
            <Box alignItems="center" paddingTop="40px">
              <Stack space="14px">
                <Box
                  alignItems="center"
                  display="flex"
                  justifyContent="center"
                  style={{
                    transform: 'translateY(-4px)',
                  }}
                >
                  <Box
                    alignItems="center"
                    display="flex"
                    justifyContent="center"
                    key="pointsAnimation"
                    style={{
                      height: 28,
                      width: 28,
                      willChange: 'transform',
                    }}
                  >
                    <Box
                      position="relative"
                      style={{
                        height: ICON_SIZE,
                        transform: 'scale(0.5)',
                        transformOrigin: 'top left',
                        width: ICON_SIZE,
                        willChange: 'transform',
                      }}
                    >
                      <PointsSelectedIcon
                        accentColor={avatar?.color || globalColors.blue50}
                        colorMatrixValues={null}
                        tintBackdrop={
                          currentTheme === 'dark'
                            ? backgroundColors.surfacePrimaryElevated.dark.color
                            : backgroundColors.surfacePrimaryElevated.light
                                .color
                        }
                        tintOpacity={currentTheme === 'dark' ? 0.2 : 0}
                      />
                    </Box>
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Stack alignHorizontal="center" space="16px">
              <Inset bottom="10px" top="10px" horizontal="40px">
                <Stack space="16px">
                  <Text
                    align="center"
                    size="20pt"
                    weight="semibold"
                    color="labelTertiary"
                  >
                    {i18n.t('points.referral_header')}
                  </Text>
                  <Text
                    align="center"
                    color="labelQuaternary"
                    size="12pt"
                    weight="medium"
                  >
                    {i18n.t('points.referral_description')}
                  </Text>
                </Stack>
              </Inset>

              <Box
                position="relative"
                style={{ width: validReferralCode ? '110px' : '90px' }}
              >
                <Stack space="14px">
                  <Inline alignVertical="center">
                    <Input
                      height="32px"
                      placeholder="XXX-XXX"
                      variant="bordered"
                      borderColor={invalidReferralCode ? 'red' : 'accent'}
                      value={referralCode}
                      onChange={handleOnChange}
                      style={{
                        caretColor: invalidReferralCode
                          ? globalColors.red50
                          : accentColorAsHsl,
                        paddingRight: validReferralCode ? 14 : 0,
                      }}
                      onKeyDown={onKeyDown}
                    />
                    <AnimatePresence initial={false}>
                      {validReferralCode && (
                        <Box
                          as={motion.div}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key="check"
                          position="absolute"
                          right="8px"
                        >
                          <Checkbox borderColor="accent" selected />
                        </Box>
                      )}
                    </AnimatePresence>
                  </Inline>
                  <AnimatePresence initial={false}>
                    {invalidReferralCode && (
                      <Box
                        as={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={'invalid-text'}
                      >
                        <Text
                          align="center"
                          color="red"
                          size="12pt"
                          weight="medium"
                        >
                          {i18n.t('points.referral_code_invalid')}
                        </Text>
                      </Box>
                    )}
                  </AnimatePresence>
                </Stack>
              </Box>
            </Stack>
          </Row>
          <Row height="content">
            <Box padding="20px">
              <Inline alignHorizontal="center">
                {validReferralCode && (
                  <Button
                    onClick={navigateToOnboarding}
                    color="accent"
                    height="36px"
                    variant="raised"
                  >
                    {i18n.t('points.get_started')}
                  </Button>
                )}
              </Inline>
            </Box>
          </Row>
        </Rows>
      </Box>
    </BottomSheet>
  );
};
