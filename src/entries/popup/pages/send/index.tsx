import { TransactionRequest } from '@ethersproject/abstract-provider';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Address, useAccount, useEnsAvatar } from 'wagmi';

import { Box, Button, Inline, Row, Rows, Symbol, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';

import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import { TransactionFee } from '../../components/TransactionFee/TransactionFee';
import { sendTransaction } from '../../handlers/wallet';
import { useSendTransactionAsset } from '../../hooks/send/useSendTransactionAsset';
import { useSendTransactionInputs } from '../../hooks/send/useSendTransactionInputs';
import { useSendTransactionState } from '../../hooks/send/useSendTransactionState';

export const EnsAvatar = ({ address }: { address: Address }) => {
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: address });
  return (
    <Box
      background="fill"
      borderRadius="18px"
      style={{
        width: '36px',
        height: '36px',
        overflow: 'hidden',
      }}
    >
      {ensAvatar && (
        /* TODO: Convert to <Image> & Imgix/Cloudinary */
        <img src={ensAvatar} width="100%" height="100%" loading="lazy" />
      )}
    </Box>
  );
};

export function Send() {
  const [, setTxHash] = useState('');
  const [sending, setSending] = useState(false);

  const { address } = useAccount();

  const { asset } = useSendTransactionAsset();
  const {
    assetAmount,
    independentAmount,
    independentField,
    independentFieldRef,
    dependentAmount,
    setIndependentAmount,
    switchIndependentField,
    setMaxAssetAmount,
  } = useSendTransactionInputs({ asset });

  const {
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
      style={{ overflow: 'auto' }}
      paddingHorizontal="12px"
    >
      <Rows space="8px">
        <Row>
          <Box
            background="surfaceSecondaryElevated"
            paddingVertical="20px"
            paddingHorizontal="16px"
            borderRadius="24px"
            width="full"
          >
            <Inline
              alignHorizontal="justify"
              alignVertical="center"
              space="8px"
            >
              <Inline alignVertical="center" space="8px">
                <EnsAvatar address={address as Address} />
                <Box width="fit">
                  <Input
                    value={toAddressOrName}
                    placeholder={'Name, ENS or address'}
                    onChange={handleToAddressChange}
                    height="32px"
                    variant="transparent"
                  />
                </Box>
              </Inline>

              <Symbol size={18} symbol="chevron.down.circle" weight="bold" />
            </Inline>
          </Box>
        </Row>

        <Row>
          <Box
            background="surfaceSecondaryElevated"
            paddingVertical="20px"
            paddingHorizontal="16px"
            borderRadius="24px"
            width="full"
          >
            <Inline
              alignHorizontal="justify"
              alignVertical="center"
              space="8px"
            >
              <Inline alignVertical="center" space="8px">
                <CoinIcon asset={asset} />
                <Box width="fit">
                  <Text size="16pt" weight="bold">
                    {asset?.name}
                  </Text>
                </Box>
              </Inline>
              <Symbol size={18} symbol="chevron.down.circle" weight="bold" />
            </Inline>
          </Box>
        </Row>

        <Row>
          <Text color="label" size="16pt" weight="bold">
            Amount ({asset?.symbol}):
          </Text>
        </Row>
        <Row>
          <Input
            value={independentAmount}
            placeholder={'Enter ETH amount'}
            onChange={handleAmountChange}
            height="32px"
            variant="bordered"
            innerRef={independentFieldRef}
          />
        </Row>
        <Row>
          <Text color="label" size="16pt" weight="bold">
            Amount {independentField === 'asset' ? 'native' : asset?.symbol}:{' '}
            {dependentAmount}
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
          <Button
            onClick={setMaxAssetAmount}
            color="accent"
            height="36px"
            variant="flat"
          >
            Max
          </Button>
        </Row>
        <Row>
          <TransactionFee
            chainId={chainId}
            transactionRequest={transactionRequest}
          />
        </Row>
        <Row>
          <Button
            onClick={handleSend}
            height="44px"
            variant="flat"
            color="accent"
            width="full"
          >
            <Text color="label" size="14pt" weight="bold">
              {sending ? 'Sending...' : 'Send Transaction'}
            </Text>
          </Button>
        </Row>
      </Rows>
    </Box>
  );
}
