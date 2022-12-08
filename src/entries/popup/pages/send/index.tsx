import { TransactionRequest } from '@ethersproject/abstract-provider';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Column,
  Columns,
  Row,
  Rows,
  Separator,
  Text,
} from '~/design-system';

import { TransactionFee } from '../../components/TransactionFee/TransactionFee';
import { sendTransaction } from '../../handlers/wallet';
import { useSendTransactionInputs } from '../../hooks/send/useSendTransactionInputs';
import { useSendTransactionState } from '../../hooks/send/useSendTransactionState';

export function Send() {
  const [txHash, setTxHash] = useState('');
  const [sending, setSending] = useState(false);

  const {
    assetAmount,
    independentAmount,
    independentField,
    dependentAmount,
    setIndependentAmount,
    switchIndependentField,
  } = useSendTransactionInputs();

  const {
    asset,
    currentCurrency,
    chainId,
    data,
    fromAddress,
    toAddress,
    toAddressOrName,
    value,
    setToAddressOrName,
  } = useSendTransactionState({ assetAmount });

  const transactionRequest: TransactionRequest = useMemo(() => {
    return {
      to: toAddress,
      from: fromAddress,
      value,
      chainId,
      data,
    };
  }, [toAddress, fromAddress, value, chainId, data]);

  const handleToAddressChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setToAddressOrName(e.target.value);
    },
    [setToAddressOrName],
  );

  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setIndependentAmount(e.target.value);
    },
    [setIndependentAmount],
  );

  const handleSend = useCallback(async () => {
    setSending(true);

    try {
      const result = await sendTransaction({
        from: fromAddress,
        to: toAddress,
        value,
        chainId,
        data,
      });

      if (result) {
        alert(`Transaction sent successfully: ${JSON.stringify(result.hash)}`);
        setTxHash(result?.hash as string);
      }
    } catch (e) {
      alert('Transaction failed');
    } finally {
      setSending(false);
    }
  }, [fromAddress, toAddress, value, chainId, data]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="24px"
      padding="20px"
      style={{ overflow: 'auto' }}
    >
      <Columns space="12px">
        <Column>
          <Rows space="12px">
            <Row>
              <Text color="label" size="16pt" weight="bold">
                To:
              </Text>
            </Row>
            <Row>
              <input
                type="text"
                value={toAddressOrName}
                placeholder={'ENS or address'}
                onChange={handleToAddressChange}
                style={{
                  borderRadius: 999,
                  padding: '10px',
                  fontSize: '11pt',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </Row>
            <Row>
              <Text color="label" size="16pt" weight="bold">
                Amount (ETH):
              </Text>
            </Row>
            <Row>
              <input
                type="text"
                value={independentAmount}
                placeholder={'Enter ETH amount'}
                onChange={handleAmountChange}
                style={{
                  borderRadius: 999,
                  padding: '10px',
                  fontSize: '11pt',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </Row>
            <Row>
              <Text color="label" size="16pt" weight="bold">
                Amount native: {dependentAmount}
              </Text>
              <Button
                onClick={switchIndependentField}
                color="accent"
                height="36px"
                variant="flat"
              >
                Switch to{' '}
                {independentField === 'asset' ? currentCurrency : asset?.symbol}
              </Button>
            </Row>
            <Row>
              <Box
                as="button"
                background="accent"
                boxShadow="24px accent"
                onClick={handleSend}
                padding="16px"
                style={{
                  borderRadius: 999,
                  marginTop: '24px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <Text color="label" size="14pt" weight="bold">
                  {sending ? 'Sending...' : 'Send Transaction'}
                </Text>
              </Box>
            </Row>
            {txHash && (
              <Row>
                <Box
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '16px',
                  }}
                >
                  <Separator />
                  <a
                    href={`https://etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'block',
                      marginTop: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <Text color="label" size="16pt" weight="bold">
                      View on etherscan
                    </Text>
                  </a>
                </Box>
              </Row>
            )}
            <Row>
              <TransactionFee
                chainId={chainId}
                transactionRequest={transactionRequest}
              />
            </Row>
          </Rows>
        </Column>
      </Columns>
    </Box>
  );
}
