import React, { ReactNode, useCallback } from 'react';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { getBlockExplorerHostForChain } from '~/core/utils/chains';
import { getExplorerUrl, goToNewTab } from '~/core/utils/tabs';
import { Bleed, Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';

export const SwapViewContractDropdown = ({
  address,
  chainId,
  children,
  testId,
}: {
  address?: Address;
  chainId?: ChainId;
  children: ReactNode;
  testId: string;
}) => {
  const explorer = getBlockExplorerHostForChain(chainId || ChainId.mainnet);
  const viewOnEtherscan = useCallback(() => {
    explorer &&
      goToNewTab({
        url: getExplorerUrl(explorer, address),
        active: false,
      });
  }, [explorer, address]);

  const onValueChange = useCallback(
    (value: string) => {
      switch (value) {
        case 'copy':
          navigator.clipboard.writeText(address as string);
          break;
        case 'view':
          viewOnEtherscan();
          break;
      }
    },
    [address, viewOnEtherscan],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Box
          testId={`${testId}-swap-view-contract-dropdown`}
          position="relative"
        >
          <ButtonOverflow>{children}</ButtonOverflow>
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent marginRight="12px">
        <DropdownMenuRadioGroup onValueChange={onValueChange}>
          <Stack space="4px">
            {explorer && (
              <DropdownMenuRadioItem value={'view'}>
                <Box
                  testId={`${testId}-view-swap-view-contract-dropdown`}
                  width="full"
                  paddingVertical="2px"
                >
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Inline alignVertical="center" space="8px">
                      <Inline alignVertical="center">
                        <Symbol
                          size={18}
                          symbol="binoculars.fill"
                          weight="semibold"
                        />
                      </Inline>
                      <Text size="14pt" weight="semibold">
                        {i18n.t(
                          `contacts.${
                            chainId && explorer !== 'etherscan'
                              ? 'view_on_explorer'
                              : 'view_on_etherscan'
                          }`,
                        )}
                      </Text>
                    </Inline>
                    <Bleed vertical="8px">
                      <Symbol
                        size={14}
                        symbol="arrow.up.forward.circle"
                        weight="semibold"
                        color="labelTertiary"
                      />
                    </Bleed>
                  </Inline>
                </Box>
              </DropdownMenuRadioItem>
            )}
            <DropdownMenuRadioItem value={'copy'}>
              <Box
                testId={`${testId}-copy-swap-view-contract-dropdown`}
                width="full"
                marginVertical="-1px"
              >
                <Inline space="8px" alignVertical="center">
                  <Box>
                    <Inline alignVertical="center">
                      <Symbol
                        symbol="doc.on.doc.fill"
                        weight="semibold"
                        size={18}
                      />
                    </Inline>
                  </Box>

                  <Box>
                    <Stack space="6px">
                      <Text weight="semibold" size="14pt" color="label">
                        {i18n.t('contacts.copy_address')}
                      </Text>
                      <Text weight="regular" size="11pt" color="labelTertiary">
                        {truncateAddress(address)}
                      </Text>
                    </Stack>
                  </Box>
                </Inline>
              </Box>
            </DropdownMenuRadioItem>
          </Stack>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
