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

const t = (s: string) =>
  i18n.t(s, { scope: 'settings.privacy_and_security.wallets_and_keys' });

export const WipeWalletGroupPrompt = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  //   need the handleRemoveAccount from walletDetails function here somehow???
  //
  //   const handleDeleteWalletGroup = useCallback(async () => {
  //     const getWallets = await getSettingWallets();
  //     const walletArray = getWallets.accounts;
  //     for (const eachWallet of walletArray) {
  //       handleRemoveAccount(eachWallet);
  //     }
  //     navigate(-1);
  //   }, [handleRemoveAccount, navigate]);

  return (
    <Prompt show={show} handleClose={onClose}>
      <Box padding="12px">
        <Rows space="24px">
          <Row>
            <Rows space="20px">
              <Row>
                <Box paddingTop="12px">
                  <Text size="16pt" weight="bold" align="center">
                    {'Remove Wallet Group'}
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
                      {
                        'Are you sure you want to remove your Secret Recovery Phrase from Rainbow?'
                      }
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
                  onClick={() => console.log('handleDeleteWalletGroup')}
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
