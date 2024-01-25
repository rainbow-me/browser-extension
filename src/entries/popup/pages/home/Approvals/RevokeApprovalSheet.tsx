import React, { useCallback, useEffect, useRef, useState } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { SearchAsset } from '~/core/types/search';
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
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

import { CoinIcon } from '../../../components/CoinIcon/CoinIcon';
import { Spinner } from '../../../components/Spinner/Spinner';
import { WalletAvatar } from '../../../components/WalletAvatar/WalletAvatar';
import { useWalletInfo } from '../../../hooks/useWalletInfo';
import playSound from '../../../utils/playSound';

export const RevokeApprovalSheet = ({
  show,
  asset,
  onCancel,
  onSend,
}: {
  show: boolean;
  asset?: SearchAsset | null;
  onCancel: () => void;
  onSend: () => void;
}) => {
  const { currentAddress } = useCurrentAddressStore();
  const [sending, setSending] = useState(false);
  const confirmSendButtonRef = useRef<HTMLButtonElement>(null);

  const { displayName: walletDisplayName } = useWalletInfo({
    address: currentAddress,
  });

  const handleSend = useCallback(async () => {
    if (!sending) {
      setSending(true);
      try {
        await onSend();
        playSound('SendSound');
      } catch (e) {
        //
      } finally {
        setSending(false);
      }
    }
  }, [onSend, sending]);

  useEffect(() => {
    if (show) {
      // using autoFocus breaks the sheet's animation, so we wait for it to finish then focus
      setTimeout(() => {
        confirmSendButtonRef.current?.focus();
      }, 500);
    }
  }, [show]);

  return (
    <BottomSheet show={show} onClickOutside={onCancel}>
      <Box
        style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        background="surfacePrimaryElevatedSecondary"
      >
        <Stack space="20px">
          <Box paddingVertical="26px">
            <Inline alignHorizontal="center" alignVertical="center">
              <Text size="14pt" weight="heavy" color="label">
                {i18n.t('send.review.title')}
              </Text>
            </Inline>
          </Box>
          <Box paddingHorizontal="24px" paddingVertical="20px">
            <Stack space="20px">
              <Rows space="10px">
                <Row>
                  <Columns alignHorizontal="justify">
                    <Column>
                      <Box paddingVertical="6px" height="full">
                        <Rows space="10px" alignVertical="center">
                          <Row>
                            <TextOverflow
                              size="20pt"
                              weight="bold"
                              color="label"
                            >
                              {''}
                            </TextOverflow>
                          </Row>
                        </Rows>
                      </Box>
                    </Column>
                    <Column>
                      <Inline alignVertical="center" alignHorizontal="right">
                        <Box>
                          <CoinIcon asset={asset} size={44} />
                        </Box>
                      </Inline>
                    </Column>
                  </Columns>
                </Row>
                <Row>
                  <Columns alignHorizontal="justify">
                    <Column width="4/5">
                      <Box paddingVertical="6px" height="full">
                        <TextOverflow size="20pt" weight="bold" color="label">
                          {walletDisplayName}
                        </TextOverflow>
                      </Box>
                    </Column>
                    <Column>
                      <Inline alignHorizontal="right">
                        <WalletAvatar
                          addressOrName={currentAddress}
                          size={44}
                        />
                      </Inline>
                    </Column>
                  </Columns>
                </Row>
              </Rows>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Separator color="separatorSecondary" />
      <Box width="full" padding="20px">
        <Rows space="8px" alignVertical="center">
          <Row>
            <Button
              color={'accent'}
              height="44px"
              variant={'flat'}
              width="full"
              onClick={handleSend}
              testId="review-confirm-button"
              tabIndex={0}
              ref={confirmSendButtonRef}
              disabled={sending}
            >
              <Box>
                {sending ? (
                  <Box
                    width="fit"
                    alignItems="center"
                    justifyContent="center"
                    style={{ margin: 'auto' }}
                  >
                    <Spinner size={16} color="label" />
                  </Box>
                ) : (
                  <TextOverflow weight="bold" size="16pt" color="label">
                    {i18n.t('send.review.send_to', {
                      toName: walletDisplayName,
                    })}
                  </TextOverflow>
                )}
              </Box>
            </Button>
          </Row>
          <Row>
            <Inline alignHorizontal="center">
              <Button
                color="transparent"
                height="44px"
                variant="tinted"
                onClick={onCancel}
                tabIndex={0}
                width="full"
              >
                <Text weight="bold" size="16pt" color="labelSecondary">
                  {i18n.t('send.review.cancel')}
                </Text>
              </Button>
            </Inline>
          </Row>
        </Rows>
      </Box>
    </BottomSheet>
  );
};
