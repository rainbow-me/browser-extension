import React, { useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
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
        setError(i18n.t('remove_wallet_prompt.error'));
      }
    }
  };

  return (
    <Prompt show={show}>
      <Rows space="24px">
        <Row>
          <Rows space="20px">
            <Row>
              <Box paddingTop="12px">
                <Text size="16pt" weight="bold" align="center">
                  {`${i18n.t(
                    `remove_wallet_prompt.${hide ? 'hide' : 'remove'}`,
                  )} ${displayName}?`}
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
                    {i18n.t(
                      `remove_wallet_prompt.${
                        hide ? 'hide_description' : 'remove_description'
                      }`,
                    )}
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
                onClick={onClose}
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
                {i18n.t(`remove_wallet_prompt.${hide ? 'hide' : 'remove'}`)}
              </Button>
            </Column>
          </Columns>
        </Row>
      </Rows>
    </Prompt>
  );
};
