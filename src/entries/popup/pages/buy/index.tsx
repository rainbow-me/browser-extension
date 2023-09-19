import { useCallback, useMemo } from 'react';

import { fetchProviderWidgetUrl, useProvidersList } from '~/core/resources/f2c';
import { ProviderConfig } from '~/core/resources/f2c/types';
import { useCurrentAddressStore } from '~/core/state/currentSettings/currentAddress';
import { Box, Stack } from '~/design-system';

import { ProviderCard } from '../../components/Buy/ProviderCard';
import { CoinbaseIcon } from '../../components/CoinbaseIcon/CoinbaseIcon';
import { MoonpayIcon } from '../../components/MoonpayIcon/MoonpayIcon';
import { RampIcon } from '../../components/RampIcon/RampIcon';

export function Buy() {
  const { currentAddress: depositAddress } = useCurrentAddressStore();
  const { data } = useProvidersList();
  const providers = useMemo(
    () => data?.filter((provider) => provider.enabled === true),
    [data],
  );

  const handleProvider = useCallback(
    async (provider: ProviderConfig) => {
      const { data } = await fetchProviderWidgetUrl({
        provider: provider.id,
        depositAddress,
      });
      window.open(data.url, '_blank');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [providers, depositAddress],
  );

  return (
    <Box>
      <Box paddingHorizontal="20px">
        <Stack space="16px">
          {providers?.map((provider, idx) => {
            return (
              <ProviderCard
                logo={
                  {
                    moonpay: <MoonpayIcon height={18} width={18} />,
                    ramp: <RampIcon height={15} width={15} />,
                    coinbase: <CoinbaseIcon height={20} width={20} />,
                  }[provider.id]
                }
                key={idx}
                onClick={() => handleProvider(provider)}
                provider={provider}
                testId={`provider-${provider.id}`}
              />
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}
