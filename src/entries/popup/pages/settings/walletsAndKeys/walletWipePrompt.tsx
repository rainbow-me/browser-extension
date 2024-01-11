import React, { useCallback } from 'react';
import { Address, useAccount } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { WELCOME_URL, goToNewTab } from '~/core/utils/tabs';
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

import * as wallet from '../../../handlers/wallet';

const t = (s: string) =>
  i18n.t(s, { scope: 'settings.privacy_and_security.wallets_and_keys' });

export const WipeWalletPrompt = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  const { setCurrentAddress } = useCurrentAddressStore();
  const { address } = useAccount();

  const handleWipeWallet = useCallback(async () => {
    await wallet.wipe();
    const accounts = await wallet.getAccounts();
    if (accounts.length > 0 && !accounts.includes(address as Address)) {
      setCurrentAddress(accounts[0]);
    }
    goToNewTab({ url: WELCOME_URL });
  }, [address, setCurrentAddress]);

  return (
    <Prompt show={show} handleClose={onClose}>
      <Box padding="12px">
        <Rows space="24px">
          <Row>
            <Rows space="20px">
              <Row>
                <Box paddingTop="12px">
                  <Text size="16pt" weight="bold" align="center">
                    {t('wipe_wallets.wipe_confirmation')}
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
                      {t('wipe_wallets.wipe_confirmation_desc')}
                    </Text>
                  </Row>
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
                  tabIndex={0}
                >
                  {t('wipe_wallets.wipe_confirmation_cancel')}
                </Button>
              </Column>
              <Column>
                <Button
                  variant="flat"
                  height="36px"
                  color="red"
                  onClick={handleWipeWallet}
                  width="full"
                  borderRadius="9px"
                  tabIndex={0}
                >
                  {t('wipe_wallets.wipe_confirmation_button')}
                </Button>
              </Column>
            </Columns>
          </Row>
        </Rows>
      </Box>
    </Prompt>
  );
};
