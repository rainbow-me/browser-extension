import { Approval, useApprovals } from '~/core/resources/approvals/approvals';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import {
  Bleed,
  Box,
  ButtonSymbol,
  Column,
  Columns,
  Inline,
  Inset,
  Stack,
  TextOverflow,
} from '~/design-system';
import { Row, Rows } from '~/design-system/components/Rows/Rows';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { CoinIcon } from '../../components/CoinIcon/CoinIcon';

export const Approvals = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();

  const { data: approvalsData } = useApprovals({
    address: currentAddress,
    chainIds: [ChainId.mainnet],
    currency: currentCurrency,
  });

  const approvals = approvalsData?.payload || [];

  return (
    <Box>
      <Box
        style={{
          overflow: 'scroll',
          height: 489,
        }}
      >
        <Stack space="16px">
          <Rows alignVertical="top">
            {approvals?.map((approval, i) => (
              <Row height="content" key={i}>
                <TokenApproval approval={approval} />
              </Row>
            ))}
          </Rows>
        </Stack>
      </Box>
    </Box>
  );
};

const TokenApproval = ({ approval }: { approval: Approval }) => {
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
                    <CoinIcon asset={approval.asset} />
                    <Box
                      style={{
                        marginLeft: '-7px',
                        marginTop: '-10.5px',
                      }}
                    >
                      <Box
                        style={{
                          height: 14,
                          width: 14,
                          borderRadius: 7,
                        }}
                      >
                        <Inline
                          alignHorizontal="center"
                          alignVertical="center"
                          height="full"
                        >
                          <Bleed top="7px">
                            <ChainBadge chainId={approval.chain_id} size="14" />
                          </Bleed>
                        </Inline>
                      </Box>
                    </Box>
                  </Column>

                  <Column>
                    <Box>
                      <Stack space="8px">
                        <Box style={{ wordBreak: 'break-all' }}>
                          <TextOverflow
                            align="left"
                            size="14pt"
                            weight="semibold"
                            color="label"
                          >
                            {approval?.asset?.name}
                          </TextOverflow>
                        </Box>
                        <Inline space="4px" alignVertical="center">
                          <Box
                            background="fill"
                            borderRadius="30px"
                            style={{
                              width: '16px',
                              height: '16px',
                              overflow: 'hidden',
                            }}
                          >
                            <TextOverflow
                              align="left"
                              size="14pt"
                              weight="semibold"
                              color="label"
                            >
                              {approval?.spenders?.[0]?.contract_name}
                            </TextOverflow>
                          </Box>
                        </Inline>
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
                //   onClick={disconnectAppSession}
              />
            </Box>
          </Column>
        </Columns>
      </Box>
    </Box>
  );
};
