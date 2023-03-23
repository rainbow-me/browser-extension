import React, { useCallback, useMemo, useState } from 'react';

import { upperFirst } from '~/core/utils/strings';
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
                  <ExternalImage
                    style={{ borderRadius: '20px' }}
                    src={protocol.icon}
                    width="20"
                    height="20"
                  />
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
  const protocolPart = `${protocol?.part}%`;

  return (
    <Inline space="5px" alignVertical="center">
      {protocol.icon && (
        <ExternalImage
          style={{ borderRadius: '20px' }}
          src={protocol.icon}
          width="20"
          height="20"
        />
      )}
      <Text color="label" size="14pt" weight="semibold">
        {upperFirst(protocolName)}
      </Text>
      <Box background="fillSecondary" borderRadius="round" padding="4px">
        <Text color="labelSecondary" size="12pt" weight="semibold">
          {routeWithBridge ? protocolType : protocolPart}
        </Text>
      </Box>
    </Inline>
  );
};

export const SwapRoutes = ({ protocols }: SwapRoutesProps) => {
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

  return (
    <ButtonOverflow>
      <Box onClick={goToNextComponent}>{components[currentComponentIndex]}</Box>
    </ButtonOverflow>
  );
};
