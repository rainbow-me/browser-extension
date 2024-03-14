import { ReactElement, useCallback, useMemo, useState } from 'react';

import { formatNumber } from '~/core/utils/formatNumber';
import { capitalize } from '~/core/utils/strings';
import { Bleed, Box, Inline, Text } from '~/design-system';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { ChevronDown } from '~/entries/popup/components/ChevronDown/ChevronDown';
import ExternalImage from '~/entries/popup/components/ExternalImage/ExternalImage';

export type SwapRoutesProps = {
  protocols: {
    name: string;
    icon: string | null;
    isBridge: boolean;
    part?: number;
  }[];
  testId?: string;
};

const RoutePath = ({ protocols }: SwapRoutesProps) => {
  return (
    <Box>
      <Inline space="8px" alignVertical="center">
        <Inline space="5px" alignVertical="center">
          {protocols.map((protocol, i) => (
            <Box key={i}>
              {protocol.icon && (
                <Inline space="5px" alignVertical="center">
                  <Box
                    borderRadius="20px"
                    style={{ overflow: 'clip', height: '20px', width: '20px' }}
                  >
                    <ExternalImage
                      style={{ borderRadius: '20px' }}
                      src={protocol.icon}
                      width="20"
                      height="20"
                    />
                  </Box>
                  {i !== protocols.length - 1 && (
                    <Bleed horizontal="6px">
                      <Box style={{ rotate: '-90deg' }}>
                        <ChevronDown color="fill" />
                      </Box>
                    </Bleed>
                  )}
                </Inline>
              )}
            </Box>
          ))}
        </Inline>
        <Text color="label" size="14pt" weight="semibold">
          {`${protocols.length} ${protocols.length === 1 ? 'step' : 'steps'}`}
        </Text>
      </Inline>
    </Box>
  );
};

const RouteProtocol = ({
  protocol,
  routeWithBridge,
}: {
  protocol: {
    name: string;
    icon: string | null;
    isBridge: boolean;
    part?: number;
  };
  routeWithBridge: boolean;
}) => {
  const protocolName = protocol.name?.replace('_', ' ')?.toLowerCase();
  const protocolType = protocol.isBridge ? 'Bridge' : 'Swap';
  const protocolPart = `${formatNumber(protocol?.part || 100)}%`;

  return (
    <Inline space="5px" alignVertical="center">
      {protocol.icon && (
        <Box
          borderRadius="20px"
          style={{ overflow: 'clip', height: '20px', width: '20px' }}
        >
          <ExternalImage
            style={{ borderRadius: '20px' }}
            src={protocol.icon}
            width="20"
            height="20"
          />
        </Box>
      )}
      <Text color="label" size="14pt" weight="semibold">
        {capitalize(protocolName)}
      </Text>
      <Box
        background="fillSecondary"
        borderRadius="round"
        padding="4px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="labelSecondary" size="11pt" weight="semibold">
          {routeWithBridge ? protocolType : protocolPart}
        </Text>
      </Box>
    </Inline>
  );
};

const SwapRoutesWrapper = ({
  components,
  children,
}: {
  components: ReactElement[];
  children: ReactElement;
}) => {
  if (components.length === 1) {
    return children;
  }
  return <ButtonOverflow>{children}</ButtonOverflow>;
};

export const SwapRoutes = ({ protocols, testId }: SwapRoutesProps) => {
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);

  const routeWithBridge = useMemo(
    () => !!protocols.find((protocol) => protocol.isBridge),
    [protocols],
  );

  const components = (
    routeWithBridge ? [<RoutePath key={0} protocols={protocols} />] : []
  ).concat(
    protocols.map((protocol, i) => (
      <RouteProtocol
        key={i}
        protocol={protocol}
        routeWithBridge={routeWithBridge}
      />
    )),
  );

  const goToNextComponent = useCallback(() => {
    setCurrentComponentIndex((currentComponentIndex) =>
      currentComponentIndex + 1 < components.length
        ? currentComponentIndex + 1
        : 0,
    );
  }, [components.length]);

  if (components.length - 1 < currentComponentIndex) {
    setCurrentComponentIndex(components.length - 1);
  }

  return (
    <SwapRoutesWrapper components={components}>
      <Box testId={`${testId}-swap-routes`} onClick={goToNextComponent}>
        {components[currentComponentIndex]}
      </Box>
    </SwapRoutesWrapper>
  );
};
