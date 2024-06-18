import clsx from 'clsx';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { Address, Chain } from 'viem';

import { i18n } from '~/core/languages';
import { SUPPORTED_MAINNET_CHAINS } from '~/core/references/chains';
import { shortcuts } from '~/core/references/shortcuts';
import {
  Approval,
  ApprovalSpender,
  useApprovals,
} from '~/core/resources/approvals/approvals';
import { useConsolidatedTransactions } from '~/core/resources/transactions/consolidatedTransactions';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction, TxHash } from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { parseUserAsset } from '~/core/utils/assets';
import { getBlockExplorerHostForChain } from '~/core/utils/chains';
import { copy } from '~/core/utils/copy';
import { convertRawAmountToDecimalFormat } from '~/core/utils/numbers';
import { getTxExplorerUrl } from '~/core/utils/tabs';
import { getBlockExplorerName } from '~/core/utils/transactions';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Inset,
  Separator,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { Row, Rows } from '~/design-system/components/Rows/Rows';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '~/entries/popup/components/ContextMenu/ContextMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { HomeMenuRow } from '~/entries/popup/components/HomeMenuRow/HomeMenuRow';
import { ShortcutHint } from '~/entries/popup/components/ShortcutHint/ShortcutHint';
import { Spinner } from '~/entries/popup/components/Spinner/Spinner';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';
import { useUserChains } from '~/entries/popup/hooks/useUserChains';
import { simulateContextClick } from '~/entries/popup/utils/simulateClick';

import { CoinIcon } from '../../../components/CoinIcon/CoinIcon';
import { gradientBorderDark, gradientBorderLight } from '../NFTs/NFTs.css';

import { childAStyle, childBStyle } from './Approvals.css';
import { RevokeApprovalSheet } from './RevokeApprovalSheet';

type Tab = 'tokens' | 'nfts';
type SortType = 'recent' | 'alphabetical';

const SortDropdown = ({
  sort,
  setSort,
}: {
  sort: SortType;
  setSort: (sortType: SortType) => void;
}) => {
  const onValueChange = useCallback(
    (value: SortType) => {
      setSort(value);
    },
    [setSort],
  );
  const { currentTheme } = useCurrentThemeStore();
  const [open, setIsOpen] = useState(false);

  useKeyboardShortcut({
    condition: () => open,
    handler: (e) => {
      e.stopImmediatePropagation();
      if (e.key === shortcuts.nfts.SORT_RECENT.key) {
        onValueChange('recent');
        setIsOpen(false);
      } else if (e.key === shortcuts.nfts.SORT_ABC.key) {
        onValueChange('alphabetical');
        setIsOpen(false);
      }
    },
  });

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(openChange) => !openChange && setIsOpen(false)}
    >
      <DropdownMenuTrigger asChild>
        <Box onClick={() => setIsOpen(true)}>
          <Lens
            className={
              currentTheme === 'dark' ? gradientBorderDark : gradientBorderLight
            }
            style={{ display: 'flex', alignItems: 'center' }}
            testId={'nfts-sort-dropdown'}
          >
            <Box style={{ paddingRight: 7, paddingLeft: 7 }}>
              <Inline alignVertical="center" space="6px">
                <Symbol
                  symbol={sort === 'recent' ? 'clock' : 'list.bullet'}
                  weight="bold"
                  size={13}
                  color="labelSecondary"
                />
                <Text weight="bold" size="14pt" color="label">
                  {sort === 'recent'
                    ? i18n.t('nfts.sort_option_recent')
                    : i18n.t('nfts.sort_option_abc')}
                </Text>
                <Symbol
                  symbol="chevron.down"
                  weight="bold"
                  size={10}
                  color="labelTertiary"
                />
              </Inline>
            </Box>
          </Lens>
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent marginRight="16px" marginTop="6px">
        <DropdownMenuRadioGroup
          onValueChange={(value) => onValueChange(value as typeof sort)}
        >
          <Stack space="4px">
            <Stack>
              <DropdownMenuRadioItem highlightAccentColor value="recent">
                <HomeMenuRow
                  leftComponent={
                    <Symbol size={12} symbol="clock" weight="semibold" />
                  }
                  centerComponent={
                    <Text size="14pt" weight="semibold">
                      {i18n.t('nfts.sort_option_recent_long')}
                    </Text>
                  }
                  rightComponent={
                    <ShortcutHint hint={shortcuts.nfts.SORT_RECENT.display} />
                  }
                />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem highlightAccentColor value="alphabetical">
                <HomeMenuRow
                  leftComponent={
                    <Symbol size={12} symbol="list.bullet" weight="semibold" />
                  }
                  centerComponent={
                    <Text size="14pt" weight="semibold">
                      {i18n.t('nfts.sort_option_abc_long')}
                    </Text>
                  }
                  rightComponent={
                    <ShortcutHint hint={shortcuts.nfts.SORT_ABC.display} />
                  }
                />
              </DropdownMenuRadioItem>
            </Stack>
          </Stack>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function ApprovalHeader({
  sort,
  activeTab,
  setSort,
  onSelectTab,
}: {
  sort: SortType;
  activeTab: Tab;
  setSort: (sortType: SortType) => void;
  onSelectTab: (tab: Tab) => void;
}) {
  return (
    <Box
      background="surfacePrimaryElevatedSecondary"
      borderBottomWidth="1px"
      borderColor="separatorTertiary"
    >
      <Inset top="8px">
        <Box
          display="flex"
          justifyContent="space-between"
          paddingHorizontal="20px"
          width="full"
          alignItems="center"
        >
          <Inline alignVertical="bottom" space="16px">
            <Lens borderRadius="2px" onKeyDown={() => onSelectTab?.('tokens')}>
              <Box onClick={() => onSelectTab?.('tokens')}>
                <Stack space="9px">
                  <Box paddingVertical="4px">
                    <Inline space="5px" alignVertical="center">
                      <Symbol
                        symbol="circlebadge.2.fill"
                        weight="regular"
                        size={12}
                        color={
                          activeTab === 'tokens' ? 'label' : 'labelTertiary'
                        }
                      />
                      <Text
                        size="16pt"
                        weight="heavy"
                        color={
                          activeTab === 'tokens' ? 'label' : 'labelTertiary'
                        }
                      >
                        {i18n.t(`tabs.tokens`)}
                      </Text>
                    </Inline>
                  </Box>

                  <Box
                    style={{
                      borderRadius: '3px 3px 0 0',
                      width: '100%',
                      height: '1px',
                    }}
                    background={activeTab === 'tokens' ? 'accent' : undefined}
                  />
                </Stack>
              </Box>
            </Lens>

            <Lens borderRadius="2px" onKeyDown={() => onSelectTab?.('nfts')}>
              <Box onClick={() => onSelectTab?.('nfts')}>
                <Stack space="9px">
                  <Box paddingVertical="4px">
                    <Inline space="5px" alignVertical="center">
                      <Symbol
                        symbol="square.grid.2x2.fill"
                        weight="regular"
                        size={12}
                        color={activeTab === 'nfts' ? 'label' : 'labelTertiary'}
                      />
                      <Text
                        size="16pt"
                        weight="heavy"
                        color={activeTab === 'nfts' ? 'label' : 'labelTertiary'}
                      >
                        {i18n.t(`tabs.nfts`)}
                      </Text>
                    </Inline>
                  </Box>
                  <Box
                    style={{
                      borderRadius: '3px 3px 0 0',
                      width: '100%',
                      height: '1px',
                    }}
                    background={activeTab === 'nfts' ? 'accent' : undefined}
                  />
                </Stack>
              </Box>
            </Lens>
          </Inline>

          <Box marginTop="-8px">
            <SortDropdown sort={sort} setSort={setSort} />
          </Box>
        </Box>
      </Inset>
    </Box>
  );
}

const NothingFound = () => {
  return (
    <Box alignItems="center" paddingBottom="20px" style={{ paddingTop: 120 }}>
      <Box paddingHorizontal="44px">
        <Stack space="16px">
          <Text color="label" size="26pt" weight="bold" align="center">
            {'👻'}
          </Text>

          <Text
            color="labelTertiary"
            size="20pt"
            weight="semibold"
            align="center"
          >
            {i18n.t('approvals.nothing_found')}
          </Text>
        </Stack>
      </Box>
    </Box>
  );
};

const sortApprovals = (
  sort: SortType,
  a1: { approval: Approval; spender: ApprovalSpender },
  a2: { approval: Approval; spender: ApprovalSpender },
) => {
  if (sort === 'recent') {
    return new Date(a1.spender.tx_time) < new Date(a2.spender.tx_time) ? 1 : -1;
  }
  return a1.approval?.asset.symbol?.toLowerCase() <
    a2.approval?.asset.symbol?.toLowerCase()
    ? -1
    : 1;
};

export const Approvals = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { chains } = useUserChains();
  const [showRevokeSheet, setShowRevokeSheet] = useState(false);
  const [revokeApproval, setRevokeApproval] = useState<{
    approval: Approval | null;
    spender: ApprovalSpender | null;
  }>({ approval: null, spender: null });
  const supportedMainnetIds = SUPPORTED_MAINNET_CHAINS.map((c: Chain) => c.id);
  const [sort, setSort] = useState<SortType>('recent');
  const [activeTab, setActiveTab] = useState<Tab>('tokens');

  const { data } = useConsolidatedTransactions({
    address: currentAddress,
    currency: currentCurrency,
    userChainIds: supportedMainnetIds,
  });

  const revokeTransactions = useMemo(
    () =>
      data?.pages
        ?.map((p) => p.transactions)
        .flat()
        .filter(
          (tx) =>
            tx.type === 'revoke' &&
            (activeTab === 'nfts'
              ? tx.asset?.type === 'nft'
              : tx.asset?.type !== 'nft'),
        ),
    [activeTab, data?.pages],
  );

  const { data: approvals, isLoading } = useApprovals(
    {
      address: currentAddress,
      chainIds: chains.map((c) => c.id),
      currency: currentCurrency,
    },
    {
      select(data) {
        if (data) {
          const newApprovals = data.filter((approval) =>
            activeTab === 'nfts'
              ? approval.asset.type === 'nft'
              : approval.asset.type !== 'nft',
          );
          return newApprovals;
        }
        return null;
      },
    },
  );

  const tokenApprovals = approvals
    ?.map((approval) =>
      approval.spenders.map((spender) => ({
        approval,
        spender,
      })),
    )
    .flat()
    .sort((a1, a2) => sortApprovals(sort, a1, a2));

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <Box
          width="fit"
          alignItems="center"
          justifyContent="center"
          style={{ margin: 'auto', paddingTop: 120 }}
        >
          <Spinner size={30} color="accent" />
        </Box>
      );
    }
    if (!approvals?.length) {
      return <NothingFound />;
    }
    return (
      <Stack space="16px">
        <Inset top="8px">
          <Rows alignVertical="top">
            {tokenApprovals?.map((tokenApproval, i) => (
              <Row height="content" key={i}>
                <TokenApproval
                  approval={tokenApproval.approval}
                  spender={tokenApproval.spender}
                  onRevoke={() => {
                    setRevokeApproval(tokenApproval);
                    setShowRevokeSheet(true);
                  }}
                />
              </Row>
            ))}
          </Rows>
        </Inset>
        {revokeTransactions?.length ? (
          <Inset bottom="8px">
            <Stack space="8px">
              <Box paddingHorizontal="20px">
                <Text color="labelTertiary" size="14pt" weight="semibold">
                  {i18n.t('approvals.revoked_approvals')}
                </Text>
              </Box>
              <Rows alignVertical="top">
                {revokeTransactions?.map((revokeTransaction, i) => (
                  <Row height="content" key={i}>
                    <TokenRevoke transaction={revokeTransaction} />
                  </Row>
                ))}
              </Rows>
            </Stack>
          </Inset>
        ) : null}
      </Stack>
    );
  }, [approvals?.length, isLoading, revokeTransactions, tokenApprovals]);

  return (
    <Box>
      <Box
        style={{
          overflow: 'scroll',
        }}
      >
        <ApprovalHeader
          sort={sort}
          activeTab={activeTab}
          setSort={setSort}
          onSelectTab={setActiveTab}
        />
        {content}
      </Box>
      <RevokeApprovalSheet
        show={showRevokeSheet}
        approval={revokeApproval.approval}
        spender={revokeApproval.spender}
        onCancel={() => setShowRevokeSheet(false)}
        onRevoke={() => setShowRevokeSheet(false)}
      />
    </Box>
  );
};

const getMenuComponents = ({ type }: { type: 'dropdown' | 'context' }) => {
  if (type === 'dropdown') {
    return {
      Menu: DropdownMenu,
      MenuContent: DropdownMenuContent,
      MenuRadioGroup: DropdownMenuRadioGroup,
      MenuRadioItem: DropdownMenuRadioItem,
      MenuTrigger: DropdownMenuTrigger,
      MenuItem: DropdownMenuItem,
    };
  }
  return {
    Menu: ContextMenu,
    MenuContent: ContextMenuContent,
    MenuRadioGroup: ContextMenuContent,
    MenuRadioItem: ContextMenuContent,
    MenuTrigger: ContextMenuTrigger,
    MenuItem: ContextMenuItem,
  };
};

export const TokenApprovalContextMenu = ({
  chainId = ChainId.mainnet,
  txHash,
  contractAddress,
  children,
  type = 'context',
  onTrigger,
  onRevokeApproval,
}: {
  chainId?: ChainId;
  txHash?: TxHash;
  contractAddress?: Address;
  children: ReactNode;
  type?: 'dropdown' | 'context';
  onRevokeApproval?: () => void;
  onTrigger?: () => void;
}) => {
  const copySpenderRef = useRef<HTMLDivElement>(null);
  const viewOnExplorerRef = useRef<HTMLDivElement>(null);
  const revokeRef = useRef<HTMLDivElement>(null);

  const explorerHost = getBlockExplorerName(chainId);
  const explorer =
    getBlockExplorerHostForChain(chainId || ChainId.mainnet) || '';
  const explorerUrl = getTxExplorerUrl(explorer, txHash);

  const [tokenContextMenuOpen, setTokenContextMenuOpen] = useState(false);
  useKeyboardShortcut({
    condition: () => tokenContextMenuOpen,
    handler: (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key === shortcuts.activity.COPY_TRANSACTION.key) {
        copySpenderRef.current?.click();
      }
      if (e.key === shortcuts.activity.VIEW_TRANSACTION.key) {
        viewOnExplorerRef.current?.click();
      }
      if (e.key === shortcuts.activity.REFRESH_TRANSACTIONS.key) {
        revokeRef.current?.click();
      }
    },
  });

  const { Menu, MenuContent, MenuTrigger, MenuItem } = getMenuComponents({
    type,
  });

  return (
    <Menu onOpenChange={setTokenContextMenuOpen}>
      <MenuTrigger asChild onTrigger={onTrigger}>
        {children}
      </MenuTrigger>
      <MenuContent marginRight={type === 'dropdown' ? '32px' : undefined}>
        <MenuItem
          symbolLeft="doc.on.doc.fill"
          shortcut={shortcuts.activity.COPY_TRANSACTION.display}
          onSelect={() =>
            copy({
              value: contractAddress || '',
              title: i18n.t('approvals.spender_address_copied'),
              description: truncateAddress(contractAddress),
            })
          }
        >
          <Box ref={copySpenderRef}>
            <Stack space="8px">
              <Text size="14pt" weight="semibold">
                {i18n.t('approvals.copy_spender')}
              </Text>
              <TextOverflow size="11pt" color="labelTertiary" weight="medium">
                {truncateAddress(contractAddress)}
              </TextOverflow>
            </Stack>
          </Box>
        </MenuItem>
        {explorerUrl && (
          <>
            <MenuItem
              symbolLeft="binoculars.fill"
              onSelect={() => window.open(explorerUrl, '_blank')}
              shortcut={shortcuts.activity.VIEW_TRANSACTION.display}
            >
              <Box ref={viewOnExplorerRef}>
                <Text size="14pt" weight="semibold">
                  {i18n.t('token_details.view_on', { explorer: explorerHost })}
                </Text>
              </Box>
            </MenuItem>
            {onRevokeApproval ? (
              <>
                <Box paddingVertical="4px">
                  <Separator color="separatorSecondary" />
                </Box>
                <MenuItem
                  color="red"
                  symbolLeft="xmark.circle.fill"
                  onSelect={onRevokeApproval}
                  shortcut={shortcuts.activity.REFRESH_TRANSACTIONS.display}
                >
                  <Box ref={revokeRef}>
                    <Text size="14pt" weight="semibold" color="red">
                      {i18n.t('approvals.revoke_approval')}
                    </Text>
                  </Box>
                </MenuItem>
              </>
            ) : null}
          </>
        )}
      </MenuContent>
    </Menu>
  );
};

const TokenApproval = ({
  approval,
  spender,
  onRevoke,
}: {
  approval: Approval;
  spender: ApprovalSpender;
  onRevoke: () => void;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <TokenApprovalContextMenu
      chainId={approval.chain_id}
      txHash={spender.tx_hash}
      contractAddress={spender.contract_address}
      onRevokeApproval={onRevoke}
    >
      <Box paddingHorizontal="8px">
        <Lens
          borderRadius="12px"
          onKeyDown={() => simulateContextClick(triggerRef?.current)}
        >
          <Box
            ref={triggerRef}
            className={'approval-row'}
            background={{
              default: 'transparent',
              hover: 'surfacePrimaryElevatedSecondary',
            }}
            borderRadius="12px"
          >
            <Inset horizontal="12px" vertical="8px">
              <Columns alignVertical="center" space="4px">
                <Column>
                  <Columns space="8px" alignVertical="center">
                    <Column width="content">
                      <CoinIcon
                        asset={parseUserAsset({
                          asset: approval.asset,
                          currency: currentCurrency,
                          balance: '0',
                        })}
                        badge
                      />
                    </Column>
                    <Column>
                      <Stack space="8px">
                        <TextOverflow
                          align="left"
                          size="14pt"
                          weight="semibold"
                          color="label"
                        >
                          {approval?.asset?.name}
                        </TextOverflow>

                        <TextOverflow
                          align="left"
                          size="12pt"
                          weight="semibold"
                          color="label"
                        >
                          {`${
                            spender.contract_name
                              ? `${spender.contract_name} • `
                              : ''
                          } ${truncateAddress(spender.contract_address)}`}
                        </TextOverflow>
                      </Stack>
                    </Column>
                  </Columns>
                </Column>
                <Column width="content">
                  <Box>
                    <Box className={clsx(childAStyle)}>
                      <Button
                        color="red"
                        height="28px"
                        variant="plain"
                        borderRadius="8px"
                        onClick={onRevoke}
                      >
                        <Text size="14pt" weight="bold" color="label">
                          {i18n.t('approvals.revoke.action')}
                        </Text>
                      </Button>
                    </Box>

                    <Box
                      className={clsx(childBStyle)}
                      paddingVertical="5px"
                      paddingHorizontal="6px"
                      borderRadius="6px"
                      borderDashedWidth="1px"
                      borderColor="separatorSecondary"
                    >
                      <TextOverflow
                        align="center"
                        size="11pt"
                        weight="semibold"
                        color="labelTertiary"
                      >
                        {spender?.quantity_allowed.toLowerCase() === 'unlimited'
                          ? spender?.quantity_allowed
                          : `${convertRawAmountToDecimalFormat(
                              spender?.quantity_allowed || '0',
                              approval?.asset.decimals,
                            )} ${approval?.asset.symbol}`}
                      </TextOverflow>
                    </Box>
                  </Box>
                </Column>
              </Columns>
            </Inset>
          </Box>
        </Lens>
      </Box>
    </TokenApprovalContextMenu>
  );
};

const TokenRevoke = ({ transaction }: { transaction?: RainbowTransaction }) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  return (
    <TokenApprovalContextMenu
      chainId={transaction?.chainId}
      txHash={transaction?.hash}
      contractAddress={transaction?.to}
    >
      <Box paddingHorizontal="8px">
        <Lens
          borderRadius="12px"
          onKeyDown={() => simulateContextClick(triggerRef?.current)}
        >
          <Box
            ref={triggerRef}
            background={{
              default: 'transparent',
              hover: 'surfacePrimaryElevatedSecondary',
            }}
            borderRadius="12px"
          >
            <Inset horizontal="12px" vertical="8px">
              <Columns alignVertical="center" space="4px">
                <Column>
                  <Columns space="8px" alignVertical="center">
                    <Column width="content">
                      <CoinIcon asset={transaction?.asset} badge />
                    </Column>
                    <Column>
                      <Stack space="8px">
                        <TextOverflow
                          align="left"
                          size="14pt"
                          weight="semibold"
                          color="label"
                        >
                          {transaction?.asset?.name}
                        </TextOverflow>

                        <TextOverflow
                          align="left"
                          size="12pt"
                          weight="semibold"
                          color="label"
                        >
                          {truncateAddress(transaction?.to)}
                        </TextOverflow>
                      </Stack>
                    </Column>
                  </Columns>
                </Column>
                <Column width="content">
                  <Box
                    paddingVertical="5px"
                    paddingHorizontal="6px"
                    borderRadius="6px"
                    borderDashedWidth="1px"
                    borderColor="separatorSecondary"
                  >
                    <TextOverflow
                      align="center"
                      size="11pt"
                      weight="semibold"
                      color="labelTertiary"
                    >
                      {i18n.t('approvals.unlimited')}
                    </TextOverflow>
                  </Box>
                </Column>
              </Columns>
            </Inset>
          </Box>
        </Lens>
      </Box>
    </TokenApprovalContextMenu>
  );
};
