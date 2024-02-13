import { useCallback } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { appSessionsStore, useCurrentAddressStore } from '~/core/state';
import { useWalletBackupsStore } from '~/core/state/walletBackups';
import { useWalletNamesStore } from '~/core/state/walletNames';
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
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';

const t = (s: string) =>
  i18n.t(s, { scope: 'settings.privacy_and_security.wallets_and_keys' });

export const WipeWalletGroupPrompt = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  const { deleteWalletName } = useWalletNamesStore();
  const { deleteWalletBackup } = useWalletBackupsStore();
  const { visibleWallets } = useWallets();
  const { currentAddress, setCurrentAddress } = useCurrentAddressStore();
  const navigate = useRainbowNavigate();

  const handleRemoveAccount = useCallback(
    async (address: Address) => {
      await remove(address);
      deleteWalletName({ address });
      deleteWalletBackup({ address });
      appSessionsStore.getState().removeAddressSessions({ address });

      if (visibleWallets.length > 1) {
        if (address === currentAddress) {
          const deletedIndex = visibleWallets.findIndex(
            (account) => account.address === address,
          );
          const nextIndex =
            deletedIndex === visibleWallets.length - 1
              ? deletedIndex - 1
              : deletedIndex + 1;
          setCurrentAddress(visibleWallets[nextIndex].address);
        }
      } else {
        await wipe();
        navigate(ROUTES.WELCOME);
      }
    },
    [
      currentAddress,
      deleteWalletBackup,
      deleteWalletName,
      navigate,
      setCurrentAddress,
      visibleWallets,
    ],
  );

  const handleDeleteWalletGroup = useCallback(async () => {
    const getWallets = await getSettingWallets();
    const walletArray = getWallets.accounts;
    try {
      await Promise.all(
        walletArray.map((eachWallet) => handleRemoveAccount(eachWallet)),
      );
      navigate(-2);
    } catch (error) {
      console.error('An error occurred during wallet removal:', error);
    }
  }, [handleRemoveAccount, navigate]);

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
