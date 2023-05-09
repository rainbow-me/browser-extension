import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { POPUP_URL, goToNewTab } from '~/core/utils/tabs';
import {
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Text,
} from '~/design-system';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useAuth } from '../../hooks/useAuth';
import { useIsFullScreen } from '../../hooks/useIsFullScreen';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

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
                    borderWidth="2px"
                    position="relative"
                    marginLeft="-10px"
                    style={{
                      zIndex: 100 + index,
                      borderRadius: '36px',
                      borderColor: '#363739', // TODO - use SVG Mask
                    }}
                  >
                    <WalletAvatar
                      address={address}
                      size={36}
                      emojiSize="26pt"
                    />
                  </Box>
                ))}
                {accounts.length > 11 && rowIndex === 1 && (
                  <Box
                    position="relative"
                    borderWidth="2px"
                    marginLeft="-10px"
                    style={{
                      zIndex: 112,
                      borderRadius: '36px',
                      borderColor: '#363739', // TODO - use SVG Mask
                      width: '36px',
                      height: '36px',
                      backgroundColor: '#363739',
                    }}
                  >
                    <Text
                      color="label"
                      size="26pt"
                      weight="regular"
                      align="center"
                    >
                      ...
                    </Text>
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
  const { accounts } = state;

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
        navigate(ROUTES.CREATE_PASSWORD);
      }
    } else {
      navigate(ROUTES.HOME);
      setTimeout(() => {
        navigate(ROUTES.WALLET_SWITCHER);
      }, 300);
    }
  }, [isFullScreen, navigate, status]);

  return (
    <FullScreenContainer>
      <Box
        justifyContent={'center'}
        display="flex"
        alignItems="center"
        paddingBottom="10px"
        flexDirection="column"
        style={{ flex: 1 }}
      >
        <PyramidAvatar accounts={accounts} />

        <Box
          justifyContent={'center'}
          display="flex"
          alignItems="center"
          paddingBottom="10px"
          flexDirection="column"
          style={{ marginTop: '24px' }}
        >
          <Text size="16pt" weight="bold" color="label" align="center">
            {i18n.t('hw.connection_successful_title')}
          </Text>
          <Box padding="16px" paddingTop="10px">
            <Text
              size="12pt"
              weight="regular"
              color="labelTertiary"
              align="center"
            >
              {i18n.t('hw.connection_successful_description')}
            </Text>
          </Box>
        </Box>
        <Box width="full" style={{ width: '106px' }}>
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
        <Box
          paddingTop="28px"
          alignItems="center"
          justifyContent="center"
          display="flex"
        >
          <Button
            symbol="arrow.uturn.down.circle.fill"
            symbolSide="left"
            color="surfaceSecondaryElevated"
            height="44px"
            variant="flat"
            width="full"
            onClick={goHome}
          >
            {i18n.t('hw.done')}
          </Button>
        </Box>
      </Box>
    </FullScreenContainer>
  );
}
