import React, { useMemo, useState } from 'react';
import { type Address } from 'viem';

import { i18n } from '~/core/languages';
import { POPUP_URL, goToNewTab } from '~/core/utils/tabs';
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

import { wipe } from '../../handlers/wallet';
import { useWalletName } from '../../hooks/useWalletName';
import { useWallets } from '../../hooks/useWallets';

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

  const { allWallets } = useWallets();

  const isLastWallet = useMemo(
    () => allWallets?.length === 1,
    [allWallets?.length],
  );

  const { title, description, confirmText } = useMemo(() => {
    if (hide) {
      return {
        title: i18n.t(`remove_wallet_prompt.hide_title`, { name: displayName }),
        description: i18n.t(`remove_wallet_prompt.hide_description`),
        confirmText: i18n.t(`remove_wallet_prompt.hide`),
      };
    } else if (isLastWallet) {
      return {
        title: i18n.t(`remove_wallet_prompt.remove_last_wallet_title`, {
          name: displayName,
        }),
        description: i18n.t(
          `remove_wallet_prompt.remove_last_wallet_description`,
        ),
        confirmText: i18n.t(`remove_wallet_prompt.remove`),
      };
    }
    return {
      title: i18n.t(`remove_wallet_prompt.remove_title`, {
        name: displayName,
      }),
      description: i18n.t(`remove_wallet_prompt.remove_description`),
      confirmText: i18n.t(`remove_wallet_prompt.remove`),
    };
  }, [displayName, hide, isLastWallet]);

  const handleRemoveWallet = async () => {
    if (account) {
      try {
        await onRemoveAccount(account);
        if (isLastWallet) {
          await wipe();
          goToNewTab({ url: POPUP_URL });
        } else {
          onClose();
        }
      } catch (e) {
        setError(i18n.t('remove_wallet_prompt.error'));
      }
    }
  };

  return (
    <Prompt show={show} handleClose={onClose}>
      <Box padding="12px">
        <Rows space="24px">
          <Row>
            <Rows space="20px">
              <Row>
                <Box paddingTop="12px">
                  <Text size="16pt" weight="bold" align="center">
                    {title}
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
                      {description}
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
                  {i18n.t(`remove_wallet_prompt.cancel`)}
                </Button>
              </Column>
              <Column>
                <Button
                  testId={'remove-button'}
                  variant="flat"
                  height="36px"
                  color="red"
                  onClick={handleRemoveWallet}
                  width="full"
                  borderRadius="9px"
                >
                  {confirmText}
                </Button>
              </Column>
            </Columns>
          </Row>
        </Rows>
      </Box>
    </Prompt>
  );
};
