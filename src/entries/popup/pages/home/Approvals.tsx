import { Chain } from 'wagmi';

import { SUPPORTED_MAINNET_CHAINS } from '~/core/references';
import {
  Approval,
  ApprovalSpender,
  useApprovals,
} from '~/core/resources/approvals/approvals';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useUserChainsStore } from '~/core/state/userChains';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Stack,
  TextOverflow,
} from '~/design-system';
import { Row, Rows } from '~/design-system/components/Rows/Rows';

import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import { useRainbowChains } from '../../hooks/useRainbowChains';

export const Approvals = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { rainbowChains } = useRainbowChains();
  const { userChains } = useUserChainsStore();

  const supportedMainnetIds = SUPPORTED_MAINNET_CHAINS.map((c: Chain) => c.id);

  const chainIds = rainbowChains
    .filter((c) => supportedMainnetIds.includes(c.id) && userChains[c.id])
    .map((c) => c.id);

  const { data: approvalsData } = useApprovals({
    address: currentAddress,
    chainIds: chainIds,
    currency: currentCurrency,
  });

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
        <Stack space="16px">
          <Rows alignVertical="top">
            {tokenApprovals?.map((tokenApproval, i) => (
              <Row height="content" key={i}>
                <TokenApproval
                  approval={tokenApproval.approval}
                  spender={tokenApproval.spender}
                />
              </Row>
            ))}
          </Rows>
        </Stack>
      </Box>
    </Box>
  );
};

const TokenApproval = ({
  approval,
  spender,
}: {
  approval: Approval;
  spender: ApprovalSpender;
}) => {
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
                    <CoinIcon asset={approval.asset} badge />
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
        </Columns>
      </Box>
    </Box>
  );
};
