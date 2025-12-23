import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useMemo, useState } from 'react';
import {
  type TypedDataDomain,
  validateTypedData,
  verifyMessage,
  verifyTypedData,
} from 'viem';

import { useCurrentAddressStore } from '~/core/state';
import {
  SigningMessage,
  TypedDataMessage,
  isPersonalSignMessage,
  isTypedDataMessage,
} from '~/core/types/messageSigning';
import { sanitizeTypedData } from '~/core/utils/ethereum';
import { Box, Column, Columns, Row, Rows, Text } from '~/design-system';
import { RainbowError, logger } from '~/logger';

import { personalSign, signTypedData } from '../../handlers/wallet';

const isTypedDataValue = (
  value: unknown,
): value is {
  domain: TypedDataDomain;
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, unknown>;
} => {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.domain === 'object' &&
    obj.domain !== null &&
    typeof obj.types === 'object' &&
    obj.types !== null &&
    typeof obj.primaryType === 'string' &&
    typeof obj.message === 'object'
  );
};

const parseMessage = (input: string): SigningMessage => {
  if (!input.trim()) {
    throw new Error('Message cannot be empty');
  }

  // Try to parse as JSON (typed data)
  try {
    const parsed = JSON.parse(input) as unknown;
    if (isTypedDataValue(parsed)) {
      // Sanitize first to ensure proper structure
      const sanitizedData = sanitizeTypedData(parsed);

      // Validate typed data structure using viem's validateTypedData
      // If validation passes, we can trust the structure matches TypedDataDefinition
      try {
        validateTypedData({
          domain: sanitizedData.domain as never,
          types: sanitizedData.types as never,
          primaryType: sanitizedData.primaryType,
          message: sanitizedData.message || sanitizedData.value || {},
        } as Parameters<typeof validateTypedData>[0]);
      } catch (validationError) {
        // If validation fails, treat as invalid typed data and fall back to personal sign
        logger.warn('Invalid typed data structure', {
          error:
            validationError instanceof Error
              ? validationError.message
              : String(validationError),
        });
        return {
          type: 'personal_sign',
          message: input,
        };
      }

      // After validation, sanitizedData matches TypedDataDefinition structure
      // Type assertion needed because viem's TypedDataDefinition has very strict types
      // but sanitizedData is structurally compatible after validation
      const typedDataMessage: TypedDataMessage = {
        type: 'sign_typed_data',
        data: sanitizedData as unknown as TypedDataMessage['data'],
      };
      return typedDataMessage;
    }
  } catch {
    // Not valid JSON, treat as personal sign message
  }

  // Fall back to personal sign
  return {
    type: 'personal_sign',
    message: input,
  };
};

export function Sign() {
  const [messageInput, setMessageInput] = useState('');
  const [signature, setSignature] = useState('');
  const [signing, setSigning] = useState(false);
  const { currentAddress: address } = useCurrentAddressStore();

  const parsedMessage = useMemo<SigningMessage | null>(() => {
    if (!messageInput.trim()) return null;
    try {
      return parseMessage(messageInput);
    } catch {
      return null;
    }
  }, [messageInput]);

  const handleMessageChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessageInput(event.target.value);
    },
    [],
  );

  const handleSign = useCallback(async () => {
    if (!address || !parsedMessage) return;

    setSigning(true);
    try {
      let result: string;

      if (isPersonalSignMessage(parsedMessage)) {
        result = await personalSign(parsedMessage, address);
      } else if (isTypedDataMessage(parsedMessage)) {
        result = await signTypedData(parsedMessage, address);
      } else {
        throw new Error('Invalid message type');
      }

      // Verify signature using viem's verify utilities
      const isValid = isPersonalSignMessage(parsedMessage)
        ? await verifyMessage({
            address,
            message: parsedMessage.message,
            signature: result as `0x${string}`,
          })
        : isTypedDataMessage(parsedMessage)
        ? await verifyTypedData({
            address,
            domain: parsedMessage.data.domain!,
            types: parsedMessage.data.types,
            primaryType: parsedMessage.data.primaryType,
            message: parsedMessage.data.message as Record<string, unknown>,
            signature: result as `0x${string}`,
          })
        : false;

      if (isValid) {
        alert(`Message signed successfully: ${result}`);
        setSignature(result);
      } else {
        alert(`Signature verification failed`);
      }
    } catch (e) {
      alert('Signing failed');
      logger.error(new RainbowError('signing failed', { cause: e }));
    } finally {
      setSigning(false);
    }
  }, [address, parsedMessage]);

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
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="full"
              >
                <Text color="label" size="16pt" weight="bold">
                  Message to sign
                </Text>
                <Box
                  style={{
                    minWidth: '90px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    position: 'relative',
                  }}
                >
                  <AnimatePresence mode="wait">
                    {parsedMessage && (
                      <motion.div
                        key={parsedMessage.type}
                        initial={{ opacity: 0, scale: 0.95, x: 4 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: -4 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        style={{ display: 'inline-block' }}
                      >
                        <Box
                          paddingHorizontal="8px"
                          paddingVertical="4px"
                          borderRadius="6px"
                          background="fillSecondary"
                          borderWidth="1px"
                          borderColor="separatorSecondary"
                        >
                          <Text
                            color="labelSecondary"
                            size="10pt"
                            weight="semibold"
                          >
                            {parsedMessage.type === 'personal_sign'
                              ? 'Personal Sign'
                              : 'EIP-712'}
                          </Text>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </Box>
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
                value={messageInput}
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
