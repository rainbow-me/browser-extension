import { useState } from 'react';
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
import { parseUserAsset } from '~/core/utils/assets';
import {
  Box,
  ButtonSymbol,
  Column,
  Columns,
  Inline,
  Inset,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { Row, Rows } from '~/design-system/components/Rows/Rows';

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
  return (
    <Box paddingHorizontal="8px">
      <Box
        background={{
          default: 'transparent',
          hover: 'surfacePrimaryElevatedSecondary',
        }}
        borderRadius="12px"
      >
        <Columns>
          <Column>
            <Inset horizontal="12px" vertical="8px">
              <Inline alignHorizontal="justify" alignVertical="center">
                <Columns space="8px">
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
                    <Box>
                      <Stack space="8px">
                        <Inline space="4px">
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
                            size="14pt"
                            weight="semibold"
                            color="label"
                          >
                            {'•'}
                          </TextOverflow>
                          <TextOverflow
                            align="left"
                            size="14pt"
                            weight="semibold"
                            color="label"
                          >
                            {spender.quantity_allowed}
                          </TextOverflow>
                        </Inline>

                        <TextOverflow
                          align="left"
                          size="14pt"
                          weight="regular"
                          color="label"
                        >
                          {spender.contract_name}
                        </TextOverflow>
                      </Stack>
                    </Box>
                  </Column>
                </Columns>
              </Inline>
            </Inset>
          </Column>
          <Column width="content">
            <Box paddingTop="12px" paddingRight="12px">
              <ButtonSymbol
                color="red"
                height="28px"
                variant="raised"
                symbol="xmark"
                borderRadius="8px"
                onClick={onRevoke}
              />
            </Box>
          </Column>
        </Columns>
      </Box>
    </Box>
  );
};
