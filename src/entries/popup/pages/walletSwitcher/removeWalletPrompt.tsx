import React, { useState } from 'react';
import { Address } from 'wagmi';

import {
  Box,
  Button,
  Column,
  Columns,
  Inset,
  Row,
  Rows,
  Separator,
  Text,
} from '~/design-system';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

import { useWalletName } from '../../hooks/useWalletName';

export const RemoveWalletPrompt = ({
  show,
  onClose,
  account,
  onRemoveAccount,
  hide,
}: {
  show: boolean;
  onClose: () => void;
  account: Address | undefined;
  onRemoveAccount: (account: Address) => Promise<void>;
  hide?: boolean;
}) => {
  const { displayName } = useWalletName({ address: account });
  const [error, setError] = useState<string>();
  const handleRemoveWallet = async () => {
    if (account) {
      try {
        await onRemoveAccount(account);
        onClose();
      } catch (e) {
        setError('Error removing wallet');
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Prompt show={show}>
      <Rows space="24px">
        <Row>
          <Rows space="20px">
            <Row>
              <Box paddingTop="12px">
                <Text size="16pt" weight="bold" align="center">
                  {hide ? `Hide ${displayName}?` : `Remove ${displayName}?`}
                </Text>
              </Box>
            </Row>
            <Row>
              <Inset horizontal="104px">
                <Separator color="separatorTertiary" />
              </Inset>
            </Row>
            <Row>
              <Rows>
                <Row>
                  <Text
                    size="12pt"
                    weight="medium"
                    align="center"
                    color="labelTertiary"
                  >
                    {hide
                      ? 'This only removes the wallet from this list. You can find this wallet and additional management options in settings.'
                      : 'Are you sure you want to remove this wallet?'}
                  </Text>
                </Row>
                {error && (
                  <Row>
                    <Box paddingTop="8px">
                      <Text
                        size="14pt"
                        weight="semibold"
                        align="center"
                        color="red"
                      >
                        {error}
                      </Text>
                    </Box>
                  </Row>
                )}
              </Rows>
            </Row>
          </Rows>
        </Row>
        <Row>
          <Columns space="8px">
            <Column>
              <Button
                variant="flat"
                height="36px"
                color="fillSecondary"
                onClick={handleClose}
                width="full"
                borderRadius="9px"
              >
                Cancel
              </Button>
            </Column>
            <Column>
              <Button
                variant="flat"
                height="36px"
                color="red"
                onClick={handleRemoveWallet}
                width="full"
                borderRadius="9px"
              >
                {hide ? 'Hide' : 'Remove'}
              </Button>
            </Column>
          </Columns>
        </Row>
      </Rows>
    </Prompt>
  );
};
