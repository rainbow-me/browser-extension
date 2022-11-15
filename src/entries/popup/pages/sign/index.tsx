import {
  MessageTypes,
  SignTypedDataVersion,
  TypedMessage,
  recoverTypedSignature,
} from '@metamask/eth-sig-util';
import { uuid4 } from '@sentry/utils';
import { ethers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { Box, Column, Columns, Row, Rows, Text } from '~/design-system';

const messenger = initializeMessenger({ connect: 'background' });

export const Sign = () => {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [signing, setSigning] = useState(false);
  const { address } = useAccount();

  const handleMessageChange = useCallback(
    (event: { target: { value: React.SetStateAction<string> } }) => {
      setMessage(event.target.value);
    },
    [],
  );

  const handleSign = useCallback(async () => {
    let msgData = message;
    let action = 'sign_message';
    setSigning(true);
    try {
      msgData = JSON.parse(message);
      action = 'sign_typed_data';
    } catch (e) {
      console.log('not json string, falling back to personal sign');
    }

    try {
      const { result }: { result: string } = await messenger.send(
        'wallet_action',
        {
          action,
          payload: {
            address,
            msgData,
          },
        },
        { id: uuid4() },
      );
      if (result) {
        const actualAddress =
          action === 'sign_typed_data'
            ? recoverTypedSignature({
                data: msgData as unknown as TypedMessage<MessageTypes>,
                signature: result,
                version: SignTypedDataVersion.V4,
              })
            : ethers.utils.verifyMessage(msgData, result);

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
      as={motion.div}
      display="flex"
      flexDirection="column"
      gap="24px"
      padding="20px"
      initial={{ opacity: 0, x: window.innerWidth }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: window.innerWidth }}
      transition={{ type: 'tween', duration: 0.2 }}
      style={{ overflowY: 'auto' }}
    >
      <Columns space="12px">
        <Column width="1/3">
          <Link to="/">
            <Box as="button" style={{ borderRadius: 999, width: '100%' }}>
              <Text
                color="labelSecondary"
                size="14pt"
                weight="bold"
                align="left"
              >
                Back
              </Text>
            </Box>
          </Link>
        </Column>
        <Column>
          <Text as="h1" size="20pt" weight="bold">
            Sign
          </Text>
        </Column>
      </Columns>

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
};
