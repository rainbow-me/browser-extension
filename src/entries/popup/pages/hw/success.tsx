import { Address } from '@wagmi/core';
import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import hardhwareWalletAvatarImageMask from 'static/assets/hardhwareWalletAvatarImageMask.svg';
import { i18n } from '~/core/languages';
import { POPUP_URL, goToNewTab } from '~/core/utils/tabs';
import {
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useAuth } from '../../hooks/useAuth';
import { useIsFullScreen } from '../../hooks/useIsFullScreen';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const AVATAR_MARGIN_LEFT = '-2.26px';

const PyramidAvatar = ({ accounts }: { accounts: Address[] }) => {
  let rows: Address[][] = [];
  // Less than 5 - one row
  if (accounts.length <= 5) {
    rows = [accounts];
    //  More than 11 - two rows (5 and 6) with the more icon
  } else if (accounts.length > 11) {
    rows = [accounts.slice(0, 5), accounts.slice(6, 12)];
    //  Less than 11 -  two rows with the top row always being <= -1 so it’s a pyramid
  } else {
    const row1Count = Math.ceil(accounts.length / 2) - 1;
    const row2Count = Math.ceil(accounts.length / 2) - 1;

    rows = [
      accounts.slice(0, row1Count),
      accounts.slice(row2Count, accounts.length),
    ];
  }

  return (
    <Box>
      <Rows space="6px">
        {rows.map((avatars, rowIndex) => (
          <Row key={`row_${rowIndex}`}>
            <Box justifyContent="center" display="flex">
              <Inline>
                {avatars.map((address: Address, index: number) => (
                  <Box
                    key={`avatar_${index}`}
                    position="relative"
                    style={{
                      zIndex: 100 + index,
                      borderRadius: '36px',
                      marginLeft: AVATAR_MARGIN_LEFT,
                    }}
                  >
                    <WalletAvatar
                      addressOrName={address}
                      size={36}
                      emojiSize="26pt"
                      background="transparent"
                      mask={
                        avatars.length === index + 1 &&
                        !(accounts.length > 11 && rowIndex === 1)
                          ? undefined
                          : hardhwareWalletAvatarImageMask
                      }
                    />
                  </Box>
                ))}
                {accounts.length > 11 && rowIndex === 1 && (
                  <Box
                    position="relative"
                    style={{
                      zIndex: 112,
                      borderRadius: '36px',
                      marginLeft: AVATAR_MARGIN_LEFT,
                      width: '36px',
                      height: '36px',
                      backgroundColor: '#363739',
                    }}
                  >
                    <Inline
                      alignHorizontal="center"
                      alignVertical="center"
                      height="full"
                    >
                      <Symbol symbol="ellipsis" weight="bold" size={16} />
                    </Inline>
                  </Box>
                )}
              </Inline>
            </Box>
          </Row>
        ))}
      </Rows>
    </Box>
  );
};

export function SuccessHW() {
  const navigate = useRainbowNavigate();
  const isFullScreen = useIsFullScreen();
  const { state } = useLocation();
  const { accounts, vendor } = state;

  const { status } = useAuth();
  // Only for testing purposes, to confirm the pyramid logic works fine.

  //   const accounts = [
  //     '0x37bD75826582532373D738F83b913C97447b0901',
  //     '0x37bD75826582532373D738F83b913C97447b0902',
  //     '0x37bD75826582532373D738F83b913C97447b0903',
  //     '0x37bD75826582532373D738F83b913C97447b0904',
  //     '0x37bD75826582532373D738F83b913C97447b0905',
  //     '0x37bD75826582532373D738F83b913C97447b0906',
  //     '0x37bD75826582532373D738F83b913C97447b0907',
  //     '0x37bD75826582532373D738F83b913C97447b0908',
  //     '0x37bD75826582532373D738F83b913C97447b0909',
  //     '0x37bD75826582532373D738F83b913C97447b0910',
  //     '0x37bD75826582532373D738F83b913C97447b0911',
  //     '0x37bD75826582532373D738F83b913C97447b0912',
  //     '0x37bD75826582532373D738F83b913C97447b0906',
  //     '0x37bD75826582532373D738F83b913C97447b0906',
  //     '0x37bD75826582532373D738F83b913C97447b0906',
  //     '0x37bD75826582532373D738F83b913C97447b0906',
  //     '0x37bD75826582532373D738F83b913C97447b0906',
  //     '0x37bD75826582532373D738F83b913C97447b0906',
  //   ] as Address[];

  const goHome = useCallback(() => {
    if (status === 'NEEDS_PASSWORD') {
      if (!isFullScreen) {
        goToNewTab({
          url: POPUP_URL + `#${ROUTES.CREATE_PASSWORD}`,
        });
      } else {
        navigate(ROUTES.CREATE_PASSWORD, { state: { backTo: ROUTES.WELCOME } });
      }
    } else {
      navigate(ROUTES.HOME, { state: { isBack: true } });
      setTimeout(() => {
        navigate(ROUTES.WALLET_SWITCHER);
      }, 300);
    }
  }, [isFullScreen, navigate, status]);

  return (
    <FullScreenContainer>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        style={{ flex: 1 }}
      >
        <Stack alignHorizontal="center" space="24px">
          <Box style={{ flex: 1 }}>
            <PyramidAvatar accounts={accounts} />
          </Box>

          <Box paddingHorizontal="28px">
            <Stack space="12px">
              <Text size="16pt" weight="bold" color="label" align="center">
                {i18n.t('hw.connection_successful_title')}
              </Text>
              <Text
                size="12pt"
                weight="regular"
                color="labelTertiary"
                align="center"
              >
                {i18n.t('hw.connection_successful_description', {
                  vendor:
                    vendor.substring(0, 1).toUpperCase() + vendor.substring(1),
                  count: accounts.length,
                  wallet_noun: i18n.t(
                    accounts.length > 1
                      ? 'hw.wallet_plural'
                      : 'hw.wallet_singular',
                  ),
                  wallet_pronoun: i18n.t(
                    accounts.length > 1
                      ? 'hw.wallet_pronoun_plural'
                      : 'hw.wallet_pronoun_singular',
                  ),
                })}
              </Text>
            </Stack>
          </Box>
          <Box width="full" style={{ width: '106px' }}>
            <Separator color="separatorTertiary" strokeWeight="1px" />
          </Box>
          <Box alignItems="center" justifyContent="center" display="flex">
            <Button
              testId={'hw-done'}
              symbol="return.left"
              symbolSide="left"
              color="surfaceSecondaryElevated"
              height="44px"
              variant="flat"
              width="full"
              onClick={goHome}
              enterCta
            >
              {i18n.t('hw.done')}
            </Button>
          </Box>
        </Stack>
      </Box>
    </FullScreenContainer>
  );
}
