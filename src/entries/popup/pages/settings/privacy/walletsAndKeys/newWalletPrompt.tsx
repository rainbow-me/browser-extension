import React, { useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import {
  Box,
  Button,
  Inset,
  Row,
  Rows,
  Separator,
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

export const NewWalletPrompt = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleValidateWalletName = async () => {
    if (walletName !== '') {
      // TODO: generate the new wallet
      handleClose();
      return;
    }
    setError(i18n.t('No wallet name set'));
  };

  const handleClose = () => {
    setWalletName('');
    onClose();
  };

  useEffect(() => {
    setError(null);
  }, [setWalletName, walletName]);

  useEffect(() => {
    return () => {
      setWalletName('');
    };
  }, []);

  return (
    <Prompt show={show}>
      <Rows space="24px">
        <Row>
          <Rows space="20px">
            <Row>
              <Box paddingTop="12px">
                <Text size="16pt" weight="bold" align="center">
                  Name your wallet
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
                  <Input
                    placeholder="ex: Wallet 1"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    height="44px"
                    variant="bordered"
                  />
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
          <Rows space="8px">
            <Row>
              <Button
                variant="flat"
                height="36px"
                color="accent"
                onClick={handleValidateWalletName}
                width="full"
              >
                Create Wallet
              </Button>
            </Row>
            <Row>
              <Button
                variant="flat"
                height="36px"
                color="fillSecondary"
                onClick={handleClose}
                width="full"
              >
                {i18n.t('common_actions.cancel')}
              </Button>
            </Row>
          </Rows>
        </Row>
      </Rows>
    </Prompt>
  );
};
