import { getAddress } from '@ethersproject/address';
import { Bytes } from '@ethersproject/bytes';
import { verifyMessage } from '@ethersproject/wallet';
import {
  MessageTypes,
  SignTypedDataVersion,
  TypedMessage,
  recoverTypedSignature,
} from '@metamask/eth-sig-util';
import React, { useCallback, useState } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { WalletAction } from '~/core/types/walletActions';
import { Box, Column, Columns, Row, Rows, Text } from '~/design-system';

import { personalSign, signTypedData } from '../../handlers/wallet';

export function Sign() {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [signing, setSigning] = useState(false);
  const { currentAddress: address } = useCurrentAddressStore();

  const handleMessageChange = useCallback(
    (event: { target: { value: React.SetStateAction<string> } }) => {
      setMessage(event.target.value);
    },
    [],
  );

  const handleSign = useCallback(async () => {
    if (!address) return;
    let msgData: string | Bytes = message;
    let action: WalletAction = 'personal_sign';
    let result: string;
    setSigning(true);
    try {
      msgData = JSON.parse(message) as string | Bytes;
      action = 'sign_typed_data';
    } catch (e) {
      console.log('not json string, falling back to personal sign');
    } finally {
      result =
        action === 'personal_sign'
          ? await personalSign(msgData, address)
          : await signTypedData(msgData, address);
    }

    try {
      if (result) {
        const actualAddress =
          action === 'sign_typed_data'
            ? recoverTypedSignature({
                data: msgData as unknown as TypedMessage<MessageTypes>,
                signature: result,
                version: SignTypedDataVersion.V4,
              })
            : verifyMessage(msgData, result);

        if (getAddress(actualAddress) === address) {
          alert(`Message signed succesfully: ${result}`);
          setSignature(result);
        } else {
          alert(`Signature does not match address: ${actualAddress}`);
        }
      }
    } catch (e) {
      alert('Signign failed');
      console.log('signing failed', e);
    } finally {
      setSigning(false);
    }
  }, [address, message]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="24px"
      padding="20px"
      style={{ overflowY: 'auto' }}
    >
      <Columns space="12px">
        <Column>
          <Rows space="12px">
            <Row>
              <Text color="label" size="16pt" weight="bold">
                Message to sign
              </Text>
            </Row>
            <Row>
              <textarea
                style={{
                  width: '100%',
                  borderRadius: 10,
                  padding: '10px',
                  fontSize: '11pt',
                  boxSizing: 'border-box',
                }}
                value={message}
                placeholder={`Enter a personal sign message or a typed data object`}
                onChange={handleMessageChange}
              />
            </Row>
            <Row>
              <Box
                as="button"
                background="accent"
                boxShadow="24px accent"
                onClick={handleSign}
                padding="16px"
                style={{
                  borderRadius: 999,
                  marginTop: '24px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <Text color="label" size="14pt" weight="bold">
                  {signing ? 'Signing...' : 'Sign Message'}
                </Text>
              </Box>
            </Row>
            {signature && (
              <Row>
                <Box
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '20px',
                    boxSizing: 'border-box',
                    overflowWrap: 'anywhere',
                  }}
                >
                  <Text color="label" size="16pt" weight="bold">
                    Signature: <br /> <br /> {signature}
                  </Text>
                </Box>
              </Row>
            )}
          </Rows>
        </Column>
      </Columns>
    </Box>
  );
}
