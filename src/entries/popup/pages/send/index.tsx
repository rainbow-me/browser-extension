import { TransactionRequest } from '@ethersproject/abstract-provider';
import { ethers } from 'ethers';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';

import {
  Box,
  Column,
  Columns,
  Row,
  Rows,
  Separator,
  Text,
} from '~/design-system';

import { TransactionFee } from '../../components/TransactionFee/TransactionFee';
import { sendTransaction } from '../../handlers/wallet';
import { useSendTransactionState } from '../../hooks/useSendTransactionState';

export function Send() {
  const [txHash, setTxHash] = useState('');
  const [sending, setSending] = useState(false);

  const {
    toAddress,
    setToAddressOrName,
    chainId,
    setAmount,
    amount,
    fromAddress,
  } = useSendTransactionState();

  const transactionRequest: TransactionRequest = useMemo(() => {
    return {
      to: toAddress,
      from: fromAddress,
      amount,
      chainId,
    };
  }, [fromAddress, amount, chainId, toAddress]);

  const handleToAddressChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setToAddressOrName(e.target.value);
    },
    [setToAddressOrName],
  );

  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value);
    },
    [setAmount],
  );

  const handleSend = useCallback(async () => {
    setSending(true);

    try {
      const result = await sendTransaction({
        from: fromAddress,
        to: toAddress,
        value: ethers.utils.parseEther(amount ?? ''),
        chainId,
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
  }, [fromAddress, amount, chainId, toAddress]);

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
                value={toAddress}
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
                value={amount}
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
