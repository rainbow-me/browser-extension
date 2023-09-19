import { ReactElement, useState } from 'react';

import { i18n } from '~/core/languages';
import { CalloutType, ProviderConfig } from '~/core/resources/f2c/types';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { ChainId } from '~/core/types/chains';
import {
  AccentColorProvider,
  Bleed,
  Box,
  Inline,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';

import { ChainBadge } from '../ChainBadge/ChainBadge';

import { convertAPINetworkToChainId, getPaymentMethodConfigs } from './utils';

const ProviderCard = ({
  logo,
  onClick,
  provider,
  testId,
}: {
  logo: ReactElement;
  onClick: () => void;
  provider: ProviderConfig;
  testId: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <AccentColorProvider color={provider.metadata.accentColor}>
      <Lens
        background="surfaceSecondaryElevated"
        borderRadius="20px"
        boxShadow="12px"
        cursor="pointer"
        display="flex"
        onClick={onClick}
        style={{ overflow: 'hidden' }}
        testId={testId}
        width="full"
      >
        <Box
          background={{ default: 'transparent', hover: 'fillQuaternary' }}
          cursor="pointer"
          height="full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          paddingHorizontal="16px"
          paddingVertical="20px"
          width="full"
        >
          <Stack space="20px">
            <Stack space="12px">
              <Inline
                alignHorizontal="justify"
                alignVertical="center"
                wrap={false}
              >
                <Inline alignVertical="center" space="7px">
                  <Bleed vertical="5px">
                    <Box
                      alignItems="center"
                      background="accent"
                      borderRadius="round"
                      boxShadow="12px accent"
                      display="flex"
                      justifyContent="center"
                      style={{ height: 20, overflow: 'hidden', width: 20 }}
                    >
                      {logo}
                    </Box>
                  </Bleed>
                  <Text cursor="pointer" size="16pt" weight="heavy">
                    {provider.content.title}
                  </Text>
                </Inline>
                <Box
                  alignItems="center"
                  display="flex"
                  justifyContent="center"
                  opacity="0.75"
                  style={{ height: 12, width: 12 }}
                >
                  <Symbol
                    color={isHovered ? 'labelTertiary' : 'labelQuaternary'}
                    cursor="pointer"
                    size={12}
                    symbol="arrow.up.forward.circle"
                    weight="bold"
                  />
                </Box>
              </Inline>
              <Text
                color="labelQuaternary"
                cursor="pointer"
                size="14pt"
                weight="semibold"
              >
                {provider.content.description}
              </Text>
            </Stack>
            <MetadataRow provider={provider} isHovered={isHovered} />
          </Stack>
        </Box>
      </Lens>
    </AccentColorProvider>
  );
};

const MetadataRow = ({
  provider,
  isHovered,
}: {
  provider: ProviderConfig;
  isHovered: boolean;
}) => {
  return (
    <Box>
      <Inline space="16px">
        {provider.content.callouts.map((callout) => {
          let title = '';
          let content = null;

          switch (callout.type) {
            case CalloutType.Rate: {
              title = i18n.t('buy.fees_title');
              content = (
                <Text cursor="pointer" size="14pt" weight="bold">
                  {callout.value}
                </Text>
              );
              break;
            }
            case CalloutType.InstantAvailable: {
              title = i18n.t('buy.instant_title');
              content = (
                <Inline alignVertical="center" space="3px">
                  <Symbol
                    color="accent"
                    cursor="pointer"
                    size={12.5}
                    symbol="bolt"
                    weight="bold"
                  />
                  <Text cursor="pointer" size="14pt" weight="bold">
                    {callout.value || i18n.t('buy.instant_yes')}
                  </Text>
                </Inline>
              );
              break;
            }
            case CalloutType.PaymentMethods: {
              const methods = getPaymentMethodConfigs(callout.methods);
              const multipleMethods = methods.length > 1;
              title = multipleMethods
                ? i18n.t('buy.methods_title')
                : i18n.t('buy.method_title');
              content = (
                <Inline alignVertical="center" space="5px">
                  {methods.map((m) => {
                    return (
                      <Inline alignVertical="center" key={m.name} space="3px">
                        {m.symbol && m.symbolSize ? (
                          <Symbol
                            color="accent"
                            cursor="pointer"
                            size={m.symbolSize}
                            symbol={m.symbol}
                            weight="bold"
                          />
                        ) : (
                          <Text
                            align="center"
                            color="accent"
                            cursor="pointer"
                            size="16pt"
                            weight="heavy"
                          >
                            {m.textIcon}
                          </Text>
                        )}

                        {!multipleMethods && (
                          <Text cursor="pointer" size="14pt" weight="bold">
                            {m.name}
                          </Text>
                        )}
                      </Inline>
                    );
                  })}
                </Inline>
              );
              break;
            }
            case CalloutType.Networks: {
              title =
                callout.networks.length > 1
                  ? i18n.t('buy.networks_title')
                  : i18n.t('buy.network_title');
              content = (
                <NetworkIcons
                  chainIds={callout.networks
                    .map(convertAPINetworkToChainId)
                    .filter(Boolean)}
                  isHovered={isHovered}
                />
              );
            }
          }

          return (
            <Stack key={callout.type} space="10px">
              <Text
                color="labelSecondary"
                cursor="pointer"
                size="11pt"
                weight="bold"
              >
                {title}
              </Text>
              <Box alignItems="center" display="flex" style={{ height: 10 }}>
                {content}
              </Box>
            </Stack>
          );
        })}
      </Inline>
    </Box>
  );
};

function NetworkIcons({
  chainIds,
  isHovered,
}: {
  chainIds: ChainId[];
  isHovered: boolean;
}) {
  const { currentTheme } = useCurrentThemeStore();

  const BADGE_SIZE = 12;
  const BORDER_WIDTH = currentTheme === 'dark' ? 1.5 : 1;

  return (
    <Box alignItems="center" display="flex">
      {chainIds.map((chainId, index) => {
        return (
          <Box
            alignItems="center"
            background="surfaceSecondaryElevated"
            borderRadius="round"
            display="flex"
            justifyContent="center"
            key={`availableNetwork-${chainId}`}
            style={{
              height: BADGE_SIZE + BORDER_WIDTH * 2,
              marginLeft: index > 0 ? -5.5 : undefined,
              overflow: 'hidden',
              position: 'relative',
              width: BADGE_SIZE + BORDER_WIDTH * 2,
              zIndex: chainIds.length - index,
            }}
          >
            <Box
              background={isHovered ? 'fillQuaternary' : undefined}
              height="full"
              position="absolute"
              style={{ transition: '0.1s ease', zIndex: -1 }}
              width="full"
            />
            <ChainBadge chainId={chainId} size={BADGE_SIZE} />
          </Box>
        );
      })}
    </Box>
  );
}

export { ProviderCard };
