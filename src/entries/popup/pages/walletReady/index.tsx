import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

import { i18n } from '~/core/languages';
import { Box, Column, Columns, Inline, Symbol, Text } from '~/design-system';

import { Blur } from '../../components/FullScreen/Blur';

export function WalletReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setReady(true);
    }, 1000);
  });
  return (
    <Box
      position="absolute"
      display="flex"
      width="full"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      height="full"
      background="surfacePrimary"
    >
      <Blur />
      {ready && (
        <>
          <ReactConfetti />
          <Box
            style={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              width: '100vw',
              height: '100vh',
              backgroundImage: 'url(static/images/bg/noise.png)',
              opacity: 0.35,
              backgroundRepeat: 'repeat',
              mixBlendMode: 'soft-light',
            }}
            background="surfacePrimary"
          />
          <Box
            alignItems="center"
            justifyContent="center"
            width="fit"
            display="flex"
          ></Box>
          <Box
            alignItems="center"
            justifyContent="center"
            width="fit"
            display="flex"
            paddingBottom="80px"
          >
            <Text size="44pt" weight="heavy" color="label" align="center">
              {i18n.t('wallet_ready.title')}
            </Text>
          </Box>
          <Box>
            <Columns space="24px">
              <Column>
                <Box
                  background="surfaceSecondary"
                  borderRadius="20px"
                  borderColor="buttonStroke"
                  borderWidth="1px"
                  padding="20px"
                  position="relative"
                  style={{
                    width: '300px',
                    height: '175px',
                  }}
                >
                  <a
                    href="https://learn.rainbow.me/get-started-with-rainbow"
                    target="_blank"
                    rel="noreferer noopener noreferrer"
                  >
                    <Box paddingBottom="12px">
                      <Text
                        size="12pt"
                        weight="bold"
                        color="labelTertiary"
                        align="left"
                      >
                        {i18n.t('wallet_ready.essentials')}
                      </Text>
                    </Box>
                    <Box paddingBottom="14px">
                      <Text
                        size="23pt"
                        weight="heavy"
                        color="label"
                        align="left"
                      >
                        {i18n.t('wallet_ready.get_started_with_rainbow')}
                      </Text>
                    </Box>
                    <Text
                      size="12pt"
                      weight="medium"
                      color="label"
                      align="left"
                    >
                      {i18n.t('wallet_ready.get_started_with_rainbow_desc')}
                    </Text>
                    <Box
                      position="absolute"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{
                        width: '36px',
                        height: '36px',
                        right: '20px',
                        top: '20px',
                        background:
                          'radial-gradient(100% 100% at 0% 50%, rgba(245, 248, 255, 0.02) 0%, rgba(245, 248, 255, 0.06) 100%)',
                        borderRadius: '100px',
                      }}
                    >
                      <Text
                        size="16pt"
                        weight="bold"
                        color="labelTertiary"
                        align="left"
                      >
                        🌈
                      </Text>
                    </Box>
                  </a>
                </Box>
              </Column>
              <Column>
                <Box
                  background="surfaceSecondary"
                  borderRadius="20px"
                  borderColor="buttonStroke"
                  borderWidth="1px"
                  padding="20px"
                  position="relative"
                  style={{
                    width: '300px',
                    height: '175px',
                  }}
                >
                  <a
                    href="https://learn.rainbow.me/"
                    target="_blank"
                    rel="noreferer noopener noreferrer"
                  >
                    <Box paddingBottom="12px">
                      <Text
                        size="12pt"
                        weight="bold"
                        color="labelTertiary"
                        align="left"
                      >
                        {i18n.t('wallet_ready.essentials')}
                      </Text>
                    </Box>
                    <Box paddingBottom="14px">
                      <Text
                        size="23pt"
                        weight="heavy"
                        color="label"
                        align="left"
                      >
                        {i18n.t('wallet_ready.discover_shortcuts')}
                      </Text>
                    </Box>
                    <Text
                      size="12pt"
                      weight="medium"
                      color="label"
                      align="left"
                    >
                      {i18n.t('wallet_ready.discover_shortcuts_desc')}
                    </Text>
                    <Box
                      position="absolute"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{
                        width: '36px',
                        height: '36px',
                        right: '20px',
                        top: '20px',
                        background:
                          'radial-gradient(100% 100% at 0% 50%, rgba(245, 248, 255, 0.02) 0%, rgba(245, 248, 255, 0.06) 100%)',
                        borderRadius: '100px',
                      }}
                    >
                      <Symbol
                        weight="bold"
                        symbol="command"
                        size={17}
                        color="label"
                      />
                    </Box>
                  </a>
                </Box>
              </Column>
            </Columns>
          </Box>
          <Box
            background="surfaceSecondary"
            borderRadius="20px"
            borderColor="buttonStroke"
            borderWidth="1px"
            padding="16px"
            position="absolute"
            style={{
              top: '5px',
              right: '7px',
              width: '233px',
              height: '86px',
            }}
          >
            <Box paddingBottom="16px">
              <Text size="14pt" weight="bold" color="label" align="center">
                {i18n.t('wallet_ready.pin_rainbow_to_your_toolbar')}
              </Text>
            </Box>
            <Inline space="16px">
              <Box
                background="surfaceSecondaryElevated"
                style={{
                  width: '120px',
                  height: '28px',
                  borderTopRightRadius: '100px',
                  borderEndEndRadius: '100px',
                }}
              ></Box>
              <Box
                background="surfaceSecondaryElevated"
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '100px',
                }}
              >
                <svg
                  width="14"
                  height="13"
                  viewBox="0 0 14 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.4 13H1.5C1.23333 13 1 12.8972 0.8 12.6917C0.6 12.4861 0.5 12.2389 0.5 11.95V9.01667C0.988889 8.96111 1.40833 8.76944 1.75833 8.44167C2.10833 8.11389 2.28333 7.71111 2.28333 7.23333C2.28333 6.75556 2.10833 6.35278 1.75833 6.025C1.40833 5.69722 0.988889 5.50556 0.5 5.45V2.51667C0.5 2.26111 0.6 2.03056 0.8 1.825C1 1.61944 1.23333 1.51667 1.5 1.51667H4.43333C4.55556 1.07222 4.76667 0.708333 5.06667 0.425C5.36667 0.141667 5.73889 0 6.18333 0C6.61667 0 7.00556 0.141667 7.35 0.425C7.69444 0.708333 7.92778 1.07222 8.05 1.51667H10.9833C11.2389 1.51667 11.4694 1.61944 11.675 1.825C11.8806 2.03056 11.9833 2.26111 11.9833 2.51667V5.45C12.4278 5.57222 12.7917 5.80556 13.075 6.15C13.3583 6.49444 13.5 6.88333 13.5 7.31667C13.5 7.76111 13.3583 8.13333 13.075 8.43333C12.7917 8.73333 12.4278 8.94444 11.9833 9.06667V12C11.9833 12.2667 11.8806 12.5 11.675 12.7C11.4694 12.9 11.2389 13 10.9833 13H8.08333C8.02778 12.4667 7.81667 12.0361 7.45 11.7083C7.08333 11.3806 6.66111 11.2167 6.18333 11.2167C5.76111 11.2167 5.37222 11.3806 5.01667 11.7083C4.66111 12.0361 4.45556 12.4667 4.4 13Z"
                    fill="white"
                  />
                </svg>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="center">
                <svg
                  width="4"
                  height="14"
                  viewBox="0 0 4 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.5 2C3.5 2.82843 2.82843 3.5 2 3.5C1.17157 3.5 0.5 2.82843 0.5 2C0.5 1.17157 1.17157 0.5 2 0.5C2.82843 0.5 3.5 1.17157 3.5 2Z"
                    fill="#F1F3F4"
                  />
                  <path
                    d="M3.5 7C3.5 7.82843 2.82843 8.5 2 8.5C1.17157 8.5 0.5 7.82843 0.5 7C0.5 6.17157 1.17157 5.5 2 5.5C2.82843 5.5 3.5 6.17157 3.5 7Z"
                    fill="#F1F3F4"
                  />
                  <path
                    d="M3.5 12C3.5 12.8284 2.82843 13.5 2 13.5C1.17157 13.5 0.5 12.8284 0.5 12C0.5 11.1716 1.17157 10.5 2 10.5C2.82843 10.5 3.5 11.1716 3.5 12Z"
                    fill="#F1F3F4"
                  />
                </svg>
              </Box>
            </Inline>
          </Box>
        </>
      )}
    </Box>
  );
}
