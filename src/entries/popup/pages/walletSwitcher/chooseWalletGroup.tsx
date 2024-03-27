import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { SessionStorage } from '~/core/storage';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';
import {
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import {
  add,
  create,
  getWallets,
  remove,
} from '~/entries/popup/handlers/wallet';

import { AddressOrEns } from '../../components/AddressOrEns/AddressorEns';
import { ShortcutHint } from '../../components/ShortcutHint/ShortcutHint';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { CreateWalletPrompt } from './createWalletPrompt';

const GroupAvatar = ({ accounts }: { accounts: Address[] }) => {
  return (
    <Box
      borderRadius="8px"
      style={{
        width: '36px',
        height: '36px',
        backgroundColor: 'rgba(245, 248, 255, 0.06)',
      }}
      padding="5px"
    >
      <Rows space="2px">
        <Row>
          <Columns space="2px">
            <Column>
              {accounts[0] && (
                <WalletAvatar
                  size={12}
                  emojiSize="7pt"
                  addressOrName={accounts[0]}
                  emojiPaddingLeft="1px"
                  emojiPaddingTop="1px"
                />
              )}
            </Column>
            <Column>
              {accounts[1] && (
                <WalletAvatar
                  size={12}
                  emojiSize="7pt"
                  addressOrName={accounts[1]}
                  emojiPaddingLeft="1px"
                  emojiPaddingTop="1px"
                />
              )}
            </Column>
          </Columns>
        </Row>
        <Row>
          <Columns space="2px">
            <Column>
              {accounts[2] && (
                <WalletAvatar
                  size={12}
                  emojiSize="7pt"
                  addressOrName={accounts[2]}
                  emojiPaddingLeft="1px"
                  emojiPaddingTop="1px"
                />
              )}
            </Column>
            <Column>
              {accounts[3] && (
                <WalletAvatar
                  size={12}
                  emojiSize="7pt"
                  addressOrName={accounts[3]}
                  emojiPaddingLeft="1px"
                  emojiPaddingTop="1px"
                />
              )}
            </Column>
          </Columns>
        </Row>
      </Rows>
    </Box>
  );
};

const GroupRow = ({
  leftcomponent,
  centerComponent,
  rightComponent,
  onClick,
  testId,
}: {
  leftcomponent: ReactElement;
  centerComponent: ReactElement;
  rightComponent: ReactElement | null;
  onClick: () => void;
  testId?: string;
}) => {
  return (
    <Box onClick={onClick} testId={testId}>
      <Columns alignHorizontal="justify" alignVertical="center">
        <Column width="content">
          <Inline space="10px" alignHorizontal="center" alignVertical="center">
            {leftcomponent}
            {centerComponent}
          </Inline>
        </Column>
        <Column width="content">{rightComponent}</Column>
      </Columns>
    </Box>
  );
};

const WalletGroups = ({
  onCreateNewWallet,
  onCreateNewWalletOnGroup,
  wallets,
}: {
  onCreateNewWallet: () => Promise<void>;
  onCreateNewWalletOnGroup: (index: number) => Promise<void>;
  wallets: KeychainWallet[];
}) => {
  return (
    <Stack space="16px">
      <GroupRow
        testId={'new-wallet-group'}
        onClick={onCreateNewWallet}
        leftcomponent={
          <Box
            borderRadius="9px"
            style={{
              width: '30px',
              height: '30px',
              border: '2px dashed rgba(38, 143, 255, 0.2)',
            }}
            alignItems="center"
            justifyContent="center"
            display="flex"
          >
            <Symbol weight="bold" symbol="plus" size={14} color="blue" />
          </Box>
        }
        centerComponent={
          <Stack space="8px">
            <Text size="14pt" color="label" align="left" weight="regular">
              {i18n.t('choose_wallet_group.new_wallet_group')}
            </Text>
            <Text
              size="12pt"
              color="labelTertiary"
              align="left"
              weight="regular"
            >
              {i18n.t('choose_wallet_group.create_recovery_phrase')}
            </Text>
          </Stack>
        }
        rightComponent={
          <ShortcutHint
            hint={shortcuts.wallets.CHOOSE_WALLET_GROUP_NEW.display}
          />
        }
      />
      {wallets.length ? (
        <Stack space="16px">
          <Separator color="separatorTertiary" strokeWeight="1px" />
          {wallets.map((wallet, i) => {
            return (
              <GroupRow
                testId={`wallet-group-${i + 1}`}
                key={i}
                onClick={() => onCreateNewWalletOnGroup(i)}
                leftcomponent={<GroupAvatar accounts={wallet.accounts} />}
                centerComponent={
                  <Stack space="8px">
                    <Text
                      size="14pt"
                      color="label"
                      align="left"
                      weight="semibold"
                    >
                      {i18n.t('choose_wallet_group.wallet_group', {
                        number: i + 1,
                      })}
                    </Text>
                    <Inline alignVertical="center" space="4px">
                      <AddressOrEns
                        address={wallet.accounts[0]}
                        size={'12pt'}
                        weight="regular"
                        color="labelTertiary"
                      />
                      {wallet.accounts.length > 1 && (
                        <Box
                          borderWidth="1px"
                          borderColor="separatorSecondary"
                          borderRadius="5px"
                          padding="3px"
                        >
                          <Text
                            size="10pt"
                            color="labelQuaternary"
                            align="left"
                            weight="bold"
                          >{`+${wallet.accounts.length - 1}`}</Text>
                        </Box>
                      )}
                    </Inline>
                  </Stack>
                }
                rightComponent={
                  i < 9 ? <ShortcutHint hint={`${i + 1}`} /> : null
                }
              />
            );
          })}
        </Stack>
      ) : null}
    </Stack>
  );
};

const ChooseWalletGroup = () => {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();
  const [wallets, setWallets] = useState<KeychainWallet[]>([]);
  const goHomeOnWalletCreation = state?.goHomeOnWalletCreation;
  const [fromChooseGroup, setFromChooseGroup] = useState(false);
  const { trackShortcut } = useKeyboardAnalytics();

  useEffect(() => {
    const fetchWallets = async () => {
      const walletsFromKeychain = await getWallets();
      const controlledWallets = walletsFromKeychain.filter(
        (wallet) =>
          ![
            KeychainType.ReadOnlyKeychain,
            KeychainType.HardwareWalletKeychain,
            KeychainType.KeyPairKeychain,
          ].includes(wallet.type),
      );

      setWallets(controlledWallets);

      const walletToAdd = await SessionStorage.get('walletToAdd');
      if (walletToAdd) {
        setCreateWalletAddress(walletToAdd);
        SessionStorage.remove('walletToAdd');
      }
    };
    fetchWallets();
  }, []);

  const [createWalletAddress, setCreateWalletAddress] = useState<Address>();

  const handleCreateWallet = useCallback(async () => {
    const newWalletAccount = await create();
    const wallet = {
      accounts: [newWalletAccount],
      imported: false,
      type: KeychainType.HdKeychain,
    };
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
      {
        state: {
          wallet,
          showQuiz: true,
          fromChooseGroup: true,
        },
      },
    );
  }, [navigate]);

  const handleCreateWalletOnGroup = useCallback(
    async (index: number) => {
      const wallet = wallets[index];
      const sibling = wallet.accounts[0];
      const address = await add(sibling);
      setCreateWalletAddress(address);
      if (goHomeOnWalletCreation) {
        setFromChooseGroup(true);
      }
    },
    [wallets, goHomeOnWalletCreation],
  );

  const handleGroupShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (createWalletAddress) return;
      const key = e.key;
      if (key === 'n' || key === 'N') {
        trackShortcut({
          key: 'N',
          type: 'chooseWallet.create',
        });
        handleCreateWallet();
        return;
      }
      const number = Number(key);
      if (number <= wallets.length) {
        trackShortcut({
          key,
          type: 'chooseWallet.select',
        });
        handleCreateWalletOnGroup(Number(key) - 1);
      }
    },
    [
      createWalletAddress,
      handleCreateWallet,
      handleCreateWalletOnGroup,
      trackShortcut,
      wallets.length,
    ],
  );

  useKeyboardShortcut({
    handler: handleGroupShortcuts,
  });

  const onClose = () => {
    setCreateWalletAddress(undefined);
    setFromChooseGroup(false);
  };

  const handleCancel = async () => {
    if (createWalletAddress !== undefined) {
      await remove(createWalletAddress);
    }
    setCreateWalletAddress(undefined);
    setFromChooseGroup(false);
  };

  return (
    <Box height="full">
      <CreateWalletPrompt
        onCancel={handleCancel}
        show={!!createWalletAddress}
        onClose={onClose}
        address={createWalletAddress}
        fromChooseGroup={fromChooseGroup}
      />
      <Box paddingHorizontal="20px" height="full">
        <Stack space="24px" alignHorizontal="center">
          <Box paddingHorizontal="28px">
            <Stack space="8px">
              <Text size="16pt" color="label" align="center" weight="bold">
                {i18n.t('choose_wallet_group.title')}
              </Text>
              <Text
                size="12pt"
                color="labelTertiary"
                align="center"
                weight="regular"
              >
                {i18n.t('choose_wallet_group.description')}
              </Text>
            </Stack>
          </Box>
          <Box style={{ width: '106px' }}>
            <Separator color="separatorTertiary" strokeWeight="1px" />
          </Box>
          <Box
            width="full"
            style={{
              overflow: 'auto',
              height: '420px',
            }}
          >
            <Box
              background="surfaceSecondaryElevated"
              borderRadius="28px"
              boxShadow="12px surfaceSecondaryElevated"
              padding="20px"
            >
              <WalletGroups
                onCreateNewWallet={handleCreateWallet}
                onCreateNewWalletOnGroup={handleCreateWalletOnGroup}
                wallets={wallets}
              />
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export { ChooseWalletGroup };
