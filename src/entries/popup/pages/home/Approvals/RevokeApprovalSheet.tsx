import { TransactionRequest } from '@ethersproject/abstract-provider';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Address } from 'viem';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { populateRevokeApproval } from '~/core/raps/actions/unlock';
import {
  Approval,
  ApprovalSpender,
} from '~/core/resources/approvals/approvals';
import { useCurrentAddressStore, useFlashbotsEnabledStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
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
import { ApprovalFee } from '~/entries/popup/components/TransactionFee/TransactionFee';

import { CoinIcon } from '../../../components/CoinIcon/CoinIcon';
import { Spinner } from '../../../components/Spinner/Spinner';
import { WalletAvatar } from '../../../components/WalletAvatar/WalletAvatar';
import { useWalletInfo } from '../../../hooks/useWalletInfo';
import playSound from '../../../utils/playSound';

export const RevokeApprovalSheet = ({
  show,
  approval,
  spender,
  onCancel,
  onSend,
}: {
  show: boolean;
  approval: Approval | null;
  spender: ApprovalSpender | null;
  onCancel: () => void;
  onSend: () => void;
}) => {
  const { currentAddress } = useCurrentAddressStore();
  const [sending, setSending] = useState(false);
  const confirmSendButtonRef = useRef<HTMLButtonElement>(null);
  const { flashbotsEnabled } = useFlashbotsEnabledStore();
  const flashbotsEnabledGlobally =
    config.flashbots_enabled &&
    flashbotsEnabled &&
    approval?.chain_id === ChainId.mainnet;

  const { approvalChainId, assetAddress, spenderAddress } = useMemo(() => {
    const approvalChainId = approval?.chain_id as ChainId;
    return {
      approvalChainId,
      assetAddress: approval?.asset?.networks?.[approvalChainId]
        ?.address as Address,
      spenderAddress: spender?.contract_address,
    };
  }, [
    approval?.asset?.networks,
    approval?.chain_id,
    spender?.contract_address,
  ]);

  const { displayName: walletDisplayName } = useWalletInfo({
    address: currentAddress,
  });

  const transactionRequestForGas: TransactionRequest = useMemo(() => {
    return {
      to: currentAddress,
      from: currentAddress,
      value: '0x0',
      chainId: approval?.chain_id || ChainId.mainnet,
      data: '0x',
    };
  }, [currentAddress, approval?.chain_id]);

  const handleSend = useCallback(async () => {
    if (!sending) {
      setSending(true);
      try {
        await onSend();
        playSound('SendSound');
      } finally {
        setSending(false);
      }
    }
  }, [onSend, sending]);

  const { data: revokeApproveTransaction } = useQuery(
    ['populateRevokeApproval', assetAddress, spenderAddress, approvalChainId],
    async () =>
      await populateRevokeApproval({
        tokenAddress: assetAddress,
        spenderAddress: spenderAddress,
        chainId: approvalChainId,
      }),
    {
      enabled: !!approval && !!spender,
    },
  );

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
                {i18n.t('approvals.revoke.title')}
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
                              {'Revoke'}
                            </TextOverflow>
                          </Row>
                        </Rows>
                      </Box>
                    </Column>
                    <Column>
                      <Inline alignVertical="center" alignHorizontal="right">
                        <Box>
                          <CoinIcon asset={approval?.asset} size={44} />
                        </Box>
                      </Inline>
                    </Column>
                  </Columns>
                </Row>
                <Row>
                  <Columns alignHorizontal="justify">
                    <Column>
                      <Box paddingVertical="6px" height="full">
                        <TextOverflow size="14pt" weight="bold" color="label">
                          {spender?.quantity_allowed}
                        </TextOverflow>
                      </Box>
                    </Column>
                    <Column>
                      <Box>
                        <TextOverflow size="14pt" weight="bold" color="label">
                          {spender?.contract_name}
                        </TextOverflow>
                      </Box>
                    </Column>
                  </Columns>
                </Row>
                <Row>
                  <Columns alignHorizontal="justify">
                    <Column width="4/5">
                      <Box paddingVertical="6px" height="full">
                        <TextOverflow size="14pt" weight="bold" color="label">
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

      <Box padding="20px">
        <ApprovalFee
          chainId={approvalChainId}
          address={currentAddress}
          spenderAddress={spenderAddress}
          assetAddress={assetAddress}
          transactionRequest={
            revokeApproveTransaction || transactionRequestForGas
          }
          plainTriggerBorder
          flashbotsEnabled={flashbotsEnabledGlobally}
        />
      </Box>

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
