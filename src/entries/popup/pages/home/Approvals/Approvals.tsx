import { ReactNode, useState } from 'react';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { SUPPORTED_MAINNET_CHAINS } from '~/core/references';
import {
  Approval,
  ApprovalSpender,
  useApprovals,
} from '~/core/resources/approvals/approvals';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useUserChainsStore } from '~/core/state/userChains';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { parseUserAsset } from '~/core/utils/assets';
import { getBlockExplorerHostForChain } from '~/core/utils/chains';
import { copy } from '~/core/utils/copy';
import { convertRawAmountToDecimalFormat } from '~/core/utils/numbers';
import { getExplorerUrl } from '~/core/utils/tabs';
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
import { Row, Rows } from '~/design-system/components/Rows/Rows';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '~/entries/popup/components/ContextMenu/ContextMenu';

import { CoinIcon } from '../../../components/CoinIcon/CoinIcon';
import { useRainbowChains } from '../../../hooks/useRainbowChains';
import SortdDropdown from '../NFTs/SortDropdown';

import { RevokeApprovalSheet } from './RevokeApprovalSheet';

type Tab = 'tokens' | 'nfts';

function ApprovalHeader({
  activeTab,
  onSelectTab,
}: {
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
}) {
  return (
    <Inset bottom="20px" top="8px">
      <Box
        display="flex"
        justifyContent="space-between"
        paddingHorizontal="20px"
        style={{
          maxHeight: 11,
          textTransform: 'capitalize',
        }}
        width="full"
        alignItems="center"
      >
        <Inline alignVertical="bottom" space="16px">
          <Box onClick={() => onSelectTab?.('tokens')}>
            <Inline space="5px" alignVertical="center">
              <Symbol
                symbol="circlebadge.2.fill"
                weight="regular"
                size={12}
                color={activeTab === 'tokens' ? 'label' : 'labelTertiary'}
              />
              <Text
                size="16pt"
                weight="heavy"
                color={activeTab === 'tokens' ? 'label' : 'labelTertiary'}
              >
                {i18n.t(`tabs.tokens`)}
              </Text>
            </Inline>
          </Box>
          <Box onClick={() => onSelectTab?.('nfts')}>
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
        </Inline>

        <Inline alignVertical="center" space="8px">
          <SortdDropdown />
        </Inline>
      </Box>
    </Inset>
  );
}

export const Approvals = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { rainbowChains } = useRainbowChains();
  const { userChains } = useUserChainsStore();
  const [showRevokeSheet, setShowRevokeSheet] = useState(false);
  const [revokeApproval, setRevokeApproval] = useState<{
    approval: Approval | null;
    spender: ApprovalSpender | null;
  }>({ approval: null, spender: null });

  const [activeTab, setActiveTab] = useState<Tab>('tokens');
  const supportedMainnetIds = SUPPORTED_MAINNET_CHAINS.map((c: Chain) => c.id);

  const chainIds = rainbowChains
    .filter((c) => supportedMainnetIds.includes(c.id) && userChains[c.id])
    .map((c) => c.id);

  const { data: approvalsData } = useApprovals(
    {
      address: currentAddress,
      chainIds: chainIds,
      currency: currentCurrency,
    },
    {
      select(data) {
        if (data) {
          const newPayload = data.payload.filter((approval) =>
            activeTab === 'nfts'
              ? approval.asset.type === 'nft'
              : approval.asset.type !== 'nft',
          );
          return { meta: data?.meta, payload: newPayload };
        }
        return null;
      },
    },
  );

  const approvals = approvalsData?.payload || [];

  const tokenApprovals = approvals
    ?.map((approval) =>
      approval.spenders.map((spender) => ({
        approval,
        spender,
      })),
    )
    .flat();

  return (
    <Box>
      <Box
        style={{
          overflow: 'scroll',
        }}
      >
        <ApprovalHeader activeTab={activeTab} onSelectTab={setActiveTab} />
        <Stack space="16px">
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
        </Stack>
      </Box>
      <RevokeApprovalSheet
        show={showRevokeSheet}
        approval={revokeApproval.approval}
        spender={revokeApproval.spender}
        onCancel={() => setShowRevokeSheet(false)}
      />
    </Box>
  );
};

const TokenApprovalContextMenu = ({
  chainId,
  spender,
  children,
  onRevokeApproval,
}: {
  chainId: ChainId;
  spender: ApprovalSpender;
  children: ReactNode;
  onRevokeApproval: () => void;
}) => {
  const explorerHost = getBlockExplorerName(chainId);
  const explorer =
    getBlockExplorerHostForChain(chainId || ChainId.mainnet) || '';
  const explorerUrl = getExplorerUrl(explorer, spender.contract_address);
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          symbolLeft="doc.on.doc.fill"
          shortcut={'C'}
          onSelect={() =>
            copy({
              value: spender.contract_address,
              title: i18n.t('activity_details.hash_copied'),
              description: truncateAddress(spender.contract_address),
            })
          }
        >
          <Text size="14pt" weight="semibold">
            {'Copy Spender'}
          </Text>
          <TextOverflow size="11pt" color="labelTertiary" weight="medium">
            {truncateAddress(spender.contract_address)}
          </TextOverflow>
        </ContextMenuItem>
        {explorerUrl && (
          <>
            <ContextMenuItem
              symbolLeft="binoculars.fill"
              onSelect={() => window.open(explorerUrl, '_blank')}
              shortcut={'V'}
            >
              {i18n.t('token_details.view_on', { explorer: explorerHost })}
            </ContextMenuItem>
            <Box paddingVertical="4px">
              <Separator color="separatorSecondary" />
            </Box>
            <ContextMenuItem
              color="red"
              symbolLeft="xmark.circle.fill"
              onSelect={onRevokeApproval}
              shortcut={'R'}
            >
              {'Revoke Approval'}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
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
  const [revokeButtonVisible, setRevokeButtonVisible] = useState(false);

  const onMouseEnter = () => setRevokeButtonVisible(true);
  const onMouseLeave = () => setRevokeButtonVisible(false);

  const { currentCurrency } = useCurrentCurrencyStore();

  return (
    <TokenApprovalContextMenu
      chainId={approval.chain_id}
      spender={spender}
      onRevokeApproval={onRevoke}
    >
      <Box
        paddingHorizontal="8px"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Box
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
                {revokeButtonVisible ? (
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
                ) : (
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
                      {spender?.quantity_allowed.toLowerCase() === 'unlimited'
                        ? spender?.quantity_allowed
                        : `${convertRawAmountToDecimalFormat(
                            spender?.quantity_allowed || '0',
                            approval?.asset.decimals,
                          )} ${approval?.asset.symbol}`}
                    </TextOverflow>
                  </Box>
                )}
              </Column>
            </Columns>
          </Inset>
        </Box>
      </Box>
    </TokenApprovalContextMenu>
  );
};
