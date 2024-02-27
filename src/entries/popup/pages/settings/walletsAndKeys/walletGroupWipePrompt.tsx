import { useCallback } from 'react';
import { Address } from 'wagmi';

import { getAccounts } from '~/core/keychain';
import { i18n } from '~/core/languages';
import { appSessionsStore, useCurrentAddressStore } from '~/core/state';
import { hiddenWalletsStore } from '~/core/state/hiddenWallets';
import { walletBackupsStore } from '~/core/state/walletBackups';
import { walletNamesStore } from '~/core/state/walletNames';
import { getSettingWallets } from '~/core/utils/settings';
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
import { remove, wipe } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

const t = (s: string) =>
  i18n.t(s, { scope: 'settings.privacy_and_security.wallets_and_keys' });

const { deleteWalletName } = walletNamesStore.getState();
const { deleteWalletBackup } = walletBackupsStore.getState();
const { removeAddressSessions } = appSessionsStore.getState();
const { unhideWallet } = hiddenWalletsStore.getState();

async function removeWallet(address: Address) {
  await remove(address);
  unhideWallet({ address }); // unhide so if it's readded later, it's not hidden
  deleteWalletName({ address });
  deleteWalletBackup({ address });
  removeAddressSessions({ address });
}

export const WipeWalletGroupPrompt = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  const { currentAddress, setCurrentAddress } = useCurrentAddressStore();
  const navigate = useRainbowNavigate();

  const handleDeleteWalletGroup = useCallback(async () => {
    const groupAccounts = (await getSettingWallets()).accounts;
    try {
      await Promise.all(groupAccounts.map(removeWallet));

      if (groupAccounts.includes(currentAddress)) {
        const allAccounts = await getAccounts();
        if (allAccounts.length > 0) {
          unhideWallet({ address: allAccounts[0] });
          setCurrentAddress(allAccounts[0]);
        } else {
          await wipe();
          navigate(ROUTES.WELCOME);
        }
      }

      navigate(-2);
    } catch (error) {
      console.error('An error occurred during wallet removal:', error);
    }
  }, [currentAddress, navigate, setCurrentAddress]);

  return (
    <Prompt show={show} handleClose={onClose}>
      <Box padding="12px">
        <Rows space="24px">
          <Row>
            <Rows space="20px">
              <Row>
                <Box paddingTop="12px">
                  <Text size="16pt" weight="bold" align="center">
                    {t('wipe_wallet_group.wipe_confirmation')}
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
                      {t('wipe_wallet_group.wipe_confirmation_desc')}
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
                  {t('wipe_wallet_group.wipe_confirmation_cancel')}
                </Button>
              </Column>
              <Column>
                <Button
                  variant="flat"
                  height="36px"
                  color="red"
                  onClick={() => handleDeleteWalletGroup()}
                  width="full"
                  borderRadius="9px"
                  tabIndex={0}
                >
                  {t('wipe_wallet_group.wipe_confirmation_button')}
                </Button>
              </Column>
            </Columns>
          </Row>
        </Rows>
      </Box>
    </Prompt>
  );
};
